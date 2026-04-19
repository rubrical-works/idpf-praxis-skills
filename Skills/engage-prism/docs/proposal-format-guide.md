# Proposal Format Guide

Unless `--no-proposal` is set, every `engage-prism` run produces a
persistent markdown document at `Proposal/PRISM-{question-slug}.md`.
The structure is defined by
[`resources/proposal-template.json`](../resources/proposal-template.json);
this guide walks the sections in order.

See [`examples/README.md`](../examples/README.md) for five end-to-end
example proposals, one per analytical domain.

---

## Filename

`Proposal/PRISM-{question-slug}.md`

`{question-slug}` is a lowercase-hyphenated summary of the question.
Examples:

- `PRISM-enter-japan-b2b-saas.md`
- `PRISM-tam-ev-charging-germany.md`
- `PRISM-equity-ticker-abcd-earnings.md`

Keep slugs short and specific. The slug is the permanent filename and
is referenced in follow-on work.

---

## Section order

### 1. Metadata — `# Parallel Analysis: {questionTitle}`

| Field | Format |
|---|---|
| `date` | `YYYY-MM-DD` |
| `skill` | always `"engage-prism"` |
| `signalsMatched` | comma-separated list of signal keywords |
| `pathsExplored` | integer (2–4) |
| `webResearchPerformed` | boolean |

`webResearchPerformed: false` is the signal that degradation occurred
on this run; the Research Plan section must then explain why.

### 2. `## Question`

The original user query, verbatim.

### 3. `## Research Plan`

The Step 0 plan: entity anchors, source classes, recency window,
authority preferences, and fetch budget.
[research-plan-guide.md](research-plan-guide.md) covers this in detail.

When `webResearchPerformed=false`, this section names the degradation
reason (sandbox / `--no-web` / tool unavailable) and the implication
for the recommendation.

### 4. `## Signal Analysis`

Matched signals with weights; loaded paradigms / structures / strategies
with IDs and scores. This is the deterministic output of
`scripts/match-signals.js` and the selective `load-entries.js` calls.

### 5. `## Path {N}: {pathName}` — repeating

One path section per explored path. Each contains:

- `### Brief` — the filled brief that went to the subagent (assigned
  angle, research plan, citation requirement, exclusions if any). See
  [subagent-brief-guide.md](subagent-brief-guide.md).
- `### Report` — the full structured output the subagent returned:
  core claim, `webResearch` status, `citations[]`, `evidenceBase`,
  analysis steps with citation references, key numbers, counter-
  evidence, recommendation-in-angle, fit score. See
  [report-format.md](report-format.md).

Paths are numbered in dispatch order and the `pathName` is the angle
name from the brief.

### 6. `## Synthesis`

Three subsections:

- `### Citation Validation` — per-path findings from the
  citation-conformance and claim-support checks. Which claims are
  fully supported, which partially, which unsupported. One-line notes
  from the Phase 1 check land here.
- `### Scoring Matrix` — a table of dimension scores per path (always-
  relevant + conditionally-relevant + operational). Scale is `Strong
  | Adequate | Weak | Disqualifying`.
- `### Hybridization Analysis` — cross-path combination opportunities:
  framing + evidence, base-case + tail-risk, aggregate + segment, quant
  + qual.

See [synthesis-guide.md](synthesis-guide.md).

### 7. `## Recommendation`

Final recommendation with rationale that references specific citations
(by Path and citation index). If any path was degraded
(`webResearch.performed=false`), the recommendation names the
degradation explicitly — degraded runs are never presented as if they
were research-grounded.

### 8. `## What Would Change This Answer`

2–3 specific observations — new evidence, updated input, or
counterfactual — that would flip the recommendation. This section is
**mandatory**. A proposal without it is malformed.

### 9. `## Rejected Angles`

Angles considered during signal matching but not selected. For each:
angle name, paradigm / structure / strategy, reason for rejection (too
similar to selected path, low signal-match score, out-of-domain).

This section is part of the audit trail — the next reader can see what
was considered, not just what was chosen.

---

## Cross-links to the examples

The [`examples/`](../examples/) directory has five end-to-end proposals
exercising each analytical domain:

| File | Domain |
|---|---|
| `PRISM-competitor-teardown-acme-vs-rivals.md` | Competitive analysis |
| `PRISM-tam-ev-charging-germany.md` | Market sizing |
| `PRISM-paid-search-campaign-roi.md` | Marketing campaign evaluation |
| `PRISM-equity-ticker-abcd-earnings.md` | Equity / ticker / finance |
| `PRISM-remote-work-retail-trend.md` | Business / market trend |

All URLs in the examples are illustrative `example.com` placeholders.
Real runs produce real URLs from live WebFetch / WebSearch calls.

---

## See also

- [getting-started.md](getting-started.md) — end-to-end walkthrough.
- [synthesis-guide.md](synthesis-guide.md) — what feeds the Synthesis
  and Recommendation sections.
- [examples/README.md](../examples/README.md) — guided reading order
  for the example proposals.
