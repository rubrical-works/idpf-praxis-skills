# Problem Decomposition Strategy Reference

This file is a deep reference for the **Dimension 3 — Problem decomposition strategy**
table in SKILL.md. This dimension is the most under-appreciated source of genuine
solution diversity. Two paths can share the same paradigm *and* the same data structure
and still be fundamentally different algorithms because of how they frame the problem.

Each strategy entry covers:
- **Core reframe** — the one shift in perspective that defines this strategy
- **Structural signal** — what in the problem suggests this reframe is available
- **What it unlocks** — why this perspective produces a different algorithm
- **Classic examples** — concrete problems where this strategy is the key insight
- **Failure modes** — when the reframe doesn't apply or misleads

---

## 1. Offline vs. Online

**Core reframe:** *Offline* — read all queries before answering any of them, then
reorder, batch, or preprocess to answer optimally. *Online* — answer each query as
it arrives, with no future knowledge.

**Structural signal:**
- The problem gives you all queries upfront (offline is available)
- Queries arrive in a stream or order matters for correctness (online required)
- The offline approach would require a data structure that's hard to implement online (e.g., persistent or retroactive)

**What it unlocks:**
- Offline enables sorting queries by a key (endpoint, timestamp, value) to sweep
  through them in a single pass, answering each as you go
- Offline enables "reverse time" tricks: process deletions as additions in reverse order
- Offline enables divide-and-conquer on queries (parallel binary search, CDQ divide & conquer)
- Online forces incremental data structures (segment trees, BITs, DSU) but avoids
  the overhead of sorting and reordering

**Classic examples:**
- *Offline:* Count inversions (sort + merge), range query on static array (Mo's algorithm), offline LCA (Tarjan's), offline range median
- *Online:* LRU cache, stock price tracker, median of data stream
- *Offline advantage:* "For each query (L, R), count elements in range with value in [A, B]" → offline sort by R, sweep with BIT; online version requires persistent segment tree

**Failure modes:**
- Offline reorder destroys the causal structure the problem requires (e.g., "process queries where each query modifies state for the next")
- Sorting queries changes which data is "visible" at query time in a way that's hard to reconstruct

---

## 2. Forward vs. Reverse Processing

**Core reframe:** Process the input from right-to-left (or end-to-start) instead of
the natural left-to-right order. Equivalently: define DP state based on "suffix" rather
than "prefix."

**Structural signal:**
- A forward pass requires knowing the future (e.g., "does any element to the right exceed X?")
- The recurrence is cleaner when the base case is the end rather than the start
- A "next occurrence" or "future event" query appears in the problem

**What it unlocks:**
- Forward processing accumulates past information; reverse processing accumulates future information
- Some DP transitions that require O(n) lookahead forward become O(1) backward
- "Next greater element" is trivially computed right-to-left with a stack; left-to-right requires more bookkeeping

**Classic examples:**
- *Jump game:* Forward greedy reaches O(n); backward DP `can_reach[i] = any(can_reach[j] for j reachable from i)` is also O(n) but reverse
- *Candy distribution:* Two-pass — left-to-right for "greater than left neighbor", then right-to-left for "greater than right neighbor"; neither pass alone suffices
- *Delete edges offline:* Process deletions as additions in reverse; DSU handles additions but not deletions
- *Suffix array / suffix automaton:* Fundamentally reverse-oriented structures

**Failure modes:**
- Reverse processing changes the order of side effects (mutation problems)
- Some monotone properties hold forward but not backward (check the invariant holds in reverse)

---

## 3. Problem Transformation / Reduction

**Core reframe:** Map the problem to a different, well-known problem where efficient
algorithms already exist. Solve the transformed problem, then map the answer back.

**Structural signal:**
- The problem description is unusual but reminds you structurally of something familiar
- A change of variables simplifies the recurrence or constraint
- The problem can be encoded as a graph, sorted array, or algebraic structure

**Common transformation patterns:**
| Original framing | Transform to | Why |
|---|---|---|
| Longest common subsequence | Edit distance (different DP on same structure) | Same table, different transition costs |
| 2D grid path | 1D DP on diagonals | Reduces dimension when moves are constrained |
| Interval overlap | Sort by endpoint + greedy or sweep | Converts geometric problem to sequential |
| String pattern matching | Graph of states (automaton) | Makes matching iterable |
| Subarray sum = K | Prefix sum difference: `prefix[r] - prefix[l] = K` | Converts range query to point lookup |
| XOR in range | Prefix XOR: `xor(l, r) = prefix[r] ^ prefix[l-1]` | Same as prefix sum but for XOR |
| Count pairs satisfying condition | Complement counting: total - pairs NOT satisfying | Easier to count the complement |
| "Minimum of maximum" or "maximum of minimum" | Binary search on the answer | Converts optimization to decision |

**What it unlocks:**
- Transforms often reduce time complexity by applying known optimal algorithms
- A hard constraint in one framing may be trivial in another
- Transformation can convert a 2D problem to 1D, or an online problem to an offline one

**Classic examples:**
- *Binary search on the answer:* "Minimum time to complete all tasks" → "Is it possible in T time?" → binary search on T
- *Prefix sum trick:* "Count subarrays with sum K" is hard directly; after prefix sum it becomes "count pairs (i,j) where `prefix[j] - prefix[i] = K`" — solvable with a hashmap in O(n)
- *LIS via patience sorting:* LIS length equals minimum number of piles in patience sort; transforms sequence problem into geometric one

**Failure modes:**
- The transformation is more complex than a direct solution for the given constraints
- The inverse mapping from transformed answer to original answer is lossy or ambiguous

---

## 4. Primal vs. Dual / Complement Framing

**Core reframe:** Instead of counting or optimizing what you *want*, count the
*complement* and subtract, or solve the *dual* formulation and invert.

**Structural signal:**
- Counting directly is hard because valid configurations are irregular
- The invalid or excluded configurations have simpler structure
- Min-max duality applies (maximize one thing ↔ minimize its complement)

**What it unlocks:**
- Inclusion-exclusion: count all, subtract overcounts
- "At least one" is hard; "none" is often a product of independent probabilities
- "Maximum independent set" is hard; "minimum vertex cover" = n - maximum matching (König's theorem on bipartite graphs)
- "Minimum cut" = "maximum flow" (max-flow min-cut theorem)

**Classic examples:**
- *Count subarrays with at most K distinct* → use "at most K" - "at most K-1" = "exactly K"
- *Probability of at least one collision* → 1 - P(no collision) (birthday paradox)
- *Minimum cost to make array non-decreasing* → dual is maximum number of elements you can keep (LIS)
- *Find duplicate by XOR* → XOR all elements + all indices cancels everything except the duplicate
- *Minimum path cover in DAG* → n - maximum bipartite matching

**Failure modes:**
- Complement set is not simpler than the original (both are irregular)
- Inclusion-exclusion has too many terms (use DP or Möbius inversion instead)

---

## 5. Eager vs. Lazy Evaluation

**Core reframe:** *Eager* — compute and propagate results immediately when state changes.
*Lazy* — defer work until it's actually needed; batch deferred updates before queries.

**Structural signal:**
- Many updates affect a range of elements (lazy is efficient: one deferred tag covers the range)
- Updates and queries are interleaved and the full result isn't needed until later
- Some updates will be overwritten before they're ever queried (lazy avoids wasted work)

**What it unlocks:**
- Lazy propagation on segment trees: range update in O(log n) instead of O(n) by pushing the update tag down only when a child is accessed
- Lazy deletion in heaps/sorted structures: mark elements as invalid at O(1), pay the cleanup cost only at pop time
- Memoization is lazy DP: compute only the subproblems actually needed vs. bottom-up tabulation (eager, computes all)
- Event-driven simulation is lazy: advance state only when an event occurs vs. simulating every tick

**Classic examples:**
- *Lazy segment tree:* Range add + range sum query; without lazy, range add is O(n); with lazy tag it's O(log n)
- *Lazy heap in Dijkstra:* Instead of decreasing key (complex), push a new entry and skip stale pops
- *Lazy deletion in interval scheduling:* Mark processed intervals as used; skip them on next access
- *Memoized DFS vs. BFS:* Top-down memoization (lazy) explores only reachable states; BFS (eager) explores all states at each level

**Failure modes:**
- Lazy tags must be composable: if you apply "add 5" then "multiply by 2", the composed lazy tag is "multiply by 2, add 10" — non-composable updates require careful ordering
- Lazy deletion requires a validity check at every pop; forgetting this produces wrong answers silently

---

## 6. Push vs. Pull Propagation

**Core reframe:** *Push* — when a node's value changes, it immediately notifies and
updates all its dependents. *Pull* — when a node needs its value, it requests it from
its dependencies on demand.

**Structural signal:**
- Clear producer/consumer structure in the problem (push: producer drives; pull: consumer drives)
- In-degree vs. out-degree asymmetry: high out-degree → pushing is expensive; high in-degree → pulling is expensive
- DP on DAGs: "which direction do transitions flow?"

**What it unlocks:**
- Push-based DP: `dp[v] = f(dp[u])` — for each node u, update all successors v. Natural for topological-order DP where each node "contributes to" its children
- Pull-based DP: `dp[v] = g(dp[u] for u in predecessors(v))` — each node "collects from" its parents. Natural when a node needs all parent values before it can be computed
- Push works well for sparse graphs (low out-degree); pull works well when parents are few
- Tree DP rerooting: compute subtree answers (pull), then reroot to compute full-tree answers (push back down)

**Classic examples:**
- *Push in BFS:* When popping node u, push u's contribution to all neighbors v
- *Pull in Dijkstra:* When processing node v, pull the best distance from all incoming edges
- *Push DP in coin change:* For each coin value c, for each amount i, update `dp[i+c]`
- *Pull DP in coin change:* For each amount i, check all coins c and pull `dp[i-c]`
- *Rerooting DP:* First pass pulls subtree answers bottom-up; second pass pushes "upward" contribution top-down

**Failure modes:**
- Push requires knowing all outgoing edges at update time (bad for implicit graphs)
- Pull requires knowing all incoming edges at query time (bad when in-degree is large and irregular)

---

## 7. Divide the Domain (Meet in the Middle / Splitting)

**Core reframe:** Instead of searching the full space of size S, split the problem into
two halves of size √S, solve each independently, then combine. Typically reduces
exponential to sub-exponential or O(n²) to O(n√n) or O(n log n).

**Structural signal:**
- Brute force is O(2^n) or O(n²) and n is ~40 (meet in middle) or the constraint is large but the structure is symmetric
- The problem has a "balance point" — combining a left-half result with a right-half result is efficient
- Two independent partial solutions can be joined by a single key (sum, XOR, sorted position)

**What it unlocks:**
- 4-sum, subset sum with N=40: split into two halves of N=20 (2^20 each); combine via hash or binary search
- Bidirectional BFS: expand from both source and target; total states explored ≈ 2 × b^(d/2) instead of b^d
- CDQ divide and conquer (陈丹琦): offline 2D/3D problem solved by splitting on one dimension, solving each half, counting cross contributions at the split

**Classic examples:**
- *Subset sum N=40:* Brute force O(2^40); meet in middle O(2^20 × 20) — feasible
- *Bidirectional BFS on word ladder:* Bidirectional reduces from 26^n to 2 × 26^(n/2)
- *4-sum:* Split into all (a+b) pairs and all (c+d) pairs; look up complement in hash map

**Failure modes:**
- The combination step is expensive (O(n) per pair → no asymptotic gain)
- The two halves aren't truly independent (shared state must be carefully threaded through)

---

## 8. Coordinate / Dimension Reduction

**Core reframe:** Project a multi-dimensional problem onto fewer dimensions, or compress
a large sparse coordinate space into a dense one, to enable efficient algorithms that
only work in 1D or on small ranges.

**Structural signal:**
- The problem involves 2D or 3D geometry but movement is constrained to one axis at a time
- Values are large but the *number* of distinct values is small
- A 2D DP can be reduced to 1D by fixing one dimension and sweeping

**What it unlocks:**
- Coordinate compression: map N distinct values in [1, 10^9] to [1, N] to use a Fenwick tree
- Sweep line: fix one axis, sweep along the other, answer queries at each position
- 1D projection of 2D DP: when the DP table's row depends only on the previous row, use a rolling array
- Row-by-row or column-by-column processing of grids: treat each row as a bitmask to apply bitmask DP in 2D grid

**Classic examples:**
- *Count inversions:* Map values to [1, N]; use Fenwick tree on compressed coordinates
- *Rectangle intersection:* Sweep left-to-right; maintain active set of y-intervals
- *Maximal rectangle in histogram:* Reduce 2D matrix to 1D histogram row by row
- *2D bitmask DP:* Broken profile DP for tiling — state is the bitmask of the current column's protrusions

**Failure modes:**
- Compression destroys ordering structure needed by the algorithm (check that comparisons remain valid after compression)
- The sweep line event structure is complex to implement correctly (missed or double-counted events)

---

## 9. Amortization and Potential

**Core reframe:** Design an operation that is occasionally expensive but *amortized*
cheap — pay for expensive steps by "banking" credit during cheap steps. The potential
method formalizes this: assign a potential Φ to each state; amortized cost = actual
cost + ΔΦ.

**Structural signal:**
- A sequence of operations has variable cost but the total is bounded
- The expensive operations become possible only after many cheap operations (e.g., rebuilding a structure)
- You want to claim O(1) per operation even though some individual operations are O(n)

**What it unlocks:**
- Dynamic arrays (append): O(1) amortized because doubling is rare
- Union-Find with path compression: O(α(n)) amortized
- Splay trees / move-to-front: amortized O(log n) per access
- Stack-based algorithms with "push each element once, pop each element once" invariant: total O(n) even though individual pops look like O(n)

**Classic examples:**
- *Monotonic stack (amortized argument):* Each element is pushed once and popped once → O(n) total despite appearances
- *Two-pointer (amortized argument):* Left pointer and right pointer each move at most N times → O(n) total
- *Tarjan's SCC:* Each node is pushed to and popped from the stack exactly once → O(V + E)

**Failure modes:**
- Amortized analysis doesn't apply when individual worst-case latency matters (real-time systems)
- The amortized bound requires the sequence to start from an "empty" state; if the structure is pre-loaded, the analysis changes

---

## Cross-strategy interaction guide

Strategies can often be **combined** — this is where genuinely novel algorithms emerge:

| Combination | What it produces |
|---|---|
| Offline + Divide domain | CDQ divide & conquer: split queries in half, count cross contributions |
| Reverse + Lazy | Process deletions as additions in reverse; DSU with rollback |
| Transform + Dual | Binary search on the answer for a min-max problem after coordinate compression |
| Offline + Transform | Sort queries by right endpoint, sweep with BIT (offline range query pattern) |
| Eager/lazy + Amortization | Lazy deletion in a heap is O(log n) amortized because stale entries are bounded by total inserts |

When two paths already differ in paradigm and data structure, choosing different
strategies from this list for each path almost guarantees that the two approaches
will be *architecturally* different — not just implementation variants of each other.

---

## Software Engineering Strategies

The following 13 strategy families extend Dimension 3 into software engineering domains.
They are grouped by domain and provide a quick-reference overview; see the JSON resource
files for full example tables and failure modes.

### Architecture

**Boundary Isolation** — Isolate concerns at process, module, or network boundaries (service boundaries, process boundaries, module federation) so each side can evolve, deploy, and test independently. Use when cross-process communication patterns emerge or module coupling causes rippling changes.

**Fixture and Seed** — Generate test data through factories, builders, or snapshot seeding rather than constructing it inline in every test. Use when test data setup is verbose, duplicated, or requires complex object graphs with consistent relationships.

**Environment Override** — Inject configuration at runtime by overriding environment variables, file paths, or config layers (dotenv cascade, config layering, path redirection). Use for multi-environment deployment where the same binary must behave differently based on its environment.

### Database

**Denormalization for Read** — Trade write complexity for read performance by precomputing and storing derived data (denormalized tables, materialized views, computed columns, read replicas). Use when slow queries are dominated by joins that could be precomputed once and read many times.

**Schema Evolution** — Evolve database or API schemas incrementally (expand-contract, API versioning, backward-compatible migrations) while maintaining backward compatibility. Use when multiple consumers depend on the same schema and zero-downtime deployment is required.

### API

**API Versioning Strategy** — Manage multiple API versions (URL path versioning, header versioning, content negotiation) to give consumers a stable contract while allowing the API to evolve. Use when breaking changes are required but existing clients cannot update immediately.

### Concurrency

**Consistency Trade-off** — Choose the consistency level (strong, eventual, read-your-writes, causal) that matches business requirements rather than defaulting to strong consistency everywhere. Use when distributed state is replicated across nodes and latency-vs-correctness tension exists.

**Idempotency Design** — Ensure operations produce the same result regardless of how many times they are executed (idempotency keys, deduplication tables, tombstones, conditional writes). Use when retry logic, at-least-once delivery, or duplicate requests are present in the system.

### Frontend

**Hydration Strategy** — Choose when and how client-side JavaScript activates server-rendered HTML (full hydration, partial hydration, progressive hydration, resumability). Use when time-to-interactive is significantly later than first contentful paint or JavaScript bundle size is disproportionate to interactivity.

### Caching

**Invalidation Pattern** — Define a strategy for keeping cached data fresh (TTL-based, event-driven, write-through, write-behind). Use when stale data causes incorrect behavior and you need to control the trade-off between freshness and performance.

### Security

**Zero Trust Approach** — Verify every request regardless of network location (mTLS, service mesh, identity-aware proxy). Use when internal service communication relies on network perimeter for security and lateral movement risk is a concern.

### Deployment

**Environment Promotion** — Move immutable build artifacts through a sequence of environments (GitOps, pipeline-driven, branch-per-environment) with increasing confidence gates. Use when deployment pipelines need repeatable, auditable promotions from dev through production.

### Observability

**Sampling Approach** — Decide which telemetry data to collect versus discard (head-based, tail-based, adaptive, always-on for errors) based on cost, volume, and debugging needs. Use when high-volume telemetry exceeds storage or processing budget and targeted debugging requires selective collection.
