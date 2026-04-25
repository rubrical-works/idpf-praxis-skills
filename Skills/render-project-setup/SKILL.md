---
name: render-project-setup
description: Configure automated preview, staging, and production deployments with Render
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [render, docker, node, python, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: render-project-setup
**Purpose:** Guide Render deployments with GitHub integration.
**Audience:** Developers deploying web apps, APIs, static sites to Render.
**Related Skills:** `ci-cd-pipeline-design`.
## Step 0 — Re-read Config (MANDATORY)
Read `resources/render-project-setup.config.json` and validate against `resources/render-project-setup.config.schema.json` at start of every invocation. Config is source of truth for CLI install command, deploy-trigger API endpoint/curl template, required secrets, default HTTP port, preview URL pattern. SKILL.md must not duplicate config values.
## Overview
Render uses IaC via `render.yaml` blueprints, supports automatic PR preview environments, native GitHub integration with zero-config deploys.
## Initial Setup
### Responsibility Acknowledgement Gate
Implements `responsibility-gate` skill pattern (`Skills/responsibility-gate/SKILL.md`).
- **Fires before:** running `npm install -g @render-cli/cli` or creating/connecting a Render service and adding `render.yaml`.
- **Asks:** acceptance for changes to global npm env, Render account (services, GitHub integration), project `render.yaml`.
- **Decline:** exit cleanly; "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted across runs.
Use `AskUserQuestion` with required options (`"I accept responsibility — proceed"`, `"Decline — exit without changes"`).
### Prerequisites
- Render account (free tier available)
- GitHub repo connected to Render
- Render CLI (optional) — install via `cli.installCommand` from config
### Connecting GitHub
Dashboard flow — cannot script. Ask user what they see rather than describing navigation (layout unstable). Minimum: sign in with GitHub, grant repo access, create Web Service pointing at target repo/branch.
### Blueprint (IaC)
```yaml
# See resources/render.yaml for complete blueprint
services:
  - type: web
    name: my-app
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```
## Environment Configuration
### Environment Variables
Configure in Dashboard (Service > Environment) or `render.yaml`:
| Variable | Scope | Description |
|----------|-------|-------------|
| `RENDER_API_KEY` | GitHub Actions | API key for deploy triggers |
| `DATABASE_URL` | Service | DB connection (auto-set for Render DBs) |
| `PORT` | Auto-injected | Render assigns port 10000 by default |
### Environment Groups
1. Dashboard > Environment Groups > New
2. Add shared variables
3. Reference: `envVarGroups: [{ name: shared-config }]`
See `resources/env-setup.md`.
## GitHub Integration
### Auto-Deploy on Push
Auto-deploys on push to configured branch. Enable: Service > Settings > Build & Deploy.
### Preview Environments
1. Service > Settings > Preview Environments > Enable
2. Each PR: `https://my-app-pr-{number}.onrender.com`
3. Uses same build/start commands as production
4. Auto-destroyed when PR closes
### GitHub Actions Deployment
```yaml
# See resources/deploy.yml for complete workflow
- name: Trigger Render Deploy
  run: |
    curl -X POST "https://api.render.com/v1/services/${{ vars.RENDER_SERVICE_ID }}/deploys"
      -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```
## Deployment Strategies
### Production via Branch Deploy
```
main branch → Production service (automatic)
```
### Staging via Separate Service
1. Dashboard > New > Web Service
2. Same repo, different branch (e.g., `develop`)
3. Configure staging-specific env vars
### Blue-Green Deployments
Zero-downtime by default: new version built alongside running, health check passes → traffic switches, old version terminated.
### Manual Deploy and Rollback
```bash
# Via Dashboard: Service > Deploys > previous deploy > Rollback
# Via API
curl -X POST "https://api.render.com/v1/services/{service-id}/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY"
```
## Monitoring and Debugging
### Logs
Dashboard (Service > Logs) or API. Build logs show full build; runtime logs stream output; filter by time/search.
### Metrics
Built-in: CPU/memory, HTTP request rate/latency, bandwidth.
### Health Checks
```yaml
services:
  - type: web
    healthCheckPath: /api/health
```
Render checks endpoint after deployment, rolls back on failure.
## Common Pitfalls and Troubleshooting
### Build Issues
- **Build timeout:** 30-min default; optimize or use build caching
- **Node.js version:** specify in `engines` in `package.json` or `RENDER_NODE_VERSION` env var
- **Missing native deps:** use `render.yaml` `preDeployCommand`
### Deployment Issues
- **Port binding:** use `defaults.httpPort` (from config) or `PORT` env var. Always `process.env.PORT`
- **Cold starts on free tier:** free instances spin down after `defaults.freeTierIdleMinutes` (from config); upgrade for always-on
- **Static site routing:** for SPAs, rewrite all routes to `index.html`
### Preview Environment Issues
- **DB sharing:** previews share production DB by default; use separate DBs for isolation
- **Env var conflicts:** previews inherit from main; override per-preview
- **Cost awareness:** each preview = separate instance; monitor on team plans
## Related Skills
- **`ci-cd-pipeline-design`** — CI/CD pipeline architecture, stage design, security
## Resources
| File | Purpose |
|------|---------|
| `resources/render-project-setup.config.json` | Volatile knobs (CLI install, API templates, secrets, default port, preview URL pattern). Re-read every invocation. |
| `resources/render-project-setup.config.schema.json` | JSON Schema validating config. |
| `resources/render.yaml` | Reference Render blueprint. |
| `resources/deploy.yml` | GitHub Actions workflow. |
| `resources/env-setup.md` | Env variable setup guide. |
| `docs/render-project-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
