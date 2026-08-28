---
name: engage-prism
description: JSON-driven parallel analyst for business, marketing, and financial questions. Refracts one question into multiple analytical spectra, mandates live web research with schema-conformant citations, and synthesizes structured subagent reports into a single recommendation.
effort: high
type: invokable
version: "1.0.2"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-18"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [business-analysis, market-research, financial-analysis, web-research, parallel-exploration, json-schema]
sharedScripts: [match-signals.js, match-signals-input-schema.json]
argument-hint: "[--paths N] [--no-proposal] [--no-web] [--model <opus|sonnet|haiku>] [--confirm-keywords] [--structured-routing]"
copyright: "Rubrical Works (c) 2026"
---
# Engage Prism — Parallel Business / Market / Finance Analyst
Tackles non-technical analytical questions — business strategy, marketing, financial/market analysis — by **fanning out into N independent analytical paths in parallel**, grounding each in live web research, synthesizing the best answer from structured subagent reports.
Reference data is schema-validated JSON in `resources/`; only entries matching the question signals are loaded, not the full corpus. Every subagent path must cite sources per `resources/citation-schema.json`.
## Runtime Requirements
Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`). Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node.js 18+ on `PATH`; `ajv` optional | Invokes `scripts/match-signals.js`, `scripts/load-entries.js`, `scripts/anti-overlap-validator.js` — deterministic, ~20–100× cheaper per invocation than inline. Input is schema-validated when `ajv` resolves; when it does not, the scripts still run and say so (see below). |
| **Fallback** | None (runs in Claude inline) | Claude reads `resources/cross-references.json` + `paradigms.json` + `structures.json` + `strategies.json`, applies matching + selective-loading + anti-overlap rules procedurally. Higher token cost; no input schema validation; output structurally equivalent. |
Both paths produce the same downstream JSON shape (`{ok, confidence, matchedSignals, unmatchedKeywords, scores, paths}`); path selection happens once at preflight.
**WebFetch / WebSearch** required by default on both paths: every subagent path performs live web research and cites sources. When unavailable (sandbox, `--no-web`), each report records the degradation explicitly.
### Preflight (runs before Step 0)
Before any other step — before research scoping, keyword extraction, or signal matching — the primary agent MUST run `node --version`. Then:
1. **Node 18+ AND `ajv` importable (`node -e "require('ajv')"`)** → primary path with input validation active. Proceed to Step 0 using the scripted invocations. Each script envelope carries `"validation": "passed"`.
2. **Node 18+ but `ajv` missing** → **do not halt.** The primary path still runs; input schema validation does not. Each script emits one stderr line naming the missing module and the consequence, sets `"validation": "unavailable"` in its result envelope, and exits `0`. Surface the Pattern 4 diagnostic: *"This skill validates script inputs against bundled JSON Schemas using `ajv`, which is not resolvable here. The scripts still run and their output is still usable — but it is unvalidated, and every envelope says so (`"validation": "unavailable"`). Install `ajv` (`npm install ajv` in the skill directory or globally) to turn validation on."* Then proceed. Treat `"validation": "unavailable"` as a signal to read script output a little more carefully, not as an error. (#275 — supersedes the #252 hard-fail.)
3. **Node unavailable** → Pattern 4 diagnostic in diagnostic-order: *"engage-prism matches user keywords to analyst routing signals (`cross-references.json`), aggregates weighted scores across paradigms/structures/strategies, and selects N path candidates. The Node script (`match-signals.js` + `load-entries.js` + `anti-overlap-validator.js`) is the primary path — sub-second, deterministic, schema-validated. Without Node, Claude can perform the same matching inline by reading `cross-references.json` and `paradigms.json` / `structures.json` / `strategies.json` directly, applying the algorithm described in the Fallback Procedure below. Cost: ~20–100× more tokens; no input schema validation; ranking-within-ties may differ slightly from the script. Or install Node.js 18+ from https://nodejs.org/ for the deterministic primary path."* Then execute Fallback Procedure.
Preflight returns `{ runtime: "node" | "none", reason: string, ajv: boolean }` for subsequent steps to read.
### Fallback Procedure
When Node is unavailable (or the operator chooses the no-Node path), perform matching, selective loading, and anti-overlap checks inline — three inline operations replace the three script calls:
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
6. **Aggregate weighted scores.** Sum each signal's `paradigms[i].weight` into paradigm-score map (keyed by paradigm `id`). Repeat for structures and strategies. Sort each descending.
7. **Select top-N paths.** For each of N (default 3), pick highest-scoring paradigm not yet used. Pair with best-unused structure and best-unused strategy using least-used-first tiebreaker (count uses across already-selected paths; prefer lowest use count, then highest score).
8. **Compute confidence.** Mean of per-signal relevance scores across matched signals.
9. **Emit JSON envelope.** Same shape as script: `{ok, confidence, matchedSignals: [{id, matchedKeywords, relevance}], unmatchedKeywords, scores: {paradigms, structures, strategies}, paths: [{paradigm, paradigmScore, structure, structureScore, strategy, strategyScore}]}`.
#### Inline replacement for `load-entries.js`
For each selected paradigm/structure/strategy id, read corresponding resource file (`resources/paradigms.json` → key `paradigms`, `resources/structures.json` → key `families`, `resources/strategies.json` → key `strategies`), find entry whose `id` matches, load only that entry. Skip unknown ids and record them. Keep combined loaded content under the same 10K-token soft limit the script enforces — warn if approaching it.
#### Inline replacement for `anti-overlap-validator.js`
Apply four conditional rules + source-class diversity in this exact order:
1. **Rule 1 — Paradigm/structure uniqueness.** No two finalized paths share same `(paradigm, structure)` tuple. If duplicate exists, swap lower-ranked path's structure to next-best candidate.
2. **Rule 2 — Distinct primary paradigms.** Each path uses distinct primary paradigm where possible. If N exceeds available paradigms, repeats permitted but flag them.
3. **Rule 3 — External-comparison strategies required for valuation/sizing/competitive signals.** If matched signals include any of `market-entry-attractiveness`, `market-size-estimate`, `equity-fair-value`, or `earnings-thesis-update`, chosen strategy set across paths must include at least one of `benchmark-comparison`, `triangulation`, or `primary-vs-secondary-sources`. Otherwise record violation as `{description: "External-comparison strategies required for valuation / sizing / competitive signals", missingStrategySet: [the three]}`.
4. **Rule 4 — Risk-aware strategies required for scenario/shock-family signals.** If matched signals include any of `geopolitical-risk-positioning`, `commodity-shock-exposure`, `tactical-positioning-short-horizon`, or `scenario-stress-test`, chosen strategy set must include at least one of `ev-vs-risk-framing` or `sensitivity-analysis`. Otherwise record violation similarly.
5. **Source-class diversity.** Every path must declare distinct, non-empty `primarySourceClass` value. Two paths sharing source class produce labeled-but-not-substantive diversity — swap one to different documented class (`primary-filing`, `practitioner-retrospective`, `quantitative-dataset`, `adversarial-bear-source`, `trade-press`, `analyst-coverage`). Missing or empty `primarySourceClass` is itself violation.
If any rule fails, surface violations array; orchestrating step decides whether to re-pick paths or accept with noted limitation.
### Known fallback limitations
- **No input schema validation.** Fallback does not check keywords or path counts against `match-signals-input-schema.json` / `load-entries-input-schema.json`; schemas remain as documentation.
- **Ranking-within-ties may drift.** Script tie order is deterministic from `Object.entries`; inline choice may differ. Top-N set should still match when ties don't span the N boundary.
- **Scoring precision.** Script rounds to three decimals (`Math.round(x * 1000) / 1000`); inline floats may be unrounded — treat as equivalent.
- **Token cost.** Inline path reads the full catalog per invocation: ~20–100× more tokens.
Operators needing hard determinism should install Node.js 18+ and use the primary path.
## When to use this skill
Use for non-code analytical questions about: **business strategy** (positioning, GTM, portfolio, operating model); **marketing** (campaigns, channels, segmentation, pricing, messaging, funnel); **financial/capital markets** (equity or ticker analysis, valuation, macro trends, sector comparison, risk); **market sizing/demand** (TAM/SAM/SOM, adoption curves, geography); **business/market trends** (emerging behaviors, regulatory shifts, tech adoption). Required when the answer depends on **current external information**. User says "analyze", "compare", "should we…", "what's the case for…", "explore options for…".
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
| `--confirm-keywords` | Opt-in: enforce the Step 1 keyword-confirmation `AskUserQuestion` gate. Turn on for team/advisory contexts where a wrong-signal dispatch is expensive. | *(off — gate skipped)* |
| `--structured-routing` | Opt-in: route path selection through `match-signals.js` and the paradigm/structure/strategy catalog. | *(off — taxonomy is advisory palette)* |
`--no-web` is a **scoped opt-out** for sandboxes without WebFetch/WebSearch. When set, each report must include `webResearch: { performed: false, reason: "..." }` so the degradation is visible in the proposal.
`--confirm-keywords` is a **scoped opt-in**: default restates question and keywords inline and proceeds; the flag restores the mandatory Step 1 `AskUserQuestion` gate.
`--structured-routing` is **scoped opt-in**. Default: primary agent names paths in one sentence each (e.g., "top-down TAM by macro segments") and loads taxonomy entries only when a specific entry improves the brief. Pass flag to route through `match-signals.js` and the full cross-reference matrix — useful for catalog-driven enumeration of rejected angles or an unfamiliar domain. Matcher and catalog remain intact under flag.
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
**Opt-out:** `--no-proposal` skips Step 7; `--no-web` suppresses web research (record degradation per report).
## Step 0 — Web-Research Scoping (Mandatory)
**Required; distinguishes `engage-prism` from `engage-exocortex`.** These questions depend on current external information — skipping web research produces stale, hallucination-prone answers.
### What to scope
Research plan: **1. Entity anchors** (names, tickers, geographies, industries, products, events); **2. Source classes** (*news, earnings transcripts, regulatory filings, analyst reports, trade press, industry bodies, official statistics, company pages, review sites*); **3. Recency window** (e.g., *last 30 days* trend, *last earnings cycle* equity, *last 12 months* market-sizing); **4. Authority preferences** (primary sources > aggregators > opinion); **5. Budget** (fetches per path, default 3–5). Record in the proposal's Context section; subagents inherit it via the brief template.
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
**Attempted-call evidence required.** Setting `webResearch.performed = false` requires populating `webResearch.attemptedCalls[]` with at least one entry documenting actual WebFetch/WebSearch attempt (method, `targetUrl` or `query`, `errorMessage`, optional `httpStatus`, `attemptedAt` ISO-8601). Subagents must try at least one alternative source (different URL or query) before declaring unavailability — bare unavailability claims with no attempted call are a contract violation. Primary agent rejects `performed=false` with empty `attemptedCalls[]`, re-dispatches once with an explicit "attempt at least one fetch" directive; if the retry also returns zero attempts, accepts but tags `degradationEvidence="unverified"` for further deprioritization.
### Return-side validation — reject zero-fetch returns (#220)
Primary agent treats subagent returns as untrusted input; validates **before** synthesis. Both failure modes are behavioral (tools available, unused), not environmental, and must not be silently demoted to `degradationEvidence="unverified"`.
**Reject pattern A — `performed=false` with non-conforming `attemptedCalls[]`.** Non-conforming = missing any of: `method`, `targetUrl` (or `query`), `errorMessage`, `attemptedAt` (ISO-8601). Bare narrative ("the sandbox blocked all fetches") does not satisfy schema. Primary agent rejects and re-dispatches **once** with directive below.
**Reject pattern B — `performed=true` with `fetchCount=0`.** Internally inconsistent: a subagent claiming research was performed must report at least one fetch. Reject and re-dispatch **once** with same directive.
**Re-dispatch directive — must name primary-source URL.** Primary agent picks one URL from research plan's entity anchors (e.g., `https://www.eia.gov/petroleum/weekly/`, `https://www.sec.gov/edgar/searchedgar/companysearch`) and sends: *"You have WebFetch and WebSearch. Fetch {named primary-source URL} and cite the actual published date. A second zero-fetch return is a contract breach, not a degradation."* Directive MUST name specific URL; generic "try harder" does not satisfy contract.
**Second zero-fetch — tag `evidence-fabrication-risk` (behavioral), NOT `degradationEvidence="unverified"` (environmental).** A second zero-fetch (either pattern) tags the path `evidence-fabrication-risk`. The two MUST NOT be conflated: `evidence-fabrication-risk` = tools available, unused; `degradationEvidence="unverified"` = genuine environmental degradation (sandbox/offline/`--no-web` with conforming `attemptedCalls[]`) where the subagent attempted but could not verify. Synthesis surfaces `evidence-fabrication-risk` paths at the top of the proposal under a fabrication-risk banner (see Step 5) and excludes them from any `convergent: true` claim.
### Recency gate (fast-moving topics)
Fast-moving topics (active geopolitical events, live markets, breaking news) can anchor on stale fetches and diverge across same-day runs; the gate catches this at validation.
- **`freshnessClass` run arg** — enum `geopolitical | market | general`; default `general`. Thresholds: `geopolitical`/`market` = 24h; `general` = 72h. Overridable per-run.
- **Gate:** For every cited anchor source, compute `ageHours = now − max(publishedAt, fetchedAt)`. If `max(ageHours) > threshold`, reject the path report and re-dispatch once with directive "fetch a source dated within the last {threshold}h before re-submitting" (same reject + one-retry pattern as the attempted-call gate).
- **≥2-source corroboration for anchors:** Before path's probability weight or price level enters synthesis as anchor, require ≥2 independent citations (distinct domains). Single-source anchors tagged `anchorEvidence="single-source"` and deprioritized in Path scoring.
- **Date-qualified queries:** For time-sensitive entities, include the current date (`YYYY-MM-DD` or `last 24h`) in ≥1 search query before accepting results — generic queries surface stale wire pieces.
- **Graceful degradation:** If after retry gate cannot be satisfied, accept path but emit explicit warning in the path Report: `⚠️ Recency-gate degraded: freshest citation Xh old (threshold Yh)`. Never silent.
## Step 1 — Parse Question and Confirm Keywords
1. **Parse question** — identify decision at stake, constraints, what "useful answer" looks like.
2. **Extract signal keywords** from question and any entity anchors from Step 0.
### Keyword Confirmation Gate (opt-in via `--confirm-keywords`)
**Default: skipped.** Primary agent restates question and keywords inline and proceeds directly; the user can still redirect.
**Opt-in:** Pass `--confirm-keywords` to restore mandatory gate (previous default behavior, for team/advisory contexts where wrong-signal dispatch is expensive).
**3. If and only if `--confirm-keywords` set, confirm with user** using `AskUserQuestion`: restate question in 1–2 sentences; list extracted keywords; Question `"I'll analyze: {restated question}\n\nExtracted keywords: {keyword list}\n\nWeb-research plan: {plan summary}"`; Options `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the question"`, `"Adjust research plan"`.
**On response:** "Confirmed" → proceed to signal matching. "Adjust keywords" → accept corrections, re-display. "Rephrase" → re-parse from scratch. "Adjust plan" → accept tweaks to source classes, recency, or budget; re-display.
When flag set, no signal matching or subagent dispatch may occur without confirmation passing this gate. When unset, inline restatement is confirmation surface.
### Default routing — primary agent names paths directly in one sentence each
Without `--structured-routing`, the default flow skips signal matching entirely: primary agent names N paths itself, one sentence each, grounded in Step 0's entity anchors and source classes. The `resources/` catalogs become an optional palette — the agent MAY open `paradigms.json`, `structures.json`, or `strategies.json` for a specific entry that improves the analysis, but MUST NOT load a full catalog or use the matcher to route. Paths still satisfy the Step 2 anti-overlap rules (distinct primary `sourceClass` — AC #213-3). Rejected angles named inline, one line each. `--paths N` still caps count (default 3, bounds 2–4).
### Step 1b — Match Signals (only when `--structured-routing` is set)
**Runs only when `--structured-routing` is passed.** Under default flow (flag unset), skip directly to Step 2.
4. Run signal matcher to match confirmed keywords, aggregate scores, get path candidates. **Path selection set by preflight:**
   - **Primary path (preflight returned `node`):**
     ```bash
     node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
     ```
     Script reads `resources/cross-references.json`, matches keywords against signal definitions, aggregates weighted scores, returns top N path candidates as JSON.
   - **Fallback path (preflight returned `none`):** follow "Inline replacement for `match-signals.js`" procedure under Runtime Requirements → Fallback Procedure. Same JSON envelope shape; no input schema validation; see Known fallback limitations.
5. Parse output — `ok: true` means matches were found. Use `scores.paradigms`, `scores.structures`, `scores.strategies` for path selection in Step 2.
**Fallback path — when `result.fallback === true`:** zero signal matches but a finance/macro vocabulary allowlist hit. Envelope carries `confidence: 0.15`, `matchedSignals: []`, and one default `paths` entry (paradigm `scenario-analysis`, structure `scenario-grid`, strategy `ev-vs-risk-framing`). The subagent MUST open with a one-line note that routing is low-confidence and ask one focused keyword-refinement question before analysing. Do not silently proceed as if a real match occurred.
### Selective Loading
For each top-scoring entry from the match output, load only that entry. Set by preflight:
- **Primary (`node`):** `node scripts/load-entries.js paradigm <id1> [id2]...`; same for `structure`/`strategy`. Each returns only requested entries from the corresponding reference file.
- **Fallback (`none`):** follow "Inline replacement for `load-entries.js`". Read `resources/paradigms.json` / `structures.json` / `strategies.json`, pick only entries whose `id` matches.
Either way: do **not** read full resource files indiscriminately. **Token budget:** combined output stays under 10K tokens. Script warns when exceeded; fallback keeps a running estimate and stops loading near the limit.
### Step 1c — Classify Match Quality
Classify the match result into one of three tiers:
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ matched signals with at least 2 distinct primary paradigms | Structured |
| **Weak** | 1–2 matched signals, or all signals share same primary paradigm | Structured with adaptation |
| **None** | Zero matched signals (`ok: false`) | Adaptive mode (tension-driven) |
Report tier to user at confirmation gate.
When no signals match, switch to **adaptive mode**: identify 2–4 fundamental tensions in the question (e.g., *growth vs. margin*, *build vs. buy*, *early vs. late entry*, *concentrated vs. diversified*) and define each path by a distinct resolution of them. Web research still mandatory — tension framing constrains what each path fetches.
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
✅ Good: "Porter's Five Forces with substitution-risk weighting"
❌ Bad:  "Market sizing approach"
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
- **Imperative verb anchored on named action:** question framed as endorsing/rejecting specific action ("expanding into Japan B2B SaaS in 2026", "doubling down on outbound"), not open-ended exploration ("what are the angles on Japan entry?").
- **User volunteers working thesis:** claim followed by validation-seeking question ("I think we should X — is that right?").
**Not triggered by** open-ended exploratory ("what are the trade-offs on X"), sizing ("how big is the market for Z"), or benchmark questions — these route to the normal parallel-exploration pattern without a forced bear path.
**Bear path brief contract.** When triggered, bear path brief MUST specify: **1. Assigned angle** = strongest counter-case against stated direction; name claim in plain text. **2. Citation diversity** — cite sources for-paths did not use. Bear `citations[]` must share **zero URLs** with union of other paths' citations. If overlap detected at synthesis, re-dispatch bear once with "fetch counter-evidence from distinct sources (different domains) before re-submitting". Second failure tags `bearCitationOverlap="unresolved"` and deprioritizes. **3. `primarySourceClass`** set to a distinct adversarial class — typically `adversarial-bear-source` (short-seller reports, contrary analyst coverage, regulatory enforcement actions). **4. Synthesis reporting** — synthesis explicitly records whether bear path survived validation (recency, citation conformance, claim-support). Final recommendation names "bear survived" or "bear failed" as first-class signal.
`--structured-routing` does not disable this heuristic — red-team requirement applies to both default and structured-routing flows whenever trigger heuristic fires.
## Step 3 — Spawn Subagents in Parallel
Spawn all N subagents **at the same time** using the Agent tool. Subagents research, reason, and write — including analysis of specific tickers, ETFs, options structures, and short/hedge ideas when the question calls for it. Subagents **never execute trades, place orders, or interact with brokerage APIs** regardless of user request. Finance/legal/medical outputs MUST stamp the standard disclaimer template.
### Brief generation (slot-filling)
Read `resources/brief-template.json`; for each path fill:
- `questionStatement` — the user's question.
- `assignedAngle` — path name, paradigm/structure/strategy details, tension resolution if adaptive.
- `constraints` — from Step 1.
- `researchPlan` — entity anchors, source classes, recency window, authority preferences, fetch budget (from Step 0).
- `citationRequirement` — reference to `resources/citation-schema.json`.
- `maxSteps` — depth limit. `maxOutputLines` — output size cap.
### Subagent task
Each subagent: states angle and fit; **performs web research** (WebFetch/WebSearch within the fetch budget, recording each source via the citation schema); analyses against fetched evidence; produces a reasoned recommendation honest about data limits; identifies key risks, counter-evidence, and what would change the answer.
### Report format
Subagents return JSON conforming to `resources/report-template.json`, including `citations: []` array where each entry conforms to `resources/citation-schema.json`, and `webResearch: { performed, reason?, fetchCount }` object.
Validate each returned report against `resources/report-schema.json`. If malformed, or `citations` empty while `webResearch.performed = true`, flag and deprioritize in synthesis.
### User-facing output contract
The subagent JSON envelope is for validation and audit, **not** direct user consumption. The synthesis agent MUST serialize each path report into markdown before including it in the final narrative.
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
**MUST NOT paste raw JSON into primary narrative.** If synthesis agent finds itself relaying JSON envelope verbatim, that is contract violation — render first, then append.
## Step 4 — Synthesis
Read `resources/synthesis-config.json` for scoring rubric.
Phases:
1. **Validate** — check each report's claims against its citations (does cited excerpt actually support the claim?). Flag unsupported claims.
2. **Score** — rate each path on rubric dimensions: *evidence strength*, *analytical rigor*, *decision usefulness*, *counter-evidence handling*, *source authority*, plus conditional domain dimensions.
3. **Hybridize** — check if best angle from one path can be combined with best evidence base or framing of another.
4. **Output** — produce final recommendation, explicitly naming grafted elements when hybridizing.
### Citation liveness spot-check (#220)
Before writing the proposal, primary agent spot-checks at least **one citation URL per path** via WebFetch (or HEAD/GET through WebFetch's prompt facility), confirming:
1. **Reachability** — URL resolves (any 2xx or 3xx response). 4xx/5xx or DNS failure tags citation `urlUnreachable: true` without inventing alternatives (per existing Error Handling row).
2. **Publish-date sanity** — page's publish date matches `publishedAt` (or, when absent, falls within a plausible window of `fetchedAt`). Blatant mismatch (cited 2026-04-21, page header reads 2024-03-15) is a fabrication signal: re-dispatch once with "fetch a current source and cite the actual published date"; on a second mismatch, tag the path `evidence-fabrication-risk` (see Step 0 Return-side validation).
Per-path, not per-citation — full per-citation HEAD verification is too expensive; a wholly fabricated URL set fails on its first sampled URL with high probability. Both pass and fail paths are exercised by the test suite.
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
Write **two** artifacts:
1. **Main proposal** — decision-focused markdown document at `Proposal/PRISM-{question-slug}.md`. **Target: under 8KB for typical runs.**
2. **Audit sibling** — machine-readable JSON at `Proposal/PRISM-{question-slug}.audit.json` carrying raw subagent envelopes, full citation lists, per-dimension scoring matrix, `attemptedCalls[]` records, and signal-matching tables.
`{question-slug}` is lowercase-hyphenated summary of question (e.g., `expand-into-japan-b2b-saas`).
Read `resources/proposal-template.json` for section structure. Key slimming rules:
1. **Metadata** — Date, skill name, paths explored, webResearchPerformed, `convergent` flag, `bearPathTriggered` flag, pointer to audit sibling.
2. **Question** — Original user query.
3. **Research Plan** — Entity anchors, source classes, recency window, authority prefs, fetch budget.
4. **Signal Analysis — collapsed to one-line footnote.** Name matched signals (or "adaptive mode — no signal match" / "default routing — primary agent named paths directly"). Full weight tables, per-paradigm scores, rejected-angle enumeration live in audit JSON, NOT in main proposal.
5. **Path sections** (one per explored path) — each path is narrative summary, not JSON dump:
   - **Brief** — one-sentence angle summary + declared `primarySourceClass`. Full brief lives in audit JSON at `paths[N].brief`.
   - **Report** — 3–6-sentence narrative: core claim, strongest citation (title + one-line excerpt), notable gaps. Full structured report (`citations[]`, `webResearch`, `attemptedCalls[]`, analysis steps) lives in audit JSON at `paths[N].report`. **Never paste raw JSON inline.**
6. **Synthesis** — Disagreement audit (convergent flag + named disagreement points), bear-path outcome (when triggered), one-line-per-path scoring summary, named hybrid if any. Full scoring matrix in audit JSON.
7. **Recommendation** — must explicitly surface the `convergent` flag, bear-path outcome, and any degraded paths.
8. **What Would Change This Answer** — 2–3 specific observations that would flip it.
9. **Audit** — pointer naming the audit JSON sibling.
**Why this split.** Keeps the proposal decision-focused while preserving every byte of the audit record in a machine-readable sibling.
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4 diagnostic (preflight returns `{runtime: "none", reason: ...}`); switch to Fallback Procedure (see Runtime Requirements). Do **not** halt — the no-Node path is supported. |
| Node present but `ajv` missing | Do **not** halt. Scripts run, emit one stderr warning, report `"validation": "unavailable"` in the result envelope, and exit `0`. Install `ajv` to enable input validation. A genuine schema violation still halts with exit `1`. |
| Node version < 18 | Treat as Node-missing (fall through to fallback), or surface a clearer "Node.js 18+ required for primary path" diagnostic + install link (https://nodejs.org/). |
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
- **No docs/ references.** `docs/` is human-readable material; never read from it at runtime.
- **Informational, not licensed advice.** Skill may name specific securities, options structures, or trades when question asks for them, but every finance/legal/medical output MUST carry standard disclaimer template (below). Does not substitute for registered investment advisor, attorney, or clinician, and never executes transactions.
### Disclaimer template
When final output recommends specific securities, options, positions, legal actions, or medical choices, synthesis agent MUST stamp this disclaimer (verbatim or with equivalent force) at top of user-facing narrative:
> **Disclaimer.** The following is informational only, sourced from live web research on {date}. It is **not licensed financial, legal, or medical advice**. Named securities, options, or positions are illustrative and sized as percentages of a risk budget, not dollar amounts. Options carry total-loss risk. You should consult a licensed professional (registered investment advisor, attorney, clinician) before acting.
Disclaimer replaces — does not supplement — any language that would refuse to answer finance/legal/medical question on licensed-advice grounds. Refusing to name securities when user explicitly asks and has acknowledged informational-only framing is itself contract violation of this skill.
## Reference Files
All in `resources/`; each JSON data file has a colocated validation schema.
| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: maps question signals → paradigm / structure / strategy keys |
| `paradigms.json` | Dimension 1: analytical paradigms (market sizing, valuation, competitive analysis, forecasting, causal inference) |
| `structures.json` | Dimension 2: analytical structures (decision matrices, driver trees, cost–benefit models, SWOT, Porter, cohort tables) |
| `strategies.json` | Dimension 3: analytical strategies (top-down vs. bottom-up, triangulation, sensitivity analysis, benchmark comparison, stakeholder weighting) |
| `brief-template.json` | Subagent brief slot template with research plan and citation requirement |
| `report-template.json` | Expected subagent report structure (including `citations[]` and `webResearch`) |
| `report-schema.json` | Report validator |
| `citation-schema.json` | Required shape of every citation entry |
| `synthesis-config.json` | Scoring rubric and synthesis rules, including citation-validation phase |
| `skill-context-map.json` | Domain-to-skill mapping for optional context gathering |
| `proposal-template.json` | Document structure template for Step 5 proposal generation |
## Relationship to `engage-exocortex`
Both share structural DNA (JSON-driven, selective loading, parallel subagent dispatch, anti-overlap, schema-validated reports). They differ on:
| Dimension | `engage-exocortex` | `engage-prism` |
|---|---|---|
| Problem domain | Code / algorithms / IT architecture | Business / marketing / finance |
| Knowledge base | Training recall + optional codebase context | Live web research (required) |
| Paradigm catalog | Algorithmic + SE architecture | Analytical + financial + marketing |
| Citation requirement | None | Every non-derived claim |
| Degradation | Token budget | `--no-web` flag + explicit degradation record |
Do not invoke both on the same question: `engage-exocortex` for code/architecture, `engage-prism` for business/market/finance.
