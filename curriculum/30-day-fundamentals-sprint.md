# 30-Day Fundamentals Sprint

One month of intense work on the foundations (Phases 1–3 of the main curriculum, compressed).
Budget about **2.5 h on weekdays and 4–5 h on review days**. Every day ends with something
you made: code, a diagram, a calculation, or a written explanation. Reading alone doesn't count.

**Sprint or curriculum?** Pick one. The sprint is the short, intense version: 30 days on the
fundamentals, for when you have a month and an interview or a new role ahead. The 24-week
curriculum covers the same ground and much more (architecture, delivery, streaming, the
leadership layer) at a pace that fits around a job. Finished the sprint? Continue the curriculum
from Phase 4.

## What separates the top 1%

No course gets anyone into the top 1% by itself. What the best engineers do differently is
practise in ways that are slow and uncomfortable:

1. **Explain from memory first.** Before reading, write what you already know about the day's
   topic, then read and correct it. The gaps you find are the learning.
2. **Go to the primary source.** Read the paper, the RFC, and the database docs, not only summaries.
3. **Build the mechanism.** Implement a small version (LRU, token bucket, consistent hashing,
   Raft) so you know where it breaks.
4. **Put numbers on every claim.** Every design statement comes with an estimate (QPS, bytes,
   latency, cost).
5. **Write and get reviewed.** A one-page write-up per review day, critiqued by a peer or
   against the reference solution.
6. **Teach it.** Explain one concept a week to your team. If you can't, you don't know it yet.

## Daily non-negotiables (20 min)

- Recall: 10 min of written recall on yesterday's topic, closed-book.
- Estimate: one back-of-envelope calculation (any real product).
- Log: one line in your learning log on what surprised you.

## Plan

| Day | Focus | Learn | Go deeper | Drill / output |
|---|---|---|---|---|
| 1 | Orientation and the big picture | AM-SD *What is System Design?*, *30 Must-Know Concepts*; AM-SDI *Expectations by Level/YoE* | DDIA ch. 1; "Latency numbers every programmer should know" | Write your one-page design checklist. Memorise the latency table. |
| 2 | Scalability, availability, reliability | AM-SD *Scalability*, *Availability*, *Reliability*, *SPOF* | Google SRE book ch. 3–4 (risk, SLOs) | Compute the composite availability of a 5-service chain. Write SLOs for one service you own. |
| 3 | Latency, throughput, estimation | AM-SD *Latency vs Throughput vs Bandwidth*; AM-SDI *Estimation Cheatsheet* | Little's Law; queueing intuition (Gregg, *Systems Performance* ch. 2) | Estimate QPS, storage, and bandwidth for Instagram and YouTube. Check them against published numbers. |
| 4 | Transport and HTTP | AM-SD *OSI Model*, *IP Address*, *TCP vs UDP*, *HTTP/HTTPS* | *High Performance Browser Networking* ch. 1–4, 12 (HTTP/2), QUIC overview | Capture a page load with curl `-w` timings and Wireshark. Explain every round trip. |
| 5 | DNS, proxies, load balancing | AM-SD *DNS*, *Proxy vs Reverse Proxy*, *Checksums*, *Load Balancing* section | Maglev paper (skim); Cloudflare blog on anycast | Configure nginx as L7 LB with 3 backends. Compare round-robin and least-connections under load. |
| 6 | Consistent hashing and CAP | AM-SD *Consistent Hashing*, *CAP Theorem* | Karger et al. (1997) intro; Abadi's PACELC paper | Implement a consistent-hash ring with virtual nodes. Measure key movement when adding a node. |
| 7 | Review day 1 | AM-SD *Core Concepts*, *Networking*, *Load Balancing* exercises; AM-SDI *Answering Framework* | AM-SDI *Design URL Shortener* (after your attempt) | Timed design: URL Shortener (45 min) plus a 2-page write-up. Weekly retro. |
| 8 | API design and idempotency | AM-SD *What is an API?*, *API Styles*, *Idempotency*, *Data Formats*, *REST API Design* | Google AIPs on pagination and errors; Stripe idempotency-keys post | Design a paginated, idempotent REST API for orders. Write the error contract. |
| 9 | GraphQL, gRPC, gateways, rate limiting | AM-SD *GraphQL*, *gRPC*, *API Gateways*, *Rate Limiting* | Protobuf compatibility rules; Stripe rate-limiter post | Implement token-bucket and sliding-window limiters. Test them under burst. |
| 10 | Identity | AM-SD *AuthN vs AuthZ*, *Session vs Token*, *JWT*, *OAuth2*, *SSO* | OAuth 2.1 draft (flows); OWASP JWT cheat sheet | Draw the OAuth authorization-code + PKCE sequence from memory. List 5 JWT pitfalls. |
| 11 | Real-time delivery | AM-SD *Long Polling*, *SSE*, *WebSockets*, *Webhooks*, *WebRTC* | Slack/Discord engineering posts on gateway scaling | Build a tiny WebSocket chat. Estimate the memory per connection for 1M users. |
| 12 | Messaging | AM-SD *Message Queues*, *Pub/Sub*, *Message Brokers*, *Delivery Semantics*, *Dead Letter Queues* | Kafka paper (2011); Kafka docs on partitions and ISR | Kafka/Redpanda lab: keyed produce, kill a broker, then make the consumer idempotent. |
| 13 | Caching | AM-SD *Caching* section (strategies to cache warming) | "Scaling Memcache at Facebook" (NSDI 2013) | Implement an LRU cache plus single-flight stampede protection. Measure cold vs warm p99. |
| 14 | Review day 2 | AM-SD API, Communication, Caching exercises | AM-SDI *Design Rate Limiter*, *Design Notification Service* | Timed design: Rate Limiter plus Notification Service. Teach one concept to a teammate. |
| 15 | Databases and durability | AM-SD *Common Database Types*, *SQL vs NoSQL*, *ACID*, *Durability* | Postgres docs: WAL and MVCC; DDIA ch. 2 | Explain fsync, the WAL, and crash recovery in one page with a diagram. |
| 16 | Storage engines | AM-SD *B-Trees and B+ Trees*, *LSM Trees* | DDIA ch. 3; *Database Internals* ch. 2, 7 | Build a toy LSM: memtable, SSTable flush, compaction. Compare its read/write amplification with a B-tree. |
| 17 | Isolation and anomalies | AM-SD *Consistency Models*; AM-SDI *Preventing Double Booking* | DDIA ch. 7; one Jepsen analysis of a DB you use | Reproduce a lost update and write skew in Postgres, then fix each two ways. |
| 18 | Indexing and query performance | AM-SD *Indexing*, *Query Optimization*, *Connection Pooling* | *Use The Index, Luke* (Winand), chapters 1–3 | EXPLAIN ANALYZE 5 real queries. Design composite indexes and prove the speed-up. |
| 19 | Replication | AM-SD *Database Replication* | DDIA ch. 5 | Write up leader-follower, multi-leader, and leaderless (quorums) side by side: lag, failover, conflicts. |
| 20 | Partitioning and hot keys | AM-SD *Database Partitioning*, *Sharding*, *Denormalization*, *Materialized Views*; AM-SDI *Handling Hot Keys*, *Scaling Read/Write Traffic* | DDIA ch. 6; Discord "trillions of messages" | Choose shard keys for 3 systems. Write a zero-downtime resharding runbook. |
| 21 | Review day 3 | AM-SD Databases and Scaling exercises | Dynamo paper (2007); AM-SDI *Design Key-Value Store* | Timed design: distributed KV store. Map every Dynamo technique to a problem it solves. |
| 22 | Failure in distributed systems | AM-SD *Challenges of Distribution*, *Network Partitions*, *Split Brain*, *Heartbeats*, *Handling Failures* | DDIA ch. 8; AWS Builders' Library "Timeouts, retries and backoff with jitter" | Simulate a retry storm. Fix it with jittered backoff and a retry budget. |
| 23 | Time and ordering | AM-SD *Clock Synchronization*, *Logical Clocks*, *Lamport Timestamps*, *Vector Clocks* | Lamport "Time, Clocks…" (1978); DDIA ch. 9 (linearizability) | Implement vector clocks and detect concurrent writes in a 3-replica simulation. |
| 24 | Consensus | AM-SD *Consensus Algorithms*, *Paxos*, *Raft*, *Leader Election* | Raft paper; raft.github.io visualisation | Start the MIT 6.5840 Raft lab (leader election part). Explain log matching from memory. |
| 25 | Locks, gossip, CRDTs | AM-SD *Distributed Locks*, *Gossip Protocol*, *CRDTs*, *Operational Transformation* | Kleppmann "How to do distributed locking"; Chubby paper (skim) | Show a lock-without-fencing bug, then fix it with fencing tokens. Implement a G-Counter CRDT. |
| 26 | Distributed transactions | AM-SD *Distributed Transactions* section; AM-SD *Change Data Capture* | Garcia-Molina "Sagas"; Helland "Life beyond Distributed Transactions" | Implement an order saga with an outbox. Inject failures and verify compensation. |
| 27 | Resilience | AM-SD *Circuit Breaker*, *Bulkhead*; AM-SDI *Surviving Component Failures*, *Absorbing Traffic Spikes*, *Running Across Multiple Regions* | Builders' Library "Static stability", "Shuffle sharding"; SRE book ch. 21–22 | Write a failure-mode table (FMEA) for a system you own: detection, blast radius, mitigation. |
| 28 | Data structures for scale and storage | AM-SD *Data Structures for Scale* section (Bloom, HyperLogLog, Count-Min, Geohash, Quad Trees); *Object Storage*, *Erasure Coding* | Bloom (1970) and HyperLogLog (Flajolet 2007) papers, intros only | Implement a Bloom filter and HyperLogLog. Plot measured vs theoretical error. |
| 29 | Mock interview | AM-SDI *Interview Patterns*: Fanning Out Updates, Pushing Real-time Updates | AM-SDI *Design WhatsApp* or *Design FB News Feed* (after your attempt) | 45-min timed mock with a peer or recorded. Grade yourself against the staff-level rubric. |
| 30 | Final exam and next month | All of the above, closed-book | Your learning log | Redraw 10 core diagrams from memory and redo 3 estimates. Retro, then plan Phases 4–6. |
