# CHORUS — Cross-Team Roadmap Conflict (Platform vs Product vs SRE)

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-chorus 1.0.0
- **Situation:** Internal three-team conflict over Q3 roadmap allocation. Platform team has a major infrastructure migration; Product wants new-feature velocity; SRE has accumulated reliability debt and needs cycles. Engineering leadership has to allocate the 9-engineer-quarter budget.
- **Session type:** organizational
- **Stakeholders:** the-platform-team, the-product-team, the-sre-team, the-engineering-vp
- **Deprioritized:** none

---

## Situation

Engineering leadership has 9 engineer-quarters to allocate across Q3. Three internal teams have competing claims:
- **Platform** wants 5 engineer-quarters for a Postgres-to-CockroachDB migration that unblocks multi-region.
- **Product** wants 5 engineer-quarters for three new-feature launches tied to commit-charts and Q4 revenue.
- **SRE** wants 4 engineer-quarters for reliability debt cleanup (alert noise, runbook automation, on-call burden).

Asks total 14 against a 9-budget. The Engineering VP has to allocate.

---

## Stakeholders

### the-platform-team

```json
{
  "role": "the-platform-team",
  "characterization": "Platform engineering team owning the multi-region infrastructure migration",
  "interests": [
    "Complete the migration before the contracted multi-region SLA goes into effect Q4",
    "Avoid the operational risk of running production on a half-migrated state for >1 quarter",
    "Establish platform as the strategic delivery axis (vs. feature-team-aligned)"
  ],
  "statedPositions": ["5 engineer-quarters allocated to Postgres-to-CockroachDB migration"],
  "batna": "Run a partial migration in Q3 with 3 engineer-quarters; carry remaining work into Q4 with operational risk; renegotiate the multi-region SLA",
  "reservationPoint": "Less than 3 engineer-quarters is unworkable — would leave migration state half-done across the quarter boundary",
  "tradeableConcessions": [
    "Accept 4 engineer-quarters with a stretch goal rather than 5 fixed",
    "Phase the migration so the most-critical-shard moves in Q3 and the rest in Q4",
    "Take on SRE's alert-noise cleanup as part of the migration scope (the migration replaces the alert-prone Postgres setup)"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-sre-team", "alignmentBasis": "Migration eliminates one of SRE's largest alert-noise sources — partial alignment on outcome" }
  ],
  "steelManTier": "strong",
  "rationale": "Platform's contractual SLA deadline is a real constraint — the migration is not a 'platform's preference' but a commitment that frames the conversation. The strongest steel-man surfaces this as a non-negotiable timeline anchor."
}
```

### the-product-team

```json
{
  "role": "the-product-team",
  "characterization": "Product engineering team owning Q3 feature launches tied to Q4 revenue commitments",
  "interests": [
    "Ship three new-feature launches that have been pre-committed to specific Q4 revenue forecasts",
    "Avoid the perception that product velocity has slowed",
    "Maintain customer-facing competitive position against two named competitors who released similar features last quarter"
  ],
  "statedPositions": ["5 engineer-quarters across three feature launches"],
  "batna": "Cut the smallest of the three features (the analytics-export feature is the smallest and least-customer-requested); ship the other two with 3.5 engineer-quarters",
  "reservationPoint": "Less than 3 engineer-quarters drops two of three features and breaks the revenue commitment",
  "tradeableConcessions": [
    "Accept 4 engineer-quarters with a tighter scope on the analytics-export feature",
    "Defer the third feature (analytics-export) to Q4 if SRE and platform commit to NOT eating into Q4 product budget",
    "Use one engineer-quarter for SRE-pairing on the most-fragile feature surface (a partial coalition with SRE)"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-engineering-vp", "alignmentBasis": "Revenue commitment is shared concern — vp owns it at the exec level" }
  ],
  "steelManTier": "strong",
  "rationale": "Product's revenue commitment is the strongest framing — features are not 'preferences', they're pre-committed deliverables. The reservation point is honest (3 engineer-quarters is the breaking point); the BATNA (cut the smallest feature) shows real flexibility."
}
```

### the-sre-team

```json
{
  "role": "the-sre-team",
  "characterization": "SRE team carrying accumulated reliability debt and on-call burden",
  "interests": [
    "Reduce on-call burden — current pager rate is 2.3x the target, leading to attrition risk",
    "Automate the most-frequent manual runbook actions (cluster restart, certificate rotation, log aggregation)",
    "Avoid carrying reliability debt across another quarter — the longer it accumulates, the harder the eventual cleanup"
  ],
  "statedPositions": ["4 engineer-quarters for reliability debt cleanup"],
  "batna": "Carry the debt forward to Q4 with rising on-call burden; one or two SRE attritions are likely if pager rate doesn't drop",
  "reservationPoint": "Less than 2 engineer-quarters is insufficient to make material progress — pager rate stays at 2.3x and attrition risk crystallizes",
  "tradeableConcessions": [
    "Accept 2 engineer-quarters if the platform migration scope explicitly removes the alert-prone Postgres surface (a coalition with platform)",
    "Pair an SRE on a product feature in exchange for product-team-time on runbook automation (a coalition with product)",
    "Defer the manual-runbook-automation work to Q4 if the platform migration is fully resourced and reduces pager rate to <1.5x as a side effect"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-platform-team", "alignmentBasis": "Migration removes one of SRE's largest alert-noise sources" },
    { "alignedWith": "the-product-team", "alignmentBasis": "Pairing arrangement helps both teams (SRE reduces feature-related pages; product gets stability-aware design)" }
  ],
  "steelManTier": "strong",
  "rationale": "SRE's interests connect to both other teams' work — the migration eliminates one alert source; the product features can incorporate SRE-pairing. Two-coalition signal is the strongest negotiating position; the BATNA (attrition risk) is a credible non-tactical constraint."
}
```

### the-engineering-vp

```json
{
  "role": "the-engineering-vp",
  "characterization": "Engineering VP who owns the 9-engineer-quarter allocation decision",
  "interests": [
    "Hit Q4 revenue commitments (product features must ship)",
    "Honor the contracted multi-region SLA (platform migration must complete or partially complete)",
    "Avoid SRE attrition — replacement cost and ongoing reliability cost both significant",
    "Surface and address the structural problem (asks total 14 vs 9 budget — symptom of upstream over-commitment)"
  ],
  "statedPositions": ["TBD — depends on the trade frontier and coalition signals from the three teams"],
  "batna": "Default to a 4-4-1 or 4-3-2 split based on intuition; risk one of the three teams missing their non-negotiable threshold",
  "reservationPoint": "Cannot allocate above 9 engineer-quarters; cannot drop any team below its reservation point without explicit acknowledgement of the cost",
  "tradeableConcessions": [
    "Will surface the structural over-commitment to the exec team — adjust Q4 revenue commitments, Q4 product roadmap, or hire to address",
    "Will commit to NOT eating into Q4 product budget for migration work (helps product accept Q3 deferrals)",
    "Will adjust on-call rotation to reduce immediate SRE burden during Q3 even if cycles are not allocated"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-product-team", "alignmentBasis": "Shared accountability for Q4 revenue commitments" }
  ],
  "steelManTier": "strong",
  "rationale": "The VP's strongest framing is meta: the asks-vs-budget delta IS the conversation, not the allocation itself. Surfacing the structural over-commitment is the real value-add of the VP role in the negotiation."
}
```

---

## Mediator Landscape

```json
{
  "zopa": {
    "status": "populated",
    "overlaps": [
      { "issue": "platform allocation", "overlapDescription": "3-4 engineer-quarters bridges platform's reservation point and product's tolerance for partial migration" },
      { "issue": "product allocation", "overlapDescription": "3-4 engineer-quarters bridges product's reservation point and the budget delta" },
      { "issue": "SRE allocation", "overlapDescription": "2 engineer-quarters with platform-migration alert-noise reduction as offsetting value" }
    ]
  },
  "tradeFrontier": {
    "status": "populated",
    "trades": [
      { "giveUp": { "stakeholder": "the-platform-team", "concession": "accept 4 engineer-quarters phased (most-critical-shard Q3, rest Q4)" }, "inExchangeFor": { "stakeholder": "the-engineering-vp", "concession": "VP commits Q4 multi-region milestone with explicit Q4 cycles" } },
      { "giveUp": { "stakeholder": "the-product-team", "concession": "defer analytics-export feature to Q4; accept 3.5 engineer-quarters" }, "inExchangeFor": { "stakeholder": "the-engineering-vp", "concession": "VP commits to NOT eating into Q4 product budget" } },
      { "giveUp": { "stakeholder": "the-sre-team", "concession": "accept 1.5 engineer-quarters with platform-migration alert-noise reduction as primary deliverable" }, "inExchangeFor": { "stakeholder": "the-platform-team", "concession": "platform team takes on alert-prone Postgres surface cleanup as migration scope" } },
      { "giveUp": { "stakeholder": "the-product-team", "concession": "allocate one engineer-quarter to SRE-pairing on most-fragile feature surface" }, "inExchangeFor": { "stakeholder": "the-sre-team", "concession": "SRE provides stability-aware design review for product features" } }
    ]
  },
  "settlementZones": {
    "status": "populated",
    "ranked": [
      { "rank": 1, "outcome": "Platform 4 + Product 3.5 + SRE 1.5 = 9.0; analytics-export deferred to Q4 with VP commitment to not eat into Q4 product budget; platform takes on alert-noise cleanup as part of migration scope; product allocates one EQ to SRE-pairing", "endorsedBy": ["the-platform-team", "the-product-team", "the-sre-team", "the-engineering-vp"] },
      { "rank": 2, "outcome": "Platform 3.5 + Product 4 + SRE 1.5 = 9.0 (product gets all three features; platform phases migration deeper into Q4)", "endorsedBy": ["the-product-team"] },
      { "rank": 3, "outcome": "Platform 5 + Product 3 + SRE 1 = 9.0 (platform fully resourced; product cuts two features; SRE largely deferred)", "endorsedBy": ["the-platform-team"] }
    ]
  },
  "unresolvedConflicts": {
    "status": "populated",
    "conflicts": [
      { "description": "If the structural over-commitment is not addressed at exec level, the same conflict recurs Q4 — surface as a meta-decision, not a tactical Q3 issue", "stakeholders": ["the-engineering-vp", "the-product-team"] }
    ]
  },
  "concessionSequencing": {
    "status": "populated",
    "sequence": [
      { "order": 1, "stakeholder": "the-engineering-vp", "move": "Open with the asks-vs-budget delta as structural fact, not negotiating posture", "tests": "Whether teams will share trade space rather than maximize their own ask" },
      { "order": 2, "stakeholder": "the-platform-team", "move": "Propose phased migration (4 EQ Q3, rest Q4) with alert-noise cleanup scope expansion", "tests": "Whether SRE will trade allocation for migration-as-cleanup" },
      { "order": 3, "stakeholder": "the-sre-team", "move": "Accept reduced direct allocation in exchange for platform-as-cleanup-vehicle + product-pairing arrangement", "tests": "Whether SRE's two-coalition signal can produce a workable allocation below their stated 4 EQ" },
      { "order": 4, "stakeholder": "the-product-team", "move": "Defer analytics-export to Q4 with VP commitment to Q4 budget protection", "tests": "Whether product can clear the budget under the rank-1 settlement zone" }
    ]
  },
  "coalitionMap": {
    "status": "populated",
    "coalitions": [
      { "members": ["the-platform-team", "the-sre-team"], "alignedInterest": "migration eliminates one of SRE's largest alert-noise sources" },
      { "members": ["the-product-team", "the-sre-team"], "alignedInterest": "SRE-pairing on product features reduces fragile-feature pages and provides stability-aware design" },
      { "members": ["the-engineering-vp", "the-product-team"], "alignedInterest": "Q4 revenue commitments are shared accountability" }
    ]
  }
}
```

---

## Recommended Concession Sequence

1. **VP opens with structural framing** — asks-vs-budget is a meta-decision, not just allocation arithmetic.
2. **Platform proposes phased migration** with alert-noise cleanup scope expansion.
3. **SRE accepts reduced direct allocation** in exchange for the platform-as-cleanup arrangement + product-pairing coalition.
4. **Product defers analytics-export to Q4** with VP commitment to Q4 budget protection.
5. **VP surfaces structural over-commitment** to exec team as the lasting fix.

---

## What Would Change This Landscape

- **Q4 revenue commitment shifts** (a customer slips a deal): product's reservation point drops; rank-1 settlement zone widens.
- **Multi-region SLA deadline slips** (vendor accommodates): platform's reservation point drops; rank-3 zone weakens.
- **SRE attrition occurs mid-Q3** (any single departure): SRE's reservation point hardens; rank-1 zone becomes infeasible without VP hiring commitment.
