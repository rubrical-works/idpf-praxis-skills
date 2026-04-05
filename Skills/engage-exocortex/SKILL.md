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
Fan out into N independent solution paths in parallel, then synthesize the best answer from structured subagent reports. All reference data is schema-validated JSON in `resources/`. Only matched entries are loaded.
## When to Use
- Multiple plausible approaches with non-obvious trade-offs
- User says "explore", "compare", "think through"
- Problem complex enough that single-pass might miss better approach
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths (2-4) | 3 |
| `--no-proposal` | Skip proposal document | *(writes proposal)* |
| `--model <model>` | Subagent model override | `opus` |
`--model` overrides subagent model only. Primary agent uses parent session model.
## Core Workflow
```
PRIMARY AGENT
  ├── 0. [Optional] Detect domain → load relevant skills for context
  ├── 1. Parse problem + confirm keywords → match signals → classify quality
  ├── 2. Score matches → select N paths (deterministic)
  ├── 3. Anti-overlap check → ensure path diversity
  ├── 4. Spawn N subagents in PARALLEL (slot-filled briefs)
  │     ├── Path 1: [approach] ──► JSON report
  │     ├── Path 2: [approach] ──► JSON report
  │     └── Path N: [approach] ──► JSON report
  ├── 5. SYNTHESIS: validate, score, optionally hybridize ──► recommendation
  └── 6. [Default] Write exploration proposal to Proposal/EXO-{slug}.md
```
Opt-out: `--no-proposal` skips Step 6.
## Step 0 — Context Gathering (Optional)
**Skip for algorithmic-only problems.** Run for architecture/design problems involving codebases, infrastructure, testing, or system design.
### Domain Detection
Scan for keywords: architecture, design, infrastructure, testing, deployment, database, API, auth, cache, scale, microservice, pipeline, CI/CD, sandbox, migration, security.
### Skill Loading
Read `resources/skill-context-map.json`. Rules:
- **Maximum 3 skills** per invocation
- Select by relevance (highest keyword match count)
- Read-only — context for path selection, not implementation
- Prioritize `codebase-analysis` if relevant and codebase present
Context enriches Step 1 signal extraction (e.g., PostgreSQL boosts DB signals). Passed as additional keywords/constraints — does not change matching algorithm.
## Step 1 — Parse Problem and Confirm Keywords
1. **Parse the problem** — identify core challenge, constraints, success criteria.
2. **Extract signal keywords** from problem + Step 0 context (if run).
### Keyword Confirmation Gate (Mandatory)
Confirm interpreted problem and keywords with user before signal matching.
**3. Confirm keywords** using `AskUserQuestion`:
**Zero keywords:** Skip to rephrase prompt — do not present empty list:
> "I couldn't extract signal keywords from this problem. Could you rephrase it with more specific terms?"
**Single keyword:** Present gate normally, append warning:
> "⚠️ Only one keyword extracted — exploration quality may be limited with sparse input. Consider adding related terms."
**Normal flow (1+ keywords):**
- Restate problem in 1-2 sentences
- List extracted keywords
- `AskUserQuestion` options: `"Confirmed — proceed"`, `"Let me adjust keywords"`, `"Rephrase the problem"`
**On response:**
- **Confirmed**: Validate ≥1 keyword exists. Proceed to signal matching.
- **Adjust keywords**: Accept corrections, re-display via `AskUserQuestion`, loop until confirmed.
- **Rephrase**: Re-parse from scratch, extract fresh keywords, present again. Repeat sparse warning if single keyword persists.
**Fallback:** If `AskUserQuestion` unavailable, fall back to text-based confirmation. Never silently skip the gate.
**No signal matching or subagent dispatch without user confirmation.**
### Step 1b — Match Signals
4. **Run signal matcher:**
   ```bash
   node scripts/match-signals.js "keyword1" "keyword2" [...] [--paths N]
   ```
   Reads `resources/cross-references.json`, matches keywords, aggregates weighted scores, returns top N path candidates as JSON.
5. **Parse output** — `ok: true` means matches found. Use `scores.paradigms`, `scores.structures`, `scores.strategies` for Step 2.
### Selective Loading
Load only matched entries:
```bash
node scripts/load-entries.js paradigm <id1> [id2] [...]
node scripts/load-entries.js structure <id1> [id2] [...]
node scripts/load-entries.js strategy <id1> [id2] [...]
```
Do NOT read full resource files. Monitor `tokenEstimate` — combined output should stay under 10K tokens.
### Step 1c — Classify Match Quality
| Tier | Condition | Mode |
|------|-----------|------|
| **Strong** | 3+ signals, 2+ distinct primary paradigms | Structured (standard) |
| **Weak** | 1-2 signals, or all share same primary paradigm | Structured with adaptation |
| **None** | Zero matched signals (`ok: false`) | Adaptive mode |
**Report tier to user:**
- Strong: `"Match quality: strong (N signals across M paradigms) — proceeding with structured exploration"`
- Weak: `"⚠️ Match quality: weak (N signals) — using partial matches as anchors with reduced path count"`
- None: `"Match quality: none — switching to adaptive mode with tension-driven path definition"`
#### Strong Match Path
Proceed with Step 2 — no change to current behavior.
#### Weak Match Path
1. **Anchors + closest-neighbor supplementation.** Check `cross-references.json` for signals with keyword substring overlap — adjacent signals that didn't match directly.
2. **Reduce path count.** N=2 instead of default N=3.
3. **Widen subagent briefs.** Set `explorationScope` to `"broad"`, include full problem statement, instruct subagents to consider approaches outside matched paradigm.
4. **Selective loading still applies.** Load matched + neighbor entries. Monitor token budget.
#### No Match Path — Adaptive Mode
Preserves core methodology (parallel paths, anti-overlap, subagent dispatch) while replacing signal-driven path selection with tension-driven definition.
**Step A — Hybrid signal construction.** Re-examine keywords at lower threshold (2+ shared words vs. substring containment). If 2+ weak anchors found, promote to Weak Match Path.
**Step B — Tension-driven path definition.** If hybrid construction insufficient:
1. **Identify key tensions.** Analyze for 2-4 fundamental design tensions/trade-offs.
2. **Define paths from tensions.** Each path specifies: `tensionResolution`, `keyIdea`, `tradeoffs`.
3. **Verify anti-overlap.** Same check as signal-driven: no two paths share same resolution on all tensions.
4. **Brief subagents with tension framing.** Full problem context + tension resolution + key idea + trade-offs. Populate paradigm/structure/strategy fields with tension descriptions (not empty).
5. **Report adaptive mode:** "Running in adaptive mode. Identified {N} key design tensions, defined {N} distinct paths. Anti-overlap verified."
## Step 2 — Determine N and Name Paths
**Strong and Weak tiers only.** Adaptive mode paths defined in Step 1c — skip to Step 3.
### Adaptive N Selection
| Problem Characteristics | Recommended N |
|---|---|
| One dominant paradigm, minor variations | 2 |
| Multiple competing paradigms with trade-offs | 3 (default) |
| Underspecified or unusual constraints | 4 |
| User specifies (e.g., `--paths 3`) | User's N |
| **Weak match tier** | **2** |
**Never below 2.** Above 4 rarely useful — prefer depth over breadth.
### Path Naming
Encode **both** paradigm and key structure/strategy:
```
✅ "Min-heap greedy with lazy deletion"
✅ "Bottom-up interval DP on sorted endpoints"
❌ "Greedy approach"
❌ "DP solution"
```
### Anti-Overlap Check
`match-signals.js` output `paths[]` applies paradigm diversity. Verify against `resources/cross-references.json` → `antiOverlapRules[]`:
- No two paths share same paradigm **and** structure (Jaccard < `overlapThreshold`)
- Distinct primary paradigms where possible
- No identical (paradigm, structure, strategy) tuples
If too similar, merge and select different candidate.
## Step 3 — Spawn Subagents in Parallel
Spawn all N subagents **simultaneously** via Agent tool with `model: "opus"` (or `--model` override).
### Brief Generation (Slot-Filling)
Read `resources/brief-template.json`. Fill per path:
- `problemStatement` — user's problem
- `assignedApproach` — path name + loaded paradigm/structure/strategy details
- `constraints` — from Step 1
- `maxSteps` — exploration depth limit
- `maxOutputLines` — output size cap
### Subagent Task
**Reasoning and planning only** — no code execution:
- Core idea, step-by-step walkthrough with example
- Time/space complexity, edge cases
- Implementation considerations, honest strengths/weaknesses
### Report Format
JSON per `resources/report-template.json`. Validate against `resources/report-schema.json`. Malformed: identify failed fields, exclude, warn user.
## Step 4 — Synthesis
Read `resources/synthesis-config.json`. Phases:
1. **Validate** — check complexity claims and edge case reasoning
2. **Score** — rate on rubric dimensions (always-relevant + conditional)
3. **Hybridize** — check if best parts of two approaches combine
4. **Output** — final recommendation
### Final Output Format
```
## Parallel Exploration: [Problem Title]
### Paths Explored (N=[n])
- Path 1: [Name] — [summary]
- Path 2: [Name] — [summary]
### Analysis
[2–4 sentences per path: correctness, complexity, trade-offs. Call out reasoning errors.]
### Recommendation
**Best approach: [Name]**
Reason: [2–3 sentences]
[Optional] **Hybrid possibility:** [Name] + [Name]
How: [1–2 sentences]
### Implementation Sketch
[Pseudocode/high-level outline of recommended approach]
```
## Step 5 — Generate Exploration Proposal Document
**Skip if `--no-proposal` specified.**
Write to `Proposal/EXO-{problem-slug}.md` (lowercase-hyphenated problem title).
Read `resources/proposal-template.json`. Sections: Metadata, Problem Statement, Context Sources (optional, Step 0 only), Signal Analysis, Path sections (brief + report), Synthesis, Recommendation, Rejected Paths.
| Step | Capture |
|------|---------|
| 0 | Loaded skills, domain detection (if run) |
| 1 | Matched signals, keywords, loaded entry IDs |
| 2 | Selected/rejected paths, N |
| 3 | Filled briefs, JSON reports |
| 4 | Scoring, validation, hybrid analysis, recommendation |
Document generation failure is **non-blocking**.
## Error Handling
| Failure Mode | Behavior |
|---|---|
| JSON schema validation failure | Report with file path and violation; halt |
| Reference file missing | Fail with file-not-found naming missing file |
| No signals match | Report "no matching paradigms" with unmatched characteristics |
| Non-conforming subagent JSON | Report failed fields; exclude from synthesis |
| Malformed JSON syntax | Fail with file path and parse error location |
| Cross-reference key drift | Warn when key exists but no corresponding data entry |
## Important Constraints
- **Subagents plan; primary agent validates.** Check complexity claims independently.
- **Be honest about ties.** Let user choose if genuinely equivalent.
- **Flag disagreements.** Call out reasoning errors in Analysis.
- **Synthesis over selection.** Always check hybrid before one winner.
- **Selective loading only.** Never load entire reference files.
- **No docs/ references.** Never read from `docs/` — use `resources/` JSON only.
## Reference Files
All in `resources/` with colocated schemas.
| File | Purpose |
|---|---|
| `cross-references.json` | Maps problem signals → paradigm/structure/strategy keys |
| `paradigms.json` | 31 paradigm families (8 algorithmic + 23 SE) |
| `structures.json` | 22 structure families (8 algorithmic + 14 SE) |
| `strategies.json` | 22 strategy families (9 algorithmic + 13 SE) |
| `brief-template.json` | Subagent brief slot template |
| `report-template.json` | Expected subagent report structure |
| `synthesis-config.json` | Scoring rubric and synthesis rules |
| `skill-context-map.json` | Domain-to-skill mapping for Step 0 |
| `proposal-template.json` | Document structure for Step 5 |
