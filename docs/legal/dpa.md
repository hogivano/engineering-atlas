# Data Processing Agreement

Last updated: 2026-10-16

## Parties

- **Controller**: the company or organisation that creates an organisation in Engineering Atlas ("the Company"): the legal name, address and contact given by the Company when it accepts this Agreement.
- **Processor**: Hendriyan Ogivano, operator of Engineering Atlas ("the Operator"), [me@hogivano.dev](mailto:me@hogivano.dev).

This Agreement forms part of the [Terms of Use](terms.md) and applies when the Company uses the organisation features. It is intended to meet Article 28 of the EU GDPR and UK GDPR. Where it conflicts with the Terms, this Agreement wins for personal data.

## Scope of processing

| Item | Description |
|---|---|
| Subject matter | Hosting and operating the Atlas organisation features for the Company |
| Duration | While the Company has an active organisation, plus the deletion period below |
| Nature and purpose | Storing membership and roles; showing members' progress summaries to the Company's admins and managers; lesson assignments; company-private lessons; certificates; optional weekly digest to the Company's Slack webhook; AI interviews and grading for members |
| Data subjects | Employees, contractors, candidates or other people the Company invites ("Members"), and the Company's admins and managers |
| Personal data | Email address, display name, organisation role, invite and join dates, lesson progress and scores, assessment results and certificates, assignments, text Members type into AI features (sent to the AI provider, not stored by the Operator), content of company-private lessons if it contains personal data |
| Special categories | None intended. The Company must not put special category data into company-private lessons or assignments |

Members' own account and learning data outside the organisation remains under the Operator's [Privacy Policy](privacy.md), with the Operator as controller.

## Operator obligations

The Operator will:

1. process personal data only on the Company's documented instructions, which are this Agreement and the Company's use of the product settings, unless required by law (in which case it will tell the Company first unless the law forbids it);
2. tell the Company if it believes an instruction breaks data protection law;
3. ensure anyone authorised to process the data is bound by confidentiality;
4. apply the security measures in this Agreement;
5. follow the sub-processor rules below;
6. help the Company, taking into account the nature of the processing, to respond to data subject requests, including through the in-product export, removal of members and account deletion;
7. help the Company with security, breach notification, data protection impact assessments and prior consultation, as far as reasonably possible given the information available to it;
8. delete or return personal data at the end of the service as set out below;
9. make available the information needed to show compliance with Article 28 and allow audits as set out below.

## Company obligations

The Company will:

- have a lawful basis for the processing and give Members the required privacy information;
- invite only people it is entitled to invite, and keep invite codes and the Slack webhook URL confidential;
- choose who has admin and manager roles and review them regularly;
- not use AI scores or certificates as the sole basis for employment decisions and follow [Responsible AI and employment use](ai-use.md);
- carry out any impact assessment its own use requires.

## Sub-processors

The Company gives general authorisation for these sub-processors:

| Sub-processor | Purpose | Location |
|---|---|---|
| Supabase Inc. | Database, authentication | Singapore |
| OpenAI, L.L.C. | AI interviewer and grader (Member answers only, no account identifiers) | United States |
| Cloudflare, Inc. | CDN, TLS termination, proxy for the self-hosted server | Global |
| Netlify, Inc. | Hosting and serverless functions, if used instead of self-hosting | United States / global |
| Slack Technologies, LLC | Weekly digest, only if the Company adds a webhook (the Company's own Slack workspace) | United States |
| GitHub, Inc. | Optional sign-in with GitHub; comments if enabled | United States |
| The Operator's own server | Self-hosted web and API server, behind Cloudflare | Indonesia |

Google Fonts, jsDelivr, cdnjs and YouTube thumbnails are loaded directly by the Member's browser and receive only technical request data (IP address, user agent); they do not receive organisation data.

The Operator will give at least 30 days' notice of a new or replacement sub-processor by updating this page and emailing organisation admins. The Company may object on reasonable data protection grounds; if no solution is found, the Company may close its organisation. The Operator imposes data protection terms on each sub-processor that are no less protective in substance (in practice, each provider's standard data processing terms) and remains responsible for them.

## International transfers

Where personal data leaves the UK or EEA, transfers rely on an adequacy decision (including the EU-US Data Privacy Framework and UK extension where the provider is certified) or the Standard Contractual Clauses and UK Addendum in each sub-processor's terms. Where the Operator itself is outside the UK or EEA, the parties incorporate the Standard Contractual Clauses, Module 2 (controller to processor), and Module 3 (processor to processor) where relevant, with the Clause 9(a) Option 2 general authorisation and the notice period above, and, under Clauses 17 and 18, the law and courts of Ireland.

## Security measures

The following technical and organisational measures are in place:

- **Access control in the database**: row level security on every table. Members read and write only their own progress; anonymous usage events are insert-only from the browser and cannot be read back; organisation data is visible only to members of that organisation with an admin or manager role.
- **Key separation**: the browser holds only the public anon key. The Supabase service role key and the OpenAI API key are kept server-side in environment variables and are never shipped to the browser or committed to the repository.
- **Encryption in transit**: TLS via Cloudflare (or Netlify) for all traffic; providers encrypt data at rest.
- **Passwordless sign-in**: email magic links using the PKCE flow, or GitHub OAuth. No passwords are stored by Atlas.
- **AI endpoint protection**: same-origin requests only; size limits on messages; per-IP and global daily rate limits; the system prompt and rubric are built on the server.
- **Data minimisation**: no account identifiers are sent to the AI provider; AI conversations are not stored by the Operator; rate limiting stores only a one-way hash of the IP address; usage analytics carry no user ID and honour Do Not Track and an opt-out; the Slack digest contains progress summaries only.
- **Open source**: the code is public for review at https://github.com/hogivano/engineering-atlas.
- **Organisational**: one administrator with access to production; access via accounts protected by multi-factor authentication; dependency updates and a [vulnerability disclosure policy](security.md).

## Personal data breaches

The Operator will notify the Company without undue delay, and in any case within 48 hours, after becoming aware of a personal data breach affecting the Company's data. The notice will describe, as far as known, the nature of the breach, categories and approximate numbers of data subjects and records, likely consequences, and measures taken or proposed. Information may be provided in stages.

## Deletion and return

When the Company closes its organisation, or on written request, the Operator will within 30 days delete the organisation's data (memberships, roles, assignments, company-private lessons, organisation views of progress, Slack webhook), after offering an export of membership and progress summaries. Backups are overwritten within 14 days. Members' own accounts continue under the Privacy Policy unless the Member deletes them. Data may be kept longer only where the law requires.

## Audits

The Operator will answer reasonable written questionnaires about its processing once a year, and provide sub-processors' available certifications or reports. If these do not reasonably show compliance, or a supervisory authority requires it, the Company may carry out an audit, at its own cost, on 30 days' notice, during business hours, limited to what is needed and subject to confidentiality.

## Liability and term

Liability under this Agreement is subject to the limits in the Terms, except where law does not allow this. This Agreement ends when the Operator no longer processes the Company's personal data.

## Signatures

Company: name, title and date, given when the Company accepts this Agreement.

Operator: Hendriyan Ogivano, operator of Engineering Atlas, on the same date.
