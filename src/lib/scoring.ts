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
