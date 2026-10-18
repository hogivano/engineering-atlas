-- Engineering Atlas for companies: organizations, assignments, private org lessons,
-- server-graded assessments and verifiable certificates.
--
-- Security model: every table below has row level security enabled and NO client policies,
-- except `certificates`, which anon/authenticated may read (non-revoked rows, public columns only).
-- Everything else is read and written only by the API server (server/lib, Netlify Functions)
-- with the service role key, which bypasses RLS and never reaches browsers.
--
-- Idempotent: safe to run more than once (SQL editor or `supabase db push`). Run after 0001.

-- ---------------------------------------------------------------------------
-- orgs
-- ---------------------------------------------------------------------------
create table if not exists public.orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  invite_code text unique not null check (invite_code ~ '^[A-Z0-9]{10}$'),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- org_secrets: never readable by clients (no policies, no grants).
-- ---------------------------------------------------------------------------
create table if not exists public.org_secrets (
  org_id        uuid primary key references public.orgs (id) on delete cascade,
  slack_webhook text check (slack_webhook is null or slack_webhook like 'https://hooks.slack.com/%')
);

-- ---------------------------------------------------------------------------
-- org_members
-- ---------------------------------------------------------------------------
create table if not exists public.org_members (
  org_id       uuid not null references public.orgs (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'member' check (role in ('admin', 'manager', 'member')),
  display_name text check (display_name is null or char_length(display_name) <= 60),
  joined_at    timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists org_members_user_idx on public.org_members (user_id);

-- ---------------------------------------------------------------------------
-- assignments: target is 'course:sd' | 'module:M8' | 'lesson:sd/caching-strategies' | 'skill:<id>:<level>'
-- ---------------------------------------------------------------------------
create table if not exists public.assignments (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.orgs (id) on delete cascade,
  target     text not null check (char_length(target) between 3 and 120),
  due_date   date,
  note       text check (note is null or char_length(note) <= 500),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists assignments_org_idx on public.assignments (org_id);

-- ---------------------------------------------------------------------------
-- org_lessons: private Markdown lessons for one org.
-- ---------------------------------------------------------------------------
create table if not exists public.org_lessons (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.orgs (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  markdown   text not null default '' check (char_length(markdown) <= 60000),
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists org_lessons_org_idx on public.org_lessons (org_id);

-- ---------------------------------------------------------------------------
-- assessment_attempts: questions include the hidden rubrics, so clients never read this table.
-- ---------------------------------------------------------------------------
create table if not exists public.assessment_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  scope        text not null check (scope ~ '^(lesson|module):'),
  title        text,
  questions    jsonb not null,
  started_at   timestamptz not null default now(),
  deadline     timestamptz not null,
  submitted_at timestamptz,
  score        int check (score is null or score between 0 and 100),
  result       jsonb
);
alter table public.assessment_attempts add column if not exists title text;
create index if not exists assessment_attempts_user_started_idx
  on public.assessment_attempts (user_id, started_at desc);

-- ---------------------------------------------------------------------------
-- certificates: public, verifiable at /#verify.<id> and /api/verify/<id>.
-- ---------------------------------------------------------------------------
create table if not exists public.certificates (
  id        text primary key check (id ~ '^[A-Za-z0-9_-]{12}$'),
  user_id   uuid not null references auth.users (id) on delete cascade,
  name      text not null check (char_length(name) between 1 and 60),
  scope     text not null,
  title     text not null,
  score     int not null check (score between 0 and 100),
  issued_at timestamptz not null default now(),
  revoked   boolean not null default false
);
create index if not exists certificates_user_idx on public.certificates (user_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.orgs                enable row level security;
alter table public.org_secrets         enable row level security;
alter table public.org_members         enable row level security;
alter table public.assignments         enable row level security;
alter table public.org_lessons         enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.certificates        enable row level security;

-- Server-only tables: no policies, and no table privileges for client roles either.
revoke all on public.orgs, public.org_secrets, public.org_members, public.assignments,
              public.org_lessons, public.assessment_attempts
  from anon, authenticated;

-- certificates: read-only for everyone, only rows that are not revoked, and only the public
-- columns (user_id stays private). Clients must select explicit columns, e.g.
-- /rest/v1/certificates?id=eq.<id>&select=id,name,scope,title,score,issued_at
drop policy if exists "certificates_public_read" on public.certificates;
create policy "certificates_public_read" on public.certificates
  for select to anon, authenticated using (revoked = false);

revoke all on public.certificates from anon, authenticated;
grant select (id, name, scope, title, score, issued_at, revoked) on public.certificates to anon, authenticated;
