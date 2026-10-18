# Legal and Policy Documents

Last updated: 2026-10-16

**Draft templates, not legal advice. Every document here must be reviewed by qualified counsel before use.**

## Documents

| Document | Audience | Purpose |
|---|---|---|
| [Privacy Policy](privacy.md) | Everyone | What data Atlas collects, why, who receives it, retention, rights |
| [Terms of Use](terms.md) | Everyone | Free service, content licence, acceptable use, AI disclaimer, certificates, liability |
| [Data Processing Agreement](dpa.md) | Companies using organisation features | Article 28 terms with the company as controller and the operator as processor |
| [Responsible AI and Employment Use](ai-use.md) | Learners and organisations | What the AI interviewer and grader do, limits, why scores must not decide employment outcomes, how to contest |
| [Accessibility Statement](accessibility.md) | Everyone | WCAG 2.2 AA target, known gaps, feedback route |
| [Security and Vulnerability Disclosure](security.md) | Researchers, organisations | Security measures, how to report, scope, safe harbour |

## Owner checklist

Fill in or decide each item, then search the folder for `[` to find any remaining placeholders.

### Identity and contact

- [x] Legal name of the operator (individual or entity) and postal address (privacy, terms, dpa).
- [x] Contact email addresses: privacy, security, accessibility, general (one address is fine). Replace every `[... EMAIL — PLACEHOLDER]`.
- [ ] Data Protection Officer: decide whether one is needed (usually not for a small free project); if yes, name and contact.
- [ ] EU and UK representative (GDPR Article 27): decide whether one is needed if the operator is outside the EU/UK and targets learners there.

### Law and liability

- [x] Governing law and courts (terms).
- [x] Liability cap amount (terms).
- [x] Standard Contractual Clauses options and governing law if the operator is outside the UK/EEA (dpa).
- [ ] Minimum age (drafted as 16).

### Content

- [x] Licence for lesson content (terms): CC BY 4.0 (`LICENSE-CONTENT`); code is MIT (`LICENSE`).

### Data and providers

- [x] Supabase project region (privacy, dpa).
- [x] Self-hosted server provider and location (dpa).
- [x] Retention periods: anonymous events, backups, Netlify Blobs rate-limit counters (privacy, dpa). Note that Netlify Blobs keys do not expire by themselves today.
- [ ] Confirm whether the deployment uses Cloudflare + self-hosting, Netlify, or both, and remove the unused provider.
- [ ] Confirm giscus comments and GitHub sign-in are enabled; remove them if not.
- [x] Sub-processor change notice method (dpa).
- [ ] Multi-factor authentication on all admin accounts (GitHub, Supabase, Cloudflare, OpenAI); the DPA states it is on.

### Features the documents describe that must exist before publishing

The documents follow the intended product. In the repository as of this date, only progress sync, public profiles, anonymous events, sign-in and the AI interviewer are implemented (`supabase/migrations/0001_engineering_atlas.sql`, `netlify/functions/interview.mjs`). Before publishing, confirm or adjust:

- [x] In-product account deletion (live in the account panel).
- [ ] Organisation features: invite codes, admin/manager roles with row level security, assignments, company-private lessons, Slack weekly digest.
- [ ] AI-graded, time-limited assessments and certificates stored with display name, title, score and date, public by link, revocable.
- [ ] Display name field on certificates.
- [x] Response times for score reviews, accessibility feedback and security reports.

### Accessibility

- [ ] Run the WCAG 2.2 AA audit, fill the conformance status and known gaps table, and name the enforcement body.

### Publishing

- [ ] Counsel review of all six documents.
- [ ] Link the privacy policy, terms, accessibility and AI statements from the site footer and the sign-in panel.
- [ ] Add a `SECURITY.md` in the repository root pointing to security.md, and enable private vulnerability reporting in the GitHub repository settings.
- [ ] Update "Last updated" dates whenever a document changes.
