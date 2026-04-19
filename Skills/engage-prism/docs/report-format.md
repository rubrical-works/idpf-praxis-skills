# Subagent Output Format

Every `engage-prism` subagent returns a structured JSON object matching
[`resources/report-template.json`](../resources/report-template.json).
This guide walks each field and the cross-references between them.

The term "report" below refers to this structured JSON payload returned
in-memory to the primary agent — not a markdown summary written to disk.

---

## Field-by-field

### `angleName` — string, required

The name of the analytical angle being explored. Matches the
`assignedAngle.name` in the brief. Used throughout synthesis for
identification.

### `coreClaim` — string, required

The headline answer this angle produces, in 1–3 sentences. Must be
supported by at least one cited source in `citations[]`, or explicitly
flagged as derived / speculative. If the core claim is not citable, the
output scores Weak on *evidence strength* in synthesis.

### `webResearch` — object, required

Three subfields:

- `performed` (boolean, required) — was WebFetch / WebSearch actually
  used on this run?
- `reason` (string, optional) — when `performed=false`, why (sandbox,
  `--no-web`, tool unavailable).
- `fetchCount` (integer, required) — number of WebFetch / WebSearch
  calls made. Must be `0` when `performed=false`.

A payload with `performed=true` but `citations[]` empty is malformed
and flagged in synthesis.

### `citations` — array, required

Every entry must conform to
[`citation-schema.json`](../resources/citation-schema.json) — see
[citation-guide.md](citation-guide.md). The array may be empty *only*
when `webResearch.performed=false`.

Citations are referenced by **zero-based index** from other fields.

### `evidenceBase` — object, required

Summary of the evidence underlying the angle:

- `sourceMix` (string) — e.g., `"3 analyst summaries, 1 regulator
  filing, 2 company pages"`.
- `recencyProfile` (string) — e.g., `"all within last 90 days"`.
- `knownGaps` (array, ≥1 entry) — at least one gap is required. What
  evidence you wanted but could not obtain. Empty gaps are a red flag —
  real research always has limits.

### `analysis` — array, required, ≥3 entries

Ordered analytical steps. Each entry names:

- `step` — the step number.
- `claim` — the claim being made.
- `supportingCitationIndexes` — array of indexes into `citations[]`.
- `derivedFrom` — array of prior step numbers the claim derives from
  (empty for directly-cited claims).

Example:

```
{
  "step": 3,
  "claim": "Public charging TAM for Germany reached ~€1.8B in 2025.",
  "supportingCitationIndexes": [],
  "derivedFrom": [1, 2]
}
```

This step is derived — it follows arithmetically from step 1 (cited
count of charging points) and step 2 (cited average revenue per point).

### `keyNumbers` — array, required, ≥1 entry

Quantitative anchors. Each entry:

- `name` — e.g., `"TAM"`, `"CAC"`, `"revenue growth YoY"`.
- `value` — the number (with units).
- `basis` — brief prose: `"from analyst summary X"`, `"estimated from
  peer average ± 15%"`.
- `supportingCitationIndex` — which citation anchors it (or `null` for
  fully-estimated numbers, with the basis text carrying the logic).

Numbers without a basis are treated as false precision in synthesis.

### `counterEvidence` — array, required, ≥2 entries

Things that would falsify or weaken the core claim. Each entry:

- `risk` — the risk or counter-claim.
- `supportingCitationIndex` — citation where available.

At least two entries are required. Outputs that gesture at counter-
evidence without citing it score lower on *counter-evidence handling*.

### `recommendationInAngle` — string, required

1–3 sentences. The best-supported answer from this angle alone, honest
about its limits. This is *not* the final recommendation — that comes
from synthesis across paths — but it is how the angle votes.

### `fitScore` — object, required

Subagent self-assessment:

- `score` — one of `"Strong"`, `"Adequate"`, `"Weak"`,
  `"Disqualifying"`.
- `reason` — one sentence on how well the angle fits the specific
  question.

Fit score is a **signal**, not ground truth. A subagent briefed to
explore one angle will naturally find reasons it works. Synthesis treats
self-assessment as one input among many.

---

## Citation references in practice

Citations are referenced by index, not by URL. The `analysis[]`,
`keyNumbers[]`, and `counterEvidence[]` arrays all use
`supportingCitationIndex(es)` fields pointing into the `citations[]`
array.

Example inside a returned payload:

```
{
  "citations": [
    { "title": "BNetzA Monatsbericht März 2026", "url": "https://...", ... },
    { "title": "BloombergNEF EV Outlook 2026", "url": "https://...", ... }
  ],
  "analysis": [
    { "step": 1, "claim": "142k public charging points in Germany",
      "supportingCitationIndexes": [0], "derivedFrom": [] },
    { "step": 2, "claim": "Avg revenue per point €12.7k/yr",
      "supportingCitationIndexes": [1], "derivedFrom": [] }
  ]
}
```

---

## What synthesis does with the payload

See [synthesis-guide.md](synthesis-guide.md) for the full phases. In
short: the structured output is validated (citations conform, claims
are actually supported by their excerpts, recency is within the
research plan's window), scored on evidence / rigor / usefulness /
counter-evidence / authority, and considered for hybridization with
other paths.

---

## See also

- [citation-guide.md](citation-guide.md)
- [subagent-brief-guide.md](subagent-brief-guide.md)
- [synthesis-guide.md](synthesis-guide.md)
