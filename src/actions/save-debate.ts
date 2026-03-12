"use server";

import { supabase } from "@/lib/supabase";
import type { Message, Stance, DebateScore } from "@/lib/types";

export async function saveDebate(
  topicId: string,
  stance: Stance,
  messages: Message[],
  score: DebateScore
): Promise<void> {
  await supabase.from("debates").insert({
    topic_id: topicId,
    stance,
    messages,
    score_logic: score.logic,
    score_evidence: score.evidence,
    score_emotion: score.emotion,
    score_rebuttal: score.rebuttal,
    sb_index: score.sbIndex,
    roast: score.roast,
  });
}
