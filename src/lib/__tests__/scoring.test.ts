import { describe, it, expect } from "vitest";
import { gradeToNumber, calculateSbIndex, getSbTierLabel } from "../scoring";

describe("gradeToNumber", () => {
  it("returns 100 for S grade", () => {
    expect(gradeToNumber("S")).toBe(100);
  });

  it("returns 70 for B grade", () => {
    expect(gradeToNumber("B")).toBe(70);
  });

  it("returns 20 for D grade", () => {
    expect(gradeToNumber("D")).toBe(20);
  });
});

describe("calculateSbIndex", () => {
  it("returns 0 for all S grades (perfect score)", () => {
    expect(calculateSbIndex("S", "S", "S", "S")).toBe(0);
  });

  it("returns 80 for all D grades", () => {
    expect(calculateSbIndex("D", "D", "D", "D")).toBe(80);
  });

  it("calculates weighted score correctly", () => {
    // logic=A(90)*0.35 + evidence=B(70)*0.3 + emotion=C(40)*0.2 + rebuttal=A+(95)*0.15
    // = 31.5 + 21 + 8 + 14.25 = 74.75 → round to 75
    // sbIndex = 100 - 75 = 25
    expect(calculateSbIndex("A", "B", "C", "A+")).toBe(25);
  });
});

describe("getSbTierLabel", () => {
  it("returns tier label for low SB index", () => {
    expect(getSbTierLabel(15)).toBe("逻辑鬼才，杠不动你");
  });

  it("returns tier label for high SB index", () => {
    expect(getSbTierLabel(85)).toBe("经典 SB 发言，建议闭嘴");
  });

  it("returns tier label for mid SB index", () => {
    expect(getSbTierLabel(50)).toBe("还行，但漏洞不少");
  });
});
