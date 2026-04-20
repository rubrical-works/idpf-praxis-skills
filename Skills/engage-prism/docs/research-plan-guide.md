# Research Plan Guide (Step 0)

`engage-prism` begins every run with a **research plan**. This is the
Step 0 artifact the primary agent hands to every subagent — it fixes what
they fetch and how current it must be. Scoping this well is the single
biggest lever on output quality.

See [`resources/brief-template.json`](../resources/brief-template.json) —
`researchPlan` is a required slot in every brief.

---

## The five required fields

| Field | What it is | Example |
|---|---|---|
| `entityAnchors[]` | Names, tickers, geographies, industries, products, events the question anchors on | `["Japan", "B2B SaaS", "Sansan", "freee", "Money Forward"]` |
| `sourceClasses[]` | Which source types apply to this question | `["official-statistics", "analyst-report", "regulatory-filing", "trade-press", "company-page"]` |
| `recencyWindow` | How current information must be | `"last 12 months"` |
| `authorityPreference` | Preferred authority ordering | `"primary > aggregator > opinion"` |
| `fetchBudget` | Max WebFetch / WebSearch calls per path | `5` |

All five are required. A brief missing any of them is malformed; subagents
should refuse to proceed and report back.

---

## Entity anchors

Anchors are the *nouns* the research hangs on. Name real things — named
competitors, real tickers, specific geographies, concrete product
categories. Avoid generic anchors ("the market", "our industry"). Good
anchors produce searchable queries; generic anchors produce aggregator
noise.

A competitive-analysis question typically needs 3–6 named competitors. A
market-sizing question typically needs the geography, the category, and
one or two regulators or statistics agencies. An equity / ticker question
needs the ticker, the exchange, the reporting period, and peers for
benchmarking.

---

## Source classes

The `citation-schema.json` enum lists the classes the synthesis phase
weights: `news`, `analyst-report`, `regulatory-filing`,
`earnings-transcript`, `company-page`, `trade-press`,
`official-statistics`, `industry-body`, `academic`, `review-site`,
`opinion`, `other`.

Pick the classes relevant to the question — not all of them. A
macro-trend question might lean on `official-statistics` +
`industry-body` + `academic`; a marketing-campaign post-mortem on
`company-page` + `trade-press` + `review-site`.

---

## Recency window

How fresh must the evidence be for the decision to be sound?

| Question type | Typical window |
|---|---|
| Short-term trend / news-driven | last 30 days |
| Equity / ticker around earnings | last earnings cycle |
| Market sizing | last 12 months |
| Regulatory / structural | last 24 months |
| Macro trend / 5-yr horizon | last 36 months, plus historical anchors |

Citations older than the window are **not** forbidden — they are flagged
in the recency-check phase of synthesis and their weight reduced. Use
them for historical context; do not rest current claims on them.

---

## Authority preference

The default is `primary > aggregator > opinion`. Primary: company filings,
regulator publications, official statistics, earnings transcripts.
Aggregator: analyst reports, trade press, industry bodies. Opinion:
commentary, op-eds, forum posts.

For a regulated-industry question (financial services, healthcare, energy)
you may bias even harder toward primary. For an early-signal read (e.g.,
"is enterprise AI spending inflecting") you may deliberately include
opinion and trade-press sources to surface narrative shifts.

---

## Fetch budget

Default is 3–5 fetches per path. A 3-path run at budget 5 is 15 total
fetches — enough to triangulate without drowning the context. Budgets
over 8 per path are almost always waste; if a path needs 15 fetches to
answer, the angle is too broad and should be narrowed.

---

## Worked example

**Question:** "Should we enter the Japan B2B SaaS market?"

**Plan:**

- `entityAnchors`: `["Japan", "B2B SaaS", "Sansan", "freee", "Money Forward", "METI"]`
- `sourceClasses`: `["official-statistics", "analyst-report",
  "regulatory-filing", "earnings-transcript", "trade-press"]`
- `recencyWindow`: `"last 12 months"`
- `authorityPreference`: `"primary > aggregator > opinion"`
- `fetchBudget`: `5`

**Why each choice:**

- Three named Japanese SaaS leaders let subagents ground the competitive
  landscape in real companies with filings and earnings transcripts,
  rather than generic "the market" framing.
- METI (Ministry of Economy, Trade and Industry) anchors official
  statistics on enterprise IT spend and SaaS adoption.
- 12-month window is appropriate for a market-entry decision — short
  enough to reflect current conditions, long enough to capture a full
  fiscal cycle for the named peers.
- Primary-first because an entry decision will be scrutinized; an
  aggregator-heavy evidence base will not survive due diligence.
- Budget 5 is the default; a triangulation path may need two top-down
  aggregator reads, two bottom-up primary reads, and one peer benchmark.

---

## Sparse-data unit economics

Some questions require a forward numeric projection for a target that has
**no historicals** — pre-revenue OSS monetization, greenfield product
forecasts, first-year outcome estimates for a new launch. The default
research-plan shape assumes you can ground in primary data about the
target; sparse-data questions cannot.

Handle them with the
[driver-tree-with-sparse-priors](analytical-strategies.md) strategy,
which pairs naturally with the
[comparable-benchmark](analytical-paradigms.md) paradigm. The research
plan changes shape in three specific ways.

### 1. Entity anchors: peer reference class, not the target

Instead of anchoring on the target entity, anchor on the **reference
class of comparable projects or cases** whose data will fill the leaves
of the driver tree.

```yaml
entityAnchors:
  - "Aider, Continue.dev, Cline (peer AI-dev-tool launches)"
  - "n8n, Plausible, Sentry (OSS monetization precedents)"
  - "GitHub Sponsors maintainer case studies"
```

A weak plan lists the target alone; a strong plan names 3–7 peers with
**explicit structural similarity** (same audience, same category, same
business model inflection) so the reader can audit the reference class
itself.

### 2. Source classes: founder retrospectives and peer disclosures first

Authoritative data about the target does not exist. Promote:

- `company-page` (live pricing / license / tier pages of peers)
- `trade-press` and founder retrospectives (HN / Lobsters / blog posts)
- `industry-body` surveys aggregating peer outcomes (GitHub Sponsors
  case studies, Indie Hackers surveys, OpenView benchmarks)

Demote `official-statistics` and `regulatory-filing` — they rarely cover
the target category at sufficient granularity.

### 3. Recency window: tighter for pricing, longer for retrospectives

Pricing and license pages change; retrospectives age well.

```yaml
recencyWindow:
  pricing: "last 60 days"       # live pricing pages
  licenseText: "current"        # must match what peers ship now
  retrospectives: "last 24 months"
```

### 4. Propagating uncertainty in the plan itself

Every driver-tree leaf gets a **conservative / base / optimistic** triple
sourced to a peer prior, and the plan names **which leaf, if replaced
with real data, would most move the answer** — that leaf becomes the
highest-value follow-up research after the first ship.

```yaml
priorsAndSensitivity:
  highestLeverageLeaf: "per-seat conversion rate"
  priorSource: "OpenView 2025 dev-tool segment (1.5–3%)"
  nextDataToGather: "first 30 days of real conversion post-launch"
```

### Worked example

See [`PRISM-oss-monetization-sample.md`](../examples/PRISM-oss-monetization-sample.md)
for an end-to-end sparse-data research plan feeding a three-path
analysis (policy-design comparables,
driver-tree-with-sparse-priors revenue projection, funnel-analysis
growth cohort).

---

## Recording the plan

The primary agent records the plan in the proposal's Research Plan
section ([proposal-format-guide.md](proposal-format-guide.md)) and
passes it verbatim in each subagent's brief
([subagent-brief-guide.md](subagent-brief-guide.md)). Every subagent
inherits the same plan so cross-path evidence is comparable.

---

## See also

- [citation-guide.md](citation-guide.md) — producing citations that
  conform to the plan.
- [subagent-brief-guide.md](subagent-brief-guide.md) — how the plan
  travels into each brief.
- SKILL.md §Step 0 — the canonical spec.
