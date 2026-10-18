# Book Track

The core books as a chapter-by-chapter curriculum, in reading order. Books 1–2 run alongside the
30-day sprint this month. The sprint day a chapter supports is shown after it. Books 3–9 follow over
the next five months, one at a time, at about 5 h a week.

How to read for depth: before each chapter, write down the questions you expect it to answer. After it,
close the book and write a one-page summary plus one design decision you would now make differently.
Chapter lists follow the 1st edition unless the book's entry says otherwise.

### Designing Data-Intensive Applications (Martin Kleppmann)
- **When:** Month 1, with the sprint (ch. 1–9). Ch. 10–12 in month 5.
- **Why:** The single most important book for system design depth. Every interview topic traces back to it.
1. Reliable, Scalable, and Maintainable Applications · Day 1
2. Data Models and Query Languages · Day 15
3. Storage and Retrieval · Day 16
4. Encoding and Evolution · Day 8
5. Replication · Day 19
6. Partitioning · Day 20
7. Transactions · Day 17
8. The Trouble with Distributed Systems · Day 22
9. Consistency and Consensus · Days 23–24
10. Batch Processing
11. Stream Processing
12. The Future of Data Systems

### System Design Interview, Vol. 1 (Alex Xu)
- **When:** Month 1, on the sprint review days and weekends.
- **Why:** Short worked examples that show how the fundamentals combine in a design answer. Attempt each problem yourself before reading the chapter.
1. Scale from Zero to Millions of Users · Day 1
2. Back-of-the-Envelope Estimation · Day 3
3. A Framework for System Design Interviews · Day 7
4. Design a Rate Limiter · Day 14
5. Design Consistent Hashing · Day 6
6. Design a Key-Value Store · Day 21
7. Design a Unique ID Generator in Distributed Systems · Day 28
8. Design a URL Shortener · Day 7
9. Design a Web Crawler
10. Design a Notification System · Day 14
11. Design a News Feed System · Day 29
12. Design a Chat System · Day 29
13. Design a Search Autocomplete System
14. Design YouTube
15. Design Google Drive
16. The Learning Continues

### Database Internals (Alex Petrov)
- **When:** Month 2.
- **Why:** Goes one level below DDIA: how B-trees, LSM trees, failure detectors and consensus are actually implemented.
1. Introduction and Overview
2. B-Tree Basics
3. File Formats
4. Implementing B-Trees
5. Transaction Processing and Recovery
6. B-Tree Variants
7. Log-Structured Storage
8. Distributed Systems: Introduction and Overview
9. Failure Detection
10. Leader Election
11. Replication and Consistency
12. Anti-Entropy and Dissemination
13. Distributed Transactions
14. Consensus

### Site Reliability Engineering, selected chapters (Google, free online)
- **When:** Month 2, in parallel with Database Internals.
- **Why:** How large systems are actually run: SLOs, overload, cascading failures, incidents.
1. Embracing Risk (ch. 3)
2. Service Level Objectives (ch. 4)
3. Monitoring Distributed Systems (ch. 6)
4. Practical Alerting (ch. 10)
5. Effective Troubleshooting (ch. 12)
6. Managing Incidents (ch. 14)
7. Postmortem Culture: Learning from Failure (ch. 15)
8. Load Balancing at the Frontend (ch. 19)
9. Load Balancing in the Datacenter (ch. 20)
10. Handling Overload (ch. 21)
11. Addressing Cascading Failures (ch. 22)
12. Managing Critical State: Distributed Consensus for Reliability (ch. 23)
13. Data Integrity: What You Read Is What You Wrote (ch. 26)

### Release It!, 2nd ed. (Michael Nygard)
- **When:** Month 3.
- **Why:** The stability patterns and anti-patterns behind every resilience discussion.
1. Living in Production
2. Case Study: The Exception That Grounded an Airline
3. Stabilize Your System
4. Stability Antipatterns
5. Stability Patterns
6. Case Study: Phenomenal Cosmic Powers
7. Foundations
8. Processes on Machines
9. Interconnect
10. Control Plane
11. Security
12. Case Study: Waiting for Godot
13. Design for Deployment
14. Handling Versions
15. Case Study: Trampled by Your Own Customers
16. Adaptation
17. Chaos Engineering

### System Design Interview, Vol. 2 (Alex Xu & Sahn Lam)
- **When:** Month 3, two chapters a week as case studies.
- **Why:** Harder problems: geospatial, queues, ledgers, exchanges.
1. Proximity Service
2. Nearby Friends
3. Google Maps
4. Distributed Message Queue
5. Metrics Monitoring and Alerting System
6. Ad Click Event Aggregation
7. Hotel Reservation System
8. Distributed Email Service
9. S3-like Object Storage
10. Real-time Gaming Leaderboard
11. Payment System
12. Digital Wallet
13. Stock Exchange

### Fundamentals of Software Architecture (Mark Richards & Neal Ford)
- **When:** Month 4.
- **Why:** The vocabulary of architecture characteristics, styles and the architect's soft skills.
1. Introduction
2. Architectural Thinking
3. Modularity
4. Architecture Characteristics Defined
5. Identifying Architectural Characteristics
6. Measuring and Governing Architecture Characteristics
7. Scope of Architecture Characteristics
8. Component-Based Thinking
9. Foundations (of architecture styles)
10. Layered Architecture Style
11. Pipeline Architecture Style
12. Microkernel Architecture Style
13. Service-Based Architecture Style
14. Event-Driven Architecture Style
15. Space-Based Architecture Style
16. Orchestration-Driven Service-Oriented Architecture
17. Microservices Architecture
18. Choosing the Appropriate Architecture Style
19. Architecture Decisions
20. Analyzing Architecture Risk
21. Diagramming and Presenting Architecture
22. Making Teams Effective
23. Negotiation and Leadership Skills
24. Developing a Career Path

### Software Architecture: The Hard Parts (Ford, Richards, Sadalage & Dehghani)
- **When:** Month 5.
- **Why:** Trade-off analysis for distributed architectures, especially how to split data.
1. What Happens When There Are No "Best Practices"?
2. Discerning Coupling in Software Architecture
3. Architectural Modularity
4. Architectural Decomposition
5. Component-Based Decomposition Patterns
6. Pulling Apart Operational Data
7. Service Granularity
8. Reuse Patterns
9. Data Ownership and Distributed Transactions
10. Distributed Data Access
11. Managing Distributed Workflows
12. Transactional Sagas
13. Contracts
14. Managing Analytical Data
15. Build Your Own Trade-Off Analysis

### The Staff Engineer's Path (Tanya Reilly)
- **When:** Month 6, and reread yearly.
- **Why:** The Tech Lead's job beyond design: strategy, big projects, and influence.
1. What Would You Say You Do Here?
2. Three Maps
3. Creating the Big Picture
4. Finite Time
5. Leading Big Projects
6. Why Have We Stopped?
7. You're a Role Model Now
8. Good Influence at Scale
9. What's Next?
