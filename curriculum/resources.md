# Resource library

Resources are ranked by how often the curriculum uses them. ★ = core (read it cover to cover); others are
reference material you dip into per module.

## Open courses and roadmaps

- ★ System Design Primer (CC BY 4.0): <https://github.com/donnemartin/system-design-primer>
- AlgoMaster: System Design, System Design Interviews and Low-Level Design courses: <https://algomaster.io/courses>
- ★ roadmap.sh: System Design <https://roadmap.sh/system-design>, Software Architect
  <https://roadmap.sh/software-architect>, Software Design & Architecture
  <https://roadmap.sh/software-design-architecture>, API Design <https://roadmap.sh/api-design>
- donnemartin/system-design-primer: <https://github.com/donnemartin/system-design-primer>
  (roadmap.sh System Design is largely derived from it)
- MIT 6.5840 Distributed Systems (labs: MapReduce, Raft, KV): <https://pdos.csail.mit.edu/6.824/>
- Martin Kleppmann, Cambridge *Distributed Systems* lecture series (YouTube + notes)
- ByteByteGo / *System Design Interview* Vol. 1 & 2 (Alex Xu): extra question walkthroughs
- Hello Interview system design guides: good "what a senior/staff answer looks like" calibration

## Books

| ★ | Book | Used in |
|---|---|---|
| ★ | *Designing Data-Intensive Applications* (Kleppmann) | M1, M5–M7, M10–M11, M20 |
| ★ | *Fundamentals of Software Architecture* (Richards & Ford) | P0, M13 |
| ★ | *Software Architecture: The Hard Parts* (Ford, Richards, Sadalage, Dehghani) | M13–M14 |
| ★ | *Site Reliability Engineering* and *The SRE Workbook* (Google, free online) | M1, M12, M16, P8 |
| ★ | *The Staff Engineer's Path* (Tanya Reilly) | P8 |
|   | *Database Internals* (Alex Petrov) | M5 |
|   | *Release It!* 2nd ed. (Michael Nygard) | M12 |
|   | *Building Microservices* 2nd ed. and *Monolith to Microservices* (Sam Newman) | M14 |
|   | *Learning Domain-Driven Design* (Vlad Khononov) | M15 |
|   | *A Philosophy of Software Design* (John Ousterhout) | M15 |
|   | *Team Topologies* (Skelton & Pais) | M13–M14 |
|   | *Enterprise Integration Patterns* (Hohpe & Woolf) | M4 |
|   | *Streaming Systems* (Akidau, Chernyak, Lax) | M20 |
|   | *Observability Engineering* (Majors, Fong-Jones, Miranda) | M16 |
|   | *Accelerate* (Forsgren, Humble, Kim) | M17 |
|   | *Building Evolutionary Architectures* 2nd ed. (Ford et al.) | P8 |
|   | *Systems Performance* 2nd ed. (Brendan Gregg) | M18 |
|   | *High Performance Browser Networking* (Ilya Grigorik, free online) | M2 |
|   | *Threat Modeling: Designing for Security* (Adam Shostack) | M19 |
|   | *Staff Engineer* (Will Larson) | P8 |

## Papers (read in this order)

1. Lamport, *Time, Clocks, and the Ordering of Events in a Distributed System* (1978): M10
2. Ghemawat et al., *The Google File System* (2003): M9
3. Dean & Ghemawat, *MapReduce* (2004): M20
4. Chang et al., *Bigtable* (2006): M5
5. Burrows, *The Chubby Lock Service* (2006): M10
6. DeCandia et al., *Dynamo: Amazon's Highly Available Key-value Store* (2007): M5, Phase 7
7. Lakshman & Malik, *Cassandra* (2009): M5
8. Sigelman et al., *Dapper* (2010): M16
9. Kreps et al., *Kafka: a Distributed Messaging System for Log Processing* (2011): M4
10. Corbett et al., *Spanner* (2012): M10
11. Nishtala et al., *Scaling Memcache at Facebook* (2013): M8
12. Bronson et al., *TAO: Facebook's Distributed Data Store for the Social Graph* (2013): Phase 7
13. Ongaro & Ousterhout, *In Search of an Understandable Consensus Algorithm (Raft)* (2014): M10
14. Akidau et al., *The Dataflow Model* (2015): M20
15. Eisenbud et al., *Maglev: A Fast and Reliable Software Network Load Balancer* (2016): M2
16. Pang et al., *Zanzibar: Google's Consistent, Global Authorization System* (2019): M19
17. Garcia-Molina & Salem, *Sagas* (1987), and Helland, *Life beyond Distributed Transactions* (2007): M11
18. Abadi, *Consistency Tradeoffs in Modern Distributed Database System Design (PACELC)* (2012): M1

## Engineering writing to follow

- AWS Builders' Library: <https://aws.amazon.com/builders-library/> (M12 essentials)
- Azure Architecture Center, Cloud Design Patterns: <https://learn.microsoft.com/azure/architecture/patterns/>
  (the source of most RM-SD pattern nodes)
- microservices.io (Chris Richardson): M11, M14
- Jepsen analyses: <https://jepsen.io/analyses> (M6, M10)
- Google API Improvement Proposals: <https://google.aip.dev> (M3)
- C4 model: <https://c4model.com>; ADRs: <https://adr.github.io> (P8)
- Company engineering blogs: Netflix, Uber, Discord, Stripe, Cloudflare, Figma, Shopify,
  Slack, Dropbox, Airbnb, LinkedIn. Use them for the "real-world reading" column in Phase 7.
