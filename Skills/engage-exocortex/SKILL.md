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

Fan out into N independent solution paths in parallel, then synthesize the best from structured subagent reports. Reference data is schema-validated JSON in `resources/`; load only matched entries.

## When to use
- Multiple plausible data structures/algorithms/architectures
- Non-obvious trade-offs (time vs. space, simplicity vs. performance)
- User says "explore", "compare", "think through"
- Single-pass answer might miss a better approach

## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths (2-4) | 3 |
| `--no-proposal` | Skip proposal document | writes proposal |
| `--model <model>` | Subagent model (`opus`/`sonnet`/`haiku`) | `opus` |

`--model` overrides subagent model only. Primary agent uses parent session model.

## Core Workflow
```
PRIMARY AGENT
 ├── 0. [Optional] Detect domain → load relevant skills
 ├── 1. Parse problem → extract signal keywords
 ├── 2. Match signals → load matched JSON entries
 ├── 3. Score → select N paths (deterministic)
 ├── 4. Anti-overlap check
 ├── 5. Spawn N subagents in PARALLEL (slot-filled briefs)
 │       ├── Path 1..N: [approach] ──► JSON report
 ├── 6. SYNTHESIS: validate, score, optionally hybridize
 └── 7. [Default] Write Proposal/EXO-{slug}.md
```
Opt-out: `--no-proposal` skips Step 7.

## Step 0 — Context Gathering (Optional)
Skip for algorithmic-only problems. Run for architecture/design problems.

**Domain detection:** Scan for keywords: architecture, design, infrastructure, testing, deployment, database, API, auth, cache, scale, microservice, pipeline, CI/CD, sandbox, migration, security.

**Skill loading:** Read `resources/skill-context-map.json` to determine skills.
- **Max 3 skills** per invocation
- Select by relevance (highest match count first)
- Read-only context for path selection
- If `codebase-analysis` relevant AND existing codebase, prioritize

**What context provides:** Enriches Step 1 keyword extraction (PostgreSQL boosts DB signals; Playwright boosts test signals; anti-patterns highlight approaches to avoid). Passed as additional keywords/constraints.

## Step 1 — Parse Problem and Confirm Keywords
1. Parse problem — identify core challenge, constraints, success criteria
2. Extract signal keywords from problem + Step 0 context

### Keyword Confirmation Gate (Mandatory)
Before signal matching, confirm with user via `AskUserQuestion`.

**Zero keywords:** Skip to rephrase prompt:
> "I couldn't extract signal keywords from this problem. Could you rephrase it with more specific terms?"

**Single keyword:** Present gate normally with warning:
> "⚠️ Only one keyword extracted — exploration quality may be limited with sparse input. Consider adding related terms."

**Normal flow (1+ keywords):**
- Restate problem in 1-2 sentences
- List extracted keywords
- `AskUserQuestion` with:
  - Question: `"I'll explore solutions for: {restated}\n\nExtracted keywords: {list}"`
  - Options: `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the problem"`

**Responses:**
- **Confirmed:** Validate ≥1 keyword (no empty list). Proceed to sub-step 4.
- **Adjust:** Accept corrected keywords. Re-display via `AskUserQuestion`. Loop until confirmed.
- **Rephrase:** Accept new statement. Re-parse, extract fresh, present again. If sparse, repeat warning.

**Fallback:** If `AskUserQuestion` unavailable, display as text + freeform confirmation. Never silently skip the gate.

**No signal matching or subagent dispatch without confirmation.**

### Step 1b — Match Signals
3. Run signal matcher:
   ```bash
   node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
   ```
   Reads `resources/cross-references.json`, matches keywords, aggregates weighted scores, returns top N candidates as JSON.
4. Parse output — `ok: true` means matches found. Use `scores.paradigms`, `scores.structures`, `scores.strategies`.

### Selective Loading
For each top entry, load only matched entries:
```bash
node scripts/load-entries.js paradigm <id1> [id2] [...]
node scripts/load-entries.js structure <id1> [id2] [...]
node scripts/load-entries.js strategy <id1> [id2] [...]
```
Returns only requested entries. Do NOT read full resource files directly.

**Token budget:** Monitor `tokenEstimate`. Combined output should stay under 10K tokens. Script warns when exceeded.

### Step 1c — Classify Match Quality
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ matched signals across 2+ distinct primary paradigms | Structured |
| **Weak** | 1-2 matched signals, or all share same primary paradigm | Structured w/ adaptation |
| **None** | Zero matches (`ok: false`) | Adaptive |

Report tier at confirmation gate:
- Strong: `"Match quality: strong (N signals across M paradigms) — proceeding with structured exploration"`
- Weak: `"⚠️ Match quality: weak (N signals) — using partial matches as anchors with reduced path count"`
- None: `"Match quality: none — switching to adaptive mode with tension-driven path definition"`

#### Strong Match Path
Proceed with structured selection (Step 2). Load entries via `load-entries.js`.

#### Weak Match Path
1. **Use partial matches as anchors.** Check `cross-references.json` for signals whose keywords substring-overlap user keywords (closest-neighbor signals).
2. **Reduce N to 2** instead of default 3.
3. **Widen briefs:** set `explorationScope: "broad"`, include full problem statement, instruct subagents to consider approaches outside matched paradigm.
4. **Selective loading still applies.** Load matched + neighbor entries. Monitor tokens.

#### No Match Path — Adaptive Mode
Preserves parallel paths, anti-overlap, subagent dispatch; replaces signal-driven selection with tension-driven definition.

**Step A — Hybrid signal construction.** Re-examine keywords at lower threshold: signals sharing 2+ words become weak anchors. If 2+ weak anchors, promote to Weak Match Path.

**Step B — Tension-driven path definition.** If Step A insufficient:

1. **Identify key tensions.** Analyze problem for 2-4 fundamental design tensions/trade-offs. Examples:
   - Axis of decomposition (by domain vs. category vs. composite)
   - Composition strategy (monolithic vs. layered vs. pipeline)
   - Aggregation approach (simple merge vs. dedup vs. scored synthesis)

   Normal to surface more tensions than paths; Step 1a collapses surplus.

1a. **Collapse M tensions → N path differentiators.** Don't drop or arbitrarily merge. Procedure:
   1. **Rank by solution divergence.** High-divergence tensions (different architectures) rank higher than incremental variation tensions.
   2. **Identify interdependent tensions.** Tensions constraining each other → combine into one path dimension. Example: "axis granularity" + "agent count" → "decomposition resolution."
   3. **Map top N tensions as primary differentiators.** Select top N independent tensions ranked by divergence. Remaining `M-N` become **secondary variables** documented in `tradeoffs`.
   4. **Verify anti-overlap on primaries.** Each path's primary resolution must be distinct. If overlap, re-rank.

   **Worked example (4 tensions → 3 paths)** — parallel code review architecture:
   - T1: axis granularity (one-axis-per-domain vs. composite)
   - T2: determinism source (config files vs. signal matching)
   - T3: aggregation (concat vs. dedup vs. scored synthesis)
   - T4: file distribution (per-axis vs. shared pool)

   Rank: T1 (architecture), T3 (output-shape), T2 (control-flow), T4 (deployment). T1+T4 interdependent → combine "decomposition resolution." Primaries (N=3): {T1+T4, T3, T2}. Anti-overlap pass.

2. **Define paths from tensions.** Each specifies:
   - `tensionResolution`: side of each key tension
   - `keyIdea`: one-sentence summary
   - `tradeoffs`: gains/sacrifices

3. **Verify anti-overlap.** No two paths share same resolution on all tensions; must differ on ≥1.

4. **Brief subagents with tension framing:**
   - Full problem context (not paradigm summaries)
   - Specific tension resolution
   - Key idea + trade-offs
   - Instruction to explore broadly within framing

   Populate paradigm/structure/strategy fields with tension resolution descriptions to keep brief template valid.

5. **Report adaptive mode:**
   > "Running in adaptive mode. Signal matching found no direct matches — I've identified {N} key design tensions and defined {N} distinct paths exploring different resolutions. Anti-overlap verified."

## Step 2 — Determine N and Name Paths
Applies to Strong/Weak tiers. No Match (adaptive) defines paths in Step 1c — skip to Step 3.

### Adaptive N
| Problem | N |
|---|---|
| One dominant paradigm, minor variations | 2 |
| Multiple competing paradigms with real trade-offs | 3 (default) |
| Underspecified or unusual constraints | 4 |
| User specifies (`--paths 3`) | User's N |
| **Weak match tier** | **2** |

Never below 2. Above 4 rarely useful — prefer depth.

### Path naming
Encode **both** paradigm and key structure/strategy.
```
✅ "Min-heap greedy with lazy deletion"
✅ "Bottom-up interval DP on sorted endpoints"
❌ "Greedy approach"
❌ "DP solution"
```

### Anti-overlap check
`match-signals.js` `paths[]` already applies paradigm diversity. Verify against `cross-references.json` → `antiOverlapRules[]`:
- No two paths share paradigm AND structure (Jaccard < `overlapThreshold`)
- Each path uses distinct primary paradigm where possible
- No two identical (paradigm, structure, strategy) tuples

If too similar, merge and select different candidate.

## Step 3 — Spawn Subagents in Parallel
Spawn all N **simultaneously** via Agent tool with `model: "opus"` (or `--model`). Ensures deep reasoning regardless of parent model.

### Brief generation (slot-filling)
Read `resources/brief-template.json`. Fill slots per path:
- `problemStatement` — user's problem
- `assignedApproach` — path name + loaded paradigm/structure/strategy details
- `constraints` — extracted in Step 1
- `maxSteps` — exploration depth (from `--paths N`)
- `maxOutputLines` — output size cap

Filled brief becomes subagent prompt. Do NOT embed full template instructions.

### Subagent task
Reasoning and planning only — no code execution:
- Explain core idea
- Walk algorithm step-by-step with concrete example
- Time/space complexity
- Edge cases and handling
- Implementation considerations
- Honest strengths/weaknesses

### Report format
JSON conforming to `resources/report-template.json`. Validate via `resources/report-schema.json`. If malformed:
- Identify failed fields
- Exclude from synthesis
- Warn user which path was invalid

## Step 4 — Synthesis
Read `resources/synthesis-config.json` for scoring rubric. Phases:
1. **Validate** — check complexity claims and edge case reasoning independently
2. **Score** — rate on rubric dimensions (always-relevant + conditional + operational)
3. **Hybridize** — check if best parts of two approaches combine (including operational grafts)
4. **Output** — final recommendation

### Operational Scoring Dimensions
`synthesis-config.json` defines four operational dimensions under `operationalDimensions`. Apply when `useWhen` matches:

| Dimension | Assess |
|---|---|
| **Extensibility** | New inputs/axes/domains? File-drop > edit-existing > code change > schema change |
| **Operational simplicity** | Moving parts: coordination, validation, config files. Fewer = fewer failure modes |
| **User transparency** | Predict behavior from config? 1:1 config-to-behavior > indirect > emergent |
| **Cost predictability** | Explicit resource control? Budget flags > thresholds > implicit > unbounded |

**When to apply:** Solution extended over time, runs unattended, debugged by non-authors, audited, consumes paid resources, or has user-visible latency. Most problems need 2-4.

**Hybridization check.** Operational-graft question: *"Does Path A win on architecture but Path B win on extensibility/simplicity/transparency/cost?"* Most-missed synthesis path. If yes, recommend A with B's operational feature explicitly grafted, naming the grafted feature.

**Worked example:** Parallel code review architecture, three paths:

| Path | Architectural | Operational | Notes |
|---|---|---|---|
| A: thematic-axis composition + coverage validation + convergence scoring | Strong | Adequate ext/transparency | Adding axis requires editing composer |
| B: per-domain agents + shared file pool | Adequate (some dup) | Strong simplicity | Weaker dedup |
| C: file-drop axis registry + `--budget` flag | Adequate (no convergence) | **Strong** ext/cost/transparency | Operationally clean |

Without operational scoring → recommend A. With it, graft question fires: "A win architecture but C win ext/transparency/cost?" → **Yes.**

**Final:** Path A's thematic composition + coverage validation, **with Path C's file-drop registry and `--budget` flag grafted on**. Hybrid keeps A's sophistication + C's operational profile. Name grafted features in recommendation.

### Final output format
```
## Parallel Exploration: [Problem Title]

### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
...

### Analysis
[2–4 sentences per path: correctness, complexity, trade-offs.
Call out errors found in subagent reasoning.]

### Recommendation
**Best approach: [Name]**
Reason: [2–3 sentences]

[Optional] **Hybrid possibility:** [Name] + [Name]
How: [1–2 sentences]

### Implementation Sketch
[Pseudocode or high-level outline of recommended approach.]
```

## Step 5 — Generate Exploration Proposal Document
Skip if `--no-proposal`. Write persistent markdown capturing exploration lifecycle.

### Document Path
`Proposal/EXO-{problem-slug}.md` where slug is lowercase-hyphenated title.

### Structure
Read `resources/proposal-template.json`. Sections:
1. **Metadata** — Date, skill name, signals matched, paths count
2. **Problem Statement** — Original query
3. **Context Sources** (optional, only if Step 0 ran) — Loaded skills, codebase findings, tech stack
4. **Signal Analysis** — Matched signals + weights, loaded paradigms/structures/strategies
5. **Path sections** (one per path):
   - **Brief** — what subagent was asked
   - **Report** — full structured report
6. **Synthesis** — Scoring matrix, validation, hybridization
7. **Recommendation** — Final + implementation sketch
8. **Rejected Paths** — Considered but not selected, with reasons

### Capture Points
| Step | Capture |
|------|---------|
| Step 0 | Loaded skills, domain detection (if ran) |
| Step 1 | Matched signals, keywords, loaded entry IDs |
| Step 2 | Selected paths, rejected paths + reasons, N |
| Step 3 | Each filled brief |
| Step 3 (return) | Each JSON report |
| Step 4 | Scoring matrix, validation, hybrid analysis, recommendation |

### Error Cases
- Synthesis fails partway → write partial document noting failure
- `Proposal/` missing → create it
- Document generation failure is **non-blocking**

## Error Handling
| Failure | Behavior |
|---|---|
| JSON file fails schema validation | Report path + violation; halt |
| Reference file missing | Fail with file-not-found |
| No signals match | Report "no matching paradigms found" with unmatched characteristics |
| Subagent returns non-conforming JSON | Detect violation; report failed fields; exclude |
| Malformed JSON syntax | Fail at parse with path + location |
| Cross-reference key drift | Warn when key in cross-references but no data entry |

## Important Constraints
- **Subagents plan; primary agent validates.** Don't blindly accept complexity claims.
- **Be honest about ties.** If equivalent, say so and let user choose.
- **Flag disagreements.** Call out errors in Analysis section.
- **Synthesis over selection.** Always check hybrid before defaulting.
- **Selective loading only.** Never load entire reference files.
- **No docs/ references.** `docs/` is human-readable; this skill must NEVER read from it.

## Reference Files
All in `resources/`. Each JSON has colocated schema.

| File | Purpose |
|---|---|
| `cross-references.json` | Decision matrix: signals → paradigm/structure/strategy keys |
| `paradigms.json` | Dim 1: 31 families (8 algorithmic + 23 SE) |
| `structures.json` | Dim 2: 22 families (8 + 14) |
| `strategies.json` | Dim 3: 22 families (9 + 13) |
| `brief-template.json` | Subagent brief slot template |
| `report-template.json` | Expected report structure |
| `synthesis-config.json` | Scoring rubric and synthesis rules |
| `skill-context-map.json` | Domain-to-skill mapping for Step 0 |
| `proposal-template.json` | Step 5 document template |
