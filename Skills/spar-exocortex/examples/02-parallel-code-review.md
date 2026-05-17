# Worked Example: Parallel Code-Review Architecture (architecture)

This example walks through a `/spar-exocortex` invocation on a system-design problem. Demonstrates: baseline with operational assumptions, attacker producing an operational-failure scenario (not raw input), challenger choosing a different invariant, and an ops-critical decision where operational-graft surfaces a real loser-wins-on-cost answer.

---

## Problem

> "Design a parallel code-review pipeline: N reviewer agents work over a shared file pool, each claiming files atomically. Requirements: no file reviewed twice; no file starves; a reviewer crash doesn't block the pool; latency budget is 10 minutes for 100 files; budget for $50/run."

**Target language:** Python (the harness will simulate via a small concurrency model).
**Domain detection:** architecture (system-design signals: "parallel", "shared pool", "atomic claim", "starvation", "latency budget", "$50/run"). **Ops-critical: true** (production-system signals).

---

## Step 1 — Baseline

```json
{
  "algorithmSketch": "Central work-queue (FIFO) protected by a lock. Each reviewer pulls one file at a time, acquires the queue lock, dequeues, releases the lock, processes, and repeats. Crash recovery: a watchdog re-enqueues any file that hasn't reported done within 2× the per-file p95 latency.",
  "targetComplexity": "O(1) per file claim (queue dequeue under lock)",
  "invariantChoice": "Centralized queue with watchdog-based crash recovery; lock contention bounded by N reviewers",
  "targetLanguage": "python",
  "implementation": "class Pool:\n    def __init__(self, files): self.q = list(files); self.lock = Lock(); self.in_flight = {}\n    def claim(self, reviewer_id): with self.lock: ...",
  "operationalAssumptions": [
    "Reviewer process count is small (N < 20) so lock contention is bounded",
    "Per-file processing time is roughly uniform across files",
    "Watchdog re-enqueues are rare (crashes are rare)"
  ]
}
```

---

## Step 2 — Attacker (operational-failure)

```json
{
  "inputType": "operational-failure",
  "failingInput": {
    "scenario": "Slow reviewer + watchdog-induced duplicate work: reviewer A claims file F (200KB, takes 3 minutes — well within the 6-minute watchdog threshold). At minute 2, reviewer A's TCP connection to the LLM API stalls for 90 seconds (transient). Watchdog at minute 4 hasn't seen heartbeat, presumes A crashed, re-enqueues F. Reviewer B picks up F. A's connection recovers at minute 3.5 mark of its own clock — A is now duplicating B's work.",
    "trigger": "Slow reviewer A (network stall) + watchdog timeout shorter than max realistic latency → re-enqueue + duplicate-review violation. Specifically: per-file p95 = 90s, watchdog = 180s, but A hit a 90s stall pushing total time to 270s — exceeds watchdog, triggers re-enqueue while A is still alive."
  },
  "expectedVsActual": {
    "expected": "Each file reviewed exactly once",
    "actual": "File F reviewed twice — once by A (results possibly out-of-date by the time A completes), once by B. The result-aggregation layer has to deduplicate. If results are written to disk by both, last-writer-wins overwrites the other — depending on completion order, the result could be a stale review."
  },
  "argumentWhyBreaks": "The watchdog's 'crashed-or-just-slow?' decision is timer-based and cannot distinguish a stall from a crash. Setting the watchdog higher reduces duplicates but increases p99 latency on real crashes (slow recovery). Setting it lower increases duplicates. The fundamental issue is that crash-detection from outside cannot be precise; the invariant 'reviewed exactly once' is enforced by timer math, not by structural guarantee."
}
```

---

## Step 3 — Challenger

```json
{
  "targetComplexity": "O(1) per file claim",
  "invariantChoice": "Append-only claim log + idempotent review writes; no watchdog. Each reviewer appends a claim record to a shared log before processing; another reviewer can claim the same file but its result-write is idempotent (keyed by (file, reviewer-id) so deduplication is structural at the read side). Crash recovery is implicit: a crashed reviewer's in-flight claim simply has no corresponding result-write, and an idle reviewer claims it via a 'no-result-for-N-seconds' rule.",
  "targetLanguage": "python",
  "implementation": "class Pool:\n    def __init__(self, files): self.claims_log = []; self.results = {}; self.lock = Lock()\n    def claim(self, reviewer_id, t_now): ...",
  "argumentWhyResists": "By making the result-write idempotent (keyed by (file, reviewer-id)) and removing the watchdog, the failure mode the attacker described cannot produce a stale-result-overwrite: even if two reviewers process the same file, both results are written under different keys and the aggregation layer picks the most recent. Furthermore, the 'no-result-for-N-seconds' claim rule replaces the timer-based watchdog with a data-driven recovery — a reviewer that sees no result yet for a file > N seconds old can claim it without triggering re-claims of slow-but-alive reviewers, because the original claim is still in the log (no eviction) and the slow reviewer's eventual write doesn't conflict.",
  "addressesAttack": true,
  "operationalAssumptions": [
    "Result storage allows compound keys (file, reviewer-id)",
    "Aggregation layer dedups by file and picks the latest by claim-timestamp",
    "Idle-reviewer claim-without-result rule's N is tuned higher than p99 latency (no false re-claims on slow reviewers)"
  ]
}
```

---

## Step 4 — Execution (simulated)

Per-case execution simulates 100 files × N=10 reviewers with seeded latency distribution + injected stalls. The harness runs both baseline (with watchdog) and challenger (idempotent log) against:

- **standard:no-crashes**: baseline scenario, all reviewers healthy
- **standard:one-crash**: reviewer 5 crashes at file 30; expected = no duplicates, no losses
- **attacker:slow-stall**: reviewer A's 90s stall scenario as described above
- **edge:cascade-stalls**: three reviewers each stall in sequence
- **edge:N=1**: single reviewer (trivial case)
- **edge:N=100**: high contention

Results: both pass `standard:no-crashes`. Baseline fails `attacker:slow-stall` (duplicate review of file F; assertion 'each file reviewed exactly once' violated). Challenger passes attacker:slow-stall (two reviews recorded but dedupe at aggregation picks the canonical one, so the assertion's "reviewed exactly once at the aggregation layer" holds).

Latency: baseline has lower mean latency by ~12% in no-crash cases (lock contention is bounded; watchdog overhead is zero in happy path). Challenger has higher mean latency due to result-write going to a richer storage layer.

---

## Step 5 — Judge (ops-critical)

```json
{
  "decision": "endorse-challenger",
  "decisiveResult": "challenger passed attacker:slow-stall scenario (no duplicate-review-overwrite at aggregation layer) where baseline failed. The failure mode the attacker named is real for production network behavior. Latency degradation (12%) is within the 10-minute budget; cost stays within $50/run.",
  "operationalGraft": {
    "applicable": true,
    "wins": ["cost", "transparency"],
    "grafts": [
      "Baseline's centralized queue is cheaper to operate (no idempotent-storage requirement, no compound-key aggregation) — graft into challenger by making the idempotent-log a runtime option, defaulting to off for cost-sensitive deployments where the stall-rate empirically stays below 0.1%.",
      "Baseline's watchdog-timer is more transparent (one tunable: the watchdog interval) — graft into challenger's claim-log-eviction rule documentation by exposing the 'no-result-for-N-seconds' rule as a single tunable, the same way the watchdog is tuned in baseline."
    ]
  }
}
```

---

## Decision

**Challenger wins, with graft.** The decisive evidence is the attacker:slow-stall execution result. Operational-graft surfaces two real wins for the loser: baseline's centralized design is cheaper to operate and more transparent — both grafted into challenger's design as runtime options and documentation.

---

## What this example demonstrates

- **`inputType: operational-failure`** uses the `scenario + trigger` object form for `failingInput`, not a string. Verbal-only criticism ("watchdogs can race") would have failed validation; the concrete scenario (90s stall vs 180s watchdog) is what makes the failure mode executable.
- **Anti-overlap via invariantChoice** (centralized queue + watchdog vs append-only log + idempotent writes) is the deep diversity, not different lock implementations.
- **Operational-graft is load-bearing for ops-critical problems** — challenger wins the correctness bet, but baseline wins on cost and transparency. The final design includes both wins.
- **Execution-backed under simulation** — the harness models concurrency + crash scenarios so the judge sees concrete pass/fail rather than reasoning about whether the watchdog race "could" happen.
