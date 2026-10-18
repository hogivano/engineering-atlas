# Whiteboard first: think analog, execute digital

AI is very good at producing polished answers, and polish hides uncertainty. People who see a
fluent, confident output tend to accept it without checking: researchers call this *automation
bias*. The whiteboard method is the counterweight. Before an agent writes code, a human works out
the problem, the decision and its risks in their own words, on a whiteboard or a blank page. Then
the agent executes. The order matters more than the tools.

## The sequence rule

1. **Frame it yourself.** Write the problem in one sentence and the success measure in numbers, with no AI open.
2. **Name the shapes.** Which of the ten problem shapes are present (contention, duplicates, ordering, fan-out, hot spots, overload, partial failure, multi-step consistency, finding things fast, trust but verify)?
3. **Draw the boxes.** Sketch components, data flow and the critical path. If you cannot draw it, you do not understand it yet.
4. **List assumptions and unknowns.** Mark each as known, estimated or guessed.
5. **Decide with SDRC.** Situation, Decision, Risk, Change, written by you.
6. **Turn it into a spec.** Invariants become tests, shapes become mechanisms, risks become checks.
7. **Hand execution to the agent.** It drafts code, docs and analysis inside the spec.
8. **Stress-test with AI, verify as a human.** Ask the agent to attack your plan, then check its output against the spec, not against how convincing it sounds.

## Four zones

| Zone | Stakes | Novelty | Strategy | Rule | Engineering examples |
|---|---|---|---|---|---|
| Analog first | High | High | Don't use AI first | Start on the whiteboard. Humans map the problem, assumptions and decision unassisted. Bring AI in later to organise, format or stress-test the human plan. | A new architecture, a data model for money, an incident strategy, a security design |
| Human gatekeeper | High | Low | Review every time | AI may draft or analyse, but a named human verifies every output against a fixed checklist or the whiteboard schematic before it ships. | Database migrations, access-control changes, production config, postmortem action items |
| Human-shaped | Low | High | AI as a first draft | AI proposes several options; the human chooses, edits and adds context and judgment. | Prototypes, internal tools, naming, exploring libraries, draft docs |
| Automate | Low | Low | Delegate fully | AI runs end to end. Humans watch aggregate metrics and spot-check, because errors are cheap and easy to undo. | Formatting, renames, test scaffolding, changelog drafts, log summaries |

## SDRC

- **Situation:** Plainly map the landscape, constraints and numbers, without help. What is true today?
- **Decision:** State the recommendation in one sentence and the reasoning that led there.
- **Risk:** Name the blind spots, unknowns and how uncertain you are. What would make this wrong?
- **Change:** Define the triggers that would make you change course, as measurable signals.

## REACT

- **Reason:** Why use AI for this task, or why not? Name the benefit before starting.
- **Evidence:** How will the output be verified? Tests, checklists, a second source, a human review.
- **Accountability:** Which named person owns the decision and its consequences if errors slip through?
- **Constraints:** Legal, privacy, security, compliance and ethical limits, and data the AI must not see.
- **Trade-offs:** Speed gained against quality, cost, and the team's own understanding lost.

## Practice scenarios

### Add an index to a 900 GB table
Zone: Human gatekeeper. An agent proposes `CREATE INDEX idx_orders_customer ON orders (customer_id)` to fix a slow customer page. The `orders` table is 900 GB, takes 3,000 writes a second, and runs on Postgres 16. Write your SDRC before reading the example.

- **Situation:** The customer orders page takes 4 s at p99 because it scans orders by customer; 900 GB table, 3,000 writes/s, peak at 12:00 to 14:00 UTC. A plain `CREATE INDEX` takes a lock that blocks writes for the whole build.
- **Decision:** Build it with `CREATE INDEX CONCURRENTLY` outside peak hours, after checking disk headroom (the index needs roughly 40 to 60 GB), then verify the plan with `EXPLAIN` on production-like data.
- **Risk:** A concurrent build can fail and leave an invalid index that still costs writes; extra I/O may slow replicas; I am estimating index size, not measuring it.
- **Change:** Cancel if replica lag passes 30 s or write latency p99 doubles; drop and retry if the index is left invalid; revisit if the page is still above 500 ms after the index.

### Pick a queue for a new event pipeline
Zone: Analog first. Product forecasts 20,000 events a second within a year; today you see 2,000. The options are managed Kafka (about 9,000 dollars a month) or a cloud queue service (about 2,500). Decide on the whiteboard first.

- **Situation:** 2,000 events/s today, a forecast of 20,000 that is uncertain (I would put it at 30 percent); consumers need ordering per customer only; the team has no Kafka experience.
- **Decision:** Start with the cloud queue behind a thin publishing interface, using per-customer message groups for ordering, because the expected cost of a later migration is lower than a year of unused Kafka capacity.
- **Risk:** If volume grows fast, migration lands during growth; per-customer ordering limits throughput for very large customers; vendor limits on message size.
- **Change:** Revisit when sustained volume passes 8,000 events/s, or when any consumer needs replay of more than 7 days of history.

### Checkout errors at 8 percent during an incident
Zone: Analog first. It is 30 minutes into an incident. Checkout errors are at 8 percent. Candidate causes: yesterday's index change (40 percent likely) or a payment provider degradation (60 percent). Reverting the index takes 20 minutes; failing over to the backup provider takes 5 minutes and raises fees by 0.4 percent.

- **Situation:** 8 percent checkout failures for 30 minutes, about 2,000 dollars of lost revenue a minute; two candidate causes; failover is fast and reversible, revert is slow and has lock risk.
- **Decision:** Fail over to the backup provider now while splitting error rates by provider to test the other hypothesis; revert the index only if errors persist on the backup provider.
- **Risk:** Failover costs fees and may hide a database problem; my probabilities come from a status page and intuition.
- **Change:** If errors stay above 2 percent 10 minutes after failover, start the index revert; fail back when the provider reports recovery and our error rate is below 0.5 percent.

### Let the support agent issue refunds
Zone: Analog first. Leadership wants the AI support agent to issue refunds automatically. You handle 30,000 conversations a day, and 4 percent ask for a refund averaging 40 dollars.

- **Situation:** About 1,200 refund requests a day, about 48,000 dollars; today humans approve each one in about 6 minutes; the agent reads untrusted customer messages.
- **Decision:** Allow automatic refunds up to 50 dollars on orders the customer owns, with an idempotency key per conversation step and a daily cap per customer; above 50 dollars the agent drafts and a human approves.
- **Risk:** Prompt injection in customer messages; duplicate refunds from tool timeouts; fraud patterns we have not seen; my 50 dollar line is a guess.
- **Change:** Lower the limit if refund rate per conversation rises more than 20 percent week on week, or if any duplicate refund appears in reconciliation.

### Rename a field across 40 services with an agent
Zone: Human gatekeeper. An API field `user_name` must become `display_name` across 40 services and 3 mobile apps. An agent can make the change in an afternoon.

- **Situation:** 40 services and 3 mobile apps read or write the field; old app versions stay installed for months; events with the old field are stored in Kafka for 7 days.
- **Decision:** Expand and contract: add `display_name`, write both, migrate readers service by service with agent-made pull requests reviewed by each owner, and remove `user_name` only after old app traffic is below 1 percent.
- **Risk:** Missed readers in services nobody owns; old mobile versions; replayed events with only the old field.
- **Change:** Pause removal if any service logs reads of `user_name` in the last 14 days; extend dual-writes if old app traffic stays above 1 percent.

### Generate onboarding docs from the codebase
Zone: Human-shaped. A new team wants an agent to write onboarding docs for a 200,000-line service.

- **Situation:** No up-to-date docs; new hires take about 3 weeks to make their first change; the service has 12 main modules.
- **Decision:** Let the agent draft one page per module and a request-flow walkthrough, each with file and line citations; two engineers review and correct it in an afternoon.
- **Risk:** Confident but wrong explanations; docs that rot as code changes.
- **Change:** Regenerate and re-review each quarter; if new hires report errors in the docs, require a reviewer sign-off per page.
