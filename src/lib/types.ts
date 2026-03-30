export type Stance = "for" | "against";

export interface Topic {
  id: string;
  title: string;
  description: string | null;
  publish_date: string;
  category: string;
}

export interface Message {
  role: "user" | "sb";
  content: string;
  round: number;
}

export type Grade = "S" | "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D";

export interface DebateScore {
  logic: Grade;
  evidence: Grade;
  emotion: Grade;
  rebuttal: Grade;
  sbIndex: number;
  roast: string;
}

export interface DebateState {
  phase: "home" | "debate" | "report" | "history";
  topic: Topic | null;
  stance: Stance | null;
  messages: Message[];
  currentRound: number;
  score: DebateScore | null;
  isLoading: boolean;
  error: string | null;
}

// 辩论历史记录
export interface DebateHistory {
  id: string;
  topic_id: string;
  topic_title: string;
  stance: Stance;
  messages: Message[];
  score_logic: Grade;
  score_evidence: Grade;
  score_emotion: Grade;
  score_rebuttal: Grade;
  sb_index: number;
  roast: string;
  created_at: string;
}
