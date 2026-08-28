# Case Study: First-session onboarding for a self-hosted observability tool

**Skill:** [engage-forge](../../../Skills/engage-forge/)
**Run date:** 2026-05-17
**Paths explored:** 3
**Audit checklist:** Nielsen-10
**Persona:** Priya (selected from problem statement; senior backend engineer evaluating for team-replacement decision)
**Graft recommendations:** 7

---

## Framing preamble

This case study captures a real run of `engage-forge` against a design problem that is concrete, measurable, and recognisable to anyone who has shipped self-hosted developer tooling: **the 3-hour time-to-first-useful-dashboard and >50% first-session abandonment that plague self-hosted observability onboarding**.

The question fits `engage-forge` because:

- It is **generative**, not analytical — the answer is a designed artefact (a flow, a try/fail-cycle map, an audit matrix), not a research conclusion. `engage-forge` is the only engage-family skill that runs without web research.
- It has **multiple genuinely-live design paradigms** (JTBD anchoring, demo-data seeding + progressive disclosure, heuristic-driven audit) that produce structurally different artefacts — so the skill's "comparison-not-merger" synthesis contract is load-bearing here.
- The recommended artefact needs a **named persona's stress test** before adoption, because the dominant failure mode of "looks great in design review" is missing the skeptic-evaluator persona.

**What to look for:**

- All three paths produce **full structured artefacts** (12-step flow / 9-cycle try-fail / 10-row heuristic matrix) — pure-prose paths fail the skill contract.
- Synthesis is a **comparison table**, not a merged artefact. Different artefact types are structurally distinct and cannot be coherently combined; the only sanctioned cross-path move is the **operational graft** in Step 4.
- The **heuristic audit pass is mandatory** — it runs every invocation and surfaces graft opportunities the recommended path didn't think of.
- The **critique pass produces exactly 3 friction points** (not 2, not 4) — forcing persona triage. Each must reference a specific artefact element.
- This skill has **no web research** — design is generative. Citation decay does not apply.

---

## Problem

> Design the first-time-user onboarding flow for a self-hosted developer observability tool (logs + metrics + traces) where the current mean time-to-first-useful-dashboard is approximately three hours, abandonment in the first session exceeds 50%, and the target user is a backend engineer who already knows the tool category but has never used this specific product.

---

## Paradigms explored

| # | Paradigm | Artefact type | One-sentence rationale |
|---|----------|---------------|------------------------|
| 1 | Jobs-to-be-Done onboarding | `flow` | Anchor every step on the user's job — "see what changed when my service degraded" — and the artefact engineers most want to share. |
| 2 | Demo-seed + progressive disclosure | `try-fail-cycle` | The 3h cost is the *empty-panel desert* between install and first real instrumented service; modeling try→fail→retry exposes each cliff to design fixes. |
| 3 | Nielsen-heuristic-driven redesign | `heuristic-matrix` | Treat onboarding as UX-debt — each heuristic violation maps to a concrete onboarding surface contributing to the 3h TTFD or the >50% abandonment. |

---

## Artefacts

### Path 1 — JTBD Onboarding Flow (recommended)

**Paradigm rationale.** JTBD fits because the backend engineer is hiring this tool to answer "what changed when my service degraded" — anchoring onboarding on that job lets every step demonstrate payoff toward a shareable incident-style dashboard rather than tour generic features.

| Step | User action | System response | Notes |
|---|---|---|---|
| 1 | Runs `docker-compose up` from single-file quickstart that bundles app + synthetic 'checkout-service' demo emitter | Starts stack on localhost:3000, prints one URL: *"Open this to see a simulated production incident in progress"* | Single command, single URL. No account, no license. The demo emitter is the JTBD hook — incident is already "happening" on first boot. |
| 2 | Opens URL in browser | Lands directly on a pre-built *'checkout-service — degraded'* dashboard: red latency panel, deploy marker, error log stream already populated | Zero-click first dashboard. User sees the exact artefact they came to build before configuring anything. |
| 3 | Clicks banner: *"This is demo data — see what changed at 14:32"* | Highlights deploy marker, correlates p99 latency spike with trace exemplar + first error log line, renders 3-sentence plain-English root-cause summary | Three pillars (metrics → traces → logs correlation) demonstrated in JTBD context, not as feature tour. |
| 4 | Clicks *"Roll back or investigate?"* decision card | Side-by-side: pre-deploy baseline vs current, with *"Share this view"* button copying URL | Reinforces the job; seeds the social loop — dashboard is shareable from minute one. |
| 5 | Clicks *"Point this at my own service"* (persistent top-right CTA) | Single-pane wizard with three tabs — Logs / Metrics / Traces — each showing copy-pasteable OTel snippet auto-filled with local endpoint | Progressive disclosure. Three pillars surfaced only after the user has felt their payoff. |
| 6 | Pastes OTel snippet into service, redeploys; data flows | Detects new service name, auto-clones demo dashboard, swaps data source to real service, shows *"Your service is live — 1,247 spans received"* toast | Auto-clone is second TTFD collapse. User gets real dashboard without authoring panels. |
| 7 | Reviews auto-generated dashboard for real service | Surfaces *"What looks anomalous?"* card flagging outliers vs first 10-min baseline | Tool keeps answering "what changed" rather than asking user to author alerts. |
| 8 | Clicks *"Share with team"* on live dashboard | Generates read-only signed URL + Slack-ready snippet with headline metric + thumbnail | Original goal closed: useful shareable dashboard. Primary success event. |
| 9 | Returns later, clicks *"Simulate an incident on my service"* | Chaos presets (latency injection, 500s, dependency timeout) scoped to their service with one-click revert | Optional rehearsal. Lets user trust the tool before a real incident. |
| 10 | Dismisses or completes chaos rehearsal | Checklist drawer: *"Add a second service"*, *"Configure alerting"*, *"Set retention"*, *"Invite teammates"* — each with time estimate and skip option | Day-2 setup exposed AFTER value is delivered. Skippable. |
| 11 | Clicks *"Configure alerting"* (or skips) | Pre-fills alert rule derived from anomaly system flagged in step 7, asks only for notification channel | Alert authoring is the historical TTFD killer — pre-filling avoids blank-form cliff. |
| 12 | Closes browser tab | Sends single email/Slack summary: dashboard URL, what was configured, one suggested next step | Re-entry hook via shareable dashboard URL. |

**Rationale.** The strongest design move is collapsing "first useful dashboard" from a setup outcome to a boot-time precondition: the demo incident is already on screen at step 2, so TTFD for the first dashboard approaches zero and TTFD for the user's own dashboard lands at step 6 via auto-cloning. Every step visibly serves the JTBD "see what changed, decide whether to roll back", which is also the artefact engineers most want to share — fusing the activation event and the viral event. **Most contestable assumption:** that backend engineers will accept a synthetic checkout-service demo as credible; if perceived as marketing theatre they will bounce harder than from a blank state. **Tradeoff:** bundling the demo inflates the docker image and adds a "is this safe to run in prod?" question — trading install-footprint and trust-surface for activation speed.

**What would change this artefact:**
- If the primary persona is a platform engineer provisioning org-wide infra rather than a service owner chasing an incident, the demo-data seed becomes noise — flow should start with a multi-tenant capacity-planning view and defer the incident narrative.
- If telemetry must originate from the user's real service for compliance/air-gap reasons (no synthetic data permitted), steps 1–4 collapse and the flow must front-load the OTel snippet with a much stronger "first 60 seconds of your data" payoff card.
- If auto-cloning the demo dashboard onto the user's real service produces low-quality panels because real service shapes vary too much, step 6 must be replaced with a guided 3-question dashboard generator ("what's your SLI? what's your deploy signal? what's your dependency?") to preserve the TTFD win.

### Path 2 — Demo-seed + Try/Fail/Retry Cycle

**Paradigm rationale.** Demo-data seeding eliminates the "empty panel desert" that drives 3h TTFD by collapsing time-to-first-signal to seconds; try-fail-cycle is the right artefact because backend engineers onboard by attempting, failing, and re-attempting — designing the system means anticipating each failure point.

| Attempt | What user tries | Outcome | What happened | Design intervention | Design lesson |
|---:|---|:---:|---|---|---|
| 1 | Runs `docker-compose up` from README on laptop | **fail** | Port 3000 (UI) or 4317 (OTLP gRPC) collides with existing Grafana/Jaeger; compose exits with cryptic *"address already in use"* | Installer preflight probes default ports, auto-remaps collisions to next-available, prints chosen port-map as first stdout line; compose uses `${UI_PORT:-3000}` variables | Port collisions are #1 silent-quit cause on dev laptops; preflight + auto-remap converts 20-min debug into 2-sec banner. |
| 2 | Opens `localhost:3000` in browser expecting a login or setup wizard | **success** | Lands directly on populated *'Demo: shopfront-api'* dashboard showing live RPS, p99 latency, error rate, flame graph — all from bundled demo emitter | Ship compose-bundled demo service (load-generator + instrumented app) that starts alongside the stack; demo dashboard is the default landing page with persistent banner *"You are viewing demo data — connect your service →"* | First paint must show motion. A populated dashboard in <60s proves the product works before the user has earned the right to doubt it. |
| 3 | Clicks into a trace span in the demo flame graph to see what "good" looks like | **success** | Trace detail view opens with correlated logs and metric exemplars pre-linked, demonstrating three-pillar correlation in a single click | Demo traces deliberately include realistic patterns (slow DB call, retried HTTP request, 5xx burst) so the user sees diagnostic value, not just UI | Demo data must be curated to showcase the product's *differentiator*, not just exist; randomized noise teaches nothing. |
| 4 | Clicks *"Connect your service"* banner to instrument their own app | **fail** | Lands on a 12-section docs page covering OTLP, Prometheus scrape, Fluent Bit, Jaeger agent — user doesn't know which path applies and bounces back to demo | Replace docs dump with 4-question wizard: language? deployment? existing instrumentation? signal-to-start-with? Output is copy-pasteable snippet (env vars + 5-line SDK init) targeting already-running OTLP endpoint | Choice paralysis at handoff moment is where demo-to-real gap kills sessions; collapse N paths into one generated snippet. |
| 5 | Pastes generated OTLP env vars + SDK init into Node service and restarts | **fail** | Service runs but no data appears; user doesn't know if SDK is broken, network can't reach collector, or data is arriving but not displayed | Wizard page polls collector's receive-counter for user's `service.name`; shows live *"Waiting for first span from my-service…"* indicator that flips to *"Received! View dashboard →"* the instant data lands | Silent success is indistinguishable from silent failure; explicit pipeline observability during onboarding is non-negotiable. |
| 6 | Service running in container on same docker network but still no data | **fail** | User used `localhost:4317` in SDK config, but from inside container `localhost` is the container itself, not the host running the collector | Wizard detects deployment context (asked in attempt 4) and emits correct endpoint: `localhost:4317` for host, `host.docker.internal:4317` for Docker Desktop, service DNS name for compose-network deployments | Networking context is invisible to user but knowable by wizard; ask once, encode forever. |
| 7 | Data arrives — user clicks *"View dashboard"* and sees service name in dropdown | **success** | Auto-generated *"service overview"* dashboard appears for `my-service`, cloned from demo dashboard template but bound to user's `service.name` label | On first-data-receipt for a new `service.name`, auto-provision a dashboard from demo template with new service substituted; surface toast *"Dashboard created for my-service"* | The demo dashboard isn't disposable — it's the *template* for every service the user instruments. Reuse the artefact users already trust. |
| 8 | Tries to write a custom query in metrics explorer to filter by their HTTP route | **fail** | Doesn't know the query language dialect (PromQL vs LogQL vs product's own); types Datadog-style query, gets parse error | Query bar opens in *"builder mode"* (dropdowns for metric, label, aggregation) with *"show as code"* toggle revealing generated PromQL; error messages on raw queries include *"convert from Datadog/New Relic syntax"* hint | Query-language fluency is the second cliff after instrumentation; builder mode lets users succeed before they learn the syntax. |
| 9 | Wants to dismiss the demo service now that their own is connected | **success** | Persistent *"Demo data is active"* chip in header offers one-click *"Stop demo & remove its data"*; clicking removes demo container and tombstones its series | Demo is a first-class, removable component — never blended invisibly with real data; removal is atomic and visible | The tradeoff for demo-first is the duty to make demo *clearly separable* — confusion between demo and real data destroys trust faster than empty panels. |

**Rationale.** Strongest move: collapsing time-to-first-paint by shipping a bundled demo service so the landing page is a working dashboard, not an empty shell. This converts the cognitive frame from *"did I install it right?"* to *"now how do I get my data in here?"* — a fundamentally easier and more motivating question. Most contestable assumption: that backend engineers will tolerate seeing demo data before their own; some will perceive it as toy-like and bounce. Tradeoff: demo data risks confusion with real data once instrumented, especially in shared dashboards or alerts — paid by making demo a first-class removable component with persistent header chip.

**What would change this artefact:**
- If the target shifted to enterprise k8s operators instead of laptop developers, port-collision and docker-network cycles would be replaced with RBAC, ingress, and Helm-values failure modes.
- If telemetry compliance (PII, data-residency) were a constraint, the demo-data-first paradigm itself would be challenged — seeded data might violate policy in regulated environments.
- If the user persona were less technically competent (e.g., SRE-curious frontend dev), the query-language cycle would expand into 3-4 cycles and the SDK-snippet cycle would need a no-code agent-based alternative.

### Path 3 — Nielsen-10 × Onboarding Element Matrix

**Paradigm rationale.** Nielsen heuristics surface the small, repeated friction events that compound into a 3-hour TTFD; a heuristic × element matrix maps each violation to a concrete onboarding surface so fixes are scoped, not vague UX overhauls.

| Heuristic | Onboarding element | Current friction | Severity | Redesign fix |
|---|---|---|:---:|---|
| 1. Visibility of system status | Post-install landing page before any service is instrumented | User lands on empty Explore/dashboard view with blank panels and no indication whether backend is healthy, ingestion is wired, or what step they are on; identical to a broken install | **critical** | Replace empty state with persistent onboarding rail showing 4-step progress (Backend up → Collector reachable → First signal received → First dashboard pinned), each with live state badges polled every 2s from a `/status` endpoint |
| 2. Match between system and the real world | Agent-configuration wizard (OTLP collector YAML) | Wizard exposes raw OTel terminology (receivers, processors, exporters, pipelines) before the user has shipped a single span; backend engineers know *"send logs from my Go service"* not *"configure an otlphttp exporter on pipeline traces/default"* | major | Front the wizard with a task-language picker (*"I want to ship logs / metrics / traces from [Go\|Python\|Node\|Java\|JVM\|Rust]"*) that generates YAML behind the scenes; show generated YAML in collapsed *"Advanced"* panel for trust |
| 3. User control and freedom | Guided setup checklist | Setup wizard is modal and linear — no way to skip the demo-data tour and jump to *"instrument my real service"*, and no way to back out of a half-configured datasource without leaving an orphan config | major | Make checklist non-modal and reorderable; every step has explicit *"Skip"*, *"Do later"*, *"Undo"* actions; orphan configs auto-quarantined to *"Draft datasources"* drawer with one-click delete |
| 4. Consistency and standards | Per-language agent install pages | Install snippets vary in shape across languages (Go env vars, Python decorator, Node autoinit require, Java `-javaagent` flag) and use different page layouts, forcing re-learning per service | major | Unify install pages on single 3-block template: (1) Install command, (2) Minimal config (env vars only), (3) Verify command that hits `/status` and prints first received signal. Same headings, same copy buttons, same verify step across all languages |
| 5. Error prevention | Collector endpoint / API token entry field | User can paste wrong endpoint (http vs https, missing `/v1/traces` suffix, wrong port) or expired/scope-insufficient token; no validation until they ship traffic and silently see nothing arrive | **critical** | On blur, perform synchronous round-trip handshake against entered endpoint+token; show inline green check + *"Received handshake in 42ms"* or red error with exact failure (DNS, TLS, 401, 404). Block *"Next"* until handshake passes or user explicitly overrides |
| 6. Recognition rather than recall | Query editor (PromQL / LogQL / trace query) on first use | Empty query box assumes user remembers PromQL/LogQL syntax for this specific product's label conventions (`service.name` vs `service_name` vs `job`); backend engineers who know the category still stall here | **critical** | Prepopulate editor with 3 clickable starter queries derived from labels already received (*"Request rate for &lt;their-service&gt;"*, *"Error logs in last 15m for &lt;their-service&gt;"*, *"Slowest 10 traces for &lt;their-service&gt;"*); each chip inserts query AND runs it |
| 7. Flexibility and efficiency of use | Dashboard library / first-dashboard creation flow | Only path to useful dashboard is *"build from scratch panel-by-panel"*; no language/framework-aware starter dashboards, no one-click *"import RED/USE dashboard for my service"* once a service is detected | **critical** | On first detected service, surface *"Recommended dashboards"* card with one-click import of RED (HTTP), USE (runtime), and language-specific (Go GC, JVM heap) dashboards keyed to detected runtime; power users get CLI/API import flag |
| 8. Aesthetic and minimalist design | Post-install navigation sidebar | Full sidebar (Alerts, SLOs, Synthetics, Profiles, Plugins, Admin, Service accounts, etc.) exposed from minute zero, drowning the 3 actions that matter in session 1 (instrument, query, pin) | minor | Default to *"Getting started"* sidebar mode with only Explore, Dashboards, Setup visible; single *"Show all features"* toggle reveals full nav. Mode auto-graduates after first pinned dashboard |
| 9. Help users recognize, diagnose, and recover from errors | Ingestion failure / no-data-received state | When no signals arrive after install, UI shows generic *"No data"* with no diagnosis (DNS? TLS? auth? wrong endpoint? clock skew? dropped at collector?); user falls back to docs + tcpdump | **critical** | Replace *"No data"* with live diagnostic panel: collector reachability, last handshake timestamp, last rejected payload reason (with sample), clock skew vs server, copy-paste curl mirroring agent's request — each with green/red status |
| 10. Help and documentation | Contextual help on agent-config and query-editor screens | Docs open in new tab to generic landing page; user must navigate to language → install → config → verify, losing onboarding context and often landing on docs for a different major version than running backend | major | Embed right-rail help drawer scoped to current step, pinned to running backend version; each drawer surfaces 2–3 docs sections relevant to this exact element, plus *"Copy as support bundle"* button snapshotting config + last error |

**Rationale.** The dominant TTFD driver is the cluster around H1, H5, H6, H7, H9: a backend engineer can install in 10 minutes, but then spends hours bouncing between an empty dashboard (H1), a silently-failing endpoint (H5), an unfamiliar query syntax (H6), no starter dashboards (H7), and an undiagnosable *"No data"* (H9). **Fix H5 and H9 first** — they account for the long tail of the 3-hour mean, because a misconfigured exporter currently fails silently and the user debugs blind. **Most contestable assumption:** that the current product actually lacks starter dashboards and synchronous endpoint validation — these findings rest on assumed-current-state inferred from the 3h TTFD and >50% abandonment, not from inspection of a specific product. Tradeoff: aggressive synchronous validation (H5) adds 200–500ms latency per field and requires the backend to expose a handshake endpoint, increasing attack surface on self-hosted deployments behind strict network policies.

**What would change this artefact:**
- Confirmation of which frictions actually exist in the current product (vs assumed) — a 30-min usability session with 3 backend engineers would re-weight severities and likely collapse 2–3 findings to *"pass"*.
- A known constraint that the self-hosted deployment cannot expose a `/status` or handshake endpoint (air-gapped, strict egress) — would force H1 and H5 fixes to a CLI-based verify command instead of in-UI live checks.
- Evidence that abandonment is concentrated at a specific step (e.g., 70% drop at agent-config) rather than spread across the funnel — would collapse the matrix to a focused 3-heuristic deep-fix instead of a 10-row redesign.

---

## Synthesis (comparison, not merger)

| Path | Paradigm | Artefact | Strengths | Weaknesses | Fit with stated goals |
|---|---|---|---|---|---|
| 1 | JTBD onboarding | flow (12 steps) | Directly addresses TTFD by making first dashboard a boot-time precondition; produces shareable artefact (viral loop); maps each step to user's job; most-actionable | Demo-data credibility risk; bundling inflates docker image | **Strongest — recommended.** Most directly attacks both metrics. TTFD → near-zero for demo, ~6 steps for real data; abandonment short-circuited by immediate value. |
| 2 | Demo-seed + progressive disclosure | try-fail-cycle (9 cycles) | Models real first-session failure modes (port collisions, docker networking, silent-success); each cycle has actionable design intervention | Cycle artefact is diagnostic, not a build-spec; needs translation into actual UI changes | **Strong as feeder, not standalone.** Cycles are the failure-mode inventory Path 1 must survive. |
| 3 | Nielsen-10 redesign matrix | heuristic-matrix (10 findings) | Comprehensive coverage; surfaces 5 critical/major frictions; per-finding fixes are implementable; honest about assumed-current-state | Matrix is audit, not redesign; some findings rest on inferred-not-known state | **Strong as audit input** to Step 4 pass on Path 1. |

**Recommended:** Path 1 (JTBD flow). Path 2 contributes failure-mode inventory; Path 3 contributes heuristic-fix vocabulary. Both feed the operational-graft step.

---

## Heuristic audit (Nielsen-10 × Path 1 flow)

| Heuristic | Artefact element | Severity | Finding | Recommendation |
|---|---|:---:|---|---|
| 1. Visibility of system status | Step 6 (paste OTel snippet, data flows) | major | Between paste and the *"1,247 spans received"* toast, no visible feedback. If data doesn't flow (port collision, wrong endpoint, firewall), user sits at silent wizard with no indication whether collector is reachable, handshake succeeded, or payloads are being rejected. | Add live receive-counter / handshake indicator: *"Waiting for first span from &lt;service&gt;…"* that flips to *"Received!"* or surfaces failure reason on timeout. |
| 2. Match between system and the real world | Step 3 (banner *"see what changed at 14:32"*) | pass | Plain-English root-cause summary, deploy marker, *"Roll back or investigate?"* decision card speak the language of an on-call backend engineer rather than tool-internal jargon. Demo framed as *"simulated production incident"* matches user's mental model. | Maintain; when grafting query-builder, ensure jargon stays opt-in via *"show as code"* toggle. |
| 3. User control and freedom | Step 6 (auto-clone demo dashboard, swap data source) | major | Auto-clone-and-swap is powerful but irreversible from user's POV — no visible way to stop the demo emitter, remove its data, or undo the dashboard mutation once real data is wired in. Cautious evaluator cannot cleanly separate demo from real state. | Surface persistent *"Demo data is active"* affordance with one-click *"Stop demo & remove its data"*; make auto-clone an explicit confirm step. |
| 4. Consistency and standards | Step 5 (single-pane wizard with Logs/Metrics/Traces tabs) | minor | Three-tab OTel wizard follows OpenTelemetry conventions and matches competing tools; backend engineers transfer prior knowledge. Minor risk: signal naming must be identical end-to-end (logs/metrics/traces) — deviation between wizard tabs and Step 7's anomaly-card language would break consistency. | Audit signal terminology across Steps 5, 7, 11; mirror OTel SDK env-var names verbatim in snippets. |
| 5. Error prevention | Step 1 (`docker-compose up` on `localhost:3000`) | major | Port 3000 is one of the most-collided ports on a developer laptop (Rails, Next.js, Grafana). Bind failure at Step 1 detonates the entire flow before the user sees a single pixel of value — the most expensive possible failure point given the >50% abandonment baseline. | Add preflight port probing in compose wrapper that detects collisions and auto-remaps to next free port, printing actual URL after binding. |
| 6. Recognition rather than recall | Step 7 (auto-generated dashboard for real service) | minor | Anomaly card surfaces *"what looks anomalous"* (recognition-friendly), but user not shown catalog of dashboards available for their runtime (Node/Go/Python/JVM) — must recall such templates might exist. RED/USE conventions are industry-standard and should be offered, not remembered. | Add *"Recommended dashboards"* card alongside anomaly card with one-click import of RED/USE/runtime-specific templates detected from incoming span attributes. |
| 7. Flexibility and efficiency of use | Step 7 (anomaly card) and absent query interface | major | Flow is excellent for novice path but offers no escape hatch for engineer who already knows what to ask. No query bar, no PromQL/LogQL surface, no keyboard accelerator. Returning power user must always traverse cards instead of typing query from muscle memory. | Expose query bar accessible via keyboard shortcut from any dashboard, defaulting to builder/dropdown mode with *"show as code"* toggle revealing generated query. |
| 8. Aesthetic and minimalist design | Step 10 (checklist drawer: 4 day-2 setup items) | pass | Day-2 setup correctly deferred until after value delivery (Step 8 share); checklist bounded to four items with skip options. Flow resists the common onboarding sin of stuffing alert config, retention, and team invites into first five minutes. | Maintain; resist scope creep on this drawer in future iterations. |
| 9. Help users recognize, diagnose, and recover from errors | Step 6 (data flows / does not flow) | **critical** | The flow has no diagnostic surface for the highest-failure step. When *"data flows"* does not happen — wrong endpoint, clock skew, rejected payloads, network unreachable — the user has nothing to look at. This is almost certainly a primary contributor to the >50% abandonment rate; the user blames the tool and quits because the tool cannot tell them why nothing arrived. | Add live diagnostic panel: collector reachability, last handshake timestamp, last rejected payload reason with sample, clock skew, copy-paste curl mirroring agent request. |
| 10. Help and documentation | Steps 5–7 (wizard + dashboard, no in-context help) | major | Help is invisible in the flow. No scoped help drawer, no version-pinned docs link, no *"copy as support bundle"* for filing issues. When backend engineer hits friction at Step 5 or Step 7, they must leave the app to search docs that may not match their installed version. | Add right-rail help drawer scoped to current step, pinned to running backend version, with *"Copy as support bundle"* button capturing env + recent diagnostics. |

### Most severe finding

**H9 — critical.** Step 6 (the moment real data is supposed to flow) has no diagnostic surface. When ingestion silently fails (wrong endpoint, clock skew, rejected payloads, network unreachable), the user has nothing to look at and blames the tool. **This is almost certainly a primary driver of the >50% first-session abandonment rate.** Graft Path 3's H9 live diagnostic panel (reachability, handshake timestamp, rejected payload samples, clock skew, copy-paste curl) into the Step 5 wizard, persisting through Step 7.

### Operational graft recommendations

| # | From path | Element | Heuristic | Graft into Path 1 |
|---|-----------|---------|-----------|-------------------|
| 1 | Path 2 (Cycle 1) | Installer preflight probes default ports, auto-remaps collisions | H5 Error prevention | **Step 1** — wrap quickstart in preflight that probes 3000 + 4317/4318, auto-remaps, prints bound URL after success rather than assuming defaults. Eliminates highest-impact pre-value failure. |
| 2 | Path 2 (Cycle 5) | Wizard polls collector receive-counter with *"Waiting for first span…"* indicator that flips to *"Received! View dashboard →"* | H1 Visibility of system status | **New step between 5 and 6** — insert live receive-counter polling every 2s. Removes silent gap between paste and toast. |
| 3 | Path 3 (H9 fix) | Live diagnostic panel: collector reachability, last handshake timestamp, last rejected payload reason, clock skew, copy-paste curl | H9 Error recovery | **Step 5 wizard → persistent through Step 7** — embed diagnostic panel. Converts silent-failure abandonment path into recoverable one. **Highest-leverage graft.** |
| 4 | Path 2 (Cycle 9) | Persistent *"Demo data is active"* chip with one-click *"Stop demo & remove its data"* | H3 User control | **Step 2 → persistent through Step 6** — header chip with stop action. Restores user control over demo/real boundary. |
| 5 | Path 3 (H7 fix) | *"Recommended dashboards"* card with one-click import of RED/USE/runtime-specific dashboards on first detected service | H6 Recognition not recall | **Step 7** — add card alongside anomaly card; templates detected from incoming span attributes, one-click import. |
| 6 | Path 2 (Cycle 8) | Query bar in *"builder mode"* with dropdowns and *"show as code"* toggle revealing PromQL | H7 Flexibility / efficiency | **Step 7 — global keyboard shortcut** — query bar accessible from any dashboard, defaulting to builder mode with code toggle, plus *"convert from Datadog/New Relic syntax"* error hint. |
| 7 | Path 3 (H10 fix) | Right-rail help drawer scoped to current step, version-pinned, with *"Copy as support bundle"* button | H10 Help and documentation | **Step 5 onward (persistent affordance)** — help drawer scoped to current step + version, support-bundle button capturing env + recent diagnostics. |

---

## Critique pass (persona walk)

**Persona — Priya.** Senior backend engineer (8y), prior Datadog + self-hosted Grafana / Prometheus / Loki, evaluating *"Telemetry-X"* for team-replacement decision, 60-min window, skeptical of demo data by default, on corporate VPN with strict-egress policies.

### Friction point 1 — Step 1 (`docker-compose up` from single-file quickstart)

> *"Compose is pulling images and half of them are timing out — corporate DNS is blocking whatever registry they're using, and there's no mention anywhere of which hosts I need to allowlist or whether there's an air-gapped/offline bundle. I'm not opening a ticket with NetSec for an eval. If I can't see the system in 5 minutes I'm bouncing to check Slack, and 'just turn off your VPN' is a non-starter on a corp laptop."*

**Remediation.** Publish an explicit egress allowlist (registry hosts, ports) at the top of the quickstart, and ship a single self-contained tarball (`telemetry-x-offline.tgz`) with all images pre-loaded for VPN/air-gapped evaluators.

### Friction point 2 — Step 2 (lands on pre-built `checkout-service — degraded` dashboard with populated data)

> *"Wait — is this dashboard real or staged? The latency panel, the deploy marker, the error stream all look suspiciously clean. I can't tell what's a product capability versus a hand-crafted screenshot dressed up as a dashboard. I've been burned by vendor demos that fall apart the second you point them at real data. Until I know what's synthetic and what the product actually computed, I can't trust anything I'm about to show my director."*

**Remediation.** Add a persistent *"DEMO MODE"* chrome bar with an inline *"How this was generated"* link showing the synthetic emitter config and which panels are computed live vs pre-seeded. Make the toggle to disable demo mode one click, visible from this screen.

### Friction point 3 — Step 6 (paste OTel snippet, auto-clone dashboard, swap data source)

> *"Our services don't emit OTel yet — we're on Prometheus scrape + Loki Promtail + a homegrown trace shim. The wizard assumes I can just 'paste a snippet and redeploy,' but redeploying a real service for a Wednesday-afternoon eval isn't happening, and there's no path shown for existing Prom/Loki sources. If the only on-ramp is 'rewrite your instrumentation,' this isn't a replacement — it's a migration project, and that changes my recommendation entirely."*

**Remediation.** Add a fourth wizard tab *"Point at existing sources"* with first-class Prometheus `remote_read` and Loki/Promtail ingestion paths, so evaluators can connect their live stack read-only without touching service code.

### Session outcome

Priya gets the stack running around minute 20 after manually proxying image pulls, spends 15 minutes poking the demo with persistent unease about what's real, and **never reaches Step 6 with her own service inside the window**. She writes a **MIXED recommendation**: *"genuinely impressive correlation UX and time-to-first-dashboard, but onboarding assumes greenfield OTel and ignores enterprise egress — recommend a deeper POC only if vendor confirms Prom/Loki ingestion."*

---

## What would change this recommendation

1. **Persona shift to platform engineer / org-wide infra setup.** Path 1's JTBD anchor on "see what changed in my service" is wrong for a platform engineer provisioning observability infrastructure for many teams. The recommended path would shift toward Path 3's heuristic matrix as the primary artefact (with capacity, multi-tenancy, and RBAC heuristics added) and Path 1 would become a secondary artefact for the *team owner's* downstream onboarding.
2. **Air-gapped / strict-egress constraint declared up front.** Priya's friction #1 generalises: if a meaningful share of the target evaluator population is on corporate VPN with restrictive egress, Path 1's docker-image-pull dependency is a deal-breaker that no UX graft can fix. The recommended path would add an offline-tarball variant as a *first-class* install path, not a footnote — and Path 3's H1/H5 fixes would shift toward CLI-based verify (because in-UI live checks can't reach a `/status` endpoint that isn't deployed).
3. **Audit finding H9 not implementable on this stack.** If the product's collector architecture genuinely cannot expose a reachability + rejected-payload-sample API (e.g., stateless protocol-level limitations, security policy forbidding payload echo), the critical graft #3 fails. The recommended path would then need a CLI-based agent self-diagnostic that the user runs from inside their service network — a meaningful design change, not a graft, because it moves the diagnostic surface from the UI into the user's terminal.

---

*Generated by `engage-forge` skill on 2026-05-17. 3 design paths + heuristic audit (10 findings, 7 graft recommendations) + persona critique (3 friction points). No web research (skill is generative). See [`Docs/case-studies/README.md`](../README.md) for the case-studies-vs-examples contract.*
