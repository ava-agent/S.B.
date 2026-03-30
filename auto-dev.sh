#!/bin/bash
# S.B. Auto Dev Script
# 自动开发脚本 - 每次执行一个开发任务

set -e

cd /root/.openclaw/workspace/S.B.

echo "=== S.B. Auto Dev $(date '+%Y-%m-%d %H:%M:%S') ===" >> /root/.openclaw/workspace/S.B./DEV_LOG.md

# 检查当前任务
CURRENT_TASK=$(grep -A 1 "下次任务" /root/.openclaw/workspace/S.B./DEVELOPMENT_PLAN.md | tail -1 | sed 's/.*://' | xargs)
echo "Current task: $CURRENT_TASK" >> /root/.openclaw/workspace/S.B./DEV_LOG.md

# 运行测试确保基线
npm test 2>&1 | tail -20 >> /root/.openclaw/workspace/S.B./DEV_LOG.md || true

# 提交开发日志
cd /root/.openclaw/workspace/S.B.
git add DEV_LOG.md DEVELOPMENT_PLAN.md 2>/dev/null || true
git commit -m "[Auto] Dev log update $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true

echo "---" >> /root/.openclaw/workspace/S.B./DEV_LOG.md
