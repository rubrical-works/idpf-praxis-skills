# Data Structure Reference

This file is a deep reference for the **Dimension 2 — Core data structure** table in
SKILL.md. Use it when two candidate paths share the same algorithmic paradigm — the
data structure chosen determines the constants, the access patterns, the mutation cost,
and often whether an approach is feasible at all.

Each entry covers:
- **Core contract** — what operations this structure provides and at what cost
- **When to prefer it** — the problem signals that make this structure the right fit
- **Canonical sub-variants** — distinct flavors that can serve as separate paths
- **Key implementation traps** — non-obvious gotchas a developer will encounter
- **Disqualifiers** — conditions under which this structure is a poor choice

---

## 1. Heap / Priority Queue

**Core contract:** Insert in O(log n); extract the minimum (or maximum) in O(log n);
peek in O(1). Does not support arbitrary access or update without augmentation.

**When to prefer it:**
- You repeatedly need the globally best element (min or max) from a changing set
- Dijkstra-style "process cheapest frontier node next"
- K-way merging, top-K queries, sliding window maximum without monotonic queue

**Canonical sub-variants:**
| Variant | Characteristic | Best used when |
|---|---|---|
| Binary min/max heap | Standard; O(log n) push/pop | General priority queue needs |
| Indexed heap (heap + position map) | O(log n) decrease-key by tracking positions | Dijkstra with edge relaxation, Prim's MST |
| Two-heap partition | One min-heap + one max-heap sharing a population | Median of a data stream, range median |
| Monotonic deque (deque-as-heap) | Maintains sorted order by evicting dominated elements | Sliding window max/min in O(n) total |
| Lazy deletion heap | Stale entries left in heap; validity checked at pop time | Interval scheduling, task cooldown, sweep line events |
| K-way merge heap | One entry per input stream; pop + re-insert from same stream | Merge K sorted lists, external sort |

**Key implementation traps:**
- Python's `heapq` is min-heap only — negate values for max-heap; don't forget to negate back
- Lazy deletion requires a "seen" set or a version counter; forgetting this causes incorrect pops
- Two-heap median: rebalancing invariant (size difference ≤ 1) must be maintained on every insert *and* remove
- Indexed heap position map must be updated on every swap during sift-up/sift-down, not just at insert

**Disqualifiers:**
- Need to find an arbitrary element (use hash map instead)
- Need sorted iteration over the full set (use BST or sort)
- The set is static — just sort once

---

## 2. Tree Variants

**Core contract:** A family of hierarchical structures offering O(log n) search,
insert, and delete on ordered data, plus range queries. The specific variant
determines what additional operations are O(log n) vs O(n).

**When to prefer it:**
- Data is ordered and you need both point queries and range queries
- Dynamic set with frequent insertions/deletions (vs. static → just sort)
- Need rank queries ("how many elements ≤ X?") or order statistics

**Canonical sub-variants:**
| Variant | Characteristic | Best used when |
|---|---|---|
| BST (unbalanced) | Simple; degrades to O(n) on sorted input | Never in production; useful for teaching |
| AVL / Red-Black tree | Self-balancing; O(log n) guaranteed | Ordered map/set (most language std libs) |
| Segment tree | Each node covers a range; supports range query + point update | Range sum/min/max with point updates |
| Segment tree with lazy propagation | Deferred range updates; O(log n) range update + range query | Range add + range sum, range set + range min |
| Fenwick tree (BIT) | Implicit tree via index bit tricks; smaller constant than segment tree | Prefix sum with point update; 2D variants for grid |
| Trie (prefix tree) | Characters at edges; O(L) ops where L = string length | Prefix matching, autocomplete, XOR maximization |
| Persistent segment tree | Each update creates a new root; old versions accessible | Range kth element, versioned data, offline queries |
| Merge sort tree | Segment tree where each node stores a sorted array of its range | Count elements in range [L,R] satisfying a predicate |
| K-d tree | Partitions k-dimensional space alternating on each axis | Nearest neighbor in 2D/3D, range search in space |
| Cartesian tree / Treap | Heap-ordered by priority, BST-ordered by key; randomized balance | Implicit sequence with split/merge, rope data structure |

**Key implementation traps:**
- Segment tree: 1-indexed vs 0-indexed; size must be next power of 2 or use recursive build
- Lazy propagation: the lazy tag must be pushed down *before* recursing into children, not after
- Fenwick tree: `update(i, delta)` and `query(i)` are both 1-indexed; off-by-one errors are common
- Trie: remember to handle end-of-word markers separately from the existence of a child node
- Persistent structures: copying the path (O(log n) nodes) not the whole tree

**Disqualifiers:**
- Updates are rare and queries are batch → sort offline instead
- Data is unordered and you only need exact-match lookup → hash map is faster and simpler
- N is small (< 1000) → just use a sorted array with binary search

---

## 3. Hash-Based Structures

**Core contract:** O(1) average insert, delete, and lookup. No ordering. Worst-case
O(n) due to collisions, but rare with good hash functions.

**When to prefer it:**
- Fast exact-match lookup is the bottleneck
- Counting frequencies, detecting duplicates, memoizing seen states
- The key space is large but the active set is sparse

**Canonical sub-variants:**
| Variant | Characteristic | Best used when |
|---|---|---|
| HashMap / dictionary | Key → value; O(1) average | Any frequency count, index lookup, memo table |
| HashSet | Membership only; O(1) average | Visited set in BFS, duplicate detection |
| Counting array | Fixed-range keys (e.g., chars, small ints); O(1) true worst-case | Character frequency, bucket sort |
| Rolling hash | Hash of a sliding window updated incrementally | Rabin-Karp substring search, longest duplicate substring |
| Polynomial hash / string hashing | Map strings to integers for O(1) comparison | Anagram grouping, palindrome detection over substrings |
| Two-sum complement map | Store seen values; for each new value check if complement exists | Two-sum, subarray sum equals K (prefix sum + map) |
| Coordinate compression + map | Map large sparse values to dense indices | Segment tree on large value range, offline range queries |

**Key implementation traps:**
- Rolling hash collisions: use double hashing (two independent moduli) to reduce false positives
- Python dicts preserve insertion order (3.7+) — don't rely on this in language-agnostic solutions
- Counting array bounds: ensure the array is sized for the *full* input range, not just what you've seen
- Coordinate compression: compress *after* reading all input; queries must use the same mapping as updates

**Disqualifiers:**
- Need to iterate in sorted order (use BST or sorted array)
- Need range queries ("all keys between X and Y") → hash maps can't do this
- Adversarial inputs can cause hash collisions → use randomized hash or tree map

---

## 4. Graph Representations

**Core contract:** Encodes vertices and edges; the representation chosen governs the
cost of the operations most frequently used (adjacency test, neighbor enumeration,
edge weight lookup).

**When to prefer each:**

**Canonical sub-variants:**
| Representation | Space | Adjacency test | Neighbor list | Best used when |
|---|---|---|---|---|
| Adjacency list | O(V + E) | O(degree) | O(degree) | Sparse graphs; most real problems |
| Adjacency matrix | O(V²) | O(1) | O(V) | Dense graphs; Floyd-Warshall; small V |
| Edge list | O(E) | O(E) | O(E) | Kruskal's MST; sorting edges by weight |
| Implicit graph | O(1) storage | Computed on-the-fly | Computed | BFS/DFS on grid, state-space search |
| CSR (Compressed Sparse Row) | O(V + E) | O(log degree) | O(degree) | Read-only graphs; cache-efficient traversal |
| Multigraph with edge ids | O(V + E) | O(degree) | O(degree) | Multiple edges between same nodes; flow networks |

**Implicit graph patterns** (no explicit storage needed):
- Grid as graph: cell (r, c) is a node; 4/8 neighbors are edges
- State as node: (position, remaining_fuel, keys_held) is a node in BFS
- Interval as node: edge from interval A to B if A ends before B starts (interval scheduling graph)
- Bitmask as node: each subset is a node; DP on subsets is BFS on hypercube graph

**Key implementation traps:**
- Directed vs. undirected: adding edge u→v in an undirected graph requires also adding v→u
- Self-loops and parallel edges: adjacency matrix handles them naturally; adjacency list needs care
- Implicit graphs: ensure the neighbor-generation function is correct for boundary cells (grid edges)
- Graph of intervals: when converting intervals to a DAG, ensure you sort by start time first

**Disqualifiers:**
- Problem is fundamentally about ordered sequences, not relationships → don't force a graph
- V is huge but edges are implicit and acyclic → DP on the implicit DAG is cleaner than building the graph

---

## 5. Union-Find (Disjoint Set Union)

**Core contract:** Two operations — `union(a, b)` merges two sets; `find(a)` returns
the canonical representative of a's set. With union-by-rank and path compression:
both operations are effectively O(α(n)) ≈ O(1).

**When to prefer it:**
- Dynamic connectivity: "are these two nodes in the same component after adding edges?"
- Detecting cycles while building a spanning tree (Kruskal's)
- Offline connectivity queries where edges only *appear*, never disappear

**Canonical sub-variants:**
| Variant | Characteristic | Best used when |
|---|---|---|
| Standard DSU | Union by rank + path compression | Component membership, Kruskal's MST |
| Weighted/labeled DSU | Each node stores a value relative to its parent | Accounts with transfers, relative distances |
| Rollback DSU (link-cut) | Union by rank *without* path compression; supports undo | Offline dynamic connectivity, divide-and-conquer on edges |
| DSU on tree (small-to-large) | Merge smaller child's data into larger child's; O(n log n) total | Subtree queries, color counting on trees |
| Bipartite checking DSU | Two nodes per vertex (true/false state); union checks consistency | 2-colorability, odd cycle detection |

**Key implementation traps:**
- Path compression alone (without union by rank) gives O(log n) not O(α(n))
- Rollback DSU: path compression *breaks* rollback — must use union by rank only
- Weighted DSU: when doing path compression, the weights along the path must be composed correctly
- Off-by-one in initialization: `parent[i] = i` for all nodes, including isolated ones

**Disqualifiers:**
- Edges can be *removed* as well as added → DSU doesn't support deletions; use link-cut trees or offline processing
- Need to enumerate all members of a component → DSU only gives representative, not membership list
- Need shortest path → DSU knows connectivity but not distance

---

## 6. Monotonic Stack and Queue

**Core contract:** A stack or deque maintained in sorted order by evicting elements
that can never be the answer to a future query. Each element is pushed and popped at
most once → O(n) total across all operations.

**When to prefer it:**
- "Next greater / smaller element" for each position
- Sliding window maximum or minimum in O(n)
- Largest rectangle / container problems
- Problems where earlier elements become irrelevant once a better candidate appears

**Canonical sub-variants:**
| Variant | Order maintained | Best used when |
|---|---|---|
| Monotonic increasing stack | Bottom to top: increasing | Next smaller element, largest rectangle in histogram |
| Monotonic decreasing stack | Bottom to top: decreasing | Next greater element, stock span problem |
| Monotonic deque (sliding window) | Front is current best; rear evicts dominated elements | Sliding window max/min, maximum of all subarrays of size K |
| Two-stack queue | Two stacks simulate O(1) amortized queue with min/max tracking | Min-queue (queue supporting O(1) minimum queries) |
| Cartesian tree construction | Monotonic stack builds the Cartesian tree in O(n) | Range minimum query structure, treap-like problems |

**Key implementation traps:**
- Deciding what to store: often store *indices*, not values, so you can compute spans/widths
- Equality handling: "strictly greater" vs "greater or equal" changes which duplicates survive
- Sliding window deque: evict from the *front* when the window slides past an element, from the *rear* when a new element dominates
- Off-by-one in the span calculation: `right - left - 1` not `right - left` when both pointers are exclusive

**Disqualifiers:**
- Window size changes non-monotonically (deque no longer sufficient; use segment tree)
- Need arbitrary access into the "stack" by value (use a BST instead)
- Query isn't about a contiguous range or a sliding window

---

## 7. Sliding Window and Two Pointer

**Core contract:** Maintain a contiguous subarray (sliding window) or two indices
moving toward each other (two pointer) to answer queries in O(n) rather than O(n²).

**When to prefer it:**
- "Longest/shortest subarray satisfying a property"
- "Pair of elements summing to a target in a sorted array"
- Constraint on a subarray is monotone: expanding the window can only make it harder (or easier) to satisfy

**Canonical sub-variants:**
| Variant | Pointer movement | Best used when |
|---|---|---|
| Fixed-size window | Right advances; left = right - k | Average of subarrays of size K, max sum of size K |
| Variable-size window (shrink when invalid) | Right advances freely; left advances when constraint violated | Longest substring without repeating chars, min window substring |
| Two pointer on sorted array | Left from start, right from end; move based on comparison | Two-sum in sorted array, container with most water |
| Two pointer on linked list | Fast and slow pointers | Cycle detection, find middle node, Kth from end |
| Multi-pointer (three pointers) | One anchor + two-pointer sweep | Three-sum, four-sum |
| Prefix sum + two pointer | Precompute prefix sums; binary search or two-pointer on them | Subarray sum ≥ K (positive values), minimum size subarray sum |

**Key implementation traps:**
- Variable window: the shrink condition must restore validity *fully* before recording an answer
- Two pointer on unsorted data: requires sorting first — the sort cost O(n log n) must be acceptable
- Window with a frequency map: decrement the map when the left pointer moves; don't delete keys, check count == 0
- Sliding window on circular arrays: run two passes or use modular indexing

**Disqualifiers:**
- Constraint is not monotone (e.g., "subarray with sum *exactly* K" on mixed-sign input → prefix sum + hash map instead)
- Array is unsorted and sorting would destroy required ordering
- Queries are offline and non-contiguous (use segment tree or BIT)

---

## 8. Bit Manipulation and Bitsets

**Core contract:** Operate on integers as arrays of bits. Modern CPUs execute bitwise
ops in O(1) on 64-bit words; bitsets compress boolean arrays by 64×, enabling
O(n/64) set operations.

**When to prefer it:**
- State is a subset of a small universe (N ≤ 20 for full bitmask DP; N ≤ 10⁶ for bitset)
- Need fast set intersection, union, or complement
- Parity, power-of-two, or lowest-set-bit tricks replace arithmetic

**Canonical sub-variants:**
| Variant | Key operation | Best used when |
|---|---|---|
| Bitmask DP | State = bitmask of chosen items; transition flips bits | TSP, set cover, assignment with N ≤ 20 |
| XOR trick | a ^ b ^ b = a; XOR of a pair cancels | Find single non-duplicate, missing number, swap without temp |
| Lowest set bit (LSB) | `x & (-x)` isolates the rightmost 1 | Fenwick tree indexing, iterating over set bits |
| Popcount | `bin(x).count('1')` or hardware POPCNT | Hamming distance, count set bits, parity |
| Bit shifting for powers | `1 << k` = 2^k; `x >> k` = x // 2^k | Fast multiply/divide by powers of 2, flag masks |
| Bitset DP | Use Python `int` or C++ `bitset<N>` as a dense boolean array | Subset sum feasibility for large N, reachability in boolean matrix |
| Gray code | Consecutive values differ by exactly one bit | Generating permutations/subsets without revisiting, rotary encoders |

**Key implementation traps:**
- Signed integer overflow: `1 << 31` is undefined in C++ with `int`; use `1LL << 31`
- Python integers are arbitrary precision — bitmask DP works for N > 64, but gets slow
- XOR swap: `a ^= b; b ^= a; a ^= b` fails when `a` and `b` are the same variable (i.e., same memory)
- Iterating over all subsets of a mask: `sub = mask; while sub > 0: process(sub); sub = (sub-1) & mask` — don't forget to process `sub = 0` separately if needed

**Disqualifiers:**
- N > 20 for bitmask DP (2^20 = 1M states is borderline; 2^25 is too large)
- Operations require ordering or range queries (bits don't have positional meaning beyond index)
- Problem involves arithmetic that doesn't reduce to bit tricks

---

## Cross-structure decision guide

When the paradigm is fixed and you're choosing a data structure, use these signals:

| Bottleneck operation | Reach for |
|---|---|
| "Best available element" changes dynamically | Heap |
| Range query + point update on array | Fenwick tree (simple) or Segment tree (flexible) |
| Range update + range query | Segment tree with lazy propagation |
| Exact membership / frequency of arbitrary keys | HashMap / HashSet |
| Dynamic connectivity (edges only added) | Union-Find |
| Next greater/smaller in linear time | Monotonic stack |
| Sliding window aggregate in linear time | Monotonic deque |
| Ordered iteration + fast insert/delete | BST (std ordered map/set) |
| Prefix matching on strings | Trie |
| Subset enumeration over small universe | Bitmask |
| Contiguous subarray satisfying monotone constraint | Sliding window / two pointer |

When two paths share a paradigm, pick structures from **different rows** of this table.

---

## Software Engineering Structures

The following 14 structure families extend Dimension 2 into software engineering domains.
They are grouped by domain and provide a quick-reference overview; see the JSON resource
files for full variant tables and implementation traps.

### Architecture

**Service Container / Dependency Injection** — Manage object creation and dependency resolution through a centralized registry (constructor injection, property injection, service locator, factory registry). Use when testability requires swapping implementations or when modules need loose coupling with configurable dependency graphs.

**Message Channel / Event Bus** — Decouple producers from consumers by routing messages through a shared channel (in-process emitter, IPC channel, message broker, command bus). Use for async workflows, cross-process messaging, and module decoupling.

**Sandbox Environment / Test Isolation** — Create isolated execution contexts (temp directories, virtual filesystem, env var sandboxing, process forks, Docker containers) where side effects are contained. Use for integration and E2E tests that touch filesystem, network, or environment variables.

**Configuration Layer** — Externalize runtime settings into a layered, validated, environment-aware system (dotenv cascade, feature flags, schema-validated config, hot reload, config inheritance). Use for multi-environment deployment with different settings per environment.

### API

**API Gateway / Edge Layer** — A single entry point (reverse proxy, BFF, edge function, full gateway) that routes, authenticates, and rate-limits requests before they reach backend services. Use when multiple backends need a unified API surface with cross-cutting concerns.

**Contract Definition / API-First Design** — Define the interface between systems as a machine-readable spec (OpenAPI, GraphQL SDL, Protocol Buffers, JSON Schema, AsyncAPI) before implementation. Use when API contracts drive code generation, documentation, and multi-team parallel development.

### Database

**Index Strategy** — Create auxiliary data structures in the database (B-tree, hash, GIN, GiST, partial, covering indexes) that trade write overhead for faster reads. Use to optimize frequently executed query patterns on read-heavy workloads.

**Migration Pipeline / Schema Evolution** — Apply versioned, ordered, and reversible schema changes (sequential migrations, idempotent scripts, expand-contract, blue-green schema, shadow tables). Use for production database evolution with zero-downtime deployment requirements.

### Concurrency

**Distributed Lock / Coordination Primitive** — Ensure mutual exclusion across processes or nodes (Redis SETNX, ZooKeeper ephemeral nodes, database advisory locks, etcd leases, optimistic locking). Use when only one process should perform an action at a time in a distributed system.

**Message Queue / Delivery Semantics** — Asynchronously deliver messages with defined guarantees (at-most-once, at-least-once, exactly-once via outbox, dead letter queue, priority queue). Use to decouple production and consumption rates with buffering and retry semantics.

### Frontend

**State Store / Client State Management** — Centralize or distribute application state in a predictable container (global store, atomic state, signals/observables, server state cache, URL state). Use for shared UI state, server data synchronization, and reactive updates across components.

### Observability

**Telemetry Pipeline / Observability Stack** — Collect, process, store, and visualize signals (OpenTelemetry collector, log aggregator, time-series DB, visualization, APM). Use for production monitoring, SLO tracking, and distributed request tracing.

### Security

**Credential Store / Secrets Management** — Store, access, rotate, and audit sensitive values (Vault, cloud secret manager, encrypted config, env vars, HSM) separately from application code. Use when production secrets must be rotated, audited, or access-controlled.

### Deployment

**Orchestration Layer / Container Management** — Automate deployment, scaling, and lifecycle management (Kubernetes, ECS/Fargate, serverless, Nomad, Docker Compose). Use for multi-container applications requiring coordinated deployment and auto-scaling.
