import type { DebateScore } from "@/lib/types";
import { getSbTierLabel } from "@/lib/scoring";

interface ReportScreenProps {
  topicTitle: string;
  stance: string;
  score: DebateScore;
  isGeneratingCard: boolean;
  onSaveCard: () => void;
  onPlayAgain: () => void;
}

const DIMENSION_LABELS = {
  logic: "逻辑严密度",
  evidence: "论据质量",
  emotion: "情绪控制",
  rebuttal: "反驳能力",
} as const;

export function ReportScreen({
  topicTitle,
  stance,
  score,
  isGeneratingCard,
  onSaveCard,
  onPlayAgain,
}: ReportScreenProps) {
  const stanceLabel = stance === "for" ? "正方" : "反方";
  const tierLabel = getSbTierLabel(score.sbIndex);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <h2 className="text-center font-serif text-2xl">辩论结束</h2>

        <div className="mt-2 text-center text-sm text-sb-text-secondary">
          {topicTitle} · {stanceLabel}
        </div>

        {/* Score cards */}
        <div className="mt-10 grid grid-cols-2 gap-3">
          {(["logic", "evidence", "emotion", "rebuttal"] as const).map(
            (key) => (
              <div
                key={key}
                className="rounded-card border border-sb-border bg-sb-bg-secondary p-4 text-center shadow-card"
              >
                <p className="text-xs text-sb-text-secondary">
                  {DIMENSION_LABELS[key]}
                </p>
                <p className="mt-2 font-mono text-2xl font-medium">
                  {score[key]}
                </p>
              </div>
            )
          )}
        </div>

        {/* SB Index */}
        <div className="mt-8 rounded-card border border-sb-border p-6 shadow-card">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">SB 指数</p>
            <p className="font-mono text-3xl font-medium">{score.sbIndex}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sb-bg-secondary">
            <div
              className="h-full rounded-full bg-sb-accent transition-all duration-500"
              style={{ width: `${100 - score.sbIndex}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-sb-text-secondary">{tierLabel}</p>
        </div>

        {/* Roast */}
        <div className="mt-6 rounded-card border border-sb-border p-6 shadow-card">
          <p className="text-xs text-sb-text-secondary">S.B. 说：</p>
          <p className="mt-2 font-serif text-lg italic leading-relaxed">
            「{score.roast}」
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex gap-3">
          <button
            onClick={onSaveCard}
            disabled={isGeneratingCard}
            className="flex-1 rounded-button bg-sb-accent px-6 py-3 text-sm font-medium text-sb-dark transition-colors duration-150 hover:brightness-95 disabled:opacity-50"
          >
            {isGeneratingCard ? "生成中..." : "保存卡片"}
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-button border border-sb-border bg-white px-6 py-3 text-sm font-medium transition-colors duration-150 hover:bg-sb-bg-secondary"
          >
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}
