"use server";

import { supabase } from "@/lib/supabase";
import type { Topic } from "@/lib/types";

export interface TopicsFilter {
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * 获取话题列表，支持多种筛选条件
 * 用于浏览历史话题
 */
export async function getTopics(filter?: TopicsFilter): Promise<Topic[]> {
  let query = supabase
    .from("topics")
    .select("*")
    .order("publish_date", { ascending: false });

  // 应用分类筛选
  if (filter?.category) {
    query = query.eq("category", filter.category);
  }

  // 应用日期范围筛选
  if (filter?.startDate) {
    query = query.gte("publish_date", filter.startDate);
  }
  if (filter?.endDate) {
    query = query.lte("publish_date", filter.endDate);
  }

  // 应用数量限制
  if (filter?.limit) {
    query = query.limit(filter.limit);
  } else {
    query = query.limit(50);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch topics:", error);
    return [];
  }

  return data ?? [];
}
