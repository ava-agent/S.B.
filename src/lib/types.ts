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
  phase: "home" | "debate" | "report";
  topic: Topic | null;
  stance: Stance | null;
  messages: Message[];
  currentRound: number;
  score: DebateScore | null;
  isLoading: boolean;
  error: string | null;
}
