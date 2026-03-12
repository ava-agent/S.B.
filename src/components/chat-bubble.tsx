import type { Message } from "@/lib/types";

export function ChatBubble({ message }: { message: Message }) {
  const isSb = message.role === "sb";

  return (
    <div className={`flex ${isSb ? "justify-start" : "justify-end"} mb-4`}>
      {isSb && (
        <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sb-dark text-sm">
          🧠
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-card px-4 py-3 text-[15px] leading-relaxed ${
          isSb
            ? "bg-sb-dark text-white"
            : "bg-sb-bg-secondary text-sb-text"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
