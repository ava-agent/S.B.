"use server";

import Anthropic from "@anthropic-ai/sdk";
import { buildDebateSystemPrompt } from "@/lib/prompts";
import type { Message, Stance } from "@/lib/types";

const client = new Anthropic();

export async function getDebateReply(
  topic: string,
  stance: Stance,
  round: number,
  messages: Message[]
): Promise<string> {
  const systemPrompt = buildDebateSystemPrompt(topic, stance, round);

  const apiMessages = messages.map((m) => ({
    role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  // If round 1 and no messages yet, S.B. starts first
  if (round === 1 && apiMessages.length === 0) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "辩论开始。请你先发言，挑衅式地抛出你的核心论点。",
        },
      ],
    });

    return (response.content[0] as { type: "text"; text: string }).text;
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: apiMessages,
  });

  return (response.content[0] as { type: "text"; text: string }).text;
}
