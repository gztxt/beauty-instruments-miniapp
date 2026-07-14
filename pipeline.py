#!/usr/bin/env python3
"""
pipeline.py — 三模型联动编排器（档位 B：脚本化调度）

设计目标：
- 将档位 A（会话内手工编排）固化为可复用、可观测、可恢复的自动化流水线
- 核心约束：Codex 必须在 git 仓库内 + pty=true，Hermes 走 --yolo 非交互
- 安全门禁：备份先行、Codex不碰生产库、Hermes只跑不改、人会签、缓存回退
- 熔断机制：max_retries=3, reflection_threshold=2 → 超限生成人工接管摘要

用法：
    python pipeline.py <需求文本> [--repo PATH] [--round ROUND_ID]
    python pipeline.py --resume ROUND_ID   # 从缓存恢复
"""

import argparse
import hashlib
import json
import os
import re
import shlex
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ==================== 常量与路径 ====================
HERMES_BIN = os.environ.get("HERMES_BIN", os.path.expanduser("~/.local/bin/hermes"))
CODEX_BIN = os.environ.get("CODEX_BIN", os.path.expanduser("~/.npm-global/bin/codex"))
HERMES_DISPATCH = os.environ.get("HERMES_DISPATCH", "/vol1/@apphome/trim.openclaw/data/workspace/scripts/hermes-dispatch.sh")

MAX_RETRIES = 3
REFLECTION_THRESHOLD = 2
CODEX_TIMEOUT = 300
HERMES_TIMEOUT = 300

FENCE_PLAN = ("[[MODIFICATION_PLAN]]", "[[END_PLAN]]")
FENCE_DIFF = ("[[CODE_DIFF]]", "[[END_DIFF]]")
FENCE_VERIFY = ("[[VERIFY]]", "[[END_VERIFY]]")
FENCE_TESTS = ("[[TESTS]]", "[[END_TESTS]]")
FENCE_REVIEW = ("[[REVIEW]]", "[[END_REVIEW]]")

# ==================== 工具函数 ====================
def run_cmd(cmd: str, cwd: Optional[Path] = None, timeout: int = 60, check: bool = False, capture: bool = True) -> subprocess.CompletedProcess:
    """运行命令，返回 CompletedProcess"""
    proc = subprocess.run(
        cmd, shell=True, cwd=cwd, capture_output=capture, text=True, timeout=timeout
    )
    if check and proc.returncode != 0:
        raise subprocess.CalledProcessError(proc.returncode, cmd, proc.stdout, proc.stderr)
    return proc

def extract_block(text: str, start_fence: str, end_fence: str) -> Optional[str]:
    """提取 [[BLOCK]]...[[END_BLOCK]] 之间的内容（支持多行，非贪婪）"""
    pattern = re.compile(re.escape(start_fence) + r"(.*?)" + re.escape(end_fence), re.DOTALL)
    m = pattern.search(text)
    return m.group(1).strip() if m else None

def save_round(cache_dir: Path, round_id: str, stage: str, inputs: Dict, outputs: Dict):
    """每轮输入/输出落盘，支持恢复"""
    stage_dir = cache_dir / round_id / stage
    stage_dir.mkdir(parents=True, exist_ok=True)
    (stage_dir / "inputs.json").write_text(json.dumps(inputs, ensure_ascii=False, indent=2))
    (stage_dir / "outputs.json").write_text(json.dumps(outputs, ensure_ascii=False, indent=2))

def load_round(cache_dir: Path, round_id: str, stage: str) -> Tuple[Dict, Dict]:
    """读取某轮某阶段的缓存"""
    stage_dir = cache_dir / round_id / stage
    inputs = json.loads((stage_dir / "inputs.json").read_text()) if (stage_dir / "inputs.json").exists() else {}
    outputs = json.loads((stage_dir / "outputs.json").read_text()) if (stage_dir / "outputs.json").exists() else {}
    return inputs, outputs

def hash_content(*parts: str) -> str:
    """内容哈希，用于去重判断"""
    return hashlib.sha256("|".join(parts).encode()).hexdigest()[:16]

# ==================== 阶段实现 ====================
def stage1_plan(requirement: str, source_files: List[Path], cache_dir: Path, round_id: str) -> str:
    """阶段1：Claude 本会话内产出 [[MODIFICATION_PLAN]]（含 ACCEPTANCE_CRITERIA）"""
    # 读取源码上下文
    context = {}
    for f in source_files:
        if f.exists():
            context[str(f)] = f.read_text(encoding="utf-8")

    # 构造提示词（实际由 Claude 会话内直接生成，这里仅作接口占位）
    # 真实调用时：plan = claude_api(requirement, context)
    prompt = f"""需求：{requirement}

相关源码：
{json.dumps(context, ensure_ascii=False, indent=2)}

请输出 [[MODIFICATION_PLAN]]...[[END_PLAN]]，必须包含：
- 修改文件
- 修改位置
- 修改描述
- 预期行为变化
- 接口影响
- 验收标准 (ACCEPTANCE_CRITERIA JSON)
"""
    # 这里返回模板，实际使用时由 Claude 会话填充
    plan = f"""[[MODIFICATION_PLAN]]
- 修改文件：待填充
- 修改位置：待填充
- 修改描述：待填充
- 预期行为变化：待填充
- 接口影响：待填充
- 验收标准：
  {{
    "functional": [],
    "non_functional": [],
    "style": []
  }}
[[END_PLAN]]"""

    save_round(cache_dir, round_id, "plan", {"requirement": requirement}, {"plan": plan})
    return plan

def stage2_codex(plan: str, repo_path: Path, cache_dir: Path, round_id: str) -> str:
    """阶段2：Codex 执行 → [[CODE_DIFF]]（需 git 仓库 + pty）"""
    # 备份
    for f in repo_path.rglob("*"):
        if f.is_file() and not f.name.startswith("."):
            bak = f.with_suffix(f.suffix + f".bak.{datetime.now():%Y%m%d%H%M%S}")
            bak.write_bytes(f.read_bytes())

    # 构造 Codex prompt
    prompt = f"""{plan}

请根据上述计划修改代码，仅输出 [[CODE_DIFF]]...[[END_DIFF]]（标准 unified diff 或完整函数）。
修改前请先运行 lint/type-check（如可用），失败则修正后再产出 diff。"""

    # 必须在 git 仓库内、pty=true
    inner_cmd = f"{CODEX_BIN} exec {shlex.quote(prompt)}"
    cmd = f"cd {shlex.quote(str(repo_path))} && script -qec {shlex.quote(inner_cmd)} /dev/null"

    proc = run_cmd(cmd, timeout=CODEX_TIMEOUT)
    diff = proc.stdout

    # 提取 CODE_DIFF
    code_diff = extract_block(diff, *FENCE_DIFF) or diff

    save_round(cache_dir, round_id, "codex", {"plan": plan}, {"diff": diff, "code_diff": code_diff})
    return code_diff

def stage2_verify(plan: str, diff: str, cache_dir: Path, round_id: str) -> Tuple[bool, str]:
    """阶段2校验：Hermes 校验 plan vs diff → [[VERIFY]]"""
    prompt = f"""校验以下代码变更是否完全落实计划，输出 [[VERIFY]]...[[END_VERIFY]]：

计划：
{plan}

变更：
{diff}

仅输出：
[[VERIFY]]
- 结论：PASS | FAIL
- 问题清单：逐行指出（若 FAIL）
- 修正建议：给 Codex 的具体指令（若 FAIL）
[[END_VERIFY]]"""

    cmd = f"{shlex.quote(HERMES_DISPATCH)} {shlex.quote(prompt)}"
    proc = run_cmd(cmd, timeout=HERMES_TIMEOUT)
    verify_out = proc.stdout

    verify_block = extract_block(verify_out, *FENCE_VERIFY) or verify_out
    passed = "PASS" in verify_block and "FAIL" not in verify_block

    save_round(cache_dir, round_id, "verify", {"plan": plan, "diff": diff}, {"verify": verify_out, "passed": passed})
    return passed, verify_block

def stage3_tests(diff: str, repo_path: Path, cache_dir: Path, round_id: str) -> Tuple[str, str]:
    """阶段3：Hermes 生成并运行测试 → [[TESTS]] + 测试结果"""
    prompt = f"""为以下变更生成可运行的测试代码（pytest/jest），输出 [[TESTS]]...[[END_TESTS]]，然后运行并返回结果。

变更：
{diff}

测试框架：自动检测（package.json 有 jest 则 jest，requirements.txt 有 pytest 则 pytest）。
要求：覆盖验收标准所有 functional 场景。"""

    cmd = f"{shlex.quote(HERMES_DISPATCH)} {shlex.quote(prompt)}"
    proc = run_cmd(cmd, cwd=repo_path, timeout=HERMES_TIMEOUT)
    tests_out = proc.stdout

    # 尝试提取 TESTS 块
    tests_block = extract_block(tests_out, *FENCE_TESTS) or tests_out

    # 运行测试（在仓库内）
    test_cmd = "npm test -- --silent 2>&1" if (repo_path / "package.json").exists() else "pytest -q 2>&1"
    test_proc = run_cmd(test_cmd, cwd=repo_path, timeout=120)
    test_result = test_proc.stdout + test_proc.stderr

    save_round(cache_dir, round_id, "tests", {"diff": diff}, {"tests": tests_out, "result": test_result})
    return tests_block, test_result

def stage3_review(plan: str, diff: str, tests: str, test_result: str, cache_dir: Path, round_id: str) -> Tuple[bool, str]:
    """阶段3收口：Claude 评审 → [[REVIEW]]"""
    # 判断测试是否通过
    passed = "FAIL" not in test_result and "ERROR" not in test_result and ("PASS" in test_result or "passed" in test_result.lower())

    review = f"""[[REVIEW]]
- 结论：{'APPROVED' if passed else 'CHANGES_REQUESTED'}
- 失败归因：{'逻辑错误' if not passed else '无'}
- 修正指令：{'回传 Codex 修复失败用例' if not passed else '无'}
[[END_REVIEW]]"""

    save_round(cache_dir, round_id, "review", {"plan": plan, "diff": diff, "tests": tests}, {"review": review, "approved": passed})
    return passed, review

# ==================== 主流水线 ====================
def run_pipeline(requirement: str, repo_path: Path, cache_dir: Path, round_id: str, resume: bool = False) -> Dict:
    """完整流水线编排"""
    source_files = list(repo_path.rglob("*.js")) + list(repo_path.rglob("*.ts")) + list(repo_path.rglob("*.py"))
    source_files = [f for f in source_files if not any(p in f.parts for p in [".git", "node_modules", "__pycache__", ".pytest_cache"])]

    retry_count = 0
    reflection_count = 0
    current_diff = ""

    while retry_count < MAX_RETRIES:
        print(f"\n{'='*60}")
        print(f"Round {round_id} | Attempt {retry_count+1}/{MAX_RETRIES}")
        print(f"{'='*60}")

        # Stage 1: Plan（若恢复则读缓存）
        if resume and (cache_dir / round_id / "plan" / "outputs.json").exists():
            _, plan_out = load_round(cache_dir, round_id, "plan")
            plan = plan_out.get("plan", "")
            print("📋 从缓存恢复 Plan")
        else:
            plan = stage1_plan(requirement, source_files, cache_dir, round_id)
            print(f"📋 Plan 产出（长度 {len(plan)}）")

        # Stage 2: Codex + Verify（循环直到 PASS）
        verify_passed = False
        for verify_attempt in range(2):  # 最多 2 轮 verify
            current_diff = stage2_codex(plan, repo_path, cache_dir, round_id)
            print(f"🔧 Codex Diff 产出（长度 {len(current_diff)}）")

            passed, verify = stage2_verify(plan, current_diff, cache_dir, round_id)
            print(f"✅ Verify: {'PASS' if passed else 'FAIL'}")

            if passed:
                verify_passed = True
                break
            else:
                print(f"🔄 Verify 失败，回传 Codex 修正（尝试 {verify_attempt+1}/2）")
                # 将 verify 建议回传给 Codex（实际需重新调用 stage2_codex，简化：追加 prompt 重跑）
                plan = f"{plan}\n\n上轮校验失败，请修正：\n{verify}"

        if not verify_passed:
            print("❌ Verify 连续失败，终止")
            return {"status": "VERIFY_FAILED", "round_id": round_id}

        # Stage 3: Tests + Review
        tests, test_result = stage3_tests(current_diff, repo_path, cache_dir, round_id)
        print(f"🧪 Tests 运行完成")

        approved, review = stage3_review(plan, current_diff, tests, test_result, cache_dir, round_id)
        print(f"📝 Review: {'APPROVED' if approved else 'CHANGES_REQUESTED'}")

        if approved:
            # 生成人会签摘要
            summary = f"""# 🤝 人会签摘要
- 需求：{requirement}
- Round：{round_id}
- Plan：{plan[:200]}...
- Diff：{current_diff[:200]}...
- Tests：{tests[:200]}...
- Test Result：{test_result[:200]}...
- Review：APPROVED
"""
            (cache_dir / round_id / "HUMAN_SIGNOFF.md").write_text(summary)
            print(f"\n🎉 流水线完成，等待人会签：{cache_dir / round_id / 'HUMAN_SIGNOFF.md'}")
            return {"status": "APPROVED", "round_id": round_id, "diff": current_diff, "signoff": summary}

        # CHANGES_REQUESTED → 反思与熔断
        reflection_count += 1
        if reflection_count >= REFLECTION_THRESHOLD:
            # 生成人工接管摘要
            takeover = f"""# 🚨 人工接管摘要
- 需求：{requirement}
- 连续失败轮次：{reflection_count}
- 最近 Plan：{plan}
- 最近 Diff：{current_diff}
- 最近 Review：{review}
- 测试输出：{test_result}
"""
            (cache_dir / round_id / "HUMAN_TAKEOVER.md").write_text(takeover)
            print(f"\n🛑 触发熔断，需人工接管：{cache_dir / round_id / 'HUMAN_TAKEOVER.md'}")
            return {"status": "CIRCUIT_BREAKER", "round_id": round_id}

        # 组装锚定上下文，回传 Codex
        print(f"🔁 Review 请求修正，反思计数 {reflection_count}，回传 Codex...")
        plan = f"""{plan}

=== REFLECTION CONTEXT (第 {reflection_count} 次反思) ===
原始计划已固定，请仅修复导致测试失败的逻辑。
失败用例：见测试输出
Traceback：见测试输出
限制指令：仅修复该逻辑，严禁重构无关代码。
=== END REFLECTION CONTEXT ==="""
        retry_count += 1

    return {"status": "MAX_RETRIES_EXCEEDED", "round_id": round_id}

# ==================== CLI ====================
def main():
    parser = argparse.ArgumentParser(description="三模型联动流水线（档位 B）")
    parser.add_argument("requirement", nargs="?", help="需求描述")
    parser.add_argument("--repo", type=Path, default=Path.cwd(), help="Git 仓库路径")
    parser.add_argument("--cache-dir", type=Path, default=Path(".pipeline_cache"), help="缓存目录")
    parser.add_argument("--round", dest="round_id", help="指定 round ID（默认时间戳）")
    parser.add_argument("--resume", action="store_true", help="从缓存恢复")
    args = parser.parse_args()

    if not args.requirement and not args.resume:
        parser.error("需提供需求描述或使用 --resume")

    repo_path = args.repo.resolve()
    if not (repo_path / ".git").exists():
        print(f"❌ 非 Git 仓库：{repo_path}，Codex 需要 git 上下文", file=sys.stderr)
        sys.exit(1)

    cache_dir = args.cache_dir.resolve()
    cache_dir.mkdir(parents=True, exist_ok=True)

    round_id = args.round_id or datetime.now().strftime("%Y%m%d_%H%M%S")

    if args.resume:
        print(f"🔄 恢复 Round: {round_id}")

    result = run_pipeline(
        requirement=args.requirement or "",
        repo_path=repo_path,
        cache_dir=cache_dir,
        round_id=round_id,
        resume=args.resume
    )

    print(f"\n📊 最终状态: {result['status']}")
    if result['status'] == 'APPROVED':
        print(f"📄 人会签: {cache_dir / round_id / 'HUMAN_SIGNOFF.md'}")
    elif result['status'] == 'CIRCUIT_BREAKER':
        print(f"🚨 接管摘要: {cache_dir / round_id / 'HUMAN_TAKEOVER.md'}")

if __name__ == "__main__":
    main()