# Analytical Strategies

Prose companion to [`resources/strategies.json`](../resources/strategies.json).
A **strategy** is a reframing — a way of looking at a problem that changes
what evidence counts and what the answer must do. Strategies do not produce
a number on their own; they discipline *how* the number gets produced and
defended. Each `engage-prism` path picks one as the discipline it imposes
on top of its paradigm and structure.

All ten strategies are covered below. The `id` in each heading is what you
pass to `node scripts/load-entries.js strategy <id>`.

---

## top-down-vs-bottom-up — Top-Down vs. Bottom-Up

Compute the same quantity twice — once by filtering from an industry total,
once by building up from units × price × customers — and treat the gap
between the two as evidence. Use it for market sizing, capacity estimation,
and any quantity where a single-source estimate is distrusted. A large
divergence is a signal that a hidden assumption exists in one of the two
builds; the investigation, not the averaging, is where the value lives. The
failure mode is building the "independent" bottom-up estimate from the same
data that fed the top-down — that is not triangulation, it is
self-confirmation.

## triangulation — Triangulation

Estimate the same quantity using three or more methodologically *distinct*
approaches and treat agreement or disagreement as evidence about
reliability. Valuation lends itself naturally (DCF, trading comps,
precedent transactions), as does campaign measurement (holdout test,
media-mix model, pre/post geo-lift). The methods must not share an
underlying bias — three approaches that all start from the same forecast
are one approach in disguise. When methods disagree, the disagreement is
the finding; do not average it away.

## sensitivity-analysis — Sensitivity Analysis

Instead of defending a point estimate, identify which inputs actually drive
the output and by how much, then concentrate research and debate on those.
Use it on any quantitative model with many uncertain inputs, especially
when stakeholders are challenging the model's credibility or when research
budget must be prioritized. Flex ranges should reflect real uncertainty,
not arbitrary symmetric bands, and the tornado is a diagnostic of the
model — not a forecast of where the output will actually go.

## benchmark-comparison — Benchmark Comparison

Interpret a number by comparing it to analogous entities or prior periods,
not in isolation — the question becomes *relative to what* rather than *is
this good*. Use it when stakeholders ask whether a number is good with no
natural yardstick, when the metric is industry-specific, or when the
decision depends on relative standing. The discipline is in the benchmark
set: pick peers that are truly comparable on business model, geography,
and scale. A benchmark is a reference point, not a target.

## stakeholder-weighting — Stakeholder Weighting

Make explicit whose preferences and costs count, and by how much, before
scoring options — so the analysis is transparent about *whom* it optimizes
for. Use it when multiple stakeholder groups have conflicting interests
(customers vs. shareholders, short-term vs. long-term), when a decision
matrix appears objective but hides political trade-offs, or when
post-decision pushback is anticipated. Weights must be set by governance,
not by whoever runs the meeting, and they must not change mid-analysis to
preserve a preferred conclusion.

## ev-vs-risk-framing — Expected Value vs. Risk-Adjusted Framing

Separate the **expected** outcome of a decision from its **distribution**.
Two options with the same expected value can differ sharply in downside,
volatility, or bankruptcy risk. Reach for it when outcomes are uncertain
and asymmetric, when downside is survival-threatening even if expected
value is positive, or when a decision hides a lottery under a single-number
summary. Capital-allocation between projects with identical NPV but
different worst-case drawdowns is the canonical case.

## leading-vs-lagging-indicators — Leading vs. Lagging Indicators

Separate metrics that describe outcomes already realized (lagging) from
metrics that predict future outcomes (leading), and manage against the
leading ones while reporting both. Use it when performance discussions
keep surfacing results metrics that cannot be changed by next quarter,
when teams are surprised by downturns, or when operational actions do not
clearly map to reported outcomes. Pipeline velocity for revenue, NPS and
product-usage depth for renewal, are the archetypal leading-indicator
pairs. Do not assume correlation implies causation — a leading indicator
that is not causal will mislead when conditions change.

## in-sample-vs-out-of-sample — In-Sample vs. Out-of-Sample Validation

A model or strategy that fits historical data is not yet validated — its
credibility depends on performance on data it was not built on. Use it
whenever a backtest looks surprisingly strong, whenever a model has many
parameters relative to observations, and whenever a decision will be
applied prospectively. Split samples explicitly, honor the holdout, and
distrust any process that "validates" on the same holdout until it
effectively becomes in-sample. Walk-forward validation is the disciplined
default for time-series models.

## counterfactual-framing — Counterfactual Framing

Ask *what would have happened without this action* rather than *what
happened after this action* — the incremental effect is the difference.
Use it whenever a campaign, feature, or policy is being credited with a
post-launch change, whenever trends or concurrent changes could explain
the result, and whenever an ROI or lift claim must survive scrutiny.
Geo holdouts and matched-market controls are the field-grade versions.
The trap is assuming "no intervention" equals the pre-period — the
counterfactual trend is almost never flat.

## primary-vs-secondary-sources — Primary vs. Secondary Sources

Distinguish evidence collected or computed directly (filings,
transactions, surveys you ran) from evidence reported by others; weight
and document them differently. Equity research grounded in 10-K filings
and management transcripts is primary; a sell-side summary quoting the
same filing is secondary. A widely-cited secondary figure does not become
primary through repetition. Prism's citation schema encourages this
discipline via the optional `sourceClass` enum — see
[citation-guide.md](citation-guide.md).

---

## Combining strategies

The `crossStrategyInteractionGuide` in
[`strategies.json`](../resources/strategies.json) highlights several
productive combinations:

- **top-down-vs-bottom-up + triangulation** → multi-method market estimate
  where both *directions* and an adjacent-analog lens must agree.
- **sensitivity-analysis + ev-vs-risk-framing** → a risk-aware
  recommendation that names which inputs matter and how the downside
  distribution behaves.
- **counterfactual-framing + in-sample-vs-out-of-sample** → a defensible
  incrementality claim validated on data not used to build the attribution.
- **benchmark-comparison + stakeholder-weighting** → positioning calibrated
  against peers and transparent about whose objectives drive the action.
- **leading-vs-lagging-indicators + counterfactual-framing** → an operating
  cadence that distinguishes self-caused changes from market drift.
- **triangulation + primary-vs-secondary-sources** → claims that survive
  scrutiny because independent methods each rest on documented primary
  evidence.

The anti-overlap rule forbids two paths from sharing the same full
(paradigm, structure, strategy) tuple — one strategy per path is usually
enough discipline anyway.

---

## See also

- [analytical-paradigms.md](analytical-paradigms.md)
- [analytical-structures.md](analytical-structures.md)
- [citation-guide.md](citation-guide.md) — how
  primary-vs-secondary-sources shows up in the citation schema.
- [synthesis-guide.md](synthesis-guide.md) — how triangulation and
  sensitivity surface in the scoring matrix.
