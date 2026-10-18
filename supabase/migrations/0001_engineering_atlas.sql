-- Engineering Atlas: progress sync, public profiles, anonymous analytics events.
-- Run in the Supabase SQL editor, or with `supabase db push`.

-- ---------------------------------------------------------------------------
-- progress: one row per user holding the client's progress state.
-- ---------------------------------------------------------------------------
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
drop policy if exists "progress_delete_own" on public.progress;

create policy "progress_select_own" on public.progress
  for select to authenticated using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.progress to authenticated;

-- ---------------------------------------------------------------------------
-- profiles: optional public profile with a handle and a progress summary.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  handle     text unique check (handle ~ '^[a-z0-9-]{3,30}$'),
  is_public  boolean not null default false,
  summary    jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_owner_all" on public.profiles;
drop policy if exists "profiles_public_read" on public.profiles;

create policy "profiles_owner_all" on public.profiles
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_public_read" on public.profiles
  for select to anon, authenticated using (is_public = true);

grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- events: write-only anonymous analytics. Only the service role (dashboard) reads.
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id         bigint generated always as identity primary key,
  created_at timestamptz default now(),
  kind       text not null check (kind in ('view', 'complete', 'quiz', 'helpful', 'practice', 'mock')),
  lesson     text check (char_length(lesson) <= 80),
  item       int,
  ok         boolean,
  value      int,
  session    text check (char_length(session) <= 40)
);

create index if not exists events_lesson_kind_idx on public.events (lesson, kind);

alter table public.events enable row level security;

drop policy if exists "events_insert_anyone" on public.events;
create policy "events_insert_anyone" on public.events
  for insert to anon, authenticated with check (true);
-- No select/update/delete policies: with RLS on, anon and authenticated cannot read.

revoke all on public.events from anon, authenticated;
grant insert on public.events to anon, authenticated;

-- ---------------------------------------------------------------------------
-- lesson_stats: per-lesson aggregates for the project owner (dashboard / service role).
-- ---------------------------------------------------------------------------
create or replace view public.lesson_stats
with (security_invoker = true) as
select
  lesson,
  count(*) filter (where kind = 'view')                         as views,
  count(*) filter (where kind = 'complete')                     as completes,
  count(*) filter (where kind = 'quiz')                         as quiz_attempts,
  round(avg(case when ok then 1.0 else 0.0 end) filter (where kind = 'quiz'), 3) as quiz_accuracy,
  count(*) filter (where kind = 'helpful' and ok is true)       as helpful_yes,
  count(*) filter (where kind = 'helpful' and ok is false)      as helpful_no,
  count(*) filter (where kind = 'practice')                     as practice_runs,
  count(*) filter (where kind = 'mock')                         as mock_sessions,
  max(created_at)                                               as last_event_at
from public.events
where lesson is not null
group by lesson;

revoke all on public.lesson_stats from anon, authenticated;
