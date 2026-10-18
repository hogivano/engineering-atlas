---
title: Handling write-heavy workloads
minutes: 14
---

## In one minute
- Reads scale by copying data. Writes cannot be copied away: each must land on the one owner of that state, so write scaling means splitting ownership and making each write cheaper.
- The toolkit: **partition** so many nodes own disjoint keys, **buffer** in a durable log to absorb bursts, **batch and coalesce** so one operation carries many writes, and use a **write-optimised engine** (LSM tree or append-only log) that makes writes sequential.
- The partition key decides everything. A bad key creates a hot partition that no hardware fixes.
- Buffering is only safe with **backpressure**: when consumers fall behind, producers must slow, shed or degrade.
- Interviewers probe the numbers (writes per second per partition), the durability point (when can you say "saved"), and what happens to the hottest key.

## How it works

### Find the ceiling first
Before choosing a technique, divide. If a ride-hailing app ingests 1.2 million GPS pings per second and one Postgres primary on good NVMe sustains perhaps 20,000 to 50,000 small durable inserts per second, no tuning closes a 25x gap. If a review site takes 300 writes per second, one primary is fine and everything below is overkill. Say the arithmetic out loud.

### Partition by a key that matches the write
Sharding splits the key space so each node owns a slice of the writes. The partition key needs high cardinality, a roughly uniform write rate per value, and should co-locate data that one transaction updates together. For GPS pings, `driver_id` works. For chat, `conversation_id` keeps a conversation's messages ordered on one shard. A bare timestamp is the classic mistake: every current write lands in the newest range, on one shard. Put a high-cardinality field such as `sensor_id` before the time, as Bigtable's schema guide advises ([Google Cloud docs](https://docs.cloud.google.com/bigtable/docs/schema-design)), or a bucket such as `hash(sensor_id) % 64` when the store has no natural high-cardinality prefix. Managed stores publish the per-partition ceiling you are designing against: a DynamoDB partition takes at most 1,000 write units per second, one unit per 1 KB item written, however large the table ([AWS docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html)).

### Buffer through a durable log
Put a partitioned log such as Kafka (see the Kafka lesson) between the API and the database. The API acknowledges once the event is replicated in the log, a few milliseconds, and consumers write to the database at the rate it can sustain. A 5-minute spike at 3x normal becomes a backlog that drains over half an hour instead of an outage ([Azure queue-based load leveling](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)). The price: the write is durable but not yet queryable, so read-your-own-writes needs care.

### Batch and coalesce
Most write cost is per operation, not per byte: a round trip, a commit, an `fsync`. Grouping 500 rows into one multi-row `INSERT` or `COPY` cuts that overhead by orders of magnitude. Kafka producers batch by default: since Kafka 4.0, `linger.ms` defaults to 5 ms instead of 0, with `batch.size` at 16 KB, `acks=all` and idempotence on ([Kafka docs](https://kafka.apache.org/43/configuration/producer-configs/)). Coalescing goes further for counters and last-value state: 400 like increments for one post in a second become one `UPDATE ... SET likes = likes + 400`. The hot-keys lesson covers splitting a hot counter; coalescing is the cheaper first step.

### Write-behind
A write-behind cache accepts writes in memory and flushes them asynchronously. It is coalescing with a cache attached, acceptable only where losing the last few seconds on a crash is tolerable (view counts, presence, game positions) or the cache itself is replicated and persisted. Databases offer a milder version of the same trade: Postgres with `synchronous_commit = off` acknowledges before the WAL flush, so a crash can lose up to three times `wal_writer_delay` (about 600 ms at the 200 ms default) of acknowledged commits, but never corrupts data ([Postgres docs](https://www.postgresql.org/docs/current/wal-async-commit.html)).

### Write-optimised storage
B-tree engines update pages in place, so random inserts touch scattered pages. LSM-tree engines (RocksDB, Cassandra, ScyllaDB, HBase) append to a write-ahead log, insert into an in-memory sorted table, and later flush whole sorted files, so writes are sequential and batched by construction. Event data often goes further: append-only files in object storage, partitioned by hour, never updated.

### Backpressure
Every buffer is finite. When consumers stay slower than producers, something must give. In order of preference: slow the producer (bounded queues, HTTP 429 with `Retry-After`), coalesce harder, shed low-value writes (debug telemetry, sampled analytics), and only last let the queue grow. A backlog that grows past what consumers can clear becomes its own outage, because the newest work waits behind hours of stale work ([AWS Builders' Library](https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/)).

### How it shows up in interviews
Triggers: metrics or logging pipelines, ad click aggregation, location tracking, like counters, chat message stores, IoT ingestion. A strong answer sizes the write rate, justifies the partition key, names the durability point and storage engine, batches, and handles the hot partition. Probes: a 10x spike, one key at 30% of traffic, reading your own write, a consumer crashing mid-batch.

## Down the stack

### Layer 1: The contract
The caller needs to know what "200 OK" means: replicated to `min.insync.replicas` log brokers (durable, visible within seconds), committed in the database (durable and visible, bounded by database throughput), or accepted by an in-memory buffer (fast, lossy on crash). Buffered pipelines apply writes at least once, so writes must be idempotent via an event ID or an upsert keyed by `(entity, sequence)`. Ordering holds only per partition key.

### Layer 2: The mechanism
In RocksDB, a `Put` appends to the WAL, then inserts into the memtable, a skiplist sized by `write_buffer_size` (64 MB by default, per [`options.h`](https://github.com/facebook/rocksdb/blob/main/include/rocksdb/options.h)). A full memtable becomes immutable and is flushed to level 0 as an SSTable: sorted blocks of about 4 KB, an index block and a Bloom filter. Compaction merges files into lower levels, each roughly 10x larger. When level 0 holds too many files (`level0_slowdown_writes_trigger`, 20 by default) RocksDB delays writes, and at `level0_stop_writes_trigger` (36) it stops them; the same happens when too many memtables wait to flush or pending compaction bytes pass a soft or hard limit, and a stall in one column family stalls the whole database ([RocksDB wiki](https://github.com/facebook/rocksdb/wiki/Write-Stalls)). That is backpressure inside the engine. Cassandra has the same shape with a commit log and per-table memtables. Kafka producers use `linger.ms` and `batch.size` to trade milliseconds for larger compressed batches.

### Layer 3: The machine
A durable write costs at least one `fsync`. On a consumer NVMe drive without power-loss protection that is roughly hundreds of microseconds to a few milliseconds; enterprise drives with capacitor-backed caches take tens of microseconds. One sync per row caps a log at a few thousand rows per second, so Postgres, InnoDB and LSM WALs use group commit: many commits share one flush. Flash prefers sequential writes: SSDs program 4 to 16 KB pages but erase much larger blocks, so small random overwrites cause internal garbage collection stalls, while whole SSTables do not. LSM trees pay their own amplification: with leveled compaction a byte may be rewritten tens of times (the RocksDB tuning guide works one 500 GB example out to about 33), so compaction throughput is usually the long-run write ceiling ([RocksDB tuning guide](https://github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide)).

### Why it's built this way
Writes have one owner per key, so throughput scales only by splitting keys across owners. Durable storage charges per sync and per seek, so writes are batched behind one sync and laid out sequentially. Sequential layouts leave stale versions behind, so they need compaction, and compaction competes for the same disk, so engines throttle writers when it falls behind. Producers and consumers run at different speeds, so a durable buffer decouples them, and any buffer is finite, so backpressure must be explicit.

## Diagram
```mermaid
flowchart LR
    C["Clients"] --> API["Ingest API"]
    API -->|"key = driver_id"| K["Partitioned log (64 partitions)"]
    API -.->|"429 when lag too high"| C
    K --> W["Consumers: coalesce per key, batch 500"]
    W --> DB["LSM store (sharded by driver_id)"]
    DB --> WAL["WAL append + memtable"]
    WAL --> SST["Flush to SSTable, compact"]
```

## Worked example
A fleet-tracking product has 3 million active vehicles, each sending a 200-byte position every 2 seconds: 1.5 million writes per second, about 300 MB/s of payload. Dashboards need the latest position per vehicle; analytics needs history.

Ingest: a log with 128 partitions keyed by `vehicle_id` gives about 12,000 events per second per partition. Producers use `linger.ms=5` and compression, so each request carries a few hundred events.

Latest position: a 16-node LSM-backed cluster takes about 94,000 upserts per second per node, in batches of 500, so under 200 requests per second per node. History: a second consumer group writes compressed Parquet files to object storage once a minute per partition, keeping append-only data out of the database.

Spike: a firmware bug makes 100,000 vehicles send 20 pings per second, adding 2 million events per second. The log absorbs them and lag climbs, but consumers coalesce each vehicle to one upsert per second, so database load barely moves. If lag passes 60 seconds, the API returns 429 to devices above their per-device rate.

## In the wild
- **Mailchimp (Mandrill), 2019: one hot shard hits transaction-ID wraparound.** The hashing scheme sent a disproportionate share of writes to one Postgres shard, its autovacuum fell behind, and the database stopped accepting writes to protect itself. A full vacuum would have taken days, so the team truncated two tables to finish it; the outage lasted about 40 hours. Mailchimp added wraparound alerting afterwards ([Mailchimp](https://mailchimp.com/what-we-learned-from-the-recent-mandrill-outage/)).
- **Figma, 2024: horizontal sharding after vertical splits ran out.** Database load grew almost 100x from 2020, and single tables reached several terabytes and billions of rows, hitting vacuum problems and RDS IOPS limits. Figma grouped tables that share a shard key into "colos", used Postgres views to shard logically before moving data, and routed queries through a proxy; the first table went live in September 2023 with about 10 seconds of partial unavailability ([Figma](https://www.figma.com/blog/how-figmas-databases-team-lived-to-tell-the-scale/)).
- **Discord, 2023: compaction backlogs and hot partitions in an LSM store.** Discord's messages cluster grew from 12 Cassandra nodes in 2017 to 177, and suffered hot partitions, garbage-collection pauses and compaction that fell behind. It moved to 72 ScyllaDB nodes behind Rust data services that coalesce identical reads, and p99 historical-message latency fell from 40 to 125 ms to 15 ms ([Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages)).

## Trade-offs
| Option | Strengths | Weaknesses | Choose when |
|---|---|---|---|
| Single primary, bigger box | Simple, transactional | Hard ceiling, one failure domain | Under tens of thousands of writes/s |
| Hash sharding by entity key | Even spread, linear scaling | Cross-shard transactions and queries hurt | High-cardinality keys, per-entity access |
| Durable log in front | Absorbs bursts, replayable | Read-your-writes lag, more moving parts | Spiky ingest, many downstream consumers |
| Coalescing and write-behind | Huge reduction for counters | Lossy on crash unless the buffer is durable | Counters, last-value state |
| LSM storage | Sequential writes, high ingest | Compaction cost, slower point reads | Write-heavy key-value or time series |

## Pitfalls in production
- **Monotonic partition keys.** Auto-increment IDs or timestamps send every new write to the last range. Hash or prefix the key.
- **Unbounded queues.** A backlog of hours means hours of stale data. Alert on consumer lag in seconds, and shed or reject early.
- **Compaction debt.** An LSM store looks fast for days, then stalls when compaction falls behind. Watch pending compaction bytes and keep disk headroom.
- **Non-idempotent replays.** A consumer crashes after writing a batch but before committing its offset, and increments are applied twice. Carry event IDs or write absolute values.
- **Hot partition hidden by averages.** Cluster-wide utilisation is 30% while one partition is pinned. Track the busiest partition and the busiest key, and split or salt them (see the hot-keys lesson).
- **Batching without a deadline.** A batcher waiting for 500 items holds the last few for minutes at night. Flush on size or age, whichever comes first.

## Leadership lens
- Ask "when does the API say saved, and what is lost if each component dies right after?" in every design review; the answer defines your data-loss budget.
- The partition key is the hardest decision to reverse. Spend review time on it, and test it against the real key distribution, not a synthetic uniform one.
- Make consumer lag a first-class SLO with an owner. Most write-pipeline incidents are lag incidents first.
- Budget for compaction and replication: an LSM cluster writing 300 MB/s of user data may move several GB/s on disk.

## Check yourself
1. Why does adding read replicas not help a write-bound database?
   **Answer:** Every replica must apply every write, so replicas multiply write work rather than divide it. Only splitting ownership across shards divides the writes.
2. Why is a timestamp a poor partition key for an event stream?
   **Answer:** All current writes share nearby timestamps, so they land on the one partition owning the newest range while the rest idle.
3. What does group commit buy, and what does it cost?
   **Answer:** Many transactions share one `fsync`, raising throughput by the batch size; each transaction waits a little longer for the shared flush.
4. Why do LSM engines stall writes on purpose?
   **Answer:** If flushes and compaction fall behind, read amplification and space grow without bound, so the engine slows writers to let background work catch up.

## Practice
**Task:** Build a coalescing write buffer with backpressure. `WriteBuffer(capacity, batch_size)` holds pending per-key deltas. `submit(key, amount)` adds `amount` to the key's pending total and returns true if the key is already pending or if fewer than `capacity` distinct keys are pending; otherwise it rejects the write and returns false. `flush()` removes and returns up to `batch_size` pending keys in the order each key first became pending, as `(key, total)` pairs. `pending()` returns the number of distinct pending keys. A key that was flushed and is submitted again counts as newly pending.

```python starter
class WriteBuffer:
    def __init__(self, capacity, batch_size):
        # TODO
        raise NotImplementedError

    def submit(self, key, amount):
        raise NotImplementedError

    def flush(self):
        raise NotImplementedError

    def pending(self):
        raise NotImplementedError
```

```python tests
def test_coalesces_same_key():
    b = WriteBuffer(10, 10)
    assert b.submit("a", 1)
    assert b.submit("a", 4)
    assert b.pending() == 1
    assert b.flush() == [("a", 5)]

def test_rejects_new_key_when_full():
    b = WriteBuffer(2, 10)
    assert b.submit("a", 1)
    assert b.submit("b", 1)
    assert not b.submit("c", 1), "third distinct key must be rejected"
    assert b.pending() == 2

def test_existing_key_accepted_when_full():
    b = WriteBuffer(1, 10)
    assert b.submit("a", 1)
    assert b.submit("a", 2), "coalescing needs no new capacity"
    assert b.flush() == [("a", 3)]

def test_flush_respects_batch_size_and_order():
    b = WriteBuffer(10, 2)
    for k in ["x", "y", "z"]:
        b.submit(k, 1)
    b.submit("x", 1)
    assert b.flush() == [("x", 2), ("y", 1)]
    assert b.flush() == [("z", 1)]
    assert b.flush() == []

def test_flush_frees_capacity():
    b = WriteBuffer(1, 1)
    b.submit("a", 1)
    assert not b.submit("b", 1)
    b.flush()
    assert b.submit("b", 7)
    assert b.flush() == [("b", 7)]

def test_reinsert_goes_to_back():
    b = WriteBuffer(5, 5)
    b.submit("a", 1); b.submit("b", 1)
    b.flush()
    b.submit("b", 2); b.submit("a", 3)
    assert b.flush() == [("b", 2), ("a", 3)]
```

```python solution
class WriteBuffer:
    def __init__(self, capacity, batch_size):
        self.capacity = capacity
        self.batch_size = batch_size
        self.totals = {}

    def submit(self, key, amount):
        if key in self.totals:
            self.totals[key] += amount
            return True
        if len(self.totals) >= self.capacity:
            return False
        self.totals[key] = amount
        return True

    def flush(self):
        keys = list(self.totals.keys())[: self.batch_size]
        out = []
        for k in keys:
            out.append((k, self.totals.pop(k)))
        return out

    def pending(self):
        return len(self.totals)
```

```typescript starter
export class WriteBuffer {
  constructor(capacity: number, batchSize: number) {}
  submit(key: string, amount: number): boolean {
    throw new Error("TODO");
  }
  flush(): [string, number][] {
    throw new Error("TODO");
  }
  pending(): number {
    throw new Error("TODO");
  }
}
```

```typescript tests
test("coalesces same key", () => {
  const b = new WriteBuffer(10, 10);
  assert(b.submit("a", 1), "accept a");
  assert(b.submit("a", 4), "accept a again");
  assertEqual(b.pending(), 1);
  assertEqual(b.flush(), [["a", 5]]);
});
test("rejects new key when full", () => {
  const b = new WriteBuffer(2, 10);
  b.submit("a", 1); b.submit("b", 1);
  assert(!b.submit("c", 1), "third distinct key must be rejected");
  assertEqual(b.pending(), 2);
});
test("existing key accepted when full", () => {
  const b = new WriteBuffer(1, 10);
  b.submit("a", 1);
  assert(b.submit("a", 2), "coalescing needs no new capacity");
  assertEqual(b.flush(), [["a", 3]]);
});
test("flush respects batch size and order", () => {
  const b = new WriteBuffer(10, 2);
  for (const k of ["x", "y", "z"]) b.submit(k, 1);
  b.submit("x", 1);
  assertEqual(b.flush(), [["x", 2], ["y", 1]]);
  assertEqual(b.flush(), [["z", 1]]);
  assertEqual(b.flush(), []);
});
test("flush frees capacity", () => {
  const b = new WriteBuffer(1, 1);
  b.submit("a", 1);
  assert(!b.submit("b", 1), "full");
  b.flush();
  assert(b.submit("b", 7), "room again");
  assertEqual(b.flush(), [["b", 7]]);
});
test("reinsert goes to back", () => {
  const b = new WriteBuffer(5, 5);
  b.submit("a", 1); b.submit("b", 1);
  b.flush();
  b.submit("b", 2); b.submit("a", 3);
  assertEqual(b.flush(), [["b", 2], ["a", 3]]);
});
```

```typescript solution
export class WriteBuffer {
  private totals = new Map<string, number>();
  constructor(private capacity: number, private batchSize: number) {}
  submit(key: string, amount: number): boolean {
    const cur = this.totals.get(key);
    if (cur !== undefined) {
      this.totals.set(key, cur + amount);
      return true;
    }
    if (this.totals.size >= this.capacity) return false;
    this.totals.set(key, amount);
    return true;
  }
  flush(): [string, number][] {
    const out: [string, number][] = [];
    for (const [k, v] of this.totals) {
      if (out.length >= this.batchSize) break;
      out.push([k, v]);
    }
    for (const [k] of out) this.totals.delete(k);
    return out;
  }
  pending(): number {
    return this.totals.size;
  }
}
```

```go starter
package practice

import "sync"

// Entry is one coalesced write.
type Entry struct {
	Key   string
	Total int
}

// WriteBuffer coalesces writes per key with bounded capacity. Safe for concurrent use.
type WriteBuffer struct {
	mu sync.Mutex
}

func NewWriteBuffer(capacity, batchSize int) *WriteBuffer { return &WriteBuffer{} }

func (b *WriteBuffer) Submit(key string, amount int) bool { panic("TODO") }

func (b *WriteBuffer) Flush() []Entry { panic("TODO") }

func (b *WriteBuffer) Pending() int { panic("TODO") }
```

```go tests
package practice

import (
	"reflect"
	"testing"
)

func TestCoalesce(t *testing.T) {
	b := NewWriteBuffer(10, 10)
	if !b.Submit("a", 1) || !b.Submit("a", 4) {
		t.Fatal("both submits should be accepted")
	}
	if b.Pending() != 1 {
		t.Fatal("expected one pending key")
	}
	if got := b.Flush(); !reflect.DeepEqual(got, []Entry{{"a", 5}}) {
		t.Fatalf("got %v", got)
	}
}

func TestRejectWhenFull(t *testing.T) {
	b := NewWriteBuffer(2, 10)
	b.Submit("a", 1)
	b.Submit("b", 1)
	if b.Submit("c", 1) {
		t.Fatal("third distinct key must be rejected")
	}
	if b.Pending() != 2 {
		t.Fatal("expected 2 pending")
	}
}

func TestExistingKeyWhenFull(t *testing.T) {
	b := NewWriteBuffer(1, 10)
	b.Submit("a", 1)
	if !b.Submit("a", 2) {
		t.Fatal("coalescing needs no new capacity")
	}
	if got := b.Flush(); !reflect.DeepEqual(got, []Entry{{"a", 3}}) {
		t.Fatalf("got %v", got)
	}
}

func TestBatchSizeAndOrder(t *testing.T) {
	b := NewWriteBuffer(10, 2)
	for _, k := range []string{"x", "y", "z"} {
		b.Submit(k, 1)
	}
	b.Submit("x", 1)
	if got := b.Flush(); !reflect.DeepEqual(got, []Entry{{"x", 2}, {"y", 1}}) {
		t.Fatalf("got %v", got)
	}
	if got := b.Flush(); !reflect.DeepEqual(got, []Entry{{"z", 1}}) {
		t.Fatalf("got %v", got)
	}
	if got := b.Flush(); len(got) != 0 {
		t.Fatalf("expected empty, got %v", got)
	}
}

func TestFlushFreesCapacity(t *testing.T) {
	b := NewWriteBuffer(1, 1)
	b.Submit("a", 1)
	if b.Submit("b", 1) {
		t.Fatal("should be full")
	}
	b.Flush()
	if !b.Submit("b", 7) {
		t.Fatal("room after flush")
	}
	if got := b.Flush(); !reflect.DeepEqual(got, []Entry{{"b", 7}}) {
		t.Fatalf("got %v", got)
	}
}

func TestReinsertGoesToBack(t *testing.T) {
	b := NewWriteBuffer(5, 5)
	b.Submit("a", 1)
	b.Submit("b", 1)
	b.Flush()
	b.Submit("b", 2)
	b.Submit("a", 3)
	if got := b.Flush(); !reflect.DeepEqual(got, []Entry{{"b", 2}, {"a", 3}}) {
		t.Fatalf("got %v", got)
	}
}
```

```go solution
package practice

import "sync"

// Entry is one coalesced write.
type Entry struct {
	Key   string
	Total int
}

// WriteBuffer coalesces writes per key with bounded capacity. Safe for concurrent use.
type WriteBuffer struct {
	mu        sync.Mutex
	capacity  int
	batchSize int
	order     []string
	totals    map[string]int
}

func NewWriteBuffer(capacity, batchSize int) *WriteBuffer {
	return &WriteBuffer{capacity: capacity, batchSize: batchSize, totals: map[string]int{}}
}

func (b *WriteBuffer) Submit(key string, amount int) bool {
	b.mu.Lock()
	defer b.mu.Unlock()
	if _, ok := b.totals[key]; ok {
		b.totals[key] += amount
		return true
	}
	if len(b.totals) >= b.capacity {
		return false
	}
	b.totals[key] = amount
	b.order = append(b.order, key)
	return true
}

func (b *WriteBuffer) Flush() []Entry {
	b.mu.Lock()
	defer b.mu.Unlock()
	n := b.batchSize
	if n > len(b.order) {
		n = len(b.order)
	}
	out := make([]Entry, 0, n)
	for _, k := range b.order[:n] {
		out = append(out, Entry{k, b.totals[k]})
		delete(b.totals, k)
	}
	b.order = append([]string{}, b.order[n:]...)
	return out
}

func (b *WriteBuffer) Pending() int {
	b.mu.Lock()
	defer b.mu.Unlock()
	return len(b.totals)
}
```

## Mock interview
**Prompt:** Design the ingestion path for a mobile analytics SDK installed in 40,000 apps. Clients send 2 million events per second on average and 6 million at peak, each about 500 bytes, and customers expect events to appear in dashboards within one minute.

- Follow-up: One customer's app goes viral and sends 40% of all traffic. What breaks and how do you contain it?
- Follow-up: A consumer crashes halfway through writing a batch. What happens to those events?
- Follow-up: Would you store raw events in a database at all, or somewhere else, and why?

**A strong answer covers:**
- Arithmetic: 6 million events per second at 500 bytes is about 3 GB/s at peak.
- A partition key such as `(app_id, device_id)` hashed, rather than `app_id` alone, so one big app spreads across partitions; per-tenant quotas with 429s for abuse.
- The durability point at the replicated log, idempotent consumers keyed by event ID, and offsets committed after the batch lands.
- Batching into columnar files or an LSM store, with aggregates computed by a stream processor rather than per-event database updates.
- Backpressure and lag SLOs: what is shed first, and how the system recovers after a spike.

## Sources and further study
**Primary**
- [Apache Kafka producer configs](https://kafka.apache.org/43/configuration/producer-configs/): `linger.ms`, `batch.size`, `acks` and idempotence defaults, including the Kafka 4.0 change.
- [PostgreSQL: asynchronous commit](https://www.postgresql.org/docs/current/wal-async-commit.html): exactly what is lost when you acknowledge before the WAL flush.

**Systems docs**
- [RocksDB wiki: Write Stalls](https://github.com/facebook/rocksdb/wiki/Write-Stalls): every condition under which the engine slows or stops writers.
- [RocksDB Tuning Guide](https://github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide): write, read and space amplification with worked numbers.
- [DynamoDB burst and adaptive capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/burst-adaptive-capacity.html): how a managed store reacts to a hot partition, and the per-partition ceiling that remains.

**Books**
- *Designing Data-Intensive Applications* (1st ed.), Martin Kleppmann, Ch 3 "Storage and Retrieval" (SSTables, LSM trees, B-trees) and Ch 6 "Partitioning" (key-range versus hash partitioning, skew and hot spots).
- *Database Internals*, Alex Petrov: the log-structured storage chapter compares compaction strategies and their amplification.

**Other curricula**
- [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer): frames write scaling as federation and sharding, and recommends back pressure that answers HTTP 503 once a queue fills.
- [Azure Architecture Center: Sharding pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding): frames the choice between lookup, range, hash and geographic strategies, warns against monotonic keys, and prices the rebalancing cost of each.

## Watch
- [The Secret Sauce Behind NoSQL: LSM Tree (ByteByteGo)](https://www.youtube.com/watch?v=I6jB0nM9SKU): a short visual tour of memtables, SSTables and compaction.
- [#04 - Database Storage: Log-Structured Merge Trees & Tuples (CMU Database Group)](https://www.youtube.com/watch?v=IHtVWGhG0Xg): Andy Pavlo on LSM storage compared with page-oriented storage.
- [Good and bad sharding keys (Ben Dicken)](https://www.youtube.com/watch?v=HoPzGAGNHhE): how the choice of shard key creates or avoids hot spots.

## Free resources
- [The Log-Structured Merge-Tree (O'Neil et al.)](https://www.cs.umb.edu/~poneil/lsmtree.pdf): the original paper that argued for batching writes into sorted runs.
- [RocksDB Overview (RocksDB wiki)](https://github.com/facebook/rocksdb/wiki/RocksDB-Overview): memtables, SSTables, compaction styles and write stalls from the engine's maintainers.
- [Designing partition keys to distribute your workload (AWS DynamoDB docs)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html): practical guidance on key cardinality and write sharding.
- [Avoiding insurmountable queue backlogs (Amazon Builders' Library)](https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/): how queues fail under sustained overload and what Amazon does about it.
- [Queue-Based Load Leveling pattern (Azure Architecture Center)](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling): the buffering pattern with its trade-offs.
