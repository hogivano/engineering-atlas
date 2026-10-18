# Privacy Policy

Last updated: 2026-10-16

## Who we are

Engineering Atlas ("Atlas", "we") is a free, open-source learning site at https://engineering-atlas.hogivano.dev, run by an individual, Hendriyan Ogivano, who you can reach at [me@hogivano.dev](mailto:me@hogivano.dev). For the data described here we are the controller, except organisation data, where the company that set up the organisation is the controller and we act as its processor (see the [Data Processing Agreement](dpa.md)).

Contact: [me@hogivano.dev](mailto:me@hogivano.dev) or an issue at https://github.com/hogivano/engineering-atlas/issues (do not post personal data in a public issue).

## The short version

- You can use Atlas without an account. Your progress then stays in your browser and we never see it.
- If you sign in, we store your email address and your progress so it syncs between devices.
- We collect anonymous usage events with no user ID. Do Not Track and an opt-out switch turn them off.
- AI mock interviews and AI-graded assessments send what you type to OpenAI. We do not send your name, email or account ID.
- If you add your own OpenAI API key in **AI settings**, it is stored only in your browser. Your browser sends it, with your interview messages and the lesson text to narrate, directly to OpenAI under your own OpenAI account; it never reaches our servers and is not synced to your account. Remove it any time in AI settings.
- We do not sell or share personal information for advertising, and there are no advertising or tracking cookies.

## What we collect

| Data | When | Where it is kept |
|---|---|---|
| Progress, quiz answers, review deck, notes, code drafts, settings | Always, in your browser | Your browser's local storage only, unless you sign in |
| Email address, sign-in identifiers (and your GitHub user ID and email if you sign in with GitHub) | When you create an account | Supabase (authentication) |
| Progress snapshot (the same progress data as above, as one JSON record) | When you are signed in | Supabase, readable only by you |
| Public portfolio: handle and progress summary | Only if you turn on a public profile | Supabase, readable by anyone with the link |
| Certificates: display name, assessment title, score, date | When you earn one | Supabase; public to anyone with the link |
| Anonymous usage events: event type (view, complete, quiz, helpful, practice, mock), lesson, item, outcome, a random session ID that lasts for one page session | When you use the site, unless opted out | Supabase, readable only by the operator |
| AI interview and assessment text: the messages you type and the lesson identifier | When you use the AI interviewer or an AI-graded assessment | Sent to OpenAI to generate a reply; not stored in our database |
| A one-way hash of your IP address with a daily counter | When you use the AI features | Rate-limit store (Netlify Blobs, or server memory when self-hosted) |
| Organisation data: membership, role, assignments, progress summaries, company-private lessons | When you join an organisation with an invite code | Supabase, visible to that organisation's admins and managers |
| Technical logs: IP address, user agent, requested URL, time | Every request | Hosting and CDN providers (Cloudflare, Netlify) |

Please do not type sensitive personal data into notes, AI interviews or assessments.

## Why we use it and our legal bases

| Purpose | Legal basis (GDPR / UK GDPR) |
|---|---|
| Providing the site, syncing progress, issuing certificates, public portfolio | Contract (Art. 6(1)(b)): providing the service you asked for |
| AI interviews and AI grading | Contract (Art. 6(1)(b)) |
| Anonymous usage statistics to improve lessons | Legitimate interests (Art. 6(1)(f)); you can opt out at any time |
| Rate limiting, abuse prevention and security logs | Legitimate interests (Art. 6(1)(f)) |
| Organisation features | Processed on behalf of the organisation, which decides the legal basis |
| Legal obligations and claims | Legal obligation (Art. 6(1)(c)) or legitimate interests |

We make no solely automated decisions with legal or similar effects; AI scores are guidance (see [Responsible AI](ai-use.md)).

## Cookies and local storage

Atlas uses your browser's local storage for your progress, drafts and settings, and, when you sign in, to keep your session. These are strictly necessary for features you ask for. There are no analytics or advertising cookies.

## Processors, sub-processors and third parties

| Provider | Role | What it receives | Location |
|---|---|---|---|
| Supabase | Database and authentication | Account, progress, profiles, certificates, organisation data, anonymous events | Singapore |
| OpenAI | AI interviewer and grader | Your typed answers and the lesson prompt; no account identifiers | United States |
| Cloudflare | CDN, TLS and proxy in front of the self-hosted server | All requests, including IP address | Global |
| Netlify | Hosting and serverless function (when used instead of self-hosting) | All requests, including IP address; hashed-IP rate-limit counters | United States / global |
| Google Fonts | Web fonts, loaded by your browser | IP address, user agent | Global |
| jsDelivr | Libraries (Pyodide, Supabase JS), loaded by your browser | IP address, user agent | Global |
| cdnjs (Cloudflare) | Libraries (Mermaid, Brython, TypeScript), loaded by your browser | IP address, user agent | Global |
| YouTube (Google) | Video thumbnails from i.ytimg.com; videos open on YouTube | IP address, user agent | Global |
| GitHub / giscus | Lesson comments, if enabled; GitHub sign-in, if you choose it | What you post, your GitHub account | United States |
| Slack | Weekly organisation digest, only if an organisation admin adds a webhook | Organisation members' progress summaries | United States |
| Go Playground (go.dev) | Opens only when you click to run Go code there | The code you send, IP address | United States |

Providers loaded by your browser receive your IP address under their own policies. Text-to-speech uses your browser's built-in voices; some browsers send that text to their vendor's cloud voice service.

## How long we keep it

- Browser data: until you clear it or reset progress.
- Account, progress, profile and certificates: until you delete your account. Backups expire within 14 days.
- Anonymous usage events: 24 months, then deleted or aggregated.
- AI text: not stored by us. OpenAI may keep API data for up to 30 days for abuse monitoring under its API terms.
- Rate-limit counters: one UTC day in server memory; on Netlify (not used by the current deployment), daily counters keyed by a salted hash of the IP address, never the IP itself.
- Organisation data: as instructed by the organisation, and deleted when it leaves or you leave it.
- Hosting logs: per the provider's retention, typically a few days to weeks.

## International transfers

Some providers process data outside the UK and EEA, mainly in the United States. Where required, transfers rely on adequacy decisions (including the EU-US Data Privacy Framework and UK extension where the provider is certified) or the European Commission's Standard Contractual Clauses and the UK Addendum.

## Your rights

Depending on where you live (including under GDPR, UK GDPR and the California Consumer Privacy Act as amended by CPRA), you can ask to access, correct, delete, export or restrict your data, and object to processing based on legitimate interests. You can do much of this in the product:

- **Export**: use Export at the top of the page to download your progress as a JSON file.
- **Correct**: edit your progress, profile handle and display name directly.
- **Delete**: reset progress in your browser; delete your account from your account panel. Deleting the account removes progress, profile and certificates.
- **Hide your portfolio**: turn the public profile off at any time.
- **Opt out of usage statistics**: tick "Don't share anonymous usage statistics", or enable Do Not Track.

For anything else, contact us. We answer within one month (45 days for California requests). We may need to verify you control the account. If you are in an organisation, we may refer you to the organisation as controller.

**California**: we do not sell or share personal information for cross-context behavioural advertising, and we do not use sensitive personal information. You will not be treated differently for exercising your rights. An authorised agent may make a request for you.

You can complain to your data protection authority (in the UK, the ICO).

## Children

Atlas is meant for adults and students aged 16 and over. Do not create an account if you are under 16 (or the age of digital consent where you live). If we learn that a child has given us personal data, we will delete it.

## Security

Data is encrypted in transit (TLS). The database enforces row level security, so each person reads and writes only their own records and anonymous events cannot be read from the browser. Administrative keys stay on the server. The AI endpoint accepts only same-origin requests and is rate-limited. See [Security](security.md).

## Changes

We will post changes here and update the date above. For material changes we will give notice on the site, and by email to signed-in users where appropriate.
