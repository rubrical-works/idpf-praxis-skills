---
name: debate-prism
description: Adversarial for/against/judge analyst for contested business, marketing, and financial claims. Extracts the claim under debate, runs a baseline pass, dispatches a for-advocate and an against-advocate in parallel with mechanical citation diversity, then routes to a judge subagent that names the specific evidence that settled the call. Preserves the citation schema, recency gate, attempted-call evidence, and disclaimer contract from /engage-prism.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-22"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [business-analysis, market-research, financial-analysis, web-research, adversarial-analysis, debate-pattern, json-schema]
copyright: "Rubrical Works (c) 2026"
---
# Debate Prism — Adversarial For/Against/Judge Analyst
For **contested, direction-stated** business/marketing/financial questions — baseline → parallel for/against advocates → judge. Preserves `/engage-prism` citation discipline + recency gate. Diversity enforced mechanically: citation URLs must not overlap across advocates. Reference data stored as schema-validated JSON in `resources/`. Every subagent report cites using `resources/citation-schema.json` (identical to `/engage-prism`). Does NOT declare `sharedScripts:`; does NOT invoke `match-signals.js`.
## Prerequisites
- **Node.js 18+** — preflight shells `node --version` + `node -e "require('ajv')"`. No runtime Node dep beyond preflight.
- **WebFetch / WebSearch** — required by default. Both advocates do live web research + cite.
- **Optional `ajv`** — validates briefs/judge-output. Missing downgrades to best-effort, non-blocking.
### Preflight (runs before Step 0)
Primary agent MUST run:
```bash
node --version
```
If command fails or major version < 18, HALT with:
> **debate-prism requires Node.js 18+ for schema validation tooling. Install Node 18+ from https://nodejs.org/ and retry.**
Do not proceed to Step 0. Log whether `ajv` importable; missing is non-fatal but recorded.
## When to use this skill
Use `/debate-prism` for **directional** questions (user stated or asked to validate a claim), e.g.:
- "Should we expand into Japan B2B SaaS in 2H 2026?"
- "Is ACME stock a buy at current prices?"
- "Is the new META ad pricing model worth adopting?"
Use `/engage-prism` for **open-ended exploratory** questions. On open-ended invocation, redirect — do not fabricate a claim.
**Do NOT use for:**
- Code/algorithm/IT-architecture — use `engage-exocortex`.
- **Trade execution/order placement** — never executes trades or touches brokerage APIs.
- **Substitute for licensed clinical/legal/regulatory judgment.** Finance/legal/medical outputs MUST carry disclaimer (below).
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--no-proposal` | Skip writing the debate proposal document | *(writes proposal)* |
| `--no-web` | Suppress web research (advocates must record `webResearch.performed = false` with `attemptedCalls[]` evidence) | *(web required)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--fetch-budget N` | Fetch budget per advocate (baseline counts 1 separately) | 4 |
| `--round-two` | Force second round (re-dispatch for-advocate against against's strongest citation) regardless of judge confidence | *(off — judge triggers)* |
`--no-web` is a **scoped opt-out** for sandboxed envs; degraded runs MUST record `webResearch.performed=false` + ≥1 `attemptedCalls[]` entry — bare unavailability claims fail validation identically to `/engage-prism`. `--round-two` forces second round regardless of judge confidence; use for max adversarial pressure.
## Core Workflow
```
PRIMARY AGENT
  0. Web-research scoping — entity anchors, source classes, recency window, fetch budget
  1. Claim extraction — name claim; redirect to /engage-prism if no direction
  2. Baseline pass — one-paragraph initial read, one grounding fetch
  3. Dispatch two adversaries IN PARALLEL:
       For-advocate     → strongest case FOR + citations[]
       Against-advocate → strongest case AGAINST + citations[] (zero URL overlap)
  4. Judge pass — reads baseline + both briefs + both citation sets; names weakening evidence; endorses/rejects/revises
  5. Round-two gate (optional) — low confidence OR uncountered new evidence → re-dispatch for-advocate
  6. [Default] Write debate proposal to Proposal/DEBATE-{claim-slug}.md
```
**Opt-out:** `--no-proposal` skips doc gen. `--no-web` suppresses web research (record degradation).
## Step 0 — Web-Research Scoping (Mandatory)
Same contract as `/engage-prism`. Research plan:
1. **Entity anchors.** Names, tickers, geographies, industries, products, events claim is anchored on.
2. **Source classes.** E.g., *news articles, earnings transcripts, regulatory filings, analyst reports, trade press, industry bodies, official statistics, company pages*.
3. **Recency window.** How current info must be.
4. **Freshness class.** Enum `geopolitical | market | general`; thresholds `geopolitical`/`market` = 24h, `general` = 72h.
5. **Authority preferences.** Prefer primary > aggregators > opinion.
6. **Fetch budget.** Default 4/advocate; override via `--fetch-budget N`.
Record plan in proposal Context section. Both advocates + judge inherit it.
### Citation discipline (contract parity with /engage-prism)
Every non-derived claim must cite a source conforming to `resources/citation-schema.json`. Reports without schema-conformant citations flagged in judge pass + deprioritized.
### Degradation path + attempted-call evidence
Identical to `/engage-prism`. `webResearch.performed=false` requires populating `webResearch.attemptedCalls[]` with ≥1 documented attempt (method, `targetUrl` or `query`, `errorMessage`, optional `httpStatus`, `attemptedAt` ISO-8601). Bare unavailability claims are a contract violation. Primary agent rejects zero-attempt reports, re-dispatches once with explicit directive — if retry also zero attempts, accept but tag `degradationEvidence="unverified"`.
### Recency gate
Identical to `/engage-prism`. For every cited anchor source, `ageHours = now − max(publishedAt, fetchedAt)`. If `max(ageHours) > threshold`, reject report and re-dispatch once with directive "fetch a source dated within the last {threshold}h before re-submitting". Graceful degradation emits explicit warning; never silent.
## Step 1 — Claim Extraction
Primary agent extracts **claim under debate** in one sentence. Claim must be:
- **Directional** — takes a position vs open-ended.
- **Named** — entities, geographies, time horizons concrete.
- **Falsifiable** — both advocates can argue either side.
### Redirect when no direction is stated
If no stated direction, redirect:
> "Your question is open-ended ('what are the angles on X'). That's a good fit for `/engage-prism`, which fans out into parallel analytical paths. `/debate-prism` wants a claim to pressure-test. Would you like to (a) state a claim and I'll debate it, or (b) run this through `/engage-prism` instead?"
Do not fabricate a claim silently — produces degenerate debate attacking nothing the user asserted.
## Step 2 — Baseline Pass
Primary agent produces one-paragraph initial read with **exactly one grounding fetch**. Baseline:
- States primary agent's prior (lean toward, lean against, neutral).
- Cites one authoritative source (conforming to `citation-schema.json`).
- Records baseline for judge.
Baseline is not a debate — it is the reference point judge uses to detect whether adversaries moved the needle.
## Step 3 — Dispatch Adversaries (Parallel)
Spawn both advocates **at the same time** via Agent tool. Each receives its brief from `resources/for-brief-template.json` or `resources/against-brief-template.json`.
### For-advocate brief
- **Task:** Build **strongest case for the claim** with schema-conformant citations.
- **Fetch budget:** N (default 4; override via `--fetch-budget N`).
- **Citation requirement:** Every non-derived claim cites a source conforming to `citation-schema.json`. Prefer primary/high-authority (filings, regulators, official stats) over aggregators.
- **Output:** JSON conforming to `resources/for-brief-schema.json` with `claim`, `corePosition`, `citations[]`, `analysis[]`, `webResearch`, `recommendation`.
### Against-advocate brief
- **Task:** Build **strongest case against the claim** with citations drawn from **sources the for-advocate did not use**.
- **Citation diversity:** Against's `citations[]` MUST share zero URLs with for's `citations[]`. **Mechanical** (enforced by primary agent after both return), not a label.
- **Fetch budget:** N (same as for-advocate).
- **Citation requirement:** Same schema + authority preference; bear sources (short-seller reports, counter-case filings, contrary analyst coverage) preferred.
- **Output:** JSON conforming to `resources/against-brief-schema.json` — same fields as for-brief plus `targetedCitationIndex` (for-advocate citation this against-case most directly rebuts, if any).
### Citation-overlap enforcement
After both reports return, compute `overlap = intersect(for.citations.urls, against.citations.urls)`:
- **`overlap.length === 0`:** proceed to Step 4.
- **`overlap.length > 0`, first detection:** re-dispatch against-advocate once with directive "Fetch counter-evidence from distinct sources (different domains) — the following URLs overlap with the for-case and must be replaced: {list}. Re-submit only after the overlap is resolved."
- **`overlap.length > 0`, second detection:** accept but tag `citationOverlap="unresolved"` in JSON envelope and surface in judge pass + final proposal.
Contract parity with `/engage-prism` recency-gate + attempted-call one-retry pattern.
### Recency gate and attempted-call evidence
Both advocates inherit `freshnessClass`. Requirements identical to `/engage-prism` (see Step 0).
## Step 4 — Judge Pass
Judge is a third subagent. It reads:
- Baseline from Step 2.
- For-brief + citations.
- Against-brief + citations.
- Any citation-overlap tags from Step 3.
Judge MUST produce output conforming to `resources/judge-output-schema.json` with these required fields:
1. **`weakeningEvidence`** — either a citation index in against-advocate's `citations[]` that most weakened the for-advocate's case, OR literal string `"none"` with non-empty `justification`. Missing field fails schema validation and blocks proposal generation.
2. **`verdict`** — one of `"endorse"`, `"reject"`, `"revise"`.
3. **`revisedClaim`** (required when `verdict === "revise"`) — revised claim statement.
4. **`flipConditions`** — when `verdict === "revise"`, names what evidence would need to be true to reject the revised claim. When `"endorse"` or `"reject"`, names what would flip verdict the other way.
5. **`confidence`** — enum `"high" | "medium" | "low"`.
6. **`confidenceRationale`** — one-line rationale.
7. **`degradationFlags`** — array collecting any `citationOverlap="unresolved"`, `degradationEvidence="unverified"`, or recency-gate degradation warnings surfaced in Step 3.
Judge does NOT re-run web research. Its job is to weigh evidence advocates produced.
## Step 5 — Round-Two Gate
After judge returns, primary agent decides whether to re-dispatch:
**Automatic trigger — re-dispatch when EITHER:**
- `judgeOutput.confidence === "low"`, OR
- against-advocate produced **strictly new evidence** for-advocate did not address (heuristic: against-citations with `sourceClass` in `{regulatory-filing, official-statistics, earnings-transcript}` whose excerpts contradict specific for-advocate claims and were not engaged in for-brief's `analysis[]`).
**Flag trigger — `--round-two` forces** second round regardless of judge confidence.
**Round-two dispatch.** Re-dispatch for-advocate **only** (not against-advocate) with explicit directive:
> "Address the against-advocate's strongest citation (`targetedCitationIndex={N}` from the against-brief, excerpt: `{excerpt}`). Either refute it with new primary-source evidence OR revise the claim to accommodate it. Re-submit using the same schema."
Judge re-runs on round-two for-brief + original against-brief. Max one round-two — skill does not loop.
## Step 6 — Generate Debate Proposal (default)
**Skip if `--no-proposal`.** Write markdown to `Proposal/DEBATE-{claim-slug}.md` where `{claim-slug}` is lowercase-hyphenated (e.g., `expand-into-japan-b2b-saas-2h-2026`). Read `resources/proposal-template.json` for section structure:
1. **Metadata** — Date, skill, claim, fetch budget, round count (1 or 2), webResearchPerformed, verdict, confidence, any degradationFlags.
2. **Claim** — Full claim statement from Step 1.
3. **Research Plan** — Entity anchors, source classes, recency window, freshness class, authority preference, fetch budget.
4. **Baseline** — Primary agent's one-paragraph initial read with citation.
5. **For-Brief** — Core position + full `citations[]` table + analysis summary.
6. **Against-Brief** — Core position + full `citations[]` table + analysis summary + `targetedCitationIndex` pointer.
7. **Judge Output** — `weakeningEvidence`, `verdict`, `revisedClaim` (if any), `flipConditions`, `confidence`, `confidenceRationale`, `degradationFlags`.
8. **Round History** — If `--round-two` fired/forced, include round-two for-brief + judge's second pass.
9. **Disclaimer** — When claim touches finance/legal/medical, stamp disclaimer (below) at top of user-facing narrative.
## Disclaimer template
When final output concerns specific securities, options, positions, legal actions, or medical choices, primary agent MUST stamp this (verbatim or equivalent force) at top of user-facing narrative:
> **Disclaimer.** The following is informational only, sourced from live web research on {date}. It is **not licensed financial, legal, or medical advice**. Named securities, options, or positions are illustrative and sized as percentages of a risk budget, not dollar amounts. Options carry total-loss risk. You should consult a licensed professional (registered investment advisor, attorney, clinician) before acting.
Disclaimer replaces — does not supplement — any language that would refuse to answer a finance/legal/medical question on licensed-advice grounds. Refusing to engage with a stated directional claim when user acknowledged informational-only framing is a contract violation.
Detection heuristic: any of `{finance, legal, medical, investment, securities, ticker, options, lawsuit, litigation, clinical, diagnosis, treatment, prescription}` in claim text or entity-anchor list triggers the disclaimer stamp.
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing or < 18 | Report preflight error with install link; halt before Step 0 |
| User's question has no stated direction | Redirect to `/engage-prism`; do not fabricate a claim |
| For-advocate and against-advocate citation URLs overlap | Re-dispatch against-advocate once; second failure tags `citationOverlap="unresolved"` |
| Judge output missing `weakeningEvidence` field | Schema validation fails; re-dispatch judge once; second failure blocks proposal with explicit error |
| Subagent returns non-conforming JSON | Flag schema violations; re-dispatch once; accept with degradation tag on second failure |
| WebFetch / WebSearch unavailable | Record `webResearch.performed = false` with `attemptedCalls[]`; surface degradation in judge output and proposal |
| Round-two fails to produce new evidence | Accept round-two for-brief as-is; judge's second pass records "round-two did not materially shift the balance" |
## Important Constraints
- **Claim must come from user.** Never fabricate a directional claim from open-ended question.
- **Citation URLs mechanically non-overlapping.** Zero URL overlap between for- and against-advocate citations.
- **Primary agent validates.** Do not trust subagent JSON without checking colocated schema.
- **Informational, not licensed advice.** Finance/legal/medical outputs stamp the disclaimer.
- **No trade execution.** Never places orders or interacts with brokerage APIs.
- **No docs/ references at runtime.** `docs/` is human-readable reference; skill never reads from `docs/` at runtime.
- **No `sharedScripts:` frontmatter.** Does not consume `match-signals.js` or any other shared script.
## Relationship to `/engage-prism` and `/spar-exocortex`
| Dimension | `/engage-prism` | `/debate-prism` | `/spar-exocortex` |
|---|---|---|---|
| Domain | Business/market/finance | Business/market/finance | Code/algorithms/architecture |
| Pattern | Cooperative parallel | Adversarial for/against/judge | Propose-attack-measure loop |
| Question shape | Open-ended | Directional claim | Directional algorithm/design |
| Diversity | `primarySourceClass` + (optional) taxonomy | Zero URL overlap | `targetComplexity`/`invariantChoice` |
| Execution | N/A | N/A | Required for algorithmic problems |
Choose `/debate-prism` when user stated a claim and wants pressure applied. `/engage-prism` for open-ended exploration. `/spar-exocortex` for algorithm/code design with stated baselines.
## Reference Files
All in `resources/`. Each JSON data file has colocated schema.
| File | Purpose |
|---|---|
| `citation-schema.json` | Shape of every citation entry (parity with `/engage-prism`) |
| `for-brief-template.json` | Slot-filled into for-advocate brief |
| `for-brief-schema.json` | Validator for for-advocate reports |
| `against-brief-template.json` | Slot-filled into against-advocate brief |
| `against-brief-schema.json` | Validates against-advocate reports; enforces `targetedCitationIndex` + zero-URL-overlap |
| `judge-output-schema.json` | Validates judge outputs; enforces `weakeningEvidence`, `verdict`, `flipConditions`, `confidence` |
| `proposal-template.json` | Document structure for Step 6 |
| `proposal-template-schema.json` | Validates proposal template |
