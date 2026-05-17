# Skills Maintenance Process
**Version:** v0.15.0

**Purpose:** Define the process for reviewing, updating, versioning, and releasing skills in the IDPF Framework.

**Related Documents:**
- `Reference/Skill-Packaging-Guide.md` - How to create and package skills
- `Assistant/Anti-Hallucination-Rules-for-Skill-Creation.md` - Accuracy rules for skill creation
- `PREPARE_RELEASE.md` (Phase 2a) - Release validation that references this document

---

## Skill Registry

| Skill | Version | Last Updated | Status |
|-------|---------|--------------|--------|
| anti-pattern-analysis | 1.0.0 | 2026-04-01 | Active |
| api-versioning | 1.0.0 | 2026-03-17 | Active |
| astro-development | 1.0.0 | 2026-03-17 | Active |
| bdd-writing | 1.0.0 | 2026-04-02 | Active |
| beginner-testing | 1.0.0 | 2026-03-17 | Active |
| ci-cd-pipeline-design | 1.0.0 | 2026-03-17 | Active |
| code-path-discovery | 1.0.0 | 2026-03-17 | Active |
| codebase-analysis | 1.0.0 | 2026-04-02 | Active |
| command-spec-audit | 1.0.0 | 2026-04-02 | Active |
| common-errors | 1.0.0 | 2026-03-17 | Active |
| debate-prism | 1.0.1 | 2026-05-16 | Active |
| digitalocean-app-setup | 2.0.0 | 2026-04-25 | Active |
| drawio-generation | 1.0.0 | 2026-03-17 | Active |
| electron-cross-build | 1.0.0 | 2026-05-17 | Active |
| electron-development | 1.0.0 | 2026-05-17 | Active |
| engage-apothecary | 1.0.0 | 2026-05-16 | Active |
| engage-chorus | 1.0.0 | 2026-05-16 | Active |
| engage-codex | 1.0.0 | 2026-05-16 | Active |
| engage-crucible | 1.0.0 | 2026-05-16 | Active |
| engage-exocortex | 2.0.1 | 2026-05-16 | Active |
| engage-forge | 1.0.0 | 2026-05-16 | Active |
| engage-lexicon | 1.0.0 | 2026-05-16 | Active |
| engage-prism | 1.0.1 | 2026-05-17 | Active |
| error-handling-patterns | 1.0.0 | 2026-03-17 | Active |
| flask-setup | 2.0.0 | 2026-04-25 | Active |
| i18n-setup | 2.0.0 | 2026-04-25 | Active |
| install-node | 2.0.0 | 2026-04-25 | Active |
| json-validator | 1.0.1 | 2026-05-15 | Active |
| migration-patterns | 1.0.0 | 2026-03-17 | Active |
| mutation-testing | 1.0.0 | 2026-03-17 | Active |
| observability-setup | 1.0.0 | 2026-03-17 | Active |
| playwright-explorer | 1.0.0 | 2026-03-17 | Active |
| playwright-setup | 2.0.0 | 2026-04-25 | Active |
| postgresql-integration | 2.0.0 | 2026-04-25 | Active |
| privacy-compliance | 1.0.0 | 2026-03-17 | Active |
| property-based-testing | 1.0.0 | 2026-03-17 | Active |
| railway-project-setup | 2.0.0 | 2026-04-25 | Active |
| render-project-setup | 2.0.0 | 2026-04-25 | Active |
| resilience-patterns | 1.0.0 | 2026-04-01 | Active |
| responsibility-gate | 1.0.0 | 2026-05-17 | Active |
| seo-optimization | 1.0.0 | 2026-04-01 | Active |
| sinatra-setup | 2.0.0 | 2026-04-25 | Active |
| spar-exocortex | 1.0.0 | 2026-05-16 | Active |
| sqlite-integration | 2.0.0 | 2026-04-25 | Active |
| tdd-failure-recovery | 1.0.0 | 2026-04-02 | Active |
| tdd-green-phase | 1.0.0 | 2026-04-01 | Active |
| tdd-process | 1.0.0 | 2026-04-01 | Active |
| tdd-red-phase | 1.0.0 | 2026-04-01 | Active |
| tdd-refactor-coverage-audit | 1.0.1 | 2026-05-15 | Active |
| tdd-refactor-phase | 1.0.0 | 2026-04-01 | Active |
| test-scaffold | 1.0.0 | 2026-04-01 | Active |
| test-writing-patterns | 1.0.0 | 2026-04-01 | Active |
| vercel-project-setup | 2.0.0 | 2026-04-25 | Active |

**Status Values:** Active, Deprecated, Archived

---

## Skill Versioning Policy

Skills use independent semantic versioning, decoupled from the framework version.

| Version Type | When to Bump | Examples |
|-------------|--------------|----------|
| **Patch** (1.0.x) | Typo fixes, clarifications, link updates. No functional changes. | 1.0.0 → 1.0.1 |
| **Minor** (1.x.0) | New sections, examples, expanded coverage. Backward compatible. | 1.0.1 → 1.1.0 |
| **Major** (x.0.0) | Significant restructuring, breaking changes to skill interface. | 1.2.0 → 2.0.0 |

**Version lives in:** `SKILL.md` frontmatter (`version` field).
**Compatibility range:** `frameworkCompatibility` in SKILL.md (e.g., `>=0.60.0`).
**Source of truth:** `skill-registry.json` aggregates all skill versions for downstream tools.

---

## Framework-Skill Dependency Matrix

| Framework | Required Skills |
|-----------|----------------|
| IDPF-Agile | tdd-red-phase, tdd-green-phase, tdd-refactor-phase, tdd-failure-recovery, test-writing-patterns |
| IDPF-Vibe (vibe-newbie) | flask-setup, sinatra-setup, common-errors, sqlite-integration, beginner-testing |
| IDPF-Vibe (other variants) | (none currently) |

**Standalone Skills (not framework-specific):**
- anti-pattern-analysis - Code review and technical debt detection
- api-versioning - API versioning strategies and deprecation workflows
- bdd-writing - BDD specification writing
- ci-cd-pipeline-design - CI/CD pipeline architecture and security
- code-path-discovery - Scan source files for behavioral paths in 6-category format
- codebase-analysis - Analyze codebases for structure, tech stack, and patterns
- electron-cross-build - Cross-platform Electron builds for Windows, macOS, and Linux
- electron-development - Electron app development with Vite, Playwright, Windows considerations
- error-handling-patterns - Error hierarchy and API error responses
- i18n-setup - Internationalization setup and locale management
- migration-patterns - Database schema versioning and rollback procedures
- mutation-testing - Mutation testing operators and score interpretation
- observability-setup - Application observability with logging, metrics, and tracing
- playwright-explorer - Interactive Playwright browser exploration and DOM inspection
- playwright-setup - Playwright installation verification and CI configuration
- postgresql-integration - PostgreSQL connection setup and query patterns
- privacy-compliance - Privacy compliance patterns for consent, cookies, and regulations
- property-based-testing - Property-based testing patterns and shrinking
- seo-optimization - SEO best practices for web project discoverability

**Deployment Platform Skills:**
- digitalocean-app-setup - DigitalOcean App Platform deployment with review apps
- railway-project-setup - Railway deployment with Nixpacks and preview environments
- render-project-setup - Render deployment with Blueprints and preview environments
- vercel-project-setup - Vercel deployment with preview deployments and edge functions

**Update this matrix when skills or framework dependencies change.**

---

## Review Schedule

**Frequency:** Quarterly (every 3 months)

**Review Months:** March, June, September, December

**Trigger:** Manual review or when significant changes occur in:
- Underlying technology (language, framework, library updates)
- Best practices (industry standards evolve)
- User feedback (issues reported)

---

## Review Checklist

When reviewing a skill, verify the following:

### Content Accuracy
- [ ] All code examples compile/run correctly
- [ ] Referenced tools and libraries still exist
- [ ] Version numbers in examples are current
- [ ] Best practices are still current

### Links and References
- [ ] All external links are valid
- [ ] Documentation references are current
- [ ] Related skills are correctly referenced

### Completeness
- [ ] Common use cases are covered
- [ ] Error scenarios are documented
- [ ] Troubleshooting section is helpful

### Quality
- [ ] Instructions are clear and actionable
- [ ] Examples match the target audience level
- [ ] No outdated or deprecated patterns

---

## Skill File Structure

Every skill MUST have:

```
Skills/[skill-name]/
├── SKILL.md          # Main skill documentation (REQUIRED)
├── LICENSE.txt       # License file (REQUIRED)
└── resources/        # Supporting files (OPTIONAL)
    └── *.md, *.json, etc.
```

### Shared scripts (build-time inlining)

A skill may declare helper scripts that live authoritatively in
`scripts/skills-shared/` (project-owned, at the repo root) and get copied
into the skill's `scripts/` directory at test-time and package-time. The
mechanism keeps the source repo DRY while each shipped skill stays
self-contained — end users never see the shared lib.

**Why `scripts/skills-shared/` and not `.claude/scripts/shared/lib/`?**
v0.90 of the IDPF framework symlinked `.claude/scripts/shared/` to the
hub installation, which does not provide these project-specific scripts.
The shared source was relocated out of framework territory in #225 to
prevent the hub upgrade from erasing it. Design rationale:
[Construction/Design-Decisions/2026-04-22-shared-scripts-relocated-post-v0.90.md].

**To consume a shared script:**

1. Add a `sharedScripts:` frontmatter entry to the skill's SKILL.md listing
   the filenames to inline:

   ```yaml
   sharedScripts: [match-signals.js, match-signals-input-schema.json]
   ```

2. Do not commit the inlined files. They are gitignored as build artifacts.
   `.claude/scripts/framework/inline-shared-scripts.js` regenerates them on
   each test and package run.

3. If the shared script reads a per-skill config from an adjacent JSON file
   (e.g. `match-signals-config.json` next to `match-signals.js`), commit
   that config — it's source, not an artifact.

**How inlining runs:**

- Jest `globalSetup` (`tests/jest-global-setup.js`) runs the inliner before
  the suite so tests that spawn `Skills/<skill>/scripts/<shared>.js`
  always find an up-to-date copy.
- `.claude/scripts/framework/build-skill-packages.js` runs the inliner
  before the packaging walk so every zip contains the current shared
  source.

**Drift protection:**

`tests/skills/shared-script-inlining.test.js` asserts each consumer's
inlined file is byte-identical to the shared source. A missed inliner run
(or an orphan edit to a build artifact) fails CI.

**Adding a new shared script:**

1. Add the file to `scripts/skills-shared/`.
2. Commit the file (the `scripts/skills-shared/` directory is tracked
   normally — no negation rule required).
3. Declare any skills that consume it by adding `sharedScripts:` entries
   to their SKILL.md.

Related: issue #209 (initial rollout to `engage-prism` and
`engage-exocortex`), issue #212 (fallback-allowlist adoption for
`engage-*` siblings), issue #225 (relocation out of framework territory
post-v0.90 hub upgrade).

### SKILL.md Header Format

```markdown
# Skill: [skill-name]

**Version:** X.Y.Z
**Category:** [TDD | BDD | Setup | Integration | Analysis]

## Purpose
[Brief description]
```

---

## Update Workflow

### 1. Patch Updates (1.0.x)
- Typo fixes, clarifications, link updates
- No functional changes to guidance

```bash
# Update SKILL.md content
# Bump version: 1.0.0 → 1.0.1
# Update lastUpdated date
# Re-package skill
```

### 2. Minor Updates (1.x.0)
- New sections or examples added
- Expanded coverage of existing topics

```bash
# Update SKILL.md content
# Bump version: 1.0.x → 1.1.0
# Update lastUpdated date
# Update registry in MAINTENANCE.md
# Re-package skill
```

### 3. Major Updates (x.0.0)
- Significant restructuring
- Breaking changes to skill interface
- New resource files added

```bash
# Update SKILL.md content
# Bump version: 1.x.x → 2.0.0
# Update lastUpdated date and frameworkCompatibility if needed
# Update registry in MAINTENANCE.md
# Re-package skill
```

---

## Packaging Skills

### Source Files

**IMPORTANT:** Skill packages are built from **minimized sources** in `.min-mirror/Skills/`, NOT from the source `Skills/` directories.

| Content | Source Location |
|---------|-----------------|
| SKILL.md | `.min-mirror/Skills/[skill-name]/SKILL.md` |
| LICENSE.txt | `Skills/[skill-name]/LICENSE.txt` (not minimized) |
| resources/ | `.min-mirror/Skills/[skill-name]/resources/` |

### Package Command

```powershell
# CRITICAL: Run from repository root
cd "E:\Projects\idpf-praxis"

# Windows with 7-Zip (RECOMMENDED):
# Package from .min-mirror sources
"C:\Program Files\7-Zip\7z.exe" a -tzip "Skills\Packaged\skill-name.zip" ".\.min-mirror\Skills\skill-name\SKILL.md" ".\Skills\skill-name\LICENSE.txt" ".\.min-mirror\Skills\skill-name\resources"

# Unix (from repository root):
zip -j Skills/Packaged/skill-name.zip .min-mirror/Skills/skill-name/SKILL.md Skills/skill-name/LICENSE.txt && \
zip -r Skills/Packaged/skill-name.zip .min-mirror/Skills/skill-name/resources -x "*.md"
```

### Package Validation

```bash
# Verify zip contents (Unix)
for zip in Skills/Packaged/*.zip; do echo "=== $zip ==="; unzip -l "$zip"; done

# Windows PowerShell
Get-ChildItem Skills/Packaged/*.zip | ForEach-Object { Write-Host "=== $($_.Name) ==="; & 7z l $_.FullName }
```

**Package must contain:**
- SKILL.md (minimized, with valid YAML frontmatter)
- LICENSE.txt
- resources/ (if applicable, minimized)

**Package must NOT contain:**
- Non-minimized versions of SKILL.md

---

## Pre-Release Checklist

Before framework release, verify:

### 1. Skill Inventory Audit
- [ ] List all skill directories in `Skills/`
- [ ] List all minimized skill directories in `.min-mirror/Skills/`
- [ ] List all `.zip` files in `Skills/Packaged/`
- [ ] Verify 1:1 match between source directories and `.zip` files
- [ ] Verify minimized sources exist for all skills
- [ ] Identify any new skills added since last release
- [ ] Identify any deprecated/removed skills

**Audit Commands:**

```bash
# List skill directories (Unix)
ls -d Skills/*/

# List minimized skill directories
ls -d .min-mirror/Skills/*/

# List skill zip files
ls Skills/Packaged/*.zip

# Windows PowerShell
Get-ChildItem -Directory Skills
Get-ChildItem -Directory .min-mirror/Skills
Get-ChildItem Skills/Packaged/*.zip
```

### 2. Package Validation
For each skill, verify:
- [ ] `.min-mirror/Skills/[skill]/SKILL.md` exists and is minimized
- [ ] `SKILL.md` has valid YAML frontmatter (`name`, `description`)
- [ ] `Skills/[skill]/LICENSE.txt` exists and is complete
- [ ] `resources/` directory contains all referenced files (in `.min-mirror/`)
- [ ] `.zip` built from `.min-mirror/` sources (NOT from `Skills/` directly)

### 3. Install Script Synchronization
For `install.js`, verify:
- [ ] Skill list matches inventory
- [ ] Framework mappings match dependency matrix above
- [ ] Extraction paths correct: `.claude/skills/[skill-name]/`
- [ ] New skills included in framework mappings
- [ ] Removed skills cleaned from framework mappings

**Verification Location:**

| Script | Mapping Location |
|--------|-----------------|
| `install/lib/constants.js` | `FRAMEWORK_SKILLS` and `VIBE_VARIANT_SKILLS` objects |

### 4. Cross-Reference Validation
- [ ] `Framework-Overview.md` skill count matches registry count
- [ ] `Framework-Overview.md` skill descriptions match `SKILL.md` content
- [ ] No orphaned skills (in directory but not mapped)
- [ ] No missing skills (referenced but `.zip` missing)

---

## Creating New Skills

1. Copy template structure from existing skill
2. Create SKILL.md with required header
3. Add LICENSE.txt
4. Add to registry in this file
5. Add to dependency matrix if framework-specific
6. Package and add to Skills/Packaged/
7. Update install scripts if framework-specific
8. Update Framework-Overview.md

---

## Deprecation Process

When a skill becomes obsolete:

1. **Mark as Deprecated** in registry (Status: Deprecated)
2. **Add deprecation notice** to top of SKILL.md
3. **Remove from install script mappings** in `install/lib/constants.js`
4. **Update dependency matrix** in this file
5. **Keep for 2 review cycles** (6 months)
6. **Archive** - Move to Skills/Archived/ directory
7. **Remove from Packaged/** - Delete zip file
8. **Update Framework-Overview.md** to remove references
9. **Document removal** in CHANGELOG.md

---

## Troubleshooting

### Skill Not Deploying

1. Check `.zip` file exists in `Skills/Packaged/` directory
2. Verify skill name matches exactly (case-sensitive on Unix)
3. Check extraction tool available (unzip on Unix, PowerShell on Windows)
4. Verify `SKILL.md` exists in `.zip` root

### Minimization Issues

1. Verify `.min-mirror/Skills/[skill]/SKILL.md` exists
2. Ensure minimized file retains YAML frontmatter
3. Check that `.zip` was built from `.min-mirror/` not `Skills/` source
4. Re-run minimization process if sources are out of sync

### Skill Deployed But Not Recognized

1. Verify `SKILL.md` has valid YAML frontmatter
2. Check `name` field matches directory name
3. Ensure `description` field is present and under 1024 characters
4. Restart Claude Code session after deployment

### Framework-Skill Mismatch

1. Compare `install/lib/constants.js` mappings with dependency matrix above
2. Verify no typos in skill names

---

## Cooperative Refraction Patterns — When to Pick Which

The `/engage-*` cooperative family currently has three pattern variants. All share parallel-paths-then-synthesis; they differ on **output shape** and **quality gates**.

- **`/engage-prism`** — for **business / market / finance** analytical questions. Output is **narrative recommendation** with live web research and schema-conformant citations. Quality gates: citation validation + recency gate. Synthesis may hybridize (graft framing + evidence base across paths).
- **`/engage-exocortex`** — for **code / algorithm / IT-architecture** questions. Output is **structured analytical walkthrough** with optional execution-backed validation for algorithmic problems. Quality gates: optional operational scoring, complexity-class anti-overlap. Synthesis may hybridize along operational axes.
- **`/engage-forge`** — for **product / UX design** questions. Output is **structured design artefacts** (flow, IA tree, heuristic-matrix, journey-map, try-fail-cycle, kano-grid) plus a synthesis **comparison table** (NOT merger). Quality gates: mandatory heuristic audit pass + persona-driven critique pass. Synthesis is comparison-only; the operational-graft mechanism in Step 4 (heuristic audit) is the only sanctioned cross-path combination, and it produces a structural-element transplant — not a merged artefact.

### Refraction patterns at a glance

| Question shape | Use | Output shape | Distinguishing gate |
|---|---|---|---|
| "What are the angles on X?" (business / finance / marketing, open-ended) | `/engage-prism` | Narrative recommendation + citations | Citation recency gate + return-side fabrication-risk check |
| "What are the approaches to problem Y?" (code / algorithm / architecture, open-ended) | `/engage-exocortex` | Analytical walkthrough; optional execution | Operational scoring (default-on for architecture); complexity-class anti-overlap |
| "Design or redesign X" / "Audit the UX of Y" / "Compare design approaches" (product / UX, open-ended) | `/engage-forge` | Structured design artefacts + comparison table | Heuristic audit pass + persona critique pass (both mandatory; exactly 3 friction points) |

`engage-forge`'s distinctive contribution to the family is the **artefact-first contract**: every path emits a structured artefact (not a prose summary), and pure-prose paths fail validation. The two mandatory quality gates (audit + critique) are also distinctive — neither sibling has both as hard contracts. The paradigm catalog in `Skills/engage-forge/resources/` is retained as an **optional inspiration palette**, NOT a routing substrate; `match-signals.js` is never consumed by this skill (the engage-prism / engage-exocortex routing-by-paradigm pattern doesn't fit design problems' heterogeneity).

---

## Artefact-First Refraction Patterns — When to Pick Which

`engage-codex` is the **narrative sibling** of `engage-forge` — same artefact-first refraction base pattern, different domain and critique shape. Both produce structured artefacts (not prose summaries), both apply synthesis-as-comparison (not merger), both gate on a mandatory critique pass after synthesis. They differ on which artefact types they produce and which critique categories the critique pass uses.

- **`/engage-codex`** — for **narrative / screenplay / long-form structure** questions (#206). Output is **structured story artefacts** (beat-sheet, scene-outline, character-arc-grid, thematic-resonance-map, try-fail-cycle) plus a synthesis **comparison table** (NOT merger). Quality gate: mandatory **narrative critique pass** with four required categories — pacing valleys, unset-up payoffs, character-motivation gaps, unsupported tonal shifts — applied to **every** path's artefact (not just the recommendation, in contrast to forge). Offline-only by construction.

### Codex vs forge — selection guide

| Question shape | Use | Output shape | Distinguishing move |
|---|---|---|---|
| "Beat out this story" / "Outline this script" / "Compare three-act vs Kishōtenketsu for this premise" (narrative / screenplay / novel / short story / TV pilot / game) | `/engage-codex` | Structured story artefacts + comparison table | Narrative critique pass covering 4 categories on every path; offline-only; no heuristic-audit step; no operational-graft |
| "Design or redesign X" / "Audit the UX of Y" / "Compare design approaches" (product / UX) | `/engage-forge` | Structured UX artefacts + comparison table | Heuristic audit pass (Nielsen-10 / WCAG-AA / custom) + persona-driven critique pass (exactly 3 friction points) on the recommendation |

**Rule of thumb:** Use codex for story structure; use forge for UX artefacts. The line is **what the artefact is for** — a story to be read or watched (codex) vs. a product surface to be used (forge). The schemas differ along that line: codex artefacts encode beats / scenes / character arcs / motifs; forge artefacts encode flows / IA trees / journey maps / heuristic matrices.

### Codex's distinctive contributions to the family

- **No operational-graft mechanism.** Forge allows grafting a structural element from a non-winning path onto the recommendation when the non-winning path scores higher on a specific heuristic. Codex deliberately omits this — narrative paradigms (three-act, Kishōtenketsu, hero's journey, Save-the-Cat, Freytag, Harmon, Aristotelian) are **not commensurable along a single structural axis**, so cross-paradigm element transplants destroy each paradigm's internal rhythm. Three-act's "midpoint reversal" and Kishōtenketsu's `ten` (re-framing twist) are not the same beat re-named; grafting one onto the other produces an outline whose internal structural meaning doesn't hold.
- **No heuristic-audit step.** Forge runs a Nielsen-10 / WCAG-AA audit before its critique pass. Codex deliberately omits the audit — **narrative critique IS the audit** for narrative work; there is no Nielsen-equivalent checklist for story structure. The four critique categories (pacing valleys, unset-up payoffs, character-motivation gaps, unsupported tonal shifts) cover the same ground as forge's audit+critique combined.
- **Critique runs on every path, not just the recommendation.** Forge's persona critique walks the recommended artefact only. Codex's narrative critique walks **all N path artefacts** — because users picking a paradigm commit to a structural shape, and they need to see the structural weaknesses of each option before committing. "Clean" findings on a category are useful evidence too — they show which paradigm handles that category well for the brief at hand.
- **Auditable absence in every category.** The critique-output schema enforces `{ findings: [...] }` (minItems=1) OR explicit `{ clean: true }` per category, per path. Silent omission is rejected. This is the engage-chorus "auditable absence" discipline applied to narrative — the consumer must be able to distinguish "the critique found nothing here" from "the critique skipped this category."
- **Offline-only by construction.** No `WebFetch` / `WebSearch` invocation, no citation discipline, no `attemptedCalls` contract. Narrative work is generative; the artefact is the output, not the citation set.
- **No paradigm-as-routing.** Like forge and crucible, the paradigm catalog (`paradigms.json`, `structures.json`, `strategies.json`) is retained as **optional inspiration palette**, NOT a routing substrate. `match-signals.js` is never consumed.

---

## Hybrid Pattern Skills — When to Pick Which

Some skills combine moves from multiple sibling patterns. `engage-crucible` is the first hybrid-pattern skill — it pulls structural moves from three siblings and adds a distinctive Bayesian-synthesis contribution.

- **`/engage-crucible`** — for **scientific-research / hypothesis-generation** questions (#203). Refracts a research question into N competing hypotheses (cooperative refraction from `/engage-prism`), produces a structured experimental-design artefact per hypothesis (artefact-first from `/engage-forge` #204), spawns a paired falsification-attack subagent per hypothesis proposing the cheapest discriminating experiment (constructive-attack mechanic from `/spar-exocortex` #216), and synthesizes a Bayesian prior-update landscape that identifies the highest-information-gain-per-cost crucible experiment plus a research roadmap. Mandatory falsification gate on every hypothesis (declared observation that would disprove it); evidence-tier-weighted citations (systematic-review > RCT > cohort > observational > expert > anecdote); `--offline` is a first-class mode (no `attemptedCalls` violations — the engage-prism return-side fabrication-risk check does not apply).

### Hypothesis-research vs code-research vs design-research at a glance

| Question shape | Use | Distinguishing move |
|---|---|---|
| "Why does X happen / what experiment would discriminate hypothesis A from B?" (scientific research, hypothesis-driven) | `/engage-crucible` | Falsification gate + Bayesian prior-update synthesis (crucible experiment + research roadmap, NOT winner-picking) |
| "What's the right algorithm for problem X?" (code / algorithm, cooperative exploration) | `/engage-exocortex` | Operational scoring + execution-backed validation for algorithmic paths (code-with-runtime-validation) |
| "Is this baseline implementation correct / what breaks it?" (code / algorithm, adversarial) | `/spar-exocortex` | Failing-input attack + execution-backed adversarial pressure (code-with-adversarial-pressure) |
| "How should we redesign this UX surface?" (product / UX) | `/engage-forge` | Artefact-first contract + heuristic audit + persona critique |

`engage-crucible`'s distinctive contribution is the **Bayesian prior-update synthesis**: synthesis output replaces winner-picking with a posterior landscape across the proposed crucial experiments, identifies the experiment with the highest information-gain-per-cost, produces an ordered research roadmap with conditional-next-steps decision points, and records the learning objective (Bayesian or research-design lesson). The falsification gate (mandatory `falsificationCondition` per hypothesis) and the evidence-tier-weighted citation schema are also distinctive — they encode Popperian discipline at the brief level. The paradigm catalog in `Skills/engage-crucible/resources/` is retained as an **optional inspiration palette**, NOT a routing substrate; `match-signals.js` is never consumed by this skill.

---

## N-Party Steel-Man Skills — When to Pick Which

Some negotiations and mediations are structurally multilateral (3+ parties at the table). Cooperative refraction is wrong because paths are stakeholder roles, not analytical lenses; bilateral debate is wrong because there are more than two sides; propose-attack-measure is wrong because there is no measurement layer. `engage-chorus` is the skill for these — N-party steel-man with a named mediator.

- **`/engage-chorus`** — for **multi-stakeholder negotiation, conflict resolution, decision mediation** (#207). Refracts one situation into N stakeholder-advocate paths (one per party — 2-6 typical), each producing a structured brief (interests, stated positions, BATNA, reservation point, ≥2 tradeable concessions, named coalition signals). A **steel-man gate** classifies each brief as `strong | weak | inadequate` and re-dispatches weak/inadequate briefs once; persistent failure tags `steelMan="weak"` and the mediator deprioritizes. A **named mediator subagent** then produces a structured **landscape**: ZOPA (or explicit "none" with structural reason), trade frontier (concrete `giveUp` × `inExchangeFor` pairs), settlement zones (ranked, with endorsement structure), unresolved conflicts (≥2 stakeholders per conflict), concession sequencing (ordered moves with what-this-tests rationale), coalition map (≥2 members per coalition). The mediator output is a **landscape, not a winner** — the schema rejects any `winner`, `recommendedStakeholder`, or `verdict` field at the top level.

### Multilateral vs bilateral vs multi-analytical at a glance

| Question shape | Use | Distinguishing move |
|---|---|---|
| "How do we structure this 3+ party negotiation / mediation?" | `/engage-chorus` | N-party steel-man + named mediator producing a negotiated-outcome landscape (ZOPA, trade frontier, settlement zones, concession sequencing) |
| "Should we X?" (directional, bilateral, business/finance/marketing) | `/debate-prism` | For-advocate vs against-advocate with zero-URL-overlap citation discipline + named judge producing a holding |
| "What are the angles on X?" (open-ended, business/finance/marketing) | `/engage-prism` | Cooperative analytical refraction with citation discipline + synthesis with optional hybridization |

`engage-chorus`'s distinctive contribution is the **automatic stakeholder-role anti-overlap**: two paths cannot share a stakeholder role (you can't have two "the regulator" paths), so paradigm-as-routing is unnecessary by construction. Unlike sibling skills which retain optional paradigm-palette files (`paradigms.json`, `structures.json`, `strategies.json`), engage-chorus does NOT retain them — stakeholder enumeration IS the diversity mechanism. The steel-man contract is **soft pattern reuse** from `/debate-prism` (#214) — no shared code; the discipline is reproduced in chorus's contract. The mediator output schema is **structurally different** from debate-prism's judge schema — six required sections (each populated or explicit "none" with structural reason) producing a landscape, not a holding.

---

## Educational Clinical Reasoning Skills — When to Pick Which

The `/engage-apothecary` skill is the educational clinical-reasoning variant of the `/engage-prism` analytical-refraction base. It is **strictly educational, never for point-of-care decisions** — the refusal-as-load-bearing-contract is the load-bearing safety primitive of the family, distinct from any other engage-* sibling.

- **`/engage-apothecary`** — for **educational clinical reasoning** (#205). Refracts a de-identified hypothetical clinical scenario into N candidate differentials (typically 3-5) using mnemonic-driven enumeration / epidemiologic priors / red-flag triage. Each differential receives a structured brief with mechanism, evidence-tier-weighted citations (systematic-review > rct > cohort > case-control > case-series > expert-opinion), and test characteristics. A **mandatory red-flag advocate** role identifies the must-not-miss diagnosis that could share the presentation, the cheapest test that would rule it out, and the consequence-of-missing severity (catastrophic | severe | moderate). A **mandatory Bayesian pre/post-test synthesis** produces pre-test probabilities per differential, the highest-impact test, the post-test probability landscape, and an explicit educational learning objective. An **educational-only disclaimer** is stamped verbatim on every output and cannot be suppressed by any flag.

### Selection guide: never for point-of-care; always for teaching/learning

| Scenario | Use |
|---|---|
| "Walk me through the differential for a hypothetical {presentation} in a {demographic}." | `/engage-apothecary` |
| "Teach me the Bayesian update from {test} when pre-test probability is {high\|low}." | `/engage-apothecary` |
| "Compare the test characteristics of {test A} vs {test B} for {hypothetical condition}." | `/engage-apothecary` |
| "What evidence tiers should I weight most when reasoning about {hypothetical}?" | `/engage-apothecary` |
| **"My patient has..."** / **"What dose for..."** / **"Should I prescribe..."** / **"Chest pain right now..."** | **REFUSED** — engage-apothecary is never for point-of-care. The refusal gate at preflight HALTs with a redirect to appropriate care. |

### Load-bearing contracts (none of which can be suppressed by any flag)

1. **Refusal gate at preflight** — deterministic regex matching against five categories (`dosing`, `prescribing`, `individualizedCare`, `patientIdentifying`, `acuteSymptom`). Patterns deliberately over-match (false positives acceptable; false negatives are not). Refusal is final — no flag bypasses it, no rephrasing re-enables it (the user reformulates the scenario to remove the trigger phrasing). The refusal gate runs in BOTH primary (Node) and fallback paths; it does NOT depend on LLM judgment.
2. **Non-suppressible educational-only disclaimer** — verbatim text from `resources/disclaimer.txt`. Stamped at top AND bottom of every proposal. No `--no-disclaimer` flag exists. `--no-proposal` skips the document but the disclaimer appears in stdout output regardless.
3. **Mandatory red-flag advocate** — one structural role per invocation regardless of N or question shape. Output schema requires `mustNotMissDiagnosis` (or explicit `none-identified` with rationale), `sharingFeaturesRationale`, `rulingOutTest` (with LRs OR qualitativeImpact via anyOf), `consequenceOfMissingSeverity` (catastrophic | severe | moderate). The role exists to prevent educational outputs from accidentally modeling premature closure.
4. **Mandatory Bayesian pre/post-test synthesis** — every invocation produces `preTestProbabilities[]` (literature-cited or assumption-based with explicit assumption), `highestImpactTest` (LRs OR qualitativeImpact), `postTestProbabilities[]` (numeric or qualitative direction), `educationalLearningObjective`. Without this, the output is a list of differentials (reference) rather than a Bayesian-update teaching tool (pedagogy).

### Engage-apothecary's distinctive contributions

- **Deterministic refusal as a structural primitive.** Other engage-* skills accept whatever educational input the user provides; engage-apothecary refuses entire classes of input. The refusal-gate-patterns.json file is the source of truth; the regex match is content-classifier-independent.
- **Evidence-tier-weighted citations.** Mirrors `/engage-crucible`'s evidence-tier discipline but scoped to clinical literature tiers (systematic-review > rct > cohort > case-control > case-series > expert-opinion). Fabricated quantitative likelihood ratios are forbidden; qualitative ranking is used when LRs are not well-published.
- **Red-flag advocate as cognitive-skill scaffolding.** Promoting the red-flag advocate from "strategy variant" (original spec) to "mandatory structural role" (amended) was deliberate: the cognitive skill of *always asking what's the must-not-miss* is what the skill is teaching, and making the role optional would let educational outputs model the failure mode the skill is trying to prevent.
- **Bayesian synthesis as the pedagogical core.** Likewise promoting Bayesian pre/post-test synthesis from "paradigm option" to "required step" was deliberate: without explicit pre-test probabilities and a named learning objective, the skill is differential-list-generation; with it, the skill is reasoning-skill-training.
- **Disclaimer as compile-time invariant.** Unlike opt-in safety warnings, the disclaimer is read from a single source-of-truth file and stamped verbatim on every output. The test suite enforces the verbatim string at the SKILL.md surface AND in every example file.

The paradigm catalog in `Skills/engage-apothecary/resources/` (mechanistic / EBM-tier-walking / Bayesian-pretest / mnemonic-driven / system-anatomic-localization / time-course-pattern) is retained as an **optional inspiration palette**, NOT a routing substrate; `match-signals.js` is never consumed by this skill.

---

## Adversarial Sibling Skills — When to Pick Which

Three adversarial-pattern skills complement the cooperative `/engage-*` family:

- **`/debate-prism`** — for **business / marketing / finance** questions with a stated direction. Runs for-advocate + against-advocate in parallel with zero-URL-overlap citation enforcement; a judge subagent names which piece of evidence settled the call. Paired with `/engage-prism` (cooperative exploration).
- **`/engage-lexicon`** — for **legal / policy / compliance** questions with a stated direction under a declared jurisdiction (#202). Forks the `/debate-prism` scaffold and adds the discipline the legal domain requires: mandatory `--jurisdiction` gate before claim extraction, citation schema extended with `authorityType` (statute/regulation/controlling-case/persuasive-case/agency-guidance/etc.) and `authorityWeight` (controlling/persuasive), dual-axis citation diversity (URL non-overlap + at least one unique controlling-authority tuple per side), judge output that must annotate every cited authority with the controlling-vs-persuasive distinction, statutory recency gate that flags cited statutes/regulations against their most-recent-amendment date, and an educational-only disclaimer stamped unconditionally on every output. Optional `--mode survey` switches to refraction for landscape questions while retaining all legal-domain discipline. Not licensed legal advice; output is educational-only and intended as input to further professional review.
- **`/spar-exocortex`** — for **algorithm / code-design** questions with a stated baseline. Runs a propose-attack-measure loop with execution-backed validation; an attacker subagent produces a concrete failing input; a challenger subagent proposes a different approach that survives. Paired with `/engage-exocortex` (cooperative exploration).

### When to pick which

| Question shape | Use |
|---|---|
| "What are the angles on X?" (open-ended, business/finance/marketing) | `/engage-prism` |
| "Should we X?" / "Is X a good idea?" (directional, business/finance/marketing) | `/debate-prism` |
| "Is this conduct preempted under {jurisdiction}?" / "Does this clause survive under {jurisdiction}?" (directional, legal/policy/compliance, with declared jurisdiction) | `/engage-lexicon` |
| "What are the angles on legal area Y under {jurisdiction}?" (open-ended, legal landscape) | `/engage-lexicon --mode survey` (or `/engage-prism` for non-legal exploration) |
| "What are the approaches to problem Y?" (open-ended, code/algorithm/architecture) | `/engage-exocortex` |
| "Is this baseline the right algorithm?" / "Should we redesign component Z?" (directional with baseline, code/algorithm) | `/spar-exocortex` |

The adversarial skills drop the paradigm/structure/strategy taxonomy (labeled diversity) and substitute mechanical diversity: `/debate-prism` and `/engage-lexicon` require zero URL overlap between for- and against-advocate citations (and `/engage-lexicon` additionally requires authority-hierarchy diversity — at least one unique controlling-authority tuple per side); `/spar-exocortex` requires distinct `targetComplexity` or `invariantChoice` between baseline and challenger. All three preserve the citation schema, recency gate, attempted-call evidence requirement, and disclaimer template from their `/engage-*` siblings.

### Legal-vs-business selection (#202)

When picking between `/debate-prism` and `/engage-lexicon` for a question that touches legal issues, evaluate the question's **center of gravity**:

| The question is fundamentally about... | Use | Why |
|---|---|---|
| Market/finance/strategy — *with* regulatory exposure as a factor | `/debate-prism` | The trade-off matrix is dominated by market and strategy considerations; the legal angle is one variable. The standard disclaimer suffices. |
| Legal/policy/compliance — what does the law require/permit/forbid under {jurisdiction} | `/engage-lexicon` | The trade-off matrix is dominated by authority hierarchy, jurisdiction, and supersession. Mandatory disclaimer + jurisdiction gate + controlling-vs-persuasive distinction prevent the failure mode where the analysis appears coherent but is jurisdiction-meaningless. |

Concrete example: *"Should we acquire X given regulatory antitrust exposure"* → `/debate-prism` (the question is about acquiring X). *"Does the proposed merger trigger HSR review at current thresholds under US-Federal jurisdiction"* → `/engage-lexicon` (the question is about HSR review). The latter requires the jurisdiction-declared gate to prevent the failure mode where the analysis silently mixes Ninth Circuit and Fifth Circuit precedent on the merging-firms doctrine.

### Selection axes (#216)

When picking between `/engage-exocortex` and `/spar-exocortex` for an algorithmic / code-design question, evaluate along two axes:

| Axis | `/engage-exocortex` (cooperative) | `/spar-exocortex` (adversarial) |
|---|---|---|
| **Pattern** | Refract into N approaches in parallel; synthesize | Single baseline + attacker + challenger + execution + judge |
| **Runtime requirement** | Runtime-light — Pattern 4 fallback available (Claude-inline orchestration when Node absent) | Execution-backed — at least one of Node 18+ **or** Python 3.x required for the execution-harness layer; no reasoning-only fallback for that layer |

`/spar-exocortex`'s value-add is the execution-backed validation: it cannot produce an output without running candidate implementations against the attacker's input. A problem whose target language has no adapter (initial release: JS/TS/Python) is out of scope for `/spar-exocortex` — use `/engage-exocortex` and document the limitation. The Pattern 4 *orchestration* layer of `/spar-exocortex` still has a fallback, but the execution layer is intrinsic.

---

## Backward Compatibility Recipes

### engage-prism — restoring pre-#213 behavior

Issue #213 changed four defaults in `engage-prism`:

| Change | Pre-#213 behavior | Post-#213 default | Flag to restore old behavior |
|---|---|---|---|
| Step 1 `AskUserQuestion` keyword-confirmation gate | Mandatory | Skipped | `--confirm-keywords` |
| Path selection via `match-signals.js` + catalog | Mandatory routing | Primary agent names paths directly | `--structured-routing` |
| Anti-overlap diversity | (paradigm, structure, strategy) tuples | Distinct `primarySourceClass` per path | (no flag — this is now a hard contract; see issue #213 AC 3) |
| Proposal output | Full signal table + raw JSON inline | Slim proposal + `.audit.json` sibling | (no flag — slim-by-default; the audit sibling carries every byte that used to be inline) |

**Pre-#213 run invocation:** `engage-prism --confirm-keywords --structured-routing`

This restores the mandatory keyword-confirmation gate and the catalog-driven
path routing. The source-class diversity rule and the slim-proposal split
are contracts rather than defaults — they apply regardless of flags. Users
who need the previous *proposal layout* can consume the `.audit.json` sibling
directly and ignore the main proposal, since the audit JSON carries the
full structured data that used to live inline.

The red-team path trigger for directional questions (AC 4) and the
disagreement-audit / convergent-flag emission (AC 5) are also contracts
rather than flag-gated behavior.

### engage-exocortex — restoring pre-#215 behavior

Issue #215 changed four defaults in `engage-exocortex` and retired the
`--model` subagent-model override:

| Change | Pre-#215 behavior | Post-#215 default | Flag to restore old behavior |
|---|---|---|---|
| Step 1 keyword-confirmation gate | Mandatory | Skipped | `--confirm-keywords` |
| Step 3.5 execution phase | Did not exist | On for algorithmic, off for architecture | `--no-execution` |
| Step 4 operational scoring | Discretionary ("when relevant") | Default-on when Step 0 ran | `--skip-ops-scoring` |
| Step 5 proposal output | Always written (unless `--no-proposal`) | Domain-routed (on for architecture, off for algorithmic) | `--proposal` to force-write |
| Subagent model override | `--model <opus\|sonnet\|haiku>` flag | Subagents inherit parent session model | (no flag — switch the parent session model instead) |

**Pre-#215 run invocation:** `engage-exocortex --confirm-keywords --no-execution --proposal --skip-ops-scoring`

This restores: the mandatory keyword-confirmation gate, the absence of
the execution phase, the always-written proposal output, and discretionary
operational scoring. The retired `--model` flag has no replacement — change
the parent session model if you need a different baseline. The
`targetComplexity` + `invariantChoice` brief fields (AC4) and the
complexity-class anti-overlap rule are contracts rather than flag-gated
behavior; they apply regardless of which restore flags are passed. Same
for the slimmed paradigm/structure/strategy catalogs (AC8) — the
`retired/` archive preserves the pre-slim JSON for reference but is not
on the active load path.

---

**End of Skills Maintenance Process**
