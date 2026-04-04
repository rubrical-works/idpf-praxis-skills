# Exploration Proposal Document Format

When engage-exocortex completes a parallel exploration, it generates a persistent markdown document in `Proposal/` capturing the full lifecycle. This guide describes the document format.

## File Location

`Proposal/HAL-{problem-slug}.md` — where `{problem-slug}` is a lowercase-hyphenated summary (e.g., `HAL-sandbox-e2e-tests-electron.md`).

## Opting Out

Pass `--no-proposal` to skip document generation. The conversation output remains unchanged — only the file write is skipped.

## Document Sections

### Metadata Header
Date, skill name, number of signals matched, number of paths explored.

### Problem Statement
The original user query, reproduced verbatim.

### Context Sources (Optional)
Present only when Step 0 (context gathering) ran. Lists which skills were loaded and what context they provided (e.g., tech stack detected, anti-patterns flagged). Omitted entirely for algorithmic-only problems where Step 0 was skipped.

### Signal Analysis
Which signals from `cross-references.json` matched the problem, with match weights. Lists the paradigm/structure/strategy IDs that were selectively loaded as a result.

### Path Sections (one per explored path)
Each path has two subsections:
- **Brief** — The slot-filled brief sent to the subagent, showing the approach assignment, constraints (`maxSteps`, `maxOutputLines`), and problem context.
- **Report** — The full structured report returned by the subagent: core idea, step-by-step walkthrough, complexity analysis, edge cases, implementation considerations, strengths, weaknesses, and self-assessed fit score.

### Synthesis
Three subsections:
- **Scoring Matrix** — Table of dimension scores per path across always-relevant and conditionally-relevant scoring dimensions.
- **Validation Notes** — Errors found in subagent reasoning, corrected complexity claims, or flawed assumptions.
- **Hybridization Analysis** — Whether the best elements of two paths can be combined into a hybrid approach.

### Recommendation
The final recommendation: which approach (or hybrid) is best, why, and an implementation sketch.

### Rejected Paths
Paths that were considered during signal matching but not selected for exploration. Each entry lists the path name, paradigm/structure/strategy combination, and the reason it was rejected (e.g., too similar to a selected path, low signal match score, anti-overlap rule triggered).

## Why This Document Exists

- **Traceability** — Preserves why a particular approach was chosen
- **Review** — Others can evaluate the analysis without re-running
- **Iteration** — If the chosen approach fails, alternatives are already documented
- **IDPF integration** — `Proposal/` is the standard location for design decisions
