# Same problems, different domains

Every product feels unique to the people building it. Underneath, the same dozen problems keep coming
back: two people want the last seat, a retry charges a card twice, a message arrives before the one it
answers. The domain changes the names and the stakes, not the shape. Learn to name the shape and you
can borrow decades of known solutions, whatever the industry and whoever (or whatever) wrote the code.

| Problem shape | Payments | Ride-hailing | Chat | E-commerce | AI agents | Known solutions |
|---|---|---|---|---|---|---|
| Contention: many writers, one thing | Two withdrawals race on one balance | Two riders matched to the same driver | Two admins edit a group at once | The last item in stock sold twice | Two agents edit the same file | Row locks, optimistic concurrency (version check), single-writer queue, reservations with expiry |
| Duplicates: the retry problem | A timeout retry charges the card twice | A double tap books two trips | A reconnect resends the same message | A refresh submits the order again | An agent retries a tool call that sends an email | Idempotency keys, dedup tables, exactly-once effects via outbox |
| Ordering: events arrive out of turn | Refund processed before the charge | An old GPS ping overwrites a newer one | A reply shows before its question | "Shipped" arrives before "paid" | Tool results come back interleaved | Sequence numbers, per-key partitions, logical clocks, last-writer-wins with versions |
| Fan-out: one event, many receivers | Notify every party to a split bill | Offer a ride to nearby drivers | A message to a 10k-member group | Restock alert to 1M watchers | One task spawns many sub-agents | Pub/sub, fan-out on write vs. read, batching, queues per consumer |
| Hot spots: skew beats averages | One merchant on Black Friday | The airport at midnight | A celebrity's channel | A viral product page | Everyone sends the same popular prompt | Sharding by better keys, caching, key splitting, request coalescing |
| Overload: demand beats capacity | The card network slows down | Surge when a concert ends | A reconnect storm after an outage | A flash sale opens | The model API rate-limits you | Backpressure, rate limiting, load shedding, queues, autoscaling with headroom |
| Partial failure: did it happen? | The bank times out: charged or not? | The driver's app drops offline | Sent, delivered or lost? | The payment gateway hangs | A tool call times out: did it run? | Timeouts plus idempotent retries, status queries, reconciliation jobs |
| Multi-step consistency | Charge, ledger and receipt must agree | Trip, fare and driver status must agree | Message and unread counts must agree | Order, stock and payment must agree | Half of an agent's multi-tool plan completed | Sagas with compensation, outbox pattern, two-phase commit where you own both sides |
| Finding things fast | Fraud lookups in milliseconds | Nearest drivers right now | Search years of messages | Product search with filters | Retrieval for RAG | Indexes (B-tree, inverted, geo, vector), precomputation, caching |
| Trust but verify | Daily reconciliation against the bank | Fare audits and GPS sanity checks | Spam and abuse detection | Price and inventory audits | Reviewing and testing agent-written code | Invariants, reconciliation, tests, canaries, human review on risky paths |

## Where each shape appears

Lessons and case studies where each shape is the heart of the problem. Follow one shape across
domains to see how little the solution changes.

- Contention: ps/same-problems-different-domains, ps/concurrency-bugs, sd/distributed-locks, sdi/preventing-double-booking, sdi/design-movie-booking-system, sdi/design-flash-sale, sd/leader-election, ps/case-aws-dynamodb-2025
- Duplicates: ps/one-problem-five-domains, sd/delivery-semantics, sdi/deduplicating-data, sd/outbox-pattern, sdi/design-payment-system, sd/dead-letter-queues
- Ordering: sd/logical-clocks, sd/lamport-timestamps, sd/vector-clocks, sd/clock-synchronization, sdi/kafka, sd/crdts, sd/operational-transformation
- Fan-out: sdi/fanout, sdi/design-news-feed, sdi/design-slack, sd/event-driven-architecture, sdi/sqs, sdi/rabbitmq
- Hot spots: sdi/hot-keys, sdi/design-top-k, sd/cache-stampede, sdi/caching, sdi/distributed-counting
- Overload: sdi/traffic-spikes, sdi/design-rate-limiter, sd/circuit-breaker-pattern, sd/bulkhead-pattern, ps/performance-debugging, ps/case-cloudflare-2019
- Partial failure: sd/handling-failures-in-distributed-systems, sd/network-partitions, sd/split-brain-problem, sdi/surviving-component-failures, ps/debugging-distributed-systems, ps/case-facebook-2021
- Multi-step consistency: sd/saga-pattern, sd/two-phase-commit-protocol, sd/outbox-pattern, sdi/distributed-transactions, sdi/keeping-data-in-sync, ps/data-corruption-recovery
- Finding things fast: sd/b-trees, sd/lsm-trees, sd/full-text-search-engines, sd/geohash, sd/vector-databases, sdi/search-and-typeahead, sdi/handling-location-data, sd/query-optimization
- Trust but verify: ps/verifying-agent-written-code, ps/root-cause-analysis, ps/whiteboard-first, sd/merkle-trees, ps/case-gitlab-2017, ps/case-crowdstrike-2024
