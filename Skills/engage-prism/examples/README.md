# engage-prism — Example Proposals

This directory contains six example proposal documents produced by the
`engage-prism` skill. Each demonstrates an end-to-end parallel analysis run
across the skill's analytical domains:

| File | Domain |
|------|--------|
| `PRISM-competitor-teardown-acme-vs-rivals.md` | Competitive analysis |
| `PRISM-tam-ev-charging-germany.md` | Market sizing (TAM/SAM/SOM) |
| `PRISM-paid-search-campaign-roi.md` | Marketing campaign evaluation |
| `PRISM-equity-ticker-abcd-earnings.md` | Equity / ticker / financial |
| `PRISM-remote-work-retail-trend.md` | Business / market trend |
| `PRISM-oss-monetization-sample.md` | OSS / dev-tool go-to-market (monetization mix, revenue projection, growth funnel) |

## What these examples show

Each file is the full markdown artifact a real `engage-prism` run would write
to `Proposal/PRISM-{slug}.md`. The structure follows
`resources/proposal-template.json` exactly:

1. Metadata header
2. `## Question`
3. `## Research Plan` — entity anchors, source classes, recency window,
   authority preference, fetch budget
4. `## Signal Analysis` — matched signals with weights, loaded paradigms /
   structures / strategies
5. `## Path N: {name}` sections — each with a filled `### Brief` and a full
   structured `### Report` (including `citations[]`, `webResearch`,
   `evidenceBase`, `analysis` steps indexed to citations, `keyNumbers`,
   `counterEvidence`, `recommendationInAngle`, and `fitScore`)
6. `## Synthesis` — citation validation, scoring matrix, hybridization analysis
7. `## Recommendation`
8. `## What Would Change This Answer`
9. `## Rejected Angles`

## Important: URLs are illustrative

Every URL in these examples is a **fictional `example.com` placeholder**. They
were not fetched and are not intended to resolve. Real runs must produce real
URLs from live `WebFetch` / `WebSearch` calls. The citation *shape* is exactly
what a conformant run produces:

```json
{
  "title": "...",
  "url": "https://example.com/...",
  "fetchedAt": "2026-04-19T10:15:00Z",
  "excerpt": "...",
  "sourceClass": "analyst-report"
}
```

All `fetchedAt` timestamps are ISO-8601 with a timezone designator (`Z`), all
`url` values are `https://`, and every citation carries the four required
fields (`title`, `url`, `fetchedAt`, `excerpt`). A variety of `sourceClass`
values are used across the examples (`analyst-report`, `regulatory-filing`,
`earnings-transcript`, `news`, `official-statistics`, `industry-body`,
`company-page`, `trade-press`) to exercise the enum.

## How to read an example

1. **Start with `## Question` and `## Research Plan`** to understand the
   decision at stake and the evidence scope.
2. **Skim `## Signal Analysis`** to see which reference entries the signal
   matcher loaded — these drive path selection.
3. **Read each `## Path N: ...`** as a self-contained analytical take. The
   `### Report` subsection is what a subagent returned; the `### Brief` is what
   it was asked.
4. **Read `## Synthesis`** — citation validation is where claims get checked
   against the excerpts they rest on. The scoring matrix is the quantitative
   basis for the final pick.
5. **Read `## Recommendation`** and `## What Would Change This Answer` last —
   they are the decision-useful output.

## Not a substitute for licensed advice

These examples include equity, macro, and pricing analyses to exercise the
skill surface. None of them constitute financial, legal, or regulatory advice.
Real decisions require a qualified professional.
