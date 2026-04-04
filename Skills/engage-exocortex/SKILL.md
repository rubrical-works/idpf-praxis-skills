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
Fan out into N independent solution paths in parallel, then synthesize the best answer from structured subagent reports. All reference data is schema-validated JSON in `resources/`. Only matched entries are loaded, not the full corpus.
## When to Use
- Multiple plausible data structures, algorithms, or architectural approaches
- Trade-offs aren't immediately obvious (time vs. space, simplicity vs. performance)
- User says "explore", "compare", "think through", or similar
- Problem is complex enough that single-pass might miss a better approach
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths to explore (2-4) | 3 |
| `--no-proposal` | Skip proposal document | *(writes proposal)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
`--model` overrides subagent exploration only. Primary agent (signal matching, synthesis, proposal) uses parent session model.
## Core Workflow
```
PRIMARY AGENT
     │
     ├── 0. [Optional] Detect domain → load relevant skills for context
     ├── 1. Parse problem → extract signal keywords
     ├── 2. Match signals → load matched JSON entries selectively
     ├── 3. Score matches → select N paths (deterministic)
     ├── 4. Anti-overlap check → ensure path diversity
     │
     ├── 5. Spawn N subagents in PARALLEL (slot-filled briefs)
     │       ├── Path 1: [approach] ──► JSON report
     │       ├── Path 2: [approach] ──► JSON report
     │       └── Path N: [approach] ──► JSON report
     │
     ├── 6. SYNTHESIS: validate, score, optionally hybridize ──► recommendation
     └── 7. [Default] Write exploration proposal to Proposal/EXO-{slug}.md
```
**Opt-out:** Pass `--no-proposal` to skip document generation (Step 7).
## Step 0 — Context Gathering (Optional)
**Skip for algorithmic-only problems** (competitive programming, data structure selection, pure algorithm design).
**Run for architecture/design problems** — existing codebases, infrastructure decisions, testing strategies, system design.
### Domain Detection
Scan problem for keywords: architecture, design, infrastructure, testing, deployment, database, API, auth, cache, scale, microservice, pipeline, CI/CD, sandbox, migration, security. If any match, proceed with context gathering.
### Skill Loading
Read `resources/skill-context-map.json` for domain-to-skill mapping.
- **Maximum 3 skills** per invocation
- Select by relevance to detected keywords (highest match count first)
- Loading is **read-only** — context for path selection, not implementation
- If `codebase-analysis` is relevant AND existing codebase present, prioritize it
### What Context Provides
Loaded skills enrich Step 1's signal extraction — e.g., knowing PostgreSQL boosts database signals, Playwright boosts test infrastructure signals. Context is passed as additional keywords and constraints; it does not change the signal matching algorithm.
## Step 1 — Parse Problem and Match Signals
1. Parse the problem — identify core challenge, constraints, success criteria
2. Extract signal keywords from problem statement and Step 0 context (if run)
3. Read `resources/cross-references.json` — match keywords against `signals[].keywords` arrays
4. For each matched signal, collect paradigm, structure, and strategy references with weights
5. Aggregate scores — highest cumulative weights are best candidates
### Selective Loading
For each top-scoring paradigm ID, read only that entry from `resources/paradigms.json` (matching `id`). Do NOT load the entire file. Repeat for `resources/structures.json` and `resources/strategies.json`.
### No Signal Matches
If no signals match: report "No matching paradigms found for the given problem characteristics" with unmatched keywords. Suggest user broaden or rephrase. **Do not proceed to subagent dispatch.**
## Step 2 — Determine N and Name Paths
### Adaptive N Selection
| Problem Characteristics | Recommended N |
|---|---|
| One clearly dominant paradigm, minor variations | 2 |
| Multiple competing paradigms with real trade-offs | 3 (default) |
| Underspecified or unusual constraint combinations | 4 |
| User explicitly specifies (e.g., `--paths 3`) | User's N |
**Never below 2.** Above 4 rarely useful — prefer depth over breadth.
### Path Naming
Encode **both** paradigm and key structure/strategy. Non-overlapping names from loaded JSON entries.
```
✅ "Min-heap greedy with lazy deletion"
✅ "Bottom-up interval DP on sorted endpoints"
❌ "Greedy approach"
❌ "DP solution"
```
### Anti-Overlap Check
Read `resources/cross-references.json` → `antiOverlapRules[]`. Verify:
- No two paths share same paradigm **and** structure (Jaccard similarity < `overlapThreshold`)
- Each path uses distinct primary paradigm where possible
- No identical (paradigm, structure, strategy) tuples
If paths too similar, merge and select a different candidate.
## Step 3 — Spawn Subagents in Parallel
Spawn all N subagents **at the same time** using the Agent tool with `model: "opus"` (or `--model` override if provided).
### Brief Generation (Slot-Filling)
Read `resources/brief-template.json`. For each path, fill slots:
- `problemStatement` — user's problem
- `assignedApproach` — path name and loaded paradigm/structure/strategy details
- `constraints` — problem constraints from Step 1
- `maxSteps` — exploration depth limit
- `maxOutputLines` — output size cap
### Subagent Task
Each subagent performs **reasoning and planning only** — no code execution:
- Explain core idea of approach
- Work through algorithm step-by-step with concrete example
- Analyze time and space complexity
- Identify edge cases and handling
- Note key implementation considerations
- Honest assessment of strengths and weaknesses
### Report Format
Subagents return JSON conforming to `resources/report-template.json`. Read `resources/report-schema.json` to validate. If malformed: identify failed fields, exclude from synthesis, warn user.
## Step 4 — Synthesis
Read `resources/synthesis-config.json` for scoring rubric. Follow defined phases:
1. **Validate** — check complexity claims and edge case reasoning independently
2. **Score** — rate on rubric dimensions (always-relevant + conditionally-relevant)
3. **Hybridize** — check if best parts of two approaches combine
4. **Output** — final recommendation
### Final Output Format
```
## Parallel Exploration: [Problem Title]
### Paths Explored (N=[n])
- Path 1: [Name] — [one-sentence summary]
- Path 2: [Name] — [one-sentence summary]
### Analysis
[2–4 sentences per path: correctness, complexity, trade-offs. Call out subagent reasoning errors.]
### Recommendation
**Best approach: [Name]**
Reason: [2–3 sentences — why this wins given constraints]
[Optional] **Hybrid possibility:** [Name] + [Name]
How: [1–2 sentences on combination and gains]
### Implementation Sketch
[Pseudocode or high-level outline — enough to communicate the algorithm unambiguously.]
```
## Step 5 — Generate Exploration Proposal Document
**Skip if `--no-proposal` was specified.**
Write to `Proposal/EXO-{problem-slug}.md` (lowercase-hyphenated summary of problem title).
### Document Structure
Read `resources/proposal-template.json` for structure. Sections:
1. **Metadata** — Date, skill name, signals matched, paths explored count
2. **Problem Statement** — Original user query
3. **Context Sources** (optional) — Present only when Step 0 ran. Lists loaded skills, codebase analysis findings, tech stack. Omitted for algorithmic-only problems.
4. **Signal Analysis** — Matched signals with weights, loaded paradigms/structures/strategies
5. **Path sections** (one per path) — Brief given, full structured report (core idea, walkthrough, complexity, edge cases, strengths/weaknesses, fit score)
6. **Synthesis** — Scoring matrix, validation notes, hybridization analysis
7. **Recommendation** — Final recommendation with implementation sketch
8. **Rejected Paths** — Considered but not selected, with reasons
### Capture Points
| Step | What to Capture |
|------|----------------|
| Step 0 | Loaded skills, domain detection results (if run) |
| Step 1 | Matched signals, keyword extractions, loaded JSON entry IDs |
| Step 2 | Selected paths, rejected paths with reasons, N value |
| Step 3 | Each subagent's filled brief |
| Step 3 (return) | Each subagent's JSON report |
| Step 4 | Scoring matrix, validation notes, hybrid analysis, recommendation |
Document generation failure is **non-blocking** — conversation output remains valid.
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| JSON data file fails schema validation | Report validation error with file path and violation details; halt |
| Reference file missing from disk | Fail with clear file-not-found message naming the missing file |
| No signals match in cross-references.json | Report "no matching paradigms found" with unmatched characteristics |
| Subagent returns non-conforming JSON | Detect report-schema.json violation; report failed fields; exclude from synthesis |
| Malformed JSON (syntax error) in reference file | Fail at parse time with file path and parse error location |
| Cross-reference key drift | Warn when key exists in cross-references.json but has no corresponding data entry |
## Important Constraints
- **Subagents plan; primary agent validates.** Do not blindly accept complexity claims — check independently.
- **Be honest about ties.** If two approaches are genuinely equivalent, say so.
- **Flag disagreements.** Call out subagent reasoning errors in Analysis section.
- **Synthesis over selection.** Always check if hybrid is better before defaulting to one winner.
- **Selective loading only.** Never load entire reference files. Always filter to matched entries.
- **No docs/ references.** The `docs/` directory is human-readable only. This skill must NEVER read from `docs/`.
## Reference Files
All in `resources/`. Each JSON data file has a colocated schema for validation.
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
