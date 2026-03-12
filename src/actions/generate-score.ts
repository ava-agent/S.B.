"use server";

import Anthropic from "@anthropic-ai/sdk";
import { buildScoringPrompt } from "@/lib/prompts";
import { calculateSbIndex } from "@/lib/scoring";
import type { Message, Stance, DebateScore, Grade } from "@/lib/types";

const client = new Anthropic();

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

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as { type: "text"; text: string }).text;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse scoring response");

  const parsed = JSON.parse(jsonMatch[0]);

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
