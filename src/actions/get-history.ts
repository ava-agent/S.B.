"use server";

import { supabase } from "@/lib/supabase";
import type { DebateHistory } from "@/lib/types";

export async function getDebateHistory(limit: number = 10): Promise<DebateHistory[]> {
  const { data, error } = await supabase
    .from("debates")
    .select(`
      id,
      topic_id,
      topics(title),
      stance,
      messages,
      score_logic,
      score_evidence,
      score_emotion,
      score_rebuttal,
      sb_index,
      roast,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch debate history:", error);
    return [];
  }

  return (data || []).map((item: unknown) => {
    const debate = item as { 
      id: string;
      topic_id: string;
      topics: { title: string } | null;
      stance: "for" | "against";
      messages: unknown;
      score_logic: string;
      score_evidence: string;
      score_emotion: string;
      score_rebuttal: string;
      sb_index: number;
      roast: string;
      created_at: string;
    };
    return {
      id: debate.id,
      topic_id: debate.topic_id,
      topic_title: debate.topics?.title || "未知辩题",
      stance: debate.stance,
      messages: Array.isArray(debate.messages) ? debate.messages : [],
      score_logic: debate.score_logic as DebateHistory["score_logic"],
      score_evidence: debate.score_evidence as DebateHistory["score_evidence"],
      score_emotion: debate.score_emotion as DebateHistory["score_emotion"],
      score_rebuttal: debate.score_rebuttal as DebateHistory["score_rebuttal"],
      sb_index: debate.sb_index,
      roast: debate.roast,
      created_at: debate.created_at,
    };
  });
}
