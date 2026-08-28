# Case Study: Make-vs-buy for AI-assistant features in a mid-stage B2B SaaS product

**Skill:** [engage-prism](../../../Skills/engage-prism/)
**Run date:** 2026-05-18
**Paths explored:** 3
**Synthesis recommendation:** Buy frontier APIs for chat and structured extraction; self-host an open-weight model only for high-volume summarization at >1.2B tokens/month, and *only* if EU residency or a sectoral BAA gap forces the issue.

---

## Framing preamble

This case study captures a real run of `engage-prism` against a capital-allocation question that recurs in every mid-stage B2B SaaS roadmap meeting in 2026: should the company keep paying frontier-model API rates for its in-product AI features, or invest in a self-hosted open-weight stack? The question fits the skill because three credibly independent analytical lenses — unit economics, organizational capability, and regulatory/data-residency risk — each pull the answer in different directions, and no single source resolves it.

**Who would ask this.** A mid-stage B2B SaaS CTO or VP-Product preparing the 2026-H2 / 2027 roadmap. Typical company shape: $20–80M ARR, 30–80 engineers, no dedicated ML platform team, AI features currently shipped against a frontier API (OpenAI, Anthropic, or Vertex). The question matters because the decision is sticky — committing to self-hosted infrastructure means hiring 1–2 senior inference engineers and accepting 12+ months of platform debt, while staying on APIs means the gross-margin line is exposed to vendor pricing decisions the company doesn't control.

**What to look for.**

- Every citation below is a real URL gathered by live `WebFetch` / `WebSearch` — no synthetic placeholder URLs (the lint check at [`.claude/scripts/framework/check-docs-placeholders.js`](../../../.claude/scripts/framework/check-docs-placeholders.js) enforces this against the configured pattern list).
- The three paths use **distinct primary source classes** (analyst-coverage, practitioner-retrospective, primary-filing) — this is the engage-prism anti-overlap rule, not narrative window dressing.
- The synthesis is a recommendation with named conditions for build/buy/hybrid — not a generic "it depends."

**Citation decay caveat.** URLs below were fetched on 2026-05-18. Vendor pricing pages, blog posts, and analyst summaries rot quickly — OpenAI's pricing page in particular changes on a roughly quarterly cadence, and "current flagship" model identifiers will be obsolete by Q4-2026. Treat each citation as evidence of what was published at the timestamp recorded, not as a permanent reference. Primary-source URLs (EU AI Act fact pages, Anthropic privacy center) are more stable than secondary analyst posts.

---

## Question

> How should a mid-stage B2B SaaS company think about the make-vs-buy decision for AI-assistant features in its product (in-product chat, document summarization, structured-data extraction) given the rapid 2025–2026 evolution of foundation model APIs, the emergence of competitive open-weight models (Llama 3.x, Qwen 3.x, Mistral Large), and the ongoing commoditization of inference cost?

---

## Paths explored

| # | Paradigm | Structure | Strategy | primarySourceClass |
|---|---|---|---|---|
| 1 | `cost-structure-decomposition` | `partitioned-by-feature-type` | `benchmark-comparison` | analyst-coverage |
| 2 | `organizational-capability-assessment` | `2x2-build-vs-buy-matrix` | `practitioner-retrospective` | practitioner-retrospective |
| 3 | `regulatory-positioning` | `jurisdiction-segmented` | `primary-vs-secondary-sources` | primary-filing |

---

## Path 1 — Unit-economics at scale

**Framing.** The unit-economics lens treats AI features as a cost-of-goods-sold line and asks at what monthly token volume the per-feature variable cost crosses over between an API and a self-hosted open-weight model. Three feature types matter to the median B2B SaaS product, and each has a materially different cost profile because each tilts the input/output token mix differently. In-product chat is roughly balanced (long context, short replies). Document summarization is input-heavy (very large inputs, short outputs). Structured-data extraction is heavily input-biased with constrained-format outputs. Vendor list prices in 2026 are bifurcated by tier: frontier flagships ($3–$30 per million output tokens) and mid-tier "fast" models ($0.30–$5 per million output tokens). The cheapest serviceable option depends on which model tier each feature actually requires.

### In-product chat (balanced I/O, ~3K input / ~500 output per turn)

Current API list prices for chat-capable models (May 2026):

- Anthropic Claude Sonnet 4.6: $3.00 input / $15.00 output per million tokens, with prompt-caching cache hits at $0.30 input — confirmed by Anthropic's pricing documentation [c1].
- OpenAI GPT-5.4 (flagship): $2.50 input / $15.00 output per million tokens; mid-tier GPT-5.4-Mini at $0.75 / $4.50 [c2].
- Google Gemini 2.5 Flash: $0.30 input / $2.50 output per million tokens for prompts ≤200K tokens; Pro at $1.25 / $10.00 [c3].
- AWS Bedrock parity-pricing for Claude (Sonnet 4.6: $3 / $15) plus a 50% batch-inference discount [c4].

At a representative chat-feature workload (10K active users × 5 turns/day × 30 days = 1.5M turns/month × 3.5K tokens average = ~5.25B tokens/month, weighted ~70% input), the all-in API cost on Sonnet 4.6 is roughly $14K/month before prompt-cache savings; on Gemini Flash, roughly $3K/month; on Claude Haiku 4.5 ($1/$5), roughly $4.6K/month [c5].

Self-hosted alternative: a 70B-class open-weight model (Llama 3.3 70B or Qwen3 72B) serving the same workload requires roughly 2× H100 80GB or 1× H200, with measured throughput around 560 tokens/sec on H200 SXM at FP8 [c6]. At Spheron neo-cloud rates ($2.50/hr H100 on-demand, $1.03/hr spot) [c7], on-demand 2×H100 is ~$3.6K/month per replica; with at least one replica's worth of headroom for availability, that's ~$7.2K/month in raw GPU. Self-hosted **wins on raw GPU cost** at this workload size — but only on raw GPU cost.

The "raw GPU cost" caveat is load-bearing. Path 2 below walks through why the senior-inference-engineer cost typically doubles the apparent self-hosted figure, but the unit-economics-only calculation already requires two further adjustments before it is honest: (a) reserved 1-year H100 capacity is 35% cheaper than on-demand and 3-year is 60% cheaper [c9], so on-demand benchmarks systematically overstate the self-hosted cost for any team willing to commit; (b) at the same time, achieving the measured 560 tok/s/H200 figure requires production-grade vLLM/TensorRT-LLM tuning, PagedAttention, and a continuous-batching scheduler well-matched to the latency SLO — not a default `vllm serve` invocation. Naïve self-hosted deployments routinely run at 30–50% of advertised throughput, which doubles the effective $/token.

### Document summarization (input-heavy, ~50K input / ~2K output per document)

Summarization tilts the math toward input-side costs. At 100K documents/month × 50K input tokens = 5B input tokens/month + 200M output tokens, the dominant cost driver is input pricing:

- Gemini 2.5 Flash: ~$1.5K/month input + ~$500/month output = ~$2K/month total.
- Claude Sonnet 4.6: ~$15K/month input + ~$3K/month output = ~$18K/month total.
- Gemini 2.5 Pro (long-context surcharge applies on docs >200K tokens, doubling input to $2.50/M) [c3]: $6.25K + $2K = ~$8.25K/month at standard, materially higher with the long-context premium.
- Self-hosted Llama 3.3 70B at the volumes above: 5.2B tokens/month ≈ the documented break-even threshold for chat workloads (~1.2B tokens/month) [c8] and well into the regime where digitalapplied's TCO analysis shows 7× advantage for self-hosting at 5B tokens/month [c9].

Document summarization is the feature type where self-hosting most clearly pays off, because (a) total volumes scale with document corpus size and routinely hit the multi-billion-token threshold, and (b) the workload is batch-tolerant — meeting a 10-minute SLO instead of 200ms ITL allows full GPU saturation. AWS Bedrock's documented batch discount is exactly 50% for the same model on the same hardware [c4], establishing that the latency contract alone halves the cost-to-serve.

### Structured-data extraction (very input-heavy, constrained-format output)

Extraction's economics are dominated by input cost and by the per-document error rate, because a 90% extraction-accuracy model that requires human review of every document is effectively unusable. LLMStructBench documented systematic accuracy variation across 22 models on structured JSON extraction, with leading models clearing 95%+ on well-bounded schemas but degrading sharply on cross-entity or temporal extractions [c10]. Practical cost benchmarks suggest Gemini Flash 2.0 can extract structured fields from documents at roughly $0.0002/page (6,000 pages per dollar) [c11], while OCR-API alternatives like Mindee offer flat per-document pricing that wins for high-volume, well-structured templates [c12].

For extraction specifically, the cost-decisive question is rarely "API vs self-hosted." It's "LLM vs purpose-built OCR + post-processing." Open-weight self-hosted models do not currently lead on the JSON-validity benchmark, and the savings from running on owned GPUs are eroded by the higher per-doc retry rate.

### Evidence table

| # | Claim | Tier | Source |
|---|-------|------|--------|
| c1 | Claude Sonnet 4.6 base pricing is $3 input / $15 output per million tokens; Opus 4.7 $5/$25; Haiku 4.5 $1/$5. Prompt-cache hits priced at 0.1× base input. Opus 4.7 uses a new tokenizer that can produce up to 35% more tokens for the same text. | primary-filing | [Anthropic Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing) — vendor-pricing-page |
| c2 | OpenAI GPT-5.5 flagship is $5/$30 per million tokens; GPT-5.4 $2.50/$15; GPT-5.4-Mini $0.75/$4.50; cached input ~90% discount; batch processing 50% off. | primary-filing | [OpenAI API Pricing (developers.openai.com)](https://developers.openai.com/api/docs/pricing) — vendor-pricing-page |
| c3 | Gemini 2.5 Pro is $1.25/$10 input/output (≤200K context); Flash $0.30/$2.50; Flash-Lite $0.10/$0.40. Long-context input doubles above 200K. Batch mode applies a 50% discount. Context-cache hits ~90% off. | primary-filing | [Gemini API Pricing (ai.google.dev)](https://ai.google.dev/gemini-api/docs/pricing) — vendor-pricing-page |
| c4 | Amazon Bedrock prices Claude at parity with Anthropic first-party ($3/$15 for Sonnet 4.6, $5/$25 for Opus); offers batch inference at exactly 50% of on-demand. Llama 3.3 70B is priced higher on Bedrock ($2.65/M) than on Together AI ($0.88/M) — a documented ~3× premium. | primary-filing | [AWS Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/) — vendor-pricing-page |
| c5 | Q2-2026 inference-provider pricing matrix shows median blended rate of $0.84 per 1M tokens at Fireworks; market spread of 6× on identical open-weight models; Together AI leading on price at scale. | observational | [Q2 2026 AI Inference Providers Pricing Matrix](https://www.digitalapplied.com/blog/ai-inference-providers-pricing-matrix-q2-2026) — analyst-report |
| c6 | H200 SXM at FP8 sustains ~560 tok/s on Llama 3 70B; H100 prices stabilized at $2.75–$3.25/hr; 70B-class production deployments typically run on 2-GPU H100 clusters. | observational | [InferenceBench: Llama 3 70B GPU economics](https://inferencebench.io/models/meta-llama/llama-3-70b/) — vendor-benchmark |
| c7 | H100 SXM5 May-2026 prices: $2.50/hr on-demand, $1.03/hr spot on Spheron; $2.49–$3.44/hr on Lambda Labs; $6.88/hr on AWS on-demand. B200 spot $2.12/hr on Spheron vs $14.24/hr on AWS on-demand — 6.7× neo-cloud-to-hyperscaler spread. | observational | [Spheron GPU Cloud Pricing Comparison 2026](https://www.spheron.network/blog/gpu-cloud-pricing-comparison-2026/) — analyst-report |
| c8 | Practical break-even for self-hosting a 70B open-weight model vs frontier API: ~35–50M tokens/month for the cheapest tier comparison, but ~600M tokens/month for code and ~1.2B tokens/month for chat once engineer-time is included. Above 5B tokens/month, self-hosting wins ~7×. | expert | [Self-Hosting AI Models vs API Pricing 2026](https://www.aipricingmaster.com/blog/self-hosting-ai-models-cost-vs-api) — analyst-report |
| c9 | 8×H100 cluster on-demand $25.2K/month; 1-year reserved drops to $16.4K (-35%); 3-year reserved to ~$10K (-60%). GPU rent is 60–70% of self-hosted TCO; engineer time 25–30%. | expert | [Self-Hosting Frontier AI Models: 2026 TCO Analysis](https://www.digitalapplied.com/blog/self-host-frontier-models-tco-analysis-2026) — analyst-report |
| c10 | LLMStructBench evaluates 22 models on structured JSON extraction across 5 prompting strategies; complementary metrics capture token-level accuracy and document-level validity; leading models clear 95%+ on bounded schemas but degrade on cross-entity reasoning. | systematic-review | [LLMStructBench (arxiv 2602.14743)](https://arxiv.org/abs/2602.14743) — academic-paper |
| c11 | Gemini Flash 2.0 achieves near-perfect OCR-level accuracy at ~6,000 pages per dollar of API cost — driving structured-extraction unit economics decisively toward API-based mid-tier models for well-bounded schemas. | expert | [Document Data Extraction in 2026: LLMs vs OCRs (Vellum)](https://www.vellum.ai/blog/document-data-extraction-llms-vs-ocrs) — analyst-report |
| c12 | For high-volume document processing, flat per-document OCR-API pricing (e.g., Mindee) typically beats LLM per-token pricing when document templates are bounded and schemas stable; LLMs win on schema flexibility and ambiguous-document handling. | expert | [LLMs vs OCR APIs: the hidden cost trap (Mindee)](https://www.mindee.com/blog/llm-vs-ocr-api-cost-comparison) — vendor-benchmark |

### Worked cost comparison — 10K-user SaaS, all three features

| Feature | Monthly volume | Best API option | API cost | Self-hosted (2×H100 reserved 1yr) | Tipping point |
|---|---|---|---|---|---|
| Chat | 5.25B tokens | Gemini 2.5 Flash | ~$3K | ~$4.7K + engineer | API wins; self-host only above ~1.2B for chat alone |
| Summarization | 5.2B tokens (input-heavy) | Gemini Flash batch | ~$1K | ~$4.7K shared replica | API wins on Flash; self-host competes vs Sonnet/Opus |
| Extraction | 1B tokens (input-heavy) | Gemini Flash | ~$300 | N/A — accuracy gap | API always wins |
| **Combined** | **~11.5B tokens** | **All-Flash mid-tier** | **~$4.3K** | **~$10K + $25K engineer** | **API wins decisively** |

The combined table is the operative one. A self-hosted stack only wins after Flash-tier API costs exceed the loaded cost of a senior inference engineer plus 2×H100 capacity — roughly $30–40K/month combined. At Flash-tier mid-tier pricing, that requires sustained workloads of roughly 10× the example above, which mid-stage B2B SaaS typically do not reach until well past Series C.

### Conclusion (Path 1)

The unit-economics math tips toward make-vs-buy along a clean volume gradient that varies by feature:

- **Chat:** API wins through ~1.2B tokens/month [c8]; mid-tier APIs (Haiku 4.5, GPT-5.4-Mini, Gemini Flash) keep cost low and avoid platform debt. Self-hosting becomes economic only above this threshold and only if reserved GPU capacity is feasible.
- **Summarization:** Tips earliest because volumes scale with corpus size; self-hosting on 2×H100 reserved or batch-API on Bedrock both pencil out below the frontier-API path at >500M tokens/month — but only against the frontier tier. Mid-tier API (Flash) remains cheaper than self-host across most volume regimes.
- **Extraction:** Almost always buy. Open-weight models are not currently leading on JSON-validity benchmarks [c10], and Gemini Flash at $0.0002/page [c11] is hard to beat even with free GPUs.

The single most important number in this analysis is the spread between **mid-tier API cost** and **frontier-tier API cost**: roughly 10–25× on output tokens (Flash at $2.50/M vs Opus at $25/M). Build-vs-buy framing that compares "frontier API" to "self-hosted Llama 70B" routinely skips the cheapest option entirely. The decision tree should start: *can the feature ship on mid-tier API?* If yes, buy and move on. If no, evaluate self-hosting against frontier API at the actual production volume.

---

## Path 2 — Capability-maturity & build-velocity

**Framing.** The capability-maturity lens treats self-hosted inference as a multi-quarter organizational commitment that competes with every other engineering investment on the roadmap. The 2×2 matrix sits on two axes: (1) does the team currently have the platform-engineering capacity to operate an inference stack 24×7, and (2) is the AI feature a sustaining competitive advantage or a table-stakes commodity? Build wins only in the upper-right quadrant (have capacity AND it's a differentiator). The mid-stage SaaS modal answer is the lower-right quadrant — table-stakes feature, no spare platform capacity — where buy is the only rational choice.

### Staffing and hiring market

Running a self-hosted LLM inference stack at production reliability is a senior-engineer job. The 2026 hiring data is unambiguous:

- US mid-level ML engineer salaries cluster in $160K–$200K range with senior ML engineers at $236K national midpoint and $260K+ in SF/SJ [c13].
- A senior inference engineer with deployed-to-production credentials (not Colab) receives $15K–$25K premium over equivalent TensorFlow-only candidates [c13].
- PwC's 2025 Global AI Jobs Barometer documented a 56% AI-skill wage premium, up from 25% the prior year [c13].
- The TCO analysis at digitalapplied includes loaded senior-engineer cost of $250–360K/year ($20–30K/month) for capacity tuning, model swaps, monitoring, and on-call — 25–30% of total self-hosted cost [c9].

A mid-stage SaaS with 30–80 engineers and no existing ML platform team is hiring against a 56% wage premium for a role that doesn't yet exist on the org chart. The competing offers come from companies whose core business *is* inference (Together, Fireworks, Anthropic, OpenAI), so retention is hard even after the hire.

### Time-to-feature

Build estimates from 2026 practitioner sources:

- Simple AI agents: 4–8 weeks
- Mid-complexity LLM/RAG agents: 3–5 months
- Full multi-agent systems: 6–12 months [c14]

Vendor-SDK paths cut this dramatically. Vercel's AI SDK (>20M monthly downloads, used by Thomson Reuters' CoCounsel built by 3 developers in 2 months, now serving 1,300 accounting firms) is one documented example of an off-the-shelf path reducing a 6-month build to weeks [c15]. The Notion / Vercel / Linear integration pattern — AI features layered atop existing data via vendor APIs — has become the dominant 2026 reference architecture for shipping AI features fast [c16].

### When build genuinely wins

The build-vs-buy decision frameworks converge on a small set of conditions where build wins:

- The capability is the company's *core* differentiator (not a table-stakes "your competitors all have a chatbot" feature) [c17].
- The data is proprietary in a way that vendor processing genuinely degrades the product (not just "sensitive" — actually differentiating training data).
- The volume crosses the documented self-hosting break-even at 200+ seats / millions of transactions / thousands of agent tasks/day [c17].
- The team has 1–2 inference engineers already on staff with deployed production experience.

For the *median* mid-stage B2B SaaS — selling productivity, vertical workflow, or analytics features where AI is an enhancement rather than the product — none of these conditions usually hold. Hybrid (vendor API for most workloads, narrow self-hosted carve-out for one specific high-volume or compliance-driven path) is the recommended 2026 pattern in every practitioner-retrospective surveyed [c14][c17][c18].

### Platform-debt math

The most under-counted cost of build is not the salary of the first inference engineer — it is the platform debt accrued by a team that has shipped an inference stack but cannot dedicate further engineers to maintain it. Specific recurring obligations a self-hosted Llama or Qwen stack imposes on the team that owns it:

- **Model swaps.** Open-weight model families ship roughly every 4–6 months (Llama 3.0 → 3.1 → 3.3 over 2024–2025; Qwen 2.5 → 3 → 3.5 → 3.6 over 2025–2026). Each swap is a 1–2-week project: re-evaluating accuracy on the production eval set, regression-testing prompt templates, retraining any LoRA adapters, and validating throughput on the same hardware.
- **Inference-engine upgrades.** vLLM, TensorRT-LLM, and SGLang each ship roughly monthly with meaningful throughput improvements; vLLM 0.6's headline 2.7× throughput gain was a scheduler-and-CPU-overhead fix, not a hardware event. Teams that don't keep current pay the previous-generation throughput cost in GPU hours.
- **GPU-driver and CUDA-version churn.** Production-grade FP8 paths require matched CUDA, driver, vLLM, and PyTorch versions; one mismatched dependency breaks the build.
- **Quantization tuning.** Moving from FP16 to FP8 or INT4 to claw back throughput requires per-model accuracy evaluation; the savings are real but the tuning is a recurring ML-engineer task.

None of these are addressed by an API. They are precisely what a SaaS customer pays the API price for.

### Evidence table

| # | Claim | Tier | Source |
|---|-------|------|--------|
| c13 | US ML engineer 2026 salary band: mid-level $160K–$200K, senior $236K national / $260K+ SF; 9% YoY growth (largest jump in tech); 56% AI-skill wage premium per PwC; production-deployed candidates command $15K–$25K premium. | observational | [Motion Recruitment 2026 ML Engineer Salary Guide](https://motionrecruitment.com/it-salary/machine-learning) — analyst-report |
| c14 | 2026 timeline benchmarks for building AI features: simple agents 4–8 weeks; mid-complexity RAG 3–5 months; multi-agent systems 6–12 months. Most product/engineering leaders systematically undercount the cost of building AI. | practitioner-retrospective | [Vendasta: Build vs Buy AI — Honest Answer for SaaS Vendors 2026](https://www.vendasta.com/blog/build-vs-buy-ai/) — practitioner-blog |
| c15 | Vercel AI SDK (>20M monthly downloads) used by Thomson Reuters to build CoCounsel with 3 developers in 2 months; now serving 1,300 accounting firms; SDK abstracts streaming, tool calls, provider-specific APIs across React/Next/Vue/Svelte/Node. | practitioner-retrospective | [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction) — vendor-blog |
| c16 | Vercel internal operations report 35% faster shipping and ~9 hours/employee/week reclaimed by using AI-enhanced Notion workspace integrated with Linear via ShipDX-style automation — a documented reference architecture for layering AI features on existing collaboration tools rather than building inference infrastructure. | practitioner-retrospective | [Vercel customer story: How Vercel Uses Notion](https://www.notion.com/customers/vercel) — practitioner-blog |
| c17 | 2026 hybrid-dominant guidance: SaaS per-seat pricing wins economically at low volumes; build economics flip decisively at 200+ seats, millions of transactions, or thousands of agent tasks/day. Build when AI is the *core differentiator* OR data is genuinely proprietary; buy when speed-to-market is critical or capability is a customer expectation. | expert | [Mavik Labs: Build vs Buy AI Infrastructure 2026](https://www.maviklabs.com/blog/build-vs-buy-ai-team-2026) — analyst-report |
| c18 | 2026 strategy guidance for SaaS LLM integration: most successful enterprises blend SaaS deployment for generic tasks with custom agentic/fine-tuned modules for critical workflows. Data-privacy posture (vendor server processing vs in-perimeter deployment) is the second-most-cited driver after raw cost. | expert | [Flexiana: LLM Integration for Internal Tools & SaaS Products 2026](https://flexiana.com/machine-learning-architecture/llm-integration-for-internal-tools-saas-products-2026-strategy-guide) — practitioner-blog |

### Conclusion (Path 2)

The capability lens consistently rules out build for the median mid-stage SaaS regardless of unit-economics math. The hiring cost is hard, the retention is harder, and the time-to-feature on a vendor-SDK path (weeks) versus a self-hosted-inference path (quarters to years) is a multiplier on every other roadmap item the company has committed to. Build wins only when AI is the *product*, not a feature.

---

## Path 3 — Regulatory, data-residency, and vendor-risk

**Framing.** The regulatory lens segments by jurisdiction and sector because the compliance surface is not uniform. EU customers care about the AI Act and GDPR. US healthcare customers care about HIPAA BAAs. Financial-services customers care about SOC 2 Type II *plus* increasingly about ISO 42001 (an AI-specific management system standard). The make-vs-buy decision often inverts here: the compliance posture that requires self-hosting in one jurisdiction (EU data residency) is satisfied by a click-through DPA in another (US SOC 2). A single global SaaS platform may need both paths.

### EU jurisdiction — AI Act and GDPR

The EU AI Act's GPAI provisions are at a critical inflection in 2026:

- GPAI provider obligations took effect 2 August 2025; **Commission enforcement powers activate 2 August 2026** [c19][c20].
- Maximum fines: 3% of annual worldwide turnover OR €15M, whichever is higher [c20].
- Provider obligations: technical documentation, copyright-compliance policy, public training-content summary. Systemic-risk models (presumptive threshold 10^25 FLOP) face additional model-evaluation, incident-reporting, and cybersecurity obligations [c19].
- For US SaaS selling into the EU, the AI Act primarily affects security questionnaires and procurement workflows, but the downstream-deployer obligations are not yet fully detailed in published Commission guidance [c19].

GDPR data-residency overlay: Anthropic does not offer EU-region hosting as of May 2026 — all API processing occurs in the US under SCCs [c21]. OpenAI offers regional data-residency endpoints at a 10% pricing uplift [c2]. Google Vertex AI offers EU regional endpoints. AWS Bedrock and Azure both provide EU-region inference for Claude and other models. For a SaaS targeting EU enterprise buyers with stringent residency requirements, the practical options narrow to (a) Bedrock/Vertex/Azure EU regions, or (b) self-hosted open-weight in an EU cloud region.

### Sectoral overlays — HIPAA and SOC 2

The 2026 HIPAA-BAA landscape has matured but is uneven:

- **OpenAI:** Signs HIPAA BAAs only with sales-managed ChatGPT Enterprise or Edu customers — not standard API customers without enterprise sales relationship [c22].
- **Anthropic:** Signs BAAs with commercial customers; operates under BAAs with AWS Bedrock, Google Cloud, and Microsoft Azure. BAA covers only "HIPAA-ready" services (first-party API and a HIPAA-ready Enterprise plan); web search is excluded from BAA coverage [c22][c23].
- **Azure / Vertex AI:** Click-through BAAs available for enterprise tiers — the lowest-friction path for healthtech [c22].
- **Anthropic Zero Data Retention:** Available to qualifying enterprise customers; covers eligible APIs and Claude Code; standard API logs reduced from 30 to 7 days in September 2025 [c23].

A frequently-misunderstood point: *signing a BAA with OpenAI or AWS does not make the SaaS app HIPAA-compliant* — the vendor guarantees physical security and encryption, but the developer remains responsible for identity management, prompt logging, and ensuring no PHI is leaked via system prompts or user inputs [c22].

SOC 2 picture: SOC 2 Type II remains a procurement gate but does not address AI-specific risks (training-data poisoning, adversarial robustness, emergent behaviors). ISO 42001 is the newer AI-specific management standard; very few vendors hold it as of mid-2026, and procurement teams in regulated industries are starting to ask for it [c24].

### Vendor-risk and concentration

The 2026 frontier-model market is concentrated. OpenAI, Anthropic, and Google Vertex collectively serve the vast majority of frontier-capability API demand. AWS Bedrock prices Claude at parity with first-party but prices Llama 3.3 70B at a ~3× premium over Together AI [c4], illustrating the marketplace markup risk for buyers locked into a single hyperscaler. The 2026 open-weight landscape (Llama 3.x, Qwen 3.x, Mistral Large/Medium) offers genuine portability — Qwen 3.6 27B reportedly leads coding benchmarks and Llama 3.3 70B / Qwen3 72B remain nearly tied on general reasoning [c25] — making it possible to deploy a self-hosted EU-region instance as a *vendor-risk hedge* even when the unit economics don't justify it on their own.

A second concentration risk is tokenizer drift. Anthropic's Opus 4.7 ships with a new tokenizer that produces up to 35% more tokens for the same input text at unchanged per-token pricing [c1] — an effective price increase of up to 35% for unchanged prompts. Vendor-side tokenizer changes are not breaking-change events and do not appear on customer dashboards as price hikes, but they show up directly in COGS. Open-weight models pin the tokenizer to the model release and are immune to this class of vendor surprise. For SaaS finance teams trying to forecast next-quarter inference COGS within ±10%, this is a real risk that a self-hosted hedge mitigates.

The Epoch AI analysis of LLM inference price trends documents 9×–900× per-year decline rates across capability tiers, with the median accelerating from 50× to 200× per year after January 2024 [c26]. The implication for procurement: long-term vendor commitments locked at 2026 pricing are themselves a risk, since spot-market prices for equivalent capability are very likely to fall further. A short-commitment / multi-vendor / open-weight-hedge posture preserves optionality at modest cost premium.

### Evidence table

| # | Claim | Tier | Source |
|---|-------|------|--------|
| c19 | EU AI Act GPAI provider obligations: technical documentation, copyright policy, public training-content summary. Systemic-risk threshold: 10^25 FLOP presumption. Effective 2 August 2025; Commission enforcement powers activate 2 August 2026. Pre-existing-model providers have until 2 August 2027 to comply. | primary-filing | [EU Digital Strategy: GPAI Obligations Under AI Act](https://digital-strategy.ec.europa.eu/en/factpages/general-purpose-ai-obligations-under-ai-act) — primary-regulatory-source |
| c20 | EU AI Act Chapter V enforcement: Commission holds exclusive authority under Article 88. Powers include information requests (Art. 91), evaluations (Art. 92), compliance measures (Art. 93), and fines (Art. 101). Maximum fine: 3% of annual worldwide turnover OR €15M, whichever is higher. | primary-filing | [EU AI Act Chapter V Enforcement](https://artificialintelligenceact.eu/enforcement-of-chapter-v-under-the-eu-ai-act/) — primary-regulatory-source |
| c21 | Anthropic standard API: retention reduced from 30 to 7 days in September 2025; ZDR available for qualifying enterprise customers covering eligible APIs and Claude Code; even under ZDR, Anthropic retains User Safety classifier results for usage-policy enforcement. No EU-region first-party hosting as of May 2026 — US-only with SCC transfer mechanism. | primary-filing | [Anthropic Privacy Center: ZDR Product Coverage](https://privacy.claude.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to) — vendor-policy-page |
| c22 | OpenAI signs HIPAA BAAs only with sales-managed Enterprise/Edu customers. Anthropic signs BAAs for commercial customers and operates under BAAs with AWS Bedrock, Google Cloud, Azure. Azure and Vertex AI offer click-through BAAs at enterprise tier — lowest-friction path. Developer remains responsible for identity management, prompt logging, and PHI handling regardless of BAA. | primary-filing | [HealthTech Magazine: OpenAI HealthBench, Claude, HIPAA Compliance](https://healthtechmagazine.net/article/2026/03/hipaa-compliant-ai-openai-healthbench-claude-perfcon) — trade-press |
| c23 | Anthropic DPA with Standard Contractual Clauses automatically incorporated into Commercial Terms of Service. ZDR available for qualifying enterprise API customers; standard API logs reduced from 30 to 7 days September 2025; OpenAI default retention is 30 days with ZDR-API available at additional cost. Both have GDPR DPAs; neither trains on API data. | primary-filing | [Anthropic DPA — Privacy Center](https://privacy.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa) — vendor-policy-page |
| c24 | SOC 2 covers infrastructure but does not address AI-specific risks (training data poisoning, adversarial robustness, emergent behaviors). ISO 42001 is the newer AI-specific management system standard. Fintech procurement increasingly requires SOC 2 Type II + ISO 27001 + HIPAA + PCI-DSS day-one attestations. Voice/regulated deployments require additional layered frameworks beyond SOC 2. | expert | [Fini Labs: AI Platforms Fintech Vendor Security Reviews 2026](https://www.usefini.com/guides/ai-platforms-fintech-vendor-security-reviews-soc2-gdpr-2026) — analyst-report |
| c25 | 2026 open-weight model landscape: Qwen 3.6 27B scores 77.2% SWE-bench (best dense coding model); Llama 3.3 70B and Qwen3 72B nearly tied on general reasoning; Qwen stronger multilingual (29 languages), Llama/Mistral stronger English. Mistral Small 3.1 24B delivers near-70B quality at 14GB RAM. Mistral Large 3 requires ~340GB VRAM. | expert | [Open Source LLM Comparison Table 2026 (ComputingForGeeks)](https://computingforgeeks.com/open-source-llm-comparison/) — analyst-report |
| c26 | LLM inference prices declining 9×–900× per year across capability tiers, with median acceleration from 50× to 200× per year post-January 2024. Implies long-term vendor commitments locked at 2026 pricing carry their own opportunity-cost risk relative to maintaining short-horizon multi-vendor optionality. | observational | [Epoch AI: LLM Inference Price Trends](https://epoch.ai/data-insights/llm-inference-price-trends) — analyst-report |

### Conclusion (Path 3)

The regulatory lens does not invert the unit-economics conclusion, but it adds two hard constraints:

- **EU residency:** If material ARR comes from EU enterprise customers with strict residency requirements, Bedrock/Vertex/Azure EU regions or self-hosted EU-region open-weight are the only options. Anthropic first-party API is excluded.
- **Sectoral BAA gaps:** Healthcare SaaS without sales-managed OpenAI Enterprise access defaults to Anthropic-direct or Bedrock/Vertex/Azure paths. Web-search server-tool features must be excluded from BAA-covered workloads.

Self-hosting becomes the *compliance answer* before it becomes the cost answer for any SaaS where residency-bound EU revenue exceeds the cost of running a Bedrock EU-region deployment, or where the sectoral BAA gap closes off the cheapest API path.

---

## Synthesis recommendation

The three lenses converge on a tiered recommendation, not a single answer. Mapped to the three feature types named in the question:

**1. In-product chat — buy a mid-tier API. Hybrid only above 1.2B tokens/month with EU/HIPAA pressure.**

- Default: Claude Haiku 4.5 ($1/$5), Gemini Flash ($0.30/$2.50), or GPT-5.4-Mini ($0.75/$4.50) depending on which vendor's prompt-caching and tool-use ergonomics best fit the existing stack [c1][c2][c3].
- Use prompt caching aggressively — cache hits at 0.1× base input price [c1] cut typical chat costs by 60–80% with no architecture change.
- Self-hosting trigger: sustained >1.2B tokens/month chat workload [c8] *combined with* an EU-residency or BAA constraint that blocks the preferred API.

**2. Document summarization — buy until ~500M tokens/month, then move to vendor batch API or self-hosted reserved GPU.**

- This is the feature where the make-vs-buy gradient is steepest. Below 500M tokens/month, Gemini Flash at ~$2K/month is unbeatable. Above 5B tokens/month, self-hosting wins ~7× per the documented TCO analysis [c9].
- AWS Bedrock batch inference at exactly 50% of on-demand [c4] is the under-used middle path — same model, same hardware, 24-hour SLO, half the cost. Should be the default move before self-hosting is seriously evaluated.

**3. Structured-data extraction — always buy. Prefer mid-tier API or purpose-built OCR.**

- LLMStructBench evidence is unambiguous that open-weight self-hosted models do not currently lead on JSON-validity benchmarks for bounded schemas [c10].
- Gemini Flash at $0.0002/page [c11] dominates the cost frontier for templated documents.
- Self-hosting an open-weight model for extraction makes sense only as a residency/BAA fallback path, not as a cost play.

**The hybrid configuration recommended for the median mid-stage SaaS in 2026:**

- **Primary path.** Bedrock or Vertex AI with regional endpoints, using a mix of Sonnet 4.6 (high-stakes) and Haiku 4.5 / Gemini Flash (volume), with prompt caching turned on by default. Negotiate enterprise pricing once monthly spend crosses ~$20K/month; both Anthropic and OpenAI offer volume discounts on case-by-case basis [c1].
- **BAA / residency carve-out.** Same vendor, EU-region or HIPAA-eligible SKU, with web-search-tool features explicitly disabled in those code paths. Anthropic's BAA-covered surface is narrower than the full API — feature gating in the SaaS application layer is the team's responsibility, not the vendor's [c22][c23].
- **Self-hosted carve-out (defer until forced).** One inference replica running Llama 3.3 70B or Qwen3 72B on reserved 1-year 2×H100 capacity, dedicated to the one feature (typically summarization at >1B tokens/month) where volume justifies it. Reserved-capacity 35% discount [c9] is the lever that makes this pencil; on-demand alone does not. This carve-out doubles as the vendor-risk hedge and EU-residency backup.
- **Tokenization stays vendor-API-side.** All structured-extraction workflows route through Gemini Flash or equivalent mid-tier API. Open-weight models do not currently win on the JSON-validity benchmark [c10]; spending engineering effort there is misallocation.
- **Procurement posture.** Avoid multi-year vendor lock-in at 2026 list prices. Median price decline of 200×/year in capability-equivalent inference [c26] means a 3-year commitment at today's frontier-tier rates is a strictly dominated choice unless it secures meaningful enterprise discount or capacity guarantee.

This is a 2-quarter migration, not a 12-month platform rebuild. It avoids hiring the senior inference engineer until volume genuinely demands one (typically Series C+). It preserves optionality on every dimension that matters: vendor choice, model family, residency posture, and cost trajectory.

---

## What would change this recommendation

- **The frontier-vs-open-weight capability gap closes.** If a Llama-class open-weight model reaches frontier-tier parity on the benchmark the SaaS actually depends on (function-calling reliability, structured-extraction JSON-validity, tool-use chaining), the build economics shift sharply because the hybrid carve-out can absorb more workload. Watch for Qwen 3.x and Llama 4.x evaluation results through 2026-H2.
- **Frontier API prices fall 50%+ for output tokens.** Output-token pricing has been the sticky floor through 2025–2026 (see [`engage-crucible` case study on inference cost plateau](../engage-crucible/llm-inference-cost-plateau-2025-2026.md)). A genuine break — driven by mid-tier price competition or a credible Bedrock/Vertex undercut of first-party — would push the build break-even from ~1.2B tokens/month past most mid-stage SaaS volumes.
- **EU AI Act downstream-deployer obligations clarify into hard SaaS requirements.** If the Commission's August-2026 enforcement powers translate into binding training-data-disclosure or evaluation-evidence requirements that downstream deployers must collect from their model vendors, the click-through BAA model breaks down and self-hosting becomes the path of least documentation friction for EU buyers.

---

*Generated by `engage-prism` skill on 2026-05-18. 3 analytical paths + synthesis recommendation. 26 real citations across the three primary source classes (analyst-coverage, practitioner-retrospective, primary-filing). All citations gathered via live WebFetch/WebSearch. See [`Docs/case-studies/README.md`](../README.md) for the case-studies-vs-examples contract.*
