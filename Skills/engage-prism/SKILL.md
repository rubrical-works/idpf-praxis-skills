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
copyright: "Rubrical Works (c) 2026"
---
# Engage Prism — Parallel Business / Market / Finance Analyst
Fans non-technical analytical questions (business, marketing, financial) into N independent paths in parallel, grounds each in live web research, and synthesizes structured subagent reports.
Reference data is schema-validated JSON in `resources/`. Loads only matched entries. Every path cites sources per `resources/citation-schema.json`.
## Prerequisites
- **Node.js 18+** — shells to `node scripts/match-signals.js` (Step 1b) and `node scripts/load-entries.js` (Selective Loading). No non-Node fallback.
- **WebFetch / WebSearch** — required by default. Every path performs live web research and cites sources. When unavailable (`--no-web`), each report records degradation.
- **Optional: `ajv`** — validates inputs against `*-input-schema.json` when available; skipped silently otherwise.
Node 18+ floor matches active/previous LTS. If Node missing, see `install-node` skill.
## When to use this skill
Use for non-code analytical questions:
- **Business strategy** (competitive positioning, GTM, portfolio, operating model)
- **Marketing** (campaign, channel mix, segmentation, pricing, messaging, funnel)
- **Financial / capital markets** (equity/ticker, valuation, macro, sector, risk)
- **Market sizing / demand** (TAM/SAM/SOM, adoption, geography)
- **Business / market trends** (behaviors, regulatory, tech adoption)
- Answer depends on current external info — training recall insufficient
- User says "analyze", "compare", "should we…", "what's the case for…", "explore options for…"
**Do NOT use for:**
- Code/algorithm/IT-architecture — use `engage-exocortex`
- Questions fully resolvable from repo or single doc — direct answer cheaper
- Trade execution/order placement (never executes trades regardless of request)
- Substitute for licensed clinical/legal/regulatory judgment — specific-security analysis permitted; outputs MUST carry the disclaimer template
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths (2-4) | 3 |
| `--no-proposal` | Skip proposal doc | *(writes)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--no-web` | Suppress web research (paths record degradation) | *(web required)* |
`--no-web` is scoped opt-out for sandboxed envs. Each report must include `webResearch: { performed: false, reason: "..." }`.
## Core Workflow
```
PRIMARY AGENT
     │
     ├── 0. Mandatory web-research scoping — identify domains to fetch/search and budget
     │
     ├── 1. Parse question + context → extract signal keywords
     ├── 2. Match signals → load matched JSON entries selectively
     ├── 3. Score matches → select N paths (deterministic)
     ├── 4. Anti-overlap check → ensure path diversity
     │
     ├── 5. Spawn N subagents in PARALLEL (slot-filled briefs, web-research required)
     │       │
     │       ├── Path 1: [angle] ──► JSON report (with citations[])
     │       ├── Path 2: [angle] ──► JSON report (with citations[])
     │       └── Path N: [angle] ──► JSON report (with citations[])
     │
     ├── 6. SYNTHESIS: validate claims against citations, score, optionally hybridize ──► recommendation
     │
     └── 7. [Default] Write analysis proposal to Proposal/PRISM-{slug}.md
```
**Opt-out:** `--no-proposal` skips Step 7. `--no-web` suppresses web research.
## Step 0 — Web-Research Scoping (Mandatory)
Required; distinguishes prism from exocortex. Skipping produces stale, hallucination-prone answers.
### What to scope
Before signal matching, produce a research plan with:
1. **Entity anchors.** Names, tickers, geographies, industries, products, events.
2. **Source classes.** news, earnings transcripts, regulatory filings, analyst reports, trade press, industry bodies, official statistics, company pages, review sites.
3. **Recency window.** e.g., last 30 days (trend), last earnings cycle (equity), last 12 months (sizing).
4. **Authority preferences.** Primary (filings, regulator, official stats) > aggregators > opinion.
5. **Budget.** Fetches per path (default 3–5).
Record plan in proposal Context section. Subagents inherit via brief template.
### Citation discipline
Every non-derived claim must cite a source conforming to `resources/citation-schema.json`:
```json
{
  "title": "string",
  "url": "string (valid URL)",
  "fetchedAt": "ISO-8601 timestamp",
  "excerpt": "short quoted or paraphrased extract supporting the claim"
}
```
Reports without schema-conformant citations are flagged and deprioritized.
### Degradation path
When WebFetch/WebSearch unavailable (sandbox, offline, `--no-web`), each report sets `webResearch.performed = false` with non-empty `reason`. Primary agent surfaces degradation in final recommendation.
## Step 1 — Parse Question and Confirm Keywords
1. **Parse question** — identify decision, constraints, what "useful answer" looks like.
2. **Extract signal keywords** from question and Step 0 anchors.
### Keyword Confirmation Gate (Mandatory)
Before signal matching, confirm interpreted question and keywords via `AskUserQuestion`.
- Restate interpreted question in 1–2 sentences
- List extracted keywords
- `AskUserQuestion` with:
  - Question: `"I'll analyze: {restated}\n\nExtracted keywords: {list}\n\nWeb-research plan: {summary}"`
  - Options: `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the question"`, `"Adjust research plan"`
**On response:**
- **Confirmed**: proceed to signal matching
- **Adjust keywords**: accept corrections; re-display
- **Rephrase**: accept new; re-parse
- **Adjust research plan**: accept tweaks; re-display
**No signal matching or dispatch may occur without confirmation.**
### Step 1b — Match Signals
```bash
node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
```
Reads `resources/cross-references.json`, matches keywords, aggregates weighted scores across paradigms/structures/strategies, returns top N candidates JSON.
Parse output — `ok: true` means matched. Use `scores.paradigms`, `scores.structures`, `scores.strategies`.
**Fallback path (`result.fallback === true`):** matcher found zero signal matches but allowlist term (finance/macro vocabulary) present. Envelope carries `confidence: 0.15`, `matchedSignals: []`, default path (`scenario-analysis` / `scenario-grid` / `ev-vs-risk-framing`). Subagent MUST open with low-confidence acknowledgement and ask one keyword-refinement question before proceeding.
### Selective Loading
```bash
node scripts/load-entries.js paradigm <id1> [id2] [...]
node scripts/load-entries.js structure <id1> [id2] [...]
node scripts/load-entries.js strategy <id1> [id2] [...]
```
Returns only requested entries. Do **not** read full resource files directly.
**Token budget:** combined output < 10K tokens; script warns when exceeded.
### Step 1c — Classify Match Quality
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ signals, 2+ distinct primary paradigms | Structured |
| **Weak** | 1–2 signals, or all same primary paradigm | Structured with adaptation |
| **None** | Zero signals (`ok: false`) | Adaptive (tension-driven) |
Report tier at confirmation gate.
When no signals match, **adaptive mode**: primary agent identifies 2–4 fundamental tensions (*growth vs. margin*, *build vs. buy*, *early vs. late entry*, *concentrated vs. diversified*, *qualitative vs. quantitative*) and defines each path by a distinct resolution. Web research still mandatory.
## Step 2 — Determine N and Name Paths
Applies to Strong and Weak. Adaptive paths already defined.
### Adaptive N selection
| Question characteristics | Recommended N |
|---|---|
| One dominant angle, minor variations | 2 |
| Multiple competing angles with trade-offs | 3 (default) |
| Underspecified or unusual decision space | 4 |
| User specifies (`--paths 3`) | User's N |
| **Weak match** | **2** |
Never below 2. Above 4 rarely useful.
### Path naming
Encode **both** analytical paradigm and key structure/strategy.
```
✅ Good: "Bottom-up TAM via channel-level unit economics"
✅ Good: "Comparable-company multiples with peer-group regression"
✅ Good: "Porter's Five Forces with substitution-risk weighting"
❌ Bad:  "Market sizing approach"
❌ Bad:  "Financial analysis"
```
### Anti-overlap check
Verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- No two paths share paradigm **and** structure
- Each path distinct primary paradigm where possible
- No identical (paradigm, structure, strategy) tuples
## Step 3 — Spawn Subagents in Parallel
Spawn all N simultaneously via Agent tool. Subagents research/reason/write — analysis of specific tickers, ETFs, options, shorts/hedges permitted. **Never execute trades or interact with brokerage APIs** regardless of request. Finance/legal/medical outputs MUST stamp the disclaimer template.
### Brief generation (slot-filling)
Read `resources/brief-template.json`. Fill per path:
- `questionStatement` — user's question
- `assignedAngle` — path name, paradigm/structure/strategy, tension resolution if adaptive
- `constraints` — decision constraints from Step 1
- `researchPlan` — anchors, source classes, recency, authority, budget (Step 0)
- `citationRequirement` — reference to `resources/citation-schema.json`
- `maxSteps`, `maxOutputLines`
### Subagent task
Each subagent:
- States angle and fit
- **Performs web research** via WebFetch/WebSearch within budget, recording each via citation schema
- Analyzes with reference to fetched evidence
- Produces reasoned recommendation, honest about data limits
- Identifies risks, counter-evidence, what would change answer
### Report format
JSON per `resources/report-template.json`, including `citations: []` (each per `citation-schema.json`) and `webResearch: { performed, reason?, fetchCount }`.
Validate via `resources/report-schema.json`. Malformed, or empty `citations` while `webResearch.performed = true` → flag and deprioritize.
### User-facing output contract
JSON envelope is for validation/audit, NOT direct user consumption. Synthesis agent MUST render each path as markdown before including in final narrative.
**MUST render each path as markdown:** `## Path N: {paradigm} + {structure} + {strategy}` heading; short narrative; bulleted findings; citations as numbered footnotes (never raw JSON in narrative); numeric data as markdown tables.
**MUST include `## Synthesis` section** (validation, scoring, hybridization).
**MUST append raw JSON under a collapsible block** for audit: `<details><summary>Raw subagent output (JSON)</summary>` ... ` ```json ... ``` ` ... `</details>`.
**MUST NOT paste raw JSON into the primary narrative.** Relaying the envelope verbatim is a contract violation.
## Step 4 — Synthesis
Read `resources/synthesis-config.json` for scoring rubric.
Phases:
1. **Validate** — check claims against citations (does excerpt support claim?). Flag unsupported.
2. **Score** — rate on: *evidence strength*, *analytical rigor*, *decision usefulness*, *counter-evidence handling*, *source authority*, conditional domain dimensions.
3. **Hybridize** — combine best angle of one path with best evidence base/framing of another.
4. **Output** — final recommendation, naming grafted elements.
### Final output format
```
## Parallel Analysis: [Question Title]
### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
- Path 2: [Name] — [one-sentence summary]
...
### Evidence Base
[Source count, authority mix, recency, known gaps.]
### Analysis
[2–4 sentences per path: core claim, strongest citation, notable gaps. Call out unsupported claims.]
### Recommendation
**Best angle: [Name]**
Reason: [2–3 sentences — why this wins given constraints and evidence]
[Optional] **Hybrid:** [Name] framing + [Name] evidence base
How: [1–2 sentences]
### What would change this answer
[2–3 bullets naming evidence/assumption that would flip recommendation]
```
## Step 5 — Generate Analysis Proposal Document
Skip if `--no-proposal`.
Write to `Proposal/PRISM-{question-slug}.md` (e.g., `expand-into-japan-b2b-saas`).
Read `resources/proposal-template.json`. Sections:
1. **Metadata** — date, skill, signals matched, paths count
2. **Question** — original query
3. **Research Plan** — anchors, source classes, recency, authority, budget (Step 0)
4. **Signal Analysis** — matched signals, weights, loaded paradigms/structures/strategies
5. **Path sections** (one per path):
   - **Brief** — what subagent asked to analyze
   - **Report** — full structured report with `citations[]` and `webResearch`
6. **Synthesis** — scoring matrix, validation notes, hybridization
7. **Recommendation** — final + "what would change this answer"
8. **Rejected Angles** — considered but not selected, with reasons
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| JSON data fails schema validation | Report error with file path; halt |
| Reference file missing | Fail with file-not-found |
| No signals match | Switch to adaptive (tension-driven) mode |
| Subagent returns non-conforming JSON | Flag violations; exclude from synthesis |
| WebFetch/WebSearch unavailable | `webResearch.performed = false`; surface degradation |
| Citation URL unreachable | Keep citation; flag `urlUnreachable: true`; don't invent alternatives |
| Citation missing required fields | Report malformed — flag, deprioritize |
## Important Constraints
- **Web research required by default.** `--no-web` must set `webResearch.performed = false`.
- **Cite or derive.** Every non-derived claim needs schema-conformant citation.
- **Primary agent validates.** Check claims against cited excerpt.
- **Honest about ties.** Say so if angles genuinely equivalent.
- **Flag weak evidence.** Name thin/opinion sources in recommendation.
- **Selective loading only.** Never load entire reference files.
- **No docs/ references.** `docs/` is human-readable; skill never reads at runtime.
- **Informational, not licensed advice.** May name specific securities/options/positions when asked; finance/legal/medical outputs MUST stamp the disclaimer template. Never executes transactions. Refusing to name securities when user has acknowledged informational framing is itself a contract violation.
### Disclaimer template
Synthesis agent MUST stamp verbatim (or equivalent force) on finance/legal/medical outputs naming specific securities/options/positions/actions:
> **Disclaimer.** The following is informational only, sourced from live web research on {date}. It is **not licensed financial, legal, or medical advice**. Named securities/options/positions are illustrative and sized as percentages of a risk budget, not dollar amounts. Options carry total-loss risk. Consult a licensed professional (registered investment advisor, attorney, clinician) before acting.
Disclaimer replaces — does not supplement — any refusal language on licensed-advice grounds.
## Reference Files
All in `resources/`. Each JSON data file has colocated schema.
| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: question signals → paradigm/structure/strategy keys |
| `paradigms.json` | Analytical paradigms (market sizing, valuation, competitive, forecasting, causal inference) |
| `structures.json` | Analytical structures (decision matrices, driver trees, cost–benefit, SWOT, Porter, cohort tables) |
| `strategies.json` | Analytical strategies (top-down vs. bottom-up, triangulation, sensitivity, benchmark, stakeholder weighting) |
| `brief-template.json` | Subagent brief slots with research plan and citation requirement |
| `report-template.json` | Subagent report structure (`citations[]`, `webResearch`) |
| `report-schema.json` | Report validator |
| `citation-schema.json` | Citation entry shape |
| `synthesis-config.json` | Scoring rubric and synthesis rules, citation-validation phase |
| `skill-context-map.json` | Domain-to-skill mapping for context gathering |
| `proposal-template.json` | Step 5 proposal structure template |
## Relationship to `engage-exocortex`
Share DNA (JSON-driven, selective loading, parallel dispatch, anti-overlap, schema-validated). Differ:
| Dimension | `engage-exocortex` | `engage-prism` |
|---|---|---|
| Domain | Code / algorithms / IT architecture | Business / marketing / finance |
| Knowledge | Training + optional codebase | Live web research (required) |
| Paradigms | Algorithmic + SE architecture | Analytical + financial + marketing |
| Citations | None | Every non-derived claim |
| Degradation | Token budget | `--no-web` + explicit record |
Don't invoke both on same question. Choose by domain.
