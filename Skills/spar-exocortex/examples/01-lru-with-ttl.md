# Worked Example: LRU Cache with TTL (algorithmic)

This example walks through a complete `/spar-exocortex` invocation on a representative algorithmic problem. Demonstrates: baseline drafting, attacker producing a complexity-blow-up input, challenger choosing a different invariant, execution-backed validation, judge decision with operational-graft applied.

---

## Problem

> "Implement an LRU cache with per-key TTL (time-to-live). Operations: `get(key)`, `set(key, value, ttlMs)`. `get` returns the value if present and not expired, else null. Expired entries are removed on access. The cache has a capacity limit; when full, evict the least recently used entry."

**Target language:** JavaScript.
**Domain detection:** algorithmic (no architectural / system-design signals).

---

## Step 1 — Baseline

```json
{
  "algorithmSketch": "Map + doubly-linked list for O(1) get/set/eviction order. Each entry stores value, expiry-timestamp, and prev/next pointers. On get/set, check expiry first; if expired, remove and return null (or set new value). Move accessed entries to the head of the list.",
  "targetComplexity": "O(1)",
  "invariantChoice": "Linked list maintained on every access; TTL checked lazily on access only",
  "targetLanguage": "js",
  "implementation": "function makeCache(capacity) { /* Map + DLL implementation */ const map = new Map(); /* ... */ return { get, set }; }"
}
```

---

## Step 2 — Attacker

```json
{
  "inputType": "complexity-blow-up",
  "failingInput": "[{ \"op\": \"set\", \"key\": \"k\" + i, \"value\": i, \"ttlMs\": 1 } for i in 1..N=10000] followed by a long pause, then [{ \"op\": \"get\", \"key\": \"newkey\" }]",
  "expectedVsActual": {
    "expected": "O(1) per operation",
    "actual": "Lazy expiry-on-access means the final get does no cleanup work, BUT the next set after the pause triggers eviction which scans the linked list looking for least-recently-used. If all 10000 entries are expired, the eviction scan touches every expired entry to evict one — O(N) on a single operation."
  },
  "argumentWhyBreaks": "The baseline's lazy TTL invariant — 'TTL checked only on access' — interacts pathologically with capacity eviction: expired entries clutter the LRU list, and eviction scans linearly through expired entries until it finds one to remove. A wave of short-TTL inserts followed by a single later operation triggers an O(N) hit."
}
```

---

## Step 3 — Challenger

```json
{
  "targetComplexity": "O(1) amortized",
  "invariantChoice": "Eager TTL — a min-heap of (expiry-timestamp, key) is maintained alongside the LRU list; expired entries are removed at every operation (heap-pop while top.expiry < now), bounding the cleanup work per call",
  "targetLanguage": "js",
  "implementation": "function makeCache(capacity) { /* Map + DLL + min-heap of expirations */ /* on every get/set: while (heap.peek().expiry < now) { evict heap.pop(); } */ return { get, set }; }",
  "argumentWhyResists": "By eagerly cleaning expired entries via the min-heap at every call, the eviction path never encounters a wall of expired entries — they were already removed. The min-heap pops amortize: a 10000-insert wave gets cleaned across 10000 subsequent operations, each amortized O(1).",
  "addressesAttack": true
}
```

---

## Step 4 — Execution

The harness runs both implementations against:
- **standard:0–4**: typical get/set sequences
- **attacker**: the 10000 short-TTL inserts followed by single get
- **edge: empty-cache get**, **edge: get after TTL expiry**, **edge: capacity-1 cache**

Sample results table:

| Candidate | Case | Outcome | wallClockMs |
|---|---|---|---|
| baseline | standard:0 | pass | 1 |
| baseline | standard:1 | pass | 1 |
| baseline | standard:2 | pass | 2 |
| baseline | attacker | pass | 312 |
| baseline | edge:expired-get | pass | 1 |
| challenger | standard:0 | pass | 2 |
| challenger | standard:1 | pass | 2 |
| challenger | standard:2 | pass | 3 |
| challenger | attacker | pass | 18 |
| challenger | edge:expired-get | pass | 1 |

Both pass correctness; baseline's `attacker` case takes ~17× longer than challenger's (the complexity-blow-up the attacker predicted).

---

## Step 5 — Judge

```json
{
  "decision": "endorse-challenger",
  "decisiveResult": "challenger's wallClockMs on 'attacker' case (18ms) vs baseline's (312ms) is a 17x ratio; the gap is a direct consequence of the lazy-vs-eager TTL invariant and would widen further with longer wave inputs. Both pass correctness; the operational difference is decisive.",
  "operationalGraft": {
    "applicable": true,
    "wins": ["simplicity", "transparency"],
    "grafts": [
      "Baseline's lazy-only-on-access TTL is simpler to read and explain — graft the lazy fallback into challenger as a safety check when the heap and map diverge (defensive — should not happen, but cheap to keep).",
      "Baseline's no-heap design is more transparent in worst-case-bound discussion — graft challenger's documentation to explicitly call out the amortization argument so future readers don't assume O(1) strict-worst-case."
    ]
  }
}
```

---

## Decision

**Challenger wins.** The decisive evidence is the wall-clock measurement on the attacker's input; the operational-graft recognizes that baseline's simpler invariant has documentation and defensive-coding value worth preserving in the challenger's design.

---

## What this example demonstrates

- **Concrete attacker input** (a specific sequence with named counts) is what makes the test executable. A verbal "this might blow up on long TTL waves" would have failed validation.
- **Anti-overlap via invariantChoice** (lazy vs eager TTL) is the load-bearing diversity, not paradigm labels.
- **Execution-backed decision** — the judge has wallClockMs in hand and points at a specific ratio. No re-reasoning required.
- **Operational-graft hybridization** catches the "winner-on-architecture but loser-on-{simplicity,transparency}" case: challenger wins, but baseline's invariant has docs / defensive-coding value.
