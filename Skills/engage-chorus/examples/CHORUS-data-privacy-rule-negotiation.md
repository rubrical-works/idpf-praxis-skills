# CHORUS — State-Level Data Privacy Rule Negotiation

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-chorus 1.0.0
- **Situation:** State legislature is drafting a consumer data-privacy rule. Industry coalition wants narrow scope; consumer advocacy wants broad scope; regulator wants enforceable rule; small-business coalition wants compliance carve-outs.
- **Session type:** policy
- **Stakeholders:** the-industry-coalition, the-consumer-advocate, the-state-regulator, the-small-business-coalition
- **Deprioritized:** none

---

## Situation

A US state legislature is drafting a comprehensive consumer data-privacy rule. The bill is in committee. Four organized stakeholder groups are participating in committee testimony. Compromise is feasible, but each party's reservation points are real.

---

## Stakeholders

### the-industry-coalition

```json
{
  "role": "the-industry-coalition",
  "characterization": "Trade association representing the state's largest tech and retail businesses",
  "interests": [
    "Avoid a state-by-state patchwork that raises multi-state compliance cost",
    "Limit private right of action (which would invite litigation)",
    "Preserve targeted-advertising business models that depend on cross-site behavioral data"
  ],
  "statedPositions": ["Narrow scope (transaction data only); 24-month compliance window; preemption of local ordinances; no private right of action"],
  "batna": "Lobby for the bill to die in committee; if it passes, prepare to litigate the broadest provisions; in a 2-year timeline this may be more expensive than compliance",
  "reservationPoint": "No private right of action is non-negotiable; compliance window <12 months walks the table",
  "tradeableConcessions": [
    "Accept broader behavioral-data scope IF private right of action is limited to attorney-general enforcement only",
    "Accept tighter compliance window (15-18 months) IF small businesses get carve-outs that don't apply to large companies",
    "Accept opt-in for sensitive-category data (health, location) IF general behavioral data remains opt-out",
    "Drop preemption-of-local-ordinances ask in exchange for stronger preemption of inconsistent future state rules"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-small-business-coalition", "alignmentBasis": "Both prefer carve-outs over no rule — though for different reasons (industry wants attention on small-business asymmetry; small-business wants survival)" }
  ],
  "steelManTier": "strong",
  "rationale": "Industry's strongest framing is the multi-state patchwork cost, not the individual rule's content. The reservation point on private right of action is honestly drawn (litigation exposure is the largest tail risk)."
}
```

### the-consumer-advocate

```json
{
  "role": "the-consumer-advocate",
  "characterization": "Consumer privacy advocacy coalition (state ACLU + state EFF + named consumer organizations)",
  "interests": [
    "Establish a meaningful private right of action — without it, the rule depends entirely on AG enforcement capacity",
    "Cover behavioral data, not just transaction data — the surveillance economy operates on behavioral signals",
    "Set a precedent that state legislatures will not be deterred by federal-preemption threats"
  ],
  "statedPositions": ["Broad scope (all personal data including behavioral); private right of action with statutory damages; 12-month compliance window; opt-in for sale-of-data"],
  "batna": "Run a ballot initiative — slower (18-24 months), higher-risk (public vote), but produces a stronger rule with less compromise; signal-effect to other states is similar",
  "reservationPoint": "Behavioral-data coverage is non-negotiable; some form of private right of action is non-negotiable (AG-only enforcement is the weak floor)",
  "tradeableConcessions": [
    "Accept AG-enforcement-only IF statutory damages are high enough to be a credible deterrent",
    "Accept 18-month compliance window IF small-business carve-outs are narrowly scoped (e.g., <$10M revenue + <50K consumer records)",
    "Accept opt-out for general behavioral data IF opt-in is required for sensitive-category data (health, location, race/ethnicity proxies)",
    "Drop the broadest preemption-of-local-ordinances objection in exchange for stronger consumer-notification requirements"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-state-regulator", "alignmentBasis": "Shared interest in an enforceable rule (consumer side wants private right; regulator wants the AG-enforcement option to actually work)" }
  ],
  "steelManTier": "strong",
  "rationale": "Consumer advocacy's BATNA (ballot initiative) is real and the threat is credible — past initiatives in similar states have passed. The reservation points are honestly drawn at behavioral-data coverage and some-form-of private right, not at maximalist positions."
}
```

### the-state-regulator

```json
{
  "role": "the-state-regulator",
  "characterization": "State Attorney General's office representing the enforcement perspective",
  "interests": [
    "Produce a rule with clear, enforceable standards — vague rules generate complaints the office cannot process",
    "Avoid being the sole enforcer of a complex rule the office is not resourced for",
    "Build the rule with adequate enforcement triggers that don't require complaint-volume-based prioritization"
  ],
  "statedPositions": ["Clear, narrowly-scoped definitions with strong enforcement mechanisms; at minimum AG enforcement plus optional administrative penalty regime"],
  "batna": "Take the bill as enacted and prioritize enforcement on the most clearly-defined provisions; let the unclear provisions go unenforced — produces a weak rule in practice",
  "reservationPoint": "Cannot support a rule without enforcement-clarity language; cannot support being sole enforcer of behavioral-data provisions without dedicated funding",
  "tradeableConcessions": [
    "Accept limited private right of action (e.g., for clear breach categories only) to ease enforcement burden",
    "Accept narrower scope (e.g., behavioral data covered only for entities above $50M revenue) in exchange for enforcement-clarity language",
    "Accept longer compliance window (18 months) IF the rule includes a rule-making provision allowing the AG to issue interpretive guidance on disputed provisions",
    "Support small-business carve-outs IF the carve-out comes with a registration requirement that gives the AG visibility into the small-business population"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-consumer-advocate", "alignmentBasis": "Shared interest in enforceable rule (regulator's enforcement-clarity language complements consumer's private-right ask)" }
  ],
  "steelManTier": "strong",
  "rationale": "Regulator's strongest framing is operational — vague rules and under-resourced enforcement produce paper rules. The BATNA (selective enforcement of clear provisions only) is honest about resource constraints."
}
```

### the-small-business-coalition

```json
{
  "role": "the-small-business-coalition",
  "characterization": "State small-business chamber + named industry-specific associations (retail, restaurants, professional services)",
  "interests": [
    "Avoid compliance costs that disproportionately burden small businesses relative to revenue",
    "Avoid documentation requirements that require legal counsel for routine operations",
    "Avoid being a regulatory test case for ambiguous provisions"
  ],
  "statedPositions": ["Compliance carve-out for businesses below $10M revenue AND below 50K consumer records; 24-month compliance window for the rest"],
  "batna": "Lobby for sectoral exemptions (restaurants, retail, professional services) post-passage — slower and uncertain, but precedent exists in other states",
  "reservationPoint": "Some carve-out form is non-negotiable; without it, small businesses cannot afford compliance and the coalition opposes the bill outright",
  "tradeableConcessions": [
    "Accept a sliding-scale carve-out (full exemption below $5M + 25K records; reduced compliance burden $5-$25M; full compliance above $25M)",
    "Accept registration requirement IF it serves as the carve-out qualification mechanism (cheap; binary; verifiable)",
    "Drop the 24-month-for-all ask in exchange for the carve-out (only the carve-out tier gets the longer window)",
    "Support enforcement-clarity language IF it makes inadvertent-violation defenses available"
  ],
  "coalitionSignals": [
    { "alignedWith": "the-industry-coalition", "alignmentBasis": "Both prefer carve-outs (industry as deflection-of-attention; small-business as survival)" }
  ],
  "steelManTier": "strong",
  "rationale": "Small-business strongest framing is asymmetric burden — even a 5% compliance cost is survival-threatening for an under-$5M business. The reservation point on some-form-of-carve-out is non-negotiable; the trade space is in the carve-out's shape, not its existence."
}
```

---

## Mediator Landscape

```json
{
  "zopa": {
    "status": "populated",
    "overlaps": [
      { "issue": "scope", "overlapDescription": "Behavioral data covered for entities above a revenue threshold + opt-in for sensitive categories — bridges consumer's broad-scope ask and industry's behavioral-business-model concern" },
      { "issue": "enforcement", "overlapDescription": "AG enforcement + limited private right of action for clear breach categories — bridges consumer's private-right ask and regulator's enforcement-clarity ask" },
      { "issue": "compliance timing", "overlapDescription": "18-month window for covered entities + 24-month for carve-out tier — bridges multiple stakeholders" },
      { "issue": "small-business treatment", "overlapDescription": "Sliding-scale carve-out with registration requirement — bridges small-business reservation and regulator's visibility ask" }
    ]
  },
  "tradeFrontier": {
    "status": "populated",
    "trades": [
      { "giveUp": { "stakeholder": "the-industry-coalition", "concession": "accept behavioral-data scope for entities above $50M revenue" }, "inExchangeFor": { "stakeholder": "the-consumer-advocate", "concession": "accept AG-enforcement-only + limited private right for clear breach categories" } },
      { "giveUp": { "stakeholder": "the-consumer-advocate", "concession": "accept opt-out for general behavioral data" }, "inExchangeFor": { "stakeholder": "the-industry-coalition", "concession": "accept opt-in for sensitive-category data (health, location, race/ethnicity proxies)" } },
      { "giveUp": { "stakeholder": "the-small-business-coalition", "concession": "accept registration requirement as carve-out mechanism" }, "inExchangeFor": { "stakeholder": "the-state-regulator", "concession": "support sliding-scale carve-out structure" } },
      { "giveUp": { "stakeholder": "the-state-regulator", "concession": "support 18-month compliance window with rule-making authority for interpretive guidance" }, "inExchangeFor": { "stakeholder": "the-industry-coalition", "concession": "drop preemption-of-local-ordinances ask in exchange for stronger preemption of inconsistent future state rules" } }
    ]
  },
  "settlementZones": {
    "status": "populated",
    "ranked": [
      { "rank": 1, "outcome": "Behavioral coverage above $50M revenue; AG + limited private right for clear breaches; sliding-scale small-business carve-out with registration; 18-month window for covered + 24-month for carve-out tier; opt-out general / opt-in sensitive; rule-making authority for AG interpretive guidance", "endorsedBy": ["the-industry-coalition", "the-consumer-advocate", "the-state-regulator", "the-small-business-coalition"] },
      { "rank": 2, "outcome": "Same as rank 1 but with broader private right (statutory damages for individual breach categories) — consumer-stronger version", "endorsedBy": ["the-consumer-advocate", "the-state-regulator"] },
      { "rank": 3, "outcome": "Same as rank 1 but with AG enforcement only and no private right — industry-stronger version", "endorsedBy": ["the-industry-coalition", "the-small-business-coalition"] }
    ]
  },
  "unresolvedConflicts": {
    "status": "populated",
    "conflicts": [
      { "description": "Defining 'sensitive-category data' will involve a multi-month rulemaking after passage; the boundaries of the opt-in category will be re-litigated in administrative-law venues", "stakeholders": ["the-industry-coalition", "the-consumer-advocate"] }
    ]
  },
  "concessionSequencing": {
    "status": "populated",
    "sequence": [
      { "order": 1, "stakeholder": "the-state-regulator", "move": "Propose enforcement-clarity language + rule-making authority as the framework for the discussion", "tests": "Whether both consumer and industry will engage with operational framing rather than ideological framing" },
      { "order": 2, "stakeholder": "the-industry-coalition", "move": "Offer behavioral-data scope-above-$50M in exchange for AG-primary enforcement", "tests": "Whether consumer advocate will accept revenue-threshold scope as substitute for full coverage" },
      { "order": 3, "stakeholder": "the-consumer-advocate", "move": "Accept AG-primary + limited private right for clear breaches in exchange for opt-in on sensitive categories", "tests": "Whether industry will accept opt-in for sensitive data in exchange for opt-out on general behavioral" },
      { "order": 4, "stakeholder": "the-small-business-coalition", "move": "Accept registration-based carve-out in exchange for sliding-scale structure", "tests": "Whether the registration requirement is acceptable to small businesses as visibility mechanism" }
    ]
  },
  "coalitionMap": {
    "status": "populated",
    "coalitions": [
      { "members": ["the-consumer-advocate", "the-state-regulator"], "alignedInterest": "enforceable rule (private right complements AG-enforcement-clarity)" },
      { "members": ["the-industry-coalition", "the-small-business-coalition"], "alignedInterest": "carve-outs (industry wants asymmetric framing; small-business wants survival)" },
      { "members": ["the-state-regulator", "the-small-business-coalition"], "alignedInterest": "registration requirement (regulator visibility + small-business qualification mechanism)" }
    ]
  }
}
```

---

## Recommended Concession Sequence

1. **Regulator opens with enforcement-clarity framing** — reorients the conversation from ideological to operational.
2. **Industry offers behavioral-scope above $50M** in exchange for AG-primary enforcement.
3. **Consumer advocate accepts AG-primary + limited private right** in exchange for opt-in on sensitive categories.
4. **Small-business accepts registration-based carve-out** in exchange for sliding-scale structure.

---

## What Would Change This Landscape

- **Federal preemption legislation advances** in Congress: industry's BATNA strengthens; trade space tightens; consumer advocate's ballot-initiative threat weakens.
- **Consumer advocacy ballot initiative qualifies** for the next election: industry's reservation point softens (negotiated rule is preferable to ballot rule); rank-1 zone shifts toward stronger private right.
- **AG office gets new dedicated privacy enforcement funding**: regulator's reservation point on sole-enforcement softens; settlement zones widen.
