"use server";

import OpenAI from "openai";
import { buildDebateSystemPrompt } from "@/lib/prompts";
import type { Message, Stance } from "@/lib/types";

const client = new OpenAI({
  apiKey: process.env.GLM_API_KEY,
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
});

const MODEL = "glm-4-flash";

export async function getDebateReply(
  topic: string,
  stance: Stance,
  round: number,
  messages: Message[]
): Promise<string> {
  const systemPrompt = buildDebateSystemPrompt(topic, stance, round);

  const TRIGGER_MESSAGE: OpenAI.ChatCompletionUserMessageParam = {
    role: "user",
    content: "辩论开始。请你先发言，挑衅式地抛出你的核心论点。",
  };

  // If round 1 and no messages yet, S.B. starts first
  if (round === 1 && messages.length === 0) {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        TRIGGER_MESSAGE,
      ],
    });

    return response.choices[0].message.content ?? "";
  }

  // For rounds 2+, prepend the synthetic trigger message so the conversation
  // starts with a "user" role, then alternate properly.
  const apiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    TRIGGER_MESSAGE,
    ...messages.map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: apiMessages,
  });

  return response.choices[0].message.content ?? "";
}
