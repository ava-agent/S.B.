import type { Grade } from "./types";

export const MAX_ROUNDS = 3;

export const GRADE_VALUES: Record<Grade, number> = {
  S: 100,
  "A+": 95,
  A: 90,
  "A-": 85,
  "B+": 80,
  B: 70,
  "B-": 60,
  "C+": 50,
  C: 40,
  D: 20,
};

export const SCORE_WEIGHTS = {
  logic: 0.35,
  evidence: 0.3,
  emotion: 0.2,
  rebuttal: 0.15,
} as const;

export const SB_INDEX_TIERS = [
  { max: 20, label: "逻辑鬼才，杠不动你" },
  { max: 40, label: "思路清晰，有两把刷子" },
  { max: 60, label: "还行，但漏洞不少" },
  { max: 80, label: "建议多读点书" },
  { max: 100, label: "经典 SB 发言，建议闭嘴" },
] as const;

export const COLORS = {
  bg: "#FFFFFF",
  bgSecondary: "#F4F4F5",
  text: "#18181B",
  textSecondary: "#71717A",
  accent: "#C5F36F",
  border: "#E5E5E5",
  dark: "#18181B",
} as const;
