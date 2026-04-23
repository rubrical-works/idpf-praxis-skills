# Synthesis Guide

Synthesis is the primary agent's job *after* the subagents return. It
turns N structured outputs into one recommendation. The contract is in
[`resources/synthesis-config.json`](../resources/synthesis-config.json);
this guide is its prose companion.

Synthesis runs in **five** phases. The citation-validation phase is what
distinguishes `engage-prism` from `engage-exocortex` — business /
market / finance claims rest on live external evidence, and the primary
agent must verify that evidence actually supports the claims made on
top of it. The disagreement-audit phase (added in #213) makes path
convergence a first-class signal so apparent consensus can't silently
masquerade as independent agreement.

---

## Phase 1 — Validate

The first phase is validation against citations. Four checks:

### 1a. Citation-conformance

Every entry in each subagent's `citations[]` must conform to
[`citation-schema.json`](../resources/citation-schema.json): `title`,
`url`, `fetchedAt` (ISO-8601 with timezone), and `excerpt` are all
required and non-empty. Malformed citations are flagged; their claims
are excluded from synthesis unless another citation also supports them.

### 1b. Claim-support check

For each step in `analysis[]`, the primary agent verifies that the cited
excerpts **actually support the claim**. A citation to a generic source
that does not mention the specific number, geography, or entity in the
claim **fails** this check.

Derived claims are walked — if step 5 derives from steps 2 and 3, the
primary agent checks 2 and 3 too. The output of this check is a set of
one-line notes:

> *Path 2 step 3: claim that market is growing 15% YoY is not supported
> by citation 1 (excerpt only mentions the 5-year CAGR).*

These notes surface directly in the proposal's Citation Validation
subsection.

### 1c. Web-research-status check

If `webResearch.performed=false`, the entire subagent output is
**degraded evidence**. It may still contribute to the final
recommendation, but it cannot win on evidence-weighted dimensions if
another path was research-grounded. If `performed=true` but the
`citations[]` array is empty, the output is malformed — flag and
deprioritize.

### 1d. Recency check

Each citation's `fetchedAt` and (when present) `publishedAt` is checked
against the Step 0 `recencyWindow`. Claims resting on sources outside
the window are flagged and their weight reduced in scoring — not
discarded, but not trusted for current-state claims.

---

## Phase 2 — Score

Score each angle on the rubric in `synthesis-config.json`. The scoring
scale is `Strong | Adequate | Weak | Disqualifying`. A single
`Disqualifying` score eliminates the angle from being the *primary*
recommendation — but it may still contribute to a hybrid.

### Always-relevant dimensions

- **Evidence strength** — density and authority of citations supporting
  the core claim.
- **Analytical rigor** — explicit derivations, separated assumptions,
  named uncertainties.
- **Decision usefulness** — does the angle actually help the user
  decide? A beautifully-cited analysis that does not land a
  recommendation is Weak here.
- **Counter-evidence handling** — honest engagement with contrary
  sources, not dismissal.
- **Source authority** — regulators, filings, and official statistics
  score higher than aggregators, which score higher than opinion. The
  `sourceClass` field on each citation feeds this.

### Conditionally-relevant dimensions

Apply only when the question demands them:

- **Quantitative calibration** — when the question asks for a number.
- **Sensitivity awareness** — when the recommendation depends on
  uncertain inputs.
- **Regulatory completeness** — for regulated activities.
- **Competitive reality** — when rivals exist; thin rival coverage
  scores lower.
- **Segment specificity** — when aggregates would hide material
  segment-level variance.

### Operational dimensions

Apply when the question demands a decision soon or commits real
resources:

- **Action specificity** — concrete next action, owner, or decision
  rule. "Enter Japan, starting with enterprise SaaS, 2H 2026" is
  Strong. "Consider opportunity in Japan" is Weak.
- **Cost awareness** — explicit cost range, not unexamined.

---

## Phase 3 — Hybridize

Before picking a winner, check whether a combination beats any single
angle. The config lists four canonical hybrid types:

- **Framing + evidence** — Path A's analytical framing with Path B's
  stronger evidence base grafted on. Name the grafted citations.
- **Base case + tail risk** — Path A's base case with Path B's tail-
  risk scenario as a watch-item.
- **Aggregate + segment** — Path A's aggregate framing with Path B's
  segment-level decomposition.
- **Quant + qual** — Path A's number with Path B's qualitative factor
  as a gating condition.

State hybrids explicitly. Name what each contributes. "Use both" is
not a synthesis.

---

## Phase 4 — Disagreement Audit

Before writing the recommendation, enumerate where the paths disagreed.
For each validated dimension (evidence strength, analytical rigor,
decision usefulness, counter-evidence handling, source authority, and
any applicable conditional/operational dimensions), note whether paths
agreed on the winner or disagreed on ranking/claims. Record disagreement
points explicitly — "On counter-evidence handling, Path A cited X to
rebut Path B's claim Y — disagreement."

Then set the **`convergent`** flag:

- **`convergent: true`** — paths agreed on the winner AND on named facts
  across all validated dimensions (no material disagreement recorded).
- **`convergent: false`** — ANY material disagreement exists — different
  winners, conflicting facts, contradictory recommendations.

When `convergent: true`, the recommendation MUST surface the caveat:
convergence may mean consensus or groupthink — the user judges which it
is. Paths fed the same research plan and source-class constraints can
reach the same conclusion by independent inference OR by sharing a
hidden upstream assumption. Silent convergence hides this distinction;
explicit convergence lets the user ask the next question.

When `convergent: false`, surface the disagreement points directly in
the recommendation so the user sees where the analytical tension
actually lives.

### Bear-path survival check

When the run triggered a red-team / bear path (directional questions —
see SKILL.md Step 2), the disagreement audit also records whether the
bear path survived validation. The recommendation MUST include one of:

- **"Bear survived: <one-line counter-case summary>"** — the bear's
  best citation held up under the validation checks and is a genuine
  reason for caution.
- **"Bear failed: <reason>"** — the bear's citations didn't survive
  recency, conformance, or claim-support checks, which strengthens the
  for-case.

Silent omission of the bear-path outcome is a contract violation.

---

## Phase 5 — Output

Write the final output in the format SKILL.md specifies — including the
mandatory "What Would Change This Answer" section and the explicit
`convergent` flag from Phase 4. Five principles govern the write-up:

- **Be direct** — name a winner. Hedging is acceptable only with a
  concrete decision rule ("enter if projected unit economics reach
  gross margin 60%+, otherwise wait").
- **Show citations in reasoning** — the Analysis section references
  specific citations, not just restated angle claims.
- **Surface degradation** — if any path was produced with
  `webResearch.performed=false`, say so in the recommendation.
- **"What would change this answer" is mandatory** — end with 2–3
  specific observations that would flip the recommendation.
- **Surface the convergent flag** — emit `convergent: true` or `false`
  directly in the recommendation. On `true`, include the consensus-or-
  groupthink caveat. On `false`, name the specific disagreement points.
  Silent omission is a contract violation.

---

## Common mistakes synthesis must avoid

The config lists five:

- **Authority laundering** — treating an aggregator's summary as
  equivalent to the primary source it quotes. Check the chain when it
  matters.
- **Recency illusion** — a fresh `fetchedAt` does not guarantee fresh
  information. Prefer `publishedAt` when available.
- **False precision** — a cited number is not a reliable number unless
  its methodology is understood.
- **Advocacy drift** — subagents are briefed to explore one angle;
  their enthusiasm is not evidence of quality.
- **False hybrids** — "use both" with no specific integration point is
  not a hybrid.

---

## Distinguishing environmental degradation from evidence-fabrication-risk (#220)

Two superficially similar return shapes mean very different things, and the
synthesis phase tags them differently:

| Shape | Tag | Meaning | Treatment |
|---|---|---|---|
| `performed=false` with conforming `attemptedCalls[]` (method + targetUrl/query + errorMessage + ISO-8601 attemptedAt) | `degradationEvidence="unverified"` | The subagent attempted to fetch and the environment refused. Honest degradation. | Accept after one re-dispatch; deprioritize in scoring; surface in recommendation. |
| `performed=false` with non-conforming `attemptedCalls[]` (bare narrative, no schema fields), OR `performed=true` with `fetchCount=0` | `evidence-fabrication-risk` | The subagent had WebFetch/WebSearch and chose not to use them. Behavioral, not environmental. | Reject and re-dispatch ONCE with a directive that names a specific URL from the research plan. On the second zero-fetch return, set the path's `fabricationRisk=true`. |

`fabricationRisk=true` propagates to the run-level `fabricationRisk` flag,
which causes the proposal-template to render its `fabrication-risk-banner`
section at the very top of the document (above metadata) and excludes the
affected path from any `convergent: true` claim. The two tags MUST NOT be
conflated — `evidence-fabrication-risk` indicates the subagent had tools
and chose not to use them; `degradationEvidence="unverified"` indicates
genuine environmental degradation the subagent attempted to verify.

In addition, the citation-liveness spot-check phase samples one citation
URL per path via WebFetch and checks reachability + publish-date sanity. A
blatant cited-vs-actual date mismatch on the sampled URL is a fabrication
signal that re-dispatches the path; on the second mismatch, the path is
tagged `fabricationRisk=true`.

---

## See also

- [citation-guide.md](citation-guide.md) — the schema Phase 1 validates
  against.
- [report-format.md](report-format.md) — the structured output Phase 1
  is reading.
- [proposal-format-guide.md](proposal-format-guide.md) — how Phase 4
  output lands in the persistent proposal document.
