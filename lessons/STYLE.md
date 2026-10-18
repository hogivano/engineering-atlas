# Lesson style guide

Every lesson in `lessons/` is **original writing**. It is never a copy or close paraphrase of any
course, book or article. Do not write from paid courses at all. Explain in your own words, with your
own examples and numbers, and cite the primary sources you used.

Audience: anyone who cares about software engineering in the AI era, from a working developer to
a tech lead, who wants depth (how it works, why, and when it breaks) and not interview trivia.
Where it fits, point out the problem shape behind the topic (contention, duplicates, ordering,
fan-out, hot spots, overload, partial failure, multi-step consistency, finding things fast, trust
but verify; see `curriculum/problem-shapes.md`) and show it in a second domain, so readers learn
to recognise the same problem wherever it appears.

## File format

Path: `lessons/<course>/<slug>.md`, where `<course>` is the course folder (`sd`, `sdi`, `lld`, `ps`, `ai`
or `fd`) and `<slug>` is a short, generic, lowercase-hyphenated name for the topic. Add the lesson to
the course outline in `lessons/<course>/_course.json`.

```
---
title: <exact chapter title>
minutes: <estimated reading time, integer>
---

## In one minute
- 3–5 bullets: the essential idea.

## How it works
Prose. Use `### ` subheadings for parts. Short paragraphs.

## Down the stack
The section that separates engineers who use a tool from engineers who understand it. Go down
three layers, then explain why the design looks the way it does. Each layer is a `### ` subheading:

### Layer 1: The contract
What the caller is promised (guarantees, failure semantics, consistency, latency envelope), stated
precisely enough to test.

### Layer 2: The mechanism
The data structures, algorithms, protocol messages and state machines that deliver the contract.
Name real fields, message types, file layouts or algorithm steps from real implementations
(for example Postgres, Linux, Kafka, etcd, Envoy, Redis).

### Layer 3: The machine
What actually happens on the hardware and in the OS: syscalls (`fsync`, `epoll_wait`, `sendfile`,
`mmap`), page cache, write-ahead logs on disk, sector or page sizes, TCP segments, retransmits and
congestion windows, NIC queues, CPU cache lines, memory allocation, GC pauses, bytes on the wire.
Use real numbers (ns, us, ms; bytes; IOPS).

### Why it's built this way
A chain of 3–5 "why" steps that traces each design decision back to a physical or economic
constraint (for example: disks are slow at random writes, so append to a log; logs grow, so
compact; compaction costs I/O, so throttle it).

## Diagram
One mermaid diagram (```mermaid fenced block) that shows the actual mechanism: flowchart,
sequenceDiagram, or stateDiagram-v2. Keep node labels short; use quoted labels when they hold
punctuation, e.g. A["Client (browser)"]. No styling or classDef lines.

## Worked example
A concrete scenario with real numbers (QPS, bytes, latency, cost) or a code sketch.

## Trade-offs
A Markdown table, for example: | Option | Strengths | Weaknesses | Choose when |

## Pitfalls in production
- 4–6 bullets of things that go wrong in real systems, with the fix.

## Leadership lens
- 3–5 bullets: decisions, questions to ask in design review, operational and organisational cost.

## Check yourself
1. A question that tests understanding, not recall?
   **Answer:** A 1–3 sentence answer.
2. (3–4 questions in total, in exactly this two-line shape)

## Practice
**Task:** A hands-on coding problem that implements this chapter's core mechanism (for example a
token bucket, consistent-hash ring, vector clock, LRU with TTL, saga orchestrator, Bloom filter, or a
retry-with-jitter helper). 3–6 sentences: inputs, outputs, constraints. Must be solvable in 20–60 min.

```python starter
# Names the tests call. Bodies left as TODO; must import and run.
def example(x):
    # TODO
    raise NotImplementedError
```

```python tests
def test_basic_case():
    assert example(1) == 2

def test_edge_case():
    assert example(0) == 0, "zero stays zero"
```

```python solution
def example(x):
    return x * 2
```

The same problem is then given in **TypeScript** and **Go**, with the same behaviour and
equivalent tests, as six more blocks in this order: ```typescript starter, ```typescript tests,
```typescript solution, ```go starter, ```go tests, ```go solution.

Practice rules:

- **All languages:** deterministic. No I/O, network, real time or sleeps; inject a clock or random
  source as a parameter. 4–8 tests including edge cases. The starter must compile and run but
  leave tests failing (`raise NotImplementedError`, `throw new Error("TODO")`, `panic("TODO")`).
- **Python:** standard library only, and only these modules: collections, heapq, bisect, math,
  random, itertools, functools, hashlib, dataclasses, typing, enum, string, struct, zlib, json.
  Tests are plain `def test_*():` functions using `assert`. The code also runs in the browser
  through Brython, so avoid `match` statements and walrus operators inside comprehensions.
- **TypeScript:** compiles under `tsc --strict`, target ES2020, no imports. Export the names the
  tests use (`export function ...`, `export class ...`). Tests use only `test(name, fn)`,
  `assert(cond, msg)` and `assertEqual(actual, expected, msg)` (deep equality via JSON).
- **Go:** `package practice`, standard library only, exported identifiers. Tests are a normal
  `package practice` file with `import "testing"` and `func TestXxx(t *testing.T)`. Use idiomatic
  Go (errors as values; a `sync.Mutex` where the problem involves concurrency).
- Verify with `python3 lessons/check_practice.py <lesson file>`. It must print OK for every
  language: all tests pass on `solution`, and at least one fails on `starter`.

## Mock interview
**Prompt:** One realistic interview scenario that makes the candidate apply this chapter (2–3 sentences, with scale numbers where relevant).

- Follow-up: a probe that goes one level deeper.
- Follow-up: a probe about a failure mode or edge case.
- Follow-up: a probe about a trade-off or alternative.

**A strong answer covers:**
- 4–6 bullets that a staff-level interviewer would expect to hear.

## Watch
- [Video title (Channel)](https://www.youtube.com/watch?v=...): one line on what it covers.
- 1–3 YouTube videos. Verify each exists with
  `curl -s -o /dev/null -w '%{http_code}' 'https://www.youtube.com/oembed?format=json&url=<video URL>'`
  (must return 200). Prefer conference talks, university lectures (MIT 6.824/6.5840, Kleppmann's
  Cambridge lectures, CMU Database Group), and well-known engineering channels (ByteByteGo,
  Hussein Nasser, InfoQ, Strange Loop, GOTO). Omit the section if you can't verify any video.

## Free resources
- [Title](https://...): one line on why it's worth reading.
- 3–6 links, free to read (no paywalls or sign-up walls).
```

## Rules

- Length: 1300–2200 words of prose, excluding the diagram and all code blocks.
- Markdown subset only: `##`/`###` headings, paragraphs, `-` bullets, `1.` numbered lists,
  tables, fenced code blocks, **bold**, *italic*, `code`, [links](https://...).
  **No nested lists.** No HTML. No images.
- Code sketches are short (under 30 lines) in Python, Go, Java, SQL, or pseudocode.
- Resources: prefer primary and canonical sources, such as official docs, papers (author or
  publisher PDFs), RFCs, AWS Builders' Library, Google SRE books, Azure Architecture Center,
  martinfowler.com, microservices.io, Jepsen, Kleppmann's blog, Cloudflare and other engineering
  blogs, MIT 6.5840, and Wikipedia for background. Check every URL returns HTTP 200
  (`curl -sIL -o /dev/null -w '%{http_code}' URL`). Drop any link that doesn't.
- Tone: plain, direct, precise. No filler, no hype, no em-dash asides.

## Variant: interview design questions (`lessons/sdi/design-*.md`)

"Design X" chapters walk through a full 45-minute interview answer at staff level instead of
following the concept-lesson sections above. Use these `##` sections in order:

1. **In one minute**: the 3–5 decisions that make or break this design.
2. **Requirements**: functional and non-functional (as two short lists), plus what's explicitly out of scope.
3. **Back-of-envelope**: DAU, QPS (average and peak), storage per day and over 5 years, bandwidth. Show the arithmetic.
4. **API**: the main endpoints or RPCs with request and response shapes (code block).
5. **Data model**: tables or documents with keys, indexes and the partition key, with the reasoning for each.
6. **High-level design**: one mermaid flowchart, then a walkthrough of the write path and the read path.
7. **Deep dives**: the 3 hardest parts, each a `### ` subsection with the options considered and the choice made.
8. **Down the stack**: same four subsections as concept lessons, applied to this system's critical path.
9. **Failure modes**: what breaks at 10x load, in a region outage, or with a hot key, and the mitigation for each.
10. **Trade-offs**: table.
11. **Leadership lens**: rollout plan, team ownership, cost drivers, and what you'd build first.
12. **Check yourself**: 4 questions in the same two-line shape as concept lessons, covering a failure mode, a trade-off, and the numbers or data model.
13. **Practice**: code the core component (for example a fan-out worker, a geohash index, a seat-hold state machine, an idempotent payment ledger) in the same three-language format and rules.
14. **Mock interview**, **Watch**, **Free resources**: same as concept lessons. The mock prompt is the
    question itself, with interviewer-style probes.

Length for design questions: 1800–3000 words of prose, excluding diagrams and code.

Concept chapters in `lessons/sdi/` (technology deep dives such as Kafka or Redis, interview patterns,
and tips) use the standard concept format. For technology deep dives, "Down the stack" should cover
the real internals: storage format, replication protocol, threading model, and configuration that matters.

## Variant: problem solving and incidents (`lessons/ps/`)

Use the standard concept-lesson sections. Adjust them as follows:

- **Down the stack** goes from the human process (Layer 1), to the technical mechanism being
  debugged or recovered (Layer 2), to what happens on the machine (Layer 3). Examples: what `strace`,
  `perf` or eBPF actually observe, how a core dump or heap snapshot is laid out, how BGP withdrawals
  propagate. "Why it's built this way" explains why the practice exists.
- **Practice** builds a real tool a problem solver uses, in all three languages: for example a
  bisect driver over a commit list with a test oracle, log anomaly detection against a baseline,
  folding stack samples into flame-graph counts, finding the first divergent event in two traces,
  a happens-before race detector over an event log, a 5-whys causal graph walker, an RTO/RPO
  calculator from a backup schedule, or an incident timeline builder that merges events from many sources.
- **Case studies** (`case-*`) must be factually accurate and based on the company's own published
  postmortem or an official regulatory filing, linked under Free resources. Include the timeline, the
  technical root cause, contributing factors, detection and mitigation, what changed afterwards, and
  "what I would have done as the Tech Lead". Don't invent details: if the public record doesn't say,
  say that it doesn't.
- **Mock interview** for these chapters is often a live scenario ("It's 2 a.m., p99 latency is 10x
  and error rates are climbing; walk me through it") or a behavioral question about leading an incident.

## Variant: low-level design (`lessons/lld/`)

Concept chapters (principles, patterns, tips) use the standard concept format. For patterns,
"Down the stack" covers what the pattern costs at runtime: allocation, dispatch (virtual calls,
interface tables in Go, prototype chains in JS), memory layout, and concurrency.

"Design X" chapters (for example Parking Lot or Elevator) walk through a 45–60 minute
object-oriented design or machine-coding interview. Use these `##` sections in order:
In one minute, Requirements, Entities and relationships, Class diagram (a mermaid `classDiagram`),
Key flows (one mermaid `sequenceDiagram`), Design patterns used and why, Concurrency and edge cases,
Down the stack, Extensibility (what changes when requirements change), Leadership lens, Check yourself,
Practice, Mock interview, Watch, Free resources.

Practice is the core of the design, implemented and tested in idiomatic Python, TypeScript and Go:
classes or structs, interfaces, and the main operations, with an injected clock where time matters.
Length: 1500–2600 words of prose excluding diagrams and code.

## Sources and evidence (every lesson)

Every lesson is checked against several independent sources, never just one course. Use different
source types: primary papers, RFCs and specs; official docs of real systems; engineering blogs and
public postmortems; standard books (cited by title, author and chapter, never quoted at length);
and open curricula (system-design-primer, roadmap.sh, Azure Architecture Center, AWS Builders'
Library). Never use paid courses. Shared, pre-verified references live in `sources/books.md` and
`sources/incidents/*.md`; prefer them and add to them rather than searching again.

- **Gap check.** Where another source teaches something this lesson misses or gets wrong, fix it in
  the existing section, in original words. Quotes stay rare and under 15 words.
- **Inline citations.** Cite the claims that matter (specific numbers, defaults, behaviours, dates)
  as a Markdown link at the point of the claim: `... aborts with SQLSTATE 40001 ([Postgres docs](url)).`
  Targets: 8–12 per lesson in `sd`, `sdi`, `ai`, `fd`; 5–8 in `lld` and `ps`. Only cite pages you
  opened and that support the claim.
- **`## In the wild`.** 2–3 bullets, each a real, verified production incident or write-up:
  `- **Company, year: short title.** What happened, the numbers, the mechanism, what changed ([source](url)).`
  Place it after `## Worked example`; in design lessons after `## Failure modes` (sdi) or
  `## Concurrency and edge cases` (lld). In `ps/case-*` lessons, which are already incidents, use it
  for 2–3 *similar* incidents elsewhere. Drop an incident if no primary source can be found.
- **`## Sources and further study`.** Placed right before `## Watch` (or before `## Free resources`
  if there is no Watch). 6–12 entries under the bold labels **Primary**, **Systems docs**,
  **Books**, **Other curricula** (one line each on how that curriculum frames the topic). No
  duplicates of Free resources.
- These two sections do not count toward the word limits above; the rest of the lesson may grow by
  up to about 400 words for gap fixes.
- Run `python3 tools/check_sources.py <lesson files>` after editing.
