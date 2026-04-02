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
Read `package.json` to detect:
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
If `package.json` missing: `"No package.json found — using default configuration."`
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
| `playwright.config.ts` or `.js` | Playwright |
| `vitest.config.ts` or `.js` | Vitest |
| `jest.config.*` | Jest |
| `cypress.config.*` | Cypress |
| `.semgrep.yml` | Semgrep |
| `axe.config.js` | axe-core |
| `k6` scripts in `tests/perf/` | k6 |
| `pact-config.json` | Pact |
For detected tools: `"{Tool} already configured — scaffolding will extend existing setup"`
### 1d. Route/Page Discovery
| Location | Pattern |
|----------|---------|
| `src/pages/` | File-based routing (Next.js, Astro) |
| `src/routes/` | File-based routing (SvelteKit) |
| `app/` | App Router (Next.js 13+) |
| Router config files | `react-router`, `vue-router` configs |
If no routes: `"No routes discovered — specs will use placeholder paths."`
### 1e. Existing Scaffolding Detection
| Check | Meaning |
|-------|---------|
| `tests/a11y/` exists | Accessibility partially scaffolded |
| `chaos/` exists | Chaos partially scaffolded |
| `tests/contract/` exists | Contract testing partially scaffolded |
| `tests/perf/` exists | Performance partially scaffolded |
| `tests/e2e/pages/` exists | QA Page Objects partially scaffolded |
| `.gitleaks.toml` exists | Security partially scaffolded |
Report: `"{Domain} setup detected — will extend rather than overwrite"`
## Step 2: Domain Selection
### Invocation Patterns
| User Says | Action |
|-----------|--------|
| "scaffold testing" / "set up testing" | Present domain selection |
| "scaffold all testing" | Select all 6 domains |
| "scaffold security testing" | Select security only |
| "scaffold a11y and security" | Select accessibility + security |
| "add performance testing" | Select performance only |
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
For each selected domain, load the corresponding module:
```
read Skills/test-scaffold/domains/{domain}.md
```
Domain modules contain tool configs, test spec templates, CI workflow jobs, and manual testing next steps. Follow each module's generation instructions with project context from Step 1.
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
## Multi-Domain Handling
- **Package Deduplication:** Collect all required packages across domains and deduplicate before reporting install command
- **CI Workflow Merging:** Offer single workflow (`testing.yml`) or per-domain workflows; default to single unless user specifies otherwise
## Error Handling
| Situation | Response |
|-----------|----------|
| `package.json` missing | Warn, use defaults, continue |
| No routes found | Warn, use placeholder paths, continue |
| Domain template missing | Error for that domain, skip, continue with others |
| Existing config detected | Extend rather than overwrite |
| No domains selected | Error: "Select at least one domain" |
## Relationship to Other Skills
**Companion Frameworks:** `Domains/Accessibility/`, `Domains/Chaos/`, `Domains/Contract-Testing/`, `Domains/Performance/`, `Domains/QA-Automation/`, `Domains/Security/`
**Complementary Skills:** `playwright-setup`, `ci-cd-pipeline-design`, `test-writing-patterns`
