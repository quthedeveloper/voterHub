-- Run this once in the Supabase SQL editor to enable in-app notifications.
-- The backend degrades gracefully until this exists (invite emails still send).

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  poll_id text references polls(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;
-- No policies: only the backend service role touches this table.

create index if not exists notifications_user_id_idx on notifications(user_id, created_at desc);
