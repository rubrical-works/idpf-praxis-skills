# Subagent Brief Guide

Every `engage-prism` subagent receives a **brief** — a slot-filled
instruction built from
[`resources/brief-template.json`](../resources/brief-template.json).
The primary agent fills the slots before spawning; the subagent refuses
to proceed if any required slot is missing or malformed.

---

## The required slots

| Slot | Type | Purpose |
|---|---|---|
| `questionStatement` | string | The user's full question, verbatim, with any explicit constraints (time horizon, geography, decision owner). |
| `assignedAngle.name` | string | Angle name — e.g., `"Bottom-up TAM via channel-level unit economics"`. Encodes paradigm + structure + strategy (or tension resolution in adaptive mode). |
| `assignedAngle.description` | string | 1–2 sentences on what the angle actually does. |
| `researchPlan` | object | `entityAnchors`, `sourceClasses`, `recencyWindow`, `authorityPreference`, `fetchBudget`. See [research-plan-guide.md](research-plan-guide.md). |
| `citationRequirement` | string | Reference to `resources/citation-schema.json`. Every non-derived claim must cite. |
| `maxSteps` | integer | Default 50. Caps subagent reasoning depth. |
| `maxOutputLines` | integer | Default 250. Caps report size. |

Optional:

- `exclusions` — a hint if the primary agent worries the subagent will
  drift toward another path's angle. Example: `"Do not use
  comparable-company multiples in this path — that angle is owned by
  Path 2."`

---

## Why every slot matters

**`questionStatement`** — All subagents must reason against the same
question. Paraphrasing it in one brief and not another lets the paths
drift apart on scope rather than on angle, which is exactly what
anti-overlap guards against.

**`assignedAngle`** — Vary the *wording* across subagents so no two are
nudged toward the same framing. "TAM via unit economics" and "TAM via
top-down industry totals" are the right shape; "market sizing approach"
and "financial analysis" are too vague.

**`researchPlan`** — Inherited unchanged from Step 0. Every subagent
gets the same anchors, source classes, and recency window. Consistency
here is what makes cross-path citation comparison possible in synthesis.

**`citationRequirement`** — The reference to the citation schema is a
reminder; the actual contract is in
[citation-guide.md](citation-guide.md). Subagents that produce
schema-nonconformant citations are flagged in synthesis and
deprioritized.

**`maxSteps` / `maxOutputLines`** — Hard caps. A subagent that hits
either should truncate and return a partial report flagged as
incomplete rather than silently continuing.

---

## The task instructions

The brief also carries a `taskInstructions.sections[]` array telling the
subagent what to produce, in order:

1. **Angle summary** — state the angle and why it fits (1–3 sentences).
2. **Web research** — perform WebFetch / WebSearch within `fetchBudget`,
   record every source via the citation schema.
3. **Evidence-grounded analysis** — every non-derived claim must cite.
4. **Key drivers and numbers** — name them, anchor them, label each as
   observed or estimated.
5. **Counter-evidence and risks** — what would make this angle wrong,
   with contrary citations if any.
6. **Recommendation within this angle** — the best-supported answer from
   *this angle alone*, honest about its limits.

The `outputConstraint` is strict: the subagent returns *only* the
structured report conforming to
[`report-template.json`](../resources/report-template.json). No preamble,
no trailing commentary.

---

## Degradation handling

If WebFetch / WebSearch is unavailable (sandbox, `--no-web`), the brief
must still be filled — but the subagent is instructed to set
`webResearch.performed = false` with a specific `reason` in its report,
rather than silently producing training-recall output. Degraded reports
are surfaced explicitly in the final recommendation.

---

## Primary-agent notes

The template's `primaryAgentNotes` array reminds the primary agent:

- Vary angle wording across subagents; avoid accidental overlap.
- Pass the full research plan unchanged to every subagent.
- When web is unavailable, brief explicitly for degradation rather than
  hoping the subagent invents research on its own.
- Use `exclusions` sparingly — over-constraining a subagent makes its
  report less useful for hybridization.

---

## See also

- [research-plan-guide.md](research-plan-guide.md) — how the
  `researchPlan` slot is built.
- [report-format.md](report-format.md) — what the subagent returns.
- [citation-guide.md](citation-guide.md) — the citation schema the brief
  references.
