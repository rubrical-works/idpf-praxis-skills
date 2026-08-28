# Case Studies

Real, end-to-end runs of IDPF Praxis skills against non-trivial questions.

## What case studies are

Each file under this directory is a verbatim record of a real skill execution:

- A genuine question — one a real user might ask the skill.
- A short framing preamble — who would ask, why the answer matters, what to look for in the output.
- The full, unedited artifact the skill produced.
- Real citations gathered by live `WebFetch` / `WebSearch` calls during the run.

Case studies are organized one subdirectory per skill:

```
Docs/case-studies/
  README.md                        ← you are here
  engage-crucible/
    <slug>.md
  engage-apothecary/
    <slug>.md
  engage-forge/
    <slug>.md
```

## Case studies vs. `Skills/<name>/examples/`

The `examples/` directory inside each skill ships **synthetic** artifacts that demonstrate the *output shape* — the structure, sections, and citation schema a conformant run produces. URLs in those examples are `example.com` placeholders and are explicitly **not** fetched. They show what the skill writes, not what its evidence looks like in practice.

Case studies are the opposite contract: every URL is real, every citation came from a live fetch, and the artifact was not edited after the skill produced it. They show **evidence quality**, not just shape.

| Aspect | `Skills/<name>/examples/` | `Docs/case-studies/<skill>/` |
|--------|---------------------------|------------------------------|
| Purpose | Demonstrate output shape | Demonstrate evidence quality |
| URLs | `example.com` placeholders | Real, fetched URLs |
| Hand-edited? | Authored to fit the schema | Verbatim skill output |
| Stable over time? | Yes (shape contract) | No (citations decay) |
| Number per skill | Several (cover paradigm/domain variations) | One or more (one full real run) |

Both are useful: examples are the contract; case studies are the proof.

## A note on citation decay

Real citations point to live web resources — analyst reports, vendor pages, regulatory filings, news articles, academic papers. Those resources may be revised, paywalled, moved, or removed after a case study is captured. Treat the URLs in a case study as **timestamped evidence of what was available at the time of the run**, not as a permanent reference.

Each case study records a `fetchedAt` timestamp in its citation schema (where the skill's contract requires it) so future readers can assess whether the evidence base is still current.

## How to read a case study

1. Start with the **framing preamble** to understand the question and why it matters.
2. Read the **original prompt** as the skill received it — reproduced verbatim as a Markdown blockquote near the top of the document under a heading from the equivalence set: `## Problem`, `## Question`, `## Research question`, `## Situation`, `## Claim`, or `## Educational scenario` (heading word reflects the skill's natural artefact shape).
3. Walk the **skill output** in the order the skill produced it (research plan → paths/hypotheses/differentials → synthesis → recommendation).
4. Check the **citations** — note `sourceClass`, `fetchedAt`, and whether the URL still resolves.
5. Form your own view on whether the artifact is a useful artifact of skill quality.

## In-scope skills

This directory covers the `engage-*` skill family. Initial case studies:

| Skill | Case study |
|-------|------------|
| [engage-crucible](../../Skills/engage-crucible/) | [Why have LLM inference costs plateaued?](engage-crucible/llm-inference-cost-plateau-2025-2026.md) |
| [engage-apothecary](../../Skills/engage-apothecary/) | [Post-flight unilateral leg swelling — differential reasoning](engage-apothecary/dvt-differential-young-adult-post-flight.md) |
| [engage-forge](../../Skills/engage-forge/) | [First-session onboarding for a self-hosted observability tool](engage-forge/devtool-observability-first-session-onboarding.md) |
| [engage-chorus](../../Skills/engage-chorus/) | [Engineering-budget reallocation — four-VP mediation](engage-chorus/engineering-budget-reallocation-four-vp-mediation.md) |

Other skills may be added in follow-up issues if the pattern proves useful.
