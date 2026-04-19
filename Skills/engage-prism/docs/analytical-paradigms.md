# Analytical Paradigms

Prose companion to [`resources/paradigms.json`](../resources/paradigms.json).
A **paradigm** is the high-level lens the analyst brings to the question —
the answer to "what *kind* of problem is this". Ten paradigms are catalogued;
every `engage-prism` run picks one (or more, across paths) before choosing
structures and strategies.

All ten are listed below. The `id` in each heading is what you pass to
`node scripts/load-entries.js paradigm <id>`.

---

## market-sizing — Market Sizing

Market Sizing estimates the **total economic opportunity** for a product,
category, or segment by decomposing population, penetration, and price into
multiplicative drivers. Reach for it when the question is literally *how big
is this market*, when an investment thesis needs an absolute revenue anchor,
or when you are comparing opportunity across geographies. Variants include
top-down (filter from published totals), bottom-up (build up from units ×
price × customers), and TAM/SAM/SOM decomposition. The common failure mode is
treating one analyst report as the entire basis of the estimate — always
reach for [top-down-vs-bottom-up](analytical-strategies.md) or
[triangulation](analytical-strategies.md) to stress the number.

## competitive-analysis — Competitive Analysis

Competitive Analysis characterizes the **structure of rivalry, substitution,
and bargaining power** in a market — the explanation for *why profits accrue
where they do*. Use it when the question is about market attractiveness,
persistent margin compression, or positioning against identifiable rivals.
Porter-style five forces, head-to-head teardowns, and strategic group mapping
are the canonical variants. The trap is defining the competitor set too
narrowly and missing the substitutes buyers actually consider — include them
before scoring the forces.

## valuation — Valuation

Valuation translates a stream of expected cash flows, adjusted for risk and
time, into a **present value or defensible price**. Use it when a buy / sell
/ hold recommendation is required, when an investment thesis must produce a
target price, or when a capital decision hinges on NPV/IRR. The three main
variants are DCF, relative (comparables), and precedent transactions. Beware
terminal value dominating a DCF, peer sets chosen to support a conclusion,
and discount rates asserted rather than derived — all show up in synthesis's
source-authority and analytical-rigor dimensions.

## forecasting — Forecasting

Forecasting projects a **time-indexed metric forward** using historical
structure, drivers, and uncertainty bounds. Use it when planning or capacity
decisions need a forward estimate, when scenarios need a base-case
trajectory, or when you need to separate signal from seasonality. Variants
include driver-based forecasts (project each causal driver), time-series
methods (ARIMA, Holt-Winters, Prophet), and analog / reference-class
forecasting. Never ship a forecast as a single point with no interval — the
scenario-grid or sensitivity-tornado structures are the usual companions.

## causal-inference — Causal Inference

Causal Inference distinguishes the effect of an intervention from the
correlations around it, so a claim of *X caused Y* survives scrutiny. Reach
for it when a campaign, policy, or feature change needs a measured effect,
when observed correlations could be driven by seasonality or selection, or
when a go/no-go decision hinges on whether a lift is real. Randomized
controlled trials (A/B tests), difference-in-differences, and
regression-discontinuity / instrumental variables are the main variants.
Pair it with [counterfactual-framing](analytical-strategies.md) — the
reframe is what makes the paradigm honest.

## portfolio-optimization — Portfolio Optimization

Portfolio Optimization allocates a **constrained resource** across competing
opportunities to maximize a risk-adjusted objective. Use it when a fixed
budget, headcount, or capital pool must be split among projects, and the
right *mix* — not the single best bet — is the decision. Variants span
classical Markowitz mean-variance, capital-allocation / project-portfolio
ranking, and marketing mix modeling. The classic failure mode is
precision-mismatch: optimizer inputs are wobbly while the optimizer treats
them as exact, producing corner solutions the business would never execute.

## scenario-analysis — Scenario Analysis

Scenario Analysis structures uncertainty as a **small number of internally
consistent futures** against which strategy can be stress-tested. Reach for
it when key drivers are deeply uncertain and interact, when stakeholders
need more than a point estimate, or when commitments must be robust across a
range of plausible worlds. Base/bull/bear, 2×2 scenario matrices, and Monte
Carlo simulation are the main variants. A plan ± 10% with no narrative
divergence is not a scenario analysis — scenarios must differ in their
storylines, not just their magnitudes.

## segmentation-analysis — Segmentation Analysis

Segmentation Analysis partitions a customer, product, or market population
into groups whose **behavior, needs, or economics differ enough to warrant
different actions**. Use it when averages across a population are misleading,
when marketing or pricing decisions should vary by group, or when
profitability is heterogeneous. Demographic / firmographic, behavioral / RFM,
and jobs-to-be-done variants each cut the population differently. A segment
that does not lead to a distinct decision is not a useful segment — the
actionability test is the filter.

## funnel-analysis — Funnel Analysis

Funnel Analysis models a **sequential conversion process** as stages with
drop-off rates, so the bottleneck and the leverage point become visible.
Reach for it when an outcome depends on a multi-step journey — marketing
acquisition funnels (AARRR), sales pipelines (MQL → SQL → Opportunity →
Closed-Won), or product activation funnels (signup → first-value → habit).
The discipline is to define stages by real decision moments, not by what is
easy to instrument, and to check upstream quality before blaming the last
stage for the overall drop-off.

## macro-trend-reading — Macro / Trend Reading

Macro / Trend Reading interprets long-horizon shifts in technology,
regulation, demographics, and behavior to anticipate durable changes in
demand or competition. Use it when the decision horizon is longer than
normal planning cycles, when structural — not cyclical — change is
suspected, or when strategy must withstand regime shifts. PESTEL scans,
S-curve / diffusion analysis, and leading-indicator synthesis are the main
variants. The failure mode is building a trend narrative from press
coverage alone; measurable indicators (patents, hiring, search interest,
regulatory filings) are what separate a durable call from a fashionable
one.

---

## Picking the right paradigm

The `crossParadigmGuide` in [`paradigms.json`](../resources/paradigms.json)
gives quick routing:

- *How big is this opportunity* → **market-sizing**
- *Should we enter this market* → **competitive-analysis**
- *What's it worth* → **valuation**
- *Forward trajectory* → **forecasting**
- *Causal lift claim* → **causal-inference**
- *Split a budget* → **portfolio-optimization**
- *Deep exogenous uncertainty* → **scenario-analysis**
- *Averages hide heterogeneity* → **segmentation-analysis**
- *Multi-step conversion problem* → **funnel-analysis**
- *5+ year horizon with structural change* → **macro-trend-reading**

Signal matching (`scripts/match-signals.js`) does this routing
mechanically — but knowing the map helps you spot when the match is weak
and adaptive-mode (tension-driven paths) is warranted.

---

## See also

- [analytical-structures.md](analytical-structures.md) — the structures that
  make each paradigm concrete.
- [analytical-strategies.md](analytical-strategies.md) — the reframings that
  discipline how numbers get produced and defended.
- [research-plan-guide.md](research-plan-guide.md) — how to scope Step 0
  research for each paradigm.
