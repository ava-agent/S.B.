"use server";

import { buildScoringPrompt } from "@/lib/prompts";
import { ARK_CHAT_MODEL, createArkClient, parseJsonFromModel } from "@/lib/ark";
import { calculateSbIndex } from "@/lib/scoring";
import type { Message, Stance, DebateScore, Grade } from "@/lib/types";

const VALID_GRADES: Grade[] = [
  "S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D",
];

function isValidGrade(g: string): g is Grade {
  return VALID_GRADES.includes(g as Grade);
}

export async function generateScore(
  topic: string,
  stance: Stance,
  messages: Message[]
): Promise<DebateScore> {
  const prompt = buildScoringPrompt(topic, stance, messages);

  const response = await createArkClient().chat.completions.create({
    model: ARK_CHAT_MODEL,
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content: "严格输出合法 JSON，不要使用 markdown，不要解释。",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  const parsed = parseJsonFromModel(text) as Record<string, string>;

  const logic: Grade = isValidGrade(parsed.logic) ? parsed.logic : "C";
  const evidence: Grade = isValidGrade(parsed.evidence) ? parsed.evidence : "C";
  const emotion: Grade = isValidGrade(parsed.emotion) ? parsed.emotion : "C";
  const rebuttal: Grade = isValidGrade(parsed.rebuttal) ? parsed.rebuttal : "C";

  return {
    logic,
    evidence,
    emotion,
    rebuttal,
    sbIndex: calculateSbIndex(logic, evidence, emotion, rebuttal),
    roast: parsed.roast || "没什么好说的",
  };
}
