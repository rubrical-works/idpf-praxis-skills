---
name: engage-exocortex
description: JSON-driven parallel solution explorer with schema-validated references, deterministic path selection via structured signal matching, and selective loading for minimal token usage.
type: invokable
version: "2.0.1"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-16"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [algorithms, data-structures, parallel-exploration, json-schema]
sharedScripts: [match-signals.js, match-signals-input-schema.json]
argument-hint: "[--paths N] [--no-proposal] [--proposal] [--confirm-keywords] [--skip-ops-scoring] [--no-execution]"
copyright: "Rubrical Works (c) 2026"
---
# Engage Exocortex — Parallel Solution Explorer
Tackles complex coding/algorithmic problems by **fanning out into N independent solution paths in parallel**, synthesizing the best answer from structured subagent reports. Reference data is schema-validated JSON in `resources/`. Loads only entries relevant to matched problem signals — not the full corpus.
## Runtime Requirements
Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`). Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node 18+ on `PATH`, `ajv` installed | Invokes `scripts/match-signals.js` and `scripts/load-entries.js` — deterministic, ~20–100× cheaper per invocation than inline, schema-validated input. |
| **Fallback** | None (runs in Claude inline) | Claude reads `resources/cross-references.json` + `resources/paradigms.json` + `resources/structures.json` + `resources/strategies.json`, applies matching algorithm + selective-loading procedurally. Higher per-invocation token cost; no input schema validation; matching output structurally equivalent. |
Both paths produce same downstream JSON shape (`{ok, confidence, matchedSignals, unmatchedKeywords, scores, paths}`). Path selection happens once at preflight. Mirrors `engage-prism` contract so the two skills degrade identically.
### Preflight (runs before any workflow step)
Before any workflow step, primary agent MUST run `node --version`. Then:
1. **Node 18+ AND `ajv` importable (`node -e "require('ajv')"`)** → primary path.
2. **Node 18+, `ajv` missing** → HALT with Pattern 4 diagnostic: *"This skill validates script inputs against bundled JSON Schemas using `ajv`. Either install `ajv` (`npm install ajv` in the skill directory or globally) for the primary path, or invoke the no-Node fallback procedure below — the fallback does not perform input validation. Or install Node.js 18+ from https://nodejs.org/ for the deterministic primary path."* Then either proceed once `ajv` installed, or follow Fallback Procedure.
3. **Node unavailable** → Pattern 4 diagnostic: *"engage-exocortex matches problem-domain keywords to algorithm/architecture routing signals (`cross-references.json`), aggregates weighted scores across paradigms/structures/strategies, and selects N path candidates. The Node script (`match-signals.js` + `load-entries.js`) is the primary path — sub-second, deterministic, schema-validated. Without Node, Claude can perform the same matching inline by reading `cross-references.json` and `paradigms.json` / `structures.json` / `strategies.json` directly, applying the algorithm described in the Fallback Procedure below. Cost: ~20–100× more tokens; no input schema validation; ranking-within-ties may differ slightly. Or install Node.js 18+ from https://nodejs.org/."* Then execute Fallback Procedure.
Preflight returns `{ runtime: "node" | "none", reason: string }`.
### Fallback Procedure
When Node unavailable, perform matching/loading inline:
#### Inline replacement for `match-signals.js`
1. **Read signals catalog** from `Skills/engage-exocortex/resources/cross-references.json`. Contains `signals` array — each has `id`, `keywords[]`, `paradigms[{id, weight}]`, `structures[{id, weight}]`, `strategies[{id, weight}]`.
2. **Normalize user keywords.** Lowercase, trim, replace hyphens/underscores with single spaces, collapse multiple spaces.
3. **Match each signal.** Normalize its keywords same way. For each user keyword, compute best relevance score using tiers (highest tier wins):
   - **1.0** — exact normalized-string match.
   - **0.7** — word-boundary match (shorter normalized string appears as whole-word substring of longer, with non-alphanumeric boundary characters on each side or at string edges).
   - **0.3** — substring overlap with residue guard: shorter string ≥ 4 characters and contained in longer (no word-boundary requirement). Also score 0.3 when light suffix-strip (drop `s`, `es`, `ing`, `ed`, `al`, `ly` with ≥ 4-character residue requirement) makes both stems align on whole-word match.
   - **0** otherwise.
   Signal's relevance score is max tier across its matching keywords. Collect each user keyword scoring > 0 in `matchedKeywords`.
4. **No-match case.** If no signals scored > 0, emit `ok: false, matchedSignals: [], message: "No matching paradigms found for the given problem characteristics."` and proceed to adaptive-mode branch in Step 1c.
5. **Aggregate weighted scores.** Sum each signal's `paradigms[i].weight` into paradigm-score map. Repeat for structures and strategies. Sort each descending.
6. **Select top-N paths.** For each of N (default 3), pick highest-scoring paradigm not yet used. Pair with best-unused structure and best-unused strategy using least-used-first tiebreaker.
7. **Compute confidence.** Mean of per-signal relevance scores across matched signals.
8. **Emit JSON envelope.** Same shape as script: `{ok, confidence, matchedSignals, unmatchedKeywords, scores, paths}`.
#### Inline replacement for `load-entries.js`
For each selected paradigm/structure/strategy id, read corresponding resource file (`resources/paradigms.json` → key `paradigms`, `resources/structures.json` → key `families`, `resources/strategies.json` → key `strategies`), find entry whose `id` matches, load only that entry. Skip unknown ids and record them. Keep combined loaded content under same 10K-token soft limit the script enforces.
### Known fallback limitations
- **No input schema validation.** Fallback does not check user keywords or path counts against `match-signals-input-schema.json` / `load-entries-input-schema.json`. Schemas remain as documentation.
- **Ranking-within-ties may drift.** When two paradigms/structures/strategies tie on score, script's iteration order is deterministic from `Object.entries`; inline LLM's choice may differ. Top-N selection should still produce same set when ties don't span N boundary.
- **Scoring precision.** Script rounds to three decimals; inline computation may report unrounded floats. Treat as equivalent.
- **Token cost.** Inline path reads full catalog into context per invocation. ~20–100× more tokens than script invocation.
Operators with hard deterministic requirement should install Node 18+ and use primary path.
### Match-signals fallback allowlist — not adopted (#215 AC14)
Shared `match-signals.js` supports optional `match-signals-config.json` (domain-vocabulary allowlist + default fallback path) used by `engage-prism` for finance domain. This skill **does not** adopt it. Hard-fail on no match is correct for a general problem-solving skill whose domain is "any algorithmic/architectural problem." Any single default path would bias every unmatched query; any maintainable allowlist would exclude legitimate vocabulary. Rationale: `Construction/Design-Decisions/2026-05-16-engage-exocortex-no-fallback-allowlist.md`. Consequence: `Skills/engage-exocortex/scripts/match-signals-config.json` intentionally absent; shared script's `loadConfig() → null` branch produces hard-fail behavior.
## When to use this skill
Use for any coding/algorithm problem where:
- Multiple plausible data structures, algorithms, or architectural approaches exist
- Trade-offs aren't immediately obvious (time vs. space, simplicity vs. performance)
- User says "explore", "compare", "think through", or similar
- Problem complex enough that single-pass answer might miss a better approach
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Number of parallel paths to explore (2-4) | 3 |
| `--no-proposal` | Skip writing the proposal document (overrides domain default) | *(domain default)* |
| `--proposal` | Force-write the proposal document (overrides domain default) | *(domain default)* |
| `--confirm-keywords` | Re-enable the Step 1 keyword confirmation gate (opt-in) | *(off — gate skipped)* |
| `--skip-ops-scoring` | Skip operational scoring + the operational-graft hybridization check in Step 4 | *(default-on when Step 0 ran)* |
| `--no-execution` | Skip the execution phase (paper-design run — no candidate execution against shared test set) | *(default-on for algorithmic, off for architecture)* |
**Proposal default by domain (#215 AC7).** When Step 0 ran (architecture/design problem detected), proposal written by default — these capture cross-cutting context (codebase findings, loaded skills, infrastructure constraints) hard to reconstruct later. When Step 0 skipped (algorithmic problem), proposal skipped by default — algorithmic exploration is self-contained in conversation and proposals tend to rot within hours. Pass `--proposal` to force-write on algorithmic run; pass `--no-proposal` to force-skip on architecture run.
**Note:** Subagents always run on parent session's model — see `docs/subagent-brief-guide.md` → *Why subagents inherit the parent model*.
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
**Opt-out:** Pass `--no-proposal` to skip document generation (Step 7).
## Step 0 — Context Gathering (Optional)
**Skip for algorithmic-only problems** (competitive programming, data structure selection, pure algorithm design). Self-contained in problem statement.
**Run for architecture/design problems** — when problem involves existing codebases, infrastructure decisions, testing strategies, or system design.
### Domain Detection
Scan problem statement for architecture/design keywords. If any match, proceed with context gathering. Keywords: architecture, design, infrastructure, testing, deployment, database, API, auth, cache, scale, microservice, pipeline, CI/CD, sandbox, migration, security.
### Skill Loading
**Read** `resources/skill-context-map.json` to determine which skills to load based on detected domain keywords.
**Rules:**
- **Maximum 3 skills** loaded per invocation to control token budget
- Select skills by relevance to detected keywords (highest match count first)
- Loading is **read-only** — skills provide context for path selection, not for direct implementation
- If `codebase-analysis` is relevant AND existing codebase present, prioritize it as one of the 3
### What Context Provides
Loaded skill context enriches Step 1's signal extraction: knowing project uses PostgreSQL boosts database-related signals; knowing it has Playwright tests boosts test infrastructure signals; knowing it uses Express/Fastify boosts API design signals; anti-pattern analysis highlights approaches to avoid.
Context passed to Step 1 as additional keywords and constraints — does not change signal matching algorithm, only inputs.
## Step 1 — Parse Problem and Confirm Keywords
1. **Parse problem** — identify core algorithmic challenge, constraints, success criteria.
2. **Extract signal keywords** from problem statement and any context gathered in Step 0.
### Keyword Confirmation Gate (Opt-in)
**Default (no `--confirm-keywords`):** Skip AskUserQuestion gate; proceed directly to signal matching. User already chose keywords by stating problem.
**Opt-in (`--confirm-keywords` set):** Run gate below before signal matching. For team/advisory runs where wrong-signal exploration is costly, or ambiguous problem statements.
**3. Confirm keywords with user** using `AskUserQuestion` (only when `--confirm-keywords` set):
**Zero keywords:** If none extracted, skip to rephrase prompt; do not present empty list. Ask:
> "I couldn't extract signal keywords from this problem. Could you rephrase it with more specific terms?"
**Single keyword:** Present gate normally but append warning:
> "⚠️ Only one keyword extracted — exploration quality may be limited with sparse input. Consider adding related terms."
**Normal flow (1+ keywords):** Restate problem in 1-2 sentences; list extracted keywords; use `AskUserQuestion` with Question `"I'll explore solutions for: {restated problem}\n\nExtracted keywords: {keyword list}"`, Options `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the problem"`.
**On response:** "Confirmed" → validate ≥1 keyword exists, proceed. "Adjust" → accept corrections, re-display, loop until confirmed. "Rephrase" → accept new statement, re-parse, present again (sparse warning if single keyword persists).
**Fallback:** If `AskUserQuestion` unavailable, display problem+keywords as text, ask for freeform confirmation. When `--confirm-keywords` set, never silently skip — confirmation must happen in some form. When not set, gate bypassed entirely.
### Step 1b — Match Signals
4. **Run signal matcher** to match confirmed keywords, aggregate scores, get path candidates. **Path selection is set by preflight:**
   - **Primary path (preflight returned `node`):**
     ```bash
     node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
     ```
     Script reads `resources/cross-references.json`, matches keywords against signal definitions, aggregates weighted scores across paradigms/structures/strategies, returns top N path candidates as JSON.
   - **Fallback path (preflight returned `none`):** follow "Inline replacement for `match-signals.js`" procedure under Runtime Requirements → Fallback Procedure. Same JSON envelope shape; no input schema validation.
5. **Parse output** — `ok: true` means matches were found. Use `scores.paradigms`, `scores.structures`, `scores.strategies` for path selection in Step 2.
### Selective Loading
For each top-scoring entry, **load only matched entries**. Set by preflight:
- **Primary (`node`):** `node scripts/load-entries.js paradigm <id1> [id2]...`; same for `structure`/`strategy`. Each returns only requested entries.
- **Fallback (`none`):** follow "Inline replacement for `load-entries.js`" procedure under Runtime Requirements.
Do NOT read full resource files indiscriminately.
**Token budget:** Monitor `tokenEstimate` (primary) or running mental estimate (fallback). Combined output stays under 10K tokens. Script warns when exceeded.
### Step 1c — Classify Match Quality
After `match-signals.js` returns, classify into one of three tiers before proceeding:
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ matched signals with at least 2 distinct primary paradigms | Structured (standard path selection) |
| **Weak** | 1-2 matched signals, or all signals share same primary paradigm | Structured with adaptation |
| **None** | Zero matched signals (`ok: false`) | Adaptive mode |
**Report tier to user** at confirmation gate (#159 integration). Include tier in confirmation display:
- Strong: `"Match quality: strong (N signals across M paradigms) — proceeding with structured exploration"`
- Weak: `"⚠️ Match quality: weak (N signals) — using partial matches as anchors with reduced path count"`
- None: `"Match quality: none — switching to adaptive mode with tension-driven path definition"`
#### Strong Match Path
Proceed with existing structured path selection (Step 2) — no change. Load matched entries via `load-entries.js` as described in Selective Loading above.
#### Weak Match Path
When signal coverage is thin (1-2 signals), adapt structured approach:
1. **Use partial matches as anchors.** Matched signals provide starting paradigms/structures/strategies. Supplement by checking `cross-references.json` for signals whose keywords partially overlap (substring match) with user's confirmed keywords — these are "closest-neighbor" signals that may not have matched directly but are adjacent in problem space.
2. **Reduce parallel path count.** Use N=2 instead of default N=3 to reflect lower confidence. Matched signals may not support 3 genuinely distinct paths.
3. **Widen subagent briefs.** In brief template, expand exploration latitude:
   - Set `explorationScope` to `"broad"` instead of `"focused"`
   - Include full problem statement in brief (not just paradigm-specific framing)
   - Instruct subagents to consider approaches outside matched paradigm if problem warrants it
4. **Selective loading still applies.** Load entries for matched + neighbor signals via `load-entries.js`. Monitor token budget.
#### No Match Path — Adaptive Mode
When no signals match, structured signal-driven methodology cannot proceed. Instead, switch to **adaptive mode** which preserves exocortex's core value (parallel paths, anti-overlap verification, subagent dispatch) while replacing signal-driven path selection with tension-driven path definition.
**Step A — Attempt hybrid signal construction.** Re-examine confirmed keywords for partial overlap with signal keywords at lower threshold. If any signals have keywords sharing 2+ words with user's keywords (rather than requiring substring containment), treat as weak anchors. If yields 2+ weak anchors, promote to Weak Match Path above.
**Step B — Tension-driven path definition.** If hybrid construction still yields insufficient signals:
1. **Identify key tensions.** Primary agent analyzes problem for 2-4 fundamental design tensions, architectural trade-offs, or competing concerns. Examples:
   - Axis of decomposition (by domain vs. by category vs. by composite)
   - Composition strategy (monolithic vs. layered vs. pipeline)
   - Aggregation approach (simple merge vs. deduplication vs. scored synthesis)
   Normal to surface **more tensions than paths** (e.g. 4 tensions when target N=3). Step 1a collapses surplus deterministically.
1a. **Collapse tensions into N path differentiators.** When `M tensions > N paths`, do not silently drop or arbitrarily merge tensions. Apply this procedure:
   1. **Rank tensions by solution divergence.** Tension where different resolutions lead to fundamentally different architectures (e.g. "monolithic vs. pipeline") ranks higher than tension where resolutions are incremental variations of same architecture (e.g. "batch size 100 vs. batch size 1000"). High-divergence tensions are ones worth spending a path on.
   2. **Identify interdependent tensions.** Tensions constraining each other — resolving A narrows options for B — should be **combined into single path dimension** rather than split across paths. Splitting interdependent tensions across paths produces paths that look distinct on paper but converge architecturally. Example: "axis granularity" and "agent count" are interdependent (fine-grained axes ⇒ many agents). Become one combined dimension "decomposition resolution."
   3. **Map top N tensions as primary differentiators.** Select top N independent (post-combination) tensions ranked by divergence. These become each path's *primary* differentiator. Remaining `M − N` tensions become **secondary variables**: each path still resolves them, but they don't define path's identity. Document secondary resolutions in path's `tradeoffs` field.
   4. **Verify anti-overlap on primary differentiators.** After mapping, confirm each path's *primary* tension resolution is distinct from every other path's primary resolution. If two paths share primary resolution, you have over-collapsed — re-rank and re-map.
   **Worked example (4 tensions → 3 paths).** Problem: parallel code review architecture. Tensions T1 axis granularity, T2 determinism source, T3 aggregation strategy, T4 file distribution. Rank by divergence: T1 > T3 > T2 > T4. T1+T4 interdependent → combine into "decomposition resolution." Primary differentiators (N=3): {T1+T4, T3, T2}. Anti-overlap check on primaries: three distinct dimensions — pass.
2. **Define paths from tensions.** Each path represents distinct resolution of identified tensions. A path must specify:
   - `tensionResolution`: which side of each key tension this path takes
   - `keyIdea`: one-sentence summary of approach
   - `tradeoffs`: what this resolution gains and sacrifices
3. **Verify anti-overlap.** Apply same anti-overlap check as signal-driven paths: no two paths may share same resolution on all identified tensions. Each path must differ on at least one key tension.
4. **Brief subagents with tension framing.** In adaptive mode, subagent briefs carry:
   - Full problem context (not signal-derived paradigm summaries)
   - Specific tension resolution this path explores
   - Key idea and trade-offs
   - Instruction to explore broadly within tension framing
   Do NOT leave paradigm/structure/strategy fields empty — populate with tension resolution description so brief template remains structurally valid.
5. **Report adaptive mode to user.** Before dispatching subagents, inform user:
   > "Running in adaptive mode. Signal matching found no direct matches — I've identified {N} key design tensions and defined {N} distinct paths exploring different resolutions. Anti-overlap verified."
## Step 2 — Determine N and Name Paths
**Applies to Strong and Weak match tiers.** For No Match (adaptive mode), paths already defined in Step 1c and this step skipped — proceed directly to Step 3.
### Adaptive N selection
| Problem characteristics | Recommended N |
|---|---|
| One clearly dominant paradigm, minor variations worth checking | 2 |
| Multiple competing paradigms with real trade-offs | 3 (default) |
| Problem is underspecified or has unusual constraint combinations | 4 |
| User explicitly specifies a number (e.g., `--paths 3`) | User's N |
| **Weak match tier** | **2 (reduced from default)** |
**Never go below 2.** Going above 4 rarely useful — prefer depth over breadth.
### Path naming
Path names must encode **both** paradigm and key structure or strategy. Use loaded JSON entries to construct specific, non-overlapping names.
```
✅ Good: "Min-heap greedy with lazy deletion"
✅ Good: "Bottom-up interval DP on sorted endpoints"
❌ Bad:  "Greedy approach"
❌ Bad:  "DP solution"
```
### Anti-overlap check
`match-signals.js` output `paths[]` already applies paradigm diversity. Before finalizing, verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- **Authoritative (#215 AC4): no two paths share BOTH their `targetComplexity` AND their `invariantChoice`.** Real algorithmic diversity lives in complexity class plus invariant — two paths labeled with different paradigms but producing same complexity class and same invariant are functionally identical and one must be replaced.
- Advisory: no two paths share same paradigm **and** structure (Jaccard similarity on combined keys < `overlapThreshold`)
- Advisory: each path uses distinct primary paradigm where possible
- Advisory: no two paths use identical (paradigm, structure, strategy) tuples — under AC4, paradigm tuples are advisory rather than authoritative
Primary agent reads `brief.targetComplexity` and `brief.invariantChoice` from each generated path brief and runs authoritative check. If conflict exists, replace lower-scoring path with one using different complexity class or different invariant choice.
If paths too similar, merge them and select different candidate.
## Step 3 — Spawn Subagents in Parallel
Spawn all N subagents **at the same time** using Agent tool. Subagents inherit parent session's model — no per-subagent model override.
### Brief generation (slot-filling)
**Read** `resources/brief-template.json`. For each path, fill slot fields:
- `problemStatement` — user's problem
- `assignedApproach` — path name and loaded paradigm/structure/strategy details
- `constraints` — problem constraints from Step 1
- `maxSteps` — exploration depth limit
- `maxOutputLines` — output size cap
Filled brief becomes subagent's prompt. Do NOT embed full brief template instructions — slot-filling produces minimal, focused prompt.
### Subagent task
Each subagent performs **reasoning and planning only** — no code execution:
- Explain core idea of approach
- Work through algorithm step-by-step with concrete example
- Analyze time and space complexity
- Identify edge cases and how approach handles them
- Note key implementation considerations
- Give honest assessment of strengths and weaknesses
### Report format
Subagents return JSON report conforming to structure defined in `resources/report-template.json`.
**Read** `resources/report-schema.json` to validate each returned report. If malformed: identify which fields failed validation; exclude malformed report from synthesis; warn user which path produced invalid report.
**Conditional `implementation` validation.** `implementation` field required at template layer. When `--no-execution` is set (or no algorithmic-problem domain detected), primary agent skips validation of `implementation` and accepts reports without it. When `--no-execution` NOT set, missing or empty `implementation` is schema violation — exclude path from execution-phase scoring and report gap.
## Step 3.5 — Execution Phase (#215 AC1)
**Domain-routed default:**
| Step 0 outcome | Execution phase | Opt out / in |
|---|---|---|
| Step 0 skipped (algorithmic problem) | **Default-on** — run all N candidate implementations against shared test set | `--no-execution` to force-skip (paper-design run) |
| Step 0 ran (architecture problem) | **Default-off** — implementations are pseudo-code or sketches not meaningfully executable; architectural reasoning carries synthesis | N/A — execution rarely useful here |
Resolution rule:
1. `--no-execution` always skips, regardless of domain.
2. Otherwise: run when Step 0 was skipped, skip when Step 0 ran.
When execution phase runs:
1. **Read each subagent's report.implementation field** (added by AC10 — see `resources/report-template.json`). Each report carries `language` (target language identifier) and `code` (runnable implementation as string).
2. **Build shared test set.** Start with edge cases listed in problem statement (if any). Add union of all `edgeCases[]` arrays from every subagent's report. Add 2-3 baseline cases (typical inputs, single-element, empty-input where defined) to anchor suite.
3. **Preflight target-language adapters** (see Step 3.5a below — AC2). Halt with Pattern-4 scope-statement diagnostic if execution engaged but no adapter available for problem's target language.
4. **Execute each candidate against every case** using adapter named in `implementation.language`. Record pass/fail per (candidate, case) cell.
5. **Feed results into `executionScore` dimension** during Step 4 scoring (see `resources/synthesis-config.json` → `phases[].executionDimensions`). Scoring bands: all-pass = Strong; n-passes (strict majority) = Adequate; baseline-fails = Weak; doesn't-run / fails-everything = Disqualifying.
When execution skipped (per resolution rule or because no adapter available), executionScore dimension omitted from score phase and synthesis runs as before. Architectural validation in Step 4 still happens.
### Why this exists
Subagents previously planned only. Synthesis "validated" complexity claims by re-reasoning. A subtly wrong complexity analysis survived validation precisely when primary agent made same error — most dangerous failure mode. Execution catches that cheaply by actually running code on inputs.
### Step 3.5a — Execution-phase preflight (#215 AC2)
When execution phase on (per resolution rule), enumerate available target-language adapters before dispatching subagents. Adapters at minimum: Node 18+ for `javascript`/`typescript`, Python 3.x for `python`. Primary agent determines problem's target language from user's problem statement, codebase context (if Step 0 ran), or by asking once if ambiguous.
**Diagnostic shape — Pattern 4 scope-statement variant** (per `Construction/Design-Decisions/2026-04-26-no-runtime-fallback-pattern.md`):
If problem's target language has no adapter available on host, HALT with diagnostic in this order:
1. **Deliverable** — "Execution-backed candidate scoring would run each subagent's implementation against the shared test set and surface concrete pass/fail data for the synthesis recommendation."
2. **Scope boundary** — "There is no honest reasoning-only fallback for execution scoring: re-reasoning is exactly the validation gap this phase exists to close. Without an adapter, execution scoring is unavailable and the synthesis falls back to architectural-only scoring (the pre-AC1 behavior)."
3. **Install path** — "Install Node 18+ (https://nodejs.org/) for JavaScript/TypeScript problems, or Python 3.x for Python problems. Or pass `--no-execution` to acknowledge the scope and proceed with architectural-only scoring."
When `--no-execution` set or no algorithmic-problem domain detected (Step 0 ran), this preflight skipped — execution layer dormant and only orchestration preflight (from #252, in Runtime Requirements above) engaged.
## Step 4 — Synthesis
After all N reports return, **read** `resources/synthesis-config.json` for scoring rubric. Follow phases: **1. Validate** — check each report's complexity claims and edge case reasoning independently. **2. Score** — rate each on rubric dimensions (always-relevant + conditionally-relevant + operational). **3. Hybridize** — check if best parts of two approaches can be combined (including operational grafts). **4. Output** — produce final recommendation.
### Operational Scoring Dimensions
In addition to architectural-fit dimensions (correctness, complexity, edge cases, etc.), `synthesis-config.json` defines four **operational dimensions** under `operationalDimensions`. These complement architectural scoring — don't replace it — and apply when their `useWhen` condition matches problem context:
| Dimension | What to assess |
|---|---|
| **Extensibility** | How easily can solution accommodate new inputs/axes/domains? File-drop > edit-existing > code change > schema change. |
| **Operational simplicity** | Count moving parts: coordination points, validation steps, configuration files. Fewer parts = fewer failure modes. |
| **User transparency** | Can user predict behavior by reading config? 1:1 config-to-behavior > indirect activation > emergent multi-file behavior. |
| **Cost predictability** | Does user have explicit control over resource consumption? Budget flags > configurable thresholds > implicit scaling > unbounded. |
**When to apply (#215 AC5).** Operational scoring **default-on whenever Step 0 ran** (architecture/design problem) — four operational dimensions all applied and `operational-graft` hybridization check mandatory. When Step 0 skipped (algorithmic problem), operational scoring default-off because dimensions rarely change recommendation for self-contained algorithm problems. Pass `--skip-ops-scoring` to opt out of default-on path when you explicitly want architectural-only synthesis; pass it on algorithmic problem as no-op for symmetry.
Resolution rule (parallels Step 5):
1. `--skip-ops-scoring` always skips, regardless of domain.
2. Otherwise: apply when Step 0 ran, skip when Step 0 was skipped.
**Hybridization check.** When operational scoring on, hybridize phase MUST include `operational-graft` question: *"Does Path A win on architecture but Path B win on extensibility / simplicity / transparency / cost?"* This is synthesis path most often missed when scoring weighs only architectural fit. When answered yes, recommend Path A with Path B's operational feature explicitly grafted on, naming grafted feature in recommendation. When operational scoring skipped, `operational-graft` question omitted.
**Worked example.** Three paths: A (thematic-axis composition, strong architecture, adequate ops); B (per-domain agents with shared pool, strong simplicity); C (file-drop axis registry with `--budget`, strong extensibility/cost/transparency). Without ops scoring, recommend **A**. With ops scoring, `operational-graft` fires → recommend Path A's thematic composition **with Path C's file-drop axis registry and `--budget` flag grafted on**. Hybrid keeps A's architectural sophistication while inheriting C's operational profile. Grafted features named in recommendation.
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
**Domain-routed default (#215 AC7):**
| Step 0 outcome | Default behavior | Opt out / in |
|---|---|---|
| Step 0 ran (architecture problem) | **Write proposal** — default-on; exploration captured cross-cutting context worth persisting | `--no-proposal` to force-skip |
| Step 0 skipped (algorithmic problem) | **Skip proposal** — default-off; algorithmic explorations self-contained and proposals tend to rot within hours | `--proposal` to force-write opt-in |
Resolution rule:
1. `--no-proposal` always skips, regardless of domain.
2. `--proposal` always writes, regardless of domain.
3. Otherwise: write if Step 0 ran, skip if Step 0 was skipped.
When proposal written, remainder of this step applies. When skipped, jump to skill exit.
After synthesis completes (and resolution rule above selects "write"), write persistent markdown document capturing entire exploration lifecycle.
### Document Path
Write to `Proposal/EXO-{problem-slug}.md` where `{problem-slug}` is lowercase-hyphenated summary of problem title (e.g., "sandbox-e2e-tests-electron").
### Document Structure
**Read** `resources/proposal-template.json` for document structure. Template defines sections:
1. **Metadata** — Date, skill name, signals matched, paths explored count
2. **Problem Statement** — Original user query
3. **Context Sources** (optional) — Present only when Step 0 ran. Lists loaded skills, codebase analysis findings, tech stack detected. Omitted entirely for algorithmic-only problems.
4. **Signal Analysis** — Matched signals with weights, loaded paradigms/structures/strategies
5. **Path sections** (one per explored path) — Each includes:
   - **Brief** — What subagent was asked to explore
   - **Report** — Full structured report (core idea, walkthrough, complexity, edge cases, strengths/weaknesses, fit score)
6. **Synthesis** — Scoring matrix, validation notes, hybridization analysis
7. **Recommendation** — Final recommendation with implementation sketch
8. **Rejected Paths** — Paths considered during signal matching but not selected, with reasons
### Capture Points
Data collected during earlier steps and written in Step 5:
| Step | What to Capture |
|------|----------------|
| Step 0 | Loaded skills, domain detection results (if Step 0 ran) |
| Step 1 | Matched signals, keyword extractions, loaded JSON entry IDs |
| Step 2 | Selected paths, rejected paths with reasons, N value |
| Step 3 | Each subagent's filled brief |
| Step 3 (return) | Each subagent's JSON report |
| Step 4 | Scoring matrix, validation notes, hybrid analysis, recommendation |
### Error Cases
- If synthesis fails partway through, write partial document noting failure point
- If `Proposal/` directory doesn't exist, create it
- Document generation failure is **non-blocking** — conversation output still valid
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4 diagnostic (preflight returns `{runtime: "none", reason: ...}`); switch to Fallback Procedure. Do **not** halt. |
| Node present but `ajv` missing | HALT with Pattern 4 diagnostic: install `ajv` for primary path, or invoke Fallback Procedure (which does not perform input validation). |
| Node version < 18 | Treat as Node-missing for preflight purposes (fall through to fallback) or surface clearer "Node.js 18+ required for primary path" diagnostic + install link (https://nodejs.org/). |
| JSON data file fails schema validation | Report validation error with file path and violation details; halt |
| Reference file missing from disk | Fail with clear file-not-found message naming missing file |
| No signals match in cross-references.json | Report "no matching paradigms found" with unmatched characteristics |
| Subagent returns non-conforming JSON | Detect report-schema.json violation; report which fields failed; exclude from synthesis |
| Malformed JSON (syntax error) in reference file | Fail at parse time with file path and parse error location |
| Cross-reference key drift | Warn when key exists in cross-references.json but has no corresponding data entry |
## Important Constraints
- **Subagents plan; primary agent validates.** Do not blindly accept subagent complexity claims — check them independently.
- **Be honest about ties.** If two approaches are genuinely equivalent, say so and let user choose.
- **Flag disagreements.** If subagent's reasoning contains error, call it out in Analysis section.
- **Synthesis over selection.** Always check if hybrid is better before defaulting to one winner.
- **Selective loading only.** Never load entire reference files. Always filter to matched entries.
- **No docs/ references.** `docs/` contains human-readable versions of references. This skill must NEVER read from `docs/`.
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
