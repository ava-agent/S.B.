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
