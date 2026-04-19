# Citation Guide

Every non-derived claim in an `engage-prism` subagent report must cite a
source conforming to
[`resources/citation-schema.json`](../resources/citation-schema.json).
Citations are the load-bearing part of the output: synthesis validates
each claim against its cited excerpt before scoring.

---

## The schema

A citation is a JSON object with four **required** fields and several
optional ones:

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Human-readable source title (article headline, report name) |
| `url` | yes | Absolute `http(s)://` URL |
| `fetchedAt` | yes | ISO-8601 timestamp **with timezone** (e.g. `2026-04-19T10:15:00Z`) |
| `excerpt` | yes | Short quoted or paraphrased extract supporting the claim (≤2000 chars) |
| `author` | no | Byline or publishing entity |
| `publishedAt` | no | Publication date reported by the source (distinct from fetch time) |
| `sourceClass` | no | One of: `news`, `analyst-report`, `regulatory-filing`, `earnings-transcript`, `company-page`, `trade-press`, `official-statistics`, `industry-body`, `academic`, `review-site`, `opinion`, `other` |
| `urlUnreachable` | no | `true` when the URL was valid at fetch time but is no longer reachable |

The schema is strict: `additionalProperties: false`, `fetchedAt` must
include timezone, `url` must be `http(s)`.

---

## Cited vs. derived claims

- **Cited claim** — the claim rests on external evidence. It must point at
  a citation entry in the report's `citations[]` array, by index, via the
  `supportingCitationIndexes` field in its analysis step.
- **Derived claim** — the claim follows from arithmetic or logic applied
  to earlier cited claims in the *same* report. It must name the upstream
  step(s) via the `derivedFrom` field. The derivation itself is not a
  citation; the evidence it rests on must already be cited.

Example: "TAM is €4.2B" is **derived** if it equals (cited) population ×
(cited) penetration × (cited) average price. It is **cited** if an
analyst report states the €4.2B figure directly. Both are legitimate —
but the report must mark which is which.

A claim that is neither cited nor derived is **speculation**. The
synthesis phase treats speculation as non-evidence and excludes it from
scoring on evidence-weighted dimensions.

---

## A good citation

```json
{
  "title": "BNetzA Ladesäulenregister — Monatsbericht März 2026",
  "url": "https://www.bundesnetzagentur.de/DE/Fachthemen/.../Ladesaeulenregister.html",
  "fetchedAt": "2026-04-19T10:15:00Z",
  "excerpt": "Zum Stichtag 01.03.2026 waren 142,318 öffentlich zugängliche Ladepunkte registriert, davon 38,901 Schnellladepunkte (HPC ≥ 50 kW).",
  "author": "Bundesnetzagentur",
  "publishedAt": "2026-03-15",
  "sourceClass": "official-statistics"
}
```

Why it works: real primary source (the German federal regulator), the
excerpt names the specific number the claim rests on, `fetchedAt`
carries a timezone, `sourceClass` enables authority weighting in
synthesis, and `publishedAt` lets the recency check use the actual
publication date rather than the fetch date.

---

## A bad citation

```json
{
  "title": "Germany EV market is booming",
  "url": "https://blog.example.com/germany-ev-boom",
  "fetchedAt": "2026-04-19",
  "excerpt": "Germany's EV market is growing fast."
}
```

Why it fails: `fetchedAt` has no timezone (schema violation). The
excerpt paraphrases the headline rather than supporting the specific
claim. No `sourceClass` — synthesis cannot weight authority. The blog
URL is opinion-grade but unmarked. If the claim is "Germany's public
charging market grew 23% in 2025", this citation does not support it —
the excerpt does not mention 23%, public charging, or 2025.

---

## Counter-evidence

The report's `counterEvidence` array requires at least two entries, and
each entry **should** cite a source. Counter-evidence citations use the
same schema — they are not second-class. A report that refuses to cite
contrary sources scores poorly on the *counter-evidence handling*
dimension in synthesis.

When you cite a contrary source, do not soften the excerpt. Quote or
paraphrase what the source actually says, even when it weakens the
report's core claim. Synthesis rewards honest disagreement and penalizes
cherry-picked dissent.

---

## Unreachable URLs

Sometimes a page you successfully fetched at time T is no longer
available at time T+1 (news articles behind paywalls, regulator pages
reorganized, company blog posts removed). The correct handling:

1. **Keep the citation** — do not delete it.
2. **Set `urlUnreachable: true`** — documents the state.
3. **Do not invent an alternative URL** — fabricating a working URL is a
   hallucination class the skill treats seriously.

Synthesis treats unreachable citations as slightly degraded evidence but
not disqualifying — the original fetch happened, and the excerpt still
records what the source said at that time.

---

## Citations when `--no-web` is set

When WebFetch / WebSearch are unavailable, each report must set
`webResearch.performed = false` with a non-empty `reason`, and
`citations[]` may be empty. The report is then treated as **degraded
evidence** throughout synthesis. Do not synthesize training-recall claims
into fake citations — that is the failure mode the schema exists to
prevent.

---

## See also

- [research-plan-guide.md](research-plan-guide.md) — the `sourceClasses`
  and `recencyWindow` fields in the research plan correspond directly to
  citation `sourceClass` and `publishedAt` discipline.
- [report-format.md](report-format.md) — how citations are referenced by
  index from the `analysis[]` and `keyNumbers[]` arrays.
- [synthesis-guide.md](synthesis-guide.md) — the citation-validation
  phase that consumes these citations.
