---
name: engage-exocortex
description: JSON-driven parallel solution explorer with schema-validated references, deterministic path selection via structured signal matching, and selective loading for minimal token usage.
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-04"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [algorithms, data-structures, parallel-exploration, json-schema]
sharedScripts: [match-signals.js, match-signals-input-schema.json]
copyright: "Rubrical Works (c) 2026"
---

# Engage Exocortex — Parallel Solution Explorer

Tackles complex coding/algorithmic problems by fanning out into N independent solution paths in parallel, then synthesizing the best answer from structured subagent reports. Reference data is schema-validated JSON in `resources/`; only matched entries are loaded.

## Prerequisites

- **Node.js 18+** — required for `node scripts/match-signals.js` (Step 1b) and `node scripts/load-entries.js` (Selective Loading). No non-Node fallback.
- **Optional: `ajv`** — scripts validate inputs against colocated `*-input-schema.json` when available; absence skips input validation silently.

The 18+ floor is conservative (scripts use only CommonJS + stdlib); aligns with active/previous LTS and repo convention. If Node missing, install from https://nodejs.org/ and retry.

### Preflight (runs before any workflow step)

Before question parsing, keyword extraction, signal matching, or subagent dispatch, primary agent MUST run:

```bash
node --version
```

If command fails or major version < 18, HALT immediately with:

> **engage-exocortex requires Node.js 18+ to run `match-signals.js` and `load-entries.js`. Install Node 18+ from https://nodejs.org/ and retry.**

Preflight also logs `ajv` importability (`node -e "require('ajv')"`) — missing `ajv` is non-fatal but recorded so downstream knows input-schema checks were skipped. Mirrors `engage-prism` so both skills degrade identically.

## When to use this skill

Coding/algorithm problems where:
- Multiple plausible data structures, algorithms, or architectural approaches exist
- Trade-offs aren't obvious (time vs. space, simplicity vs. performance)
- User says "explore", "compare", "think through", or similar
- Single-pass answer might miss a better approach

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Number of parallel paths to explore (2-4) | 3 |
| `--no-proposal` | Skip writing the proposal document | *(writes proposal)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |

`--model` overrides subagent exploration only. Primary agent (signal matching, synthesis, proposal writing) uses parent session's model.

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

**Skip for algorithmic-only problems** (competitive programming, data structure selection, pure algorithm design — self-contained).

**Run for architecture/design problems** — existing codebases, infrastructure decisions, testing strategies, system design.

### Domain Detection

Scan problem for architecture/design keywords; if any match, gather context. Keywords: architecture, design, infrastructure, testing, deployment, database, API, auth, cache, scale, microservice, pipeline, CI/CD, sandbox, migration, security.

### Skill Loading

**Read** `resources/skill-context-map.json` to determine which skills to load by detected domain keywords.

**Rules:**
- **Maximum 3 skills** per invocation (token budget)
- Select by relevance to detected keywords (highest match count first)
- Loading is **read-only** — context for path selection, not direct implementation
- If `codebase-analysis` is relevant AND existing codebase present, prioritize it

### What Context Provides

Loaded skill context enriches Step 1 signal extraction:
- PostgreSQL → boosts database signals
- Playwright tests → boosts test infra signals
- Express/Fastify → boosts API design signals
- Anti-pattern analysis → highlights approaches to avoid

Context becomes additional keywords/constraints for Step 1; doesn't change matching algorithm, only inputs.

## Step 1 — Parse Problem and Confirm Keywords

1. **Parse the problem** — identify core algorithmic challenge, constraints, success criteria.
2. **Extract signal keywords** from problem and Step 0 context (if run).

### Keyword Confirmation Gate (Mandatory)

Confirm interpreted problem and keywords with user before signal matching, to prevent wasted parallel exploration on wrong signals.

**3. Confirm keywords with the user** using `AskUserQuestion`:

**Zero keywords:** Skip empty-list confirmation; show restated problem and ask:
> "I couldn't extract signal keywords from this problem. Could you rephrase it with more specific terms?"

**Single keyword:** Present confirmation gate with warning:
> "⚠️ Only one keyword extracted — exploration quality may be limited with sparse input. Consider adding related terms."

**Normal flow (1+ keywords):**
- Restate interpreted problem in 1-2 sentences
- List extracted keywords
- Use `AskUserQuestion` with:
  - Question: `"I'll explore solutions for: {restated problem}\n\nExtracted keywords: {keyword list}"`
  - Options: `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the problem"`

**On user response:**
- **"Confirmed — proceed"**: Validate at least one keyword exists (no empty-list confirmation). Proceed to sub-step 4.
- **"Let me adjust keywords"**: Accept corrected keywords; re-display via `AskUserQuestion`; loop until confirmed.
- **"Rephrase the problem"**: Accept new statement; re-parse, re-extract, re-present. If single keyword persists, show sparse warning again.

**Fallback:** If `AskUserQuestion` unavailable, display restated problem + keywords as text and ask freeform confirmation. Never silently skip the gate.

**No signal matching or subagent dispatch may occur without confirmation through this gate.**

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
Each call returns only requested entries. Do NOT read full resource files directly.

**Token budget:** Monitor `tokenEstimate` per response. Combined output across all calls in a single invocation should stay under 10K tokens; script warns when exceeded.

### Step 1c — Classify Match Quality

After `match-signals.js` returns, classify into one of three tiers:

| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ matched signals with at least 2 distinct primary paradigms | Structured (standard path selection) |
| **Weak** | 1-2 matched signals, or all signals share the same primary paradigm | Structured with adaptation |
| **None** | Zero matched signals (`ok: false`) | Adaptive mode |

**Report tier at confirmation gate:**
- Strong: `"Match quality: strong (N signals across M paradigms) — proceeding with structured exploration"`
- Weak: `"⚠️ Match quality: weak (N signals) — using partial matches as anchors with reduced path count"`
- None: `"Match quality: none — switching to adaptive mode with tension-driven path definition"`

#### Strong Match Path

Proceed with structured path selection (Step 2) — no behavioral change. Load matched entries via `load-entries.js`.

#### Weak Match Path

When signal coverage is thin (1-2 signals):

1. **Use partial matches as anchors.** Matched signals provide starting paradigms/structures/strategies. Supplement by checking `cross-references.json` for signals whose keywords partially overlap (substring match) with confirmed keywords — "closest-neighbor" signals adjacent in problem space.

2. **Reduce parallel path count.** N=2 instead of default N=3 to reflect lower confidence.

3. **Widen subagent briefs.** Expand exploration latitude:
   - Set `explorationScope` to `"broad"` instead of `"focused"`
   - Include full problem statement in brief (not just paradigm-specific framing)
   - Instruct subagents to consider approaches outside matched paradigm if warranted

4. **Selective loading still applies.** Load entries for matched + neighbor signals; monitor token budget.

#### No Match Path — Adaptive Mode

When no signals match, switch to **adaptive mode** preserving exocortex core value (parallel paths, anti-overlap, subagent dispatch) with tension-driven path definition replacing signal-driven selection.

**Step A — Attempt hybrid signal construction.** Re-examine confirmed keywords for partial overlap at lower threshold. If any signals share 2+ words with user keywords, treat as weak anchors. If yields 2+ weak anchors, promote to Weak Match Path.

**Step B — Tension-driven path definition.** If hybrid still insufficient:

1. **Identify key tensions.** Primary agent analyzes for 2-4 fundamental design tensions, architectural trade-offs, or competing concerns. Examples:
   - Axis of decomposition (by domain vs. by category vs. by composite)
   - Composition strategy (monolithic vs. layered vs. pipeline)
   - Aggregation approach (simple merge vs. deduplication vs. scored synthesis)

   It is normal to surface **more tensions than paths** (e.g. 4 tensions when target N=3). Step 1a collapses surplus deterministically.

1a. **Collapse tensions into N path differentiators.** When `M tensions > N paths`:

   1. **Rank tensions by solution divergence.** Tensions where different resolutions lead to fundamentally different architectures (e.g. "monolithic vs. pipeline") rank higher than incremental variations (e.g. "batch size 100 vs. 1000"). High-divergence tensions are worth a path.

   2. **Identify interdependent tensions.** Tensions that constrain each other (resolving A narrows B) should be **combined into one path dimension**, not split. Splitting interdependent tensions produces paths that look distinct but converge architecturally. Example: "axis granularity" + "agent count" are interdependent (fine-grained axes ⇒ many agents) → combined as "decomposition resolution."

   3. **Map top N tensions as primary differentiators.** Select top N independent (post-combination) tensions by divergence; these become each path's *primary* differentiator. Remaining `M − N` become **secondary variables** resolved within each path's `tradeoffs` field but don't define identity.

   4. **Verify anti-overlap on primary differentiators.** Confirm each path's *primary* tension resolution differs from every other path's primary. If two share primary resolution, you over-collapsed — re-rank and re-map. (General anti-overlap on full tension resolutions still applies in step 3 below; this is stricter on primaries only.)

   **Worked example (4 tensions → 3 paths).** Problem: parallel code review architecture. Tensions:
   - T1: axis granularity (one-axis-per-domain vs. composite-axes)
   - T2: determinism source (config files vs. signal matching)
   - T3: aggregation strategy (concat vs. dedup vs. scored synthesis)
   - T4: file distribution (per-axis files vs. shared file pool)

   Application:
   - **Rank by divergence:** T1 (architecture-defining), T3 (output-shape-defining), T2 (control-flow-defining), T4 (deployment-detail).
   - **Interdependence:** T1 and T4 are interdependent → combine as "decomposition resolution."
   - **Primary differentiators (N=3):** {T1+T4 combined, T3, T2}. Path A primary = "fine per-domain decomposition." Path B primary = "scored synthesis aggregation." Path C primary = "config-driven determinism." Other tensions become secondary in `tradeoffs`.
   - **Anti-overlap on primaries:** A (decomposition), B (aggregation), C (control source) — three distinct dimensions, pass.

2. **Define paths from tensions.** Each path = distinct resolution of identified tensions, specifying:
   - `tensionResolution`: which side of each key tension
   - `keyIdea`: one-sentence approach summary
   - `tradeoffs`: gains and sacrifices

3. **Verify anti-overlap.** Same check as signal-driven paths: no two paths share same resolution on all tensions; each must differ on ≥1 key tension.

4. **Brief subagents with tension framing.** Briefs carry:
   - Full problem context (not signal-derived paradigm summaries)
   - The specific tension resolution this path explores
   - Key idea and trade-offs
   - Instruction to explore broadly within tension framing

   Do NOT leave paradigm/structure/strategy fields empty — populate with tension resolution description so brief template stays structurally valid.

5. **Report adaptive mode to user** before dispatch:
   > "Running in adaptive mode. Signal matching found no direct matches — I've identified {N} key design tensions and defined {N} distinct paths exploring different resolutions. Anti-overlap verified."

## Step 2 — Determine N and Name Paths

**Applies to Strong and Weak tiers.** For No Match (adaptive), paths defined in Step 1c — skip to Step 3.

### Adaptive N selection

| Problem characteristics | Recommended N |
|---|---|
| One clearly dominant paradigm, minor variations worth checking | 2 |
| Multiple competing paradigms with real trade-offs | 3 (default) |
| Problem is underspecified or has unusual constraint combinations | 4 |
| User explicitly specifies a number (e.g., `--paths 3`) | User's N |
| **Weak match tier** | **2 (reduced from default)** |

**Never below 2.** Above 4 rarely useful — prefer depth over breadth.

### Path naming

Names must encode **both** paradigm and key structure/strategy. Construct specific, non-overlapping names from loaded entries.

```
✅ Good: "Min-heap greedy with lazy deletion"
✅ Good: "Bottom-up interval DP on sorted endpoints"
❌ Bad:  "Greedy approach"
❌ Bad:  "DP solution"
```

### Anti-overlap check

`match-signals.js` `paths[]` already applies paradigm diversity. Before finalizing, verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- No two paths share same paradigm **and** structure (Jaccard similarity on combined keys < `overlapThreshold`)
- Each path uses distinct primary paradigm where possible
- No two paths use identical (paradigm, structure, strategy) tuples

If too similar, merge and select different candidate.

## Step 3 — Spawn Subagents in Parallel

Spawn all N subagents **simultaneously** via Agent tool with `model: "opus"` (or `--model` value). Ensures deep reasoning regardless of parent model.

### Brief generation (slot-filling)

**Read** `resources/brief-template.json`. For each path, fill slots:
- `problemStatement` — user's problem
- `assignedApproach` — path name + loaded paradigm/structure/strategy details
- `constraints` — extracted in Step 1
- `maxSteps` — exploration depth limit (from `--paths N` or default)
- `maxOutputLines` — output size cap (from `--paths N` or default)

Filled brief becomes subagent prompt. Do NOT embed full brief template instructions.

### Subagent task

Each subagent performs **reasoning and planning only** — no code execution:
- Explain core idea
- Work through algorithm step-by-step with concrete example
- Analyze time/space complexity
- Identify edge cases and handling
- Note key implementation considerations
- Honest assessment of strengths/weaknesses

### Report format

Subagents return JSON conforming to `resources/report-template.json`.

**Read** `resources/report-schema.json` to validate. If malformed:
- Identify failed fields
- Exclude from synthesis
- Warn user which path produced invalid report

## Step 4 — Synthesis

After all N reports return, **read** `resources/synthesis-config.json` for scoring rubric.

Phases:

1. **Validate** — check each report's complexity claims and edge case reasoning independently
2. **Score** — rate on dimensions (always-relevant + conditionally-relevant + operational)
3. **Hybridize** — check if best parts of two approaches combine (including operational grafts)
4. **Output** — produce final recommendation

### Operational Scoring Dimensions

Beyond architectural fit, `synthesis-config.json` defines four **operational dimensions** under `operationalDimensions` (complement, not replace, architectural scoring; apply when `useWhen` matches):

| Dimension | What to assess |
|---|---|
| **Extensibility** | Ease of accommodating new inputs/axes/domains. File-drop > edit-existing > code change > schema change. |
| **Operational simplicity** | Count moving parts: coordination points, validation steps, config files. Fewer = fewer failure modes. |
| **User transparency** | Predict behavior from config? 1:1 config-to-behavior > indirect activation > emergent multi-file behavior. |
| **Cost predictability** | Explicit user control over resource consumption? Budget flags > configurable thresholds > implicit scaling > unbounded. |

**When to apply.** Apply when solution will be extended over time, run unattended in production, debugged by non-authors, audited for behavior, or consumes paid resources / has user-visible latency. Most problems need 2–4; few need none.

**Hybridization check.** Hybridize phase includes `operational-graft` question: *"Does Path A win on architecture but Path B win on extensibility / simplicity / transparency / cost?"* Most-often-missed synthesis path when scoring weighs only architectural fit. When yes, recommend Path A with Path B's operational feature explicitly grafted, naming the grafted feature.

**Worked example (operational dimension changes outcome).**

Problem: parallel code review architecture. Three paths.

| Path | Architectural score | Operational score | Notes |
|---|---|---|---|
| A: thematic-axis composition with coverage validation and convergence scoring | Strong on correctness, completeness, deduplication | Adequate extensibility (edit composer to add an axis), Adequate transparency | Architecturally rich but adding axis requires editing composer |
| B: per-domain agents with shared file pool | Adequate on architecture (some duplicate findings) | Strong simplicity, Adequate transparency | Fewer moving parts but weaker deduplication |
| C: file-drop axis registry with explicit `--budget` flag | Adequate architecture (no convergence scoring) | **Strong extensibility** (drop one JSON = add one axis), **Strong cost predictability** (`--budget` ceiling), **Strong transparency** (1:1 config-to-axis) | Architecturally simpler but operationally clean |

Without operational scoring, synthesis recommends **A**. With operational scoring, `operational-graft` fires:

> "Does A win on architecture but C win on extensibility, transparency, and cost?" → **Yes.**

**Final:** Path A's thematic composition + coverage validation, **with Path C's file-drop axis registry and `--budget` flag explicitly grafted**. Hybrid keeps A's architectural sophistication while inheriting C's operational profile (one-PR axis additions, deterministic cost ceiling, inspectable behavior). Grafted features are named.

### Final output format

```
## Parallel Exploration: [Problem Title]

### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
- Path 2: [Name] — [one-sentence summary]
...

### Analysis
[2–4 sentences per path covering correctness, complexity, and notable trade-offs.
Call out any errors found in subagent reasoning.]

### Recommendation
**Best approach: [Name]**
Reason: [2–3 sentences — why this wins given the stated constraints]

[Optional] **Hybrid possibility:** [Name] + [Name]
How: [1–2 sentences on how to combine them and what you gain]

### Implementation Sketch
[Pseudocode or high-level code outline of the recommended approach.
Not a full implementation — enough to unambiguously communicate the algorithm.]
```

## Step 5 — Generate Exploration Proposal Document

**Skip if `--no-proposal`.**

After synthesis, write a persistent markdown capturing the entire exploration lifecycle.

### Document Path

Write to `Proposal/EXO-{problem-slug}.md` where `{problem-slug}` is lowercase-hyphenated (e.g., "sandbox-e2e-tests-electron").

### Document Structure

**Read** `resources/proposal-template.json` for structure. Sections:

1. **Metadata** — Date, skill name, signals matched, paths explored count
2. **Problem Statement** — Original user query
3. **Context Sources** (optional) — Only when Step 0 ran. Lists loaded skills, codebase findings, tech stack. Omitted for algorithmic-only problems.
4. **Signal Analysis** — Matched signals with weights, loaded paradigms/structures/strategies
5. **Path sections** (one per path) — each includes:
   - **Brief** — what subagent was asked
   - **Report** — full structured report (core idea, walkthrough, complexity, edge cases, strengths/weaknesses, fit score)
6. **Synthesis** — Scoring matrix, validation notes, hybridization analysis
7. **Recommendation** — Final recommendation with implementation sketch
8. **Rejected Paths** — Considered during signal matching but not selected, with reasons

### Capture Points

| Step | What to Capture |
|------|----------------|
| Step 0 | Loaded skills, domain detection results (if Step 0 ran) |
| Step 1 | Matched signals, keyword extractions, loaded JSON entry IDs |
| Step 2 | Selected paths, rejected paths with reasons, N value |
| Step 3 | Each subagent's filled brief |
| Step 3 (return) | Each subagent's JSON report |
| Step 4 | Scoring matrix, validation notes, hybrid analysis, recommendation |

### Error Cases

- Synthesis fails partway → write partial document noting failure point
- `Proposal/` doesn't exist → create it
- Document generation failure is **non-blocking** — conversation output still valid

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Node missing or < 18 | Report preflight error with install link (https://nodejs.org/); halt before workflow starts |
| JSON data file fails schema validation | Report validation error with file path and violation details; halt |
| Reference file missing from disk | Fail with clear file-not-found message naming the missing file |
| No signals match in cross-references.json | Report "no matching paradigms found" with the unmatched characteristics |
| Subagent returns non-conforming JSON | Detect report-schema.json violation; report which fields failed; exclude from synthesis |
| Malformed JSON (syntax error) in reference file | Fail at parse time with file path and parse error location |
| Cross-reference key drift | Warn when key exists in cross-references.json but has no corresponding data entry |

## Important Constraints

- **Subagents plan; primary agent validates.** Don't blindly accept complexity claims — check independently.
- **Be honest about ties.** If approaches are equivalent, say so and let user choose.
- **Flag disagreements.** If subagent reasoning has an error, call it out in Analysis.
- **Synthesis over selection.** Always check hybrid before defaulting to one winner.
- **Selective loading only.** Never load entire reference files. Always filter to matched entries.
- **No docs/ references.** `docs/` contains human-readable versions; this skill must NEVER read from `docs/`.

## Reference Files

All reference files in `resources/`. Each JSON data file has colocated schema for validation.

| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: maps problem signals → paradigm/structure/strategy keys |
| `paradigms.json` | Dimension 1: paradigms (31 families — 8 algorithmic + 23 software engineering) |
| `structures.json` | Dimension 2: structures (22 families — 8 algorithmic + 14 software engineering) |
| `strategies.json` | Dimension 3: strategies (22 families — 9 algorithmic + 13 software engineering) |
| `brief-template.json` | Subagent brief slot template with constraint fields |
| `report-template.json` | Expected subagent report structure |
| `synthesis-config.json` | Scoring rubric and synthesis rules |
| `skill-context-map.json` | Domain-to-skill mapping for Step 0 context gathering |
| `proposal-template.json` | Document structure template for Step 5 proposal generation |
