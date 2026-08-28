# Case Study: Why have LLM inference costs plateaued?

**Skill:** [engage-crucible](../../../Skills/engage-crucible/)
**Run date:** 2026-05-17
**Domain:** engineering / methods (with overlap into economics-of-computing)
**Hypothesis paths:** 3
**Prior:** uniform
**Crucible experiment selected:** A3 — tier-stratified price-decline rate + parallel-pricing clustering

---

## Framing preamble

This case study captures a real run of `engage-crucible` against a contested mechanism question that has been actively debated through 2025–2026 in the inference-infrastructure community: **why have public per-token prices for frontier LLMs flattened at roughly $0.50–$1.00 per million output tokens despite continued architecture and quantization efficiency gains?**

The question fits `engage-crucible` because it has at least three credible competing causal mechanisms — physical (memory bandwidth), operational (latency-capped batching), and economic (oligopoly pricing power) — and each admits a discriminating experiment cheap enough to describe. It exercises the skill's full pipeline: parallel hypothesis subagents with live web research, paired falsification-attack subagents, and a Bayesian prior-update synthesis that identifies the highest-information-gain-per-cost experiment.

**What to look for:**

- Each hypothesis brief carries a **specific, measurable** `falsificationCondition`. The skill's contract rejects unfalsifiable conjecture.
- Every citation is a **real URL** gathered by live `WebFetch` / `WebSearch` — no synthetic placeholder URLs (the lint check at [`.claude/scripts/framework/check-docs-placeholders.js`](../../../.claude/scripts/framework/check-docs-placeholders.js) enforces this against the configured pattern list).
- The synthesis does **not** name a winner. It produces a posterior-update landscape and a research roadmap.
- The crucible experiment selected is the **cheapest** discriminator, not the most rigorous — that's the Bayesian intuition the skill is built around.

**Citation decay caveat:** the URLs below were fetched on 2026-05-17. Pricing pages, analyst posts, and vendor benchmarks evolve. Treat each citation as evidence of what was published at the timestamp recorded in `fetchedAt`, not as a permanent reference. The arxiv links are stable; the others may rot.

---

## Research question

> Why have measured LLM inference costs at production scale (>10M output tokens/day) plateaued at roughly $0.50–$1.00 per million output tokens through 2025–2026, despite continued model-architecture and quantization efficiency gains?

## Hypotheses

### H1 — `memory-bandwidth-ceiling`

**Prior:** 1/3 (uniform)

**Claim.** Per-token inference cost at production scale is floored by HBM memory bandwidth, not arithmetic throughput: each generated token requires reading the full set of active model weights plus the growing KV cache from HBM, and bandwidth has scaled ~1.5–2x per accelerator generation while FLOPs have scaled 5–10x. Quantization and architectural FLOP reductions cannot push $/token below the bandwidth-set floor.

**Mechanism.** Autoregressive decode is serial in the token dimension: producing token N+1 requires loading every active weight matrix and the KV cache for tokens 1..N from HBM into on-chip SRAM/registers, then performing a small number of ops per loaded byte (arithmetic intensity well below the accelerator's ops:byte ratio). Roofline analysis places decode firmly in the memory-bound regime — e.g., Llama 2 7B at intensity ~62 ops/byte versus A10 ratio ~208 ops/byte, giving time-per-token ≈ model_bytes / HBM_bandwidth. Cost-per-token therefore scales as `(model_bytes / HBM_bandwidth) × (kWh_per_second + amortized_capex_per_second)`. Quantization (FP8/INT4) reduces model_bytes but is bounded below by quality-preserving precision; MoE reduces active weights but increases per-request memory traffic variance; speculative decoding amortizes bandwidth across draft tokens but only when the draft accepts. None can drive bandwidth-per-token below the physical floor set by HBM3e (~3–8 TB/s per accelerator, ~1.5x H100→B200).

**Predictions.**
1. Measured HBM bandwidth utilization during sustained production decode exceeds 60% on optimized stacks (vLLM/TensorRT-LLM) across H100/H200/B200, with the residual attributable to attention-kernel stalls rather than compute idleness.
2. Tokens/sec/$ improves roughly in proportion to HBM bandwidth growth per generation (H100→H200 ~1.4x, H200→B200 ~1.7x) rather than to FLOPs growth, when model precision and batch policy are held constant.
3. SRAM-resident architectures (Groq LPU, Cerebras WSE) achieve 10–25x higher tokens/sec/user at small batches but do not produce a corresponding 10–25x reduction in $/token at scale because aggregate SRAM capacity per dollar of accelerator capex is far lower than HBM capacity per dollar — bandwidth-per-dollar, not raw bandwidth, sets the floor.

**Falsification condition.** On at least 3 of {H100, H200, B200, MI300X} running production-representative decode workloads (≥1000 RPS, batch ≥32, 7B–70B dense models) under vLLM or TensorRT-LLM, sustained HBM read bandwidth utilization is consistently below 50% across a 24-hour window, AND the dominant non-memory stall cause is identified (compute idle >30%, sync >20%, or network >20%). If decode runs at <50% HBM utilization without a competing bandwidth sink (e.g., NVLink), H1 is falsified.

**Prior evidence base.**

| # | Claim | Tier | Source |
|---|-------|------|--------|
| c1 | Decode-phase attention kernels are DRAM-bandwidth-saturated, with >50% of kernel cycles stalled on memory access across all tested models. | observational | [Mind the Memory Gap (arxiv 2503.08311)](https://arxiv.org/html/2503.08311v2) — academic-paper |
| c2 | Per-token decode latency is set by `model_bytes / HBM_bandwidth`; Llama 2 7B on A10 ≈ 23 ms/token (~43 tok/s) as a bandwidth-imposed ceiling. | expert | [Baseten: A guide to LLM inference and performance](https://www.baseten.co/blog/llm-transformer-inference-guide/) — technical-blog |
| c3 | HBM bandwidth grows modestly per generation (H100 3.35 TB/s → H200 4.8 TB/s → B200 ~8 TB/s) while FLOPs grow much faster; SemiAnalysis identifies bandwidth as "arguably the most important specification upgrade." | expert | [SemiAnalysis: Nvidia Blackwell Perf TCO Analysis](https://newsletter.semianalysis.com/p/nvidia-blackwell-perf-tco-analysis) — analyst-report |
| c4 | PagedAttention / vLLM raised KV-cache memory utilization from 20–40% to >96%, producing 2–4x throughput gains — evidence the prior throughput ceiling was a memory (not compute) artifact. | RCT | [PagedAttention paper (arxiv 2309.06180)](https://arxiv.org/abs/2309.06180) — academic-paper |
| c5 | SRAM-resident accelerators (Groq LPU, ~80 TB/s on-chip vs H100 ~3.35 TB/s HBM) achieve 10–25x higher per-user tokens/sec, confirming bandwidth — not FLOPs — is the binding constraint on tokens/sec. | observational | [Groq: Inside the LPU](https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed) — vendor-benchmark |
| c6 | H200 delivers ~1.83–2.14x H100 throughput in long-context inference and ~45% gain on Llama 2 70B — gains that track the ~1.43x HBM bandwidth ratio more closely than the FLOPs ratio. | vendor-benchmark | [NVIDIA TensorRT-LLM H200 launch](https://nvidia.github.io/TensorRT-LLM/blogs/H200launch.html) — vendor-benchmark |
| c7 | Memory bandwidth is named the dominant 2026 inference bottleneck; HBM3e-based systems plateau at ~750 tokens/sec/user on Llama-405B regardless of FLOP headroom. | expert | [Winbuzzer: Memory bottleneck emerges as main LLM inference challenge](https://winbuzzer.com/2026/01/26/memory-bottleneck-llm-inference-hardware-challenge-xcxwbn/) — industry-news |

**Assumptions.**

- Production workloads are dominated by decode (not prefill), so prefill's compute-bound profile does not move the aggregate $/token average.
- Power and amortized accelerator capex per second are roughly constant across H100/H200/B200 generations (within ~2x).
- Quantization below INT4 incurs unacceptable quality loss for production-class models, bounding `model_bytes` from below.
- SRAM-only architectures cannot scale aggregate served bandwidth per dollar to match HBM economics for large models (SRAM $/GB is ~1000x HBM $/GB).

**Experimental-design artefact (generic-experimental-setup).**

- **Subject:** Production LLM serving deployments running 7B–70B parameter dense models and one MoE (e.g., Mixtral 8x22B) at >1000 RPS sustained, on H100, H200, B200, MI300X, and one SRAM-resident accelerator (Groq LPU or Cerebras CS-3), using vLLM 0.6+ or TensorRT-LLM with PagedAttention.
- **Manipulation:** Hold model, precision (FP8), batch policy, and prompt/output length distribution constant. Vary only the accelerator platform. Secondary sweep: vary precision (FP16/FP8/INT4) on a single platform.
- **Measurement:** HBM read bandwidth utilization (% via vendor profilers at 100 Hz), tokens/sec/accelerator, $/M output tokens using public on-demand cloud pricing. Secondary: kernel-level stall attribution via Nsight Compute / rocprof.
- **Confounders:** workload mix (prefill:decode ratio), batch-size policy, KV-cache size + prefix-cache hit rate, precision/quantization scheme, parallelism degree (NVLink competing sink), thermal throttling, cloud-pricing volatility.
- **Sample size:** ≥100 sustained-load runs (each ≥30 min steady-state) per platform × model × precision combination; 6 platforms × 3 models × 3 precisions = 54 cells × 100 runs = 5,400 runs total. Power target: detect 10% bandwidth-utilization differences at α=0.05, β=0.20.
- **DAG sketch:** `HBM_bandwidth → bytes_loaded_per_token → time_per_token → tokens_per_sec_per_accel → $/token`. Mediators: precision → bytes_per_weight; batch_size → bytes_amortization; KV_cache_size → bytes_per_token_overhead. Confounders on $/token: capex_amortization, kWh_price, cloud_margin.

---

### H2 — `latency-capped-batching`

**Prior:** 1/3 (uniform)

**Claim.** Production LLM inference prices have plateaued because continuous-batching schedulers are already operating near the throughput ceiling imposed by tail-latency SLOs (TTFT and inter-token latency); further batch growth would violate user-facing latency contracts, so architectural and quantization gains are redirected into latency reduction or longer context rather than into $/token reductions.

**Mechanism.** Continuous-batching engines (vLLM, TGI, TensorRT-LLM, SGLang) increase per-GPU throughput by packing more concurrent requests into each forward pass, but each additional in-flight request lengthens decode-step duration and therefore inter-token latency (ITL/TBT) and queue-induced TTFT. Once batch size grows past the point where p95/p99 ITL or TTFT crosses the provider's published or contractually-implied SLO, the scheduler must cap admission, leaving GPUs under-utilized relative to the hardware-throughput frontier. Architectural wins (FP8/INT4, MoE sparsity, speculative decoding, chunked prefill, prefill/decode disaggregation) raise the latency-feasible throughput frontier, but providers competing on user-perceived speed spend those gains on faster responses and larger context windows because demand elasticity for latency at the premium tier exceeds elasticity for marginal $/token reductions. Public per-token prices therefore stay flat while batch tiers (which relax latency SLOs to minutes/hours) move freely and are cheaper by ~50%, exposing the SLO as the binding constraint.

**Predictions.**
1. Batch-tier inference (no real-time latency SLO) is priced 40–75% below interactive-tier inference for the same model on the same hardware, and that gap persists or widens over 2024–2026.
2. Providers that relax latency SLOs (Together batch, Bedrock batch, OpenAI Batch API) capture most architectural efficiency gains as price cuts, while interactive-tier prices for flagship models stay flat or fall only modestly even as the same hardware ships speculative decoding, FP8, and disaggregated serving.
3. Across providers serving identical open-weight models, $/token and output-tokens/sec form a Pareto frontier — providers that price lower run at lower tokens/sec (deeper batching), confirming the SLO–price coupling.

**Falsification condition.** Across at least 4 major inference providers over a 12-month window, mean production batch size grows by ≥2x AND published interactive-tier TTFT-p95 / ITL-p95 SLOs hold constant or tighten AND interactive-tier $/output-token for flagship models falls by ≥40% — all simultaneously. Equivalently: the price gap between batch-tier and interactive-tier pricing for the same model collapses to <15% while interactive latency SLOs are not relaxed.

**Prior evidence base.**

| # | Claim | Tier | Source |
|---|-------|------|--------|
| c1 | Continuous-batching engines face an explicit throughput-vs-tail-latency tradeoff; Sarathi-Serve quantifies up to 5.6x serving-capacity gains by restructuring the schedule under tail-latency constraints — i.e., the prior cap was latency, not hardware. | systematic-review | [Sarathi-Serve (arxiv 2403.02310)](https://arxiv.org/abs/2403.02310) — academic-paper |
| c2 | Under colocated batching, meeting SLO targets forces resource over-provisioning; prefill/decode disaggregation roughly doubles goodput per GPU (1.6 → 3.3 req/s) without violating SLOs — direct evidence SLO is the binding constraint on achievable $/token. | systematic-review | [DistServe blog (haoailab)](https://haoailab.com/blogs/distserve/) — academic-paper |
| c3 | AWS Bedrock prices batch inference (no real-time SLO, 24h turnaround) at exactly 50% of on-demand interactive pricing for identical models — a clean natural experiment showing the SLO contract alone, hardware constant, halves $/token. | observational | [Amazon Bedrock pricing](https://aws.amazon.com/bedrock/pricing/) — vendor-pricing-page |
| c4 | Across providers serving the same model, price and output-speed form a wide Pareto frontier (~10x price range), with cheap tiers carrying tail-latency caveats and expensive tiers selling tight SLAs. | observational | [AI Inference Providers in 2025 (Global Gurus)](https://globalgurus.org/ai-inference-providers-in-2025-comparing-speed-cost-and-scalability/) — analyst-report |
| c5 | vLLM v0.6.0's headline gains (2.7x throughput, 5x latency reduction) came primarily from scheduling and CPU-overhead fixes, not new hardware — meaning the prior throughput ceiling was a software-imposed latency artifact. | expert | [vLLM v0.6.0 perf-update blog](https://blog.vllm.ai/2024/09/05/perf-update.html) — technical-blog |
| c6 | Observation of the 2025 pricing landscape: cost and output speed move independently across providers, implying $/token is set by the provider's chosen point on the latency-throughput frontier rather than by a falling hardware-cost floor. | expert | [MIRI TGT: Observations About LLM Inference Pricing](https://techgov.intelligence.org/blog/observations-about-llm-inference-pricing) — analyst-report |

**Assumptions.**

- Providers operate continuous-batching schedulers near the latency-feasible frontier (not deliberately leaving 30%+ throughput on the table for margin reasons unrelated to SLOs).
- Published interactive-tier latency SLOs (TTFT, ITL) and observed p95/p99 latencies are reasonable proxies for the operational batching cap.
- The batch-tier vs interactive-tier price gap reflects the cost of the latency SLO itself rather than confounding factors (preemptibility, off-peak scheduling, different hardware pools).

**Experimental-design artefact (generic-experimental-setup).**

- **Subject:** Production deployments of identical open-weight models (Llama 3.1 70B, Mixtral 8x22B, Qwen 2.5 72B) served via continuous-batching engines across ≥4 platforms (Together, Fireworks, Anyscale, self-hosted) under controlled latency SLOs.
- **Manipulation:** Vary TTFT-p95 / ITL-p95 SLOs across 5 tightness levels (very-relaxed: 5s/200ms → very-tight: 250ms/15ms), holding hardware (H100 80GB), model, FP8 quantization, KV-cache config, and request mix (ShareGPT trace replay at fixed RPS) constant. 24h per SLO level.
- **Measurement:** Per cell: batch-size histogram (mean, p50, p95, max in-flight), GPU MFU, tokens/sec/GPU, measured TTFT/ITL p50/p95/p99, implied $/output-token, SLO attainment rate. Primary endpoint: slope of implied $/output-token vs SLO tightness.
- **Confounders:** prefill/decode ratio, hardware heterogeneity across providers, asymmetric deployment of speculative decoding / KV reuse / prefix caching / disaggregation, provider margin policy, diurnal demand variation.
- **Sample size:** ≥4 platforms × 3 models × 5 SLO levels × 24h = 60 platform-model-SLO cells × ≥10M output tokens each; supplemented by 50+ 24h production traces per platform from public dashboards.
- **DAG sketch:** `SLO tightness → max latency-feasible batch size → tokens/sec/GPU → $/output-token`. Architectural improvements → frontier shape → achievable (batch, latency) Pareto curve → (under fixed SLO) achieved batch size. Confounders direct to $/output-token: hardware mix, prefill/decode ratio, prefix-cache hit rate, provider margin policy.

---

### H3 — `oligopoly-pricing-floor`

**Prior:** 1/3 (uniform)

**Claim.** Public per-token prices for frontier closed-weight LLMs plateaued because a concentrated foundation-model oligopoly (OpenAI, Anthropic, Google DeepMind, plus hyperscaler resellers) sets list prices via strategic anchoring and enterprise willingness-to-pay rather than competitive marginal-cost pressure; efficiency gains accrue to gross margin, not to price.

**Mechanism.** Three or four labs collectively serve the vast majority of frontier-capability API demand, with high switching costs (prompt-engineering lock-in, eval debt, enterprise contracts, regional residency), opaque marginal-cost data, and a small reference set (GPT-4-class pricing) that functions as a focal anchor. Each lab independently observes that lowering price below the anchor would not materially expand share among margin-insensitive enterprise buyers but would compress industry-wide margin, so the rational unilateral action is to hold price and pocket the per-token cost decline from FP8/FP4, MoE routing, speculative decoding, and Blackwell-class hardware. Hyperscaler resellers (Bedrock, Azure OpenAI, Vertex) mirror first-party pricing under contractual most-favored-nation terms, eliminating channel undercutting. The result is conscious parallelism — coordinated-but-not-colluding pricing — that produces a sticky floor near the GPT-4-class anchor for the frontier tier, even as raw compute cost per token has dropped roughly 35x from H100 to GB200 NVL72.

**Predictions.**
1. Gross margin on inference at the three major closed-weight labs expanded materially from 2023 to 2026 (e.g., from <40% to >65%) despite flat or modestly declining headline prices on flagship tiers.
2. Cross-provider price correlation for matched capability tiers (Claude Sonnet-class vs GPT-5-class vs Gemini Pro-class) is high (>0.8) and price changes cluster within days/weeks of competitor moves rather than tracking independent cost events.
3. Tiers exposed to credible open-weight substitution (small/mid models where Llama/DeepSeek/Qwen are usable) show 10x–100x faster price decline than the frontier tier, because oligopoly discipline breaks where contestability is real.

**Falsification condition.** H3 is falsified if (a) estimated inference gross margin at the three frontier labs is below 45% in 2025–2026 per credible teardowns, AND (b) frontier-tier public price changes correlate <0.3 with competitor price changes while correlating >0.6 with documented hardware-cost events (H100→B200 rollout, FP4 deployment, MoE adoption) with lag under 90 days. Both conditions together would indicate prices track marginal cost, not strategic positioning.

**Prior evidence base.**

| # | Claim | Tier | Source |
|---|-------|------|--------|
| c1 | Inference gross margins at frontier labs expanded from <40% to >70% from 2023 to 2025; Anthropic specifically 38% → over 70% — efficiency gains accrued to margin. | expert | [SemiAnalysis: AI Value Capture — Shift to Model Labs](https://newsletter.semianalysis.com/p/ai-value-capture-the-shift-to-model) — analyst-report |
| c2 | Foundation-model markets exhibit strong concentration tendencies that produce standard monopoly distortions including restricted supply and higher prices. | expert | [Brookings: Market concentration implications of foundation models](https://www.brookings.edu/articles/market-concentration-implications-of-foundation-models-the-invisible-hand-of-chatgpt/) — academic-paper |
| c3 | Underlying per-token hardware cost dropped roughly 35x from Hopper to Blackwell (H200→GB300 NVL72) — a divergence from much slower frontier-tier list-price decline. | expert | [NVIDIA: Blackwell InferenceMAX benchmark results](https://blogs.nvidia.com/blog/blackwell-inferencemax-benchmark-results/) — vendor-benchmark |
| c4 | Price decline is highly uneven across capability tiers (9x–900x/year), with the fastest declines concentrated where open-weight substitution is credible — consistent with oligopoly discipline holding only where contestability is weak. | observational | [Epoch AI: LLM inference price trends](https://epoch.ai/data-insights/llm-inference-price-trends) — analyst-report |
| c5 | NVIDIA controls 90–95% of the AI accelerator market; gross-profit-per-token varies widely across providers (40–85%), indicating margin is a strategic-positioning variable rather than a competitive residual. | observational | [SoftwareSeni: AI Inference Market 2025](https://www.softwareseni.com/the-ai-inference-market-in-2025-hardware-consolidation-pricing-wars-and-what-it-means-for-buyers/) — industry-news |
| c6 | Frontier-tier 2026 list prices remain clustered in a narrow band ($2–$15/M output) across the three major labs despite independent cost structures — consistent with anchor-driven parallel pricing. | observational | [CloudIDR: LLM API Pricing 2026](https://www.cloudidr.com/llm-pricing) — vendor-pricing-page |
| c7 | **Counter-evidence:** some observers argue leading AI labs are barely covering variable costs, which would weaken the oligopoly-margin story for the frontier tier. | expert | [INET: Neural Network Effects](https://www.ineteconomics.org/perspectives/blog/neural-network-effects-scaling-and-market-structure-in-artificial-intelligence) — academic-paper |

**Assumptions.**

- Third-party inference-margin estimates (SemiAnalysis et al.) approximately reflect true unit economics; if they bake in massive R&D/training amortization the labs do not, the "margin expansion" signal weakens.
- Enterprise demand for frontier capability is sufficiently price-inelastic in the $0.50–$15/M range that unilateral price cuts would not meaningfully expand share, making parallel pricing individually rational.
- Open-weight models (Llama, DeepSeek, Qwen) remain non-substitutable for the median enterprise frontier buyer through 2026 due to capability gap, ops burden, or compliance friction.

**Experimental-design artefact (generic-experimental-setup).**

- **Subject:** Public per-token list pricing for the frontier-capability tier of OpenAI, Anthropic, Google DeepMind (and resale channels: AWS Bedrock, Azure OpenAI, Google Vertex), benchmarked against estimated marginal inference cost (kWh + amortized GPU TCO) over 2023-Q1 through 2026-Q1.
- **Manipulation:** Observational / natural-experiment design — catalog every public price change on flagship frontier-tier models, and every identifiable efficiency event (FP8 launch, FP4 deployment, MoE production rollout, speculative decoding adoption, H100→H200→B200→GB200 transitions, major kernel optimizations). Treat efficiency events as the manipulation; observe whether public price changes follow.
- **Measurement:** Magnitude and lag of price change after each efficiency event; cross-provider price-change correlation matrix at frontier tier vs mid/small tier; estimated gross margin per M output tokens; anchor-test: regress current frontier price on (a) GPT-4 March-2023 list price and (b) estimated current marginal cost.
- **Confounders:** GPU supply shocks (allocation crunches kept marginal cost high independent of architecture), bundled-value confound (frontier API increasingly includes long-context, multimodal, tool-use), capacity rationing as price substitute (rate limits/waitlists during 2023–2024 shortages), open-weight substitution non-stationarity, R&D/training-capex amortization assumptions.
- **Sample size:** All public list-price changes from 5 providers × ~30–50 events; paired with ~15–20 efficiency events; supplement with cross-sectional comparison to mid-tier (Haiku/Mini/Flash) and open-weight-hosted (Together, Fireworks, DeepInfra) prices, n ≈ 100+.
- **DAG sketch:** `market_structure × GPT-4_anchor → focal_point → markup_over_marginal_cost`. `hardware_efficiency → marginal_cost ↓`. `markup × marginal_cost → public_price`. Identification: use efficiency-event timing as exogenous shock; if price doesn't respond, markup must have expanded — consistent with H3.

---

## Falsification attacks

Each attacker designs the **cheapest experiment that would discriminate the assigned hypothesis from its siblings**. Constructive, not adversarial.

### A1 — attack on H1 (`memory-bandwidth-ceiling`)

- **Discriminating prediction.** Across H100 (3.35 TB/s), H200 (4.8 TB/s), MI300X (5.3 TB/s), and TPU v5p (2.76 TB/s) running identical 70B-class dense decoder workloads at batch sizes 1, 4, 16, 64 with 2K context, single-token decode latency will scale inversely with HBM bandwidth (within ±15%) at batch ≤16, AND measured HBM bandwidth utilization will exceed 70% at batch=1 and remain above 55% through batch=16. The per-token latency ratio H200:H100 will be ≈0.70 (matching the 3.35/4.8 bandwidth ratio), NOT ≈1.0. At batch ≥64, utilization should fall and compute-bound behavior should emerge — a predicted crossover signature unique to H1.
- **Siblings ruled out if prediction holds.** `latency-capped-batching`, `oligopoly-pricing-floor`.
- **Experimental setup.** Llama-3-70B on H100 / H200 / MI300X / TPU v5p single-accelerator decode. Cross accelerator × batch size (1, 4, 16, 64) × context length (2K fixed). Measurement: per-token decode latency (p50/p99), HBM bandwidth utilization via vendor profilers (Nsight Compute, rocprof, XProf), SM/CU/TC occupancy, achieved FLOPS vs peak. Primary discriminator: regression of `1/latency` on HBM bandwidth across the 4 accelerators at each batch level; slope ≈1.0 with R²>0.85 at batch≤16 confirms H1.
- **Confounders.** Kernel maturity differences (mitigate: vendor-recommended runtimes). KV cache layout / quantization (mitigate: FP16 weights + KV, identical seqlen). Interconnect/NUMA (mitigate: single-accelerator only). Thermal throttling (mitigate: 10-min warmup, log power, exclude throttled runs). Compiler-level fusion masking memory traffic (mitigate: report HBM bytes/token from profiler, not just latency).
- **Sample size.** 4 accelerators × 4 batch sizes × 1000 decode tokens × 5 repeats = 80K measurements; ~200 GPU-hours total across clouds (Lambda, CoreWeave, GCP TPU).
- **Expected information gain.** high.
- **Cost.** moderate (~$3–5K cloud GPU rental). MLPerf Inference v4.1 already publishes partial data — a trivial-tier free first pass.
- **Rationale.** H1's core claim is a mechanism (bandwidth-floor on decode), not a market outcome. H2 is silent on cross-accelerator scaling at fixed batch. H3 operates on prices, not silicon-level latency. Only H1 predicts the slope-1 inverse-bandwidth scaling AND the >70% HBM utilization signature AND the batch-induced crossover. A null result (flat latency, or <40% HBM util) would falsify H1 while leaving H2/H3 untouched.

### A2 — attack on H2 (`latency-capped-batching`)

- **Discriminating prediction.** At a single frontier provider, for the same model on the same hardware, the batch-tier price (24h async, no TTFT/ITL SLO) will be 40–55% below the interactive-tier price, AND this gap will remain stable (within ±5pp) across at least 3 consecutive price cuts over 12 months. Furthermore, the gap will be **largest for long-output workloads (>2k output tokens, where decode-phase batching is most SLO-constrained)** and smallest for short-output workloads (<200 tokens, prefill-dominated). H2 uniquely predicts the gap is structural (the cost of honoring the SLO contract) and output-length-dependent. H1 predicts <15% gap (HBM bandwidth is indifferent to SLO). H3 predicts an arbitrary gap that should compress when competitors enter, not track decode-phase mechanics.
- **Siblings ruled out if prediction holds.** `memory-bandwidth-ceiling`, `oligopoly-pricing-floor`.
- **Experimental setup.** Published batch-API vs interactive-API pricing pairs from OpenAI, Anthropic, Google, DeepSeek for identical models (GPT-4o, Claude Sonnet 4.5, Gemini 2.5 Pro, DeepSeek-V3) across 2024-01 → 2026-05; supplemented by ~$200 of measured benchmark calls across short/medium/long output buckets. Measurement: (1) batch/interactive price ratio per model-date pair; (2) Pearson correlation between ratio changes and competitor-batch-tier launches (H3) vs hardware/efficiency announcements (H1); (3) measured per-token cost ratio at p50 ITL=50ms vs unconstrained, by output length.
- **Confounders.** Bundled discounts (volume tiers, committed-use). Cross-region capacity arbitrage masquerading as SLO pricing. Prompt-caching discounts conflated with batch discount. Model-quality differences between batch vs interactive SKUs. Marketing-driven launch pricing.
- **Sample size.** ≥4 providers × ≥2 model generations × ≥6 price-change events = 48 ratio observations; ≥3 output-length buckets × ≥500 calls each per provider (~$200 total).
- **Expected information gain.** high.
- **Cost.** cheap (public price data + ~$200 API benchmark).
- **Rationale.** Batch-vs-interactive at a single provider is the cleanest natural experiment available because it holds hardware, model weights, and pricing power constant — only the SLO contract varies. The **output-length cross-section is the killer feature** — neither H1 nor H3 has any mechanism to predict that gradient.

### A3 — attack on H3 (`oligopoly-pricing-floor`)

- **Discriminating prediction.** On the same three providers (OpenAI, Anthropic, Google) and the same hardware generations (H100→H200→B200), the 24-month $/M-output-token decline rate for **frontier-tier** models (GPT-4-class, Claude-Opus-class, Gemini-Ultra-class) will be **<35%** while the decline rate for **mid/small-tier** models (GPT-4o-mini, Claude-Haiku, Gemini-Flash) on the *same providers* will exceed **70%** — a tier gap of ≥35 percentage points. Additionally, frontier-tier price-change events across the three providers will cluster within a ≤14-day window in ≥60% of cases (parallel-pricing signature), while mid-tier price changes will show <30% clustering. H1 predicts both tiers decline at the bandwidth-improvement rate (~25–40%, tier-independent, gap <10pp). H2 predicts both tiers decline at the latency-feasible throughput rate (tier-independent at matched SLO, gap <15pp).
- **Siblings ruled out if prediction holds.** `memory-bandwidth-ceiling`, `latency-capped-batching`.
- **Experimental setup.** Public list prices for input + output tokens across OpenAI, Anthropic, Google Cloud Vertex AI from Jan 2023 through Q1 2026, segmented into frontier-tier and mid/small-tier model classes matched by intended use case and approximate parameter scale. Manipulation: tier (frontier vs mid/small) × provider; calendar time and hardware generation are temporal axes. Natural experiment exploiting the contestability gradient (open-weight substitutes make mid-tier contestable; no credible open substitute at frontier). Measurement: (a) per-model $/M-token CAGR over 24 months from Wayback Machine snapshots at 30-day intervals; (b) pairwise temporal clustering of price-change events; (c) cross-correlate price-change dates against (i) competitor price changes and (ii) hardware-availability announcements at 0–90 day lags.
- **Confounders.** Model capability drift (mitigate: match on benchmark tier, not name). Promotional / credit pricing distorting list prices (exclude launch-month values). Batch-API vs interactive-API conflation (restrict to interactive synchronous). Currency / region variation (restrict to us-east USD list). Volume-discount tiers (use rack-rate tier-1 only).
- **Sample size.** ~36 monthly snapshots × 3 providers × ~4 frontier + ~4 mid-tier models = ~864 price observations; ~40–80 discrete price-change events, sufficient for clustering chi-square at α=0.05.
- **Expected information gain.** high.
- **Cost.** trivial (<40 analyst-hours, zero infrastructure).
- **Rationale.** Pure public-data natural experiment exploiting a **contestability discontinuity neither sibling can accommodate**. H1 is tier-blind (same HBM serves both). H2 is tier-blind at matched SLO and predicts no cross-provider timing clustering (scheduler events are idiosyncratic). Only H3 predicts the tier gap AND the parallel-pricing signature, because only H3 posits pricing reflects competitive structure rather than cost — and the competitive structure differs sharply by tier.

---

## Bayesian synthesis

### Priors

| Hypothesis | Prior | Source |
|---|---|---|
| `memory-bandwidth-ceiling` | 0.333 | uniform |
| `latency-capped-batching` | 0.333 | uniform |
| `oligopoly-pricing-floor` | 0.333 | uniform |

**Prior rationale (uniform).** Without strong prior public evidence weighting any single mechanism, equal-prior is the appropriate non-informative starting point. The three mechanisms operate at different layers (physical, operational, economic) and are not mutually exclusive in principle — a non-trivial fraction of the plateau could arise from each. Uniform priors let the data speak.

### Posterior landscape

For each proposed crucible experiment, posterior shifts under the "discriminating prediction holds" outcome:

| Experiment | H1 (bandwidth) | H2 (latency batching) | H3 (oligopoly) |
|---|:--:|:--:|:--:|
| **A1** — cross-accelerator HBM scaling | ↑↑ | ↓ | ↓ |
| **A2** — batch/interactive gap + output-length gradient | ↓↓ | ↑↑ | ↓ |
| **A3** — tier-stratified decline rate + parallel-pricing clustering | ↓ | ↓ | ↑↑ |

If the discriminating prediction *fails*, the assigned-hypothesis posterior falls and the other two recover proportionally.

### Crucible experiment — selected: A3

**Selection rationale.** A3 has the highest information gain per cost:

- **Cost: trivial.** No infrastructure, no benchmarking budget. ~40 analyst-hours of Wayback Machine scraping + tabular analysis. Reproducible from public data alone.
- **Sharpest three-way discrimination.** A1 distinguishes H1 cleanly but is silent on H2 vs H3. A2 distinguishes H2 cleanly but conflates H1 and H3 in the null. A3's **two-signal design** (tier gap *and* parallel-pricing clustering) gives independent evidence for or against H3, and the tier gap simultaneously falsifies the "tier-blind" core of both H1 and H2.
- **Exploits a real structural discontinuity.** The contestability gradient between frontier (no credible open substitute) and mid-tier (open-weight competition real) is the kind of natural-experiment seam where causal inference from observational data is strongest.

A2 is the second-best crucible (cheap, sharp on H2 specifically). A1 is third — moderate cost but the only mechanism-level direct measurement, valuable as a tiebreaker if A3+A2 leave H1 plausible.

### Research roadmap

| # | Experiment | Cost | Decision point after |
|---|---|---|---|
| 1 | **A3** — tier-stratified price-decline rate + clustering | trivial | If H3 ↑↑ confirmed (tier gap ≥35pp AND clustering ≥60%) → stop; H3 is the dominant mechanism for the frontier tier. If H3 ↓ → continue to (2). |
| 2 | **A2** — batch/interactive price gap + output-length cross-section | cheap (~$200) | If H2 ↑↑ confirmed (~50% gap with output-length gradient) → stop; H2 explains most of the plateau. If null → continue to (3); H1 is the remaining viable mechanism. |
| 3 | **A1** — cross-accelerator HBM bandwidth scaling | moderate (~$3–5K) | If H1's slope-1 prediction confirmed → all three are at least partly contributing; partition variance by domain layer. If null → none of the three is fully load-bearing; new hypothesis required. |

---

## Learning objective

**When competing causal hypotheses span different domain layers (physical / operational / economic), the cheapest discriminator is rarely the most rigorous direct measurement — it is the natural experiment exploiting a *structural prediction one hypothesis makes that the others cannot mechanistically reproduce*.**

Here, the contestability gradient between frontier and mid-tier models is a structural feature only H3 can predict will produce divergent price-decline rates. H1 and H2 are tier-blind by construction: HBM serves both tiers, latency-capped batching applies to both, so neither has any mechanism to predict that *the same provider on the same hardware* would let one tier's price fall 70% while the other falls <35%. Spending ~40 analyst-hours on public Wayback Machine pricing data resolves more posterior uncertainty than $5K of GPU benchmarks, because the cheap test is *structurally diagnostic* in a way the expensive test is not.

The general principle: **before designing a mechanism-level measurement, look for a structural prediction one hypothesis makes that the others must call accidental.** That asymmetry is where the cheapest discriminator lives.

---

*Generated by `engage-crucible` skill on 2026-05-17. 20 real citations across 7 sourceClass values. See [`Docs/case-studies/README.md`](../README.md) for the case-studies-vs-examples contract.*
