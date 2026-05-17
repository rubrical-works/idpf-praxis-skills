---
name: engage-prism
description: JSON-driven parallel analyst for business, marketing, and financial questions. Refracts one question into multiple analytical spectra, mandates live web research with schema-conformant citations, and synthesizes structured subagent reports into a single recommendation.
type: invokable
version: "1.0.1"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-17"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [business-analysis, market-research, financial-analysis, web-research, parallel-exploration, json-schema]
sharedScripts: [match-signals.js, match-signals-input-schema.json]
argument-hint: "[--paths N] [--no-proposal] [--no-web] [--model <opus|sonnet|haiku>] [--confirm-keywords] [--structured-routing]"
copyright: "Rubrical Works (c) 2026"
---
# Engage Prism — Parallel Business / Market / Finance Analyst
Tackles non-technical analytical questions — business strategy, marketing, financial/market analysis — by **fanning out into N independent analytical paths in parallel**, grounding each path in live web research, synthesizing best answer from structured subagent reports.
Reference data is schema-validated JSON in `resources/`. Loads only entries relevant to matched question signals — not full corpus. Every subagent path must cite sources per `resources/citation-schema.json`.
## Runtime Requirements
Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`). Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node 18+ on `PATH`, `ajv` installed | Invokes `scripts/match-signals.js`, `scripts/load-entries.js`, `scripts/anti-overlap-validator.js` — deterministic, ~20–100× cheaper per invocation, schema-validated input. |
| **Fallback** | None (runs in Claude inline) | Claude reads `resources/cross-references.json` + `resources/paradigms.json` + `resources/structures.json` + `resources/strategies.json`, applies matching algorithm + selective-loading + anti-overlap rules procedurally. Higher per-invocation token cost; no input schema validation; matching output structurally equivalent. |
Both paths produce same downstream JSON shape (`{ok, confidence, matchedSignals, unmatchedKeywords, scores, paths}`). Path selection happens once at preflight.
**WebFetch / WebSearch** required by default on both paths. Every subagent path performs live web research and cites sources. When tools unavailable (sandbox, `--no-web`), each report records degradation explicitly.
### Preflight (runs before Step 0)
Before any other step, primary agent MUST run `node --version`. Then:
1. **Node 18+ AND `ajv` importable** → primary path.
2. **Node 18+, `ajv` missing** → HALT with Pattern 4 diagnostic: *"This skill validates script inputs against bundled JSON Schemas using `ajv`. Either install `ajv` (`npm install ajv` in the skill directory or globally) for the primary path, or invoke the no-Node fallback procedure below — the fallback does not perform input validation. Or install Node.js 18+ from https://nodejs.org/ for the deterministic primary path."* Then proceed or follow Fallback Procedure.
3. **Node unavailable** → Pattern 4 diagnostic: *"engage-prism matches user keywords to analyst routing signals (`cross-references.json`), aggregates weighted scores across paradigms/structures/strategies, and selects N path candidates. The Node script (`match-signals.js` + `load-entries.js` + `anti-overlap-validator.js`) is the primary path — sub-second, deterministic, schema-validated. Without Node, Claude can perform the same matching inline by reading `cross-references.json` and `paradigms.json` / `structures.json` / `strategies.json` directly. Cost: ~20–100× more tokens; no input schema validation; ranking-within-ties may differ slightly. Or install Node.js 18+ from https://nodejs.org/."* Then execute Fallback Procedure.
Preflight returns `{ runtime: "node" | "none", reason: string }`.
### Fallback Procedure
When Node unavailable, perform matching, selective loading, and anti-overlap checks inline. Three inline operations replace three script calls:
#### Inline replacement for `match-signals.js`
1. **Read signals catalog** from `Skills/engage-prism/resources/cross-references.json`. Contains `signals` array — each has `id`, `keywords[]`, `paradigms[{id, weight}]`, `structures[{id, weight}]`, `strategies[{id, weight}]`.
2. **Optional: read fallback config** from `Skills/engage-prism/scripts/match-signals-config.json`. If declares non-empty `fallbackAllowlist`, `fallbackPath`, `fallbackConfidence`, `fallbackMessage`, retain for step 5.
3. **Normalize user keywords.** Lowercase, trim, replace hyphens/underscores with single spaces, collapse multiple spaces.
4. **Match each signal.** Normalize its keywords same way. For each user keyword, compute best relevance score using tiers (highest tier wins):
   - **1.0** — exact normalized-string match.
   - **0.7** — word-boundary match (shorter normalized string appears as whole-word substring of longer, with non-alphanumeric boundary characters on each side or at string edges).
   - **0.3** — substring overlap with residue guard: shorter string ≥ 4 characters and contained in longer (no word-boundary requirement). Also score 0.3 when light suffix-strip (drop `s`, `es`, `ing`, `ed`, `al`, `ly` with ≥ 4-character residue requirement) makes both stems align on whole-word match — catches `agriculture` ~ `agricultural`.
   - **0** otherwise.
   Signal's relevance score is max tier across its matching keywords. Collect each user keyword scoring > 0 in `matchedKeywords`.
5. **No-match case.** If no signals scored > 0: if fallback config present and any normalized user keyword overlaps any allowlist term (substring either direction), emit degraded result `ok: true, confidence: <fallbackConfidence>, fallback: true, matchedSignals: [], paths: [{paradigm, structure, strategy from fallbackPath}], message: <fallbackMessage>` and exit. Otherwise emit `ok: false, matchedSignals: [], message: "No matching paradigms found for the given problem characteristics."` and proceed to Step 1c's adaptive-mode branch.
6. **Aggregate weighted scores.** Sum each signal's `paradigms[i].weight` into paradigm-score map. Repeat for structures and strategies. Sort each descending.
7. **Select top-N paths.** For each of N (default 3), pick highest-scoring paradigm not yet used. Pair with best-unused structure and best-unused strategy using least-used-first tiebreaker.
8. **Compute confidence.** Mean of per-signal relevance scores across matched signals.
9. **Emit JSON envelope.** Same shape as script: `{ok, confidence, matchedSignals, unmatchedKeywords, scores, paths}`.
#### Inline replacement for `load-entries.js`
For each selected paradigm/structure/strategy id, read corresponding resource file (`resources/paradigms.json` → key `paradigms`, `resources/structures.json` → key `families`, `resources/strategies.json` → key `strategies`), find entry whose `id` matches, load only that entry. Skip unknown ids and record them. Keep combined loaded content under 10K-token soft limit — warn if approaching it.
#### Inline replacement for `anti-overlap-validator.js`
Apply four conditional rules + source-class diversity in this exact order:
1. **Rule 1 — Paradigm/structure uniqueness.** No two finalized paths share same `(paradigm, structure)` tuple. If duplicate exists, swap lower-ranked path's structure to next-best candidate.
2. **Rule 2 — Distinct primary paradigms.** Each path uses distinct primary paradigm where possible. If N exceeds available paradigms, repeats permitted but flag them.
3. **Rule 3 — External-comparison strategies required for valuation/sizing/competitive signals.** If matched signals include any of `market-entry-attractiveness`, `market-size-estimate`, `equity-fair-value`, or `earnings-thesis-update`, chosen strategy set across paths must include at least one of `benchmark-comparison`, `triangulation`, or `primary-vs-secondary-sources`. Otherwise record violation as `{description: "External-comparison strategies required for valuation / sizing / competitive signals", missingStrategySet: [the three]}`.
4. **Rule 4 — Risk-aware strategies required for scenario/shock-family signals.** If matched signals include any of `geopolitical-risk-positioning`, `commodity-shock-exposure`, `tactical-positioning-short-horizon`, or `scenario-stress-test`, chosen strategy set must include at least one of `ev-vs-risk-framing` or `sensitivity-analysis`. Otherwise record violation similarly.
5. **Source-class diversity.** Every path must declare distinct, non-empty `primarySourceClass` value. Two paths sharing source class produce labeled-but-not-substantive diversity — swap one to different documented class (`primary-filing`, `practitioner-retrospective`, `quantitative-dataset`, `adversarial-bear-source`, `trade-press`, `analyst-coverage`). Missing or empty `primarySourceClass` is itself violation.
If any rule fails, surface violations array; orchestrating step decides whether to re-pick paths or accept with noted limitation.
### Known fallback limitations
- **No input schema validation.** Fallback does not check user keywords or path counts against `match-signals-input-schema.json` / `load-entries-input-schema.json`. Schemas remain as documentation.
- **Ranking-within-ties may drift.** When two paradigms/structures/strategies tie on score, script's iteration order is deterministic from `Object.entries`; inline LLM's choice may differ. Top-N selection should still produce same set when ties don't span N boundary.
- **Scoring precision.** Script rounds to three decimals (`Math.round(x * 1000) / 1000`). Inline computation may report unrounded floats; treat as equivalent.
- **Token cost.** Inline path reads full catalog into context per invocation. ~20–100× more tokens than script invocation.
Operators with hard deterministic requirement should install Node 18+ and use primary path.
## When to use this skill
Use for non-code analytical questions about: **business strategy** (positioning, GTM, portfolio, operating model); **marketing** (campaigns, channels, segmentation, pricing, funnel); **financial/capital markets** (equity analysis, valuation, macro trends, risk); **market sizing/demand** (TAM/SAM/SOM, adoption, geography); **business/market trends** (regulatory shifts, tech adoption). Required when answer depends on **current external information**. User says "analyze", "compare", "should we…", "what's the case for…", "explore options for…".
**Do NOT use this skill for:**
- Code, algorithm, or IT-architecture questions — use `engage-exocortex`.
- Questions fully resolvable from repository or single document — direct answer cheaper.
- **Trade execution or order placement** — never executes trades, places orders, or interacts with brokerage APIs. Analysis of specific securities permitted; transactional actions not.
- **Substitute for licensed clinical, legal, or regulatory judgment** — may discuss/compare/analyze specific securities, options, or positions; does not replace registered investment advisor, attorney, or clinician. Outputs touching finance/legal/medical MUST carry standard disclaimer.
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Number of parallel paths to explore (2-4) | 3 |
| `--no-proposal` | Skip writing the proposal document | *(writes proposal)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--no-web` | Suppress web research (paths must declare they degraded to training-recall) | *(web required)* |
| `--confirm-keywords` | Opt-in: enforce the Step 1 keyword-confirmation `AskUserQuestion` gate. Off by default — primary agent proceeds to signal matching without user confirmation. Turn on for team/advisory contexts where a wrong-signal dispatch is expensive. | *(off — gate skipped)* |
| `--structured-routing` | Opt-in: route path selection through `match-signals.js` and the paradigm/structure/strategy catalog. Off by default — primary agent names paths in one sentence each and consults taxonomy entries only when genuinely useful. | *(off — taxonomy is advisory palette)* |
`--no-web` is **scoped opt-out** for sandboxes. When set, each subagent report must include `webResearch: { performed: false, reason: "..." }` so degradation visible in proposal.
`--confirm-keywords` is **scoped opt-in**. Default: primary agent restates question and keywords inline, proceeds directly. Pass flag to restore mandatory `AskUserQuestion` gate (for team/advisory contexts where wrong-signal dispatch is expensive).
`--structured-routing` is **scoped opt-in**. Default: primary agent names paths in one sentence each and loads taxonomy entries from `resources/paradigms.json` / `structures.json` / `strategies.json` only when specific entry would improve brief. Pass flag to route through `match-signals.js` and full cross-reference matrix — useful when user wants catalog-driven enumeration of rejected angles, or unfamiliar analytical domain. Matcher and catalog remain intact under flag.
## Core Workflow
```
PRIMARY AGENT
     │
     ├── 0. Mandatory web-research scoping — identify the domains to fetch/search and budget
     ├── 1. Parse question + context → extract signal keywords
     ├── 2. Match signals → load matched JSON entries selectively
     ├── 3. Score matches → select N paths (deterministic)
     ├── 4. Anti-overlap check → ensure path diversity
     ├── 5. Spawn N subagents in PARALLEL (slot-filled briefs, web-research required)
     │       ├── Path 1: [angle] ──► JSON report (with citations[])
     │       ├── Path 2: [angle] ──► JSON report (with citations[])
     │       └── Path N: [angle] ──► JSON report (with citations[])
     ├── 6. SYNTHESIS: validate claims against citations, score, optionally hybridize ──► recommendation
     └── 7. [Default] Write analysis proposal to Proposal/PRISM-{slug}.md
```
**Opt-out:** Pass `--no-proposal` to skip document generation (Step 7). Pass `--no-web` to suppress web research (record degradation per report).
## Step 0 — Web-Research Scoping (Mandatory)
**Required and distinguishes `engage-prism` from `engage-exocortex`.** Business/market/financial questions depend on current external information.
### What to scope
Research plan: **1. Entity anchors** (names, tickers, geographies, industries, products, events); **2. Source classes** (*news, earnings transcripts, regulatory filings, analyst reports, trade press, industry bodies, official statistics, company pages, review sites*); **3. Recency window** (e.g., *last 30 days* trend, *last earnings cycle* equity, *last 12 months* market-sizing); **4. Authority preferences** (primary sources > aggregators > opinion); **5. Budget** (fetches per path, default 3–5). Record in proposal's Context section. Subagents inherit via brief template.
### Citation discipline
Every claim in subagent report not derived from another cited claim must cite source conforming to `resources/citation-schema.json`:
```json
{
  "title": "string",
  "url": "string (valid URL)",
  "fetchedAt": "ISO-8601 timestamp",
  "excerpt": "short quoted or paraphrased extract supporting the claim"
}
```
Reports without schema-conformant citations flagged in synthesis and deprioritized.
### Degradation path
When WebFetch/WebSearch unavailable (sandbox, offline, `--no-web`), each report must set `webResearch.performed = false` with non-empty `reason`. Primary agent surfaces degradation explicitly in final recommendation — degraded answers never presented as if research-grounded.
**Attempted-call evidence required.** Setting `webResearch.performed = false` requires populating `webResearch.attemptedCalls[]` with at least one entry documenting actual WebFetch/WebSearch attempt (method, `targetUrl` or `query`, `errorMessage`, optional `httpStatus`, `attemptedAt` ISO-8601). Subagents must try at least one alternative source (different URL or query) before declaring unavailability — bare claims of tool unavailability without any attempted call are contract violation. Primary agent rejects any report with `performed=false` and empty `attemptedCalls[]`, re-dispatches subagent once with explicit "attempt at least one fetch" directive, and if retry also returns zero attempts, accepts report but tags `degradationEvidence="unverified"` so synthesis deprioritizes further.
### Return-side validation — reject zero-fetch returns (#220)
Primary agent treats subagent returns as untrusted input; validates **before** synthesis. Failure modes are behavioral (subagent had tools and chose not to use them), not environmental; must not be silently demoted to `degradationEvidence="unverified"`.
**Reject pattern A — `performed=false` with non-conforming `attemptedCalls[]`.** Non-conforming = missing any of: `method`, `targetUrl` (or `query`), `errorMessage`, `attemptedAt` (ISO-8601). Bare narrative ("the sandbox blocked all fetches") does not satisfy schema. Primary agent rejects and re-dispatches **once** with directive below.
**Reject pattern B — `performed=true` with `fetchCount=0`.** Internally inconsistent. Reject and re-dispatch **once** with same directive.
**Re-dispatch directive — must name primary-source URL.** Primary agent picks one URL from research plan's entity anchors (e.g., `https://www.eia.gov/petroleum/weekly/`, `https://www.sec.gov/edgar/searchedgar/companysearch`) and sends: *"You have WebFetch and WebSearch. Fetch {named primary-source URL} and cite the actual published date. A second zero-fetch return is a contract breach, not a degradation."* Directive MUST name specific URL; generic "try harder" does not satisfy contract.
**Second zero-fetch — tag `evidence-fabrication-risk` (behavioral), NOT `degradationEvidence="unverified"` (environmental).** Second zero-fetch (either pattern) → primary agent tags path `evidence-fabrication-risk`. Behavioral marker distinct from `degradationEvidence="unverified"` (genuine environmental degradation — sandbox/offline/`--no-web` with conforming `attemptedCalls[]`). MUST NOT be conflated. Synthesis surfaces `evidence-fabrication-risk` paths at top of proposal under fabrication-risk banner and excludes from any `convergent: true` claim.
### Recency gate (fast-moving topics)
Fast-moving topics (geopolitics, live markets, breaking news) can anchor on stale fetches.
- **`freshnessClass` run arg** — enum `geopolitical | market | general`; default `general`. Thresholds: `geopolitical`/`market` = 24h; `general` = 72h. Overridable per-run.
- **Gate:** For every cited anchor source, compute `ageHours = now − max(publishedAt, fetchedAt)`. If `max(ageHours) > threshold`, reject report and re-dispatch once with directive "fetch a source dated within the last {threshold}h before re-submitting".
- **≥2-source corroboration for anchors:** Before path's probability weight or price level enters synthesis as anchor, require ≥2 independent citations (distinct domains). Single-source anchors tagged `anchorEvidence="single-source"` and deprioritized.
- **Date-qualified queries:** For time-sensitive entities, include current date (`YYYY-MM-DD` or `last 24h`) in ≥1 search query. Generic queries on fast-moving topics surface stale wire pieces; date-qualified queries surface current state.
- **Graceful degradation:** If after retry gate cannot be satisfied, accept path but emit warning: `⚠️ Recency-gate degraded: freshest citation Xh old (threshold Yh)`. Never silent.
## Step 1 — Parse Question and Confirm Keywords
1. **Parse question** — identify decision at stake, constraints, what "useful answer" looks like.
2. **Extract signal keywords** from question and any entity anchors from Step 0.
### Keyword Confirmation Gate (opt-in via `--confirm-keywords`)
**Default: skipped.** Primary agent restates question and keywords inline and proceeds directly. Solo-review contexts rarely benefit from round-trip; user can still redirect.
**Opt-in:** Pass `--confirm-keywords` to restore mandatory gate (for team/advisory contexts where wrong-signal dispatch is expensive).
**3. If and only if `--confirm-keywords` set, confirm with user** using `AskUserQuestion`: restate question in 1–2 sentences; list extracted keywords; Question `"I'll analyze: {restated question}\n\nExtracted keywords: {keyword list}\n\nWeb-research plan: {plan summary}"`; Options `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the question"`, `"Adjust research plan"`.
**On response:** "Confirmed" → proceed. "Adjust" → accept corrections; re-display. "Rephrase" → accept new statement; re-parse. "Adjust plan" → accept tweaks to source classes, recency, or budget; re-display.
When flag set, no signal matching or subagent dispatch may occur without confirmation. When unset, inline restatement is confirmation surface.
### Default routing — primary agent names paths directly in one sentence each
Without `--structured-routing`, default flow skips signal matching entirely: primary agent names N paths itself, one sentence each, grounded in Step 0's entity anchors and source classes. Paradigm/structure/strategy catalogs in `resources/` become optional palette — primary agent MAY open one of `paradigms.json`, `structures.json`, or `strategies.json` to pull specific entry when it improves analysis, but MUST NOT load full catalog or use matcher to route. Paths still satisfy anti-overlap rules in Step 2 (distinct primary `sourceClass` — AC #213-3). Rejected angles named inline in one line each. `--paths N` still caps count (default 3, bounds 2–4).
### Step 1b — Match Signals (only when `--structured-routing` is set)
**Runs only when `--structured-routing` is passed.** Under default flow (flag unset), skip directly to Step 2.
4. Run signal matcher to match confirmed keywords, aggregate scores, get path candidates. **Path selection set by preflight:**
   - **Primary path (preflight returned `node`):**
     ```bash
     node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
     ```
     Script reads `resources/cross-references.json`, matches keywords against signal definitions, aggregates weighted scores, returns top N path candidates as JSON.
   - **Fallback path (preflight returned `none`):** follow "Inline replacement for `match-signals.js`" procedure. Same JSON envelope shape; no input schema validation.
5. Parse output — `ok: true` means matches were found. Use `scores.paradigms`, `scores.structures`, `scores.strategies` for path selection in Step 2.
**Fallback path — when `result.fallback === true`:** matcher found zero signal matches but detected finance/macro vocabulary term (allowlist hit). Envelope carries `confidence: 0.15`, `matchedSignals: []`, and single default `paths` entry (paradigm `scenario-analysis`, structure `scenario-grid`, strategy `ev-vs-risk-framing`). When `fallback` true, subagent MUST open with one-line note acknowledging routing is low-confidence and ask user one focused keyword-refinement question before proceeding with analysis. Do not silently proceed as if real match occurred.
### Selective Loading
For each top-scoring entry, load only matched entries. Set by preflight:
- **Primary (`node`):** `node scripts/load-entries.js paradigm <id1> [id2]...`; same for `structure`/`strategy`. Each returns only requested entries.
- **Fallback (`none`):** follow "Inline replacement for `load-entries.js`". Read `resources/paradigms.json` / `structures.json` / `strategies.json`, pick only entries whose `id` matches.
Do **not** read full resource files indiscriminately. **Token budget:** combined output stays under 10K tokens. Script warns when exceeded; fallback keeps mental estimate.
### Step 1c — Classify Match Quality
After `match-signals.js` returns, classify result into one of three tiers:
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ matched signals with at least 2 distinct primary paradigms | Structured |
| **Weak** | 1–2 matched signals, or all signals share same primary paradigm | Structured with adaptation |
| **None** | Zero matched signals (`ok: false`) | Adaptive mode (tension-driven) |
Report tier to user at confirmation gate.
When no signals match, switch to **adaptive mode**: primary agent identifies 2–4 fundamental tensions in question (e.g., *growth vs. margin*, *build vs. buy*, *early vs. late entry*, *concentrated vs. diversified*, *qualitative vs. quantitative evidence*) and defines each path by distinct resolution of those tensions. Web research still mandatory — tension framing constrains what each path fetches.
## Step 2 — Determine N and Name Paths
**Applies to Strong and Weak tiers.** Adaptive-mode paths defined in Step 1c.
### Adaptive N selection
| Question characteristics | Recommended N |
|---|---|
| One dominant analytical angle, minor variations worth checking | 2 |
| Multiple competing angles with real trade-offs | 3 (default) |
| Question is underspecified or the decision space is unusual | 4 |
| User specifies a number (e.g., `--paths 3`) | User's N |
| **Weak match tier** | **2** |
Never go below 2. Going above 4 rarely useful.
### Path naming
Path names must encode **both** analytical paradigm and key structure or strategy.
```
✅ Good: "Bottom-up TAM via channel-level unit economics"
✅ Good: "Comparable-company multiples with peer-group regression"
✅ Good: "Porter's Five Forces with substitution-risk weighting"
❌ Bad:  "Market sizing approach"
❌ Bad:  "Financial analysis"
```
### Anti-overlap check
`match-signals.js` output `paths[]` already applies paradigm diversity. Before finalizing, verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- No two paths share same paradigm **and** structure.
- Each path uses distinct primary paradigm where possible.
- No two paths use identical (paradigm, structure, strategy) tuples.
- **Every path declares distinct `primarySourceClass`** (see AC #213-3). Two paths fetching same source classes produce labeled-but-not-substantive divergence. **Primary path:** invoke `scripts/anti-overlap-validator.js → validateSourceClassDiversity(paths)` before spawning subagents. **Fallback path:** apply "Inline replacement for `anti-overlap-validator.js`" rules (4 conditional rules + source-class diversity) inline as documented under Runtime Requirements → Fallback Procedure. Either way: reject and rename duplicates before Step 3.
### Red-team path for directional questions
**Trigger heuristic (Step 2).** When question contains **stated direction** — claim user wants validated/challenged — one of N paths MUST be designated red-team (bear) path. Detect stated direction when question matches any of:
- **Phrase patterns:** "should we X", "is X a good idea", "does it make sense to X", "are we right to X", "is X the right call", "should we buy/enter/expand/divest/launch/kill X".
- **Imperative verb anchored on named action:** question framed as endorsing/rejecting specific action ("expanding into Japan B2B SaaS in 2026"), not open-ended.
- **User volunteers working thesis:** claim followed by validation-seeking question ("I think we should X — is that right?").
**Not triggered by** open-ended ("what are the trade-offs on X"), sizing ("how big is the market"), or benchmark questions — these route to normal pattern without forced bear path.
**Bear path brief contract.** When triggered, bear path brief MUST specify: **1. Assigned angle** = strongest counter-case against stated direction; name claim in plain text. **2. Citation diversity** — cite sources for-paths did not use. Bear `citations[]` must share **zero URLs** with union of other paths' citations. If overlap detected at synthesis, re-dispatch bear once with "fetch counter-evidence from distinct sources (different domains) before re-submitting". Second failure tags `bearCitationOverlap="unresolved"` and deprioritizes. **3. `primarySourceClass`** set to distinct adversarial class — typically `adversarial-bear-source` (short-seller reports, contrary analyst coverage, regulatory enforcement actions). **4. Synthesis reporting** — synthesis explicitly records whether bear path survived validation (recency, citation conformance, claim-support). Final recommendation names "bear survived" or "bear failed" as first-class signal.
`--structured-routing` does not disable this heuristic — red-team requirement applies to both default and structured-routing flows whenever trigger heuristic fires.
## Step 3 — Spawn Subagents in Parallel
Spawn all N subagents **at the same time** using Agent tool. Subagents perform research, reasoning, writing — including analysis of specific tickers, ETFs, options structures, short/hedge ideas when question calls for it. Subagents **never execute trades, place orders, or interact with brokerage APIs**; transactional actions out of scope regardless of user request. Finance/legal/medical outputs MUST stamp standard disclaimer template.
### Brief generation (slot-filling)
Read `resources/brief-template.json`. For each path, fill:
- `questionStatement` — user's question.
- `assignedAngle` — path name, paradigm/structure/strategy details, tension resolution if adaptive.
- `constraints` — decision constraints from Step 1.
- `researchPlan` — entity anchors, source classes, recency window, authority preferences, fetch budget (from Step 0).
- `citationRequirement` — reference to `resources/citation-schema.json`.
- `maxSteps` — exploration depth limit.
- `maxOutputLines` — output size cap.
### Subagent task
Each subagent: states angle and fit; **performs web research** (WebFetch/WebSearch within fetch budget, recording each source via citation schema); works through analysis with reference to fetched evidence; produces reasoned recommendation honest about data limits; identifies key risks, counter-evidence, and what would change answer.
### Report format
Subagents return JSON conforming to `resources/report-template.json`, including `citations: []` array where each entry conforms to `resources/citation-schema.json`, and `webResearch: { performed, reason?, fetchCount }` object.
Read `resources/report-schema.json` to validate each returned report. If malformed, or if `citations` empty while `webResearch.performed = true`, flag and deprioritize in synthesis.
### User-facing output contract
The subagent JSON envelope is for validation and audit, **not** for direct user consumption. The top-level synthesis agent MUST serialize each path report into markdown before including it in the final narrative.
**MUST serialize each path as markdown** with:
- A `## Path N: {paradigm} + {structure} + {strategy}` heading (or analogous path-name heading in adaptive mode)
- A short narrative summary of the path's thesis and fit
- Bulleted findings and recommendations
- Citations as numbered footnotes or inline links (never raw JSON in the narrative)
- Numeric or tabular data rendered as a markdown table
**MUST include a `## Synthesis` section** combining the paths (validation, scoring, hybridization).
**MUST append raw JSON under a collapsible block** so audit trail survives:
```
<details><summary>Raw subagent output (JSON)</summary>

```json
{ ...validated subagent envelope... }
```

</details>
```
**MUST NOT paste raw JSON into primary narrative.** If synthesis agent finds itself relaying JSON envelope verbatim, that is contract violation — serialize first, then append.
## Step 4 — Synthesis
Read `resources/synthesis-config.json` for scoring rubric.
Phases:
1. **Validate** — check each report's claims against its citations (does cited excerpt actually support the claim?). Flag unsupported claims.
2. **Score** — rate each path on rubric dimensions: *evidence strength*, *analytical rigor*, *decision usefulness*, *counter-evidence handling*, *source authority*, plus conditional domain dimensions.
3. **Hybridize** — check if best angle from one path can be combined with best evidence base or framing of another.
4. **Output** — produce final recommendation, explicitly naming grafted elements when hybridizing.
### Citation liveness spot-check (#220)
Before writing proposal, primary agent performs URL liveness spot-check on at least **one citation URL per path** (one citation per brief, per subagent). Check uses WebFetch (or HEAD/GET via WebFetch's prompt facility) against cited URL and confirms:
1. **Reachability** — URL resolves (any 2xx or 3xx response). 4xx/5xx or DNS failure tags citation `urlUnreachable: true` without inventing alternatives (per existing Error Handling row).
2. **Publish-date sanity** — page's actual publish date matches `publishedAt` (or, when absent, falls within plausible window of `fetchedAt`). Blatant mismatch (e.g., cited as 2026-04-21 but page header reads 2024-03-15) treated as fabrication signal: path re-dispatched once with directive "fetch a current source and cite the actual published date"; on second mismatch, path tagged `evidence-fabrication-risk` (see Step 0 Return-side validation).
Spot-check intentionally per-path, not per-citation — full per-citation HEAD verification too expensive for 3-path run. Per-path sufficient to catch subagent that fabricated all citations from training memory: fabricated URL set will fail spot-check on its first sampled URL with high probability. Both pass path and fail path exercised by test suite.
### Final output format
```
## Parallel Analysis: [Question Title]

### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
- Path 2: [Name] — [one-sentence summary]
...

### Evidence Base
[How many sources cited across paths, source authority mix, recency profile, known gaps.]

### Analysis
[2–4 sentences per path covering the core claim, the strongest citation, and notable gaps.
Call out any unsupported claims found during validation.]

### Recommendation
**Best angle: [Name]**
Reason: [2–3 sentences — why this wins given the stated constraints and the evidence]

[Optional] **Hybrid:** [Name] framing + [Name] evidence base
How: [1–2 sentences on how to combine them]

### What would change this answer
[2–3 bullets naming the evidence or assumption that, if updated, would flip the recommendation]
```
## Step 5 — Generate Analysis Proposal Document (slim) + Audit JSON Sibling
**Skip if `--no-proposal` was specified.**
Write **two** artifacts side by side:
1. **Main proposal** — decision-focused markdown document at `Proposal/PRISM-{question-slug}.md`. **Target: under 8KB for typical runs.**
2. **Audit sibling** — machine-readable JSON at `Proposal/PRISM-{question-slug}.audit.json` carrying raw subagent envelopes, full citation lists, per-dimension scoring matrix, `attemptedCalls[]` records, signal-matching tables.
`{question-slug}` is lowercase-hyphenated summary of question (e.g., `expand-into-japan-b2b-saas`).
Read `resources/proposal-template.json` for section structure. Key slimming rules:
1. **Metadata** — Date, skill name, paths explored, webResearchPerformed, `convergent` flag, `bearPathTriggered` flag, pointer to audit sibling.
2. **Question** — Original user query.
3. **Research Plan** — Entity anchors, source classes, recency window, authority preferences, fetch budget.
4. **Signal Analysis — collapsed to one-line footnote.** Name matched signals (or "adaptive mode — no signal match" / "default routing — primary agent named paths directly"). Full weight tables, per-paradigm scores, rejected-angle enumeration live in audit JSON, NOT in main proposal.
5. **Path sections** (one per explored path) — each path is narrative summary, not JSON dump:
   - **Brief** — one-sentence angle summary + declared `primarySourceClass`. Full brief lives in audit JSON at `paths[N].brief`.
   - **Report** — 3–6-sentence narrative: core claim, strongest citation (title + one-line excerpt), notable gaps. Full structured report — `citations[]`, `webResearch`, `attemptedCalls[]`, analysis steps — lives in audit JSON at `paths[N].report`. **Never paste raw JSON inline.**
6. **Synthesis** — Disagreement audit (convergent flag + named disagreement points), bear-path outcome (when triggered), one-line-per-path scoring summary, named hybrid if any. Full scoring matrix lives in audit JSON.
7. **Recommendation** — Final recommendation; must explicitly surface `convergent` flag, bear-path outcome, any degraded paths.
8. **What Would Change This Answer** — 2–3 specific observations that would flip recommendation.
9. **Audit** — pointer section naming audit JSON sibling file.
**Why this split.** Previous pattern embedded full signal-analysis table, every `citations[]` array, and raw subagent JSON inline — turning 50-line decision into 200-line document that hid recommendation under audit trail. Split keeps proposal decision-focused while preserving every byte of audit record in machine-readable sibling file for verification.
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4 diagnostic (preflight returns `{runtime: "none", reason: ...}`); switch to Fallback Procedure. Do **not** halt. |
| Node present but `ajv` missing | HALT with Pattern 4 diagnostic: install `ajv` for primary path, or invoke Fallback Procedure (which does not perform input validation). |
| Node version < 18 | Treat as Node-missing for preflight purposes (fall through to fallback) or surface clearer "Node.js 18+ required for primary path" diagnostic + install link (https://nodejs.org/). |
| JSON data file fails schema validation | Report validation error with file path; halt |
| Reference file missing | Fail with clear file-not-found message |
| No signals match in `cross-references.json` | Switch to adaptive (tension-driven) mode |
| Subagent returns non-conforming JSON | Flag schema violations; exclude from synthesis |
| WebFetch / WebSearch unavailable | Record `webResearch.performed = false` in each report; surface degradation in recommendation |
| Citation present but URL unreachable | Keep citation; flag `urlUnreachable: true`; do not invent alternatives |
| Citation missing required fields | Report malformed — flag and deprioritize |
## Important Constraints
- **Web research is required by default.** `--no-web` must set `webResearch.performed = false` explicitly.
- **Cite or derive.** Every non-derived claim needs schema-conformant citation.
- **Primary agent validates.** Do not blindly accept subagent claims — check against cited excerpt.
- **Be honest about ties.** If two angles genuinely equivalent given evidence, say so.
- **Flag weak evidence.** If recommendation rests on thin or opinion-grade sources, name that in recommendation.
- **Selective loading only.** Never load entire reference files. Always filter to matched entries.
- **No docs/ references.** `docs/` contains human-readable material. This skill never reads from `docs/` at runtime.
- **Informational, not licensed advice.** Skill may name specific securities, options structures, or trades when question asks for them, but every finance/legal/medical output MUST carry standard disclaimer template (below). Does not substitute for registered investment advisor, attorney, or clinician, and never executes transactions.
### Disclaimer template
When final output recommends specific securities, options, positions, legal actions, or medical choices, synthesis agent MUST stamp this disclaimer (verbatim or with equivalent force) at top of user-facing narrative:
> **Disclaimer.** The following is informational only, sourced from live web research on {date}. It is **not licensed financial, legal, or medical advice**. Named securities, options, or positions are illustrative and sized as percentages of a risk budget, not dollar amounts. Options carry total-loss risk. You should consult a licensed professional (registered investment advisor, attorney, clinician) before acting.
Disclaimer replaces — does not supplement — any language that would refuse to answer finance/legal/medical question on licensed-advice grounds. Refusing to name securities when user explicitly asks and has acknowledged informational-only framing is itself contract violation of this skill.
## Reference Files
All reference files in `resources/`. Each JSON data file has colocated schema for validation.
| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: maps question signals → paradigm / structure / strategy keys |
| `paradigms.json` | Dimension 1: analytical paradigms (market sizing, valuation, competitive analysis, forecasting, causal inference, etc.) |
| `structures.json` | Dimension 2: analytical structures (decision matrices, driver trees, cost–benefit models, SWOT, Porter, cohort tables, etc.) |
| `strategies.json` | Dimension 3: analytical strategies (top-down vs. bottom-up, triangulation, sensitivity analysis, benchmark comparison, stakeholder weighting, etc.) |
| `brief-template.json` | Subagent brief slot template with research plan and citation requirement |
| `report-template.json` | Expected subagent report structure (including `citations[]` and `webResearch`) |
| `report-schema.json` | Report validator |
| `citation-schema.json` | Required shape of every citation entry |
| `synthesis-config.json` | Scoring rubric and synthesis rules, including citation-validation phase |
| `skill-context-map.json` | Domain-to-skill mapping for optional context gathering |
| `proposal-template.json` | Document structure template for Step 5 proposal generation |
## Relationship to `engage-exocortex`
`engage-prism` and `engage-exocortex` share structural DNA (JSON-driven, selective loading, parallel subagent dispatch, anti-overlap, schema-validated reports). They differ on:
| Dimension | `engage-exocortex` | `engage-prism` |
|---|---|---|
| Problem domain | Code / algorithms / IT architecture | Business / marketing / finance |
| Knowledge base | Training recall + optional codebase context | Live web research (required) |
| Paradigm catalog | Algorithmic + SE architecture | Analytical + financial + marketing |
| Citation requirement | None | Every non-derived claim |
| Degradation | Token budget | `--no-web` flag + explicit degradation record |
Do not invoke both on same question. Choose skill that fits domain; use `engage-exocortex` for code/architecture, `engage-prism` for business/market/finance.
