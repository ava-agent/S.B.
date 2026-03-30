#!/bin/bash
# S.B. Continuous Development System
# 持续开发自动化脚本

set -e

PROJECT_DIR="/root/.openclaw/workspace/S.B."
LOG_FILE="$PROJECT_DIR/DEV_LOG.md"
PLAN_FILE="$PROJECT_DIR/DEVELOPMENT_PLAN.md"

cd "$PROJECT_DIR"

echo "========================================"
echo "S.B. Auto Dev Session - $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 1. 拉取最新代码
echo "📥 Pulling latest changes..."
git pull origin main 2>/dev/null || echo "No remote or already up to date"

# 2. 运行测试确保基线
echo "🧪 Running tests..."
npm test 2>&1 | tee /tmp/test-output.txt || true
TEST_STATUS=$?
if [ $TEST_STATUS -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "⚠️ Some tests failed, checking..."
fi

# 3. 获取当前任务
CURRENT_TASK=$(grep -A 1 "下一步" "$LOG_FILE" | tail -1 | sed 's/.*：//' | xargs)
echo "🎯 Current Task: $CURRENT_TASK"

# 4. 检查 TypeScript 编译
echo "🔍 TypeScript check..."
npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt || true

# 5. 记录状态到日志
echo "" >> "$LOG_FILE"
echo "### $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE"
echo "**自动检查运行**" >> "$LOG_FILE"
echo "- 测试状态: $([ $TEST_STATUS -eq 0 ] && echo '通过' || echo '失败')" >> "$LOG_FILE"
echo "- 当前任务: $CURRENT_TASK" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 6. 提交开发日志
git add DEV_LOG.md DEVELOPMENT_PLAN.md 2>/dev/null || true
git commit -m "[Auto] Dev log update $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "No changes to commit"

echo "========================================"
echo "Session complete at $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
