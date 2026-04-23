# Getting Started with Engage Exocortex

Engage Exocortex is a parallel solution explorer. You describe a problem, and it fans out into 2-4 independent solution paths explored simultaneously by subagents, then synthesizes the best answer from their structured reports.

## When to Use It

Use `/engage-exocortex` when:

- You're facing a problem with **multiple plausible approaches** and the best one isn't obvious
- You want to **compare trade-offs** between different algorithms, architectures, or design patterns
- The problem is complex enough that exploring one path might cause you to miss a better one
- You want a **structured, documented analysis** rather than a single-shot answer

It works for both **algorithmic problems** (data structures, algorithms, competitive programming) and **software engineering problems** (architecture decisions, testing strategies, infrastructure design, API patterns).

## How to Invoke It

Use the `/engage-exocortex` slash command followed by your problem description:

```
/engage-exocortex What's the best way to implement a rate limiter
that handles both per-user and global limits with minimal latency?
```

Or use trigger phrases in conversation:

- "explore different approaches to..."
- "compare solutions for..."
- "think through the trade-offs of..."

### Options

| Flag | Effect |
|------|--------|
| `--paths N` | Specify how many paths to explore (2-4, default 3) |
| `--no-proposal` | Skip writing the proposal document |
| `--model <model>` | Override subagent model (default: `opus`) |

## Example Questions

### Algorithmic Problems

- "What's the most efficient data structure for a priority queue that also supports decrease-key?"
- "Compare approaches for finding the longest common subsequence with constraints on memory"
- "Explore strategies for interval scheduling with weighted jobs"

### Architecture and Design

- "Compare approaches for implementing event sourcing in our Express API"
- "What's the best caching strategy for our PostgreSQL-backed REST API?"
- "Explore testing strategies for an Electron app with Playwright"
- "Compare microservice vs modular monolith for our payment processing system"

### Infrastructure

- "What's the best approach for zero-downtime database migrations?"
- "Compare CI/CD pipeline patterns for a monorepo with 5 services"
- "Explore deployment strategies for a real-time WebSocket application"

## What Happens After You Ask

1. **Signal matching** -- Your problem is analyzed for keywords that map to known paradigms, data structures, and strategies from the skill's reference corpus
2. **Path selection** -- The top 2-4 distinct approaches are selected, ensuring diversity (no two paths overlap too much)
3. **Parallel exploration** -- Subagents are launched simultaneously, each exploring one approach in depth: core idea, step-by-step walkthrough, complexity analysis, edge cases, strengths and weaknesses
4. **Synthesis** -- All reports are scored, validated, and compared. Hybrid approaches are considered
5. **Recommendation** -- You get a final recommendation with rationale and implementation sketch

For architecture/design problems, there's an optional **context gathering** pre-step that detects your tech stack and loads relevant skills to enrich the analysis.

## What You Get Back

### In the Conversation

A structured analysis with:
- Summary of each explored path
- Per-path analysis (correctness, complexity, trade-offs)
- A clear recommendation with reasoning
- Optional hybrid suggestion if two approaches combine well
- An implementation sketch (pseudocode or high-level outline)

### As a Document (default)

A persistent markdown file saved to `Proposal/EXO-{problem-slug}.md` capturing the full exploration lifecycle -- signals matched, paths explored, subagent reports, scoring matrix, and final recommendation. This serves as a decision record you can reference later.

Pass `--no-proposal` to skip document generation.

## Model Requirements

Engage Exocortex spawns subagents with `model: "opus"` by default, regardless of what model the parent session is running. This is intentional — the skill's value comes from deep, independent reasoning by each subagent. Running subagents on a lighter model produces shallower analysis and undermines the parallel exploration approach.

| Component | Model | Why |
|-----------|-------|-----|
| Signal matching + path selection | Parent session | Needs deep problem understanding |
| Subagent exploration | **Opus** (default) | The whole point — deep independent reasoning |
| Synthesis + scoring | Parent session | Needs to catch errors in subagent reasoning |
| Proposal document generation | Parent session | Mostly templated writing from structured data |

### Overriding the Model

Use `--model sonnet` or `--model haiku` to run subagents on a lighter model. This reduces cost and latency but produces shallower exploration:

```
/engage-exocortex --model sonnet What's the best caching strategy?
```

**Trade-off warning:** Lighter models tend to produce surface-level analysis. The synthesis step will have less to work with, and you may get results similar to a single-pass answer split into pieces. Use this override for quick explorations where cost matters more than depth.

## Tips for Better Results

- **Be specific about constraints.** "Implement a cache" is vague. "Implement a cache with LRU eviction, 10K entries, and O(1) lookup" gives the skill concrete signals to work with.
- **Mention your tech stack.** If you say "in our Express app with PostgreSQL," the skill loads relevant context that improves path selection.
- **State what matters most.** "Optimize for read latency" or "minimize memory footprint" helps the synthesis phase pick a winner.
- **Ask for more paths when uncertain.** Use `--paths 4` when the problem space is wide or underspecified.
- **Ask for fewer paths when focused.** Use `--paths 2` when you already know the general direction but want to compare two specific approaches.

## Why no web-research enforcement (#222)

Sister skills `/engage-prism` and `/debate-prism` carry a strict
contract for subagent web research: every non-derived claim must cite
a source via `citation-schema.json`, `webResearch.performed=false` must
include a schema-conforming `attemptedCalls[]` record, and the primary
agent rejects zero-fetch returns and re-dispatches with named-URL
directives (#220, #221).

`/engage-exocortex` does **not** carry these requirements because its
subagents are briefed to reason about algorithms and architecture from
training memory, with optional codebase context loaded via
`skill-context-map.json` (read-only Read calls into project files, not
WebFetch). There is no `webResearch` field on the report, no
`attemptedCalls[]` array, no `citations[]` array, no `fetchCount` —
the fabrication-risk attack surface that motivates the prism enforcement
simply does not exist here.

If you want web-grounded reasoning (current docs, RFCs, CVEs) for an
architecture decision, use `/engage-prism` instead — its catalog covers
business and architectural framings and its citation contract makes the
evidence base auditable. Or run both, but on different parts of the
question.

This is intentional design, not an enforcement gap. Don't file a bug
asking for the prism contract to be ported to `/engage-exocortex`
without also proposing a citation-schema and a per-claim fetch budget.

