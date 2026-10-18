---
title: Estimating set similarity with MinHash
minutes: 12
---

## In one minute
- MinHash estimates the **Jaccard similarity** of two sets, the size of their intersection divided by the size of their union, from short fixed-size signatures instead of the full sets.
- The key fact: under a random hash, the probability that two sets have the same minimum hash value equals their Jaccard similarity. Repeat with `k` hashes and count agreements.
- Documents become sets by **shingling** (overlapping word or character n-grams), so MinHash finds near-duplicate pages, emails, code, or training data.
- Comparing every pair is still quadratic. **Locality-sensitive hashing (LSH)** with bands turns signatures into bucket keys so only likely-similar pairs are ever compared.

## How it works

### From documents to sets
Documents become sets of **shingles**: every run of `n` consecutive words (3 to 5) or characters (5 to 9). *Mining of Massive Datasets* suggests 5 characters for short texts such as emails and 9 for long documents, so that a random shingle is unlikely to appear by chance ([MMDS ch. 3](http://infolab.stanford.edu/~ullman/mmds/ch3.pdf)). "the quick brown fox" with word 2-grams becomes {"the quick", "quick brown", "brown fox"}. Small edits change only nearby shingles, so near-duplicates share most of their sets.

### The MinHash property
Take a random hash function `h` and compute the minimum of `h` over set A and over set B. Think of `h` as randomly ordering the union of A and B. The element that comes first is equally likely to be any element of the union. Both minima are equal exactly when that first element lies in the intersection. So `P[min h(A) = min h(B)] = |A ∩ B| / |A ∪ B|`, the Jaccard similarity. Andrei Broder introduced this "resemblance" estimate in 1997 and tested it by clustering over 30 million pages from an AltaVista crawl at 50 percent resemblance ([Broder](https://www.cs.princeton.edu/courses/archive/spring13/cos598C/broder97resemblance.pdf)).

### Signatures
One hash gives a yes-or-no sample. Use `k` independent hash functions and store the `k` minima as the set's **signature**. The fraction of positions where two signatures agree estimates Jaccard similarity, with standard error about `sqrt(J(1 - J) / k)`. With `k = 128` the error is at most 0.044, at `J = 0.5`, and smaller near 0 or 1; datasketch's documentation quotes about 0.03 to 0.04 for its 128-value default ([datasketch](https://ekzhu.com/datasketch/minhash.html)). A 128-entry signature of 32-bit values is 512 bytes regardless of document length.

Computing `k` hashes per shingle is the main cost, so production systems use cheaper variants. One-permutation hashing hashes each shingle once, splits the hash range into `k` bins and keeps the minimum per bin, with at least the accuracy of `k` separate hashes ([Li, Owen and Zhang](https://arxiv.org/abs/1208.1259)). Bottom-k hashes once and keeps the `k` smallest values overall. b-bit MinHash keeps only a few low bits of each value to shrink stored signatures.

### LSH banding
With a billion documents, comparing all pairs of signatures is 5 × 10^17 comparisons. LSH avoids that. Split each signature of length `k = b × r` into `b` bands of `r` values. Hash each band to a bucket key. Two documents become a **candidate pair** if they share a bucket in at least one band.

The probability that a pair with similarity `J` becomes a candidate is `1 - (1 - J^r)^b`. This is an S-curve: near zero for low `J`, near one for high `J`, with the threshold around `(1/b)^(1/r)` ([MMDS ch. 3](http://infolab.stanford.edu/~ullman/mmds/ch3.pdf)). Tuning `b` and `r` moves the threshold and steepens the curve. Candidates are then verified by comparing full signatures, or the actual documents.

### Variants
Weighted MinHash handles term frequencies. SimHash, a different LSH family, approximates cosine similarity with a single 64-bit fingerprint.

## Down the stack

### Layer 1: The contract
For any two sets, the expected fraction of matching signature positions equals their Jaccard similarity, with variance `J(1 - J) / k`. With LSH banding, a pair becomes a candidate with probability `1 - (1 - J^r)^b`. Nothing is guaranteed about any specific pair: true duplicates can be missed and dissimilar pairs can collide, so candidates must be verified and recall measured.

### Layer 2: The mechanism
The Python library datasketch is a common reference. A `MinHash` holds `num_perm` values, 128 by default, and hashes each shingle with SHA-1 from Python's `hashlib` before applying the permutations ([datasketch](https://ekzhu.com/datasketch/minhash.html)). Since version 2.0 (July 2026) each "permutation" is an affine map `a * h + b mod 2^32` with an odd `a`, which is a bijection, and values are stored as 32-bit integers. Before 2.0 it was a universal hash modulo the Mersenne prime `2^61 - 1`, stored in 64-bit slots. The change halved sketch memory and reduced an over-estimation bias, but hash values differ between versions, so persisted signatures and LSH indexes must be rebuilt or opened with `scheme="legacy"` ([PyPI release notes](https://pypi.org/project/datasketch/)).

`MinHashLSH` takes a similarity threshold and searches all `(b, r)` pairs for the one that minimises a weighted sum of false-positive and false-negative area under the S-curve. At `num_perm = 128`, weighting misses heavily gives 32 bands of 4, and weighting false positives heavily gives 16 bands of 8 ([datasketch LSH](https://ekzhu.com/datasketch/lsh.html)). Its buckets can live in memory or in Redis or Cassandra for persistent indexes, and queries return unranked candidates that still need verification.

In batch pipelines, banding is a shuffle: each document emits `b` rows of (band index, band hash, doc ID), a group-by collects buckets, and a second pass emits candidate pairs and runs union-find over them.

### Layer 3: The machine
Signature computation is arithmetic-bound. With 1,000 shingles and 128 hashes, a document needs 128,000 multiply-add-mod operations. Vectorised over all 128 hash functions at once (NumPy or SIMD), that is around 50 to 200 us per document on one core, so a billion documents need tens of thousands of core-hours unless one-permutation hashing cuts the work about 100-fold.

Bytes dominate the distributed phase. With `b = 20`, a billion documents produce 20 billion band rows; at 16 bytes each (8-byte band hash, 8-byte doc ID) that is 320 GB written to local disk and sent across the network in the shuffle. Skew is the failure mode: one boilerplate bucket can land millions of rows on a single reducer, which then runs out of memory or straggles for hours while the rest of the cluster idles.

### Why it's built this way
1. Comparing every pair of documents is quadratic, so each document is reduced to a small fixed-size summary.
2. The summary must estimate set overlap regardless of set size, which the minimum of a random hash does exactly.
3. One minimum is a single coin flip, so `k` independent hashes reduce the variance.
4. Even small signatures cannot be searched by similarity directly, so banding converts "similar" into "exactly equal band", which hash tables and shuffles handle at scale.

## Diagram
```mermaid
flowchart LR
    D["Document"] --> S["Shingles"]
    S --> H["k hash functions"]
    H --> M["Keep minimum per hash"]
    M --> G["Signature of k values"]
    G --> B["Split into b bands of r rows"]
    B --> K["Hash each band to a bucket"]
    K --> C["Same bucket in any band: candidate"]
    C --> V["Verify with full signature"]
```

## Worked example
A team building a language-model training corpus has 1 billion web documents and wants to drop near-duplicates with Jaccard similarity above 0.8 on word 5-gram shingles.

Signatures use `k = 100` 32-bit values: 400 bytes per document, 400 GB in total. With about 1,000 shingles per document, naive hashing is 10^14 hash evaluations, so the pass uses one-permutation hashing and runs on a few hundred cores for a few hours.

Banding with `b = 20` bands of `r = 5`: the threshold is about `(1/20)^(1/5) = 0.55`. A pair at `J = 0.8` becomes a candidate with probability `1 - (1 - 0.8^5)^20`, about 0.9996. A pair at `J = 0.3` becomes a candidate with probability `1 - (1 - 0.3^5)^20`, about 0.047, and pairs below that almost never do. The job emits 20 billion (band hash, doc ID) rows, groups them by key in a shuffle, and generates candidate pairs within each bucket.

Verification compares full signatures and keeps pairs with estimated `J >= 0.8`; union-find forms duplicate clusters and one document per cluster is kept. The banding threshold sits well below 0.8, trading verification work for recall.

Hot buckets are the operational risk. Boilerplate-heavy pages, such as cookie banners or empty templates, can put millions of documents in one bucket, producing trillions of pairs. Cap bucket sizes and treat huge buckets as their own duplicate cluster or strip boilerplate before shingling.

## In the wild
- **Google and UPenn, 2021: duplicates in language-model training data.** Lee et al. ran MinHash over 5-gram shingles with 9,000-value signatures in 450 bands of 20, then confirmed candidates with edit similarity above 0.8. Web-scrape datasets were 3.04 percent (C4) to 13.63 percent (RealNews) near-duplicates; one C4 cluster held 250,933 examples, and one 61-word sentence appeared over 60,000 times. Models trained on deduplicated data emitted memorised text ten times less often ([Lee et al., ACL 2022](https://arxiv.org/abs/2107.06499)).
- **Hugging Face, 2024: FineWeb's per-crawl MinHash.** FineWeb used 112 hash functions in 14 bands of 8 over word 5-grams, targeting documents at least 75 percent similar, and kept one random document per cluster. Deduplicating all 96 snapshots together removed up to 90 percent of older data and hurt quality; deduplicating each snapshot separately matched RefinedWeb and became the method for the final 15-trillion-token dataset ([Penedo et al.](https://arxiv.org/abs/2406.17557)).

## Trade-offs
| Option | Strengths | Weaknesses | Choose when |
|---|---|---|---|
| MinHash + LSH | Scales to billions, tunable threshold, mergeable signatures | Only Jaccard on sets, needs good shingling | Near-duplicate detection on text or sets |
| SimHash | One 64-bit fingerprint, approximates cosine | Less precise for moderate similarity | Web-scale exact or very-near duplicates |
| Exact hashing (SHA-256 of normalised text) | Simple, exact, cheap | Misses any edit at all | Removing byte-identical copies first |
| Embeddings + ANN index | Captures meaning, paraphrases | Expensive, opaque, model drift | Semantic similarity, not textual overlap |
| All-pairs exact Jaccard | Exact | Quadratic, infeasible beyond millions | Small collections or final verification |

## Pitfalls in production
- **Poor shingling.** Single-word shingles make unrelated documents look similar; very long shingles make near-duplicates look different. Pick shingle size from data, and normalise case, whitespace, and markup first.
- **Correlated hash functions.** Hashes that share structure give agreeing minima more often than the true similarity. Use well-mixed hashes with independent seeds.
- **Hot buckets.** Common boilerplate collapses millions of items into one LSH bucket. Cap bucket size, remove boilerplate, or use more rows per band.
- **Deduplicating too globally.** Removing near-duplicates across every crawl at once can keep the worst copies. FineWeb found that global deduplication across 96 Common Crawl snapshots left older snapshots with more ads and broken text than it removed, and models trained on it barely beat undeduplicated data ([Penedo et al.](https://arxiv.org/abs/2406.17557)).
- **Wrong threshold placement.** If the S-curve's threshold sits at the target similarity, half of true duplicates near it are missed. Place it below the target and verify candidates.

## Leadership lens
- Ask what "duplicate" means for the product. Templated product pages, quoted replies, and licence headers can all look similar without being duplicates.
- Run exact-hash deduplication first; it is cheap and removes the easiest half of the problem.
- Treat signature parameters (`k`, shingle size, hash seeds, library version) as a versioned contract, since stored signatures from different settings cannot be compared. A library upgrade that changes the hash scheme, as datasketch 2.0 did, is a reindexing project.
- Measure precision and recall on a hand-labelled sample before trusting the pipeline at scale.

## Check yourself
1. Why does the probability of equal minimum hashes equal the Jaccard similarity?
   **Answer:** A random hash orders the union uniformly, and the two minima are equal exactly when the first element of the union is in the intersection, which happens with probability intersection over union.
2. With `b` bands of `r` rows, what happens to candidate pairs when you increase `r` and keep `b` fixed?
   **Answer:** Each band needs more agreeing values, so the S-curve shifts to a higher similarity threshold and becomes steeper; fewer low-similarity pairs are candidates, but recall near the threshold drops.
3. Why is a 128-value signature enough no matter how long the documents are?
   **Answer:** The estimate's error depends only on `k` and the similarity, through `sqrt(J(1 - J) / k)`, not on the size of the sets.

## Practice
**Task:** Implement MinHash with LSH. `shingles(text, n)` returns the sorted unique list of character n-grams. `signature(items, k)` returns `k` minima, where hash `i` of an item is `mix(fnv1a(item) ^ seed_i)` with `seed_i = (i * 0x9E3779B9) mod 2^32` (`fnv1a` and `mix` are given). `similarity(a, b)` is the fraction of equal positions. `lsh_candidates(sigs, bands, rows)` takes a dict from name to signature and returns the sorted list of `(name1, name2)` pairs, `name1 < name2`, that share all `rows` values in at least one band. TypeScript: `shingles`, `signature`, `similarity`, `lshCandidates` (sigs as a `Record`); Go: `Shingles`, `Signature`, `Similarity`, `LSHCandidates` (pairs as `[2]string`).

```python starter
def fnv1a(s):
    h = 2166136261
    for c in s.encode():
        h = ((h ^ c) * 16777619) & 0xFFFFFFFF
    return h

def mix(h):
    h ^= h >> 16
    h = (h * 0x85EBCA6B) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 0xC2B2AE35) & 0xFFFFFFFF
    return h ^ (h >> 16)

def shingles(text, n):
    raise NotImplementedError

def signature(items, k):
    raise NotImplementedError

def similarity(a, b):
    raise NotImplementedError

def lsh_candidates(sigs, bands, rows):
    raise NotImplementedError
```

```python tests
def test_shingles():
    assert shingles("abcabc", 3) == ["abc", "bca", "cab"]

def test_identical_sets():
    s = signature(["x", "y", "z"], 64)
    assert len(s) == 64
    assert similarity(s, signature(["z", "y", "x"], 64)) == 1.0

def test_disjoint_sets():
    a = signature(["a%d" % i for i in range(200)], 200)
    b = signature(["b%d" % i for i in range(200)], 200)
    assert similarity(a, b) <= 0.05

def test_estimates_jaccard():
    a = signature([str(i) for i in range(0, 300)], 256)
    b = signature([str(i) for i in range(100, 400)], 256)
    assert abs(similarity(a, b) - 0.5) < 0.1

def test_lsh_finds_near_duplicates_only():
    base = "the quick brown fox jumps over the lazy dog near the river bank"
    sigs = {
        "a": signature(shingles(base, 4), 40),
        "b": signature(shingles(base + "!", 4), 40),
        "c": signature(shingles("an entirely different sentence about databases", 4), 40),
    }
    assert lsh_candidates(sigs, 10, 4) == [("a", "b")]
```

```python solution
def fnv1a(s):
    h = 2166136261
    for c in s.encode():
        h = ((h ^ c) * 16777619) & 0xFFFFFFFF
    return h

def mix(h):
    h ^= h >> 16
    h = (h * 0x85EBCA6B) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 0xC2B2AE35) & 0xFFFFFFFF
    return h ^ (h >> 16)

def shingles(text, n):
    return sorted(set(text[i:i + n] for i in range(len(text) - n + 1)))

def signature(items, k):
    base = [fnv1a(x) for x in items]
    seeds = [(i * 0x9E3779B9) & 0xFFFFFFFF for i in range(k)]
    return [min(mix(h ^ s) for h in base) for s in seeds]

def similarity(a, b):
    return sum(1 for x, y in zip(a, b) if x == y) / len(a)

def lsh_candidates(sigs, bands, rows):
    out = set()
    for band in range(bands):
        buckets = {}
        for name in sorted(sigs):
            key = tuple(sigs[name][band * rows:(band + 1) * rows])
            buckets.setdefault(key, []).append(name)
        for names in buckets.values():
            for i in range(len(names)):
                for j in range(i + 1, len(names)):
                    out.add((names[i], names[j]))
    return sorted(out)
```

```typescript starter
export function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}
export function mix(h: number): number {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
export function shingles(text: string, n: number): string[] { throw new Error("TODO"); }
export function signature(items: string[], k: number): number[] { throw new Error("TODO"); }
export function similarity(a: number[], b: number[]): number { throw new Error("TODO"); }
export function lshCandidates(sigs: Record<string, number[]>, bands: number, rows: number): [string, string][] {
  throw new Error("TODO");
}
```

```typescript tests
const range = (a: number, b: number, p = "") => Array.from({ length: b - a }, (_, i) => p + (a + i));
test("shingles", () => {
  assertEqual(shingles("abcabc", 3), ["abc", "bca", "cab"]);
});
test("identical sets", () => {
  const s = signature(["x", "y", "z"], 64);
  assertEqual(s.length, 64);
  assertEqual(similarity(s, signature(["z", "y", "x"], 64)), 1);
});
test("disjoint sets", () => {
  assert(similarity(signature(range(0, 200, "a"), 200), signature(range(0, 200, "b"), 200)) <= 0.05, "low");
});
test("estimates jaccard", () => {
  assert(Math.abs(similarity(signature(range(0, 300), 256), signature(range(100, 400), 256)) - 0.5) < 0.1, "near 0.5");
});
test("lsh finds near duplicates only", () => {
  const base = "the quick brown fox jumps over the lazy dog near the river bank";
  const sigs = {
    a: signature(shingles(base, 4), 40),
    b: signature(shingles(base + "!", 4), 40),
    c: signature(shingles("an entirely different sentence about databases", 4), 40),
  };
  assertEqual(lshCandidates(sigs, 10, 4), [["a", "b"]]);
});
```

```typescript solution
export function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}
export function mix(h: number): number {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
export function shingles(text: string, n: number): string[] {
  const s = new Set<string>();
  for (let i = 0; i + n <= text.length; i++) s.add(text.slice(i, i + n));
  return [...s].sort();
}
export function signature(items: string[], k: number): number[] {
  const base = items.map(fnv1a);
  return Array.from({ length: k }, (_, i) => {
    const seed = Math.imul(i, 0x9e3779b9) >>> 0;
    return Math.min(...base.map(h => mix((h ^ seed) >>> 0)));
  });
}
export function similarity(a: number[], b: number[]): number {
  return a.filter((x, i) => x === b[i]).length / a.length;
}
export function lshCandidates(sigs: Record<string, number[]>, bands: number, rows: number): [string, string][] {
  const out = new Set<string>(), names = Object.keys(sigs).sort();
  for (let band = 0; band < bands; band++) {
    const buckets = new Map<string, string[]>();
    for (const n of names) {
      const key = sigs[n].slice(band * rows, (band + 1) * rows).join(",");
      buckets.set(key, [...(buckets.get(key) ?? []), n]);
    }
    for (const g of buckets.values())
      for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) out.add(g[i] + "\u0000" + g[j]);
  }
  return [...out].sort().map(p => p.split("\u0000") as [string, string]);
}
```

```go starter
package practice

// FNV1a is 32-bit FNV-1a.
func FNV1a(s string) uint32 {
	h := uint32(2166136261)
	for i := 0; i < len(s); i++ {
		h = (h ^ uint32(s[i])) * 16777619
	}
	return h
}

// Mix is the MurmurHash3 32-bit finaliser.
func Mix(h uint32) uint32 {
	h ^= h >> 16
	h *= 0x85ebca6b
	h ^= h >> 13
	h *= 0xc2b2ae35
	return h ^ h>>16
}

func Shingles(text string, n int) []string                                  { panic("TODO") }
func Signature(items []string, k int) []uint32                              { panic("TODO") }
func Similarity(a, b []uint32) float64                                      { panic("TODO") }
func LSHCandidates(sigs map[string][]uint32, bands, rows int) [][2]string { panic("TODO") }
```

```go tests
package practice

import (
	"fmt"
	"math"
	"reflect"
	"testing"
)

func rng(a, b int, p string) []string {
	var out []string
	for i := a; i < b; i++ {
		out = append(out, fmt.Sprint(p, i))
	}
	return out
}

func TestShingles(t *testing.T) {
	if got := Shingles("abcabc", 3); !reflect.DeepEqual(got, []string{"abc", "bca", "cab"}) {
		t.Fatal(got)
	}
}

func TestIdenticalSets(t *testing.T) {
	s := Signature([]string{"x", "y", "z"}, 64)
	if len(s) != 64 || Similarity(s, Signature([]string{"z", "y", "x"}, 64)) != 1 {
		t.Fatal("identical")
	}
}

func TestDisjointSets(t *testing.T) {
	if Similarity(Signature(rng(0, 200, "a"), 200), Signature(rng(0, 200, "b"), 200)) > 0.05 {
		t.Fatal("too similar")
	}
}

func TestEstimatesJaccard(t *testing.T) {
	if math.Abs(Similarity(Signature(rng(0, 300, ""), 256), Signature(rng(100, 400, ""), 256))-0.5) >= 0.1 {
		t.Fatal("bad estimate")
	}
}

func TestLSH(t *testing.T) {
	base := "the quick brown fox jumps over the lazy dog near the river bank"
	sigs := map[string][]uint32{
		"a": Signature(Shingles(base, 4), 40),
		"b": Signature(Shingles(base+"!", 4), 40),
		"c": Signature(Shingles("an entirely different sentence about databases", 4), 40),
	}
	if got := LSHCandidates(sigs, 10, 4); !reflect.DeepEqual(got, [][2]string{{"a", "b"}}) {
		t.Fatal(got)
	}
}
```

```go solution
package practice

import (
	"fmt"
	"sort"
)

// FNV1a is 32-bit FNV-1a.
func FNV1a(s string) uint32 {
	h := uint32(2166136261)
	for i := 0; i < len(s); i++ {
		h = (h ^ uint32(s[i])) * 16777619
	}
	return h
}

// Mix is the MurmurHash3 32-bit finaliser.
func Mix(h uint32) uint32 {
	h ^= h >> 16
	h *= 0x85ebca6b
	h ^= h >> 13
	h *= 0xc2b2ae35
	return h ^ h>>16
}

func Shingles(text string, n int) []string {
	seen := map[string]bool{}
	out := []string{}
	for i := 0; i+n <= len(text); i++ {
		if s := text[i : i+n]; !seen[s] {
			seen[s] = true
			out = append(out, s)
		}
	}
	sort.Strings(out)
	return out
}

func Signature(items []string, k int) []uint32 {
	sig := make([]uint32, k)
	for i := range sig {
		seed := uint32(i) * 0x9E3779B9
		sig[i] = ^uint32(0)
		for _, it := range items {
			if v := Mix(FNV1a(it) ^ seed); v < sig[i] {
				sig[i] = v
			}
		}
	}
	return sig
}

func Similarity(a, b []uint32) float64 {
	eq := 0
	for i := range a {
		if a[i] == b[i] {
			eq++
		}
	}
	return float64(eq) / float64(len(a))
}

func LSHCandidates(sigs map[string][]uint32, bands, rows int) [][2]string {
	names := make([]string, 0, len(sigs))
	for n := range sigs {
		names = append(names, n)
	}
	sort.Strings(names)
	seen := map[[2]string]bool{}
	out := [][2]string{}
	for band := 0; band < bands; band++ {
		buckets := map[string][]string{}
		for _, n := range names {
			key := fmt.Sprint(sigs[n][band*rows : (band+1)*rows])
			buckets[key] = append(buckets[key], n)
		}
		for _, g := range buckets {
			for i := 0; i < len(g); i++ {
				for j := i + 1; j < len(g); j++ {
					if p := [2]string{g[i], g[j]}; !seen[p] {
						seen[p] = true
						out = append(out, p)
					}
				}
			}
		}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i][0] != out[j][0] {
			return out[i][0] < out[j][0]
		}
		return out[i][1] < out[j][1]
	})
	return out
}
```

## Mock interview
**Prompt:** A code-hosting platform wants to flag repositories that contain near-copies of files from other repositories, across 2 billion source files, with new pushes processed within minutes. Design the similarity detection pipeline.

- Follow-up: How do you turn a source file into a set, and what normalisation do you apply?
- Follow-up: How do you choose bands and rows for a target similarity of 0.85?
- Follow-up: A popular licence header makes millions of files land in the same bucket. What do you do?

**A strong answer covers:**
- Normalising code (strip comments, whitespace, identifiers optionally) and token n-gram shingles, with exact-hash dedup as a first pass.
- MinHash signature size and storage estimate, plus LSH band and row choice with the S-curve probability at 0.85 and at lower similarities.
- An incremental path: new files compute signatures and probe existing LSH buckets in a key-value store, without a full batch rerun.
- Bucket size caps and boilerplate removal to control hot buckets.
- Verification of candidates and a precision and recall evaluation on labelled pairs.

## Sources and further study
**Primary**
- [Li, Owen and Zhang, One Permutation Hashing (2012)](https://arxiv.org/abs/1208.1259): one hash per element instead of `k`, without losing accuracy.
- [Lee et al., Deduplicating Training Data Makes Language Models Better (ACL 2022)](https://arxiv.org/abs/2107.06499): MinHash plus suffix arrays at corpus scale, with measured effects on memorisation.
- [Penedo et al., The FineWeb Datasets (2024)](https://arxiv.org/abs/2406.17557): the MinHash settings and the per-snapshot versus global deduplication ablation.

**Systems docs**
- [datasketch: MinHash LSH](https://ekzhu.com/datasketch/lsh.html): how the threshold maps to bands and rows, storage backends and the soft-threshold caveat.
- [datasketch on PyPI](https://pypi.org/project/datasketch/): the 2.0 release notes on the new hashing scheme and rebuilding persisted sketches.

**Books**
- *Introduction to Information Retrieval*, Manning, Raghavan and Schütze, chapter 19 "Web search basics", section 19.6 "Near-duplicates and shingling": shingles and 200-permutation sketches from the search-engine side.

**Other curricula**
- [Stanford CS246](https://web.stanford.edu/class/cs246/): two "Locality-Sensitive Hashing" lectures built on MMDS chapter 3, "Finding Similar Items".
- [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer): does not cover MinHash or LSH; near-duplicate detection is outside its scope.

## Watch
- [Prof. Jeffrey Ullman, Locality Sensitive Hashing Part 1 (Seif Haridi)](https://www.youtube.com/watch?v=Z68a7ItYMuk): a lecture by a co-author of the standard textbook on shingling, MinHash, and banding.
- [LSH.8 Locality-sensitive hashing: the idea (Victor Lavrenko)](https://www.youtube.com/watch?v=dgH0NP8Qxa8): a short explanation of why banding produces an S-curve.

## Free resources
- [Mining of Massive Datasets, Chapter 3](http://infolab.stanford.edu/~ullman/mmds/ch3.pdf): the canonical treatment of shingling, MinHash, and LSH banding, free from Stanford.
- [Broder: On the Resemblance and Containment of Documents (1997)](https://www.cs.princeton.edu/courses/archive/spring13/cos598C/broder97resemblance.pdf): the original paper behind MinHash for web near-duplicates.
- [Wikipedia: MinHash](https://en.wikipedia.org/wiki/MinHash): variants, error bounds, and applications.
- [Wikipedia: Locality-sensitive hashing](https://en.wikipedia.org/wiki/Locality-sensitive_hashing): the wider family of LSH schemes and amplification by banding.
- [datasketch: MinHash](https://ekzhu.com/datasketch/minhash.html): documentation of a widely used Python implementation with LSH indexes.
