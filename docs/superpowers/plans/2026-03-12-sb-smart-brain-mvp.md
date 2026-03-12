# S.B. Smart Brain MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily AI debate web app where users argue against a trash-talking AI and get scored.

**Architecture:** Next.js App Router single-page app with three states (home → debate → report). Claude API for debate/scoring via Server Actions. Supabase for topic storage and debate logging. Satori for share card image generation.

**Tech Stack:** Next.js 15, TailwindCSS 4, TypeScript, Claude API (@anthropic-ai/sdk), Supabase (@supabase/supabase-js), Satori (@vercel/og), Vercel

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, global styles
│   ├── page.tsx                # Main page: state machine (home/debate/report)
│   ├── globals.css             # Tailwind imports + custom CSS variables
│   └── api/
│       └── og/route.tsx        # Share card image generation endpoint
├── components/
│   ├── home-screen.tsx         # Today's topic + stance selection buttons
│   ├── debate-screen.tsx       # Chat UI + input + round tracking
│   ├── report-screen.tsx       # Score display + roast + share actions
│   └── chat-bubble.tsx         # Message bubble (user variant / sb variant)
├── lib/
│   ├── types.ts                # All TypeScript types/interfaces
│   ├── supabase.ts             # Supabase server client (service role)
│   ├── prompts.ts              # System prompts for debate + scoring
│   ├── scoring.ts              # Grade string ↔ number conversion, SB index calc
│   └── constants.ts            # Colors, grade labels, SB index tiers
├── actions/
│   ├── get-topic.ts            # Server action: fetch today's topic from Supabase
│   ├── debate-reply.ts         # Server action: send messages to Claude, get S.B. reply
│   ├── generate-score.ts       # Server action: send full debate to Claude for scoring
│   └── save-debate.ts          # Server action: write debate record to Supabase
supabase/
├── migrations/
│   └── 001_init.sql            # Create topics + debates tables
└── seed.sql                    # 30 initial debate topics
.env.local.example              # Environment variable template
next.config.ts                  # Next.js config
```

---

## Chunk 1: Project Foundation

### Task 1: Scaffold Next.js project and install dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.env.local.example`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/kevinten/projects/sb
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js @vercel/og
```

- [ ] **Step 3: Create environment variable template**

Create `.env.local.example`:
```env
ANTHROPIC_API_KEY=sk-ant-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 4: Delete `tailwind.config.ts`**

TailwindCSS v4 uses CSS-based config only. Remove the JS config file that `create-next-app` may generate:
```bash
rm -f tailwind.config.ts tailwind.config.js
```

- [ ] **Step 5: Set up globals.css with design tokens**

Update `src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-sb-bg: #FFFFFF;
  --color-sb-bg-secondary: #F4F4F5;
  --color-sb-text: #18181B;
  --color-sb-text-secondary: #71717A;
  --color-sb-accent: #C5F36F;
  --color-sb-border: #E5E5E5;
  --color-sb-dark: #18181B;

  --font-serif: "Instrument Serif", serif;
  --font-sans: "Geist Sans", sans-serif;
  --font-mono: "Geist Mono", monospace;

  --radius-button: 8px;
  --radius-card: 12px;

  --shadow-card: 0 1px 2px rgba(0,0,0,0.05);
}

body {
  font-family: var(--font-sans);
  color: var(--color-sb-text);
  background: var(--color-sb-bg);
}
```

- [ ] **Step 6: Set up root layout with fonts**

Update `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "S.B. Smart Brain",
  description: "AI 思维陪练 — 帮你不再 SB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Create placeholder page**

Update `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-serif text-4xl">S.B. Smart Brain</h1>
    </main>
  );
}
```

- [ ] **Step 8: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts at localhost:3000, shows "S.B. Smart Brain" in Instrument Serif.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with design tokens"
```

---

### Task 2: Types and constants

**Files:**
- Create: `src/lib/types.ts`, `src/lib/constants.ts`

- [ ] **Step 1: Create type definitions**

Create `src/lib/types.ts`:
```typescript
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
```

- [ ] **Step 2: Create constants**

Create `src/lib/constants.ts`:
```typescript
import type { Grade } from "./types";

export const MAX_ROUNDS = 3;

export const GRADE_VALUES: Record<Grade, number> = {
  S: 100,
  "A+": 95,
  A: 90,
  "A-": 85,
  "B+": 80,
  B: 70,
  "B-": 60,
  "C+": 50,
  C: 40,
  D: 20,
};

export const SCORE_WEIGHTS = {
  logic: 0.35,
  evidence: 0.3,
  emotion: 0.2,
  rebuttal: 0.15,
} as const;

export const SB_INDEX_TIERS = [
  { max: 20, label: "逻辑鬼才，杠不动你" },
  { max: 40, label: "思路清晰，有两把刷子" },
  { max: 60, label: "还行，但漏洞不少" },
  { max: 80, label: "建议多读点书" },
  { max: 100, label: "经典 SB 发言，建议闭嘴" },
] as const;

export const COLORS = {
  bg: "#FFFFFF",
  bgSecondary: "#F4F4F5",
  text: "#18181B",
  textSecondary: "#71717A",
  accent: "#C5F36F",
  border: "#E5E5E5",
  dark: "#18181B",
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat: add type definitions and constants"
```

---

### Task 3: Scoring logic with tests

**Files:**
- Create: `src/lib/scoring.ts`, `src/lib/__tests__/scoring.test.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: Write failing tests for scoring**

Create `src/lib/__tests__/scoring.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { gradeToNumber, calculateSbIndex, getSbTierLabel } from "../scoring";

describe("gradeToNumber", () => {
  it("returns 100 for S grade", () => {
    expect(gradeToNumber("S")).toBe(100);
  });

  it("returns 70 for B grade", () => {
    expect(gradeToNumber("B")).toBe(70);
  });

  it("returns 20 for D grade", () => {
    expect(gradeToNumber("D")).toBe(20);
  });
});

describe("calculateSbIndex", () => {
  it("returns 0 for all S grades (perfect score)", () => {
    expect(calculateSbIndex("S", "S", "S", "S")).toBe(0);
  });

  it("returns 80 for all D grades", () => {
    expect(calculateSbIndex("D", "D", "D", "D")).toBe(80);
  });

  it("calculates weighted score correctly", () => {
    // logic=A(90)*0.35 + evidence=B(70)*0.3 + emotion=C(40)*0.2 + rebuttal=A+(95)*0.15
    // = 31.5 + 21 + 8 + 14.25 = 74.75 → round to 75
    // sbIndex = 100 - 75 = 25
    expect(calculateSbIndex("A", "B", "C", "A+")).toBe(25);
  });
});

describe("getSbTierLabel", () => {
  it("returns tier label for low SB index", () => {
    expect(getSbTierLabel(15)).toBe("逻辑鬼才，杠不动你");
  });

  it("returns tier label for high SB index", () => {
    expect(getSbTierLabel(85)).toBe("经典 SB 发言，建议闭嘴");
  });

  it("returns tier label for mid SB index", () => {
    expect(getSbTierLabel(50)).toBe("还行，但漏洞不少");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/scoring.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement scoring logic**

Create `src/lib/scoring.ts`:
```typescript
import type { Grade } from "./types";
import { GRADE_VALUES, SCORE_WEIGHTS, SB_INDEX_TIERS } from "./constants";

export function gradeToNumber(grade: Grade): number {
  return GRADE_VALUES[grade];
}

export function calculateSbIndex(
  logic: Grade,
  evidence: Grade,
  emotion: Grade,
  rebuttal: Grade
): number {
  const weighted =
    gradeToNumber(logic) * SCORE_WEIGHTS.logic +
    gradeToNumber(evidence) * SCORE_WEIGHTS.evidence +
    gradeToNumber(emotion) * SCORE_WEIGHTS.emotion +
    gradeToNumber(rebuttal) * SCORE_WEIGHTS.rebuttal;

  return Math.round(100 - weighted);
}

export function getSbTierLabel(sbIndex: number): string {
  for (const tier of SB_INDEX_TIERS) {
    if (sbIndex <= tier.max) return tier.label;
  }
  return SB_INDEX_TIERS[SB_INDEX_TIERS.length - 1].label;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/scoring.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/scoring.ts src/lib/__tests__/scoring.test.ts vitest.config.ts package.json
git commit -m "feat: add scoring logic with tests"
```

---

## Chunk 2: Database & AI Backend

### Task 4: Supabase migration and seed data

**Files:**
- Create: `supabase/migrations/001_init.sql`, `supabase/seed.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/001_init.sql`:
```sql
create table topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  publish_date date not null unique,
  category text not null default '社会',
  created_at timestamptz not null default now()
);

create index idx_topics_publish_date on topics (publish_date);

create table debates (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id),
  stance text not null check (stance in ('for', 'against')),
  messages jsonb not null default '[]',
  score_logic text,
  score_evidence text,
  score_emotion text,
  score_rebuttal text,
  sb_index integer,
  roast text,
  created_at timestamptz not null default now()
);

create index idx_debates_topic_id on debates (topic_id);
create index idx_debates_created_at on debates (created_at);
```

- [ ] **Step 2: Create seed data (30 topics)**

Create `supabase/seed.sql`:
```sql
insert into topics (title, description, publish_date, category) values
('应不应该禁止短视频', '短视频平台是否正在摧毁年轻人的注意力和深度思考能力？', '2026-03-12', '社会'),
('AI 会不会取代程序员', '大模型代码能力越来越强，程序员这个职业还能存在多久？', '2026-03-13', '科技'),
('该不该取消彩礼', '彩礼是传统文化的传承还是对婚姻的商品化？', '2026-03-14', '社会'),
('内卷是个人选择还是制度问题', '996 和内卷，是打工人自己卷的还是被迫的？', '2026-03-15', '社会'),
('远程办公应该成为常态吗', '疫情后很多公司要求回办公室，远程办公到底行不行？', '2026-03-16', '职场'),
('应不应该躺平', '躺平是对抗内卷的理性选择还是逃避现实？', '2026-03-17', '生活'),
('读研到底值不值', '花 2-3 年读研，是提升自己还是浪费时间？', '2026-03-18', '教育'),
('社交媒体让人更孤独了吗', '我们有了更多连接，但是否失去了真正的社交？', '2026-03-19', '社会'),
('应不应该考公', '体制内的稳定是福还是围城？', '2026-03-20', '职场'),
('电子游戏是不是精神鸦片', '游戏到底是娱乐还是成瘾？该不该限制未成年人游戏时间？', '2026-03-21', '生活'),
('一线城市还值得去吗', '高房价、高消费，一线城市的机会是否还能覆盖代价？', '2026-03-22', '生活'),
('知识付费是不是智商税', '得到、知乎 Live 这些平台真的能让人变聪明吗？', '2026-03-23', '科技'),
('婚姻制度还有存在的必要吗', '越来越多人不结婚，婚姻是过时的制度吗？', '2026-03-24', '社会'),
('应不应该全面放开生育限制', '人口下降是危机还是自然调节？', '2026-03-25', '社会'),
('外卖骑手困在系统里谁的错', '算法优化效率的同时牺牲了谁的利益？', '2026-03-26', '科技'),
('学历还重要吗', '大厂开始不看学历了，学历贬值是趋势还是幻觉？', '2026-03-27', '教育'),
('应不应该公开透明薪资', '同事之间该不该知道彼此的工资？', '2026-03-28', '职场'),
('人应不应该有不努力的权利', '不想上进是一种合理的人生选择吗？', '2026-03-29', '哲学'),
('中医到底是不是科学', '中医的有效性能被现代科学验证吗？', '2026-03-30', '科技'),
('碎片化学习有没有用', '刷知乎、看 B 站科普算学习吗？', '2026-03-31', '教育'),
('网暴该不该入刑', '键盘侠的言论自由边界在哪里？', '2026-04-01', '社会'),
('消费主义是陷阱还是自由', '买买买让人幸福还是被资本收割？', '2026-04-02', '生活'),
('AI 生成的艺术算不算艺术', 'AI 画的画、写的诗有没有灵魂？', '2026-04-03', '科技'),
('独生子女更幸福还是更孤独', '一个孩子得到所有资源但也承担所有压力？', '2026-04-04', '社会'),
('人应不应该追求财务自由', '财务自由是理性目标还是贩卖焦虑？', '2026-04-05', '生活'),
('996 福报论有没有道理', '拼命工作换取阶层跃升，这个交易划算吗？', '2026-04-06', '职场'),
('该不该删掉前任的联系方式', '断舍离是成熟还是逃避？', '2026-04-07', '生活'),
('素质教育是不是只是换了种方式卷', '减负之后孩子真的轻松了吗？', '2026-04-08', '教育'),
('小红书种草是分享还是广告', 'UGC 平台的真实性还存在吗？', '2026-04-09', '科技'),
('人活着到底是为了什么', '追求意义还是接受无意义？', '2026-04-10', '哲学');
```

- [ ] **Step 3: Create Supabase client**

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

- [ ] **Step 4: Commit**

```bash
git add supabase/ src/lib/supabase.ts
git commit -m "feat: add Supabase migration, seed data, and client"
```

---

### Task 5: AI prompts

**Files:**
- Create: `src/lib/prompts.ts`

- [ ] **Step 1: Create prompt templates**

Create `src/lib/prompts.ts`:
```typescript
import type { Stance, Message } from "./types";

export function buildDebateSystemPrompt(
  topic: string,
  userStance: Stance,
  round: number
): string {
  const stanceLabel = userStance === "for" ? "正方" : "反方";
  const sbStance = userStance === "for" ? "反方" : "正方";

  const roundStrategy: Record<number, string> = {
    1: "你的策略：挑衅式立论。用最尖锐的方式抛出你的核心论点，故意激怒对方。语气嚣张、不屑，像微博评论区最能杠的那个人。",
    2: "你的策略：逐句拆解。仔细阅读对方上一轮的回复，找出每一个逻辑漏洞、偷换概念、以偏概全的地方，逐一攻击。升级攻击力度。",
    3: "你的策略：降维打击。抛出对方完全没考虑过的角度、反直觉的事实或数据，让对方无法反驳。这是最后一轮，要一击致命。",
  };

  return `你是 S.B.（Smart Brain），一个街头杠精风格的辩论AI。

## 你的身份
- 为杠而生，逻辑功底扎实
- 语气挑衅、讽刺、接地气
- 像微博评论区最能杠的那个人

## 当前辩论
- 辩题：「${topic}」
- 用户立场：${stanceLabel}
- 你的立场：${sbStance}
- 当前轮次：第 ${round} 轮（共 3 轮）

## 本轮策略
${roundStrategy[round]}

## 硬性规则
- 只攻击论点，绝不人身攻击用户本人
- 不涉及政治敏感话题
- 回复控制在 150-250 字
- 用中文回复
- 不要使用 markdown 格式，直接说人话`;
}

export function buildScoringPrompt(
  topic: string,
  stance: Stance,
  messages: Message[]
): string {
  const stanceLabel = stance === "for" ? "正方" : "反方";

  const conversation = messages
    .map((m) => `[${m.role === "user" ? "用户" : "S.B."}] ${m.content}`)
    .join("\n\n");

  return `你是一个辩论评分专家。请根据以下辩论内容，对用户的表现进行评分。

## 辩论信息
- 辩题：「${topic}」
- 用户立场：${stanceLabel}

## 辩论内容
${conversation}

## 评分维度
请从以下四个维度评分，等级为：S / A+ / A / A- / B+ / B / B- / C+ / C / D

1. **逻辑严密度**（权重 35%）：论证链是否自洽，有无逻辑谬误
2. **论据质量**（权重 30%）：是否有事实/数据支撑，还是纯观点输出
3. **情绪控制**（权重 20%）：是否被激怒后开始人身攻击或偏离论题
4. **反驳能力**（权重 15%）：是否有效回应了 S.B. 的攻击点

## 毒舌点评
另外生成一句毒舌点评（30字以内），要求：
- 必须具体引用辩论中用户的某个论点或行为
- 必须有比喻或类比
- 犀利、有趣、扎心

## 输出格式
严格按以下 JSON 格式输出，不要输出其他任何内容：
{
  "logic": "B+",
  "evidence": "A-",
  "emotion": "C",
  "rebuttal": "B",
  "roast": "你的毒舌点评"
}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prompts.ts
git commit -m "feat: add debate and scoring prompt templates"
```

---

### Task 6: Server Actions

**Files:**
- Create: `src/actions/get-topic.ts`, `src/actions/debate-reply.ts`, `src/actions/generate-score.ts`, `src/actions/save-debate.ts`

- [ ] **Step 1: Create get-topic action**

Create `src/actions/get-topic.ts`:
```typescript
"use server";

import { supabase } from "@/lib/supabase";
import type { Topic } from "@/lib/types";

export async function getTodayTopic(): Promise<Topic | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("publish_date", today)
    .single();

  if (error || !data) {
    // Fallback: get the most recent topic that's not in the future
    const { data: fallback } = await supabase
      .from("topics")
      .select("*")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .single();

    return fallback ?? null;
  }

  return data;
}
```

- [ ] **Step 2: Create debate-reply action**

Create `src/actions/debate-reply.ts`:
```typescript
"use server";

import Anthropic from "@anthropic-ai/sdk";
import { buildDebateSystemPrompt } from "@/lib/prompts";
import type { Message, Stance } from "@/lib/types";

const client = new Anthropic();

export async function getDebateReply(
  topic: string,
  stance: Stance,
  round: number,
  messages: Message[]
): Promise<string> {
  const systemPrompt = buildDebateSystemPrompt(topic, stance, round);

  const apiMessages = messages.map((m) => ({
    role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  // If round 1 and no messages yet, S.B. starts first
  if (round === 1 && apiMessages.length === 0) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "辩论开始。请你先发言，挑衅式地抛出你的核心论点。",
        },
      ],
    });

    return (response.content[0] as { type: "text"; text: string }).text;
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: apiMessages,
  });

  return (response.content[0] as { type: "text"; text: string }).text;
}
```

- [ ] **Step 3: Create generate-score action**

Create `src/actions/generate-score.ts`:
```typescript
"use server";

import Anthropic from "@anthropic-ai/sdk";
import { buildScoringPrompt } from "@/lib/prompts";
import { calculateSbIndex } from "@/lib/scoring";
import type { Message, Stance, DebateScore, Grade } from "@/lib/types";

const client = new Anthropic();

const VALID_GRADES: Grade[] = [
  "S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D",
];

function isValidGrade(g: string): g is Grade {
  return VALID_GRADES.includes(g as Grade);
}

export async function generateScore(
  topic: string,
  stance: Stance,
  messages: Message[]
): Promise<DebateScore> {
  const prompt = buildScoringPrompt(topic, stance, messages);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as { type: "text"; text: string }).text;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse scoring response");

  const parsed = JSON.parse(jsonMatch[0]);

  const logic: Grade = isValidGrade(parsed.logic) ? parsed.logic : "C";
  const evidence: Grade = isValidGrade(parsed.evidence) ? parsed.evidence : "C";
  const emotion: Grade = isValidGrade(parsed.emotion) ? parsed.emotion : "C";
  const rebuttal: Grade = isValidGrade(parsed.rebuttal) ? parsed.rebuttal : "C";

  return {
    logic,
    evidence,
    emotion,
    rebuttal,
    sbIndex: calculateSbIndex(logic, evidence, emotion, rebuttal),
    roast: parsed.roast || "没什么好说的",
  };
}
```

- [ ] **Step 4: Create save-debate action**

Create `src/actions/save-debate.ts`:
```typescript
"use server";

import { supabase } from "@/lib/supabase";
import type { Message, Stance, DebateScore } from "@/lib/types";

export async function saveDebate(
  topicId: string,
  stance: Stance,
  messages: Message[],
  score: DebateScore
): Promise<void> {
  await supabase.from("debates").insert({
    topic_id: topicId,
    stance,
    messages,
    score_logic: score.logic,
    score_evidence: score.evidence,
    score_emotion: score.emotion,
    score_rebuttal: score.rebuttal,
    sb_index: score.sbIndex,
    roast: score.roast,
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/actions/
git commit -m "feat: add server actions for topic, debate, scoring, and saving"
```

---

## Chunk 3: UI Components

### Task 7: Chat bubble component

**Files:**
- Create: `src/components/chat-bubble.tsx`

- [ ] **Step 1: Create chat bubble component**

Create `src/components/chat-bubble.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat-bubble.tsx
git commit -m "feat: add chat bubble component"
```

---

### Task 8: Home screen component

**Files:**
- Create: `src/components/home-screen.tsx`

- [ ] **Step 1: Create home screen**

Create `src/components/home-screen.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home-screen.tsx
git commit -m "feat: add home screen component"
```

---

### Task 9: Debate screen component

**Files:**
- Create: `src/components/debate-screen.tsx`

- [ ] **Step 1: Create debate screen**

Create `src/components/debate-screen.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/debate-screen.tsx
git commit -m "feat: add debate screen component"
```

---

### Task 10: Report screen component

**Files:**
- Create: `src/components/report-screen.tsx`

- [ ] **Step 1: Create report screen**

Create `src/components/report-screen.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/report-screen.tsx
git commit -m "feat: add report screen component"
```

---

## Chunk 4: Integration & Share Card

### Task 11: Main page state machine

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Wire up the main page**

Replace `src/app/page.tsx`:
```tsx
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
```

- [ ] **Step 2: Verify the app compiles**

Run: `npm run build`
Expected: Build succeeds (API calls will fail without env vars, but compilation should pass).

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up main page state machine"
```

---

### Task 12: Share card OG image endpoint

**Files:**
- Create: `src/app/api/og/route.tsx`

- [ ] **Step 1: Create OG image endpoint**

Create `src/app/api/og/route.tsx`:
```tsx
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getSbTierLabel } from "@/lib/scoring";
import type { Grade } from "@/lib/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const topic = searchParams.get("topic") ?? "未知辩题";
  const stance = searchParams.get("stance") === "for" ? "正方" : "反方";
  const logic = (searchParams.get("logic") ?? "C") as Grade;
  const evidence = (searchParams.get("evidence") ?? "C") as Grade;
  const emotion = (searchParams.get("emotion") ?? "C") as Grade;
  const sbIndex = parseInt(searchParams.get("sbIndex") ?? "50", 10);
  const roast = searchParams.get("roast") ?? "";
  const tierLabel = getSbTierLabel(sbIndex);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          padding: "80px 60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 400, color: "#18181B" }}>
            S.B. Smart Brain
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#E5E5E5",
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        {/* Topic */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 16, color: "#71717A" }}>今日辩题</div>
          <div
            style={{
              fontSize: 32,
              color: "#18181B",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            「{topic}」
          </div>
          <div style={{ fontSize: 16, color: "#71717A", marginTop: 8 }}>
            我的立场：{stance}
          </div>
        </div>

        {/* Scores */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 48,
          }}
        >
          {[
            { label: "逻辑", value: logic },
            { label: "论据", value: evidence },
            { label: "情绪", value: emotion },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#F4F4F5",
                borderRadius: 12,
                padding: "24px 48px",
              }}
            >
              <div style={{ fontSize: 14, color: "#71717A" }}>
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 500,
                  color: "#18181B",
                  marginTop: 8,
                  fontFamily: "monospace",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* SB Index */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: 48,
            padding: "32px 40px",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 500, color: "#18181B" }}>
              SB 指数
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                color: "#18181B",
                fontFamily: "monospace",
              }}
            >
              {sbIndex}
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              backgroundColor: "#F4F4F5",
              borderRadius: 999,
              marginTop: 16,
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                width: `${100 - sbIndex}%`,
                height: "100%",
                backgroundColor: "#C5F36F",
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ fontSize: 16, color: "#71717A", marginTop: 12 }}>
            {tierLabel}
          </div>
        </div>

        {/* Roast */}
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            color: "#18181B",
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          S.B. 说：「{roast}」
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#E5E5E5",
            marginTop: 40,
            marginBottom: 24,
          }}
        />

        {/* CTA */}
        <div style={{ fontSize: 18, color: "#C5F36F", fontWeight: 500 }}>
          来和 S.B. 杠一杠 →
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
    }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/og/route.tsx
git commit -m "feat: add OG share card image endpoint"
```

---

### Task 13: Environment setup and deploy

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Create .env.local with real values**

Copy `.env.local.example` to `.env.local` and fill in real API keys:
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` with actual values (do NOT commit this file).

- [ ] **Step 2: Run Supabase migration**

Apply the migration via Supabase dashboard SQL editor or CLI:
```bash
# If using Supabase CLI:
supabase db push
# Or paste supabase/migrations/001_init.sql into Supabase SQL editor
```

- [ ] **Step 3: Seed topics**

Paste `supabase/seed.sql` into Supabase SQL editor and run.

- [ ] **Step 4: Verify full flow locally**

Run: `npm run dev`
1. Homepage loads with today's topic
2. Select a stance → S.B. opens with a provocative argument
3. Reply 3 times → scoring report appears
4. Click "保存卡片" → PNG downloads

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: All scoring tests pass.

- [ ] **Step 6: Build and check for errors**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 7: Final commit and push**

```bash
git add -A
git commit -m "feat: complete S.B. Smart Brain MVP"
git push origin main
```

- [ ] **Step 8: Deploy to Vercel**

```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL`
