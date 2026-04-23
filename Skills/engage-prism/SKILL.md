---
name: engage-prism
description: JSON-driven parallel analyst for business, marketing, and financial questions. Refracts one question into multiple analytical spectra, mandates live web research with schema-conformant citations, and synthesizes structured subagent reports into a single recommendation.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-19"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [business-analysis, market-research, financial-analysis, web-research, parallel-exploration, json-schema]
sharedScripts: [match-signals.js, match-signals-input-schema.json]
argument-hint: "[--paths N] [--no-proposal] [--no-web] [--model <opus|sonnet|haiku>] [--confirm-keywords] [--structured-routing]"
copyright: "Rubrical Works (c) 2026"
---

# Engage Prism — Parallel Business / Market / Finance Analyst

Skill for non-technical analytical questions (business strategy, marketing, financial/market analysis): fans out into N parallel analytical paths, grounds each in live web research, and synthesizes structured subagent reports.
Reference data is schema-validated JSON in `resources/`. Load only matched entries. Every path must cite sources per `resources/citation-schema.json`.

## Prerequisites
- **Node.js 18+** — required for `scripts/match-signals.js` and `scripts/load-entries.js`. No fallback.
- **WebFetch / WebSearch** — required by default. `--no-web` records degradation explicitly.
- **Optional `ajv`** — validates input schemas when present; silently skipped when absent.

If Node missing: install from https://nodejs.org/ and retry.

### Preflight (before Step 0)
Primary agent MUST run:
```bash
node --version
```
If fails or major version < 18, HALT with:
> **engage-prism requires Node.js 18+ to run `match-signals.js` and `load-entries.js`. Install Node 18+ from https://nodejs.org/ and retry.**

Also log `node -e "require('ajv')"` — missing `ajv` is non-fatal but recorded so synthesis knows input-schema validation was skipped.

## When to use
- Business strategy (positioning, GTM, portfolio, operating model)
- Marketing (campaigns, channels, segmentation, pricing, messaging, funnel)
- Financial / capital markets (equity/ticker, valuation, macro, sector, risk)
- Market sizing / demand (TAM/SAM/SOM, adoption, geography)
- Business / market trends
- Answer depends on **current external info**; training recall insufficient
- User says "analyze", "compare", "should we…", "what's the case for…", "explore options for…"

**Do NOT use for:**
- Code/algorithm/IT-architecture — use `engage-exocortex`
- Questions fully resolvable from repo/single doc
- **Trade execution/order placement** — never executes trades, orders, brokerage API calls. Analysis of securities permitted; transactions not.
- **Substitute for licensed clinical/legal/regulatory judgment** — analysis permitted; does not replace RIA/attorney/clinician. Finance/legal/medical outputs MUST carry disclaimer (below).

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths (2-4) | 3 |
| `--no-proposal` | Skip proposal doc | *(writes)* |
| `--model <model>` | Subagent model (opus/sonnet/haiku) | opus |
| `--no-web` | Suppress web research; paths declare training-recall degradation | *(web required)* |
| `--confirm-keywords` | Opt-in: enforce Step 1 `AskUserQuestion` gate | *(off)* |
| `--structured-routing` | Opt-in: route via `match-signals.js` and paradigm/structure/strategy catalog | *(off)* |

- `--no-web`: scoped opt-out for sandbox. Each report must include `webResearch: { performed: false, reason: "..." }`.
- `--confirm-keywords`: scoped opt-in. Default restates question/keywords inline and proceeds. Enable for team/advisory.
- `--structured-routing`: scoped opt-in. Default names paths in one sentence; catalogs optional palette. Enable for catalog-driven enumeration.

## Core Workflow
```
PRIMARY AGENT
     ├── 0. Mandatory web-research scoping
     ├── 1. Parse question → extract signal keywords
     ├── 2. Match signals → load matched JSON entries selectively
     ├── 3. Score → select N paths (deterministic)
     ├── 4. Anti-overlap check
     ├── 5. Spawn N subagents in PARALLEL (web-research required)
     │       ├── Path 1: [angle] ──► JSON report (citations[])
     │       ├── Path 2: [angle] ──► JSON report (citations[])
     │       └── Path N: [angle] ──► JSON report (citations[])
     ├── 6. SYNTHESIS: validate, score, hybridize ──► recommendation
     └── 7. [Default] Write proposal to Proposal/PRISM-{slug}.md
```
**Opt-out:** `--no-proposal` skips Step 7. `--no-web` suppresses web research.

## Step 0 — Web-Research Scoping (Mandatory)
**Required; distinguishes `engage-prism` from `engage-exocortex`.** Business/market/finance questions need current external info.

### What to scope
Before signal matching, plan:
1. **Entity anchors** — names, tickers, geographies, industries, products, events.
2. **Source classes** — news, earnings transcripts, filings, analyst reports, trade press, industry bodies, official stats, company pages, review sites.
3. **Recency window** — e.g., 30d for trend, last earnings for equity, 12mo for sizing.
4. **Authority** — primary sources > aggregators > opinion.
5. **Budget** — fetches/path (default 3–5).

Record plan in proposal Context. Subagents inherit via brief.

### Citation discipline
Every non-derived claim must cite per `resources/citation-schema.json`:
```json
{
  "title": "string",
  "url": "string (valid URL)",
  "fetchedAt": "ISO-8601 timestamp",
  "excerpt": "short quoted or paraphrased extract supporting the claim"
}
```
Reports without schema-conformant citations flagged and deprioritized.

### Degradation path
When WebFetch/WebSearch unavailable (sandbox, offline, `--no-web`), each report sets `webResearch.performed = false` with non-empty `reason`. Primary agent surfaces degradation explicitly — degraded answers never presented as research-grounded.

**Attempted-call evidence required.** `performed = false` requires `webResearch.attemptedCalls[]` with ≥1 entry documenting actual attempt (method, `targetUrl` or `query`, `errorMessage`, optional `httpStatus`, `attemptedAt` ISO-8601). Subagents must try ≥1 alternative source before declaring unavailability. Primary agent rejects reports with `performed=false` and empty `attemptedCalls[]`, re-dispatches once with "attempt at least one fetch" directive; retry with zero attempts → tag `degradationEvidence="unverified"` and deprioritize further.
### Return-side validation — reject zero-fetch returns (#220)
Primary agent treats subagent returns as untrusted. Applied **before** synthesis. These failures are behavioral (had tools, chose not to use), not environmental — must not be silently demoted to `degradationEvidence="unverified"`.
**Reject pattern A — `performed=false` with non-conforming `attemptedCalls[]`.** Non-conforming = lacks any of `method`, `targetUrl` (or `query`), `errorMessage`, `attemptedAt` (ISO-8601). Bare narrative text does not satisfy schema. Reject + re-dispatch **once** with directive below.
**Reject pattern B — `performed=true` with `fetchCount=0`.** Internally inconsistent. Reject + re-dispatch **once** with same directive.
**Re-dispatch directive — must include a named primary-source URL.** Pick one URL from research plan's entity anchors (e.g., `https://www.eia.gov/petroleum/weekly/` for oil; `https://www.sec.gov/edgar/searchedgar/companysearch` for filings). Brief states, verbatim or equivalent: *"You have WebFetch and WebSearch. Fetch {named primary-source URL} and cite the actual published date. A second zero-fetch return is a contract breach, not a degradation."* MUST name a specific URL; generic "try harder" does not satisfy.
**Second zero-fetch — tag `evidence-fabrication-risk` (behavioral), NOT `degradationEvidence="unverified"` (environmental).** On second zero-fetch, tag path `evidence-fabrication-risk` in synthesis. Distinct from `degradationEvidence="unverified"` (attempted but could not verify). MUST NOT conflate. Synthesis surfaces fabrication-risk paths at top of proposal under a fabrication-risk banner (see Step 5) and excludes them from any `convergent: true` claim.

### Recency gate (fast-moving topics)
- **`freshnessClass` run arg** — `geopolitical | market | general`; default `general`. Thresholds: `geopolitical`/`market` = 24h; `general` = 72h.
- **Gate:** For every cited anchor, `ageHours = now − max(publishedAt, fetchedAt)`. If `max(ageHours) > threshold`, reject and re-dispatch once with "fetch a source dated within the last {threshold}h".
- **≥2-source corroboration for anchors:** Probability weights / price levels entering synthesis as anchors require ≥2 independent citations (distinct domains). Single-source → tag `anchorEvidence="single-source"` and deprioritize.
- **Date-qualified queries:** Time-sensitive entities require current date (`YYYY-MM-DD` or `last 24h`) in ≥1 query before accepting results.
- **Graceful degradation:** After retry, accept with warning: `⚠️ Recency-gate degraded: freshest citation Xh old (threshold Yh)`. Never silent.

## Step 1 — Parse Question and Confirm Keywords
1. Parse decision, constraints, "useful answer" definition.
2. Extract signal keywords from question + Step 0 anchors.

### Keyword Confirmation Gate (opt-in via `--confirm-keywords`)
**Default: skipped.** Primary agent restates question/keywords inline and proceeds.

**3. When `--confirm-keywords` is set**, use `AskUserQuestion`:
- Restate question 1–2 sentences.
- List keywords.
- Question: `"I'll analyze: {restated question}\n\nExtracted keywords: {keyword list}\n\nWeb-research plan: {plan summary}"`
- Options: `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the question"`, `"Adjust research plan"`

**On response (when set):**
- **Confirmed** → signal matching.
- **Adjust keywords** → re-display for re-confirmation.
- **Rephrase** → re-parse from scratch.
- **Adjust research plan** → re-display.

When flag set, no dispatch without passing this gate. When unset, inline restatement is the confirmation surface.

### Default routing — primary agent names paths directly
Without `--structured-routing`, skip signal matching: primary agent names N paths itself, one sentence each, grounded in Step 0 anchors/source classes. Catalogs optional palette — MAY open single entry from `paradigms.json`/`structures.json`/`strategies.json` when genuinely useful, MUST NOT load full catalog or use matcher.
- Must satisfy anti-overlap rules Step 2 (distinct primary `sourceClass` — AC #213-3).
- Rejected angles named inline one line each.
- `--paths N` caps count (default 3, bounds 2–4).

### Step 1b — Match Signals (only when `--structured-routing` set)
**Runs only when `--structured-routing` passed.** Default flow skip to Step 2.

4. Run matcher:
   ```bash
   node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
   ```
   Reads `resources/cross-references.json`, aggregates weighted scores across paradigms/structures/strategies, returns top N candidates as JSON.

5. Parse output — `ok: true` = matches found. Use `scores.paradigms`, `scores.structures`, `scores.strategies` for Step 2.

**Fallback path — when `result.fallback === true`:** matcher found zero signal matches but detected finance/macro vocabulary allowlist hit. Envelope carries `confidence: 0.15`, `matchedSignals: []`, single default `paths` entry (paradigm `scenario-analysis`, structure `scenario-grid`, strategy `ev-vs-risk-framing`). Subagent MUST open with one-line low-confidence note and ask user one focused keyword-refinement question before proceeding. Do not silently proceed.

### Selective Loading
For each top-scoring entry, load only matched:
```bash
node scripts/load-entries.js paradigm <id1> [id2] [...]
node scripts/load-entries.js structure <id1> [id2] [...]
node scripts/load-entries.js strategy <id1> [id2] [...]
```
Do **not** read full resource files directly.
**Token budget:** combined output < 10K tokens. Script warns when exceeded.

### Step 1c — Classify Match Quality
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ matched signals with ≥2 distinct primary paradigms | Structured |
| **Weak** | 1–2 matched signals, or all share same primary paradigm | Structured with adaptation |
| **None** | Zero matched (`ok: false`) | Adaptive (tension-driven) |

Report tier at confirmation gate.

Adaptive mode: primary agent identifies 2–4 fundamental tensions (growth vs margin, build vs buy, early vs late, concentrated vs diversified, qualitative vs quantitative) and defines each path by distinct resolution. Web research still mandatory.

## Step 2 — Determine N and Name Paths
**Applies to Strong and Weak tiers.** Adaptive defined in Step 1c.

### Adaptive N selection
| Question characteristics | Recommended N |
|---|---|
| One dominant angle, minor variations | 2 |
| Multiple competing angles, real trade-offs | 3 (default) |
| Underspecified / unusual decision space | 4 |
| User-specified (e.g., `--paths 3`) | User's N |
| **Weak match tier** | **2** |

Never below 2. Above 4 rarely useful.

### Path naming
Encode **both** analytical paradigm and key structure/strategy.
```
✅ "Bottom-up TAM via channel-level unit economics"
✅ "Comparable-company multiples with peer-group regression"
✅ "Porter's Five Forces with substitution-risk weighting"
❌ "Market sizing approach"
❌ "Financial analysis"
```

### Anti-overlap check
`match-signals.js` `paths[]` applies paradigm diversity. Verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- No two paths share paradigm **and** structure.
- Distinct primary paradigm where possible.
- No identical (paradigm, structure, strategy) tuples.
- **Every path declares distinct `primarySourceClass`** (AC #213-3). Invoke `scripts/anti-overlap-validator.js → validateSourceClassDiversity(paths)` before spawning; reject/rename duplicates before Step 3.

### Red-team path for directional questions
**Trigger (primary agent at Step 2).** When question contains a **stated direction**, one path MUST be designated red-team (bear). Detect when matches any:
- **Phrase patterns:** "should we X", "is X a good idea", "does it make sense to X", "are we right to X", "is X the right call", "should we buy/enter/expand/divest/launch/kill X".
- **Imperative verb on named action:** framed as endorsing/rejecting specific action ("expanding into Japan B2B SaaS 2026", "doubling down on outbound", "shutting consumer line"), not open-ended.
- **User volunteers working thesis:** claim followed by validation-seeking question.

**Not triggered by** open-ended exploratory ("what are trade-offs on X"), sizing ("how big is market for Z"), or benchmark ("how do we compare on pricing") — normal parallel-exploration.

**Bear path brief contract.** When triggered, bear path brief MUST specify:
1. **Assigned angle: strongest counter-case against stated direction.** Name claim attacked in plain text.
2. **Citation diversity requirement:** sources for-paths didn't use. `citations[]` shares **zero URLs** with union of other paths'. Failure → re-dispatch once with "fetch counter-evidence from distinct sources (different domains)". Second failure tags `bearCitationOverlap="unresolved"` and deprioritizes.
3. **`primarySourceClass`** set to distinct adversarial class — typically `adversarial-bear-source` (short-seller reports, contrary analyst coverage, regulatory enforcement).
4. **Synthesis reporting:** records whether bear survived validation. Final recommendation names "bear survived" or "bear failed" as first-class signal.

`--structured-routing` does not disable — applies to both default and structured-routing flows whenever trigger fires.

## Step 3 — Spawn Subagents in Parallel
Spawn all N at same time via Agent tool. Subagents perform research/reasoning/writing — including analysis of specific tickers, ETFs, options structures, short/hedge ideas. Subagents **never execute trades, place orders, or interact with brokerage APIs**. Finance/legal/medical outputs MUST stamp standard disclaimer.

### Brief generation (slot-filling)
Read `resources/brief-template.json`. Fill per path:
- `questionStatement` — user's question.
- `assignedAngle` — path name, paradigm/structure/strategy, tension resolution if adaptive.
- `constraints` — from Step 1.
- `researchPlan` — anchors, source classes, recency, authority, fetch budget (Step 0).
- `citationRequirement` — reference `resources/citation-schema.json`.
- `maxSteps` — exploration depth limit.
- `maxOutputLines` — output size cap.

### Subagent task
- State angle and fit.
- **Perform web research** via WebFetch/WebSearch within fetch budget, record via citation schema.
- Work through analysis referencing fetched evidence.
- Produce reasoned recommendation, honest about data limits.
- Identify risks, counter-evidence, what would change answer.

### Report format
JSON per `resources/report-template.json`, including `citations: []` (each per `resources/citation-schema.json`) and `webResearch: { performed, reason?, fetchCount }`.
Validate via `resources/report-schema.json`. Malformed or empty `citations` while `performed=true` → flag and deprioritize.

### User-facing output contract
JSON envelope is validation/audit, **not** direct user consumption. Top-level synthesis agent MUST render each path into markdown.

**MUST render each path as markdown** with:
- `## Path N: {paradigm} + {structure} + {strategy}` heading (or adaptive path-name)
- Short narrative summary (thesis + fit)
- Bulleted findings/recommendations
- Citations as numbered footnotes or inline links (never raw JSON)
- Numeric/tabular data as markdown table

**MUST include `## Synthesis` section** (validation, scoring, hybridization).

**MUST append raw JSON under collapsible block:**
```
<details><summary>Raw subagent output (JSON)</summary>

```json
{ ...validated subagent envelope... }
```

</details>
```

**MUST NOT paste raw JSON into primary narrative.** Render first, then append.

## Step 4 — Synthesis
Read `resources/synthesis-config.json` for scoring rubric.

Phases:
1. **Validate** — check claims against citations; flag unsupported.
2. **Score** — evidence strength, analytical rigor, decision usefulness, counter-evidence handling, source authority, conditional domain dims.
3. **Hybridize** — combine best angle with best evidence/framing.
4. **Output** — final recommendation, explicitly name grafted elements.
### Citation liveness spot-check (#220)
Before writing the proposal, primary agent performs URL liveness spot-check on ≥**one citation URL per path** (one per subagent). WebFetch (HEAD or GET) the cited URL and confirm:
1. **Reachability** — URL resolves (any 2xx/3xx). 4xx/5xx or DNS failure tags citation `urlUnreachable: true` without inventing alternatives.
2. **Publish-date sanity** — page's actual publish date matches `publishedAt` (or falls within plausible window of `fetchedAt` when absent). Blatant mismatch (e.g., cited 2026-04-21 but page reads 2024-03-15) = fabrication signal: re-dispatch path once with directive "fetch a current source and cite the actual published date"; second mismatch tags path `evidence-fabrication-risk` (see Step 0 Return-side validation).
Per-path not per-citation — full per-citation HEAD is too expensive for 3-path runs. Per-path sufficient to catch subagents that fabricated all citations from training memory: a fabricated set fails the spot-check on its first sampled URL with high probability.

### Final output format
```
## Parallel Analysis: [Question Title]

### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
- Path 2: [Name] — [one-sentence summary]
...

### Evidence Base
[Source count, authority mix, recency profile, known gaps.]

### Analysis
[2–4 sentences per path: core claim, strongest citation, gaps.
Call out unsupported claims from validation.]

### Recommendation
**Best angle: [Name]**
Reason: [2–3 sentences — why this wins given constraints and evidence]

[Optional] **Hybrid:** [Name] framing + [Name] evidence base
How: [1–2 sentences on combination]

### What would change this answer
[2–3 bullets — evidence/assumption updates that flip recommendation]
```

## Step 5 — Generate Analysis Proposal Document (slim) + Audit JSON Sibling
**Skip if `--no-proposal`.**

Write **two** artifacts:
1. **Main proposal** — decision-focused markdown at `Proposal/PRISM-{question-slug}.md`. **Target: under 8KB for typical runs.**
2. **Audit sibling** — machine-readable JSON at `Proposal/PRISM-{question-slug}.audit.json` with raw envelopes, full citations, per-dimension scoring matrix, `attemptedCalls[]`, signal-matching tables.

`{question-slug}` is lowercase-hyphenated (e.g., `expand-into-japan-b2b-saas`).

Read `resources/proposal-template.json`. Slimming rules:
1. **Metadata** — Date, skill name, paths, webResearchPerformed, `convergent` flag, `bearPathTriggered` flag, pointer to audit sibling.
2. **Question** — Original query.
3. **Research Plan** — Anchors, source classes, recency, authority, fetch budget.
4. **Signal Analysis — one-line footnote.** Name matched signals (or "adaptive mode — no signal match" / "default routing — primary agent named paths directly"). Full weight tables, per-paradigm scores, rejected angles → audit JSON, NOT main proposal.
5. **Path sections** — each path narrative, not JSON dump:
   - **Brief** — one-sentence angle + declared `primarySourceClass`. Full brief → audit JSON `paths[N].brief`.
   - **Report** — 3–6 sentence narrative: core claim, strongest citation (title + one-line excerpt), gaps. Full structured — `citations[]`, `webResearch`, `attemptedCalls[]`, analysis steps → audit JSON `paths[N].report`. **Never paste raw JSON inline.**
6. **Synthesis** — Disagreement audit (convergent flag + named disagreements), bear-path outcome, one-line-per-path scoring, named hybrid. Full scoring matrix → audit JSON.
7. **Recommendation** — Final; must surface `convergent` flag, bear-path outcome, degraded paths.
8. **What Would Change This Answer** — 2–3 specific observations that flip recommendation.
9. **Audit** — pointer section naming audit JSON sibling.

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Node missing or < 18 | Preflight error with install link (https://nodejs.org/); halt before Step 0 |
| JSON data file fails schema | Report validation error with path; halt |
| Reference file missing | Fail with file-not-found |
| No signals match in `cross-references.json` | Switch to adaptive (tension-driven) mode |
| Subagent returns non-conforming JSON | Flag violations; exclude from synthesis |
| WebFetch/WebSearch unavailable | Record `webResearch.performed = false`; surface degradation |
| Citation present but URL unreachable | Keep citation; flag `urlUnreachable: true`; don't invent alternatives |
| Citation missing required fields | Flag malformed and deprioritize |

## Important Constraints
- **Web research required by default.** `--no-web` must set `webResearch.performed = false` explicitly.
- **Cite or derive.** Every non-derived claim needs schema-conformant citation.
- **Primary agent validates.** Check claims against cited excerpt.
- **Honest about ties.** If two angles equivalent given evidence, say so.
- **Flag weak evidence.** If recommendation rests on thin/opinion sources, name it.
- **Selective loading only.** Never load entire reference files.
- **No docs/ references.** Skill never reads `docs/` at runtime.
- **Informational, not licensed advice.** May name specific securities/options/trades, but finance/legal/medical output MUST carry disclaimer. Does not substitute for RIA/attorney/clinician; never executes transactions.

### Disclaimer template
When output recommends specific securities, options, positions, legal actions, or medical choices, synthesis agent MUST stamp (verbatim or equivalent):

> **Disclaimer.** The following is informational only, sourced from live web research on {date}. It is **not licensed financial, legal, or medical advice**. Named securities, options, or positions are illustrative and sized as percentages of a risk budget, not dollar amounts. Options carry total-loss risk. You should consult a licensed professional (registered investment advisor, attorney, clinician) before acting.

Disclaimer **replaces** — does not supplement — refusal language on licensed-advice grounds. Refusing to name securities when user explicitly asks and has acknowledged informational framing is itself a contract violation.

## Reference Files
All in `resources/`. Each JSON has colocated schema.

| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: signals → paradigm/structure/strategy keys |
| `paradigms.json` | Dimension 1: paradigms (market sizing, valuation, competitive analysis, forecasting, causal inference) |
| `structures.json` | Dimension 2: structures (decision matrices, driver trees, cost–benefit, SWOT, Porter, cohort tables) |
| `strategies.json` | Dimension 3: strategies (top-down vs bottom-up, triangulation, sensitivity, benchmarks, stakeholder weighting) |
| `brief-template.json` | Subagent brief slot template with research plan + citation requirement |
| `report-template.json` | Expected report structure (with `citations[]` + `webResearch`) |
| `report-schema.json` | Report validator |
| `citation-schema.json` | Required citation entry shape |
| `synthesis-config.json` | Scoring rubric + synthesis rules, including citation-validation phase |
| `skill-context-map.json` | Domain-to-skill mapping for optional context gathering |
| `proposal-template.json` | Step 5 proposal structure template |

## Relationship to `engage-exocortex`
Share structural DNA (JSON-driven, selective loading, parallel dispatch, anti-overlap, schema-validated). Differ:

| Dimension | `engage-exocortex` | `engage-prism` |
|---|---|---|
| Problem domain | Code / algorithms / IT architecture | Business / marketing / finance |
| Knowledge base | Training recall + optional codebase | Live web research (required) |
| Paradigm catalog | Algorithmic + SE architecture | Analytical + financial + marketing |
| Citation requirement | None | Every non-derived claim |
| Degradation | Token budget | `--no-web` + explicit degradation record |

Do not invoke both on same question. `engage-exocortex` for code/architecture; `engage-prism` for business/market/finance.
