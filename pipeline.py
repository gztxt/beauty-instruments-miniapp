#!/usr/bin/env python3
"""
pipeline.py — 三模型联动自动化调度器（档位 B）

功能：
- Phase 1: Claude 出方案（本会话内实现 claude_plan）
- Phase 2: Codex 执行 + 验证左移 + Hermes 校验
- Phase 3: Hermes 生成测试 + 运行 + Claude 收口（含锚定上下文修正、反思熔断、缓存回退）

依赖：
- hermes-dispatch.sh （Hermes 非交互派活）
- codex （OpenAI Codex CLI，需 git 仓库 + pty）
- npm/jest （测试运行器）

用法：
  python3 pipeline.py "<需求描述>" <源码目录> [--round-dir <缓存目录>]

示例：
  python3 pipeline.py "给 copyAddress 增加防抖" /fs/1000/ftp/技术文档/claude/beauty-instruments-miniapp
"""

import argparse
import json
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

# ============================================================================
# 配置常量
# ============================================================================
MAX_RETRIES = 3                      # 全局最大重试轮次
REFLECTION_THRESHOLD = 2             # 连续失败触发反思的阈值
TIMEOUT_CODEX = 300                  # codex 执行超时(秒)
TIMEOUT_HERMES = 300                 # hermes 执行超时(秒)
TIMEOUT_TEST = 120                   # 测试运行超时(秒)

# ============================================================================
# 工具函数
# ============================================================================
def run_cmd(cmd: str, cwd: Optional[Path] = None, timeout: int = 60) -> Tuple[int, str, str]:
    """运行 shell 命令，返回 (exit_code, stdout, stderr)"""
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", f"命令超时 ({timeout}s): {cmd}"
    except Exception as e:
        return -1, "", f"命令执行异常: {e}"

def save_round(cache_dir: Path, round_id: str, stage: str, inputs: Dict, outputs: Dict) -> None:
    """每轮输入/输出落盘，支持缓存回退"""
    stage_dir = cache_dir / round_id / stage
    stage_dir.mkdir(parents=True, exist_ok=True)
    (stage_dir / "inputs.json").write_text(json.dumps(inputs, ensure_ascii=False, indent=2))
    (stage_dir / "outputs.json").write_text(json.dumps(outputs, ensure_ascii=False, indent=2))

def extract_block(text: str, tag: str) -> Optional[str]:
    """提取 [[TAG]]...[[END_TAG]] 围栏内容"""
    pattern = rf"\[\[{tag}\]\](.*?)\[\[END_{tag}\]\]"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else None

def extract_json(text: str) -> Optional[Dict]:
    """从文本中提取第一个 JSON 对象"""
    # 先尝试提取围栏内的 JSON
    for tag in ["ACCEPTANCE_CRITERIA", "MODIFICATION_PLAN", "VERIFY", "TESTS", "REVIEW"]:
        block = extract_block(text, tag)
        if block:
            try:
                return json.loads(block)
            except json.JSONDecodeError:
                pass
    # 再尝试直接解析整个文本
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None

def extract_failed_tests(test_output: str) -> list:
    """从 jest 输出提取失败的测试用例名"""
    failed = []
    for line in test_output.split('\n'):
        if '●' in line and 'FAIL' in line or '✕' in line:
            # 简化提取：取包含 describe/test 的行
            failed.append(line.strip())
    return failed

def extract_traceback(test_output: str) -> str:
    """提取错误堆栈（最后 50 行）"""
    lines = test_output.split('\n')
    return '\n'.join(lines[-50:])

# ============================================================================
# Hermes 调用
# ============================================================================
def call_hermes(task: str, cache_dir: Path, round_id: str, stage: str) -> str:
    """调用 hermes-dispatch.sh 非交互执行任务"""
    cmd = f"hermes-dispatch.sh {shlex.quote(task)}"
    print(f"[HERMES] {stage}: {task[:80]}...")
    code, out, err = run_cmd(cmd, timeout=TIMEOUT_HERMES)
    save_round(cache_dir, round_id, stage, {"task": task}, {"stdout": out, "stderr": err, "code": code})
    if code != 0:
        print(f"[HERMES] {stage} 失败 (code={code}): {err[:200]}")
    return out

# ============================================================================
# Codex 调用
# ============================================================================
def call_codex(prompt: str, repo_path: Path, cache_dir: Path, round_id: str, stage: str) -> str:
    """调用 codex exec（必须在 git 仓库内 + pty）"""
    # 确保在 git 仓库内
    if not (repo_path / ".git").exists():
        raise RuntimeError(f"Codex 需要 git 仓库: {repo_path}")

    # 使用 script 提供伪终端
    cmd = f"cd {shlex.quote(str(repo_path))} && script -qec 'codex exec {shlex.quote(prompt)}' /dev/null"
    print(f"[CODEX] {stage}: {prompt[:80]}...")
    code, out, err = run_cmd(cmd, cwd=repo_path, timeout=TIMEOUT_CODEX)
    save_round(cache_dir, round_id, stage, {"prompt": prompt}, {"stdout": out, "stderr": err, "code": code})
    if code != 0:
        print(f"[CODEX] {stage} 失败 (code={code}): {err[:200]}")
    return out

# ============================================================================
# 验证左移：Linter/类型检查
# ============================================================================
def run_linter(repo_path: Path) -> Tuple[bool, str]:
    """运行项目配置的 Linter/类型检查，返回 (是否通过, 输出)"""
    # 按优先级尝试常见命令
    commands = [
        "npm run lint 2>&1",
        "npx eslint . --ext .js,.ts,.vue 2>&1",
        "npx tsc --noEmit 2>&1",
        "npx pyright 2>&1",
        "make lint 2>&1",
    ]
    for cmd in commands:
        code, out, err = run_cmd(cmd, cwd=repo_path, timeout=60)
        if code == 0:
            return True, out
        # 如果命令存在但报错，返回失败
        if "command not found" not in (out + err).lower() and "not found" not in (out + err).lower():
            return False, out + err
    return True, "未检测到 Linter 配置，跳过"

# ============================================================================
# 测试运行
# ============================================================================
def run_tests(repo_path: Path) -> Tuple[bool, str]:
    """运行测试套件，返回 (是否全绿, 输出)"""
    # 自动检测测试命令
    package_json = repo_path / "package.json"
    if package_json.exists():
        try:
            pkg = json.loads(package_json.read_text())
            test_cmd = pkg.get("scripts", {}).get("test", "npm test -- --silent")
        except:
            test_cmd = "npm test -- --silent"
    else:
        test_cmd = "npm test -- --silent"

    print(f"[TEST] 运行: {test_cmd}")
    code, out, err = run_cmd(test_cmd, cwd=repo_path, timeout=TIMEOUT_TEST)
    return code == 0, out + err

# ============================================================================
# Claude 角色：阶段1 出方案（需在调用者会话内实现）
# ============================================================================
def claude_plan(requirement: str, source_files: Dict[str, str]) -> str:
    """
    由调用者（Claude 会话）实现：分析需求+源码，输出 [[MODIFICATION_PLAN]] + [[ACCEPTANCE_CRITERIA]]
    此处提供模板供参考，实际应在会话内手工输出或通过 Claude API 调用
    """
    raise NotImplementedError("claude_plan 需在 Claude 会话内实现，或通过 API 调用")

# ============================================================================
# Claude 角色：收口审查（需在调用者会话内实现）
# ============================================================================
def claude_review(plan: str, diff: str, tests: str, test_result: str, cache_dir: Path, round_id: str) -> str:
    """
    由调用者（Claude 会话）实现：阅读 plan/diff/tests/test_result，输出 [[REVIEW]]
    此处提供模板供参考
    """
    raise NotImplementedError("claude_review 需在 Claude 会话内实现")

# ============================================================================
# 主流水线
# ============================================================================
def pipeline(requirement: str, repo_path: Path, cache_root: Optional[Path] = None) -> Dict[str, Any]:
    """
    执行完整流水线，返回最终结果字典
    """
    round_id = time.strftime("%Y%m%d_%H%M%S")
    cache_dir = cache_root or Path(".pipeline_cache")
    cache_dir.mkdir(exist_ok=True)

    print(f"\n{'='*60}")
    print(f"PIPELINE ROUND: {round_id}")
    print(f"REQUIREMENT: {requirement}")
    print(f"REPO: {repo_path}")
    print(f"CACHE: {cache_dir / round_id}")
    print(f"{'='*60}\n")

    # 读取相关源码文件（简化：读取所有 .js/.ts 文件）
    source_files = {}
    for ext in [".js", ".ts", ".vue", ".py", ".json"]:
        for f in repo_path.rglob(f"*{ext}"):
            if "node_modules" not in str(f) and ".git" not in str(f):
                try:
                    source_files[str(f.relative_to(repo_path))] = f.read_text(encoding="utf-8")
                except:
                    pass

    source_context = "\n\n".join(f"=== {path} ===\n{content}" for path, content in source_files.items())

    retry_count = 0
    reflection_count = 0
    last_diff = ""
    last_plan = ""
    last_tests = ""
    last_test_result = ""

    while retry_count < MAX_RETRIES:
        print(f"\n>>> ROUND {retry_count + 1}/{MAX_RETRIES} (reflection: {reflection_count})")

        # ========== 阶段1: Claude 出方案 ==========
        if retry_count == 0:
            # 首轮：需要人工/会话内输出 plan
            print("\n[PHASE 1] 等待 Claude 输出 [[MODIFICATION_PLAN]] + [[ACCEPTANCE_CRITERIA]]...")
            print("请在 Claude 会话中分析需求并输出 plan，然后粘贴到这里（或通过 API 调用）")
            plan_input = sys.stdin.read() if sys.stdin.isatty() else ""
            if not plan_input:
                # 回退：从缓存读取上一轮 plan（用于重跑）
                cache_plan = cache_dir / round_id / "plan" / "outputs.json"
                if cache_plan.exists():
                    plan_input = json.loads(cache_plan.read_text()).get("stdout", "")
                else:
                    raise RuntimeError("首轮必须提供 plan，可通过 stdin 管道传入或交互输入")
            last_plan = plan_input
        else:
            # 重试轮：使用上一轮 plan（或修正后的）
            pass

        save_round(cache_dir, round_id, "plan", {"requirement": requirement}, {"plan": last_plan})

        # 从 plan 提取 acceptance_criteria
        acceptance = extract_json(last_plan)
        if not acceptance or "acceptance_criteria" not in acceptance:
            print("[WARN] Plan 中未找到 acceptance_criteria，建议补充")

        # ========== 阶段2: Codex 执行 + 验证左移 + Hermes 校验 ==========
        print("\n[PHASE 2] Codex 执行...")

        # 构造 Codex prompt
        codex_prompt = f"""需求：{requirement}

[[MODIFICATION_PLAN]]
{last_plan}
[[END_MODIFICATION_PLAN]]

请修改代码实现上述计划。要求：
1. 仅输出标准 unified diff 或完整修改后的函数
2. 修改前确保代码风格符合项目规范
3. 遵循验收标准中的所有场景
"""
        diff = call_codex(codex_prompt, repo_path, cache_dir, round_id, f"codex_round{retry_count}")
        last_diff = diff

        # 验证左移：Linter/类型检查
        print("[LINT] 验证左移：运行 Linter/类型检查...")
        lint_ok, lint_out = run_linter(repo_path)
        if not lint_ok:
            print(f"[LINT] 失败，回传 Codex 修正:\n{lint_out[:500]}")
            fix_prompt = f"""Linter/类型检查失败，请修正以下 diff：
{lint_out}

当前 diff：
{diff}

请输出修正后的 [[CODE_DIFF]]"""
            diff = call_codex(fix_prompt, repo_path, cache_dir, round_id, f"codex_lint_fix_round{retry_count}")
            last_diff = diff
            # 重新 lint
            lint_ok, lint_out = run_linter(repo_path)
            if not lint_ok:
                print(f"[LINT] 修正后仍失败: {lint_out[:200]}")

        # Hermes 校验
        print("[HERMES] 校验 plan vs diff...")
        verify_task = f"""校验以下 diff 是否完全落实 plan，且无逻辑/风格错误。
输出格式：[[VERIFY]] + 结论(PASS/FAIL) + 问题清单 + 修正建议 + [[END_VERIFY]]

Plan：
{last_plan}

Diff：
{last_diff}
"""
        verify_out = call_hermes(verify_task, cache_dir, round_id, f"hermes_verify_round{retry_count}")
        verify_json = extract_json(verify_out)

        if verify_json and verify_json.get("结论") == "FAIL":
            print(f"[HERMES] 校验 FAIL: {verify_json.get('问题清单', '')}")
            if retry_count >= 1:
                print("[HERMES] 超过最大回传轮次，进入反思阶段")
                break
            # 回传 Codex 修正
            fix_prompt = f"""Hermes 校验失败，请修正：
问题：{verify_json.get('问题清单', '')}
建议：{verify_json.get('修正建议', '')}

当前 diff：
{last_diff}

请输出修正后的 [[CODE_DIFF]]"""
            diff = call_codex(fix_prompt, repo_path, cache_dir, round_id, f"codex_fix_round{retry_count}")
            last_diff = diff
            retry_count += 1
            continue

        print("[HERMES] 校验 PASS")

        # ========== 阶段3: Hermes 生成测试 + 运行 ==========
        print("\n[PHASE 3] Hermes 生成测试并运行...")

        test_task = f"""为以下 diff 生成可运行的测试代码（jest/pytest），覆盖 acceptance_criteria 中所有场景。
输出格式：[[TESTS]] + 测试代码 + [[END_TESTS]]

Plan：
{last_plan}

Diff：
{last_diff}

Acceptance Criteria：
{json.dumps(acceptance.get('acceptance_criteria', {}), ensure_ascii=False, indent=2) if acceptance else '见 Plan'}
"""
        tests_out = call_hermes(test_task, cache_dir, round_id, f"hermes_tests_round{retry_count}")
        last_tests = tests_out

        # 运行测试
        test_ok, test_output = run_tests(repo_path)
        last_test_result = test_output
        print(f"[TEST] 结果: {'PASS' if test_ok else 'FAIL'}")
        if not test_ok:
            print(f"[TEST] 输出:\n{test_output[:1000]}")

        # ========== Claude 收口审查 ==========
        print("\n[REVIEW] Claude 收口审查...")
        print("请在 Claude 会话中阅读 plan/diff/tests/test_result 并输出 [[REVIEW]]")
        print("格式：[[REVIEW]] + 结论(APPROVED/CHANGES_REQUESTED) + 失败归因 + 修正指令 + [[END_REVIEW]]")
        review_input = sys.stdin.read() if sys.stdin.isatty() else ""
        if not review_input:
            cache_review = cache_dir / round_id / "review" / "outputs.json"
            if cache_review.exists():
                review_input = json.loads(cache_review.read_text()).get("stdout", "")

        save_round(cache_dir, round_id, "review",
                   {"plan": last_plan, "diff": last_diff, "tests": last_tests, "test_result": test_output},
                   {"review": review_input})

        review_json = extract_json(review_input)
        if review_json:
            conclusion = review_json.get("结论", "")
            if conclusion == "APPROVED":
                print("\n✅ REVIEW APPROVED — 进入人会签")
                return {
                    "status": "APPROVED",
                    "round_id": round_id,
                    "plan": last_plan,
                    "diff": last_diff,
                    "tests": last_tests,
                    "test_result": last_test_result,
                    "review": review_input,
                    "cache_dir": str(cache_dir / round_id)
                }
            elif conclusion == "CHANGES_REQUESTED":
                print(f"❌ REVIEW CHANGES_REQUESTED: {review_json.get('失败归因', '')}")
                reflection_count += 1
                if reflection_count >= REFLECTION_THRESHOLD:
                    # 生成人工接管摘要
                    summary = f"""# 人工接管摘要
- 轮次: {round_id}
- 需求: {requirement}
- 连续失败轮次: {reflection_count}
- 最近 Plan: {last_plan[:500]}
- 最近 Diff: {last_diff[:500]}
- 最近 Review: {review_input[:500]}
- 测试输出: {test_output[:1000]}
"""
                    summary_path = cache_dir / round_id / "HUMAN_TAKEOVER.md"
                    summary_path.write_text(summary)
                    print(f"🛑 触发熔断，生成人工接管摘要: {summary_path}")
                    return {
                        "status": "CIRCUIT_BREAKER",
                        "round_id": round_id,
                        "summary_path": str(summary_path),
                        "cache_dir": str(cache_dir / round_id)
                    }

                # 组装锚定上下文 Prompt 回传 Codex
                failed_tests = extract_failed_tests(test_output)
                traceback = extract_traceback(test_output)

                anchored_prompt = f"""原始 Plan：
{last_plan}

失败的测试用例：
{json.dumps(failed_tests, ensure_ascii=False, indent=2)}

错误堆栈：
{traceback}

限制指令：仅修复导致上述测试失败的逻辑，严禁重构其他无关代码。

请输出修正后的 [[CODE_DIFF]]"""

                diff = call_codex(anchored_prompt, repo_path, cache_dir, round_id, f"codex_anchored_fix_round{retry_count}")
                last_diff = diff
                retry_count += 1
                continue

        # 无法解析 review，默认继续
        retry_count += 1

    return {
        "status": "MAX_RETRIES_EXCEEDED",
        "round_id": round_id,
        "cache_dir": str(cache_dir / round_id)
    }

# ============================================================================
# CLI 入口
# ============================================================================
def main():
    parser = argparse.ArgumentParser(description="三模型联动自动化调度器")
    parser.add_argument("requirement", help="需求描述")
    parser.add_argument("repo_path", help="源码仓库路径（必须是 git 仓库）")
    parser.add_argument("--cache-dir", default=".pipeline_cache", help="缓存目录")
    parser.add_argument("--round-id", help="指定轮次 ID（用于从缓存恢复）")
    args = parser.parse_args()

    repo_path = Path(args.repo_path).resolve()
    if not repo_path.exists():
        print(f"错误: 仓库路径不存在: {repo_path}", file=sys.stderr)
        sys.exit(1)
    if not (repo_path / ".git").exists():
        print(f"错误: 不是 git 仓库: {repo_path}", file=sys.stderr)
        sys.exit(1)

    cache_root = Path(args.cache_dir).resolve()

    try:
        result = pipeline(args.requirement, repo_path, cache_root)
        print(f"\n{'='*60}")
        print(f"PIPELINE 结束: {result['status']}")
        print(f"缓存目录: {result.get('cache_dir', 'N/A')}")
        if result['status'] == 'APPROVED':
            print("✅ 可进入人会签合并")
        elif result['status'] == 'CIRCUIT_BREAKER':
            print(f"🛑 需人工接管，摘要: {result.get('summary_path')}")
        print(f"{'='*60}")
    except KeyboardInterrupt:
        print("\n⚠️ 用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ 流水线异常: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()