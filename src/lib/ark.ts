import OpenAI from "openai";

const DEFAULT_ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding/v3";
const DEFAULT_ARK_MODEL = "doubao-seed-2-0-code-preview-260215";

export const ARK_CHAT_MODEL =
  process.env.ARK_CHAT_MODEL ?? DEFAULT_ARK_MODEL;

export function createArkClient() {
  const apiKey = process.env.ARK_API_KEY;

  if (!apiKey) {
    throw new Error("ARK_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.ARK_BASE_URL ?? DEFAULT_ARK_BASE_URL,
  });
}

export function parseJsonFromModel(content: string): unknown {
  const normalized = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(normalized);
  } catch {
    const match = normalized.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model response did not include JSON");
    }
    return JSON.parse(match[0]);
  }
}
