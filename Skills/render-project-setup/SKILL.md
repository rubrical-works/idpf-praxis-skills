---
name: render-project-setup
description: Configure automated preview, staging, and production deployments with Render
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [render, docker, node, python, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: render-project-setup
**Purpose:** Guide Render deployments with GitHub integration.
**Audience:** Developers deploying web apps, APIs, static sites to Render.
**Related:** `ci-cd-pipeline-design`.
## Overview
Guidance for Render deployments. IaC via `render.yaml` blueprints, automatic PR preview environments, native GitHub integration with zero-config deploys.
## Responsibility Acknowledgement Gate
Implements `responsibility-gate` skill (`Skills/responsibility-gate/SKILL.md`).
- **Fires before:** `npm install -g @render-cli/cli` or creating/connecting a Render service and adding `render.yaml`.
- **Asks:** acceptance of changes to global npm, Render account (new services, GitHub integration), project `render.yaml`.
- **Decline:** exit cleanly; "Declined — no changes made."
- **Persistence:** per-invocation, never persisted.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.
## Initial Setup
### Prerequisites
- Render account
- GitHub repo connected to Render
- CLI (optional): `npm install -g @render-cli/cli`
### Connect GitHub
1. Sign in at https://render.com
2. Grant repo access: Dashboard > Account > GitHub
3. New > Web Service
4. Select repo and branch
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
### Variables
Configure in Dashboard (Service > Environment) or `render.yaml`:
| Variable | Scope | Description |
|----------|-------|-------------|
| `RENDER_API_KEY` | GitHub Actions | API key for deploy triggers |
| `DATABASE_URL` | Service | DB connection (auto-set for Render DBs) |
| `PORT` | Auto-injected | Port 10000 default |
### Environment Groups
1. Dashboard > Environment Groups > New
2. Add shared variables
3. Reference: `envVarGroups: [{ name: shared-config }]`
See `resources/env-setup.md`.
## GitHub Integration
### Auto-Deploy
Auto-deploys on push to configured branch. Enable: Service > Settings > Build & Deploy.
### Preview Environments
1. Service > Settings > Preview Environments > Enable
2. Each PR: `https://my-app-pr-{number}.onrender.com`
3. Uses production build/start commands
4. Auto-destroyed on PR close
### GitHub Actions
```yaml
# See resources/deploy.yml for complete workflow
- name: Trigger Render Deploy
  run: |
    curl -X POST "https://api.render.com/v1/services/${{ vars.RENDER_SERVICE_ID }}/deploys"
      -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```
## Deployment Strategies
### Production via Branch
```
main branch → Production (automatic)
```
### Staging via Separate Service
1. New > Web Service
2. Same repo, different branch (e.g., `develop`)
3. Staging-specific env vars
### Blue-Green
Zero-downtime by default: new version built alongside, health check passes → switch, old terminated.
### Manual Deploy / Rollback
```bash
# Dashboard: Service > Deploys > previous deploy > Rollback
# API
curl -X POST "https://api.render.com/v1/services/{service-id}/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY"
```
## Monitoring
### Logs
Dashboard (Service > Logs) or API. Build logs, runtime logs, filtering by time/search.
### Metrics
CPU/memory, HTTP rate/latency, bandwidth.
### Health Checks
```yaml
services:
  - type: web
    healthCheckPath: /api/health
```
Rolls back if health check fails.
## Common Pitfalls
### Build
- **Timeout:** 30-min default; optimize or cache
- **Node version:** `engines` in `package.json` or `RENDER_NODE_VERSION`
- **Native deps:** use `preDeployCommand` in `render.yaml`
### Deployment
- **Port:** use `process.env.PORT` (default 10000)
- **Cold starts (free):** spin down after 15 min; upgrade for always-on
- **Static/SPA routing:** rewrite to `index.html`
### Preview
- **DB sharing:** previews share production DB by default; use separate DBs
- **Env conflicts:** inherit from main; override per-preview
- **Cost:** each preview = separate instance
## Related Skills
- `ci-cd-pipeline-design`
## Resources
- `resources/render.yaml`
- `resources/deploy.yml`
- `resources/env-setup.md`
