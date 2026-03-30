"use server";

import { supabase } from "@/lib/supabase";
import type { Grade, Stance } from "@/lib/types";

// 用户统计数据
export interface UserStats {
  // 基础统计
  totalDebates: number; // 总辩论数
  avgSbIndex: number; // 平均SB指数
  bestScore: number; // 最佳战绩（最低SB指数）
  worstScore: number; // 最差战绩（最高SB指数）
  
  // 等级分布
  gradeDistribution: Record<Grade, number>; // 各等级出现次数
  sbIndexDistribution: {
    excellent: number; // 0-20: 优秀
    good: number; // 21-40: 良好
    average: number; // 41-60: 一般
    poor: number; // 61-80: 较差
    bad: number; // 81-100: 糟糕
  };
  
  // 立场统计
  stanceDistribution: {
    for: number; // 正方次数
    against: number; // 反方次数
  };
  
  // 近期趋势（最近10场的SB指数）
  recentTrend: number[];
  
  // 最高评级统计
  totalSGrades: number; // S级总次数
  totalAGrades: number; // A/A+/A- 总次数
  totalBGrades: number; // B/B+/B- 总次数
  totalCGrades: number; // C+/C 总次数
  totalDGrades: number; // D 级次数
}

// 从数据库获取的原始数据类型
interface RawDebateData {
  id: string;
  stance: Stance;
  score_logic: Grade;
  score_evidence: Grade;
  score_emotion: Grade;
  score_rebuttal: Grade;
  sb_index: number;
  created_at: string;
}

export async function getUserStats(): Promise<UserStats> {
  const { data, error } = await supabase
    .from("debates")
    .select("id, stance, score_logic, score_evidence, score_emotion, score_rebuttal, sb_index, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user stats:", error);
    return getEmptyStats();
  }

  const debates = (data || []) as RawDebateData[];
  
  if (debates.length === 0) {
    return getEmptyStats();
  }

  // 计算基础统计
  const sbIndices = debates.map((d) => d.sb_index);
  const totalDebates = debates.length;
  const avgSbIndex = Math.round(sbIndices.reduce((a, b) => a + b, 0) / totalDebates);
  const bestScore = Math.min(...sbIndices);
  const worstScore = Math.max(...sbIndices);

  // 计算等级分布
  const gradeDistribution: Record<Grade, number> = {
    S: 0, "A+": 0, A: 0, "A-": 0, "B+": 0, B: 0, "B-": 0, "C+": 0, C: 0, D: 0,
  };
  
  let totalSGrades = 0;
  let totalAGrades = 0;
  let totalBGrades = 0;
  let totalCGrades = 0;
  let totalDGrades = 0;

  // 计算SB指数分布
  const sbIndexDistribution = {
    excellent: 0, // 0-20
    good: 0, // 21-40
    average: 0, // 41-60
    poor: 0, // 61-80
    bad: 0, // 81-100
  };

  debates.forEach((debate) => {
    // 统计各等级
    gradeDistribution[debate.score_logic]++;
    gradeDistribution[debate.score_evidence]++;
    gradeDistribution[debate.score_emotion]++;
    gradeDistribution[debate.score_rebuttal]++;

    // 统计S级
    if (debate.score_logic === "S") totalSGrades++;
    if (debate.score_evidence === "S") totalSGrades++;
    if (debate.score_emotion === "S") totalSGrades++;
    if (debate.score_rebuttal === "S") totalSGrades++;

    // 统计A级
    if (["A+", "A", "A-"].includes(debate.score_logic)) totalAGrades++;
    if (["A+", "A", "A-"].includes(debate.score_evidence)) totalAGrades++;
    if (["A+", "A", "A-"].includes(debate.score_emotion)) totalAGrades++;
    if (["A+", "A", "A-"].includes(debate.score_rebuttal)) totalAGrades++;

    // 统计B级
    if (["B+", "B", "B-"].includes(debate.score_logic)) totalBGrades++;
    if (["B+", "B", "B-"].includes(debate.score_evidence)) totalBGrades++;
    if (["B+", "B", "B-"].includes(debate.score_emotion)) totalBGrades++;
    if (["B+", "B", "B-"].includes(debate.score_rebuttal)) totalBGrades++;

    // 统计C级
    if (["C+", "C"].includes(debate.score_logic)) totalCGrades++;
    if (["C+", "C"].includes(debate.score_evidence)) totalCGrades++;
    if (["C+", "C"].includes(debate.score_emotion)) totalCGrades++;
    if (["C+", "C"].includes(debate.score_rebuttal)) totalCGrades++;

    // 统计D级
    if (debate.score_logic === "D") totalDGrades++;
    if (debate.score_evidence === "D") totalDGrades++;
    if (debate.score_emotion === "D") totalDGrades++;
    if (debate.score_rebuttal === "D") totalDGrades++;

    // 统计SB指数分布
    if (debate.sb_index <= 20) sbIndexDistribution.excellent++;
    else if (debate.sb_index <= 40) sbIndexDistribution.good++;
    else if (debate.sb_index <= 60) sbIndexDistribution.average++;
    else if (debate.sb_index <= 80) sbIndexDistribution.poor++;
    else sbIndexDistribution.bad++;
  });

  // 计算立场分布
  const stanceDistribution = {
    for: debates.filter((d) => d.stance === "for").length,
    against: debates.filter((d) => d.stance === "against").length,
  };

  // 获取最近趋势（最近10场的SB指数，按时间升序）
  const recentTrend = debates
    .slice(0, 10)
    .reverse()
    .map((d) => d.sb_index);

  return {
    totalDebates,
    avgSbIndex,
    bestScore,
    worstScore,
    gradeDistribution,
    sbIndexDistribution,
    stanceDistribution,
    recentTrend,
    totalSGrades,
    totalAGrades,
    totalBGrades,
    totalCGrades,
    totalDGrades,
  };
}

function getEmptyStats(): UserStats {
  return {
    totalDebates: 0,
    avgSbIndex: 0,
    bestScore: 0,
    worstScore: 0,
    gradeDistribution: {
      S: 0, "A+": 0, A: 0, "A-": 0, "B+": 0, B: 0, "B-": 0, "C+": 0, C: 0, D: 0,
    },
    sbIndexDistribution: {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      bad: 0,
    },
    stanceDistribution: {
      for: 0,
      against: 0,
    },
    recentTrend: [],
    totalSGrades: 0,
    totalAGrades: 0,
    totalBGrades: 0,
    totalCGrades: 0,
    totalDGrades: 0,
  };
}
