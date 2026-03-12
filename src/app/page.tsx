"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DebateState, Stance, Message } from "@/lib/types";
import { MAX_ROUNDS } from "@/lib/constants";
import { HomeScreen } from "@/components/home-screen";
import { DebateScreen } from "@/components/debate-screen";
import { ReportScreen } from "@/components/report-screen";
import { getTodayTopic } from "@/actions/get-topic";
import { getDebateReply } from "@/actions/debate-reply";
import { generateScore } from "@/actions/generate-score";
import { saveDebate } from "@/actions/save-debate";

const INITIAL_STATE: DebateState = {
  phase: "home",
  topic: null,
  stance: null,
  messages: [],
  currentRound: 1,
  score: null,
  isLoading: true,
  error: null,
};

export default function Home() {
  const [state, setState] = useState<DebateState>(INITIAL_STATE);
  // Use ref to avoid stale closures in async callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    getTodayTopic()
      .then((topic) => setState((s) => ({ ...s, topic, isLoading: false })))
      .catch(() =>
        setState((s) => ({ ...s, isLoading: false, error: "加载辩题失败，请刷新重试" }))
      );
  }, []);

  const handleSelectStance = useCallback(async (stance: Stance) => {
    const { topic } = stateRef.current;
    if (!topic) return;

    setState((s) => ({
      ...s,
      phase: "debate",
      stance,
      messages: [],
      currentRound: 1,
      isLoading: true,
      error: null,
    }));

    try {
      const reply = await getDebateReply(topic.title, stance, 1, []);
      const sbMsg: Message = { role: "sb", content: reply, round: 1 };
      setState((s) => ({ ...s, messages: [sbMsg], isLoading: false }));
    } catch {
      setState((s) => ({ ...s, isLoading: false, error: "S.B. 暂时杠不动了，请重试" }));
    }
  }, []);

  // Debate flow:
  //   Round 1: S.B. speaks → user replies
  //   Round 2: S.B. speaks → user replies
  //   Round 3: S.B. speaks → user replies → scoring
  //
  // When user sends in round N:
  //   if N < MAX_ROUNDS: get S.B. reply for round N+1, advance round
  //   if N === MAX_ROUNDS: go to scoring
  const handleSendMessage = useCallback(async (content: string) => {
    const { topic, stance, messages, currentRound } = stateRef.current;
    if (!topic || !stance) return;

    const userMsg: Message = { role: "user", content, round: currentRound };
    const updatedMessages = [...messages, userMsg];

    setState((s) => ({ ...s, messages: updatedMessages, isLoading: true, error: null }));

    try {
      if (currentRound >= MAX_ROUNDS) {
        // Final round complete — generate score
        const score = await generateScore(topic.title, stance, updatedMessages);
        // Save in background, don't block UI
        saveDebate(topic.id, stance, updatedMessages, score).catch(() => {});
        setState((s) => ({ ...s, phase: "report", score, isLoading: false }));
      } else {
        // Get S.B.'s next round reply
        const nextRound = currentRound + 1;
        const reply = await getDebateReply(topic.title, stance, nextRound, updatedMessages);
        const sbMsg: Message = { role: "sb", content: reply, round: nextRound };
        setState((s) => ({
          ...s,
          messages: [...updatedMessages, sbMsg],
          currentRound: nextRound,
          isLoading: false,
        }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false, error: "出了点问题，请重试" }));
    }
  }, []);

  const handleSaveCard = useCallback(async () => {
    const { score, topic, stance } = stateRef.current;
    if (!score || !topic || !stance) return;

    setState((s) => ({ ...s, isLoading: true }));

    try {
      const params = new URLSearchParams({
        topic: topic.title,
        stance,
        logic: score.logic,
        evidence: score.evidence,
        emotion: score.emotion,
        rebuttal: score.rebuttal,
        sbIndex: String(score.sbIndex),
        roast: score.roast,
      });

      const res = await fetch(`/api/og?${params.toString()}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `sb-score-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Card generation failed silently
    }

    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  const handlePlayAgain = useCallback(() => {
    setState((s) => ({
      ...INITIAL_STATE,
      topic: s.topic,
      isLoading: false,
    }));
  }, []);

  // Error display
  if (state.error && state.phase === "home") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{state.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-button border border-sb-border px-4 py-2 text-sm hover:bg-sb-bg-secondary"
        >
          刷新重试
        </button>
      </main>
    );
  }

  // Loading state
  if (state.isLoading && state.phase === "home") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-sb-text-secondary">加载中...</p>
      </main>
    );
  }

  // No topic found
  if (!state.topic) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-sb-text-secondary">今天没有辩题，明天再来</p>
      </main>
    );
  }

  switch (state.phase) {
    case "home":
      return <HomeScreen topic={state.topic} onSelectStance={handleSelectStance} />;

    case "debate":
      return (
        <DebateScreen
          topicTitle={state.topic.title}
          currentRound={state.currentRound}
          messages={state.messages}
          isLoading={state.isLoading}
          isFinished={false}
          onSendMessage={handleSendMessage}
          error={state.error}
        />
      );

    case "report":
      return state.score ? (
        <ReportScreen
          topicTitle={state.topic.title}
          stance={state.stance!}
          score={state.score}
          isGeneratingCard={state.isLoading}
          onSaveCard={handleSaveCard}
          onPlayAgain={handlePlayAgain}
        />
      ) : null;
  }
}
