# Worked Example: Rate Limiter Architecture (architecture — operational scoring default-on)

Demonstrates **operational scoring default-on** (AC5) and **proposal default-on** (AC7) when Step 0 (context gathering) ran. Execution is `--no-execution` for an architecture decision — the candidate code path isn't a single function whose complexity execution would meaningfully validate.

---

## Problem

> "Our payments API has bursty traffic. We need a rate limiter that survives traffic spikes (legitimate during marketing campaigns), blocks abusive clients quickly, and survives a single-region failure without locking out all customers. The API runs on Kubernetes across two regions. Average traffic 5k rps, peak 50k rps."

**Target language:** Not applicable — architectural decision.
**Domain detection:** architecture — keywords `Kubernetes`, `API`, `regions`, `infrastructure` triggered Step 0.

---

## Step 0 — Context Gathering (ran)

Loaded skills (selected from `skill-context-map.json` against detected keywords):
- `codebase-analysis` — found existing Redis cluster (3 replicas, single region), Express handlers, Kubernetes manifests under `k8s/`
- `error-handling-patterns` — current code uses unbounded retry loops with exponential backoff (relevant for what happens when the limiter says "no")
- `anti-pattern-analysis` — flagged the existing single-region Redis as a coupling point

**Constraints surfaced:**
- Per-tenant limits required (some customers have negotiated higher quotas)
- 50ms p99 budget for the limiter decision (current Express handlers fit a ~150ms total budget)
- Active-active across two regions

---

## Step 1 — Keywords + Signal Match

Keywords (extracted + enriched from Step 0 context):
```
rate limiting, traffic spike, abuse blocking, per-tenant quota, multi-region, active-active, redis, latency budget, Kubernetes
```

Confirmation gate skipped (default-off).

Signal match yields top scores:
```
paradigms:   system-architecture=0.85, data-and-service-design=0.55
structures:  infrastructure-component=0.95, data-and-telemetry-layer=0.40
strategies:  system-evolution-and-trade-off=0.80, eager-vs-lazy-evaluation=0.45
```

(Slim catalog — pre-2026-05-16 this would have produced separate `scaling-architecture`, `cache-architecture`, `consistency-trade-off`, etc. matches; the new umbrella families consolidate while preserving sub-variant fidelity inside the loaded entries.)

---

## Step 3 — Path Selection (N=3)

| Path | Paradigm | Structure | Strategy | targetComplexity / invariantChoice |
|---|---|---|---|---|
| 1 | system-architecture | infrastructure-component | system-evolution-and-trade-off | Strict consistency — single-region Redis with cluster-wide counter; consensus on each decrement |
| 2 | system-architecture | infrastructure-component | eager-vs-lazy-evaluation | Local token bucket per pod + periodic CRDT-style merge across pods/regions; eventually-consistent quotas |
| 3 | data-and-service-design | infrastructure-component | system-evolution-and-trade-off | Edge-tier limiting (CloudFlare/Envoy) for coarse filtering + per-region Redis for fine-grained per-tenant quotas |

All paths satisfy complexity-class anti-overlap: each has a distinct `invariantChoice` (strict consistency / eventual consistency with merge / two-tier delegation).

---

## Step 5 — Subagent Reports (slot-filled briefs, parallel dispatch)

Each subagent returns:
```
{ approach, tradeoffs[], operationalScoreDimensions: {testability, observability, costToOperate, runtimeFootprint}, implementation }
```

For an architecture decision, `implementation` is a pseudo-code-with-stubs sketch — enough for a reader to see the shape of the solution, not a runnable function. `--no-execution` is set; the execution phase is skipped (AC1's flag-gating).

---

## Step 6 — Synthesis with Operational Scoring (default-on per AC5)

Because Step 0 ran (architecture domain), operational scoring is **default-on**. The four operational dimensions are scored for each path, and the `operational-graft` hybridization check fires.

### Architectural scores

| Dimension | Path 1 (strict) | Path 2 (CRDT) | Path 3 (two-tier) |
|---|---|---|---|
| Correctness (semantic match) | strong | good | strong |
| Coupling | tight to Redis | loose | medium |
| Extensibility | low | high | high |
| Failure mode | hard fail on Redis outage | soft degradation | edge layer absorbs single-region outage |

### Operational scores (the new default-on layer)

| Dimension | Path 1 | Path 2 | Path 3 |
|---|---|---|---|
| **Testability** | medium — single-region integration test is realistic | medium-low — CRDT merge requires multi-replica test harness | high — edge layer and per-region Redis test independently |
| **Observability** | medium — Redis ops metrics, but limiter-specific signal needs work | high — local counters per pod naturally emit per-pod telemetry | high — two layers each expose their own metrics with explicit hand-off |
| **Cost to operate** | high — strict consistency costs cross-region round-trips on every decision | medium — local + periodic merge | medium-high — edge CDN cost + two Redis fleets |
| **Runtime footprint** | medium — single Redis cluster | small per-pod overhead, complex when scaling cluster | larger but each layer is independently scalable |

### Operational-graft check

The `operational-graft` rule looks for: *"Path A wins on the architectural dimensions but Path B wins on the operational dimensions — is there a hybrid?"* This is the skill's most-cited finding.

Here, Path 1 wins on **strict-consistency correctness** (an important architectural property for billing-adjacent quotas), while Path 3 wins on **testability, observability, and failure-mode independence**.

**Hybrid proposed:** Path 3's edge-tier + per-region structure with Path 1's strict-consistency contract reserved for the per-tenant cost-bearing decisions. Coarse rate-limiting at the edge layer is eventually-consistent (cheap, fast, soft degradation under load); fine-grained per-tenant quota enforcement against billing-impacting limits uses Path 1's strict-consistency Redis check, but only for the small fraction of traffic that crosses the negotiated-quota threshold.

This hybrid scores better than any single path: it captures Path 3's operational properties on the hot path and Path 1's correctness guarantee where it actually matters (rare billing-impacting decisions).

---

## Step 7 — Proposal (default-on for architecture per AC7)

Because Step 0 ran (architecture domain), the proposal is written by default. `Proposal/EXO-rate-limiter-architecture.md` captures:
- The three paths considered, with their architectural + operational scores
- The hybrid recommendation and *why* (the operational-graft finding)
- Context surfaced by Step 0 (existing Redis cluster, 50ms p99 budget, multi-region active-active constraint)
- Trade-offs the team accepted by choosing the hybrid

The proposal serves as a persistent artifact because architectural decisions affect long-lived infrastructure — unlike algorithmic recommendations, which are self-contained in the conversation.

---

## What this example demonstrates

- **AC5 (operational scoring default-on):** Because Step 0 ran, the four operational dimensions were scored automatically and the `operational-graft` hybridization check fired. The hybrid recommendation depends on the operational dimensions — without default-on operational scoring, the synthesis would have recommended Path 1 (strongest on architectural correctness) and missed the cheaper, more-resilient hybrid that captures the same correctness guarantee on a smaller fraction of traffic.
- **AC7 (proposal default-on for architecture):** Domain detected as architecture → proposal written by default to `Proposal/EXO-{slug}.md`. Long-lived infrastructure decisions warrant a persistent artifact.
- **AC1 / AC2 (execution preflight under `--no-execution`):** Operator passed `--no-execution` — execution preflight skipped, adapter enumeration not required for this architecture problem. The execution layer remains dormant.
- **AC8 (slim catalog in action):** Two umbrella families (`system-architecture`, `data-and-service-design`) provided the routing scaffolding; sub-variant detail (Kubernetes pods, Redis cluster, CRDT merge semantics) came from the subagents' own training rather than from a 31-paradigm taxonomy.
