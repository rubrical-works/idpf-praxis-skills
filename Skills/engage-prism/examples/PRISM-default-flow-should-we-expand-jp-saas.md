# Parallel Analysis: Should We Expand into Japan B2B SaaS in 2H 2026?

- **Date:** 2026-04-22
- **Skill:** engage-prism
- **Paths Explored:** 3
- **Web Research Performed:** true
- **Convergent:** false
- **Bear Path Triggered:** true
- **Audit File:** `Proposal/PRISM-default-flow-should-we-expand-jp-saas.audit.json`

> This example demonstrates the **default flow after #213**: no
> `--structured-routing` (primary agent names paths in one sentence each),
> no `--confirm-keywords` (proceeds directly after inline keyword
> restatement), source-class diversity enforced, red-team bear path
> triggered by the "should we" directional question, disagreement audit
> flagging `convergent: false`, slim decision-focused proposal with raw
> envelopes in the sibling audit JSON. URLs are illustrative
> `example.com` placeholders.

## Question

"Should we expand into the Japan B2B SaaS market in 2H 2026? We have
$4M of budget and a team of eight."

## Research Plan

- **Entity anchors:** Japan; B2B SaaS; enterprise software procurement;
  METI policy; JETRO market-entry guidance; major JP incumbents
  (SAP Japan, Salesforce Japan, Oracle Japan, Works Applications);
  2H-2026 window.
- **Source classes:** primary-filing (METI white papers, JETRO reports,
  company annual reports), practitioner-retrospective (US/EU SaaS
  operators who entered JP between 2020–2025), quantitative-dataset
  (IDC Japan SaaS spend panels, MM Research enterprise IT surveys),
  adversarial-bear-source (short-seller commentary on JP SaaS entrants,
  contrary analyst coverage, JP market-entry post-mortems).
- **Recency window:** last 12 months.
- **Authority preference:** primary-filing > practitioner-retrospective >
  quantitative-dataset > adversarial-bear-source > trade-press.
- **Fetch budget:** 4 per path.

## Signal Analysis

Default routing — primary agent named paths directly. Full path-selection
rationale lives in the audit sibling under `signalAnalysis`.

## Path 1: Primary-Filing Anchor — METI + JETRO + Incumbent Annual Reports

### Brief

- **One-sentence angle:** Build the TAM and entry-timing view from JP
  regulator and incumbent filings.
- **primarySourceClass:** `primary-filing`

### Report

**Core claim:** Japan B2B SaaS penetration in 2026 is ~38% vs. ~72% in
the US, with a 6.1% CAGR trajectory and a 2H-2026 tailwind from METI's
DX acceleration program renewal. Strongest citation: METI 2026 DX White
Paper (`https://example.com/meti-dx-2026`) — enterprise SaaS adoption
rose from 29% in 2023 to 38% in 2025. Gap: the $4M / 8-person budget is
roughly 1/3 of what comparable JP-entry projects report in the annual
reports sampled (SAP Japan's 2022 entry re-investment totaled ~$12M
combined across year one).

## Path 2: Practitioner-Retrospective — US/EU SaaS Operators 2020–2025

### Brief

- **One-sentence angle:** Read the last five years of US/EU SaaS entries
  for what actually worked vs. what looked good on paper.
- **primarySourceClass:** `practitioner-retrospective`

### Report

**Core claim:** Entry succeeds when the team establishes a local JP
entity and a JP-native sales lead in the first 6 months; entries that
deferred those steps reported 14–22-month time-to-first-revenue vs. 6–9
months for entrants that front-loaded. Strongest citation: Datadog JP
market-entry retrospective (`https://example.com/datadog-jp-retro`) —
"the single biggest misstep was running JP from US HQ for year one."
Gap: the retrospectives are self-selected toward outcome-reporters; the
base rate of quiet failures is hard to recover.

## Path 3 (bear): Adversarial Counter-Case — Why JP Entry at This Budget Fails

### Brief

- **One-sentence angle (bear path):** Strongest case AGAINST the stated
  direction; cite sources the for-paths did not use.
- **primarySourceClass:** `adversarial-bear-source`
- **Attacks the claim:** "Expanding into Japan B2B SaaS in 2H 2026 is
  the right call at $4M and 8 people."

### Report

**Core claim:** At $4M / 8 people, the entry is systematically
under-funded relative to the documented cost structure of successful JP
SaaS entries, and the 2H-2026 window coincides with the JP fiscal
year-end (March 2027) where enterprise procurement freezes for Q4.
Strongest citation: Morningstar analyst note on JP-market entry
economics (`https://example.com/morningstar-jp-entry`) — "projects
capitalized below $10M in year one have a 34% 3-year survival rate in
our 2018–2024 panel, vs. 71% for projects above $12M." Second
citation: METI DX procurement-timing guidance
(`https://example.com/meti-procurement-calendar`) — Q4 JP fiscal
freezes reduce new-vendor on-boarding by ~60% in January-March.
**Citation-overlap check:** zero URL overlap with Paths 1 and 2.

## Synthesis

### Disagreement Audit

**`convergent: false`**. Material disagreement on:

- **Budget adequacy:** Path 1 treats $4M as "below comparable
  investment" narratively; Path 3 (bear) names a specific 34% vs. 71%
  3-year survival differential tied to capitalization. Different
  framings, opposed implications.
- **Timing:** Path 2 emphasizes front-loaded local-entity build;
  Path 3 adds a fiscal-calendar constraint (JP Q4 freeze) that Path 2
  never surfaced. Not contradictory, but materially incremental.

### Bear Path Outcome

**Bear survived:** the Morningstar capitalization differential is the
specific piece of evidence that most weakened the for-case. Both
for-paths argued strategic fit without engaging the capitalization
economics at the stated budget.

### Scoring Summary

- Path 1: Strong on evidence density; Adequate on decision usefulness
  (doesn't land a budget recommendation).
- Path 2: Strong on actionable operational guidance; Weak on
  capitalization analysis (didn't surface the budget-to-outcome
  relationship).
- Path 3 (bear): Strong on counter-evidence; Adequate on upside
  recognition.

### Hybridization

Not a hybrid — the bear's capitalization point doesn't graft onto the
for-paths; it reframes the decision.

## Recommendation

**`convergent: false`** — the three paths disagreed on whether the
stated budget is adequate for the stated ambition. **Bear survived**:
the capitalization evidence directly weakens the for-case and the
for-paths did not engage it.

**Recommendation: re-scope, not proceed as stated.** Either increase
capitalization to ≥$10M across year one (Path 3's 71%-survival band) OR
sequence the entry as a 2H-2026 scouting expedition rather than
full-market entry — JP fiscal calendar makes Q4 ramp unproductive
regardless of budget. The current $4M / 8-person plan in 2H 2026 is
the worst of both: below the survival-band capitalization *and* into
the procurement-freeze window.

Consensus-or-groupthink caveat does not apply — `convergent` is false,
the disagreement is surfaced, and the recommendation engages it.

## What Would Change This Answer

- If additional budget ($6–8M) becomes available before 2H-2026, the
  Path 1 / Path 2 thesis becomes the stronger read — revisit with a
  re-scoped proposal.
- If JP incumbent's 2026 annual report (expected July) shows
  materially slower SaaS penetration than the cited 6.1% CAGR, the
  whole case weakens and the bear strengthens.
- If a JP-native partner willing to cost-share the local-entity build
  is available, the capitalization differential narrows and the
  timing window becomes the dominant constraint.

## Audit

Raw subagent envelopes, full citation lists, per-dimension scoring
matrix, `attemptedCalls[]` records, and the Path 3 bear-path
citation-overlap verification are in the sibling audit file:
`Proposal/PRISM-default-flow-should-we-expand-jp-saas.audit.json`.
