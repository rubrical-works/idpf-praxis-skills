---
name: hal-2026
description: >-
  JSON-driven parallel solution explorer with schema-validated references,
  deterministic path selection via structured signal matching, and
  selective loading for minimal token usage.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-03"
license: Complete terms in LICENSE.txt
category: problem-solving
relevantTechStack: [algorithms, data-structures, parallel-exploration, json-schema]
copyright: "Rubrical Works (c) 2026"
---
# HAL-2026 — Parallel Solution Explorer
Fan out into N independent solution paths in parallel, then synthesize the best answer from structured subagent reports. All reference data is schema-validated JSON in `resources/`. Only matched entries are loaded, not the full corpus.
## When to Use
- Multiple plausible data structures, algorithms, or architectural approaches
- Trade-offs aren't immediately obvious (time vs. space, simplicity vs. performance)
- User says "explore", "compare", "think through", or similar
- Problem is complex enough that single-pass might miss a better approach
## Core Workflow
```
PRIMARY AGENT
     │
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
     └── 6. SYNTHESIS: validate, score, optionally hybridize ──► recommendation
```
## Step 1 — Parse Problem and Match Signals
1. Parse the problem — identify core algorithmic challenge, constraints, success criteria
2. Extract signal keywords from the problem statement
3. Read `resources/cross-references.json` — match keywords against `signals[].keywords` arrays
4. For each matched signal, collect paradigm, structure, and strategy references with weights
5. Aggregate scores — highest cumulative weights are best candidates
### Selective Loading
For each top-scoring paradigm ID, read only that entry from `resources/paradigms.json` (matching `id`). Do NOT load the entire file. Repeat for `resources/structures.json` and `resources/strategies.json` — load only matched entries.
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
**Never go below 2.** Above 4 is rarely useful — prefer depth over breadth.
### Path Naming
Encode **both** paradigm and key structure/strategy. Use loaded JSON entries for specific, non-overlapping names.
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
Spawn all N subagents **at the same time** using the Agent tool.
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
Subagents return JSON conforming to `resources/report-template.json`. Read `resources/report-schema.json` to validate each report. If malformed: identify failed fields, exclude from synthesis, warn user.
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
| `cross-references.json` | Decision matrix: maps problem signals to paradigm/structure/strategy keys |
| `paradigms.json` | Dimension 1: algorithmic paradigms (8 families with sub-variants) |
| `structures.json` | Dimension 2: data structures (8 families with variants) |
| `strategies.json` | Dimension 3: decomposition strategies (9 strategies) |
| `brief-template.json` | Subagent brief slot template with constraint fields |
| `report-template.json` | Expected subagent report structure |
| `synthesis-config.json` | Scoring rubric and synthesis rules |
