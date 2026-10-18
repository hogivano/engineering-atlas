# Deploying Engineering Atlas

The site is a static build (`python3 -I site/build.py` writes `dist/`) hosted on Netlify, with three optional backends:

| Feature | Backend | Turned on by |
|---|---|---|
| AI mock interviewer | Netlify Function `/api/interview` + OpenAI | `OPENAI_API_KEY` and `AI_INTERVIEW=1` |
| Sign-in, synced progress, public profiles, lesson analytics | Supabase | `SUPABASE_URL` and `SUPABASE_ANON_KEY` |
| Graded assessments, certificates, organizations, account deletion, Slack digest | Netlify Functions `/api/*` + Supabase service role + OpenAI | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (and `OPENAI_API_KEY` for assessments) |
| Comments under lessons | GitHub Discussions via giscus | `GISCUS_*` |

Each feature hides itself when its variables are missing, so a plain deploy with no variables is a working static site.

## 1. Netlify

1. Create a site from the GitHub repo. `netlify.toml` already sets the build command, the publish directory (`dist`), the functions directory (`netlify/functions`) and bundles `dist/mocks.json` and `dist/modules.json` into the functions. There are three functions: `interview.mjs` (`/api/interview`), `api.mjs` (every other `/api/*` route; the handlers live in `server/lib/`) and `digest.mjs` (scheduled, Mondays 09:00 UTC).
2. Netlify installs the root `package.json` (only `@netlify/blobs`) for the function. `tools/package.json` is for CI checks and is not used by the deploy.
3. Netlify Blobs needs no setup; the function uses the store `interview-limits` for rate limits.
4. Set environment variables under **Site configuration → Environment variables**, then redeploy (build-time variables only take effect on the next build).

### Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | function | OpenAI key. Server-side only, never sent to the browser. Without it `GET /api/interview` returns `{"enabled": false}` and POST returns 503. |
| `OPENAI_MODEL` | function | Chat model. Default `gpt-4o-mini`. |
| `INTERVIEW_DAILY_CAP` | function | Global requests per UTC day across all users. Default `400`. Per-IP limit is fixed at 40/day. |
| `AI_INTERVIEW` | build | Set to `1` to show the AI interviewer in mock interview sections. Unset: the static mock interview (prompt, follow-ups, rubric) is shown without the chat. |
| `SUPABASE_URL` | build | `https://<project>.supabase.co`. |
| `SUPABASE_ANON_KEY` | build, function | The project's anon (public) key. Safe to ship to the browser: row level security protects the data. Never use the service role key here. The API also uses it as the `apikey` when verifying users' access tokens. |
| `SUPABASE_URL` | function | Same value as above; the API functions need it at runtime too (set it for all scopes). |
| `SUPABASE_SERVICE_ROLE_KEY` | function | **Server-only.** The service role (or `sb_secret_...`) key from **Project Settings → API**. Used by `/api/*` to read and write the company tables, which clients cannot touch. Never put it in a build variable, the page, or the repository. Without it `/api/health` reports `accounts: false` and account routes return 503. |
| `APP_VERSION` | function | Optional version string reported by `GET /api/health` (e.g. the git SHA). Default `dev`. |
| `SITE_URL` | build, function | Canonical site URL, e.g. `https://engineering-atlas.netlify.app`. Used for auth redirects and as an extra allowed origin for `/api/interview`. |
| `GISCUS_REPO` | build | `owner/repo` that hosts the discussions. |
| `GISCUS_REPO_ID` | build | Repository ID from giscus.app. |
| `GISCUS_CATEGORY` | build | Discussion category name, e.g. `Lessons`. |
| `GISCUS_CATEGORY_ID` | build | Category ID from giscus.app. |

## 2. AI mock interviewer

There are two ways to power the interviewer and natural narration, and a public site needs neither:

- **Visitors bring their own key (default).** Anyone can open **More → AI settings** and paste their own
  OpenAI API key. It is stored only in their browser's local storage, sent straight to `api.openai.com`
  (never to this server) and never synced to accounts. Nothing to configure.
- **A server key (optional).** Set `OPENAI_API_KEY` and `AI_INTERVIEW=1` to give every visitor the
  interviewer on your bill. A visitor's own key, if set, still takes priority. The API below applies to
  this mode only.

Server-graded assessments and certificates always use the server key, because a grade the visitor's
own browser produces could not be trusted.

`POST /api/interview` with `{"lesson": "sd/caching-strategies", "messages": [{"role": "user", "content": "..."}], "debrief": false}` returns `{"reply": "..."}`.

- The system prompt (title, opening prompt, follow-ups, hidden rubric) is built on the server from `dist/mocks.json`; the client only sends the conversation.
- Limits: 24 messages, 4,000 characters per message, 30,000 in total; 40 requests per IP per UTC day; `INTERVIEW_DAILY_CAP` (default 400) across everyone. Over the limit returns 429 with a readable `error`.
- Only same-origin browser requests are accepted (cross-site `Origin` gets 403).
- Errors: 400 bad input, 404 unknown lesson, 429 rate limited, 502 OpenAI error, 503 not configured.
- Cost control: also set a monthly usage limit on the OpenAI project.

## 3. Supabase

1. Create a project at supabase.com. Copy **Project URL** and **anon public key** from **Project Settings → API** into `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. Run the migration `supabase/migrations/0001_engineering_atlas.sql`, either:
   - **SQL editor**: paste the file and run it, or
   - **CLI**: `supabase link --project-ref <ref>` then `supabase db push`.

   Then run `supabase/migrations/0002_company.sql` the same way (both files are idempotent, so re-running is safe). It creates `orgs`, `org_secrets`, `org_members`, `assignments`, `org_lessons`, `assessment_attempts` and `certificates`.

   0001 creates `progress` (each user reads/writes only their own row), `profiles` (owner full access; anyone can read rows with `is_public = true`), `events` (insert-only for the browser; nobody but the service role reads) and the `lesson_stats` view (per-lesson views, completions, quiz accuracy, helpful votes), which you read in the dashboard's SQL editor or table view.
3. **Authentication → Providers**:
   - **Email**: enable it and use magic links (passwordless).
   - **GitHub**: create an OAuth app at GitHub → Settings → Developer settings → OAuth Apps with callback URL `https://<project>.supabase.co/auth/v1/callback`, then paste its client ID and secret into the GitHub provider.
4. **Authentication → URL Configuration**: set **Site URL** to the Netlify domain (same as `SITE_URL`) and add redirect URLs for it, e.g. `https://engineering-atlas.netlify.app/**`, plus `https://deploy-preview-*--engineering-atlas.netlify.app/**` for deploy previews and `http://localhost:8000/**` for local testing.

## 4. Company features: assessments, certificates, organizations

All of these run on the server (`server/lib/`, served by `netlify/functions/api.mjs` or `server/api.mjs`).

### Security model

- The **service role key never reaches browsers.** It is only read from the function/server environment.
- Every table from migration 0002 has row level security on and **no client policies**, and client roles have no privileges on them; the API is the only way in. The one exception is `certificates`: anyone may `select` rows that are not revoked, and only the public columns (`id, name, scope, title, score, issued_at, revoked`; `user_id` stays private), so clients must name the columns they select.
- Signed-in routes take `Authorization: Bearer <Supabase access token>` (the browser session's `access_token`); the server verifies it with Supabase (`GET /auth/v1/user`) on every request. State-changing routes also require a same-origin request, like `/api/interview`.
- Assessment questions are generated per attempt from the lesson material, in a different scenario from the published mock interview; their rubrics are stored in `assessment_attempts` and never sent to the client. Grading runs server-side against the hidden rubric at temperature 0, and the server enforces the time limit (20 minutes per lesson, 35 per module, plus 120 s grace).
- Certificates are verifiable by anyone at `/#verify.<id>` (the site) and `GET /api/verify/<id>` (JSON). Revoke one by setting `revoked = true` in the dashboard; it then verifies as `valid: false`.
- Slack webhooks live in `org_secrets`, which no client can read; the API only accepts `https://hooks.slack.com/...` URLs.
- `POST /api/account/delete` deletes the auth user; progress, profile, memberships, attempts and certificates cascade.

### API

All bodies and responses are JSON; errors are `{"error": "..."}` with a 4xx/5xx status.

| Route | Auth | Body → response |
|---|---|---|
| `GET /api/health` | none | `{ok, version, interview, accounts}` |
| `POST /api/assess/start` | user | `{scope: "lesson:<key>" \| "module:<id>"}` → `{attemptId, scope, title, minutes, deadline, questions: [{id, prompt}]}`. One start per scope per 24 h and 6 per UTC day (429). |
| `POST /api/assess/submit` | owner | `{attemptId, answers: [{id, text ≤ 6000}], displayName?}` → `{score, passed, perQuestion: [{id, score, covered, missed, feedback}], certificateId}`; once only (409). Late: `{score: 0, passed: false, late: true, ...}`. Pass mark 70. |
| `GET /api/verify/<id>` | none | `{id, name, title, scope, score, issuedAt, valid}` or 404 |
| `POST /api/account/delete` | user | `{deleted: true}` |
| `POST /api/org/create` | user | `{name, displayName?}` → `{org: {id, name, role, inviteCode}}` |
| `POST /api/org/join` | user | `{code, displayName?}` → `{org}` |
| `GET /api/org/me` | user | `{orgs, assignments, lessons}` |
| `GET /api/org/<id>/members` | manager, admin | `[{userId, displayName, email, role, joinedAt, summary}]` |
| `POST /api/org/<id>/assign` | manager, admin | `{target, dueDate?, note?}` → `{assignment}` |
| `DELETE /api/org/<id>/assign/<assignmentId>` | manager, admin | `{deleted: true}` |
| `POST /api/org/<id>/role` | admin | `{userId, role}` → `{userId, role}` |
| `DELETE /api/org/<id>/member/<userId>` | admin, or self | `{removed: true}` |
| `POST /api/org/<id>/slack` | admin | `{webhookUrl}` (`""` removes it) → `{slack}` |
| `POST /api/org/<id>/lessons` | manager, admin | `{id?, title, markdown ≤ 60000}` → `{lesson}` |
| `DELETE /api/org/<id>/lessons/<lessonId>` | manager, admin | `{deleted: true}` |

Assessments call OpenAI once to generate questions and once per question to grade, so the function needs to finish within Netlify's function timeout; `gpt-4o-mini` normally takes a few seconds.

### Weekly Slack digest

Organizations that set a webhook get a short summary every Monday at 09:00 UTC: members active this week, lessons mastered this week, and overdue assignments. On Netlify this is the scheduled function `netlify/functions/digest.mjs`; the self-hosted server checks hourly and remembers the last run in memory and in `DIGEST_STATE_FILE` (default `/tmp/atlas-digest.json`). Run one API instance, or set `DIGEST_DISABLED=1` on the others.

## 5. Comments (giscus)

1. In the GitHub repo: **Settings → General → Features → Discussions**, enable it and create a category for lesson comments (an Announcements-type category stops people opening threads outside lessons).
2. Install the giscus app (github.com/apps/giscus) on the repo. The repo must be public.
3. On giscus.app, enter the repo and category; copy the repo ID and category ID into the `GISCUS_*` variables.

## What happens when variables are missing

| Missing | Result |
|---|---|
| `OPENAI_API_KEY` or `AI_INTERVIEW` | No AI interviewer button; mock interviews stay static. The endpoint reports `enabled: false`. |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | No sign-in, profiles or analytics; progress stays in the browser's local storage. |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/health` reports `accounts: false`; assessments, certificates, organizations and account deletion return 503. |
| `GISCUS_*` | No comments section under lessons. |

## Local checks

- `node --check netlify/functions/interview.mjs`
- `for f in server/lib/*.mjs server/api.mjs netlify/functions/*.mjs; do node --check "$f"; done`
- `curl localhost:8787/api/health` against a running `node server/api.mjs`
- `netlify dev` (Netlify CLI) runs the site and the function together; put the variables in a local `.env` (not committed).

## Self-hosting with Docker (no Netlify)

The API also runs outside Netlify: `server/api.mjs` serves `/api/interview` (with an in-memory rate
limiter) and every other `/api/*` route from `server/lib/`, and sends the weekly Slack digest. A working setup is three images from one Dockerfile:

1. **build** (`python:3.12-alpine`): runs `python3 -I site/build.py` with the public settings
   (`SITE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `AI_INTERVIEW`, `GISCUS_*`) passed as build args.
2. **web** (`nginx`): serves `dist/`, proxies `/api/` to the API container with
   `Host`/`X-Forwarded-Host` set to `$http_host` (keeps the port) and `X-Forwarded-Proto`, serves
   `manifest.webmanifest` as `application/manifest+json`, and marks `/sw.js` and `/index.html` no-cache.
3. **api** (`node:20-alpine`): `package.json`, `netlify/`, `server/`, `dist/mocks.json` and `dist/modules.json`,
   running `node server/api.mjs` with `OPENAI_API_KEY`, `OPENAI_MODEL`, `INTERVIEW_DAILY_CAP`, `SITE_URL`,
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `APP_VERSION`. Only this container
   gets the service role key; never pass it to the build image.

Keep the keys in an `.env` file next to `docker-compose.yml` (not in the repository), and rebuild after
changing it, because the public settings are baked into the page at build time.
