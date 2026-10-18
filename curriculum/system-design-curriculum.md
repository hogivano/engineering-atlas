# System Design: Complete Curriculum

A deep, self-paced System Design curriculum for engineers growing toward senior, staff and
tech lead roles. Every **Learn** item links to an original lesson on this site. Topic coverage
was compared with widely used design curricula and the canonical books, then extended with the
papers and engineering-org practices that interview-prep material usually leaves out (see
`curriculum/resources.md`).

**Curriculum or sprint?** Pick one. This is the full 24-week plan, paced to fit around a job.
The 30-day sprint is a compressed version of Phases 1 to 3 for when you have one intense month.
If you did the sprint, start here at Phase 4.

**Why the extra material.** Interview-prep courses are built to get you through an interview:
know the concepts, apply the patterns, practise the questions. Senior engineers
also have to *own* designs after they ship. That means trade-off documentation, SLOs,
capacity and cost, migrations, failure modes, and getting a team aligned on a
decision. Each module therefore has four parts:

| Part | What it is |
|---|---|
| **Learn** | Lessons on this site (section and chapter names match the Learn tab) + roadmap.sh nodes |
| **Go deeper** | Primary sources: book chapters, papers, vendor docs |
| **Leadership lens** | The production and leadership questions you must be able to answer |
| **Prove it** | A concrete artifact you produce (doc, diagram, lab, or benchmark) |

Abbreviations: **AM-SD** = the System Design Fundamentals course, **AM-SDI** = the System
Design Interviews course, **AM-LLD** = the Low-Level Design course (all three are in the Learn
tab, and the site turns each reference into a link), **RM-SD / RM-SA / RM-SDA** =
roadmap.sh System Design / Software Architect / Software Design & Architecture,
**DDIA** = *Designing Data-Intensive Applications* (Kleppmann; chapter numbers are from the 1st edition).

**Pace.** About 8–10 h/week over 24 weeks. Phases 1–3 are the foundation; phases 4–6
can be done in any order; Phase 7 runs alongside everything from week 6 onward.

---

## Phase 0: Orientation (week 0)

- **Learn:** AM-SD *Welcome*, *Introduction to System Design* (What is System Design?,
  30 Must-Know Concepts); AM-SDI *Introduction* (Types of questions, **Expectations by
  Level/YoE**); RM-SD *Introduction*, *What is System Design?*, *How to approach System
  Design?*; RM-SA *What is a Software Architect*, *Levels of Architecture*, *Responsibilities*.
- **Go deeper:** DDIA ch. 1 (reliable, scalable, maintainable); *Fundamentals of Software
  Architecture* ch. 1–4 (architecture characteristics).
- **Leadership lens:** What separates a senior answer from a staff answer: requirements →
  quality attributes → explicit trade-offs → evolution plan.
- **Prove it:** Write your *personal design checklist* (one page), and revise it at the end
  of each phase.

## Phase 1: Foundations (weeks 1–4)

### M1. Core quality attributes
- **Learn:** AM-SD *Core Concepts* (Scalability, Availability, Reliability, SPOF,
  Latency vs Throughput vs Bandwidth, Consistent Hashing, CAP Theorem + exercises).
  RM-SD *Performance vs Scalability*, *Latency vs Throughput*, *Availability vs
  Consistency*, *Availability in Numbers*, *Horizontal Scaling*, *CAP Theorem*.
- **Go deeper:** PACELC (Abadi 2012); Google SRE book ch. 3–4 (embracing risk, SLOs);
  "Latency numbers every programmer should know".
- **Leadership lens:** Turn "highly available" into an SLO with an error budget. What
  does each extra nine cost in architecture and on-call load?
- **Prove it:** Define SLIs/SLOs for a service you own, and compute the composite availability of
  its dependency chain.

### M2. Networking and the edge
- **Learn:** AM-SD *Networking* (OSI, IP, TCP vs UDP, HTTP/HTTPS, DNS, Proxy vs Reverse
  Proxy, Checksums) and *Load Balancing* (LBs, algorithms, DNS LB, Anycast). AM-SDI
  *Concept Deep Dives → Networking*, *Technology → Nginx*. RM-SD *TCP*, *UDP*, *HTTP*,
  *Domain Name System*, *Load Balancers*, *Layer 4/7 Load Balancing*, *LB vs Reverse
  Proxy*, *Load Balancing Algorithms*, *CDN*, *Push/Pull CDNs*.
- **Go deeper:** *High Performance Browser Networking* (Grigorik) ch. 1–4, 9–12 (TCP, TLS,
  HTTP/2, HTTP/3/QUIC); Cloudflare blog on anycast; Maglev paper (Google LB).
- **Leadership lens:** Connection reuse, TLS termination points, timeouts at every hop,
  where retries happen (and retry storms), and DNS TTL during failover.
- **Prove it:** Draw the request path for your product from the browser to the DB, listing the
  timeout and retry policy at every hop.

### M3. APIs, contracts, and identity
- **Learn:** AM-SD *API Fundamentals* (API styles, Idempotency, Data Formats, REST,
  GraphQL, gRPC, API Gateways, Rate Limiting, AuthN vs AuthZ, Session vs Token, JWT,
  OAuth2, SSO). AM-SDI *Concept Deep Dives → API Design*. RM-SD *REST*, *RPC*,
  *gRPC*, *GraphQL*, *Idempotent Operations*, *Federated Identity*. RM-SA *Auth
  Strategies*, *APIs and Integrations*. Bonus: roadmap.sh **API Design** roadmap.
- **Go deeper:** Google API Improvement Proposals (AIP-121…AIP-193, pagination, LROs,
  errors); Stripe's idempotency-keys write-up; RFC 9457 (Problem Details); OAuth 2.1 draft.
- **Leadership lens:** Versioning and deprecation policy, backward-compatible schema
  evolution (protobuf/Avro rules), pagination consistency, and rate-limit tiers as product decisions.
- **Prove it:** Write an API style guide for your team (naming, errors, pagination,
  idempotency, versioning).

### M4. Communication patterns
- **Learn:** AM-SD *Communication Patterns* (Long Polling, SSE, WebSockets, Webhooks,
  WebRTC, Message Queues, Pub/Sub, Brokers, Delivery Semantics, DLQs). AM-SDI
  *Technology → Kafka, RabbitMQ, SQS*. RM-SD *Communication*, *Asynchronism*,
  *Message Queues*, *Task Queues*, *Back Pressure*, *Messaging* (Competing Consumers,
  Priority Queue, Queue-Based Load Leveling, Publisher/Subscriber, Claim Check,
  Sequential Convoy, Async Request-Reply, Choreography).
- **Go deeper:** Kafka paper (Kreps et al., 2011) and *Kafka: The Definitive Guide*
  (partitions, ISR, exactly-once); *Enterprise Integration Patterns* (Hohpe & Woolf) ch. 3–7.
- **Leadership lens:** Ordering guarantees vs parallelism, poison messages, consumer lag
  as an SLI, replay strategy, and the schema registry as a contract.
- **Prove it:** Lab: Kafka (or Redpanda) in Docker. Produce with keys, kill a broker, observe
  rebalances and duplicates, then make the consumer idempotent.

## Phase 2: Data (weeks 5–9)

### M5. Storage engines and database types
- **Learn:** AM-SD *Databases* (DB types, SQL vs NoSQL, ACID, Durability, **B-Trees/B+
  Trees, LSM Trees**, relational/document/KV/search/wide-column/time-series/graph/vector).
  AM-SDI *Technology → PostgreSQL, MySQL, MongoDB, DynamoDB, Cassandra, Elasticsearch*;
  *Interview Tips → Choosing the Right Database*. RM-SD *Databases*, *SQL vs NoSQL*,
  *Key-Value Store*, *Document Store*, *Wide Column Store*, *Graph Databases*. RM-SA
  *ACID, CAP Theorem*.
- **Go deeper:** DDIA ch. 2–4; *Database Internals* (Petrov) part I; Dynamo (2007),
  Bigtable (2006), Cassandra (2009) papers; Postgres docs on MVCC and WAL.
- **Leadership lens:** "Boring by default": when is Postgres *not* enough? Operational cost
  of each store (backups, upgrades, on-call expertise).
- **Prove it:** Write a database-selection ADR for a real use case with ≥3 options and explicit
  rejection reasons.

### M6. Transactions, isolation, consistency
- **Learn:** AM-SD *Distributed System Fundamentals → Consistency Models*; *Databases →
  ACID*. RM-SD *Consistency Patterns*, *Strong / Weak / Eventual Consistency*.
- **Go deeper:** DDIA ch. 7 (isolation levels, write skew, SSI) and ch. 9; Jepsen
  analyses (pick 3 databases you use); "A Critique of ANSI SQL Isolation Levels" (1995).
- **Leadership lens:** Which anomalies can your system tolerate? Read-your-writes in UX,
  and double-booking prevention (AM-SDI *Preventing Double Booking*).
- **Prove it:** Reproduce lost-update and write-skew in Postgres at READ COMMITTED, then fix
  them with `SELECT … FOR UPDATE`, SERIALIZABLE, or a constraint.

### M7. Scaling the database
- **Learn:** AM-SD *Database Scaling Techniques* (Indexing, Query Optimization,
  Denormalization, Materialized Views, Connection Pooling, Partitioning, Replication,
  Sharding, Compression). AM-SDI *Interview Patterns → Scaling Read Traffic, Scaling
  Write Traffic, Handling Hot Keys*; *Concept Deep Dives → Database Design*. RM-SD
  *Replication*, *Sharding*, *Federation*, *Denormalization*, *SQL Tuning*, *Index Table*,
  *Materialized View*; anti-patterns *Busy Database*, *Monolithic Persistence*.
- **Go deeper:** DDIA ch. 5–6; *Use The Index, Luke* (Winand); Vitess and Citus docs;
  Figma's and Notion's Postgres sharding write-ups; Discord's "How we store trillions of messages".
- **Leadership lens:** Choosing a shard key and resharding without downtime, replica lag
  and stale reads, and connection storms during deploys.
- **Prove it:** Run `EXPLAIN ANALYZE` on your 5 slowest queries in prod and write up the fixes.
  Write a resharding runbook.

### M8. Caching
- **Learn:** AM-SD *Caching* (strategies, eviction, invalidation, CDN, distributed cache,
  **Cache Stampede, Cache Warming**). AM-SDI *Concept Deep Dives → Caching*, *Technology
  → Redis, Memcached*. RM-SD *Caching*, *Client / CDN / Web Server / Database /
  Application Caching*, *Cache-Aside*, *Write-through*, *Write-behind*, *Refresh Ahead*,
  anti-pattern *No Caching*.
- **Go deeper:** "Scaling Memcache at Facebook" (NSDI 2013, leases and gutter pools);
  Redis docs on persistence and cluster; "XFetch" probabilistic early expiration paper.
- **Leadership lens:** Cache as a correctness risk, not just a speed boost: stale
  data contracts, thundering herd, cold-start after a flush, and cache-key versioning on deploy.
- **Prove it:** Add stampede protection (single-flight or early refresh) to a real endpoint and
  measure p99 under a cold cache.

### M9. Storage systems and specialised data structures
- **Learn:** AM-SD *Storage Systems* (Block, DFS, Object Storage, Erasure Coding) and
  *Data Structures for Scale* (Geohash, Quad/R-Trees, S2/H3, Bloom/Cuckoo filters,
  HyperLogLog, Count-Min Sketch, MinHash, Skip Lists, Merkle Trees). AM-SDI *Technology →
  S3*; *Must-Know Topics → Data Structures*; *Interview Patterns → Uploading and Serving
  Large Files, Finding and Tracking Locations, Counting at Scale, Generating Unique IDs,
  Search and Typeahead*. RM-SD *Static Content Hosting*, *Valet Key*.
- **Go deeper:** GFS (2003) and Haystack (2010) papers; Twitter Snowflake and ULID/UUIDv7 (RFC 9562); *Probabilistic
  Data Structures* posts by Redis/ClickHouse.
- **Prove it:** Implement a Bloom filter and HyperLogLog and measure error against theory
  (LLD crossover: AM-LLD *Design Bloom Filter*).

## Phase 3: Distributed systems (weeks 10–13)

### M10. Distributed fundamentals: time, failure, consensus
- **Learn:** AM-SD *Distributed System Fundamentals* (Challenges, Partitions, Split
  Brain, Heartbeats, Failure handling, Clock sync, Lamport & Vector clocks, Consensus,
  **Paxos, Raft**, Leader Election, Distributed Locks, Gossip, CRDTs, OT). AM-SDI
  *Concept Deep Dives → Distributed Systems*, *Technology → Zookeeper*. RM-SD *Leader
  Election*.
- **Go deeper:** DDIA ch. 8–9; Raft paper + raft.github.io visualisation; Lamport "Time,
  Clocks…" (1978); Chubby (2006); Kleppmann's "How to do distributed locking" (fencing
  tokens); MIT 6.5840 (6.824) labs 2–3; Spanner/TrueTime paper.
- **Leadership lens:** Why "use a distributed lock" is usually the wrong answer. Fencing,
  leases, and idempotency instead.
- **Prove it:** Complete MIT 6.5840 Raft lab (or a Raft in Go/Rust with a Jepsen-style
  partition test).

### M11. Distributed transactions and data consistency across services
- **Learn:** AM-SD *Distributed Transactions* (2PC, 3PC, **Saga, Outbox**). AM-SDI
  *Interview Patterns → Coordinating Transactions Across Services, Keeping Data in Sync,
  Preventing Duplicate Processing*. RM-SD *Compensating Transaction*, *Choreography*,
  *Scheduler Agent Supervisor*, *Idempotent Operations*. RM-SA *CQRS, Eventual Consistency*.
- **Go deeper:** Garcia-Molina "Sagas" (1987); microservices.io patterns (Richardson);
  Debezium docs on outbox and CDC; Pat Helland "Life beyond Distributed Transactions".
- **Prove it:** Implement order → payment → inventory as an orchestrated saga with an outbox,
  inject failures, and show eventual consistency plus compensation.

### M12. Resilience engineering
- **Learn:** AM-SD *Microservices Patterns → Circuit Breaker, Bulkhead*. AM-SDI
  *Interview Patterns → Surviving Component Failures, Absorbing Traffic Spikes, Running
  Across Multiple Regions*. RM-SD *Reliability Patterns*, *Availability Patterns*
  (Fail-Over, Replication), *Resiliency*, *Retry*, *Circuit Breaker*, *Bulkhead*,
  *Throttling*, *Health Endpoint Monitoring*, *Deployment Stamps*, *Geodes*, anti-patterns
  *Retry Storm*, *Noisy Neighbor*.
- **Go deeper:** AWS Builders' Library ("Timeouts, retries and backoff with jitter",
  "Avoiding insurmountable queue backlogs", "Static stability", "Shuffle sharding");
  *Release It!* (Nygard, 2nd ed.); Google SRE book ch. 21–22 (overload, cascading failures).
- **Leadership lens:** Cell-based architecture, blast radius, load shedding vs
  queueing, multi-region active-active vs active-passive (RTO/RPO and cost).
- **Prove it:** Run a game day: inject latency or kill a dependency, then write the postmortem
  using a blameless template.

## Phase 4: Architecture and software design (weeks 14–16)

### M13. Architectural styles
- **Learn:** AM-SD *Architectural Patterns* (Client-Server, Monolith, Microservices,
  Serverless, EDA, P2P, **Hexagonal**, CQRS, Event Sourcing). RM-SDA *Architectural
  Styles/Patterns* (Layered, Microkernel, SOA, Blackboard…). RM-SA *Architectures*,
  *Service oriented*, *Microfrontends*, *Serverless*. RM-SD *Event-Driven*, *Event
  Sourcing*, *CQRS*, *Pipes and Filters*.
- **Go deeper:** *Fundamentals of Software Architecture* (Richards & Ford) part II;
  *Software Architecture: The Hard Parts* (granularity disintegrators/integrators, data
  ownership); "Modular monolith" (Shopify's write-ups).
- **Leadership lens:** Architecture follows team topology (Conway's law). The "Hard Parts"
  question: how do we split *data*, not just code?
- **Prove it:** Write an architecture-characteristics worksheet plus a style decision for your
  product.

### M14. Microservices operating model
- **Learn:** AM-SD *Microservices Patterns* (Service Discovery, API Gateway, BFF,
  Sidecar, Strangler Fig, Service Mesh). RM-SD *Service Discovery*, *Ambassador*,
  *Sidecar*, *Anti-Corruption Layer*, *Gateway Aggregation/Offloading/Routing*,
  *Backends for Frontend*, *Strangler fig*, *Gatekeeper*, *External Configuration Store*,
  *Compute Resource Consolidation*, *Leader Election*. RM-SA *Service Mesh*, *Containers*.
- **Go deeper:** *Building Microservices* (Newman, 2nd ed.); *Monolith to Microservices*
  (Newman); *Team Topologies* (Skelton & Pais).
- **Prove it:** Write a strangler-fig migration plan for one bounded context, with rollback at each step.

### M15. Domain modelling and low-level design (code-level design ownership)
- **Learn:** AM-LLD *OOP Fundamentals*, *Class Relationships*, *Design Principles*,
  *SOLID*, *UML*, *Design Patterns* (GoF + Repository, DI, Specification, Producer-Consumer),
  *LLD Interview Tips*. RM-SDA *Clean Code Principles*, *Domain Driven Design* (Entities,
  Value Objects, Repositories, Domain Language…), *Enterprise Patterns*. RM-SA *DDD*,
  *SOLID*, *UML*, *Patterns and design principles*.
- **Go deeper:** *Learning Domain-Driven Design* (Khononov) as an accessible path to Evans; Event
  Storming (Brandolini); *A Philosophy of Software Design* (Ousterhout).
- **Leadership lens:** Bounded contexts as the seam for service *and* team boundaries,
  and the module boundaries you'd enforce in code review.
- **Prove it:** Run an Event Storming session for one domain and produce a context map. Do 6 AM-LLD
  problems (Parking Lot, LRU Cache, Rate Limiter, Elevator, Splitwise, Task Scheduler).

## Phase 5: Production engineering (weeks 17–19)

### M16. Observability
- **Learn:** AM-SD *Observability* (three pillars, logging, aggregation, metrics,
  tracing, alerts, dashboards & runbooks). AM-SDI *Technology → Prometheus*. RM-SD
  *Monitoring*, *Health/Availability/Performance/Security/Usage Monitoring*,
  *Instrumentation*, *Visualization & Alerts*.
- **Go deeper:** *Observability Engineering* (Majors et al.); Google SRE workbook ch. 2–5
  (SLOs, alerting on burn rate); OpenTelemetry docs; Dapper paper (2010).
- **Prove it:** Set up multi-window burn-rate alerts for one SLO, and delete 3 noisy alerts.

### M17. Delivery and change management
- **Learn:** AM-SD *Deployment Patterns* (CI/CD, rolling, blue-green, canary, feature
  flags, A/B infra, **schema migrations**, rollbacks & immutable infra). AM-SDI
  *Technology → Docker, Kubernetes, AWS Lambda*. RM-SA *CI / CD*, *Infrastructure as
  Code*, *Containers*, *Cloud Providers*. RM-SD *Deployment Stamps*.
- **Go deeper:** *Accelerate* (Forsgren et al., DORA metrics); expand–contract migrations;
  *Kubernetes Patterns* (Ibryam & Huß).
- **Leadership lens:** Every schema change is a distributed-systems problem (old and new code run
  side by side). Decouple deploy from release.
- **Prove it:** Write an expand/contract migration playbook. Measure your team's 4 DORA metrics.

### M18. Performance and capacity
- **Learn:** AM-SDI *Interview Tips → Estimation Cheatsheet*. RM-SD *Performance
  Antipatterns* (Busy Frontend, Chatty I/O, Extraneous Fetching, Improper Instantiation,
  Synchronous I/O).
- **Go deeper:** *Systems Performance* (Gregg) ch. 2 (USE method); Little's Law and
  queueing basics; *The Every Computer Performance Book* or Neil Gunther's USL.
- **Leadership lens:** Capacity plans with headroom, cost per request or tenant, and
  load-test realism (production traffic shape, cache warmth).
- **Prove it:** Back-of-envelope plus a load test (k6/Gatling) for a key endpoint, and a
  capacity/cost forecast for 10× growth.

### M19. Security architecture
- **Learn:** AM-SD *Advanced Security* (TLS, encryption at rest, secrets, passwords,
  RBAC, SAML) and API Fundamentals auth chapters. RM-SD *Security*, *Valet Key*,
  *Gatekeeper*, *Federated Identity*. RM-SA *Security*, *OWASP*, *PKI*, *Firewalls*.
- **Go deeper:** OWASP Top 10 and ASVS; STRIDE threat modelling (Shostack, *Threat
  Modeling*); Google Zanzibar paper (ReBAC); zero-trust (BeyondCorp papers).
- **Prove it:** Threat-model one service using STRIDE and track the mitigations as tickets.

## Phase 6: Data platforms (weeks 20–21)

### M20. Batch, streaming, and analytics
- **Learn:** AM-SD *Big Data Processing* (Batch vs Stream, **CDC**, MapReduce, ETL, Data
  Lakes, Warehousing, Lakehouse, Lambda vs Kappa, Streaming Engines). AM-SDI *Technology
  → Flink, Spark*. RM-SA *Spark, Hadoop MapReduce*, *ETL Datawarehouses*. RM-SD
  *Background Jobs*, *Schedule Driven*, *Pipes and Filters*.
- **Go deeper:** DDIA ch. 10–12; MapReduce (2004) and Dataflow model (2015) papers;
  *Streaming Systems* (Akidau et al.) ch. 1–4 (watermarks, windows, exactly-once).
- **Prove it:** Build a CDC pipeline (Debezium → Kafka → sink) and reason about ordering and
  late data.

## Phase 7: Case studies and interview track (from week 6 onward, 2 per week)

Follow AM-SDI *Interview Tips* (Answering Framework, Estimation, Diagramming) for every
problem. For each problem, write a 2-page design doc (requirements, estimates, API, data
model, high-level diagram, deep dives, failure modes, evolution), then compare it with
the lesson for that problem in the System Design Interviews course and one real engineering-blog write-up.

| Order | Problem (AM-SDI) | Patterns exercised | Real-world reading |
|---|---|---|---|
| 1 | URL Shortener, Pastebin | IDs, read scaling, caching | Bitly engineering |
| 2 | Rate Limiter, API Gateway, Load Balancer | Throttling, edge | Stripe & Cloudflare rate-limit posts |
| 3 | Key-Value Store, Distributed Cache | Partitioning, replication, quorum | Dynamo paper |
| 4 | Notification Service, Job Scheduler | Fanout, delayed jobs, idempotency | Airbnb, Slack job queues |
| 5 | WhatsApp, Slack, Live Comments, Zoom | Real-time push, presence | Discord, Slack engineering |
| 6 | FB News Feed, Instagram, TikTok, Reddit, Tinder | Fanout on write vs read, hot keys | Meta TAO paper |
| 7 | YouTube, Netflix, Spotify, Twitch | Large files, video streaming, CDN | Netflix Open Connect |
| 8 | Google Drive, Gmail, Google Docs | Sync, OT/CRDT, conflict resolution | Dropbox Magic Pocket, Figma multiplayer |
| 9 | Uber, Food Delivery, Google Maps, Airbnb | Geospatial, matching | Uber H3, Ringpop |
| 10 | Autocomplete, Web Crawler, Google Search, News Aggregator | Search, typeahead, crawling | Elasticsearch internals |
| 11 | Ad Click Aggregator, Top K, Likes Counting, Leaderboard | Counting at scale, streaming | Twitter/X counting posts |
| 12 | Amazon, Shopify, Flash Sale, Auction, Movie Booking | Double booking, spikes, inventory | Shopify flash-sale write-ups |
| 13 | Payment System, Digital Wallet, Stock Exchange | Ledgers, idempotency, exactly-once | Stripe, Uber ledger, LMAX |
| 14 | Object Storage (S3), Messaging Queue, Time-Series DB, Locking Service, CDN | Infra internals | S3 / Kafka / Chubby papers |
| 15 | CI/CD Pipeline, Monitoring & Alerting, LeetCode, Calendar, Online Chess | Async workflows, sandboxing | Internal-platform write-ups |

**Mock cadence:** one timed 45-min mock every 2 weeks (the mock interview at the end of each lesson, or a peer),
graded against the *Expectations by Level/YoE* rubric.

## Phase 8: The leadership layer (continuous; deliberately beyond interview prep)

This is the gap the source courses don't cover. Mapped to RM-SA *Design & Architecture →
Decision Making, Documentation, Simplifying Things, Estimate and Evaluate, Consult & Coach,
Balance, Communication*.

| Skill | Practice | Resource |
|---|---|---|
| Design docs / RFCs | Write one per quarter; review two per month | "Design Docs at Google" (Malte Ubl); Squarespace/Uber RFC templates |
| Architecture Decision Records | Keep `docs/adr/` in each repo | Michael Nygard ADR template; adr.github.io |
| Diagramming | C4 model (context, container, component) for each system you own | c4model.com; Structurizr |
| Trade-off analysis | ATAM-lite, fitness functions | *Building Evolutionary Architectures* (Ford et al.) |
| Reviewing designs | A checklist of failure modes, data ownership, ops cost, and security | Phase 0 checklist, evolved |
| Technical strategy | One-page strategy plus a written tech-debt portfolio | *The Staff Engineer's Path* (Reilly); *Staff Engineer* (Larson); Rumelt *Good Strategy/Bad Strategy* |
| Incident leadership | Incident commander role, blameless postmortems | Google SRE book ch. 14–15; PagerDuty incident response docs |
| Cost awareness | Unit economics per feature | AWS/GCP Well-Architected cost pillar |
| Mentoring | Pair on designs; run a weekly "design kata" | This curriculum, Phase 7 problems |

## Capstone (weeks 22–24)

Pick a real system you lead (or one Phase 7 problem at full depth) and produce:

1. A design doc with requirements, SLOs, capacity and cost model, and alternatives considered.
2. C4 diagrams (levels 1–3) and data-flow and failure-mode diagrams.
3. Three ADRs for the hardest decisions.
4. A threat model, an observability plan (SLIs, dashboards, alerts), and a rollout and migration plan.
5. A 30-minute review session with peers, with feedback incorporated.

## Coverage check (every source topic is mapped)

- **AM-SD (20 sections):** Welcome / Intro → P0; Core → M1; Networking, LB → M2; API → M3/M19;
  Communication → M4; Caching → M8; Databases → M5/M6; DB Scaling → M7; Storage, DS for
  Scale → M9; Architectural Patterns → M13; Microservices Patterns → M12/M14;
  Distributed Fundamentals → M10; Distributed Transactions → M11; Big Data → M20;
  Deployment → M17; Observability → M16; Advanced Security → M19.
- **AM-SDI (19 sections):** Intro / Must-Know / Tips → P0/P7; Concept deep dives →
  M2/M3/M5/M8/M10; Technology deep dives → spread across M4/M5/M8/M9/M10/M16/M17/M20; 20
  interview patterns → M7/M9/M11/M12; 11 question sections → Phase 7.
- **AM-LLD:** → M15 (plus LLD crossovers in M9 and Phase 7).
- **RM-SD (132 nodes), RM-SA (112), RM-SDA (83):** mapped in the modules above. RM-SA nodes
  about specific vendors or enterprise frameworks (SAP, Salesforce, TOGAF, PRINCE2, ITIL,
  SAFe, BPM…) are **intentionally skipped**: they matter for enterprise-architect roles and not
  for a product Tech Lead.
