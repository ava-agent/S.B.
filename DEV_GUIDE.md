# S.B. 持续开发指南

## 自动化设置

### 方法1: 使用 OpenClaw Cron (推荐)

设置每2小时执行一次开发任务：

```bash
openclaw schedule create \
  --name "sb-dev-session" \
  --schedule "0 */2 * * *" \
  --command "cd /root/.openclaw/workspace/S.B. && ./auto-dev.sh"
```

### 方法2: 使用系统 Cron

```bash
crontab -e
# 添加：
0 */2 * * * /root/.openclaw/workspace/S.B./auto-dev.sh >> /root/.openclaw/workspace/S.B./cron.log 2>&1
```

## 手动触发开发

直接运行：
```bash
cd /root/.openclaw/workspace/S.B.
./auto-dev.sh
```

## 开发流程

1. **查看当前任务**: 读取 `DEVELOPMENT_PLAN.md`
2. **实施开发**: 编写代码实现功能
3. **运行测试**: `npm test`
4. **TypeScript检查**: `npx tsc --noEmit`
5. **提交代码**: `git add -A && git commit -m "..."`
6. **更新日志**: 记录到 `DEV_LOG.md`
7. **更新计划**: 标记完成任务，更新下一步

## 当前开发任务

查看 `DEVELOPMENT_PLAN.md` 获取最新任务列表。

## 进度追踪

所有开发进度记录在 `DEV_LOG.md` 中，按时间倒序排列。
