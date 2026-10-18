# Standard books: chapter reference

Lesson writers use this file to cite standard books by chapter, for example *DDIA (1st ed.), Ch 7: Transactions*. Always give the edition, because chapter numbers change between editions.

Chapter numbers and titles were checked against each publisher's public table of contents, or
against the free online edition where one exists (the SRE book and Workbook, Building Secure and
Reliable Systems, High Performance Browser Networking, Software Engineering at Google). **PARTLY
VERIFIED** marks a list where only some details could be confirmed. Book and chapter titles belong
to their authors and publishers; they are listed only so lessons can cite chapters precisely.

Books, in order: data systems and distributed systems · SRE and operations · networking · architecture and design · interviews · engineering organisation · AI/ML.

## Designing Data-Intensive Applications (1st edition, 2017)

- Author: Martin Kleppmann
- Publisher: O'Reilly Media, March 2017 · ISBN 978-1-4493-7332-0
- Note: the 2nd edition (2026) renumbers chapters; say which edition you cite. Per-chapter reference lists: https://github.com/ept/ddia-references
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. Foundations of Data Systems -->
- Ch 1: Reliable, Scalable, and Maintainable Applications
- Ch 2: Data Models and Query Languages
- Ch 3: Storage and Retrieval
- Ch 4: Encoding and Evolution
<!-- II. Distributed Data -->
- Ch 5: Replication
- Ch 6: Partitioning
- Ch 7: Transactions
- Ch 8: The Trouble with Distributed Systems
- Ch 9: Consistency and Consensus
<!-- III. Derived Data -->
- Ch 10: Batch Processing
- Ch 11: Stream Processing
- Ch 12: The Future of Data Systems

## Designing Data-Intensive Applications (2nd edition, 2026)

- Authors: Martin Kleppmann, Chris Riccomini
- Publisher: O'Reilly Media, February 2026 · ISBN 978-1-098-11906-5
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Trade-Offs in Data Systems Architecture
- Ch 2: Defining Nonfunctional Requirements
- Ch 3: Data Models and Query Languages
- Ch 4: Storage and Retrieval
- Ch 5: Encoding and Evolution
- Ch 6: Replication
- Ch 7: Sharding
- Ch 8: Transactions
- Ch 9: The Trouble with Distributed Systems
- Ch 10: Consistency and Consensus
- Ch 11: Batch Processing
- Ch 12: Stream Processing
- Ch 13: A Philosophy of Streaming Systems
- Ch 14: Doing the Right Thing

## Database Internals (1st edition, 2019)

- Author: Alex Petrov
- Publisher: O'Reilly Media, October 2019 · ISBN 978-1-492-04034-7
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. Storage Engines -->
- Ch 1: Introduction and Overview
- Ch 2: B-Tree Basics
- Ch 3: File Formats
- Ch 4: Implementing B-Trees
- Ch 5: Transaction Processing and Recovery
- Ch 6: B-Tree Variants
- Ch 7: Log-Structured Storage
<!-- Part I Conclusion -->
<!-- II. Distributed Systems -->
- Ch 8: Introduction and Overview
- Ch 9: Failure Detection
- Ch 10: Leader Election
- Ch 11: Replication and Consistency
- Ch 12: Anti-Entropy and Dissemination
- Ch 13: Distributed Transactions
- Ch 14: Consensus
<!-- Part II Conclusion -->
- A. Bibliography

## Understanding Distributed Systems (2nd edition, 2022)

- Author: Roberto Vitillo
- Publisher: self-published, February 2022 · ISBN 978-1-83843-021-4 · site: https://understandingdistributed.systems/
- Chapter list: **PARTLY VERIFIED — check before citing a chapter number.** The Google Books contents for ISBN 9781838430214 (https://books.google.com/books?vid=ISBN9781838430214) confirms 27 of these titles: Reliable links, Secure links, Discovery, System models, Time, Leader election, Replication, Coordination avoidance, Transactions, Asynchronous transactions, HTTP caching, Content delivery networks, File storage, Network load balancing, Data storage, Caching, Microservices, Control planes and data planes, Common failure causes, Redundancy, Downstream resiliency, Upstream resiliency, Testing, Continuous delivery and deployment, Monitoring, Observability, Manageability. That source has no chapter numbers. The numbers, the Part headings, the topics, and the seven chapters it doesn't list (Introduction, APIs, Failure detection, Partitioning, Messaging, Fault isolation, Final words) are from memory and UNVERIFIED. Cite this book by chapter title, not number

  <!-- Part I: Communication -->
- Ch 1: Introduction
- Ch 2: Reliable links
- Ch 3: Secure links
- Ch 4: Discovery
- Ch 5: APIs
  <!-- Part II: Coordination -->
- Ch 6: System models
- Ch 7: Failure detection
- Ch 8: Time
- Ch 9: Leader election
- Ch 10: Replication
- Ch 11: Coordination avoidance
- Ch 12: Transactions
- Ch 13: Asynchronous transactions
  <!-- Part III: Scalability -->
- Ch 14: HTTP caching
- Ch 15: Content delivery networks
- Ch 16: Partitioning
- Ch 17: File storage
- Ch 18: Network load balancing
- Ch 19: Data storage
- Ch 20: Caching
- Ch 21: Microservices
- Ch 22: Control planes and data planes
- Ch 23: Messaging
  <!-- Part IV: Resiliency -->
- Ch 24: Common failure causes
- Ch 25: Redundancy
- Ch 26: Fault isolation
- Ch 27: Downstream resiliency
- Ch 28: Upstream resiliency
  <!-- Part V: Maintainability -->
- Ch 29: Testing
- Ch 30: Continuous delivery and deployment
- Ch 31: Monitoring
- Ch 32: Observability
- Ch 33: Manageability
- Ch 34: Final words

## Designing Distributed Systems (2nd edition, 2024)

- Author: Brendan Burns
- Publisher: O'Reilly Media, December 2024 · ISBN 978-1-098-15635-0
- Note: the 1st edition (2018) follows; the 2nd adds Ch 2 and Part V, so its numbers are shifted by one.
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. Foundational Concepts -->
- Ch 1: Introduction
- Ch 2: Important Distributed System Concepts
<!-- II. Single-Node Patterns -->
- Ch 3: The Sidecar Pattern
- Ch 4: Ambassadors
- Ch 5: Adapters
<!-- III. Serving Patterns -->
- Ch 6: Replicated Load-Balanced Services
- Ch 7: Sharded Services
- Ch 8: Scatter/Gather
- Ch 9: Functions and Event-Driven Processing
- Ch 10: Ownership Election
<!-- IV. Batch Computational Patterns -->
- Ch 11: Work Queue Systems
- Ch 12: Event-Driven Batch Processing
- Ch 13: Coordinated Batch Processing
<!-- V. Universal Concepts -->
- Ch 14: Monitoring and Observability Patterns
- Ch 15: AI Inference and Serving
- Ch 16: Common Failure Patterns

## Designing Distributed Systems (1st edition, 2018)

- Author: Brendan Burns
- Publisher: O'Reilly Media, February 2018 · ISBN 978-1-4919-8364-5
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Introduction
<!-- I. Single-Node Patterns -->
- Ch 2: The Sidecar Pattern
- Ch 3: Ambassadors
- Ch 4: Adapters
<!-- II. Serving Patterns -->
- Ch 5: Replicated Load-Balanced Services
- Ch 6: Sharded Services
- Ch 7: Scatter/Gather
- Ch 8: Functions and Event-Driven Processing
- Ch 9: Ownership Election
<!-- III. Batch Computational Patterns -->
- Ch 10: Work Queue Systems
- Ch 11: Event-Driven Batch Processing
- Ch 12: Coordinated Batch Processing
- Ch 13: Conclusion: A New Beginning?

## Site Reliability Engineering: How Google Runs Production Systems (1st edition, 2016)

- Editors: Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy
- Publisher: O'Reilly Media, April 2016 · ISBN 978-1-491-92912-4
- Free online: https://sre.google/sre-book/table-of-contents/ (appendices A–F are also online, e.g. https://sre.google/sre-book/availability-table/)
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. Introduction -->
- Ch 1: Introduction
- Ch 2: The Production Environment at Google, from the Viewpoint of an SRE
<!-- II. Principles -->
- Ch 3: Embracing Risk
- Ch 4: Service Level Objectives
- Ch 5: Eliminating Toil
- Ch 6: Monitoring Distributed Systems
- Ch 7: The Evolution of Automation at Google
- Ch 8: Release Engineering
- Ch 9: Simplicity
<!-- III. Practices -->
- Ch 10: Practical Alerting from Time-Series Data
- Ch 11: Being On-Call
- Ch 12: Effective Troubleshooting
- Ch 13: Emergency Response
- Ch 14: Managing Incidents
- Ch 15: Postmortem Culture: Learning from Failure
- Ch 16: Tracking Outages
- Ch 17: Testing for Reliability
- Ch 18: Software Engineering in SRE
- Ch 19: Load Balancing at the Frontend
- Ch 20: Load Balancing in the Datacenter
- Ch 21: Handling Overload
- Ch 22: Addressing Cascading Failures
- Ch 23: Managing Critical State: Distributed Consensus for Reliability
- Ch 24: Distributed Periodic Scheduling with Cron
- Ch 25: Data Processing Pipelines
- Ch 26: Data Integrity: What You Read Is What You Wrote
- Ch 27: Reliable Product Launches at Scale
<!-- IV. Management -->
- Ch 28: Accelerating SREs to On-Call and Beyond
- Ch 29: Dealing with Interrupts
- Ch 30: Embedding an SRE to Recover from Operational Overload
- Ch 31: Communication and Collaboration in SRE
- Ch 32: The Evolving SRE Engagement Model
<!-- V. Conclusions -->
- Ch 33: Lessons Learned from Other Industries
- Ch 34: Conclusion
- A. Availability Table
- B. A Collection of Best Practices for Production Services
- C. Example Incident State Document
- D. Example Postmortem
- E. Launch Coordination Checklist
- F. Example Production Meeting Minutes

## The Site Reliability Workbook: Practical Ways to Implement SRE (1st edition, 2018)

- Editors: Betsy Beyer, Niall Richard Murphy, David K. Rensin, Kent Kawahara, Stephen Thorne
- Publisher: O'Reilly Media, July 2018 · ISBN 978-1-492-02950-2
- Free online: https://sre.google/workbook/table-of-contents/
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: How SRE Relates to DevOps
<!-- I. Foundations -->
- Ch 2: Implementing SLOs
- Ch 3: SLO Engineering Case Studies
- Ch 4: Monitoring
- Ch 5: Alerting on SLOs
- Ch 6: Eliminating Toil
- Ch 7: Simplicity
<!-- II. Practices -->
- Ch 8: On-Call
- Ch 9: Incident Response
- Ch 10: Postmortem Culture: Learning from Failure
- Ch 11: Managing Load
- Ch 12: Introducing Non-Abstract Large System Design
- Ch 13: Data Processing Pipelines
- Ch 14: Configuration Design and Best Practices
- Ch 15: Configuration Specifics
- Ch 16: Canarying Releases
<!-- III. Processes -->
- Ch 17: Identifying and Recovering from Overload
- Ch 18: SRE Engagement Model
- Ch 19: SRE: Reaching Beyond Your Walls
- Ch 20: SRE Team Lifecycles
- Ch 21: Organizational Change Management in SRE
- A. Example SLO Document
- B. Example Error Budget Policy
- C. Results of Postmortem Analysis

## Seeking SRE: Conversations About Running Production Systems at Scale (1st edition, 2018)

- Editor: David N. Blank-Edelman (chapters by many contributors)
- Publisher: O'Reilly Media, September 2018 · ISBN 978-1-491-97886-3
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. SRE Implementation -->
- Ch 1: Context Versus Control in SRE
- Ch 2: Interviewing Site Reliability Engineers
- Ch 3: So, You Want to Build an SRE Team?
- Ch 4: Using Incident Metrics to Improve SRE at Scale
- Ch 5: Working with Third Parties Shouldn’t Suck
- Ch 6: How to Apply SRE Principles Without Dedicated SRE Teams
- Ch 7: SRE Without SRE: The Spotify Case Study
- Ch 8: Introducing SRE in Large Enterprises
- Ch 9: From SysAdmin to SRE in 8,963 Words
- Ch 10: Clearing the Way for SRE in the Enterprise
- Ch 11: SRE Patterns Loved by DevOps People Everywhere
- Ch 12: DevOps and SRE: Voices from the Community
- Ch 13: Production Engineering at Facebook
<!-- II. Near Edge SRE -->
- Ch 14: In the Beginning, There Was Chaos
- Ch 15: The Intersection of Reliability and Privacy
- Ch 16: Database Reliability Engineering
- Ch 17: Engineering for Data Durability
- Ch 18: Introduction to Machine Learning for SRE
<!-- III. SRE Best Practices and Technologies -->
- Ch 19: Do Docs Better: Integrating Documentation into the Engineering Workflow
- Ch 20: Active Teaching and Learning
- Ch 21: The Art and Science of the Service-Level Objective
- Ch 22: SRE as a Success Culture
- Ch 23: SRE Antipatterns
- Ch 24: Immutable Infrastructure and SRE
- Ch 25: Scriptable Load Balancers
- Ch 26: The Service Mesh: Wrangler of Your Microservices?
<!-- IV. The Human Side of SRE -->
- Ch 27: Psychological Safety in SRE
- Ch 28: SRE Cognitive Work
- Ch 29: Beyond Burnout
- Ch 30: Against On-Call: A Polemic
- Ch 31: Elegy for Complex Systems
- Ch 32: Intersections Between Operations and Social Activism
- Ch 33: Conclusion

## Building Secure and Reliable Systems (1st edition, 2020)

- Authors: Heather Adkins, Betsy Beyer, Paul Blankinship, Piotr Lewandowski, Ana Oprea, Adam Stubblefield (Google)
- Publisher: O'Reilly Media, March 2020 · ISBN 978-1-492-08312-2
- Free online: https://google.github.io/building-secure-and-reliable-systems/raw/toc.html (also linked from https://sre.google/books/)
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. Introductory Material -->
- Ch 1: The Intersection of Security and Reliability
- Ch 2: Understanding Adversaries
<!-- II. Designing Systems -->
- Ch 3: Case Study: Safe Proxies
- Ch 4: Design Tradeoffs
- Ch 5: Design for Least Privilege
- Ch 6: Design for Understandability
- Ch 7: Design for a Changing Landscape
- Ch 8: Design for Resilience
- Ch 9: Design for Recovery
- Ch 10: Mitigating Denial-of-Service Attacks
<!-- III. Implementing Systems -->
- Ch 11: Case Study: Designing, Implementing, and Maintaining a Publicly Trusted CA
- Ch 12: Writing Code
- Ch 13: Testing Code
- Ch 14: Deploying Code
- Ch 15: Investigating Systems
<!-- IV. Maintaining Systems -->
- Ch 16: Disaster Planning
- Ch 17: Crisis Management
- Ch 18: Recovery and Aftermath
<!-- V. Organization and Culture -->
- Ch 19: Case Study: Chrome Security Team
- Ch 20: Understanding Roles and Responsibilities
- Ch 21: Building a Culture of Security and Reliability
- A. A Disaster Risk Assessment Matrix

## Release It! Design and Deploy Production-Ready Software (2nd edition, 2018)

- Author: Michael T. Nygard
- Publisher: Pragmatic Bookshelf, January 2018 · ISBN 978-1-68050-239-8 · https://pragprog.com/titles/mnee2/release-it-second-edition/
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Living in Production
<!-- Part I. Create Stability -->
- Ch 2: Case Study: The Exception That Grounded an Airline
- Ch 3: Stabilize Your System
- Ch 4: Stability Antipatterns
- Ch 5: Stability Patterns
<!-- Part II. Design for Production -->
- Ch 6: Case Study: Phenomenal Cosmic Powers, Itty-Bitty Living Space
- Ch 7: Foundations
- Ch 8: Processes on Machines
- Ch 9: Interconnect
- Ch 10: Control Plane
- Ch 11: Security
<!-- Part III. Deliver Your System -->
- Ch 12: Case Study: Waiting for Godot
- Ch 13: Design for Deployment
- Ch 14: Handling Versions
<!-- Part IV. Solve Systemic Problems -->
- Ch 15: Case Study: Trampled by Your Own Customers
- Ch 16: Adaptation
- Ch 17: Chaos Engineering

## Systems Performance: Enterprise and the Cloud (2nd edition, 2020)

- Author: Brendan Gregg
- Publisher: Addison-Wesley, December 2020 · ISBN 978-0-13-682015-4 · author page: https://www.brendangregg.com/systems-performance-2nd-edition-book.html
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Introduction
- Ch 2: Methodologies
- Ch 3: Operating Systems
- Ch 4: Observability Tools
- Ch 5: Applications
- Ch 6: CPUs
- Ch 7: Memory
- Ch 8: File Systems
- Ch 9: Disks
- Ch 10: Network
- Ch 11: Cloud Computing
- Ch 12: Benchmarking
- Ch 13: perf
- Ch 14: Ftrace
- Ch 15: BPF
- Ch 16: Case Study
- Appendix A: USE Method: Linux
- Appendix B: sar Summary
- Appendix C: bpftrace One-Liners
- Appendix D: Solutions to Selected Exercises
- Appendix E: Systems Performance Who’s Who

## Observability Engineering (1st edition, 2022)

- Authors: Charity Majors, Liz Fong-Jones, George Miranda
- Publisher: O'Reilly Media, May 2022 · ISBN 978-1-492-07644-5
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. The Path to Observability -->
- Ch 1: What Is Observability?
- Ch 2: How Debugging Practices Differ Between Observability and Monitoring
- Ch 3: Lessons from Scaling Without Observability
- Ch 4: How Observability Relates to DevOps, SRE, and Cloud Native
<!-- II. Fundamentals of Observability -->
- Ch 5: Structured Events Are the Building Blocks of Observability
- Ch 6: Stitching Events into Traces
- Ch 7: Instrumentation with OpenTelemetry
- Ch 8: Analyzing Events to Achieve Observability
- Ch 9: How Observability and Monitoring Come Together
<!-- III. Observability for Teams -->
- Ch 10: Applying Observability Practices in Your Team
- Ch 11: Observability-Driven Development
- Ch 12: Using Service-Level Objectives for Reliability
- Ch 13: Acting on and Debugging SLO-Based Alerts
- Ch 14: Observability and the Software Supply Chain
<!-- IV. Observability at Scale -->
- Ch 15: Build Versus Buy and Return on Investment
- Ch 16: Efficient Data Storage
- Ch 17: Cheap and Accurate Enough: Sampling
- Ch 18: Telemetry Management with Pipelines
<!-- V. Spreading Observability Culture -->
- Ch 19: The Business Case for Observability
- Ch 20: Observability’s Stakeholders and Allies
- Ch 21: An Observability Maturity Model
- Ch 22: Where to Go from Here

## Computer Networking: A Top-Down Approach (8th edition, 2020)

- Authors: James F. Kurose, Keith W. Ross
- Publisher: Pearson, July 2020 (© 2021) · ISBN 978-0-13-592861-5
- Note: the authors' site says a 9th edition came out in summer 2025 (ISBN 978-0-13-542933-4; https://gaia.cs.umass.edu/kurose_ross/index.php). We did not verify its chapter list, so cite the 8th edition, or check the 9th before citing it.
- Chapter list: VERIFIED (8th ed.) against the Pearson catalogue TOC: https://www.pearson.com/en-us/subject-catalog/p/computer-networking/P200000003334/9780135928615

- Ch 1: Computer Networks and the Internet
- Ch 2: Application Layer
- Ch 3: Transport Layer
- Ch 4: The Network Layer: Data Plane
- Ch 5: The Network Layer: Control Plane
- Ch 6: The Link Layer and LANs
- Ch 7: Wireless and Mobile Networks
- Ch 8: Security in Computer Networks

## High Performance Browser Networking (1st edition, 2013)

- Author: Ilya Grigorik
- Publisher: O'Reilly Media, September 2013 · ISBN 978-1-4493-4476-4
- Free online (kept updated, with an HTTP/2 chapter): https://hpbn.co/
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. Networking 101 -->
- Ch 1: Primer on Latency and Bandwidth
- Ch 2: Building Blocks of TCP
- Ch 3: Building Blocks of UDP
- Ch 4: Transport Layer Security (TLS)
<!-- II. Performance of Wireless Networks -->
- Ch 5: Introduction to Wireless Networks
- Ch 6: WiFi
- Ch 7: Mobile Networks
- Ch 8: Optimizing for Mobile Networks
<!-- III. HTTP -->
- Ch 9: Brief History of HTTP
- Ch 10: Primer on Web Performance
- Ch 11: HTTP/1.X
- Ch 12: HTTP/2
- Ch 13: Optimizing Application Delivery
<!-- IV. Browser APIs and Protocols -->
- Ch 14: Primer on Browser Networking
- Ch 15: XMLHttpRequest
- Ch 16: Server-Sent Events (SSE)
- Ch 17: WebSocket
- Ch 18: WebRTC

## Building Microservices: Designing Fine-Grained Systems (2nd edition, 2021)

- Author: Sam Newman
- Publisher: O'Reilly Media, August 2021 · ISBN 978-1-492-03402-5
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. Foundation -->
- Ch 1: What Are Microservices?
- Ch 2: How to Model Microservices
- Ch 3: Splitting the Monolith
- Ch 4: Microservice Communication Styles
<!-- II. Implementation -->
- Ch 5: Implementing Microservice Communication
- Ch 6: Workflow
- Ch 7: Build
- Ch 8: Deployment
- Ch 9: Testing
- Ch 10: From Monitoring to Observability
- Ch 11: Security
- Ch 12: Resiliency
- Ch 13: Scaling
<!-- III. People -->
- Ch 14: User Interfaces
- Ch 15: Organizational Structures
- Ch 16: The Evolutionary Architect

## Fundamentals of Software Architecture (2nd edition, 2025)

- Authors: Mark Richards, Neal Ford
- Publisher: O'Reilly Media, March 2025 · ISBN 978-1-098-17551-1
- Note: the 1st edition (2020, ISBN 978-1-492-04345-4) has 24 chapters with different numbering after Ch 10. It has no modular-monolith or architectural-patterns chapter.
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Introduction
<!-- I. Foundations -->
- Ch 2: Architectural Thinking
- Ch 3: Modularity
- Ch 4: Architectural Characteristics Defined
- Ch 5: Identifying Architectural Characteristics
- Ch 6: Measuring and Governing Architecture Characteristics
- Ch 7: The Scope of Architectural Characteristics
- Ch 8: Component-Based Thinking
<!-- II. Architecture Styles -->
- Ch 9: Foundations
- Ch 10: Layered Architecture Style
- Ch 11: The Modular Monolith Architecture Style
- Ch 12: Pipeline Architecture Style
- Ch 13: Microkernel Architecture Style
- Ch 14: Service-Based Architecture Style
- Ch 15: Event-Driven Architecture Style
- Ch 16: Space-Based Architecture Style
- Ch 17: Orchestration-Driven Service-Oriented Architecture
- Ch 18: Microservices Architecture
- Ch 19: Choosing the Appropriate Architecture Style
- Ch 20: Architectural Patterns
<!-- III. Techniques and Soft Skills -->
- Ch 21: Architectural Decisions
- Ch 22: Analyzing Architecture Risk
- Ch 23: Diagramming Architecture
- Ch 24: Making Teams Effective
- Ch 25: Negotiation and Leadership Skills
- Ch 26: Architectural Intersections
- Ch 27: The Laws of Software Architecture, Revisited

## Clean Architecture: A Craftsman's Guide to Software Structure and Design (1st edition, 2017)

- Author: Robert C. Martin
- Publisher: Prentice Hall / Pearson, September 2017 · ISBN 978-0-13-449416-6
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- PART I Introduction -->
- Ch 1: What Is Design and Architecture?
- Ch 2: A Tale of Two Values
<!-- PART II Starting with the Bricks: Programming Paradigms -->
- Ch 3: Paradigm Overview
- Ch 4: Structured Programming
- Ch 5: Object-Oriented Programming
- Ch 6: Functional Programming
<!-- PART III Design Principles -->
- Ch 7: SRP: The Single Responsibility Principle
- Ch 8: OCP: The Open-Closed Principle
- Ch 9: LSP: The Liskov Substitution Principle
- Ch 10: ISP: The Interface Segregation Principle
- Ch 11: DIP: The Dependency Inversion Principle
<!-- PART IV Component Principles -->
- Ch 12: Components
- Ch 13: Component Cohesion
- Ch 14: Component Coupling
<!-- PART V Architecture -->
- Ch 15: What Is Architecture?
- Ch 16: Independence
- Ch 17: Boundaries: Drawing Lines
- Ch 18: Boundary Anatomy
- Ch 19: Policy and Level
- Ch 20: Business Rules
- Ch 21: Screaming Architecture
- Ch 22: The Clean Architecture
- Ch 23: Presenters and Humble Objects
- Ch 24: Partial Boundaries
- Ch 25: Layers and Boundaries
- Ch 26: The Main Component
- Ch 27: Services: Great and Small
- Ch 28: The Test Boundary
- Ch 29: Clean Embedded Architecture
<!-- PART VI Details -->
- Ch 30: The Database Is a Detail
- Ch 31: The Web Is a Detail
- Ch 32: Frameworks Are Details
- Ch 33: Case Study: Video Sales
- Ch 34: The Missing Chapter
<!-- PART VII Appendix -->
- Appendix A Architecture Archaeology

## Domain-Driven Design: Tackling Complexity in the Heart of Software (1st edition, 2003)

- Author: Eric Evans
- Publisher: Addison-Wesley, August 2003 · ISBN 978-0-321-12521-7
- Note: the O'Reilly TOC numbers chapters in words ("One." …). Topics are not listed here. Ch 14 covers bounded contexts and context maps; Ch 5–6 cover entities, value objects, services, aggregates, factories and repositories.
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I: Putting the Domain Model to Work -->
- Ch 1: Crunching Knowledge
- Ch 2: Communication and the Use of Language
- Ch 3: Binding Model and Implementation
<!-- II: The Building Blocks of a Model-Driven Design -->
- Ch 4: Isolating the Domain
- Ch 5: A Model Expressed in Software
- Ch 6: The Life Cycle of a Domain Object
- Ch 7: Using the Language: An Extended Example
<!-- III: Refactoring Toward Deeper Insight -->
- Ch 8: Breakthrough
- Ch 9: Making Implicit Concepts Explicit
- Ch 10: Supple Design
- Ch 11: Applying Analysis Patterns
- Ch 12: Relating Design Patterns to the Model
- Ch 13: Refactoring Toward Deeper Insight
<!-- IV: Strategic Design -->
- Ch 14: Maintaining Model Integrity
- Ch 15: Distillation
- Ch 16: Large-Scale Structure
- Ch 17: Bringing the Strategy Together

## Design Patterns: Elements of Reusable Object-Oriented Software (1st edition, 1994)

- Authors: Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (the "Gang of Four")
- Publisher: Addison-Wesley, 1994 · ISBN 978-0-201-63361-0
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Introduction
- Ch 2: A Case Study: Designing a Document Editor
<!-- Design Pattern Catalog -->
- Ch 3: Creational Patterns
- Ch 4: Structural Patterns
- Ch 5: Behavioral Patterns
- Ch 6: Conclusion
- Appendix A. Glossary
- Appendix B. Guide to Notation
- Appendix C. Foundation Classes

## Head First Design Patterns (2nd edition, 2020)

- Authors: Eric Freeman, Elisabeth Robson (with Kathy Sierra and Bert Bates)
- Publisher: O'Reilly Media, December 2020 · ISBN 978-1-492-07800-5
- Note: each chapter title includes the pattern it teaches
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Welcome to Design Patterns: Intro to Design Patterns
- Ch 2: Keeping your Objects in the Know: The Observer Pattern
- Ch 3: Decorating Objects: The Decorator Pattern
- Ch 4: Baking with OO Goodness: The Factory Pattern
- Ch 5: One-of-a-Kind Objects: The Singleton Pattern
- Ch 6: Encapsulating Invocation: The Command Pattern
- Ch 7: Being Adaptive: The Adapter and Facade Patterns
- Ch 8: Encapsulating Algorithms: The Template Method Pattern
- Ch 9: Well-Managed Collections: The Iterator and Composite Patterns
- Ch 10: The State of Things: The State Pattern
- Ch 11: Controlling Object Access: The Proxy Pattern
- Ch 12: Patterns of Patterns: Compound Patterns
- Ch 13: Patterns in the Real World: Better Living with Patterns
- A. Leftover Patterns

## Refactoring: Improving the Design of Existing Code (2nd edition, 2018)

- Author: Martin Fowler (with contributions by Kent Beck)
- Publisher: Addison-Wesley, November 2018 · ISBN 978-0-13-475759-9 · online catalogue of refactorings: https://refactoring.com/catalog/
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Refactoring: A First Example
- Ch 2: Principles in Refactoring
- Ch 3: Bad Smells in Code
- Ch 4: Building Tests
- Ch 5: Introducing the Catalog
- Ch 6: A First Set of Refactorings
- Ch 7: Encapsulation
- Ch 8: Moving Features
- Ch 9: Organizing Data
- Ch 10: Simplifying Conditional Logic
- Ch 11: Refactoring APIs
- Ch 12: Dealing with Inheritance

## System Design Interview – An Insider's Guide, Volume 1 (2020)

- Author: Alex Xu
- Publisher: Byte Code LLC (self-published), June 2020 · ISBN 979-8-664653-40-3
- Chapter list: VERIFIED against a bookseller listing only (https://www.porchlightbooks.com/products/system-design-interview-an-insiders-guide-alex-xu-9798664653403). We found no publisher page

- Ch 1: Scale From Zero To Millions Of Users
- Ch 2: Back-of-the-envelope Estimation
- Ch 3: A Framework For System Design Interviews
- Ch 4: Design A Rate Limiter
- Ch 5: Design Consistent Hashing
- Ch 6: Design A Key-value Store
- Ch 7: Design A Unique ID Generator In Distributed Systems
- Ch 8: Design A URL Shortener
- Ch 9: Design A Web Crawler
- Ch 10: Design A Notification System
- Ch 11: Design A News Feed System
- Ch 12: Design A Chat System
- Ch 13: Design A Search Autocomplete System
- Ch 14: Design YouTube
- Ch 15: Design Google Drive
- Ch 16: The Learning Continues

## System Design Interview – An Insider's Guide, Volume 2 (2022)

- Authors: Alex Xu, Sahn Lam
- Publisher: Byte Code LLC (self-published), 2022 · ISBN 978-1-7360491-1-2
- Chapter list: VERIFIED against bookseller listings only (https://www.abebooks.com/System-Design-Interview-Insiders-Guide-Volume/32153640463/bd). We found no publisher page

- Ch 1: Proximity Service
- Ch 2: Nearby Friends
- Ch 3: Google Maps
- Ch 4: Distributed Message Queue
- Ch 5: Metrics Monitoring
- Ch 6: Ad Click Event Aggregation
- Ch 7: Hotel Reservation
- Ch 8: Distributed Email Service
- Ch 9: S3-like Object Storage
- Ch 10: Real-time Gaming Leaderboard
- Ch 11: Payment System
- Ch 12: Digital Wallet
- Ch 13: Stock Exchange

## Cracking the Coding Interview (6th edition, 2015)

- Author: Gayle Laakmann McDowell
- Publisher: CareerCup, July 2015 · ISBN 978-0-9847828-5-7
- Chapter list: **PARTLY VERIFIED.** The author's contents page (https://crackingthecodinginterview.com/contents.html) confirms the section names and the 17 question topics in this order, with the last two as "Assorted Moderate Problems" and "Assorted Hard Problems". That page gives no numbers. The chapter numbers 1–17, the Roman-numeral section numbers, the wording of Ch 9, and Sections X–XI are from memory and UNVERIFIED

- Section I: The Interview Process
- Section II: Behind the Scenes
- Section III: Special Situations
- Section IV: Before the Interview
- Section V: Behavioral Questions
- Section VI: Big O
- Section VII: Technical Questions — how to prepare; walking through a problem; optimize-and-solve techniques (BUD, DIY, simplify and generalize, base case and build, data structure brainstorm); best conceivable runtime
- Section VIII: The Offer and Beyond
- Section IX: Interview Questions (the numbered chapters follow)
- Ch 1: Arrays and Strings
- Ch 2: Linked Lists
- Ch 3: Stacks and Queues
- Ch 4: Trees and Graphs
- Ch 5: Bit Manipulation
- Ch 6: Math and Logic Puzzles
- Ch 7: Object-Oriented Design
- Ch 8: Recursion and Dynamic Programming
- Ch 9: System Design and Scalability (the author's contents page calls it "Scalability and Memory Limits")
- Ch 10: Sorting and Searching
- Ch 11: Testing
- Ch 12: C and C++
- Ch 13: Java
- Ch 14: Databases
- Ch 15: Threads and Locks
- Ch 16: Moderate
- Ch 17: Hard
- Section X: Solutions
- Section XI: Advanced Topics

## Software Engineering at Google: Lessons Learned from Programming Over Time (1st edition, 2020)

- Editors: Titus Winters, Tom Manshreck, Hyrum Wright
- Publisher: O'Reilly Media, March 2020 · ISBN 978-1-492-08279-8
- Free online: https://abseil.io/resources/swe-book/html/toc.html
- Chapter list: VERIFIED against the free online TOC: https://abseil.io/resources/swe-book/html/toc.html

<!-- Part I: Thesis -->
- Ch 1: What Is Software Engineering?
<!-- Part II: Culture -->
- Ch 2: How to Work Well on Teams
- Ch 3: Knowledge Sharing
- Ch 4: Engineering for Equity
- Ch 5: How to Lead a Team
- Ch 6: Leading at Scale
- Ch 7: Measuring Engineering Productivity
<!-- Part III: Processes -->
- Ch 8: Style Guides and Rules
- Ch 9: Code Review
- Ch 10: Documentation
- Ch 11: Testing Overview
- Ch 12: Unit Testing
- Ch 13: Test Doubles
- Ch 14: Larger Testing
- Ch 15: Deprecation
<!-- Part IV: Tools -->
- Ch 16: Version Control and Branch Management
- Ch 17: Code Search
- Ch 18: Build Systems and Build Philosophy
- Ch 19: Critique: Google's Code Review Tool
- Ch 20: Static Analysis
- Ch 21: Dependency Management
- Ch 22: Large-Scale Changes
- Ch 23: Continuous Integration
- Ch 24: Continuous Delivery
- Ch 25: Compute as a Service

## Accelerate: The Science of Lean Software and DevOps (1st edition, 2018)

- Authors: Nicole Forsgren, Jez Humble, Gene Kim
- Publisher: IT Revolution Press, March 2018 · ISBN 978-1-942788-33-1
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- Part One: What We Found -->
- Ch 1: Accelerate
- Ch 2: Measuring Performance
- Ch 3: Measuring and Changing Culture
- Ch 4: Technical Practices
- Ch 5: Architecture
- Ch 6: Integrating Infosec into the Delivery Lifecycle
- Ch 7: Management Practices for Software
- Ch 8: Product Development
- Ch 9: Making Work Sustainable
- Ch 10: Employee Satisfaction, Identity, and Engagement
- Ch 11: Leaders and Managers
<!-- Part Two: The Research -->
- Ch 12: The Science Behind This Book
- Ch 13: Introduction to Psychometrics
- Ch 14: Why Use a Survey
- Ch 15: The Data for the Project
<!-- Part Three: Transformation -->
- Ch 16: High-Performance Leadership and Management
- Appendix A: Capabilities to Drive Improvement
- Appendix B: The Stats
- Appendix C: Statistical Methods Used in Our Research

## Team Topologies: Organizing Business and Technology Teams for Fast Flow (1st edition, 2019)

- Authors: Matthew Skelton, Manuel Pais
- Publisher: IT Revolution Press, September 2019 · ISBN 978-1-942788-81-2
- Note: a 2nd edition (2025, ISBN 978-1-966280-00-2) exists. We did not verify its chapter list.
- Topics: Ch 5 covers stream-aligned, enabling, complicated-subsystem and platform teams. Ch 7 covers the collaboration, X-as-a-Service and facilitating interaction modes.
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- PART I TEAMS AS THE MEANS OF DELIVERY -->
- Ch 1: The Problem with Org Charts
- Ch 2: Conway’s Law and Why It Matters
- Ch 3: Team-First Thinking
<!-- PART II TEAM TOPOLOGIES THAT WORK FOR FLOW -->
- Ch 4: Static Team Topologies
- Ch 5: The Four Fundamental Team Topologies
- Ch 6: Choose Team-First Boundaries
<!-- PART III EVOLVING TEAM INTERACTIONS FOR INNOVATION AND RAPID DELIVERY -->
- Ch 7: Team Interaction Modes
- Ch 8: Evolve Team Structures with Organizational Sensing

## The Staff Engineer's Path (1st edition, 2022)

- Author: Tanya Reilly
- Publisher: O'Reilly Media, September 2022 · ISBN 978-1-098-11873-0
- Chapter list: VERIFIED against the publisher's table of contents.

<!-- I. The Big Picture -->
- Ch 1: What Would You Say You Do Here?
- Ch 2: Three Maps
- Ch 3: Creating the Big Picture
<!-- II. Execution -->
- Ch 4: Finite Time
- Ch 5: Leading Big Projects
- Ch 6: Why Have We Stopped?
<!-- III. Leveling Up -->
- Ch 7: You’re a Role Model Now (Sorry)
- Ch 8: Good Influence at Scale
- Ch 9: What’s Next?

## AI Engineering: Building Applications with Foundation Models (1st edition, 2025)

- Author: Chip Huyen
- Publisher: O'Reilly Media, December 2024 (print dated 2025) · ISBN 978-1-098-16630-4
- Companion repo with resources: https://github.com/chiphuyen/aie-book
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Introduction to Building AI Applications with Foundation Models
- Ch 2: Understanding Foundation Models
- Ch 3: Evaluation Methodology
- Ch 4: Evaluate AI Systems
- Ch 5: Prompt Engineering
- Ch 6: RAG and Agents
- Ch 7: Finetuning
- Ch 8: Dataset Engineering
- Ch 9: Inference Optimization
- Ch 10: AI Engineering Architecture and User Feedback

## Designing Machine Learning Systems (1st edition, 2022)

- Author: Chip Huyen
- Publisher: O'Reilly Media, May 2022 · ISBN 978-1-098-10796-3
- Companion repo with chapter summaries: https://github.com/chiphuyen/dmls-book
- Chapter list: VERIFIED against the publisher's table of contents.

- Ch 1: Overview of Machine Learning Systems
- Ch 2: Introduction to Machine Learning Systems Design
- Ch 3: Data Engineering Fundamentals
- Ch 4: Training Data
- Ch 5: Feature Engineering
- Ch 6: Model Development and Offline Evaluation
- Ch 7: Model Deployment and Prediction Service
- Ch 8: Data Distribution Shifts and Monitoring
- Ch 9: Continual Learning and Test in Production
- Ch 10: Infrastructure and Tooling for MLOps
- Ch 11: The Human Side of Machine Learning
