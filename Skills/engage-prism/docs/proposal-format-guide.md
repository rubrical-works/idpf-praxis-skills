# Proposal Format Guide

Unless `--no-proposal` is set, every `engage-prism` run produces **two**
artifacts:

1. **Main proposal** — `Proposal/PRISM-{question-slug}.md` — a decision-
   focused markdown document, target under **8KB for typical runs**.
2. **Audit sibling** — `Proposal/PRISM-{question-slug}.audit.json` — a
   machine-readable JSON record carrying the raw subagent envelopes,
   full citation lists, per-dimension scoring matrix, `attemptedCalls[]`,
   and signal-matching tables.

The structure of the main proposal is defined by
[`resources/proposal-template.json`](../resources/proposal-template.json);
this guide walks the sections in order. Verbose structured data that
used to live inline (full signal tables, raw JSON reports, complete
scoring matrices) now lives in the audit sibling — the main proposal
keeps only the decision narrative.

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
| `pathsExplored` | integer (2–4) |
| `webResearchPerformed` | boolean |
| `convergent` | boolean — from the disagreement-audit phase |
| `bearPathTriggered` | boolean — set by the Step 2 red-team heuristic |
| `auditSibling` | path to the `PRISM-{slug}.audit.json` sibling |

`webResearchPerformed: false` is the signal that degradation occurred
on this run; the Research Plan section must then explain why.
`convergent: true` with no consensus-or-groupthink caveat in the
Recommendation section is a contract violation.

### 2. `## Question`

The original user query, verbatim.

### 3. `## Research Plan`

The Step 0 plan: entity anchors, source classes, recency window,
authority preferences, and fetch budget.
[research-plan-guide.md](research-plan-guide.md) covers this in detail.

When `webResearchPerformed=false`, this section names the degradation
reason (sandbox / `--no-web` / tool unavailable) and the implication
for the recommendation.

### 4. `## Signal Analysis` — one-line footnote only

A single line: either the matched signals (when `--structured-routing`
was set) or the string `"adaptive mode — no signal match"` or
`"default routing — primary agent named paths directly"`. Full weight
tables, per-paradigm scores, and rejected-angle enumeration live in the
audit JSON sibling under `signalAnalysis`. The main proposal no longer
carries the signal table inline — decisions shouldn't have to compete
with routing metadata for the reader's attention.

### 5. `## Path {N}: {pathName}` — repeating; narrative only

One path section per explored path. Each contains:

- `### Brief` — one-sentence angle summary plus the path's declared
  `primarySourceClass`. Full brief (research plan, exclusions,
  constraints) lives in the audit JSON at `paths[N].brief`. See
  [subagent-brief-guide.md](subagent-brief-guide.md).
- `### Report` — a 3–6-sentence narrative: core claim, strongest
  citation (title + one-line excerpt), notable gaps. The full
  structured report — `citations[]`, `webResearch`, `attemptedCalls[]`,
  per-step analysis, evidence base — lives in the audit JSON at
  `paths[N].report`. **Never paste raw JSON inline** in the main
  proposal. See [report-format.md](report-format.md).

Paths are numbered in dispatch order and the `pathName` is the angle
name from the brief. When the run triggered a red-team / bear path
(directional question — see SKILL.md Step 2), one of the paths is
labeled `(bear)` in its heading and its brief explicitly names the
claim it is attacking.

### 6. `## Synthesis`

Four subsections, all decision-focused summaries — full per-dimension
tables live in the audit JSON:

- `### Disagreement Audit` — the `convergent: true|false` flag plus
  named disagreement points when `convergent: false`. On `convergent:
  true`, the consensus-or-groupthink caveat is mandatory.
- `### Bear Path Outcome` — when the red-team path was triggered,
  state whether the bear survived validation with a one-line counter-
  case summary, or name why it failed. Omit this subsection when no
  bear path was triggered.
- `### Scoring Summary` — one line per path: winner + any
  disqualification notes. The full scoring matrix (per-dimension scores
  on the `Strong | Adequate | Weak | Disqualifying` scale) lives in the
  audit JSON under `synthesis.scoringMatrix`.
- `### Hybridization` — the named hybrid with its specific integration
  point, if any. Skip if no hybrid was found.

See [synthesis-guide.md](synthesis-guide.md).

### 7. `## Recommendation`

Final recommendation with rationale that references specific citations
(by Path and citation index). The recommendation MUST explicitly
surface three signals:

- `convergent: true|false` (and the consensus-or-groupthink caveat when
  `true`),
- bear-path outcome when the red-team heuristic was triggered,
- any degraded path (`webResearch.performed=false`) — degraded runs are
  never presented as if they were research-grounded.

Silent omission of any of the three is a contract violation.

### 8. `## What Would Change This Answer`

2–3 specific observations — new evidence, updated input, or
counterfactual — that would flip the recommendation. This section is
**mandatory**. A proposal without it is malformed.

### 9. `## Audit`

A pointer to the audit JSON sibling file — `PRISM-{question-slug}.audit.json`
— alongside the main proposal. Raw subagent envelopes, full citation
lists, per-dimension scoring matrix, `attemptedCalls[]`, rejected-angle
tables, and signal-matching details live there.

The main proposal section is short because the audit trail now has its
own home — keep the proposal decision-focused and consult the audit
JSON for verification.

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
