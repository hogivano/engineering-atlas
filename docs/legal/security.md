# Security Overview and Vulnerability Disclosure Policy

Last updated: 2026-10-16

## How Atlas is protected

- **Static first**: the site is a static build. Without an account, progress lives only in your browser.
- **Database access**: Supabase row level security on every table. People read and write only their own progress; public profiles are readable only when the owner turns them on; anonymous usage events are insert-only from the browser.
- **Keys**: the browser gets only the public anon key. The Supabase service role key and the OpenAI API key stay on the server and are never committed.
- **Sign-in**: email magic links with the PKCE flow, or GitHub OAuth. Atlas stores no passwords.
- **Transport**: TLS via Cloudflare in front of the self-hosted server, or via Netlify.
- **AI endpoint**: same-origin requests only, request size limits, per-IP (hashed) and global daily rate limits, and the system prompt and rubric built on the server.
- **Third-party scripts**: loaded from pinned versions on cdnjs and jsDelivr.
- **Open source**: the code is public at https://github.com/hogivano/engineering-atlas for anyone to review.

## Reporting a vulnerability

Please report security issues privately through GitHub Security Advisories:

1. Go to https://github.com/hogivano/engineering-atlas/security/advisories/new (repository **Security** tab, **Report a vulnerability**).
2. Describe the issue, the steps to reproduce, the impact, and any proof of concept.

If you cannot use GitHub, email [me@hogivano.dev](mailto:me@hogivano.dev). Do not open a public issue or discussion for a vulnerability.

We aim to acknowledge reports within [5 working days], give an initial assessment within [14 days], and fix confirmed issues as fast as their severity requires. We will keep you updated and, if you wish, credit you in the advisory.

## Scope

In scope:

- https://engineering-atlas.hogivano.dev and its `/api/interview` endpoint;
- the code in https://github.com/hogivano/engineering-atlas, including the Supabase migrations and row level security policies;
- authentication, authorisation, and organisation features (for example a member reading another organisation's data).

Out of scope:

- third-party services themselves (Supabase, OpenAI, Cloudflare, Netlify, GitHub, Google Fonts, cdnjs, jsDelivr, YouTube, Slack, Go Playground); report those to the vendor;
- denial of service, load testing, or spending our AI quota;
- social engineering, phishing, or physical attacks;
- missing security headers or best-practice findings with no demonstrated impact;
- self-XSS, clickjacking on pages with no sensitive actions, and issues needing an already compromised device;
- content in the learner's own local storage on their own device.

## Rules for testing

- Use only accounts you own or test accounts you create.
- Do not access, change or delete other people's data. If you reach personal data by accident, stop, do not keep it, and tell us.
- Do not run automated scanners at high volume or try to exhaust rate limits.
- Give us reasonable time to fix the issue before disclosing it; we suggest 90 days, or sooner once a fix is released.

## Safe harbour

If you act in good faith and follow this policy, we will consider your research authorised, will not pursue or support legal action against you for it, and will treat it as allowed under the [Terms of Use](terms.md) acceptable use rules. If a third party takes legal action over research done under this policy, we will make it known that you acted with our authorisation. This applies only to our own systems and to the extent we can grant it; it cannot authorise testing of third-party services.

## No bounty

Atlas is a free project and does not offer paid bounties. We are grateful for every report.
