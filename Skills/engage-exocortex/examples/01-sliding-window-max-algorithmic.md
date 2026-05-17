# Worked Example: Sliding-Window Maximum (algorithmic — execution-backed)

Demonstrates the **execution phase** (AC1) and **complexity-class anti-overlap** (AC4) on a representative algorithmic problem. Domain detection returns *algorithmic* — Step 0 is skipped, `--no-proposal` is the default, execution is default-on. No keyword-confirmation gate (`--confirm-keywords` not set).

---

## Problem

> "Given an integer array `nums` and a window size `k`, return an array containing the maximum value in every contiguous window of size `k`. Constraints: `1 ≤ k ≤ nums.length ≤ 100_000`, values fit in 32-bit signed."

**Target language:** JavaScript.
**Domain detection:** algorithmic — no architectural keywords (`architecture`, `infrastructure`, `database`, `API`, `auth`, etc.) → Step 0 skipped.

---

## Step 1 — Keywords

```
sliding window, contiguous, maximum, integer array, fixed window size, range maximum
```

Confirmation gate skipped (default-off). Direct to signal matching.

---

## Step 2 — Signal Match (top scores)

```
paradigms:   greedy=0.40, dynamic-programming=0.30, divide-and-conquer=0.20
structures:  sliding-window-and-two-pointer=0.90, monotonic-stack-and-queue=0.85, heap-priority-queue=0.55
strategies:  divide-the-domain=0.45, amortization-and-potential=0.40, eager-vs-lazy-evaluation=0.30
```

---

## Step 3 — Path Selection (N=3, anti-overlap by complexity class + invariant choice)

| Path | Paradigm | Structure | Strategy | targetComplexity | invariantChoice |
|---|---|---|---|---|---|
| 1 | greedy | monotonic-stack-and-queue | amortization-and-potential | O(n) | Monotonic deque holds indices in decreasing-value order — head is window max |
| 2 | greedy | heap-priority-queue | eager-vs-lazy-evaluation | O(n log k) | Max-heap of (value, index); lazy-pop stale entries when popping head |
| 3 | divide-and-conquer | sliding-window-and-two-pointer | divide-the-domain | O(n) | Two sweeps: prefix-max within block + suffix-max within block; window-max = max(suffix[i], prefix[i+k-1]) |

**Anti-overlap check:** All three paths have distinct `(targetComplexity, invariantChoice)` pairs. Paths 1 and 3 share `O(n)` complexity but differ on invariant. **Pass.**

(Without complexity-class anti-overlap, paths 1 and 2 might both have been labelled "greedy / monotonic / single-pass" with cosmetic differences. The new rule forces genuinely different invariants.)

---

## Step 4 — Subagent Briefs (slot-filled, parallel dispatch)

Each subagent receives its targetComplexity + invariantChoice, plus the instruction to return a `report.implementation` field containing a minimal runnable JavaScript implementation.

Subagent 1 reports:

```json
{
  "approach": "Monotonic deque of indices, decreasing-value front-to-back. On each i: pop expired indices off the head; pop smaller values off the tail; push i; if i ≥ k-1, emit nums[deque[0]].",
  "targetComplexity": "O(n)",
  "invariantChoice": "Monotonic deque holds indices in decreasing-value order — head is window max",
  "implementation": "function slidingWindowMax(nums, k) {\n  const out = [];\n  const dq = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (dq.length && dq[0] <= i - k) dq.shift();\n    while (dq.length && nums[dq[dq.length-1]] < nums[i]) dq.pop();\n    dq.push(i);\n    if (i >= k - 1) out.push(nums[dq[0]]);\n  }\n  return out;\n}"
}
```

(Subagent 2 and 3 return analogous reports — omitted for brevity.)

---

## Step 5 — Execution Phase (default-on, AC1)

Preflight enumerates target-language adapters: Node 18+ present → adapter available, execution proceeds.

The shared test set:

```js
[
  { case: "standard:0", nums: [1,3,-1,-3,5,3,6,7], k: 3, expected: [3,3,5,5,6,7] },
  { case: "standard:1", nums: [1], k: 1, expected: [1] },
  { case: "edge:k-equals-n", nums: [4,2,1,3], k: 4, expected: [4] },
  { case: "edge:monotone-increasing", nums: [1,2,3,4,5], k: 3, expected: [3,4,5] },
  { case: "edge:monotone-decreasing", nums: [5,4,3,2,1], k: 3, expected: [5,4,3] },
  { case: "edge:all-equal", nums: [7,7,7,7], k: 2, expected: [7,7,7] },
  { case: "stress:n=100000", nums: Array.from({length: 100000}, (_, i) => (i * 2654435761) | 0), k: 5000, expected: "<computed by reference>" }
]
```

Reference subagent named additional cases that get folded into the harness set.

**Sample results:**

| Path | standard:0 | edge:monotone-decreasing | edge:all-equal | stress:n=100000 | wallClockMs (stress) |
|---|---|---|---|---|---|
| 1 (monotonic deque) | pass | pass | pass | pass | 12 |
| 2 (heap) | pass | pass | pass | pass | 78 |
| 3 (block prefix/suffix) | pass | pass | pass | pass | 18 |

All three pass. **executionScore: all-pass.** The dimension contributes to recommendation by confirming each candidate's complexity claim survives execution — the failure mode the dimension exists to catch (a subtly-wrong complexity-class assertion that re-reasoning would echo back as confirmation) did not fire here.

---

## Step 6 — Synthesis

Operational scoring **skipped** — Step 0 did not run, so the `--skip-ops-scoring` decision is moot; default behavior for algorithmic-only synthesis is to skip operational dimensions and operational-graft hybridization (AC5).

**Algorithmic-only scoring dimensions:**
- correctness (all three pass): tied
- timeComplexity: paths 1 and 3 (O(n)) tie above path 2 (O(n log k))
- spaceComplexity: path 1 (O(k)) > path 3 (O(n)) > path 2 (O(k))
- implementationComplexity: path 1 (~10 lines) > path 2 (~25 lines) > path 3 (~20 lines)
- **executionScore (new): all-pass** — adds confidence; would have downgraded any path that failed stress.

**Recommendation:** Path 1 (monotonic deque, O(n)). The dominant choice on time, space, and implementation simplicity; execution-backed.

---

## Step 7 — Proposal

Default for algorithmic domain: **no proposal written** (AC7). Recommendation is delivered inline in the conversation; the user can pass `--proposal` to force-write if they want a persistent artifact.

---

## What this example demonstrates

- **AC1 (execution phase):** Subagents produced `implementation` fields; the harness ran all three against a shared test set including a stress case that would have caught a subtly-wrong complexity claim. The execution dimension is the only one that can catch a complexity-analysis error the primary agent would otherwise re-validate by re-reasoning along the same wrong lines.
- **AC4 (complexity-class diversity):** Anti-overlap rejected lookalike `(paradigm, structure, strategy)` tuples in favor of genuinely different `(targetComplexity, invariantChoice)` pairs. Paths 1 and 3 share complexity but differ on invariant — both kept; cosmetic-only duplicates would have been pruned.
- **AC7 (proposal default):** Domain detected as algorithmic → no proposal written by default.
- **AC15 (argument-hint frontmatter):** This example was invoked with no flags; all defaults (default-on execution, default-off keyword confirmation, default-off proposal for algorithmic) come from the documented Options table.
