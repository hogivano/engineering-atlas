# Projects

Lesson practice takes 20 to 60 minutes. These projects take a few evenings each and leave you with
something you can show: a repository, a short design doc and numbers you measured yourself. Use any
language. Each project lists the problem shapes it trains and the lessons to read first. Write your
SDRC on the Whiteboard page before you start coding, and let an agent help with the typing, not
the thinking.

## Idempotent payments ledger
**Level:** Beginner to intermediate
**Time:** 8 to 12 hours
**Shapes:** Duplicates, Contention, Trust but verify
**Lessons:** ps/one-problem-five-domains, sd/outbox-pattern, sdi/design-payment-system, ps/concurrency-bugs

Build a small HTTP service that moves money between accounts with a double-entry ledger. Every request carries an idempotency key; balances must never go negative; a nightly job reconciles balances against ledger entries.

### Milestones
1. Schema: accounts, ledger entries (two rows per transfer), idempotency keys with request fingerprint.
2. `POST /transfers` with an idempotency key: replay returns the stored response, a different body with the same key is rejected.
3. Concurrency: transfers use a conditional update or row locks so balances never go negative under 200 concurrent requests.
4. Reconciliation job that recomputes every balance from the ledger and reports mismatches.
5. Load test with retries and random client timeouts; prove zero duplicates and zero negative balances.

### Done when
- A script sends 10,000 transfers with 20 percent retried requests and the reconciliation reports zero mismatches.
- Your README states the invariants and shows how each is enforced.

## Rate limiter service
**Level:** Intermediate
**Time:** 8 to 12 hours
**Shapes:** Overload, Hot spots, Contention
**Lessons:** sdi/design-rate-limiter, sdi/redis, sdi/traffic-spikes, sd/circuit-breaker-pattern

Build a rate limiting service used by other services over HTTP or gRPC, backed by Redis, supporting token bucket and sliding window limits per API key.

### Milestones
1. Token bucket per key with an atomic Redis script, returning remaining quota and retry-after.
2. Sliding window counter as a second algorithm; compare accuracy and memory use.
3. Fail-open or fail-closed behaviour when Redis is down, chosen deliberately and documented.
4. Hot key handling: one API key at 50 times normal traffic must not slow other keys.
5. Load test at a target rate and report p50 and p99 latency added by the limiter.

### Done when
- Under load, allowed requests stay within 1 percent of the configured limit.
- Killing Redis produces the behaviour your design doc predicted.

## Event pipeline with outbox and dedup
**Level:** Intermediate
**Time:** 10 to 15 hours
**Shapes:** Duplicates, Ordering, Multi-step consistency
**Lessons:** sd/outbox-pattern, sd/delivery-semantics, sdi/kafka, sd/dead-letter-queues, sdi/deduplicating-data

Build an order service that writes orders and events in one transaction (outbox), a relay that publishes them to a log or queue, and a consumer that updates a read model exactly once per event.

### Milestones
1. Outbox table written in the same transaction as the order.
2. Relay that publishes outbox rows in order and marks them sent, safe to restart at any point.
3. Consumer with a processed-events table so redelivered events are ignored.
4. Per-order ordering: events for one order are applied in sequence, using a version check.
5. Dead-letter handling for poison messages, with a replay command.

### Done when
- Killing the relay and consumer at random points during a 50,000-order run leaves the read model exactly consistent with the orders table.

## Incident lab: break it, find it, fix it
**Level:** Intermediate
**Time:** 8 to 12 hours
**Shapes:** Partial failure, Overload, Trust but verify
**Lessons:** ps/observability-driven-debugging, ps/debugging-distributed-systems, ps/chaos-engineering-and-game-days, ps/blameless-postmortems, ps/root-cause-analysis

Run three small services locally (for example with Docker Compose) with metrics, logs and traces. Inject failures, debug them using only your observability, and write postmortems.

### Milestones
1. Three services with OpenTelemetry tracing, structured logs with trace IDs, and RED metrics on a dashboard.
2. Inject latency with `tc netem` on one dependency and find it from traces alone.
3. Inject a retry storm (retries at every layer) and show metastable behaviour; fix with a retry budget.
4. Inject a memory leak and find it with heap profiles.
5. Write a blameless postmortem for one injected failure, with a causal graph and action items.

### Done when
- A friend injects a failure you do not know about, and you localise it within 15 minutes using your dashboards and traces.

## Agent with guardrails
**Level:** Intermediate to advanced
**Time:** 12 to 20 hours
**Shapes:** Trust but verify, Duplicates, Partial failure
**Lessons:** ps/guardrails-for-agents, ps/agent-caused-incidents, ps/debugging-llm-systems, ps/context-engineering, ps/verifying-agent-written-code

Build a tool-using AI agent for a narrow job, such as triaging support tickets against a small database, and wrap it in production-grade guardrails.

### Milestones
1. Tools with least privilege: read-only database access, and one write tool that requires approval.
2. A permission engine with allow, ask and deny rules, and a tool-call audit log stored outside the agent.
3. Idempotency keys on every side-effecting tool call, derived from task and step.
4. An eval set of 50 real-looking cases with checks, run on every prompt or model change.
5. A prompt-injection test: a ticket that tries to make the agent leak data or act outside its role.

### Done when
- Your eval pass rate and injection test results are in the README, and the audit log can reconstruct any session.

## Capstone: a booking platform, end to end
**Level:** Advanced
**Time:** 30 to 50 hours
**Shapes:** All ten
**Lessons:** ps/whiteboard-first, ps/spec-driven-development, sdi/design-movie-booking-system, sdi/preventing-double-booking, ps/shipping-agent-code-safely, ps/disaster-recovery

Design and build a booking platform for a domain you choose (concert seats, clinic appointments, dock doors, meeting rooms). Use agents for implementation, but own the design, the spec and the verification yourself.

### Milestones
1. Whiteboard: name the problem shapes in your domain, draw the design, write an SDRC.
2. Spec: numbered requirements, non-goals and invariants, with a traceability check in CI.
3. Build: holds with expiry, idempotent booking, payment saga, notifications through an outbox.
4. Operate: dashboards, alerts, a canary deploy with automatic rollback, and a restore drill with measured RTO and RPO.
5. Game day: inject at least three failures, run the response, and write postmortems.
6. Write-up: a short design doc explaining which shapes appeared and how your domain changed only the parameters.

### Done when
- Another engineer can read your design doc and README, run the system, and reproduce your load test and restore drill.
