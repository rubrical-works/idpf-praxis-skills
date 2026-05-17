# engage-forge — Design Paradigm Palette

This document explains the optional design-paradigm palette under `resources/` and when to reach for each entry. **The palette is inspiration-only — it is NOT a routing substrate.** Engage-forge's primary agent picks paradigms ad-hoc; it MAY open the palette to pull a single entry into a path brief, but it does not load the full catalog and does not route through `match-signals.js` (see SKILL.md → Paradigm palette (optional, not routed) and `tests/skills/engage-forge/paradigm-palette-not-routed.test.js`).

The catalog's purpose is to expand the named-paradigm vocabulary, not to drive path selection mechanically. Design problems are too heterogeneous for keyword-driven routing to add value over a thoughtfully-named ad-hoc path.

---

## Paradigms (`resources/paradigms.json`)

| Paradigm | When to reach for it | Preferred artefact types |
|---|---|---|
| **Jobs-to-be-done (JTBD)** | The user's motivation is well-known but the flow doesn't visibly serve it. Onboarding flows, retention flows, feature prioritization. | `flow`, `kano-grid`, `journey-map` |
| **Atomic design** | The system needs component-level reuse documentation; redesign should fit the existing component library. | `ia-tree` |
| **Nielsen-heuristic-driven redesign** | An existing surface is causing friction and you need a structured audit-then-redesign rather than from-scratch design. | `heuristic-matrix` |
| **Contextual inquiry** | The redesign needs to be anchored on observed (or hypothesized) field behavior — emotional state, environmental context, what users actually do vs. what designers expect them to do. | `journey-map`, `try-fail-cycle` |
| **Service-design blueprinting** | The user-facing experience depends on backstage systems (support handoffs, fulfillment workflows, automation triggers); the redesign needs to make the system-of-systems visible. | `journey-map`, `flow` |
| **Kano feature prioritization** | You have a long feature list and need to classify which are basics (must-have), performance (linear satisfaction), or delights (unexpected) before designing — or before cutting. | `kano-grid` |
| **Design-system-first** | The surface lives inside an existing component system; deviations should be explicit exceptions. | `flow`, `ia-tree` |

---

## Structures (`resources/structures.json`)

Structural patterns that combine with paradigms to produce concrete artefacts:

- **Linear flow** — sequential steps; default for onboarding / checkout.
- **Branched flow** — steps with decision points; for state-dependent flows.
- **Hub-and-spoke IA** — primary landing + spokes; dashboards.
- **Wizard structure** — multi-step linear with progress; complex but bounded tasks.
- **Progressive disclosure** — reveal complexity on demand; default-simple surfaces.
- **Stage table (journey)** — time-ordered stages × per-stage dimensions; journey maps.
- **Decision matrix** — options × criteria; trade-off-heavy decisions.
- **Card grid** — items × attributes; browse-and-pick surfaces.

---

## Strategies (`resources/strategies.json`)

Top-level design constraints that anchor the rest of the design:

- **Mobile-first** — smallest viewport sets the constraint.
- **Accessibility-first** — accessibility requirements set the constraint.
- **Performance-budget-first** — TTI / bundle size sets the constraint.
- **Content-first** — actual content shapes drive IA + layout.
- **Task-completion-first** — task completion rate over secondary metrics.
- **Error-recovery-first** — failure modes + recovery paths anchor the design.

---

## How to use the palette

1. **Default: ad-hoc.** Name your N paths in one sentence each ("Path A: JTBD onboarding flow; Path B: atomic-design IA decomposition; Path C: Kano feature classification"). The path name IS the design move.
2. **When a palette entry sharpens the path:** open `paradigms.json` (or `structures.json` / `strategies.json`) and pull the entry's description into the path brief. Don't load the full catalog.
3. **Never route through `match-signals.js`.** Design problems are too heterogeneous for keyword-driven routing; the routing layer in `engage-prism` is intentionally not replicated here.

The artefact type matters more than the paradigm name. The skill ships six artefact types (flow, ia-tree, heuristic-matrix, journey-map, try-fail-cycle, kano-grid). Pick the type that actually solves the problem; the paradigm name labels the design rationale.

---

## Why palette, not routing

`engage-prism` routes via `match-signals.js` because business/market/finance questions have stable keyword-to-paradigm mappings ("equity valuation" → multiple-comparable, DCF, sum-of-parts; etc.). Design problems don't have that stability — "redesign mobile onboarding" can credibly map to any of: JTBD flow, atomic IA, contextual journey, Kano prioritization, Nielsen audit. The right paradigm depends on the design constraint, not the keyword.

The palette is the named-paradigm vocabulary expanded for primary-agent reference. Routing through it would impose a false determinism on a domain that doesn't have it.
