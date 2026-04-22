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
sharedScripts: [match-signals.js, match-signals-input-schema.json]
copyright: "Rubrical Works (c) 2026"
---
# Engage Exocortex — Parallel Solution Explorer
Fan out into N independent solution paths in parallel, synthesize best answer from structured subagent reports. Reference data is schema-validated JSON in `resources/`. Loads only entries relevant to matched signals.
## Prerequisites
- **Node.js 18+** — shells out to `node scripts/match-signals.js` (Step 1b) and `node scripts/load-entries.js` (Selective Loading). No non-Node fallback.
- **Optional: `ajv`** — validates inputs against colocated `*-input-schema.json`. If absent, validation is skipped silently.
### Preflight (runs before any workflow step)
Before any workflow step, the primary agent MUST run:
```bash
node --version
```
If node missing or major version < 18, HALT with:
> **engage-exocortex requires Node.js 18+ to run `match-signals.js` and `load-entries.js`. Install Node 18+ from https://nodejs.org/ and retry.**
Also logs whether `ajv` is importable (`node -e "require('ajv')"`); missing `ajv` is non-fatal but recorded. Mirrors `engage-prism` contract.
## When to use this skill
- Multiple plausible data structures, algorithms, or architectural approaches
- Trade-offs not immediately obvious (time vs. space, simplicity vs. performance)
- User says "explore", "compare", "think through"
- Complex enough a single-pass answer might miss a better approach
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Number of parallel paths to explore (2-4) | 3 |
| `--no-proposal` | Skip writing the proposal document | *(writes proposal)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
**Note:** `--model` overrides subagent exploration model only. Primary agent uses parent session's model.
## Core Workflow
```
PRIMARY AGENT
     │
     ├── 0. [Optional] Detect domain → load relevant skills for context
     ├── 1. Parse problem + context → extract signal keywords
     ├── 2. Match signals → load matched JSON entries selectively
     ├── 3. Score matches → select N paths (deterministic)
     ├── 4. Anti-overlap check → ensure path diversity
     ├── 5. Spawn N subagents in PARALLEL (slot-filled briefs)
     │       ├── Path 1: [approach] ──► JSON report
     │       ├── Path 2: [approach] ──► JSON report
     │       └── Path N: [approach] ──► JSON report
     ├── 6. SYNTHESIS: validate, score, optionally hybridize ──► recommendation
     └── 7. [Default] Write exploration proposal to Proposal/EXO-{slug}.md
```
**Opt-out:** `--no-proposal` skips Step 7.
## Step 0 — Context Gathering (Optional)
**Skip** for algorithmic-only problems (competitive programming, data structure selection, pure algorithm design).
**Run** for architecture/design problems (existing codebases, infrastructure, testing strategies, system design).
### Domain Detection
Scan problem for keywords: architecture, design, infrastructure, testing, deployment, database, API, auth, cache, scale, microservice, pipeline, CI/CD, sandbox, migration, security.
### Skill Loading
**Read** `resources/skill-context-map.json` to determine skills to load.
**Rules:**
- **Maximum 3 skills** per invocation (token budget)
- Select by relevance (highest match count first)
- Read-only — provides context for path selection
- If `codebase-analysis` relevant AND existing codebase present, prioritize
### What Context Provides
Enriches Step 1 signal extraction (e.g., PostgreSQL boosts DB signals; Playwright boosts test signals; Express/Fastify boosts API signals). Anti-pattern analysis highlights approaches to avoid. Passed as additional keywords/constraints; doesn't change matching algorithm.
## Step 1 — Parse Problem and Confirm Keywords
1. **Parse the problem** — identify core challenge, constraints, success criteria.
2. **Extract signal keywords** from problem + Step 0 context.
### Keyword Confirmation Gate (Mandatory)
Confirm interpreted problem and keywords with user before signal matching.
**3. Confirm keywords with user** using `AskUserQuestion`:
**Zero keywords extracted:** Skip to rephrase prompt. Display restated problem, ask:
> "I couldn't extract signal keywords from this problem. Could you rephrase it with more specific terms?"
**Single keyword extracted:** Present confirmation gate with warning:
> "⚠️ Only one keyword extracted — exploration quality may be limited with sparse input. Consider adding related terms."
**Normal flow (1+ keywords):**
- Restate interpreted problem in 1-2 sentences
- List extracted keywords
- `AskUserQuestion`:
  - Question: `"I'll explore solutions for: {restated problem}\n\nExtracted keywords: {keyword list}"`
  - Options: `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the problem"`
**On user response:**
- **"Confirmed — proceed"**: Validate ≥1 keyword exists. Proceed to sub-step 4.
- **"Let me adjust keywords"**: Accept corrections. Re-display via `AskUserQuestion`. Loop until confirmed.
- **"Rephrase the problem"**: Accept new statement. Re-parse, extract, present. If single keyword persists, include sparse warning.
**Fallback:** If `AskUserQuestion` unavailable, display as text and ask for freeform confirmation. Do not silently skip.
**No signal matching or subagent dispatch may occur without user confirmation passing through this gate.**
### Step 1b — Match Signals
4. **Run the signal matcher**:
   ```bash
   node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
   ```
   Reads `resources/cross-references.json`, matches keywords, aggregates weighted scores across paradigms/structures/strategies, returns top N path candidates as JSON.
5. **Parse output** — `ok: true` means matches found. Use `scores.paradigms`, `scores.structures`, `scores.strategies` for path selection in Step 2.
### Selective Loading
For each top-scoring entry, **load only matched entries**:
```bash
node scripts/load-entries.js paradigm <id1> [id2] [...]
node scripts/load-entries.js structure <id1> [id2] [...]
node scripts/load-entries.js strategy <id1> [id2] [...]
```
Returns only requested entries. Do NOT read full resource files directly.
**Token budget:** Monitor `tokenEstimate`. Combined output should stay under 10K tokens. Script warns on exceed.
### Step 1c — Classify Match Quality
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ matched signals with ≥2 distinct primary paradigms | Structured (standard path selection) |
| **Weak** | 1-2 matched signals, or all signals share same primary paradigm | Structured with adaptation |
| **None** | Zero matched signals (`ok: false`) | Adaptive mode |
**Report tier to user** at confirmation gate:
- Strong: `"Match quality: strong (N signals across M paradigms) — proceeding with structured exploration"`
- Weak: `"⚠️ Match quality: weak (N signals) — using partial matches as anchors with reduced path count"`
- None: `"Match quality: none — switching to adaptive mode with tension-driven path definition"`
#### Strong Match Path
Proceed with structured path selection (Step 2). Load via `load-entries.js`.
#### Weak Match Path
When coverage thin (1-2 signals):
1. **Partial matches as anchors.** Matched signals provide starting paradigms/structures/strategies. Check `cross-references.json` for signals whose keywords partially overlap (substring match) — "closest-neighbor" signals.
2. **Reduce path count.** Use N=2 instead of default N=3.
3. **Widen subagent briefs.**
   - Set `explorationScope` to `"broad"` instead of `"focused"`
   - Include full problem statement in brief
   - Instruct subagents to consider approaches outside matched paradigm
4. **Selective loading still applies.** Load entries for matched + neighbor signals.
#### No Match Path — Adaptive Mode
Switch to adaptive mode: preserves parallel paths, anti-overlap verification, subagent dispatch; replaces signal-driven selection with tension-driven path definition.
**Step A — Attempt hybrid signal construction.** Re-examine keywords for partial overlap at lower threshold. If signals share 2+ words with user keywords, treat as weak anchors. If 2+ weak anchors, promote to Weak Match Path.
**Step B — Tension-driven path definition.** If hybrid construction insufficient:
1. **Identify key tensions** — 2-4 fundamental design tensions / trade-offs. Examples:
   - Axis of decomposition (by domain vs. by category vs. by composite)
   - Composition strategy (monolithic vs. layered vs. pipeline)
   - Aggregation approach (simple merge vs. deduplication vs. scored synthesis)
   Normal to surface **more tensions than paths**. Step 1a collapses deterministically.
1a. **Collapse tensions into N path differentiators.** When `M tensions > N paths`:
   1. **Rank by solution divergence.** High-divergence tensions (fundamentally different architectures) rank above incremental variations.
   2. **Identify interdependent tensions.** Tensions that constrain each other combine into single path dimension. Example: "axis granularity" and "agent count" are interdependent → combined into "decomposition resolution."
   3. **Map top N tensions as primary differentiators.** Select top N independent tensions. Remaining `M − N` become **secondary variables** documented in path's `tradeoffs` field.
   4. **Verify anti-overlap on primary differentiators.** Each path's primary resolution must differ. Over-collapsed → re-rank and re-map.
   **Worked example (4 tensions → 3 paths).** Parallel code review architecture:
   - T1: axis granularity (one-axis-per-domain vs. composite-axes)
   - T2: determinism source (config files vs. signal matching)
   - T3: aggregation strategy (concat vs. dedup vs. scored synthesis)
   - T4: file distribution (per-axis files vs. shared file pool)
   Application:
   - **Rank:** T1, T3, T2, T4
   - **Interdependence:** T1+T4 combine into "decomposition resolution"
   - **Primary differentiators (N=3):** {T1+T4, T3, T2}. Path A = "fine per-domain decomposition"; Path B = "scored synthesis aggregation"; Path C = "config-driven determinism"
   - **Anti-overlap check:** pass
2. **Define paths from tensions.** Each path must specify:
   - `tensionResolution`: side of each key tension
   - `keyIdea`: one-sentence summary
   - `tradeoffs`: gains and sacrifices
3. **Verify anti-overlap.** No two paths share same resolution on all tensions; each differs on ≥1 tension.
4. **Brief subagents with tension framing.** Briefs carry:
   - Full problem context (not signal-derived paradigm summaries)
   - Specific tension resolution this path explores
   - Key idea and trade-offs
   - Instruction to explore broadly within tension framing
   Do NOT leave paradigm/structure/strategy fields empty — populate with tension resolution description.
5. **Report adaptive mode to user:**
   > "Running in adaptive mode. Signal matching found no direct matches — I've identified {N} key design tensions and defined {N} distinct paths exploring different resolutions. Anti-overlap verified."
## Step 2 — Determine N and Name Paths
**Applies to Strong and Weak tiers.** For No Match, paths already defined in Step 1c; skip to Step 3.
### Adaptive N selection
| Problem characteristics | Recommended N |
|---|---|
| One dominant paradigm, minor variations worth checking | 2 |
| Multiple competing paradigms with real trade-offs | 3 (default) |
| Problem underspecified or unusual constraint combinations | 4 |
| User explicitly specifies (`--paths 3`) | User's N |
| **Weak match tier** | **2 (reduced)** |
**Never below 2.** Above 4 rarely useful — prefer depth over breadth.
### Path naming
Path names must encode **both** paradigm and key structure/strategy.
```
✅ Good: "Min-heap greedy with lazy deletion"
✅ Good: "Bottom-up interval DP on sorted endpoints"
❌ Bad:  "Greedy approach"
❌ Bad:  "DP solution"
```
### Anti-overlap check
`match-signals.js` output `paths[]` applies paradigm diversity. Verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- No two paths share same paradigm **and** structure (Jaccard similarity < `overlapThreshold`)
- Each path uses distinct primary paradigm where possible
- No two paths use identical (paradigm, structure, strategy) tuples
If too similar, merge and select different candidate.
## Step 3 — Spawn Subagents in Parallel
Spawn all N subagents **at the same time** using Agent tool with `model: "opus"` (or `--model` override). Ensures deep reasoning regardless of parent session's model.
### Brief generation (slot-filling)
**Read** `resources/brief-template.json`. Fill slots:
- `problemStatement` — user's problem
- `assignedApproach` — path name + loaded paradigm/structure/strategy details
- `constraints` — extracted in Step 1
- `maxSteps` — exploration depth limit
- `maxOutputLines` — output size cap
Filled brief is subagent's prompt. Do NOT embed full brief template instructions.
### Subagent task
Reasoning and planning only — no code execution:
- Explain core idea
- Work through algorithm step-by-step with concrete example
- Analyze time and space complexity
- Identify edge cases
- Note key implementation considerations
- Honest assessment of strengths and weaknesses
### Report format
Subagents return JSON conforming to `resources/report-template.json`.
**Read** `resources/report-schema.json` to validate each report. If malformed:
- Identify failed fields
- Exclude from synthesis
- Warn user which path produced invalid report
## Step 4 — Synthesis
**Read** `resources/synthesis-config.json` for scoring rubric. Follow phases:
1. **Validate** — check complexity claims and edge case reasoning independently
2. **Score** — rate on dimensions (always-relevant + conditionally-relevant + operational)
3. **Hybridize** — check if best parts of two approaches can combine (including operational grafts)
4. **Output** — produce final recommendation
### Operational Scoring Dimensions
`synthesis-config.json` defines four **operational dimensions** under `operationalDimensions`. Complement architectural scoring; apply when `useWhen` condition matches:
| Dimension | What to assess |
|---|---|
| **Extensibility** | How easily accommodate new inputs/axes/domains? File-drop > edit-existing > code change > schema change. |
| **Operational simplicity** | Count moving parts: coordination, validation, config. Fewer parts = fewer failure modes. |
| **User transparency** | Can user predict behavior by reading config? 1:1 config-to-behavior > indirect > emergent multi-file. |
| **Cost predictability** | Explicit control over resource consumption? Budget flags > configurable thresholds > implicit > unbounded. |
**When to apply.** Solution extended over time, runs unattended, debugged by non-authors, audited, consumes paid resources, or has user-visible latency. Many problems need 2-4; few need none.
**Hybridization check.** Hybridize phase includes `operational-graft` question: *"Does Path A win on architecture but Path B win on extensibility / simplicity / transparency / cost?"* When yes, recommend A with B's operational feature explicitly grafted on, naming the grafted feature.
**Worked example.** Parallel code review architecture, 3 paths:
| Path | Architectural | Operational | Notes |
|---|---|---|---|
| A: thematic-axis composition w/ coverage validation, convergence scoring | Strong correctness/completeness/dedup | Adequate extensibility/transparency | Rich but adding axis requires composer edit |
| B: per-domain agents w/ shared file pool | Adequate (some duplicates) | Strong simplicity, Adequate transparency | Fewer parts, weaker dedup |
| C: file-drop axis registry w/ `--budget` flag | Adequate (no convergence scoring) | **Strong** extensibility, cost predictability, transparency | Operationally clean |
Without operational: recommend **A**. With operational: `operational-graft` fires → recommend **A's architecture with C's file-drop registry and `--budget` flag grafted on**. Grafted features named in recommendation.
### Final output format
```
## Parallel Exploration: [Problem Title]

### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
- Path 2: [Name] — [one-sentence summary]
...

### Analysis
[2–4 sentences per path covering correctness, complexity, trade-offs.
Call out errors found in subagent reasoning.]

### Recommendation
**Best approach: [Name]**
Reason: [2–3 sentences — why this wins given constraints]

[Optional] **Hybrid possibility:** [Name] + [Name]
How: [1–2 sentences on how to combine and what you gain]

### Implementation Sketch
[Pseudocode or high-level outline of recommended approach.]
```
## Step 5 — Generate Exploration Proposal Document
**Skip if `--no-proposal` specified.**
### Document Path
Write to `Proposal/EXO-{problem-slug}.md` (lowercase-hyphenated; e.g., "sandbox-e2e-tests-electron").
### Document Structure
**Read** `resources/proposal-template.json`. Sections:
1. **Metadata** — Date, skill name, signals matched, paths explored count
2. **Problem Statement** — Original user query
3. **Context Sources** (optional) — Only when Step 0 ran. Loaded skills, codebase findings, tech stack.
4. **Signal Analysis** — Matched signals with weights, loaded paradigms/structures/strategies
5. **Path sections** (one per path):
   - **Brief** — What subagent was asked to explore
   - **Report** — Full structured report
6. **Synthesis** — Scoring matrix, validation, hybridization
7. **Recommendation** — Final recommendation with sketch
8. **Rejected Paths** — Considered but not selected, with reasons
### Capture Points
| Step | What to Capture |
|------|----------------|
| Step 0 | Loaded skills, domain detection (if ran) |
| Step 1 | Matched signals, keywords, loaded JSON entry IDs |
| Step 2 | Selected paths, rejected paths + reasons, N value |
| Step 3 | Each subagent's filled brief |
| Step 3 (return) | Each subagent's JSON report |
| Step 4 | Scoring matrix, validation, hybrid analysis, recommendation |
### Error Cases
- Synthesis fails partway → write partial document noting failure point
- `Proposal/` missing → create it
- Document generation failure is **non-blocking**
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing or < 18 | Report preflight error with install link (https://nodejs.org/); halt |
| JSON data file fails schema validation | Report validation error with file path; halt |
| Reference file missing | Fail with clear file-not-found message |
| No signals match in cross-references.json | Report "no matching paradigms found" with unmatched characteristics |
| Subagent returns non-conforming JSON | Detect report-schema.json violation; report failed fields; exclude |
| Malformed JSON (syntax error) | Fail at parse time with file path and parse error location |
| Cross-reference key drift | Warn when key exists in cross-references.json but no data entry |
## Important Constraints
- **Subagents plan; primary agent validates.** Check complexity claims independently.
- **Be honest about ties.** Say so and let user choose.
- **Flag disagreements.** Call out errors in subagent reasoning.
- **Synthesis over selection.** Always check hybrid before defaulting to one winner.
- **Selective loading only.** Never load entire reference files.
- **No docs/ references.** `docs/` is human-readable; skill must NEVER read from `docs/`.
## Reference Files
All in `resources/`. Each JSON has colocated schema.
| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: signals → paradigm/structure/strategy keys |
| `paradigms.json` | Dimension 1: paradigms (31 families — 8 algorithmic + 23 software engineering) |
| `structures.json` | Dimension 2: structures (22 families — 8 algorithmic + 14 software engineering) |
| `strategies.json` | Dimension 3: strategies (22 families — 9 algorithmic + 13 software engineering) |
| `brief-template.json` | Subagent brief slot template |
| `report-template.json` | Expected subagent report structure |
| `synthesis-config.json` | Scoring rubric and synthesis rules |
| `skill-context-map.json` | Domain-to-skill mapping for Step 0 |
| `proposal-template.json` | Document structure template for Step 5 |
