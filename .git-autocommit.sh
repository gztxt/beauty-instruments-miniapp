#!/bin/bash
# 采薇小程序自动 git 保存脚本
# 每小时自动检测变更并提交

cd "$(dirname "$0")"

# 检查是否有变更
if [[ -z $(git status --porcelain) ]]; then
    exit 0  # 无变更，跳过
fi

git add -A
git commit -m "auto: 自动保存 $(date '+%Y-%m-%d %H:%M')"
