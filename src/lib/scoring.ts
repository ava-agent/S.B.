import type { Grade } from "./types";
import { GRADE_VALUES, SCORE_WEIGHTS, SB_INDEX_TIERS } from "./constants";

export function gradeToNumber(grade: Grade): number {
  return GRADE_VALUES[grade];
}

export function calculateSbIndex(
  logic: Grade,
  evidence: Grade,
  emotion: Grade,
  rebuttal: Grade
): number {
  const weighted =
    gradeToNumber(logic) * SCORE_WEIGHTS.logic +
    gradeToNumber(evidence) * SCORE_WEIGHTS.evidence +
    gradeToNumber(emotion) * SCORE_WEIGHTS.emotion +
    gradeToNumber(rebuttal) * SCORE_WEIGHTS.rebuttal;

  return Math.round(100 - weighted);
}

export function getSbTierLabel(sbIndex: number): string {
  for (const tier of SB_INDEX_TIERS) {
    if (sbIndex <= tier.max) return tier.label;
  }
  return SB_INDEX_TIERS[SB_INDEX_TIERS.length - 1].label;
}

// 获取评级标签（基于平均SB指数）
export function getPerformanceLabel(sbIndex: number): string {
  if (sbIndex <= 20) return "逻辑鬼才";
  if (sbIndex <= 40) return "思路清晰";
  if (sbIndex <= 60) return "表现一般";
  if (sbIndex <= 80) return "需要提升";
  return "建议闭嘴";
}

// 获取评级颜色
export function getPerformanceColor(sbIndex: number): string {
  if (sbIndex <= 20) return "text-yellow-500";
  if (sbIndex <= 40) return "text-green-500";
  if (sbIndex <= 60) return "text-blue-500";
  if (sbIndex <= 80) return "text-orange-500";
  return "text-red-500";
}

// 获取趋势描述
export function getTrendDescription(trend: number[]): string {
  if (trend.length < 2) return "数据不足";
  
  const first = trend[0];
  const last = trend[trend.length - 1];
  const diff = last - first;
  
  if (diff < -10) return "显著进步";
  if (diff < -5) return "略有进步";
  if (diff > 10) return "明显退步";
  if (diff > 5) return "略有退步";
  return "保持稳定";
}
