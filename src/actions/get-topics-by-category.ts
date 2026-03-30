"use server";

import { supabase } from "@/lib/supabase";
import type { Topic } from "@/lib/types";

/**
 * 按分类获取话题列表
 * @param category 分类名称
 * @param limit 返回数量限制，默认 20
 */
export async function getTopicsByCategory(
  category: string,
  limit: number = 20
): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("category", category)
    .order("publish_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch topics by category:", error);
    return [];
  }

  return data ?? [];
}
