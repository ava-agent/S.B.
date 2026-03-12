"use client";

import { useRef, useEffect, useState } from "react";
import type { Message } from "@/lib/types";
import { MAX_ROUNDS } from "@/lib/constants";
import { ChatBubble } from "./chat-bubble";

interface DebateScreenProps {
  topicTitle: string;
  currentRound: number;
  messages: Message[];
  isLoading: boolean;
  isFinished: boolean;
  onSendMessage: (content: string) => void;
  error?: string | null;
}

export function DebateScreen({
  topicTitle,
  currentRound,
  messages,
  isLoading,
  isFinished,
  onSendMessage,
  error,
}: DebateScreenProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || isFinished) return;
    onSendMessage(trimmed);
    setInput("");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-sb-border bg-white/80 px-6 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <p className="truncate text-sm font-medium">{topicTitle}</p>
          <p className="shrink-0 text-sm text-sb-text-secondary">
            {currentRound}/{MAX_ROUNDS}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-lg">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sb-dark text-sm">
                🧠
              </div>
              <div className="rounded-card bg-sb-dark px-4 py-3 text-white text-sm">
                S.B. 正在组织语言杠你...
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-card bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {!isFinished && (
        <div className="sticky bottom-0 border-t border-sb-border bg-white px-6 py-4">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-lg gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的论点..."
              disabled={isLoading}
              className="flex-1 rounded-button border border-sb-border bg-sb-bg-secondary px-4 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-sb-text-secondary focus:border-sb-text-secondary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-button bg-sb-dark px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-sb-text-secondary disabled:opacity-50"
            >
              发送
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
