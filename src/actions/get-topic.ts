"use server";

import { supabase } from "@/lib/supabase";
import type { Topic } from "@/lib/types";

export async function getTodayTopic(): Promise<Topic | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("publish_date", today)
    .single();

  if (error || !data) {
    // Fallback: get the most recent topic that's not in the future
    const { data: fallback } = await supabase
      .from("topics")
      .select("*")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .single();

    return fallback ?? null;
  }

  return data;
}
