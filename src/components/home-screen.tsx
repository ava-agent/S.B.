import type { Topic, Stance } from "@/lib/types";

interface HomeScreenProps {
  topic: Topic;
  onSelectStance: (stance: Stance) => void;
}

export function HomeScreen({ topic, onSelectStance }: HomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="font-serif text-3xl tracking-tight">S.B.</h1>
        <p className="mt-1 text-sm text-sb-text-secondary">Smart Brain</p>

        <div className="mt-16">
          <p className="text-sm text-sb-text-secondary">今日辩题</p>
          <h2 className="mt-3 font-serif text-2xl leading-snug">
            「{topic.title}」
          </h2>
          {topic.description && (
            <p className="mt-3 text-sm leading-relaxed text-sb-text-secondary">
              {topic.description}
            </p>
          )}
        </div>

        <div className="mt-12 flex gap-4">
          <button
            onClick={() => onSelectStance("for")}
            className="flex-1 rounded-button border border-sb-border bg-white px-6 py-3 text-sm font-medium transition-colors duration-150 hover:bg-sb-bg-secondary"
          >
            正方 👍
          </button>
          <button
            onClick={() => onSelectStance("against")}
            className="flex-1 rounded-button border border-sb-border bg-white px-6 py-3 text-sm font-medium transition-colors duration-150 hover:bg-sb-bg-secondary"
          >
            反方 👎
          </button>
        </div>

        <p className="mt-6 text-xs text-sb-text-secondary">
          选个立场，来和 S.B. 杠一杠
        </p>
      </div>
    </div>
  );
}
