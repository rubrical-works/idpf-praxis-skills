---
name: engage-exocortex
description: JSON-driven parallel solution explorer with schema-validated references, deterministic path selection via structured signal matching, and selective loading for minimal token usage.
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-04"
license: Complete terms in LICENSE.txt
category: problem-solving
relevantTechStack: [algorithms, data-structures, parallel-exploration, json-schema]
copyright: "Rubrical Works (c) 2026"
---
# Engage Exocortex — Parallel Solution Explorer
Tackles complex coding and algorithmic problems by fanning into N independent solution paths in parallel, then synthesizing the best answer from structured subagent reports.
Reference data is schema-validated JSON in `resources/`. Loads only matched entries.
## Prerequisites
- **Node.js 18+** — shells to `node scripts/match-signals.js` (Step 1b) and `node scripts/load-entries.js` (Selective Loading). No non-Node fallback.
- **Optional: `ajv`** — validates inputs against `*-input-schema.json` when available; skipped silently otherwise.
Node 18+ floor matches active/previous LTS. If Node missing, install Node 18+ from https://nodejs.org/ and retry.
### Preflight (runs before any workflow step)
Before any workflow step — before question parsing, keyword extraction, signal matching, or subagent dispatch — the primary agent MUST run `node --version`. If the command fails or reports a major version less than 18, HALT with:
> **engage-exocortex requires Node.js 18+ to run `match-signals.js` and `load-entries.js`. Install Node 18+ from https://nodejs.org/ and retry.**

Do not proceed. Preflight also logs whether `ajv` is importable (`node -e "require('ajv')"`); `ajv` is optional and a missing `ajv` is non-fatal, but its absence is recorded so downstream validation knows input-schema checks were skipped. Mirrors the `engage-prism` contract so both skills degrade identically.
## When to use this skill
Any coding/algorithm problem where:
- Multiple plausible data structures, algorithms, or architectural approaches
- Trade-offs not immediately obvious (time vs. space, simplicity vs. performance)
- User says "explore", "compare", "think through", similar
- Complex enough that single-pass might miss a better approach
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths (2-4) | 3 |
| `--no-proposal` | Skip proposal doc | *(writes)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
`--model` overrides subagent model only. Primary agent uses parent session model.
## Core Workflow
```
PRIMARY AGENT
     │
     ├── 0. [Optional] Detect domain → load relevant skills for context
     │
     ├── 1. Parse problem + context → extract signal keywords
     ├── 2. Match signals → load matched JSON entries selectively
     ├── 3. Score matches → select N paths (deterministic)
     ├── 4. Anti-overlap check → ensure path diversity
     │
     ├── 5. Spawn N subagents in PARALLEL (slot-filled briefs)
     │       │
     │       ├── Path 1: [approach] ──► JSON report
     │       ├── Path 2: [approach] ──► JSON report
     │       └── Path N: [approach] ──► JSON report
     │
     ├── 6. SYNTHESIS: validate, score, optionally hybridize ──► recommendation
     │
     └── 7. [Default] Write exploration proposal to Proposal/EXO-{slug}.md
```
**Opt-out:** `--no-proposal` skips Step 7.
## Step 0 — Context Gathering (Optional)
Skip for algorithmic-only (competitive programming, data structure selection, pure algorithm design).
Run for architecture/design (existing codebases, infrastructure, testing, system design).
### Domain Detection
Scan for keywords: architecture, design, infrastructure, testing, deployment, database, API, auth, cache, scale, microservice, pipeline, CI/CD, sandbox, migration, security.
### Skill Loading
Read `resources/skill-context-map.json`. Rules:
- **Max 3 skills** per invocation
- Select by relevance (highest match first)
- Read-only — context only, not implementation
- Prioritize `codebase-analysis` when existing codebase present
### What Context Provides
Enriches Step 1 signal extraction:
- PostgreSQL → boosts database signals
- Playwright → boosts test infrastructure signals
- Express/Fastify → boosts API signals
- Anti-pattern analysis highlights approaches to avoid
Passed to Step 1 as additional keywords/constraints.
## Step 1 — Parse Problem and Confirm Keywords
1. **Parse problem** — core challenge, constraints, success criteria.
2. **Extract signal keywords** from problem and Step 0 context.
### Keyword Confirmation Gate (Mandatory)
Before signal matching, confirm via `AskUserQuestion`.
**Zero keywords:** skip to rephrase prompt:
> "I couldn't extract signal keywords. Could you rephrase with more specific terms?"
**Single keyword:** confirmation with warning:
> "⚠️ Only one keyword — quality may be limited. Consider adding related terms."
**Normal (1+ keywords):**
- Restate in 1-2 sentences
- List keywords
- `AskUserQuestion`:
  - Question: `"I'll explore solutions for: {restated}\n\nExtracted keywords: {list}"`
  - Options: `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the problem"`
**On response:**
- **Confirmed**: validate ≥1 keyword exists; proceed
- **Adjust keywords**: accept corrections; re-display; loop
- **Rephrase**: new statement; re-parse; re-present; sparse warning again if single
**Fallback:** if `AskUserQuestion` unavailable, display text and ask freeform. Never silently skip.
**No signal matching or dispatch without confirmation.**
### Step 1b — Match Signals
```bash
node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
```
Reads `resources/cross-references.json`, matches keywords, aggregates weighted scores across paradigms/structures/strategies, returns top N candidates JSON.
Parse — `ok: true` means matched. Use `scores.paradigms`, `scores.structures`, `scores.strategies`.
### Selective Loading
```bash
node scripts/load-entries.js paradigm <id1> [id2] [...]
node scripts/load-entries.js structure <id1> [id2] [...]
node scripts/load-entries.js strategy <id1> [id2] [...]
```
Returns only requested entries. Do NOT read full resource files directly.
**Token budget:** `tokenEstimate` per response; combined < 10K; script warns when exceeded.
### Step 1c — Classify Match Quality
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ signals, 2+ distinct primary paradigms | Structured |
| **Weak** | 1-2 signals, or all same primary paradigm | Structured with adaptation |
| **None** | Zero signals (`ok: false`) | Adaptive |
Report tier at confirmation gate:
- Strong: `"Match quality: strong (N signals across M paradigms) — proceeding with structured exploration"`
- Weak: `"⚠️ Match quality: weak (N signals) — using partial matches as anchors with reduced path count"`
- None: `"Match quality: none — switching to adaptive mode with tension-driven path definition"`
#### Strong Match Path
Proceed with Step 2. Load matched entries via `load-entries.js`.
#### Weak Match Path
When signal coverage is thin (1-2 signals):
1. **Partial matches as anchors.** Check `cross-references.json` for signals whose keywords partially overlap (substring) with user's — "closest-neighbor" signals.
2. **Reduce parallel paths.** N=2 instead of 3.
3. **Widen briefs.** `explorationScope` = `"broad"` instead of `"focused"`; include full problem statement; allow approaches outside matched paradigm.
4. **Selective loading still applies.** Load matched + neighbor signals.
#### No Match Path — Adaptive Mode
Switch to adaptive mode preserving core value (parallel paths, anti-overlap, dispatch) while replacing signal-driven selection with tension-driven definition.
**Step A — Hybrid signal construction.** Re-examine keywords for partial overlap at lower threshold. If signals share 2+ words, treat as weak anchors. 2+ weak anchors → promote to Weak.
**Step B — Tension-driven definition.**
1. **Identify key tensions.** 2-4 design tensions, trade-offs, competing concerns:
   - Decomposition axis (domain vs. category vs. composite)
   - Composition strategy (monolithic vs. layered vs. pipeline)
   - Aggregation (simple merge vs. dedup vs. scored synthesis)
   Normal to surface more tensions than paths.
1a. **Collapse tensions into N differentiators.** When M > N:
   1. **Rank by divergence.** High-divergence (fundamentally different architectures) ranks higher than incremental variations.
   2. **Identify interdependent tensions.** Combine into single dimension rather than split. Example: "axis granularity" + "agent count" → "decomposition resolution."
   3. **Map top N as primary differentiators.** Select top N independent tensions ranked by divergence. Remaining `M − N` become secondary variables documented in `tradeoffs`.
   4. **Verify anti-overlap on primaries.** Each path's primary resolution distinct. If two share, re-rank and re-map.
   **Worked example (4 tensions → 3 paths).** Problem: parallel code review. Tensions:
   - T1: axis granularity (per-domain vs. composite)
   - T2: determinism source (config vs. signal matching)
   - T3: aggregation (concat vs. dedup vs. scored)
   - T4: file distribution (per-axis vs. shared pool)
   Application:
   - **Rank:** T1 (architecture-defining), T3 (output-shape), T2 (control-flow), T4 (deployment-detail)
   - **Interdependence:** T1+T4 (fine per-domain → per-axis files; composite → shared pool). Combine → "decomposition resolution."
   - **Primaries (N=3):** {T1+T4, T3, T2}. Path A = "fine per-domain decomposition"; B = "scored synthesis aggregation"; C = "config-driven determinism"
   - **Anti-overlap on primaries:** pass.
2. **Define paths from tensions.** Each specifies:
   - `tensionResolution`: side of each key tension
   - `keyIdea`: one-sentence summary
   - `tradeoffs`: gains and sacrifices
3. **Verify anti-overlap.** No two paths share resolution on all tensions; differ on ≥1.
4. **Brief subagents with tension framing.** Carry full problem context, tension resolution, key idea, trade-offs, instruction to explore broadly within framing. Populate paradigm/structure/strategy fields with tension description — don't leave empty.
5. **Report adaptive mode to user:**
   > "Running in adaptive mode. Signal matching found no direct matches — I've identified {N} key design tensions and defined {N} distinct paths exploring different resolutions. Anti-overlap verified."
## Step 2 — Determine N and Name Paths
Applies to Strong and Weak. Adaptive paths defined in Step 1c.
### Adaptive N selection
| Characteristics | Recommended N |
|---|---|
| One dominant paradigm, minor variations | 2 |
| Multiple competing paradigms with trade-offs | 3 (default) |
| Underspecified or unusual constraints | 4 |
| User specifies (`--paths 3`) | User's N |
| **Weak match** | **2** |
Never below 2. Above 4 rarely useful — prefer depth.
### Path naming
Encode **both** paradigm and key structure/strategy.
```
✅ Good: "Min-heap greedy with lazy deletion"
✅ Good: "Bottom-up interval DP on sorted endpoints"
❌ Bad:  "Greedy approach"
❌ Bad:  "DP solution"
```
### Anti-overlap check
Verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- No two paths share paradigm **and** structure (Jaccard < `overlapThreshold`)
- Distinct primary paradigm where possible
- No identical (paradigm, structure, strategy) tuples
If too similar, merge and select different candidate.
## Step 3 — Spawn Subagents in Parallel
Spawn all N simultaneously via Agent tool with `model: "opus"` (or `--model`). Ensures deep reasoning regardless of parent model.
### Brief generation (slot-filling)
Read `resources/brief-template.json`. Fill:
- `problemStatement` — user's problem
- `assignedApproach` — path name and loaded paradigm/structure/strategy
- `constraints` — from Step 1
- `maxSteps` — exploration depth limit
- `maxOutputLines` — output size cap
Filled brief becomes subagent prompt. Do NOT embed full template instructions.
### Subagent task
Reasoning and planning only — no code execution:
- Explain core idea
- Work through algorithm step-by-step with concrete example
- Analyze time/space complexity
- Identify edge cases
- Note implementation considerations
- Honest strengths/weaknesses
### Report format
JSON per `resources/report-template.json`. Validate via `resources/report-schema.json`. Malformed → identify failed fields, exclude from synthesis, warn user.
## Step 4 — Synthesis
Read `resources/synthesis-config.json` for scoring rubric. Phases:
1. **Validate** — check complexity claims and edge case reasoning independently
2. **Score** — rate on rubric dimensions (always + conditionally + operational)
3. **Hybridize** — combine best parts of two approaches (including operational grafts)
4. **Output** — final recommendation
### Operational Scoring Dimensions
`synthesis-config.json` defines four operational dimensions under `operationalDimensions`, complementing architectural scoring when `useWhen` matches:
| Dimension | What to assess |
|---|---|
| **Extensibility** | New inputs/axes/domains? File-drop > edit-existing > code change > schema change |
| **Operational simplicity** | Moving parts: coordination points, validation steps, configs. Fewer = fewer failure modes |
| **User transparency** | Predict behavior by reading config? 1:1 config-to-behavior > indirect > emergent multi-file |
| **Cost predictability** | Explicit resource control? Budget flags > configurable thresholds > implicit > unbounded |
**When to apply.** Extended over time, run unattended, debugged by non-authors, audited, consumes paid resources, user-visible latency. Most problems need 2–4.
**Hybridization check.** `operational-graft` question: *"Does A win on architecture but B on extensibility/simplicity/transparency/cost?"* Most often missed when scoring weighs only architectural fit. When yes, recommend A with B's operational feature grafted on, named explicitly.
**Worked example (operational changes outcome).** Parallel code review, 3 paths.
| Path | Architectural | Operational | Notes |
|---|---|---|---|
| A: thematic-axis composition with coverage validation and convergence scoring | Strong correctness/completeness/dedup | Adequate extensibility (edit composer), Adequate transparency | Rich but adding axis requires editing composer |
| B: per-domain agents with shared file pool | Adequate (some duplicate findings) | Strong simplicity, Adequate transparency | Fewer parts, weaker dedup |
| C: file-drop axis registry with explicit `--budget` flag | Adequate (no convergence scoring) | **Strong extensibility** (drop JSON = add axis), **Strong cost predictability**, **Strong transparency** (1:1) | Simpler but operationally clean |
Without operational scoring → recommend **A**. With, `operational-graft` fires:
> "Does A win on architecture but C on extensibility, transparency, and cost?" → **Yes.**
**Final:** Path A's thematic composition and coverage validation, **with Path C's file-drop registry and `--budget` flag grafted on**. Keeps A's sophistication while inheriting C's operational profile. Grafted features named.
### Final output format
```
## Parallel Exploration: [Problem Title]
### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
- Path 2: [Name] — [one-sentence summary]
...
### Analysis
[2–4 sentences per path covering correctness, complexity, trade-offs. Call out errors in subagent reasoning.]
### Recommendation
**Best approach: [Name]**
Reason: [2–3 sentences — why this wins given constraints]
[Optional] **Hybrid possibility:** [Name] + [Name]
How: [1–2 sentences on combination and gain]
### Implementation Sketch
[Pseudocode or high-level outline. Not full implementation — enough to communicate algorithm.]
```
## Step 5 — Generate Exploration Proposal Document
Skip if `--no-proposal`.
Write to `Proposal/EXO-{problem-slug}.md` (e.g., `sandbox-e2e-tests-electron`).
Read `resources/proposal-template.json`. Sections:
1. **Metadata** — date, skill, signals matched, paths count
2. **Problem Statement** — original query
3. **Context Sources** (optional) — only when Step 0 ran; loaded skills, codebase findings, tech stack. Omitted for algorithmic-only.
4. **Signal Analysis** — matched signals with weights, loaded paradigms/structures/strategies
5. **Path sections** (one per path):
   - **Brief** — what subagent was asked
   - **Report** — full structured report (core idea, walkthrough, complexity, edge cases, strengths/weaknesses, fit)
6. **Synthesis** — scoring matrix, validation, hybridization
7. **Recommendation** — final + implementation sketch
8. **Rejected Paths** — considered but not selected, with reasons
### Capture Points
| Step | What to Capture |
|------|----------------|
| Step 0 | Loaded skills, domain detection (if ran) |
| Step 1 | Matched signals, keyword extractions, loaded JSON entry IDs |
| Step 2 | Selected paths, rejected with reasons, N |
| Step 3 | Each filled brief |
| Step 3 (return) | Each JSON report |
| Step 4 | Scoring matrix, validation, hybrid analysis, recommendation |
### Error Cases
- Synthesis fails partway → write partial noting failure
- `Proposal/` missing → create
- Doc generation failure is **non-blocking** — conversation output still valid
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing or < 18 | Report preflight error with install link (https://nodejs.org/); halt before workflow starts |
| JSON fails schema validation | Report error with file path and violation; halt |
| Reference file missing | Fail with file-not-found naming file |
| No signals match | Report "no matching paradigms found" with unmatched characteristics |
| Subagent non-conforming JSON | Detect schema violation; report fields; exclude from synthesis |
| Malformed JSON (syntax) | Fail at parse with path and error location |
| Cross-reference key drift | Warn when key exists in cross-references but no data entry |
## Important Constraints
- **Subagents plan; primary validates.** Don't blindly accept complexity claims.
- **Honest about ties.** Say so if equivalent.
- **Flag disagreements.** Call out subagent reasoning errors in Analysis.
- **Synthesis over selection.** Always check hybrid before defaulting.
- **Selective loading only.** Never load entire reference files.
- **No docs/ references.** `docs/` is human-readable; skill never reads from `docs/`.
## Reference Files
All in `resources/`. Each JSON has colocated schema.
| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: signals → paradigm/structure/strategy keys |
| `paradigms.json` | Paradigms (31 families — 8 algorithmic + 23 SE) |
| `structures.json` | Structures (22 families — 8 algorithmic + 14 SE) |
| `strategies.json` | Strategies (22 families — 9 algorithmic + 13 SE) |
| `brief-template.json` | Subagent brief slot template with constraint fields |
| `report-template.json` | Expected subagent report structure |
| `synthesis-config.json` | Scoring rubric and synthesis rules |
| `skill-context-map.json` | Domain-to-skill mapping for Step 0 |
| `proposal-template.json` | Step 5 document structure |
