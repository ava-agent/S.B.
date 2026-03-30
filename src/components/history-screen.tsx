"use client";

import type { DebateHistory, Grade } from "@/lib/types";
import { useState } from "react";

interface HistoryScreenProps {
  history: DebateHistory[];
  isLoading: boolean;
  onClose: () => void;
  onViewDetail: (debate: DebateHistory) => void;
}

const gradeColor: Record<Grade, string> = {
  S: "text-yellow-500",
  "A+": "text-green-500",
  A: "text-green-600",
  "A-": "text-green-700",
  "B+": "text-blue-500",
  B: "text-blue-600",
  "B-": "text-blue-700",
  "C+": "text-orange-500",
  C: "text-orange-600",
  D: "text-red-500",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryScreen({ history, isLoading, onClose, onViewDetail }: HistoryScreenProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-sm text-sb-text-secondary">加载历史记录...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sb-border bg-white px-4 py-3">
        <h1 className="font-serif text-lg font-medium">辩论历史</h1>
        <button
          onClick={onClose}
          className="rounded-button px-3 py-1.5 text-sm hover:bg-sb-bg-secondary"
        >
          返回
        </button>
      </header>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-sb-text-secondary">还没有辩论记录</p>
            <p className="mt-1 text-xs text-sb-text-secondary">去完成一场辩论吧</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((debate) => (
              <div
                key={debate.id}
                className="rounded-lg border border-sb-border bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sb-text-primary">{debate.topic_title}</p>
                    <p className="mt-1 text-xs text-sb-text-secondary">
                      {formatDate(debate.created_at)} · {debate.stance === "for" ? "正方" : "反方"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${gradeColor[debate.score_logic]}`}>
                      {debate.sb_index}
                    </p>
                    <p className="text-xs text-sb-text-secondary">SB指数</p>
                  </div>
                </div>

                {/* Grades */}
                <div className="mt-3 flex gap-4 text-xs">
                  <span className={gradeColor[debate.score_logic]}>逻辑 {debate.score_logic}</span>
                  <span className={gradeColor[debate.score_evidence]}>证据 {debate.score_evidence}</span>
                  <span className={gradeColor[debate.score_emotion]}>感染 {debate.score_emotion}</span>
                  <span className={gradeColor[debate.score_rebuttal]}>反驳 {debate.score_rebuttal}</span>
                </div>

                {/* Roast */}
                <p className="mt-2 text-xs italic text-sb-text-secondary">"{debate.roast}"</p>

                {/* View Detail Button */}
                <button
                  onClick={() => onViewDetail(debate)}
                  className="mt-3 w-full rounded-button border border-sb-border py-2 text-xs hover:bg-sb-bg-secondary"
                >
                  查看详情
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
