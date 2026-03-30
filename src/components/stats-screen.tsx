"use client";

import type { UserStats } from "@/actions/get-stats";
import { getPerformanceLabel, getPerformanceColor, getTrendDescription } from "@/lib/scoring";
import type { Grade } from "@/lib/types";

interface StatsScreenProps {
  stats: UserStats;
  isLoading: boolean;
  onClose: () => void;
}

const gradeColor: Record<Grade, string> = {
  S: "bg-yellow-500",
  "A+": "bg-green-500",
  A: "bg-green-600",
  "A-": "bg-green-700",
  "B+": "bg-blue-500",
  B: "bg-blue-600",
  "B-": "bg-blue-700",
  "C+": "bg-orange-500",
  C: "bg-orange-600",
  D: "bg-red-500",
};

const gradeOrder: Grade[] = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D"];

export function StatsScreen({ stats, isLoading, onClose }: StatsScreenProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-sm text-sb-text-secondary">加载战绩统计...</p>
      </div>
    );
  }

  const hasData = stats.totalDebates > 0;

  // 计算总评分数（每局4个维度）
  const totalGrades = stats.totalDebates * 4;
  
  // 计算最高评价维度
  const getTopDimension = () => {
    if (!hasData) return "-";
    const dimensions = [
      { name: "逻辑", count: stats.gradeDistribution.S },
      { name: "证据", count: stats.gradeDistribution.S },
      { name: "感染", count: stats.gradeDistribution.S },
      { name: "反驳", count: stats.gradeDistribution.S },
    ];
    // 简化为展示获得S最多的维度（实际应该在action中统计）
    return "综合";
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sb-border bg-white px-4 py-3">
        <h1 className="font-serif text-lg font-medium">战绩统计</h1>
        <button
          onClick={onClose}
          className="rounded-button px-3 py-1.5 text-sm hover:bg-sb-bg-secondary"
        >
          返回
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-sb-text-secondary">还没有战绩数据</p>
            <p className="mt-1 text-xs text-sb-text-secondary">去完成几场辩论，查看你的统计</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 总览卡片 */}
            <section className="rounded-xl border border-sb-border bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-sb-text-secondary">总览</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-sb-text-primary">{stats.totalDebates}</p>
                  <p className="mt-1 text-xs text-sb-text-secondary">总辩论数</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getPerformanceColor(stats.avgSbIndex)}`}>
                    {stats.avgSbIndex}
                  </p>
                  <p className="mt-1 text-xs text-sb-text-secondary">平均SB指数</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getPerformanceColor(stats.bestScore)}`}>
                    {stats.bestScore}
                  </p>
                  <p className="mt-1 text-xs text-sb-text-secondary">最佳战绩</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getPerformanceColor(stats.worstScore)}`}>
                    {stats.worstScore}
                  </p>
                  <p className="mt-1 text-xs text-sb-text-secondary">最差战绩</p>
                </div>
              </div>
              
              <div className="mt-4 rounded-lg bg-sb-bg-secondary p-3 text-center">
                <p className="text-sm text-sb-text-secondary">
                  综合评价：
                  <span className={`font-medium ${getPerformanceColor(stats.avgSbIndex)}`}>
                    {getPerformanceLabel(stats.avgSbIndex)}
                  </span>
                </p>
              </div>
            </section>

            {/* 立场分布 */}
            <section className="rounded-xl border border-sb-border bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-sb-text-secondary">立场偏好</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-xs">
                    <span>正方 👍</span>
                    <span className="font-medium">{stats.stanceDistribution.for}场</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sb-bg-secondary">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{
                        width: `${(stats.stanceDistribution.for / stats.totalDebates) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-xs">
                    <span>反方 👎</span>
                    <span className="font-medium">{stats.stanceDistribution.against}场</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sb-bg-secondary">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all"
                      style={{
                        width: `${(stats.stanceDistribution.against / stats.totalDebates) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 近期趋势 */}
            {stats.recentTrend.length > 1 && (
              <section className="rounded-xl border border-sb-border bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-sb-text-secondary">近期趋势</h2>
                  <span className="text-xs text-sb-text-secondary">
                    {getTrendDescription(stats.recentTrend)}
                  </span>
                </div>
                
                {/* 趋势图表 */}
                <div className="relative h-32">
                  <div className="absolute inset-0 flex items-end justify-between gap-1">
                    {stats.recentTrend.map((score, index) => {
                      const height = Math.max(10, score); // 最小高度10%
                      return (
                        <div
                          key={index}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <div
                            className={`w-full rounded-t-sm transition-all ${
                              score <= 40
                                ? "bg-green-500"
                                : score <= 60
                                ? "bg-blue-500"
                                : score <= 80
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[10px] text-sb-text-secondary">{score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between text-xs text-sb-text-secondary">
                  <span>最近{stats.recentTrend.length}场</span>
                  <span>SB指数越低越好</span>
                </div>
              </section>
            )}

            {/* 等级分布 */}
            <section className="rounded-xl border border-sb-border bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-sb-text-secondary">等级分布</h2>
              <div className="space-y-2">
                {gradeOrder.map((grade) => {
                  const count = stats.gradeDistribution[grade];
                  const percentage = totalGrades > 0 ? (count / totalGrades) * 100 : 0;
                  return (
                    <div key={grade} className="flex items-center gap-3">
                      <span className="w-8 text-sm font-medium">{grade}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-sb-bg-secondary">
                          <div
                            className={`h-full rounded-full transition-all ${gradeColor[grade]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-12 text-right text-xs text-sb-text-secondary">
                        {count}次
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-sb-text-secondary">
                共 {totalGrades} 个维度评价 · S级 {stats.totalSGrades} 次 · A级 {stats.totalAGrades} 次
              </p>
            </section>

            {/* 战绩分布 */}
            <section className="rounded-xl border border-sb-border bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-sb-text-secondary">战绩分布</h2>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "优秀", count: stats.sbIndexDistribution.excellent, range: "0-20", color: "bg-yellow-500" },
                  { label: "良好", count: stats.sbIndexDistribution.good, range: "21-40", color: "bg-green-500" },
                  { label: "一般", count: stats.sbIndexDistribution.average, range: "41-60", color: "bg-blue-500" },
                  { label: "较差", count: stats.sbIndexDistribution.poor, range: "61-80", color: "bg-orange-500" },
                  { label: "糟糕", count: stats.sbIndexDistribution.bad, range: "81-100", color: "bg-red-500" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center rounded-lg bg-sb-bg-secondary p-3 text-center"
                  >
                    <div className={`mb-2 h-2 w-2 rounded-full ${item.color}`} />
                    <p className="text-lg font-bold">{item.count}</p>
                    <p className="text-[10px] text-sb-text-secondary">{item.label}</p>
                    <p className="text-[10px] text-sb-text-secondary">{item.range}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
