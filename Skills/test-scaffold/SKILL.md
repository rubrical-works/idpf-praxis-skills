---
name: test-scaffold
description: Generate testing infrastructure from IDPF testing domain knowledge — configs, specs, CI workflows for accessibility, chaos, contract, performance, QA, and security testing
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [testing, playwright, axe-core, k6, pact, semgrep, zap, gitleaks, toxiproxy, ci, github-actions]
defaultSkill: false
copyright: "Rubrical Works (c) 2026"
---
# Test Scaffold
Generate testing infrastructure from IDPF domain knowledge. Bridges testing methodology (what to test) and testing tooling (how to test) by producing ready-to-run configs, specs, and CI workflows.
## When to Use This Skill
- Setting up testing infrastructure for a project
- Adding accessibility, security, performance, chaos, contract, or QA testing
- Generating CI workflows for test automation
- Scaffolding test specs from existing routes and components
- "scaffold testing", "set up testing", "add security testing", "generate test configs"
## Supported Domains
| Domain | Source Framework | Key Tools | Artifacts |
|--------|-----------------|-----------|-----------|
| **Accessibility** | `Domains/Accessibility/` | axe-core, Lighthouse | axe config, a11y specs, CI job, lighthouse budgets |
| **Chaos** | `Domains/Chaos/` | Toxiproxy | experiment configs, proxy setup, abort conditions, runbooks |
| **Contract Testing** | `Domains/Contract-Testing/` | Pact | consumer/provider specs, broker config, Can-I-Deploy gate |
| **Performance** | `Domains/Performance/` | k6 | load test scripts, threshold configs, CI jobs |
| **QA Automation** | `Domains/QA-Automation/` | Playwright | Page Objects, fixtures, spec templates, cross-browser CI |
| **Security** | `Domains/Security/` | Semgrep, ZAP, Gitleaks | SAST/DAST/SCA configs, secret scanning, CI gates |
## Step 1: Project Detection
### 1a. Framework Detection
Read `package.json` and configuration files to detect:
| Signal | Framework |
|--------|-----------|
| `react`, `react-dom` in dependencies | React |
| `vue` in dependencies | Vue |
| `svelte` in dependencies | Svelte |
| `@angular/core` in dependencies | Angular |
| `next` in dependencies | Next.js |
| `nuxt` in dependencies | Nuxt |
| `astro` in dependencies | Astro |
| None of the above | Vanilla/Unknown |
Report: `Detected framework: {name}`
If `package.json` missing: `"No package.json found — using default configuration. Some route-specific artifacts may be generic."`
### 1b. Package Manager Detection
| Lock File | Package Manager |
|-----------|----------------|
| `package-lock.json` | npm |
| `bun.lockb` | bun |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
### 1c. Existing Test Setup Detection
| Config File | Tool |
|-------------|------|
| `playwright.config.ts` or `playwright.config.js` | Playwright |
| `vitest.config.ts` or `vitest.config.js` | Vitest |
| `jest.config.*` | Jest |
| `cypress.config.*` | Cypress |
| `.semgrep.yml` | Semgrep (security) |
| `axe.config.js` | axe-core (accessibility) |
| `k6` scripts in `tests/perf/` | k6 (performance) |
| `pact-config.json` | Pact (contract) |
For detected tools: `"{Tool} already configured — scaffolding will extend existing setup"`
### 1d. Route/Page Discovery
| Location | Pattern |
|----------|---------|
| `src/pages/` | File-based routing (Next.js, Astro) |
| `src/routes/` | File-based routing (SvelteKit) |
| `app/` | App Router (Next.js 13+) |
| Router config files | `react-router`, `vue-router` configs |
Collect route list for domain modules needing it (accessibility, QA, security DAST).
If no routes found: `"No routes discovered — specs will use placeholder paths. Add routes later."`
### 1e. Existing Scaffolding Detection
| Check | Meaning |
|-------|---------|
| `tests/a11y/` exists | Accessibility already partially scaffolded |
| `chaos/` directory exists | Chaos already partially scaffolded |
| `tests/contract/` exists | Contract testing already partially scaffolded |
| `tests/perf/` exists | Performance already partially scaffolded |
| `tests/e2e/pages/` exists | QA Page Objects already partially scaffolded |
| `.gitleaks.toml` exists | Security already partially scaffolded |
Report per-domain: `"{Domain} setup detected — will extend rather than overwrite"`
## Step 2: Domain Selection
### Invocation Patterns
| User Says | Action |
|-----------|--------|
| "scaffold testing" / "set up testing" | Present domain selection |
| "scaffold all testing" | Select all 6 domains |
| "scaffold security testing" | Select security domain only |
| "scaffold a11y and security" | Select accessibility + security |
| "add performance testing" | Select performance domain only |
### Domain Selection Prompt
```
Available testing domains:
1. Accessibility — axe-core configs, a11y specs, Lighthouse budgets, CI scanning
2. Chaos — experiment configs, Toxiproxy setup, abort conditions, runbooks
3. Contract Testing — Pact consumer/provider specs, broker config, Can-I-Deploy
4. Performance — k6 load test scripts, threshold configs, CI jobs
5. QA Automation — Page Object scaffolds, fixtures, smoke/regression specs, CI tiers
6. Security — Semgrep SAST, ZAP DAST, Gitleaks secrets, CI security gates
Select domains (comma-separated numbers, or "all"):
```
## Step 3: Generate Artifacts
For each selected domain, load the corresponding domain module:
```
read Skills/test-scaffold/domains/{domain}.md
```
Domain modules contain: tool configuration templates, test spec templates, CI workflow job definitions, manual testing next steps.
Follow each domain module's generation instructions with the project context from Step 1.
## Step 4: Report Summary
```
Testing Scaffold Complete
Generated artifacts:
  {domain}: {list of files created}
  ...
Packages to install:
  {package-manager} install -D {deduplicated list}
Next steps (manual):
  - {per-domain manual testing guidance}
```
## Multi-Domain Package Deduplication
When multiple domains selected, collect all required packages and deduplicate before reporting the install command. Shared packages (e.g., `@axe-core/playwright` used by both accessibility and QA) are listed once.
## Multi-Domain CI Workflow Merging
When multiple domains generate CI jobs, offer two options:
1. **Single workflow** (`testing.yml`) — All domain jobs in one file
2. **Per-domain workflows** — Separate file per domain (e.g., `a11y.yml`, `security.yml`)
Default to single workflow unless user specifies otherwise.
## Error Handling
| Situation | Response |
|-----------|----------|
| `package.json` missing | Warn, use defaults, continue |
| No routes found | Warn, use placeholder paths, continue |
| Domain template file missing | Error for that domain, skip, continue with others |
| Existing config detected | Extend rather than overwrite |
| No domains selected | Error: "Select at least one domain" |
## Relationship to Other Skills
**Companion Frameworks (all 6 testing domains):**
- `Domains/Accessibility/` — Source methodology for accessibility scaffolding
- `Domains/Chaos/` — Source methodology for chaos engineering scaffolding
- `Domains/Contract-Testing/` — Source methodology for contract testing scaffolding
- `Domains/Performance/` — Source methodology for performance testing scaffolding
- `Domains/QA-Automation/` — Source methodology for QA automation scaffolding
- `Domains/Security/` — Source methodology for security testing scaffolding
**Complementary Skills:**
- `playwright-setup` — Playwright installation and CI configuration
- `ci-cd-pipeline-design` — CI/CD pipeline architecture
- `test-writing-patterns` — Test structure and assertions
