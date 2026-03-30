import { describe, it, expect } from "vitest";
import {
  getPerformanceLabel,
  getPerformanceColor,
  getTrendDescription,
} from "@/lib/scoring";

// UserStats type definition for testing
interface UserStats {
  totalDebates: number;
  avgSbIndex: number;
  bestScore: number;
  worstScore: number;
  gradeDistribution: {
    S: number;
    "A+": number;
    A: number;
    "A-": number;
    "B+": number;
    B: number;
    "B-": number;
    "C+": number;
    C: number;
    D: number;
  };
  sbIndexDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    bad: number;
  };
  stanceDistribution: {
    for: number;
    against: number;
  };
  recentTrend: number[];
  totalSGrades: number;
  totalAGrades: number;
  totalBGrades: number;
  totalCGrades: number;
  totalDGrades: number;
}

describe("getPerformanceLabel", () => {
  it("returns correct label for excellent performance", () => {
    expect(getPerformanceLabel(15)).toBe("逻辑鬼才");
    expect(getPerformanceLabel(20)).toBe("逻辑鬼才");
  });

  it("returns correct label for good performance", () => {
    expect(getPerformanceLabel(21)).toBe("思路清晰");
    expect(getPerformanceLabel(40)).toBe("思路清晰");
  });

  it("returns correct label for average performance", () => {
    expect(getPerformanceLabel(41)).toBe("表现一般");
    expect(getPerformanceLabel(60)).toBe("表现一般");
  });

  it("returns correct label for poor performance", () => {
    expect(getPerformanceLabel(61)).toBe("需要提升");
    expect(getPerformanceLabel(80)).toBe("需要提升");
  });

  it("returns correct label for bad performance", () => {
    expect(getPerformanceLabel(81)).toBe("建议闭嘴");
    expect(getPerformanceLabel(100)).toBe("建议闭嘴");
  });
});

describe("getPerformanceColor", () => {
  it("returns yellow for excellent performance", () => {
    expect(getPerformanceColor(15)).toBe("text-yellow-500");
    expect(getPerformanceColor(20)).toBe("text-yellow-500");
  });

  it("returns green for good performance", () => {
    expect(getPerformanceColor(21)).toBe("text-green-500");
    expect(getPerformanceColor(40)).toBe("text-green-500");
  });

  it("returns blue for average performance", () => {
    expect(getPerformanceColor(41)).toBe("text-blue-500");
    expect(getPerformanceColor(60)).toBe("text-blue-500");
  });

  it("returns orange for poor performance", () => {
    expect(getPerformanceColor(61)).toBe("text-orange-500");
    expect(getPerformanceColor(80)).toBe("text-orange-500");
  });

  it("returns red for bad performance", () => {
    expect(getPerformanceColor(81)).toBe("text-red-500");
    expect(getPerformanceColor(100)).toBe("text-red-500");
  });
});

describe("getTrendDescription", () => {
  it("returns '数据不足' for single data point", () => {
    expect(getTrendDescription([50])).toBe("数据不足");
  });

  it("returns '显著进步' when score decreased by more than 10", () => {
    expect(getTrendDescription([60, 50, 40])).toBe("显著进步");
    expect(getTrendDescription([80, 65, 50])).toBe("显著进步");
  });

  it("returns '略有进步' when score decreased by 5-10", () => {
    expect(getTrendDescription([60, 55, 50])).toBe("略有进步");
    expect(getTrendDescription([50, 44])).toBe("略有进步"); // 变化6
  });

  it("returns '明显退步' when score increased by more than 10", () => {
    expect(getTrendDescription([40, 50, 60])).toBe("明显退步");
    expect(getTrendDescription([50, 70])).toBe("明显退步");
  });

  it("returns '略有退步' when score increased by 5-10", () => {
    expect(getTrendDescription([50, 55, 60])).toBe("略有退步");
    expect(getTrendDescription([50, 58])).toBe("略有退步");
  });

  it("returns '保持稳定' when score changed by less than 5", () => {
    expect(getTrendDescription([50, 52, 51])).toBe("保持稳定");
    expect(getTrendDescription([50, 53])).toBe("保持稳定");
    expect(getTrendDescription([50, 48])).toBe("保持稳定");
  });
});

describe("UserStats type", () => {
  it("can create valid UserStats object", () => {
    const stats: UserStats = {
      totalDebates: 10,
      avgSbIndex: 45,
      bestScore: 15,
      worstScore: 85,
      gradeDistribution: {
        S: 2,
        "A+": 3,
        A: 4,
        "A-": 5,
        "B+": 6,
        B: 7,
        "B-": 4,
        "C+": 3,
        C: 2,
        D: 1,
      },
      sbIndexDistribution: {
        excellent: 2,
        good: 3,
        average: 4,
        poor: 1,
        bad: 0,
      },
      stanceDistribution: {
        for: 6,
        against: 4,
      },
      recentTrend: [60, 55, 50, 45, 40],
      totalSGrades: 8,
      totalAGrades: 20,
      totalBGrades: 15,
      totalCGrades: 10,
      totalDGrades: 2,
    };

    expect(stats.totalDebates).toBe(10);
    expect(stats.avgSbIndex).toBe(45);
    expect(stats.stanceDistribution.for).toBe(6);
    expect(stats.stanceDistribution.against).toBe(4);
  });
});
