# Algorithmic Paradigm Reference

This file is a deep reference for the **Dimension 1 — Algorithmic paradigm** table in
SKILL.md. When naming paths, consult it to identify which paradigm family best describes
each candidate approach, and — critically — to find a genuinely *different* family for
each subsequent path.

Each paradigm entry covers:
- **Core idea** — the one sentence that defines the paradigm
- **When it applies** — the structural signals in a problem that suggest this paradigm
- **Canonical sub-variants** — distinct flavors within the family (these can be separate paths)
- **Red flags** — signs this paradigm is a poor fit
- **Classic problems** — concrete anchors to recognise the family in a new problem

---

## 1. Greedy

**Core idea:** At each step, make the locally optimal choice and never reconsider it.
A greedy works when the problem has the *greedy choice property* — a local optimum
extends to a global optimum — and *optimal substructure*.

**When it applies:**
- Problem asks for a minimum/maximum over a set of choices (scheduling, allocation, covering)
- Each decision is irreversible and independent of future decisions
- An exchange argument can prove that swapping any two adjacent choices can't improve the result
- Interval problems, task scheduling, coin change with canonical denominations

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| Sort-then-scan | Sort by one key, greedily consume in order | Activity selection, meeting rooms |
| Heap-maintained frontier | A priority queue tracks the best available choice at each step | Dijkstra, Prim's MST, K closest points |
| Exchange argument / inversion | Prove any deviation from greedy can be "uncrossed" without loss | Job sequencing by deadline, Huffman coding |
| Fractional relaxation | Take as much of the best item as fits, then next-best | Fractional knapsack |
| Two-pass greedy | One left-to-right pass + one right-to-left pass, results combined | Candy distribution, trapping rain water |
| Lazy deletion greedy | Items are "removed" by marking rather than restructuring; heap pops skip stale entries | Task scheduler with cooldown, sliding window maximum |

**Red flags:**
- The problem has a "0/1" or all-or-nothing choice (greedy usually fails — DP needed)
- Counter-examples exist where the locally best choice leads to a globally worse outcome
- The problem involves dependencies between choices (use graph/DP instead)

**Classic problems:** Interval scheduling maximization, Huffman encoding, Dijkstra's shortest path, Prim's/Kruskal's MST, jump game (reachability variant), assign cookies.

---

## 2. Dynamic Programming

**Core idea:** Break the problem into overlapping subproblems, solve each once, and
store results. DP works when the problem has *optimal substructure* and *overlapping
subproblems* — the hallmark distinction from divide-and-conquer.

**When it applies:**
- Counting, minimizing, maximizing over an exponential decision space
- "How many ways", "minimum cost", "longest/shortest" phrasing
- State can be compactly represented and transitions are well-defined
- Choices interact (unlike greedy where they're independent)

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| Top-down memoization | Recursive with a cache; natural for irregular state spaces | Word break, climbing stairs |
| Bottom-up tabulation | Iterative fill of a table in dependency order; avoids stack overhead | Longest common subsequence, edit distance |
| 1D rolling array | Current row depends only on previous row; reduce O(n²) space to O(n) | 0-1 knapsack (space-optimized) |
| Interval DP | State = (left, right) subarray or subrange; fill diagonally | Matrix chain multiplication, burst balloons, palindrome partitioning |
| Bitmask DP | State includes a bitmask of which items have been used; handles small N with combinatorial choice | Travelling salesman (small N), minimum XOR cover, assignment problems |
| Digit DP | State tracks position + tight constraint + accumulated property; counts integers in a range satisfying a property | Count numbers with digit sum = K in [L, R] |
| Tree DP | DP runs on tree structure; state transitions along parent→child edges | Max independent set on tree, diameter, rerooting technique |
| Profile DP | State encodes the "frontier" shape between processed and unprocessed; common in grid tiling | Broken profile DP for domino tiling |
| DP with monotone queue / divide & conquer optimization | Transition cost satisfies the concave/convex SMAWK condition; reduces O(n²) to O(n log n) | Optimal BST, certain knapsack variants |

**Red flags:**
- State space is too large to store (use heuristics or approximation instead)
- No overlapping subproblems (pure divide-and-conquer is better)
- Problem requires online decisions with no future lookahead (use greedy or sliding window)

**Classic problems:** Longest increasing subsequence, edit distance, 0-1 knapsack, coin change (exact count), egg drop, palindrome partitioning, burst balloons, TSP on small graphs.

---

## 3. Divide and Conquer

**Core idea:** Split the problem into independent subproblems, solve recursively, then
combine. Unlike DP, subproblems do *not* overlap — solving them twice would give the
same result.

**When it applies:**
- Problem naturally decomposes into halves or k-parts with no shared state
- Combining partial solutions is efficient relative to solving the whole
- The problem has a recursive geometric or structural self-similarity
- "Find in sorted array", "build a balanced structure", "aggregate over a range"

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| Binary search | Eliminate half the search space per step; requires monotone predicate | Search in rotated array, find peak, capacity to ship packages |
| Merge-based | Divide, recurse, merge with cross-partition contribution counted at merge | Merge sort, count inversions, sort colors |
| Randomized partition | Pick random pivot; expected O(n log n) or O(n) | Quicksort, quickselect (kth largest) |
| Recursive geometric | Partition space recursively; combine nearest-pair or range queries | Closest pair of points, k-d tree construction |
| Matrix exponentiation | Express recurrence as matrix multiply; fast-power gives O(log n) | Fibonacci in O(log n), linear recurrence of fixed order |
| Segment tree build | Build balanced tree over array; each node aggregates a range | Range min/max/sum queries, lazy propagation |
| Parallel binary search | Binary search simultaneously over multiple independent queries | Offline range queries, persistent structures |

**Red flags:**
- Subproblems are not independent (overlapping → use DP)
- Combining results is as expensive as solving the whole (no asymptotic gain)
- Problem requires processing items in a specific order (use sweep line or DP)

**Classic problems:** Merge sort / count inversions, binary search variants, closest pair of points, matrix chain (D&C optimization), Karatsuba multiplication, segment tree.

---

## 4. Graph Traversal

**Core idea:** Model the problem as a graph of states and edges, then traverse it to
answer reachability, shortest path, ordering, or connectivity questions.

**When it applies:**
- Problem involves relationships, dependencies, or transitions between discrete states
- "Can we reach X from Y?", "shortest sequence of moves", "ordering with dependencies"
- The state space is naturally node-shaped (cells, nodes, configurations)
- Implicit graphs where nodes are problem states and edges are valid transitions

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| BFS (unweighted shortest path) | Level-by-level expansion; guarantees fewest edges | Word ladder, 0-1 BFS on grid, multi-source BFS |
| Dijkstra (weighted shortest path) | Priority queue, always expand cheapest frontier node | Network delay time, path with minimum effort |
| Bellman-Ford | Relax all edges N-1 times; handles negative weights, detects negative cycles | Cheapest flights within K stops, currency arbitrage |
| DFS (topological / cycle detection) | Post-order DFS; reverse post-order = topological sort | Course schedule, alien dictionary |
| Tarjan's / Kosaraju's SCC | Two-pass DFS or stack-based; finds strongly connected components | Critical connections, redundant connections |
| Floyd-Warshall | All-pairs shortest paths; O(V³) but simple | All-pairs reachability on small graphs |
| Bidirectional BFS | Expand from both source and target; meets in the middle | Word ladder (large graph), shortest path with huge branching factor |
| 0-1 BFS | Deque instead of queue; handles edges of weight 0 or 1 only | Minimum flips in grid, shortest path with free moves |
| A\* | BFS + admissible heuristic to guide expansion toward goal | Pathfinding with spatial structure, 8-puzzle |
| Implicit graph / state-space BFS | Nodes are (partial) problem states, not literal graph nodes | Sliding puzzle, lock combination, BFS on game states |

**Red flags:**
- Graph is too large to store explicitly (use implicit traversal or meet-in-the-middle)
- Edge weights are real-valued and large (Dijkstra still works but consider precision)
- Problem is about structure of the graph itself, not traversal (use Union-Find or matrix methods)

**Classic problems:** Number of islands, word ladder, course schedule, network delay time, cheapest flights within K stops, clone graph, critical connections.

---

## 5. Backtracking and Constraint Search

**Core idea:** Build a solution incrementally; abandon ("prune") partial solutions as
soon as they violate constraints. Correct but potentially exponential — pruning is
everything.

**When it applies:**
- Problem asks to enumerate, find, or count *all* valid configurations
- Constraints eliminate large portions of the search space early
- No polynomial algorithm is known (NP-hard in general, tractable with pruning for small N)
- "All permutations", "all subsets satisfying X", "place N queens", "solve this puzzle"

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| Subset enumeration | Include/exclude each element; 2^N leaves | Subsets, combination sum, power set |
| Permutation generation | Fix element at each position; N! leaves | Permutations, next permutation |
| Constraint propagation (CSP-style) | After each assignment, propagate constraints to reduce domains | Sudoku solver, N-queens with forward checking |
| Branch and bound | Track best solution so far; prune branches that cannot beat it | 0-1 knapsack (exact), TSP (exact) |
| Iterative deepening DFS (IDDFS) | DFS with depth limit that increases; O(b^d) time, O(d) space | Maze with unknown depth, 15-puzzle |
| Meet in the middle | Split search space in half; solve each half, then join | 4-sum, subset sum with large N, bidirectional backtrack |

**Red flags:**
- N is large and pruning is weak (exponential blowup; use DP or approximation)
- Problem only asks for *one* solution, not all (often DP or greedy is faster)
- The constraint structure has a polynomial algorithm you haven't noticed yet

**Classic problems:** N-queens, Sudoku, combination sum, word search on grid, generate parentheses, palindrome partitioning (all partitions), letter combinations of phone number.

---

## 6. Randomized Algorithms

**Core idea:** Use randomness to simplify the algorithm, avoid adversarial worst cases,
or approximate hard problems. Correct in expectation or with high probability.

**When it applies:**
- Deterministic worst case is bad but expected case matters
- Need to sample from a large or streaming population
- Problem involves hashing, fingerprinting, or approximate membership
- The adversary can break deterministic approaches (use randomized to deny worst-case inputs)

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| Randomized quickselect | Random pivot → expected O(n) kth-element | Kth largest element, median of unsorted array |
| Reservoir sampling | Single pass over stream; each element has equal probability of being in sample | Random sample from unknown-length stream |
| Random hashing / universal hashing | Random hash function → low collision probability | Distributed caching, frequency estimation |
| Bloom filter | Hash into multiple bit positions; false positives possible, no false negatives | Membership test with space constraint |
| Count-Min Sketch | Array of hash-indexed counters; approximate frequency queries | Heavy hitters in a stream |
| Monte Carlo / Las Vegas | MC: fast, possibly wrong answer; LV: always correct, random runtime | Primality testing (Miller-Rabin), randomized min-cut (Karger's) |
| Skip list | Probabilistic layered linked list; O(log n) expected ops | Ordered set with fast insert/delete, LRU cache variants |

**Red flags:**
- Problem requires a guaranteed correct answer with a deterministic bound (use exact algorithm)
- Randomness isn't available or seeding is adversarial
- The problem size is small enough that deterministic O(n log n) is fine

**Classic problems:** Kth largest in array, random shuffle (Fisher-Yates), random pick index (with weights), online reservoir sampling, consistent hashing.

---

## 7. Mathematical and Number-Theoretic

**Core idea:** Exploit algebraic structure, number theory, or combinatorial identities
to reduce an apparently hard problem to arithmetic — often from O(n) to O(log n) or O(1).

**When it applies:**
- Problem involves modular arithmetic, divisibility, primes, or GCD structure
- Counting problems with large N where direct enumeration is impossible
- Geometric problems reducible to arithmetic (area, intersections, convex hull)
- The answer involves factorials, Catalan numbers, Fibonacci, or similar sequences

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| Sieve of Eratosthenes | Mark multiples; O(n log log n) prime generation | Count primes, prime factorization up to N |
| GCD / LCM structure | Euclidean algorithm; Bézout's identity for linear combinations | Fraction simplification, water jug, minimum steps to make GCD |
| Modular exponentiation | Fast power with modular reduction; O(log n) | Large Fibonacci, matrix power mod, RSA-style operations |
| Combinatorics (nCr mod p) | Pascal's triangle or Lucas' theorem for modular binomial | Count valid paths in grid, distributing items |
| Pigeonhole principle | If n items in k < n bins, some bin has ≥ 2 | Existence proofs, duplicate detection, calendar problems |
| Prefix sum / difference array | Precompute cumulative sums; O(1) range query after O(n) build | Subarray sum equals K, range update + query |
| Convex hull trick | Envelope of linear functions; O(n) or O(n log n) DP optimization | DP where cost is linear in a variable, CHT for slope optimization |
| Geometric primitives | Cross product for orientation, Shoelace for area, sweep for intersections | Convex hull, polygon area, point in polygon |

**Red flags:**
- Problem doesn't have algebraic structure to exploit (use DP or graph instead)
- Modular arithmetic introduces precision issues the problem doesn't accommodate
- The number-theoretic reduction is more complex than the direct approach for the given constraints

**Classic problems:** Count primes (Sieve), ugly numbers, Pow(x, n), number of digit ones, Pascal's triangle, subarray sum equals K, largest rectangle in histogram (geometric).

---

## 8. Simulation and State Machines

**Core idea:** Model the problem as a sequence of state transitions and execute them
directly. No clever reduction — the algorithm *is* the specification.

**When it applies:**
- Problem describes a process with explicit rules ("at each step, do X")
- The state space is small enough to enumerate or the simulation terminates quickly
- Finding cycles or steady states in a deterministic process
- Event-driven systems where future events are triggered by current state

**Canonical sub-variants:**
| Variant | Key mechanism | Archetypal problem |
|---|---|---|
| Direct simulation | Execute the described process step by step; verify termination | Game of Life, robot on a grid, simulate a stack/queue |
| Cycle detection (Floyd / Brent) | Tortoise-and-hare or Brent's algorithm; find loop in O(n) time O(1) space | Linked list cycle, find duplicate in array, hash function cycle |
| Event-driven simulation | Priority queue of future events; advance time to next event | Task scheduler, meeting room simulation, stock price events |
| Finite automaton | Explicit state machine with transition table; process input character by character | Regex matching (simple), string parsing, valid number |
| Cellular automaton | Each cell updates based on neighbors; often run for K steps | Conway's Game of Life, falling sand, spreading wildfire |
| Physics / geometric simulation | Apply movement/collision rules repeatedly; check invariants | Asteroid collision, dominoes falling, bouncing ball |

**Red flags:**
- Simulation runs for too many steps (need closed-form math or cycle detection)
- Problem asks for the *optimal* sequence of steps, not just the result of a given sequence (use DP or search)
- State space is too large to track explicitly (use hashing or abstraction)

**Classic problems:** Design hit counter, LRU cache, robot bounded in circle, asteroid collision, task scheduler (simulation variant), find the duplicate number (Floyd's cycle).

---

## Cross-paradigm decision guide

When a problem could plausibly fall into multiple paradigms, use these tiebreakers:

| Signal in the problem | Lean toward |
|---|---|
| "Minimum/maximum value" with independent choices | Greedy |
| "Minimum/maximum value" with interacting choices | DP |
| "All valid configurations" or "count all ways" | Backtracking or DP |
| "Shortest path" or "fewest steps" between states | Graph traversal (BFS / Dijkstra) |
| "Does X exist?" with large search space | Randomized or backtracking with pruning |
| Answer is a single number derivable analytically | Mathematical |
| Problem describes an explicit process | Simulation |
| Problem has self-similar recursive structure | Divide and conquer |

When truly ambiguous, assign the *more exotic* paradigm to one path (e.g., a mathematical
reduction or randomized approach) — these are more likely to surface insights that a
straightforward DP or greedy path would miss.
