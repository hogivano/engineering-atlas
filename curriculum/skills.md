# Engineering skills matrix

A career-ladder view of the Engineering Atlas. Ten skills a company would recognise on an engineering ladder, each with three levels (Mid, Senior, Staff). For every level the matrix lists:

- **Expectation**: the behaviour you would observe from someone working at that level.
- **Evidence lessons**: the lessons whose mastery is the evidence for that level.
- **Assessments**: curriculum modules (see [system-design-curriculum.md](system-design-curriculum.md)) whose server-graded assessment must be passed at that level. Mid has none; Senior and Staff have one or two.

The machine-readable source is [skills.json](skills.json); this page is the readable version of the same data. Lesson keys are `<course>/<slug>` and map to `lessons/<course>/<slug>.md` (courses: `fd` Foundations, `sd` System Design, `sdi` System Design Interviews, `lld` Low-Level Design, `ps` Problem Solving, `ai` AI Systems).

## How readiness is computed

1. **Mastered lesson**: a lesson is mastered when the learner scores **70% or more** on that lesson's check.
2. **Level ready**: a learner is ready at a level in a skill when **every lesson listed at that level and at all lower levels** is mastered **and** every assessment listed at that level and below is passed. Levels are cumulative: Senior-ready means the Mid and Senior lists are both mastered and the Senior assessments are passed; Staff-ready adds the Staff list and Staff assessments.
3. **Progress** within a level is the share of that level's lessons mastered, so a learner can see they are, say, "Senior 9/14" in Data storage.
4. Each lesson belongs to exactly one skill, so a lesson's score counts once and the skills do not double-count each other.

Readiness is evidence of knowledge, not a promotion decision. The expectation sentence describes behaviour at work, which a manager still has to observe; the lessons and assessments show the person has the knowledge to produce it.

## Overview

| Skill | Mid | Senior | Staff | Senior assessments | Staff assessments |
|---|---|---|---|---|---|
| Systems fundamentals | 11 | 12 | 10 | M2 | M14 |
| APIs, communication and security | 12 | 13 | 13 | M3, M4 | M19 |
| Data storage and modelling | 12 | 15 | 14 | M5, M6 | M9, M20 |
| Scaling and performance | 10 | 14 | 13 | M7, M8 | M18 |
| Distributed systems and consistency | 10 | 14 | 14 | M10 | M11 |
| Reliability, observability and incident response | 12 | 15 | 12 | M12 | M16, M17 |
| Software design (LLD, OOP and patterns) | 15 | 15 | 10 | M15 | M13 |
| System design interviewing | 13 | 13 | 13 | M8 | M18 |
| AI systems engineering | 7 | 8 | 7 | M8 | M16, M19 |
| Technical leadership and decisions | 8 | 7 | 7 | M1 | M13, M14 |

## Systems fundamentals

`systems-fundamentals`: How code, operating systems and networks actually run underneath a service: processes, memory, TCP/IP, DNS, HTTP and the edge.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Explains what happens between a user's click and a database row, and debugs a slow or failing request with the shell, logs and basic network tools. | `fd/how-computers-run-code`<br>`fd/processes-threads-async`<br>`fd/networking-basics`<br>`fd/http-and-the-web`<br>`fd/linux-command-line`<br>`fd/backend-data-structures`<br>`fd/databases-101`<br>`sd/client-server-architecture`<br>`sd/ip-address`<br>`sd/domain-name-system-dns`<br>`sd/tcp-vs-udp` | none |
| **Senior** | Reasons about latency, connection reuse, TLS and proxies on the real request path and sizes the edge (load balancers, CDN) for a service they own. | `sd/osi`<br>`sd/http-https`<br>`sd/ssl-tls`<br>`sd/forward-and-reverse-proxies`<br>`sd/load-balancers`<br>`sd/content-delivery-network-cdn`<br>`sdi/networking`<br>`sd/latency-vs-throughput`<br>`sd/data-compression`<br>`sd/data-formats`<br>`ps/concurrency-bugs`<br>`ps/memory-and-resource-leaks` | M2 |
| **Staff** | Sets the platform shape for many teams (containers, orchestration, service mesh, global traffic routing) and explains which layer a cross-team failure lives in. | `sd/anycast-routing`<br>`sd/dns-load-balancing`<br>`sd/webrtc`<br>`sd/service-mesh`<br>`sd/sidecar-pattern`<br>`sdi/nginx`<br>`sdi/docker`<br>`sdi/kubernetes`<br>`sd/peer-to-peer`<br>`sdi/lambda` | M14 |

## APIs, communication and security

`apis-communication`: Designing contracts between components: API styles, synchronous and asynchronous messaging, identity, and protecting data in transit and at rest.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Designs a clear, versioned REST endpoint with authentication and picks polling, WebSockets, SSE or a queue appropriately for a feature. | `sd/what-is-an-api`<br>`sd/api-styles`<br>`sd/rest-api-design`<br>`sdi/api-design`<br>`sd/authentication-authorization`<br>`sd/session-vs-token-auth`<br>`sd/jwt`<br>`sd/websockets`<br>`sd/long-polling`<br>`sd/server-sent-events`<br>`sd/webhooks`<br>`sd/message-queues` | none |
| **Senior** | Makes APIs safe to retry and safe to overload (idempotency keys, rate limits, gateways) and chooses delivery semantics for an event flow with failure handling. | `sd/graphql`<br>`sd/grpc`<br>`sd/api-gateways`<br>`sd/api-gateway-pattern`<br>`sd/backend-for-frontend`<br>`sd/idempotency`<br>`sd/rate-limiting`<br>`sd/oauth`<br>`sd/pub-sub`<br>`sd/message-brokers`<br>`sd/delivery-semantics`<br>`sd/dead-letter-queues`<br>`sdi/realtime-updates` | M3, M4 |
| **Staff** | Owns the organisation's integration and identity strategy: event backbone, SSO and access models, secrets and encryption, with a threat model for each external surface. | `sd/event-driven-architecture`<br>`sdi/kafka`<br>`sdi/rabbitmq`<br>`sdi/sqs`<br>`sd/sso`<br>`sd/saml`<br>`sd/rbac`<br>`sd/secrets-management`<br>`sd/encryption-at-rest`<br>`sd/password-management`<br>`sdi/design-api-gateway`<br>`sdi/design-rate-limiter`<br>`sdi/design-slack` | M19 |

## Data storage and modelling

`data-storage`: Choosing and modelling data stores, understanding how engines store and retrieve data, and running data platforms for analytics.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Models a schema for a feature, adds the right indexes, uses transactions correctly, and justifies SQL versus a key-value or document store. | `sd/database-types`<br>`sd/relational-databases`<br>`sd/sql-vs-nosql`<br>`sd/indexing`<br>`sd/acid-transactions`<br>`sd/key-value-stores`<br>`sd/document-databases`<br>`sd/object-storage`<br>`sdi/database-design`<br>`sdi/database-selection`<br>`sdi/postgresql`<br>`sdi/redis` | none |
| **Senior** | Predicts store behaviour from its engine (B-tree vs LSM, durability, query plans), denormalises deliberately, and ships zero-downtime schema migrations. | `sd/b-trees`<br>`sd/lsm-trees`<br>`sd/how-databases-guarantee-durability`<br>`sd/query-optimization`<br>`sd/denormalization`<br>`sd/wide-column-databases`<br>`sd/graph-databases`<br>`sd/time-series-databases`<br>`sd/full-text-search-engines`<br>`sd/schema-migrations`<br>`sdi/dynamodb`<br>`sdi/mysql`<br>`sdi/mongodb`<br>`sdi/elasticsearch`<br>`sdi/s3` | M5, M6 |
| **Staff** | Designs the data platform across operational and analytical stores (CDC, streams, lakehouse), and plans for corruption, recovery and data ownership between teams. | `sd/distributed-file-systems`<br>`sd/data-warehousing`<br>`sd/data-lakes`<br>`sd/data-lakehouse`<br>`sd/etl-pipelines`<br>`sd/batch-vs-stream-processing`<br>`sd/change-data-capture-cdc`<br>`sd/streaming-engines`<br>`sd/lambda-architecture`<br>`sd/kappa-architecture`<br>`sdi/cassandra`<br>`sdi/flink`<br>`sdi/design-object-storage`<br>`ps/data-corruption-recovery` | M9, M20 |

## Scaling and performance

`scaling-performance`: Making systems handle more load and respond faster: caching, replication, partitioning, estimation and specialised data structures.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Estimates load with back-of-envelope numbers and applies caching, read replicas and connection pooling to fix a read-heavy bottleneck. | `sd/scalability`<br>`sd/what-is-caching`<br>`sd/caching-strategies`<br>`sd/cache-eviction-policies`<br>`sd/load-balancing-algorithms`<br>`sd/connection-pooling`<br>`sd/database-replication`<br>`sdi/caching`<br>`sdi/estimation-cheatsheet`<br>`sdi/high-read-traffic` | none |
| **Senior** | Handles write scaling and hot spots: chooses a partition key, plans for stampedes and invalidation, and absorbs traffic spikes without data loss. | `sd/cache-invalidation`<br>`sd/cache-stampede`<br>`sd/cache-warming`<br>`sd/distributed-caching`<br>`sd/database-partitioning`<br>`sd/sharding`<br>`sd/consistent-hashing`<br>`sd/materialized-views`<br>`sdi/high-write-traffic`<br>`sdi/hot-keys`<br>`sdi/traffic-spikes`<br>`sdi/memcached`<br>`sdi/fanout`<br>`sdi/handling-large-files` | M7, M8 |
| **Staff** | Produces capacity and cost forecasts for 10x growth and reaches for probabilistic and geospatial structures when exact answers cost too much. | `sd/probabilistic-data-structures`<br>`sd/bloom-filters`<br>`sd/cuckoo-filter`<br>`sd/count-min-sketch`<br>`sd/hyperloglog`<br>`sd/skip-lists`<br>`sd/geohash`<br>`sd/quad-tree`<br>`sd/s2-h3`<br>`sdi/distributed-counting`<br>`sdi/media-streaming`<br>`sdi/design-key-value-store`<br>`ps/performance-debugging` | M18 |

## Distributed systems and consistency

`distributed-systems`: Reasoning about time, failure, coordination and consistency when state lives on more than one machine or service.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Names the consistency a feature needs, recognises partitions and single points of failure, and avoids duplicate IDs and lost updates across nodes. | `sd/challenges-of-distribution`<br>`sd/cap-theorem`<br>`sd/consistency-models`<br>`sd/network-partitions`<br>`sd/heartbeats`<br>`sd/leader-election`<br>`sd/single-points-of-failure`<br>`sd/service-discovery`<br>`sdi/distributed-systems`<br>`sdi/generating-unique-ids` | none |
| **Senior** | Coordinates work across services with sagas, outbox and fencing rather than naive locks, and explains clock and ordering hazards in a design review. | `sd/clock-synchronization`<br>`sd/logical-clocks`<br>`sd/lamport-timestamps`<br>`sd/vector-clocks`<br>`sd/split-brain-problem`<br>`sd/distributed-locks`<br>`sd/two-phase-commit-protocol`<br>`sd/saga-pattern`<br>`sd/outbox-pattern`<br>`sd/distributed-transactions-problems`<br>`sdi/distributed-transactions`<br>`sdi/keeping-data-in-sync`<br>`sdi/preventing-double-booking`<br>`sdi/zookeeper` | M10 |
| **Staff** | Chooses consistency models per data domain and explains the cost of each to non-specialists, including when consensus, CRDTs or event sourcing are worth it. | `sd/consensus-algorithms`<br>`sd/raft-algorithm`<br>`sd/paxos-algorithm`<br>`sd/gossip-protocol`<br>`sd/three-phase-commit`<br>`sd/crdts`<br>`sd/operational-transformation`<br>`sd/merkle-trees`<br>`sd/event-sourcing`<br>`sd/cqrs`<br>`sdi/design-key-value-store`<br>`sdi/design-locking-service`<br>`sdi/deduplicating-data`<br>`ps/debugging-distributed-systems` | M11 |

## Reliability, observability and incident response

`reliability-operations`: Keeping services up and changes safe: instrumentation, debugging, resilience patterns, progressive delivery and running incidents.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Instruments their code with logs and metrics, reproduces and bisects bugs methodically, and ships through CI/CD with sensible alerts. | `sd/availability`<br>`sd/reliability`<br>`sd/logging`<br>`sd/metrics-instrumentation`<br>`sd/three-pillars-observability`<br>`sd/alert-monitoring`<br>`sd/ci-cd-pipelines`<br>`sd/rolling-deployments`<br>`ps/reproducing-bugs`<br>`ps/scientific-debugging`<br>`ps/bisecting`<br>`ps/owning-code-you-didnt-write` | none |
| **Senior** | Leads mitigation in the first minutes of an incident, finds root cause from traces and dashboards, and builds timeouts, breakers and canaries into what they ship. | `sd/handling-failures-in-distributed-systems`<br>`sd/circuit-breaker-pattern`<br>`sd/bulkhead-pattern`<br>`sd/distributed-tracing`<br>`sd/log-aggregation`<br>`sd/dashboards-runbooks`<br>`sd/blue-green-deployments`<br>`sd/canary-releases`<br>`sd/feature-flags`<br>`sdi/surviving-component-failures`<br>`ps/incident-first-15-minutes`<br>`ps/mitigate-first`<br>`ps/observability-driven-debugging`<br>`ps/hypothesis-driven-investigation`<br>`ps/root-cause-analysis` | M12 |
| **Staff** | Sets reliability strategy across teams (SLOs, game days, disaster recovery, incident roles) and draws systemic lessons from industry outages. | `sd/deployment-strategies`<br>`sd/rollbacks-and-immutable-infrastructure`<br>`ps/chaos-engineering-and-game-days`<br>`ps/disaster-recovery`<br>`ps/incident-roles`<br>`ps/security-incident-response`<br>`ps/case-aws-s3-2017`<br>`ps/case-cloudflare-2019`<br>`ps/case-crowdstrike-2024`<br>`ps/case-facebook-2021`<br>`ps/case-gitlab-2017`<br>`ps/case-aws-dynamodb-2025` | M16, M17 |

## Software design (LLD, OOP and patterns)

`software-design`: Code-level design: object modelling, SOLID, design patterns, concurrency in-process and architectural styles inside a service.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Writes clean, well-encapsulated classes with single responsibilities and can turn a small brief such as a parking lot into a working class model. | `lld/what-is-lld`<br>`lld/classes-and-objects`<br>`lld/encapsulation`<br>`lld/abstraction`<br>`lld/inheritance`<br>`lld/polymorphism`<br>`lld/interfaces`<br>`lld/composition`<br>`lld/srp`<br>`lld/ocp`<br>`lld/dry`<br>`lld/kiss`<br>`lld/writing-clean-code`<br>`lld/class-diagram`<br>`lld/design-parking-lot` | none |
| **Senior** | Applies SOLID and the common patterns to keep modules decoupled and testable, and handles shared state safely in concurrent code. | `lld/lsp`<br>`lld/isp`<br>`lld/dip`<br>`lld/dependency-injection`<br>`lld/coupling-and-cohesion`<br>`lld/strategy`<br>`lld/observer`<br>`lld/factory-method`<br>`lld/builder`<br>`lld/decorator`<br>`lld/adapter`<br>`lld/state`<br>`lld/repository`<br>`lld/handling-concurrency`<br>`lld/design-elevator-system` | M15 |
| **Staff** | Chooses architectural styles and pattern vocabulary for a codebase many teams share, and designs correctness-critical domains (payments, matching, versioning). | `lld/choosing-design-patterns`<br>`sd/hexagonal-architecture`<br>`sd/serverless-architecture`<br>`lld/producer-consumer`<br>`lld/thread-pool`<br>`lld/mediator`<br>`lld/specification`<br>`lld/design-version-control-system`<br>`lld/design-payment-gateway`<br>`lld/design-online-stock-exchange` | M13 |

## System design interviewing

`system-design-interviewing`: Communicating a design under time pressure: framing, estimating, diagramming, deep dives and level-appropriate trade-offs.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Delivers a complete, sensible design for a well-known prompt with guidance: requirements, API, data model and a working high-level diagram. | `sd/what-is-system-design`<br>`sd/core-concepts-map`<br>`sdi/what-interviews-measure`<br>`sdi/question-types`<br>`sdi/answering-framework`<br>`sdi/diagramming-tips`<br>`sdi/default-stack`<br>`sdi/design-url-shortener`<br>`sdi/design-url-shortener`<br>`sdi/design-leaderboard`<br>`lld/lld-vs-hld`<br>`lld/ood-approach`<br>`lld/machine-coding-approach` | none |
| **Senior** | Drives the session, reaches a high-level design by minute 20, then proposes and goes deep on the hard parts with failure modes and trade-offs. | `sdi/expectations-by-level`<br>`sdi/tradeoffs`<br>`lld/lld-interview-types`<br>`sdi/design-whatsapp`<br>`sdi/design-news-feed`<br>`sdi/design-youtube`<br>`sdi/design-uber`<br>`sdi/design-movie-booking-system`<br>`sdi/design-web-crawler`<br>`sdi/design-search-autocomplete-system`<br>`sdi/design-top-k`<br>`sdi/design-google-drive`<br>`sdi/design-notification-service` | M8 |
| **Staff** | Reshapes the problem, then covers rollout, migration, operating cost and evolution for correctness-critical, high-scale prompts. | `sdi/design-payment-system`<br>`sdi/design-stock-exchange`<br>`sdi/design-payment-system`<br>`sdi/design-google-docs`<br>`sdi/design-ad-click-aggregator`<br>`sdi/design-flash-sale`<br>`sdi/design-google-maps`<br>`sdi/design-youtube`<br>`sdi/design-job-scheduler`<br>`sdi/design-messaging-queue`<br>`sdi/design-monitoring-and-alerting-system`<br>`sdi/design-cicd-pipeline`<br>`sdi/design-cdn` | M18 |

## AI systems engineering

`ai-systems`: Building and operating LLM-powered features and working effectively with coding agents: RAG, tools, evals, cost and safety.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Builds a retrieval-augmented feature with structured output and tool calls, and reviews agent-written code before trusting it. | `ai/llm-application-basics`<br>`ai/structured-output-and-tool-use`<br>`ai/embeddings-and-vector-search`<br>`ai/rag-architecture`<br>`ps/problem-solving-in-the-ai-era`<br>`ps/verifying-agent-written-code`<br>`ps/context-engineering` | none |
| **Senior** | Designs agents with memory and state, runs evals in production, routes models by cost and quality, and debugs non-deterministic LLM failures. | `ai/agent-architectures`<br>`ai/agent-memory-and-state`<br>`ai/llm-gateways-and-caching`<br>`ai/model-selection-and-cost`<br>`ai/evals-in-production`<br>`sd/vector-databases`<br>`ps/debugging-llm-systems`<br>`ps/debugging-with-agents` | M8 |
| **Staff** | Sets guardrails, observability, cost budgets and security policy for AI features and agents across the organisation, informed by agent-caused incidents. | `ai/ai-observability-and-cost`<br>`ai/ai-security-and-prompt-injection`<br>`ai/design-ai-support-assistant`<br>`ps/guardrails-for-agents`<br>`ps/shipping-agent-code-safely`<br>`ps/agent-caused-incidents`<br>`ps/case-replit-agent-2025` | M16, M19 |

## Technical leadership and decisions

`technical-leadership`: Framing problems, making and communicating decisions under uncertainty, evolving architecture and leading people through change and crisis.

| Level | Expectation | Evidence lessons | Assessments |
|---|---|---|---|
| **Mid** | Frames a problem before solving it, keeps designs simple, and writes reviewable changes with tests and clear descriptions. | `ps/framing-the-problem`<br>`ps/first-principles-and-mental-models`<br>`ps/naming-problem-shapes`<br>`ps/whiteboard-first`<br>`fd/git-testing-code-review`<br>`lld/yagni`<br>`lld/soc`<br>`lld/lod` | none |
| **Senior** | Writes specs and decision records that weigh options under uncertainty, transfers patterns across domains, and runs blameless reviews of what went wrong. | `ps/decisions-under-uncertainty`<br>`ps/spec-driven-development`<br>`ps/translating-domains`<br>`ps/same-problems-different-domains`<br>`ps/one-problem-five-domains`<br>`ps/blameless-postmortems`<br>`sd/ab-testing-infrastructure` | M1 |
| **Staff** | Sets multi-year architecture direction (monolith to services, multi-region, incremental migration), aligns teams on it, and leads calmly through a crisis. | `sd/monolithic-architecture`<br>`sd/microservices-architecture`<br>`sd/strangler-fig-pattern`<br>`sdi/multi-region-architecture`<br>`ps/leading-through-a-crisis`<br>`ps/incident-communication`<br>`ps/case-knight-capital-2012` | M13, M14 |

## Adapting the matrix to your own ladder

- **Rename and remap levels.** The three levels map to the usual L4/L5/L6 (E4/E5/E6, SDE II/Senior/Staff) rungs described in [Expectations by Level](../lessons/sdi/expectations-by-level.md). If your ladder has a Principal level, add a fourth key to `levels` and give it a list of lessons and assessments; if it starts at Junior, add a level before Mid using the `fd` course and the earliest `sd` lessons.
- **Drop, merge or split skills.** Skills are independent entries in `skills`. A platform team might drop *System design interviewing*; a product team might merge *Distributed systems* into *Data storage*; a security-heavy company might split *APIs, communication and security* into two skills. Keep each lesson in only one skill so scores are not double-counted.
- **Weight by role.** Not every role needs every skill at the same level. A common pattern is to require the target level in three or four core skills and one level lower in the rest, for example Senior backend = Senior in Data storage, Scaling, Distributed systems and Reliability, Mid elsewhere.
- **Change the bar.** The 70% mastery threshold and the assessment list are policy, not part of the content. Raise the threshold for promotion evidence, or add module assessments for skills you care about most.
- **Rewrite the expectations in your own words.** The expectation sentences are deliberately observable so they can be pasted into a ladder document; replace them with your company's wording and keep the lesson lists as the evidence.
- **Validate after editing.** Every lesson key must be a real file under `lessons/`, every assessment id must be a module heading (`### M<n>.`) in the curriculum, and no lesson should repeat within a skill.
