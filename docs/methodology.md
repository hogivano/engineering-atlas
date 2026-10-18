# How this curriculum was built

## How every lesson is written and checked

Every lesson is original writing, built and checked against many independent sources, so no lesson
rests on a single course.

**Use of AI.** The curriculum is written with AI assistance. The maintainer chose the scope, the
structure and the standards in `lessons/STYLE.md`; lessons, exercises and research were drafted
with Anthropic's Claude; and every lesson then goes through the checks below. A separate AI
fact-checker reviews each writer's citations. Human review of every lesson is ongoing, so please
report anything wrong.

| Source type | Examples | What it is used for |
|---|---|---|
| Primary papers, RFCs and specs | Raft, Dynamo, Spanner, ANSI isolation critique, IETF RFCs and drafts | Exact definitions, guarantees and protocol details |
| Official docs of real systems | PostgreSQL, Redis, Kafka, Envoy, NGINX, Kubernetes, AWS, Stripe | Defaults, limits, error codes and behaviour as shipped |
| Public postmortems and engineering blogs | Cloudflare, GitHub, GitLab, Google Cloud, AWS, Stripe, Discord, Shopify | What really breaks in production, with numbers |
| Standard books, cited by chapter | *Designing Data-Intensive Applications*, the Google SRE books, *Database Internals*, GoF | Depth and the classic framing of each topic |
| Other open curricula | system-design-primer, roadmap.sh, Azure Architecture Center, AWS Builders' Library | Gap checks: what others teach that a lesson missed |

For each lesson:

1. **Gap check.** The lesson is compared with how each source type covers the topic. Missing ideas
   and wrong or stale facts (superseded drafts, changed defaults, renamed APIs) are fixed in
   original words.
2. **Inline citations.** Specific numbers, defaults, behaviours and dates link to the page that
   supports them, right where the claim is made.
3. **In the wild.** Two or three real incidents or production write-ups, each linked to the
   company's own postmortem or an official report. Incidents without a primary source are dropped.
4. **Sources and further study.** Papers, system docs, book chapters, and how other curricula frame
   the topic.
5. **Independent verification.** A second reviewer, separate from the writer, opens every new link and
   a sample of the cited claims, and removes anything the source does not support.
6. **Automated checks.** `tools/check_sources.py` (sections, citations, untouched practice code),
   `tools/check_all_practice.py` (solutions pass their tests in Python, TypeScript and Go) and
   `tools/check_diagrams.js` (every diagram renders).

Shared references live in `sources/books.md` (verified chapter lists) and `sources/incidents/`
(a catalogue of primary-source incidents tagged by problem shape). Claims still unverified are
tracked in `docs/fact-check.md`, and lessons flag them to readers.

## How the course outlines were built

The course outlines are this project's own: the sections, their order, the lesson titles and the
lesson slugs. Topic coverage was compared with widely used design curricula and the canonical books,
so that nothing an engineer is commonly expected to know is missing. The courses also go beyond
interview preparation: Problem Solving & Incidents, Building AI Systems, the problem shapes that run
through every lesson, and the leadership lens.

No lesson text, outline or exercise was copied from another course. Paid courses were not used as
sources for lesson content.

## Known limits

- Fast-moving facts (cloud prices, default settings, draft standards) go stale. Each lesson's
  citations make it quick to re-check them; please open an issue when one is out of date.
- Claims that could not be verified against a primary source are listed in
  [docs/fact-check.md](fact-check.md), and lessons flag them to readers.
