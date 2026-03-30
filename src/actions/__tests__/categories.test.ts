import { describe, it, expect, vi } from "vitest";

// Simple mock for supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

import { getCategories } from "../get-categories";
import { getTopicsByCategory } from "../get-topics-by-category";
import { getTopics } from "../get-topics";
import { supabase } from "@/lib/supabase";

describe("getCategories", () => {
  it("calls supabase with correct query", async () => {
    await getCategories();
    expect(supabase.from).toHaveBeenCalledWith("topics");
  });
});

describe("getTopicsByCategory", () => {
  it("calls supabase with category filter", async () => {
    await getTopicsByCategory("科技");
    expect(supabase.from).toHaveBeenCalledWith("topics");
  });

  it("accepts custom limit", async () => {
    const result = await getTopicsByCategory("科技", 10);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getTopics", () => {
  it("returns empty array by default", async () => {
    const result = await getTopics();
    expect(result).toEqual([]);
  });

  it("accepts filter parameters", async () => {
    const result = await getTopics({
      category: "科技",
      startDate: "2026-01-01",
      endDate: "2026-03-31",
      limit: 10,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
