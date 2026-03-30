"use server";

import { supabase } from "@/lib/supabase";

/**
 * 获取所有可用的话题分类
 * 从 topics 表中提取唯一的 category 值
 */
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("category")
    .not("category", "is", null);

  if (error || !data) {
    console.error("Failed to fetch categories:", error);
    return [];
  }

  // 提取唯一的分类值并排序
  const categories = [...new Set(data.map((item) => item.category).filter(Boolean))];
  return categories.sort();
}
