# Case Study: ANN search over 100M embeddings on a single 64GB machine

**Skill:** [engage-exocortex](../../../Skills/engage-exocortex/)
**Run date:** 2026-05-18
**Paths explored:** 4
**Recommended path:** DiskANN (Vamana on SSD) with FreshDiskANN-style insert path

---

## Framing preamble

This case study captures a real run of `engage-exocortex` against a systems-design problem that is concrete, measurable, and recognisable to anyone who has shipped a vector-search backend under hard hardware budgets: **approximate-nearest-neighbour (ANN) search over ~100M dense embedding vectors on a single 64GB machine, with sub-100ms p99 latency and a non-trivial incremental-insert rate**.

The question fits `engage-exocortex` because:

- It is **generative** in the algorithmic-design sense — the output is a set of candidate architectures (paradigm + structure + strategy combinations), not a research conclusion. The skill routes the problem to multiple algorithm families and develops each as an independent path.
- The problem has **multiple genuinely-live solution families** (graph-based proximity search, partitioned-index with quantization, external-memory graph, tiered retrieval) that produce structurally different systems — so the skill's "comparison-not-merger" synthesis contract is load-bearing here. The four families are not variants of one design; they pick different points on the recall/latency/memory/insert-throughput surface.
- The dominant failure mode is **picking the obvious answer too early**. IVF-PQ is the textbook compression story; HNSW is the textbook recall-king; neither survives all four constraints simultaneously. The skill's parallel-paths contract forces all four candidates onto the same comparison table before any commitment is made.

**Web citations are N/A per the `engage-exocortex` contract.** This skill is **generative for solution exploration** — it composes paradigms / structures / strategies from its bundled JSON catalogues and reasons about algorithmic-family characteristics that are common knowledge in the ANN literature. There is no recency-decayed claim to cite, no live data to fetch. All numerical anchors below are either derived from the problem statement by arithmetic or are characteristic ranges for the named algorithm family at the stated parameter choices; assumptions are stated inline.

**What to look for:**

- All four paths produce **a fully populated quantitative table** (RAM / disk / build time / latency / recall / insert throughput) — pure-prose paths fail the skill contract.
- Synthesis is a **single comparison table** spanning all four paths against the original constraints, not a merged hybrid architecture. The recommendation is the path that best survives the *joint* constraint set, not the path that wins any single metric.
- The recommended path is **not the obvious one**. IVF-PQ has the smallest RAM footprint and HNSW has the best raw recall, but neither survives the incremental-insert constraint as cleanly as the recommended path does.

---

## Problem

> Design an approach for performing approximate-nearest-neighbor (ANN) search over ~100M dense embedding vectors (1024-dim float16) on a single 64GB-RAM machine, with sub-100ms p99 query latency at modest QPS (≤50) and the ability to incrementally insert ~10K new vectors per minute without full index rebuild.

**Key numerical anchors (load-bearing throughout):**

- 100M vectors × 1024 dims × 2 bytes (float16) = **~200GB raw**. Must compress, page, or shard onto disk to fit in 64GB along with index structures, OS, and working memory.
- p99 ≤100ms at QPS ≤50: budget allows **~10ms of useful query work at the median** and ~80ms of headroom for the tail (GC, page faults, lock contention, disk IO).
- ~10K inserts/minute = **~170 inserts/sec sustained**. This rate kills naive IVF-flat (requires periodic full retrain of the coarse quantizer) and stresses any design where insert provokes synchronous disk-page rewrites on the read path.

---

## Matched signals

| Keyword (from problem) | Routes to paradigms |
|---|---|
| `dense-vector`, `embedding`, `1024-dim` | graph-based-proximity-search, partitioned-index, tiered-retrieval, external-memory-graph-algorithm |
| `nearest-neighbor`, `top-k`, `recall` | graph-based-proximity-search, partitioned-index |
| `memory-constrained`, `64GB`, `200GB-raw` | tiered-retrieval, external-memory-graph-algorithm, partitioned-index (with quantization) |
| `incremental-insert`, `170-inserts-per-sec` | graph-based-proximity-search (HNSW), external-memory-graph-algorithm (FreshDiskANN) |
| `p99-latency`, `sub-100ms` | graph-based-proximity-search, external-memory-graph-algorithm |
| `single-machine`, `no-sharding` | all four (no-sharding constraint suppresses distributed paradigms) |

Four paths are selected — one per dominant algorithm family. Two are RAM-resident (Paths 1, 2 — with Path 1 spilling its leaf layer to disk), two are SSD-resident (Paths 3, 4 — with Path 4 keeping the candidate index in RAM and raw vectors on disk). This spans the design space deliberately rather than picking three flavours of HNSW.

---

## Paths explored

| # | Paradigm | Structure | Strategy | Key tradeoff |
|---|---|---|---|---|
| 1 | graph-based-proximity-search | hierarchical-navigable-small-world | in-memory-top-layers-disk-bottom | Best insert latency; RAM footprint grows with M (graph fan-out) and risks p99 blow-out on leaf-layer disk fetches |
| 2 | partitioned-index | coarse-cluster-then-fine-quantize (IVF + PQ) | quantization-and-rerank | Cheapest RAM (200GB → ~4GB); periodic coarse-quantizer retrain breaks the incremental-insert SLO |
| 3 | external-memory-graph-algorithm | vamana-graph-page-aligned-on-ssd | ssd-friendly-beam-search | Smallest RAM working set per query; depends on NVMe random-read latency staying flat under concurrent insert+search |
| 4 | tiered-retrieval | coarse-recall-then-fine-rerank | compressed-candidate-in-RAM + raw-on-disk verify | Highest recall per byte of RAM; rerank disk-read tail is the p99 risk |

---

## Path 1 — HNSW with on-disk overflow

**Paradigm rationale.** HNSW (Hierarchical Navigable Small World) is the dominant in-memory graph-based ANN index because greedy search on a multi-layer small-world graph converges in O(log N) hops to a high-recall neighbourhood. The "on-disk overflow" variant keeps the upper navigation layers in RAM and pushes the bottom (densest) layer to a memory-mapped file on NVMe — the only way to fit a 100M-vector HNSW into 64GB.

**Architecture sketch.**

- **In RAM:** upper layers of the HNSW graph (layers 1..L, typically 5–8 layers above leaf), the bottom-layer adjacency *only for hot nodes* (LRU-cached), and the float16 vectors for hot nodes. The entry-point set lives permanently in RAM.
- **On disk (NVMe, mmap):** bottom-layer adjacency lists for all 100M vectors, plus the float16 vectors themselves, in a single page-aligned file. Pages fault into the kernel page cache on access; eviction is OS-managed.
- **Query flow:** start at the RAM-resident entry point, descend through upper layers (zero disk IO), enter the leaf layer and beam-search with `ef_search` candidates. Each leaf hop that misses the page cache costs one NVMe random read (~80–100µs on a good NVMe drive).
- **Insert flow:** find the M nearest neighbours via a search, write back two adjacency entries (the new node's M outgoing edges, plus reverse-edge updates on up to M existing nodes). Reverse-edge updates are the cost driver — they touch random pages.

**Quantitative table.** Assumptions: HNSW with M=32 (graph fan-out), efConstruction=200, ef_search=128, leaf-layer adjacency stored as 4-byte node IDs.

| Metric | Value | Derivation / assumption |
|---|---|---|
| Raw vector size | 200 GB | 100M × 1024 × 2 bytes |
| HNSW leaf adjacency size | ~12.8 GB | 100M × M × 4 bytes (M=32, 4-byte IDs) |
| HNSW upper-layer adjacency size | ~0.8 GB | Geometric series, ~6% of leaf size at standard mL |
| RAM footprint (working set) | **~10–16 GB** | Upper layers + LRU cache of hot leaf adjacency + hot vectors + ef-search buffers. Cache size dominates and is tunable. |
| Disk footprint | **~213 GB** | Raw vectors + full leaf adjacency, page-aligned on NVMe |
| Build time | 8–14 hours | Single-threaded HNSW build at ~2–3K vectors/sec on modern CPU; parallelisable to ~1.5–3h on 16 cores |
| Query latency p50 | **5–15 ms** | When working set is hot; dominated by graph traversal in RAM |
| Query latency p99 | **60–200 ms** | Cold queries trigger 20–50 NVMe random reads × ~100µs = ~2–5ms IO, but tail-amplified by mmap page-cache misses and concurrent insert writes |
| Recall@10 | **0.95–0.98** | Standard HNSW characteristic at ef_search=128 |
| Insert throughput | **300–800 inserts/sec** | Well above the 170/sec requirement; reverse-edge writes are the bottleneck |
| Hardware notes | NVMe SSD with ≥500K IOPS random read; mmap-friendly OS (Linux); ECC RAM strongly recommended |

**Rationale.** The strongest move is using mmap for the leaf layer so the kernel page cache absorbs read locality automatically — when a query stays in a region of embedding space already touched recently, almost all leaf hops hit the page cache and p99 stays low. **Most contestable assumption:** that the working set fits in the LRU/page cache. For embedding spaces that are genuinely uniform, every query touches a different leaf region, the cache hit rate collapses, and p99 scales linearly with `ef_search` × NVMe random-read latency — easily 50–100ms for ef_search=128 and getting worse under concurrent insert load that dirties pages. **Tradeoff:** generous insert throughput (the graph is local-update-friendly) bought at the cost of fragile p99 under load.

**What would change this artefact:**
- If the embedding distribution is highly clustered (e.g., 80% of queries hit 10% of vectors), the page-cache assumption holds and Path 1 becomes very competitive on p99 — comparable to Path 3.
- If insert volume drops by 10× (to ~17/sec), the reverse-edge contention with the read path disappears and p99 stabilises.
- If RAM budget grows to 128GB, the full leaf adjacency fits in RAM and Path 1 collapses to standard HNSW — best-in-class on every metric.

---

## Path 2 — IVF + Product Quantization (IVF-PQ)

**Paradigm rationale.** Partition the vector space into K coarse clusters (IVF — Inverted File index) so each query only probes a few clusters, then store each vector as a heavily quantized code (Product Quantization — split the 1024-dim vector into 32 sub-vectors of 32 dims, quantize each sub-vector to one of 256 centroids, store one byte per sub-vector). The combination compresses 2048 bytes/vector → 32 bytes/vector, a **64× compression ratio** that makes the whole index RAM-resident.

**Architecture sketch.**

- **In RAM:** the IVF coarse quantizer (K centroids, K=1024 → 4MB), the 32-byte PQ code per vector (~3.2GB for 100M vectors), per-cluster inverted lists (~400MB of vector IDs), and the PQ codebook (32 sub-quantizers × 256 centroids × 32 floats = ~1MB).
- **On disk:** optionally the raw float16 vectors for rerank (~200GB), but the basic IVF-PQ design works entirely from PQ codes without rerank.
- **Query flow:** compute query distances to K coarse centroids, pick the nearest `nprobe` clusters (typically 8–32), scan all PQ-coded vectors in those clusters using a precomputed query-to-subcentroid distance table (asymmetric distance computation). Total work is O(`nprobe` × cluster_size × 32) byte operations — very cache-friendly.
- **Insert flow:** assign new vector to nearest coarse centroid, compute its PQ code, append to that cluster's inverted list. **Fast for individual inserts but the coarse quantizer is trained on a sample of the corpus** — as the corpus distribution drifts, clusters become unbalanced and recall degrades, requiring periodic retrain + reassignment of all 100M vectors (hours of downtime).

**Quantitative table.** Assumptions: IVF1024 coarse (K=1024 centroids), PQ32 (32 sub-vectors, 8 bits each), nprobe=16, no rerank stage.

| Metric | Value | Derivation / assumption |
|---|---|---|
| Coarse centroids | ~4 MB | K=1024 × 1024 dims × 4 bytes (float32 centroids) |
| PQ codes | ~3.2 GB | 100M × 32 bytes |
| Inverted lists | ~400 MB | 100M × 4-byte vector IDs |
| PQ codebook | ~1 MB | 32 × 256 × 32 × 4 bytes |
| RAM footprint | **~4 GB** | Sum above + query workspace. **Smallest of all four paths.** |
| Disk footprint | 0 GB (or 200 GB if raw vectors retained for rerank) | Index is fully RAM-resident |
| Build time | 2–4 hours | K-means on sample for coarse, PQ training on sample, then code assignment for all 100M (parallelisable) |
| Query latency p50 | **3–8 ms** | Coarse scan (1024 distances) + 16 cluster scans × ~100K vectors × cheap byte ops |
| Query latency p99 | **15–40 ms** | Very tight tail — fully RAM-resident, no IO |
| Recall@10 | **0.75–0.90** | PQ32 loses information; recall is the weakest of the four paths without a rerank stage. With float16 rerank of top-100, climbs to 0.92–0.96 but adds Path 4's disk-read tail |
| Insert throughput | **5K–20K inserts/sec** *between retrains* | Single-insert is trivial; **but recall decays as the coarse quantizer goes stale and a full retrain takes hours** |
| Hardware notes | CPU with AVX2/AVX-512 for fast PQ table lookups; disk irrelevant unless retaining for rerank |

**Rationale.** The strongest move is the 64× compression that puts the entire searchable index in 4GB of RAM — every query is served from L3-friendly hot memory with no IO. **Most contestable assumption:** that the embedding distribution stays stationary enough that the coarse quantizer (trained once on a sample) keeps clusters balanced as 170 new vectors/sec arrive. In practice, embedding distributions drift (model updates, new content categories, seasonality), clusters become skewed, `nprobe` has to climb to maintain recall, and eventually a full retrain is forced — which violates the "no full index rebuild" constraint. **Tradeoff:** the cheapest RAM and tightest latency tail of any path, sacrificing recall ceiling and incremental-insert durability.

**What would change this artefact:**
- If the embedding distribution is provably stationary (e.g., a closed catalogue with stable semantics), the coarse-retrain pressure disappears and IVF-PQ becomes very competitive — drop-in for the recommended path.
- If recall@10 ≥ 0.95 is required, Path 2 needs the rerank stage (becoming a Path 2 / Path 4 hybrid) and inherits Path 4's disk-read tail.
- If the insert rate halves and a periodic 30-minute retrain window is acceptable, Path 2 can absorb that with a side-by-side rebuild + atomic swap.

---

## Path 3 — DiskANN (Vamana graph on SSD)

**Paradigm rationale.** DiskANN (Microsoft Research, 2019) builds a single-layer Vamana graph specifically designed for SSD residency: graph nodes and their adjacency lists are co-located in 4KB SSD-page-aligned blocks, so a single SSD random read fetches both a vector and its neighbour list. Beam-search traverses the graph one page-read per hop, with a small in-memory cache for hot pages and a compressed (PQ-coded) RAM copy of all vectors used only for cheap candidate filtering. **The whole index can live on SSD with ~10–15GB of RAM working set for a 100M-vector dataset.**

**Architecture sketch.**

- **In RAM:** PQ-coded copy of all 100M vectors (~3.2GB at PQ32) used as a *filter* — candidates are scored cheaply from PQ codes during beam search to decide which SSD pages to fetch; an LRU cache of the most-recently-touched SSD pages (4–8 GB); the small Vamana entry-point set; and beam-search workspace (~100MB per concurrent query).
- **On disk (NVMe):** the Vamana graph itself, with each node packed as `{ float16 vector (2048 bytes), adjacency list (R neighbours × 4-byte IDs) }` aligned to a 4KB page. For R=64, each node is ~2304 bytes — slightly under 4KB, so one page = one node = one disk read.
- **Query flow:** beam-search the Vamana graph from a few entry points. At each step, the beam holds L candidates ranked by *PQ-estimated* distance (cheap, in-RAM); the highest-priority unexpanded candidate is fetched from SSD (one random read), its actual float16 vector gives an exact distance, and its R neighbours are added to the beam. Typical query: 50–100 SSD page reads at L=100, p50 search depth.
- **Insert flow (FreshDiskANN variant, 2021):** new vectors are appended to a small RAM-resident "delta" graph, and only periodically (every N inserts or T seconds) merged into the on-disk Vamana graph via a background process. Reads consult both the on-disk index and the RAM delta; the delta stays small enough to add minimal query overhead.

**Quantitative table.** Assumptions: Vamana with R=64 (degree bound), L=100 (beam width), PQ32 RAM filter, NVMe with ~80µs random-read latency, FreshDiskANN delta sized at ≤500K vectors before merge.

| Metric | Value | Derivation / assumption |
|---|---|---|
| On-disk node size | ~2.3 KB | 2048 bytes (float16 vector) + 64 × 4 bytes (adjacency) + small header, padded to 4 KB page |
| Total on-disk index | **~400 GB** | 100M × 4 KB pages (page-padded). Acceptable on a 2 TB NVMe. |
| In-RAM PQ filter | ~3.2 GB | 100M × 32 bytes |
| In-RAM page cache | ~4–8 GB (tunable) | LRU over recently-touched 4KB pages |
| FreshDiskANN delta | ~1.5 GB | 500K vectors × ~3KB each (uncompressed + small graph) before merge |
| RAM footprint | **~10–15 GB** | PQ filter + page cache + delta + workspace |
| Build time | 6–12 hours | Vamana build is single-pass and parallelisable; comparable to HNSW build |
| Query latency p50 | **8–20 ms** | 50–100 page reads × ~80µs = 4–8ms IO + ~5ms CPU on PQ filtering and exact-distance computation |
| Query latency p99 | **40–80 ms** | Tail dominated by NVMe random-read variance and page-cache misses; tight because read pattern is bounded (≤L pages per query) |
| Recall@10 | **0.95–0.98** | Vamana achieves HNSW-class recall by design (the algorithm's main contribution) |
| Insert throughput | **2K–10K inserts/sec** *via delta* | Delta appends are RAM-speed; background merge runs at ~5K vectors/sec without disrupting read latency |
| Hardware notes | NVMe SSD with low-tail random-read latency (Optane or modern enterprise NVMe); ≥2 TB capacity; ≥16 cores helps merge keep up |

**Rationale.** The strongest move is **co-locating vector and adjacency in one SSD page** so the work-per-hop is one random read instead of two (or N for an uncached HNSW leaf). This is what compresses RAM from "everything plus cache" (Path 1) to "PQ filter plus modest cache" (Path 3), while preserving HNSW-class recall via the Vamana graph quality. **Most contestable assumption:** that NVMe random-read p99 stays close to the p50 (~80–150µs) under sustained concurrent insert load — if the device's write-amplification kicks in or the merge thread evicts hot pages, p99 can degrade to ~250–500µs per read and the query tail blows past 100ms. **Tradeoff:** the largest on-disk footprint (page-padding overhead), and a meaningful operational complexity around the FreshDiskANN merge schedule, in exchange for the best RAM/recall/insert/p99 joint operating point.

**What would change this artefact:**
- If NVMe random-read p99 is not flat under load (cheap consumer SSD, shared multi-tenant disk), Path 3 degrades faster than Path 1 — Path 1's page cache absorbs more of the volatility because more of the working set lives in RAM.
- If the FreshDiskANN merge cadence cannot be hidden from the read path (small merge window, very high insert rate), the design pushes back toward Path 1's local-update-friendly HNSW.
- If on-disk footprint becomes a cost driver (e.g., cloud storage charged per GB), the 4KB page padding adds ~2× over the raw 200GB and may force a more compact on-disk layout.

---

## Path 4 — Two-stage quantized-in-RAM + raw-on-disk rerank

**Paradigm rationale.** Tiered retrieval: a highly compressed RAM-resident index returns a *candidate set* (e.g., top-200) cheaply, then a second stage reads the **raw float16 vectors for those 200 candidates from disk** and computes exact distances to pick the true top-K. This is the highest-recall-per-byte-of-RAM design — the RAM index only has to be good enough to put the true top-K inside the top-200 candidates, and the exact rerank corrects any quantization error.

**Architecture sketch.**

- **In RAM:** any small-RAM ANN index that returns 200 candidates fast. Most natural choice is **IVF-PQ8 or scalar INT8** — a ~2–6GB index that achieves recall@200 ≥ 0.99 even if recall@10 from the compressed index alone is only 0.85.
- **On disk (NVMe):** the raw float16 vectors as a single 200GB flat file, indexed by vector ID — vector at offset `id × 2048 bytes`.
- **Query flow:**
  1. Stage 1 — query the RAM index, get top-200 candidate IDs (~5ms).
  2. Stage 2 — for each of the 200 candidates, read its 2KB vector from the flat file (or batch into a vectored `pread`). On NVMe with ~80µs random-read latency, 200 reads = ~16ms if serialized, ~3–5ms if vectored-IO batched.
  3. Compute 200 exact float16 distances (~0.5ms with AVX-512), sort, return top-10.
- **Insert flow:** append the float16 vector to the on-disk file (sequential write — cheap), insert into the RAM index using whichever index supports incremental insert (IVF-PQ has the same retrain pressure as Path 2; INT8-flat has none but is slower at stage 1).

**Quantitative table.** Assumptions: Stage 1 = IVF1024 + PQ8 (8 sub-vectors × 8 bits = 8 bytes/vector), candidate K=200; Stage 2 = raw float16 read from mmap'd flat file; NVMe ~80µs random read; vectored IO via `io_uring` or `preadv`.

| Metric | Value | Derivation / assumption |
|---|---|---|
| Stage-1 index (IVF+PQ8) | **~1 GB** | 100M × 8 bytes PQ codes + IVF metadata. Even smaller than Path 2. |
| Stage-2 raw vector file | **~200 GB** | 100M × 2048 bytes, flat layout for O(1) ID-to-offset lookup |
| RAM footprint | **~2–4 GB** | Stage-1 index + page cache + workspace. **Smallest RAM of all four paths.** |
| Disk footprint | ~200 GB | Raw vector file |
| Build time | 3–5 hours | Train Stage 1 (fast), then sequentially write raw vector file (disk-bound) |
| Query latency p50 | **10–25 ms** | ~5ms stage 1 + ~5ms stage 2 (batched IO) + ~0.5ms rerank |
| Query latency p99 | **80–250 ms** | **Dominant risk.** Stage 2 issues 200 random reads per query; even small variance in NVMe tail latency multiplies across 200 reads. Worst case: a single 5ms page-fault stall in any of the 200 reads dominates the query. |
| Recall@10 | **0.97–0.99+** | Highest of all four paths — exact rerank corrects all quantization error within the top-200 candidate window |
| Insert throughput | **5K–15K inserts/sec** | Sequential append to vector file is cheap; Stage 1 inherits whichever index's insert characteristics it uses (IVF-PQ inherits Path 2's retrain pressure) |
| Hardware notes | NVMe with vectored-IO support (Linux `io_uring`); enough IOPS budget for QPS × 200 = 10,000 random reads/sec at 50 QPS |

**Rationale.** The strongest move is **exact rerank on a small candidate set** — quantization is only used as a *recall-preserving filter*, not as the final distance metric, so recall@10 approaches that of an exact scan. **Most contestable assumption:** that NVMe random-read p99 stays under ~500µs for 200 concurrent reads per query and that vectored-IO batching actually delivers the expected ~5ms aggregate (rather than serializing under filesystem contention or competing with the OS page cache). The p99 column is the most sensitive in the entire study — a single slow read out of 200 wrecks the query. **Tradeoff:** highest recall and smallest RAM, paid for with the worst p99 risk and a hard dependency on the storage stack behaving predictably under load.

**What would change this artefact:**
- If recall@10 ≥ 0.99 is **mandatory** (e.g., the embeddings encode a legal-discovery or compliance retrieval task), Path 4 is the only option that delivers it without going to exact scan.
- If the storage stack delivers very flat random-read latency (Optane, or NVMe with strict QoS), the p99 risk collapses and Path 4 becomes the recommended path.
- If candidate K can be reduced to ~50 (Stage-1 index strong enough), the p99 risk shrinks proportionally and Path 4 becomes competitive with Path 3 on tail latency.

---

## Synthesis (comparison, not merger)

The four paths cannot be coherently merged — they pick different points on the recall / latency / RAM / insert-throughput surface, and any "merge" would be either a hybrid that inherits the worst constraint of each component, or just one path with a different parameter. Per the `engage-exocortex` contract, synthesis is a comparison table that lets the reader pick the path that best fits their actual operating regime.

| Path | Paradigm | RAM | Disk | p99 latency | Recall@10 | Insert throughput | Best-served regime |
|---|---|---|---|---|---|---|---|
| 1 — HNSW + disk overflow | graph-based-proximity-search | 10–16 GB | 213 GB | 60–200 ms (fragile under load) | 0.95–0.98 | 300–800 / sec | Clustered query distribution; RAM headroom to grow page cache; insert-heavy workload |
| 2 — IVF-PQ | partitioned-index | **4 GB** | 0 GB | **15–40 ms** (tightest) | 0.75–0.90 (no rerank) | 5K–20K / sec **between retrains** | Stationary embedding distribution; recall < 0.92 acceptable; periodic full-retrain window tolerated |
| 3 — DiskANN / Vamana | external-memory-graph-algorithm | 10–15 GB | 400 GB | **40–80 ms** | 0.95–0.98 | 2K–10K / sec via delta | Strict joint constraints — recall ≥ 0.95, p99 ≤ 100ms, sustained inserts, no rebuild window |
| 4 — Two-stage compressed + rerank | tiered-retrieval | **2–4 GB** | 200 GB | 80–250 ms (storage-dependent) | **0.97–0.99+** | 5K–15K / sec | Recall is the dominant constraint; storage stack is known-flat; QPS budget tolerates wider p99 |

**Reading the table against the four problem constraints (200GB → 64GB, p99 ≤100ms, recall not stated but implicitly "modern-ANN-acceptable" ≥0.95, ~170 inserts/sec sustained):**

- **Constraint 1 (memory budget):** all four fit, by design.
- **Constraint 2 (p99 ≤100ms):** Path 2 wins outright; Path 3 wins reliably; Paths 1 and 4 are at risk depending on workload and storage.
- **Constraint 3 (recall, taken as ≥0.95):** Paths 1, 3, 4 satisfy; Path 2 fails without a rerank stage (and adding rerank turns Path 2 into Path 4).
- **Constraint 4 (incremental insert without full rebuild):** Paths 1, 3, 4 satisfy; Path 2 fails because the coarse-quantizer retrain *is* a full rebuild.

**Path 3 is the only one that satisfies all four constraints without a contested assumption about workload, storage, or distribution stationarity.**

### Recommended path

**Path 3 — DiskANN (Vamana graph on SSD) with FreshDiskANN-style delta-merge insert path.**

This recommendation is **not the obvious one**. The two more famous designs each look more attractive in isolation:

- **Path 4 has better recall** (0.97–0.99+ vs Path 3's 0.95–0.98) and smaller RAM (2–4GB vs 10–15GB), and would be the right answer in a recall-dominated regime. It loses because its p99 distribution depends on the storage stack delivering flat latency across 200 random reads per query — under sustained 50 QPS with concurrent inserts, that's 10,000+ random reads/sec on the same NVMe being written to, and the tail risk against the 100ms SLO is too large to accept without storage benchmarks proving it.
- **Path 2 has the smallest RAM** (4GB vs 10–15GB) and the tightest p99 (15–40ms), and would be the right answer if the embedding distribution were provably stationary. It loses because the problem statement explicitly requires "incremental insert without full rebuild" — and IVF-PQ's coarse quantizer drift under 170 inserts/sec of unknown-distribution data eventually forces a full retrain, which violates the constraint.

Path 3 wins because it is the only design where **every constraint is satisfied by the algorithm's structure rather than by a workload assumption**: the page-aligned Vamana graph bounds per-query disk reads to ≤L=100 (versus Path 4's fixed 200 *and* Path 1's unbounded leaf fan-out), the PQ-coded RAM filter caps memory at ~10–15GB without depending on page-cache locality (versus Path 1's dependence on clustered queries), the Vamana graph achieves HNSW-class recall by construction (versus Path 2's 0.75–0.90 ceiling), and FreshDiskANN's delta + background merge makes incremental insert a first-class operation without forcing a full rebuild (versus Path 2's coarse-quantizer drift).

The conditions for this win are: NVMe storage with consistent random-read latency under concurrent insert+read load (verified by benchmark, not assumed), willingness to operate the FreshDiskANN merge schedule, and acceptance of ~400GB on-disk footprint for page padding.

---

## What would change this recommendation

1. **If QPS budget grows to ≥1000 and the operational constraint shifts from per-query latency to per-query *cost***, the per-query SSD-read budget becomes the dominant cost driver and the design should shift toward Path 2 (IVF-PQ) — accepting the retrain pressure in exchange for amortising the index over many more queries per RAM-dollar. At 50 QPS the SSD reads are essentially free; at 1000+ QPS the IOPS budget becomes the bottleneck and a fully-RAM-resident index is more economical.
2. **If recall@10 ≥ 99.5% becomes mandatory** (e.g., the embeddings drive a legal-discovery, medical-retrieval, or safety-critical-classification system where missed neighbours have real cost), Path 3's 0.95–0.98 ceiling is insufficient and the recommendation flips to Path 4 — accepting the p99 risk and pairing it with strict storage QoS, larger candidate K, and possibly a SLO renegotiation from 100ms to 200ms.
3. **If insert volume halves to ~85/sec and a periodic 30-minute rebuild window is acceptable**, the "no full rebuild" constraint relaxes and Path 2 (IVF-PQ) becomes recommendable — its 4GB RAM footprint and 15–40ms p99 are unmatched, and a nightly rebuild against a stable corpus is operationally simple. The recommendation flips to Path 2 in that regime.

---

*Generated by `engage-exocortex` skill on 2026-05-18. 4 solution paths + synthesis. No web research (skill is generative for solution exploration; algorithm characteristics are common-knowledge for the field). See [`Docs/case-studies/README.md`](../README.md) for the case-studies-vs-examples contract.*
