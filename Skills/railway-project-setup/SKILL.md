---
name: railway-project-setup
description: Configure automated preview, staging, and production deployments with Railway
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [railway, docker, node, python, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: railway-project-setup
**Purpose:** Guide Railway deployments with GitHub Actions integration.
**Audience:** Developers deploying web apps/services to Railway.
**Related:** `ci-cd-pipeline-design`.
## Overview
Structured guidance for Railway deployments across preview (PR), staging, and production. Railway handles full-stack apps with databases, workers, and cron jobs in one platform.
## Responsibility Acknowledgement Gate
Implements `responsibility-gate` skill (`Skills/responsibility-gate/SKILL.md`).
- **Fires before:** `npm install -g @railway/cli`, `railway login`, `railway link`/`railway init`.
- **Asks:** acceptance of changes to global npm, Railway auth, and project service/environment bindings.
- **Decline:** exit cleanly; "Declined — no changes made."
- **Persistence:** per-invocation, never persisted.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.
## Initial Setup
### Prerequisites
- Railway account
- CLI: `npm install -g @railway/cli`
- GitHub repo with push access
### Linking
```bash
railway login
railway link     # existing project
railway init     # new project
```
### Structure
- **Project:** top-level container
- **Service:** deployable unit (web, api, worker)
- **Environment:** target (production, staging, pr-123)
## Environment Configuration
### Required Secrets
Configure in GitHub Settings > Secrets:
| Secret | Source | Description |
|--------|--------|-------------|
| `RAILWAY_TOKEN` | Railway > Account > Tokens | API auth token |
### Variables
Per-service in Railway Dashboard (Service > Variables):
- Scoped to environments
- Shared variables for cross-service config
- Auto-injected: `PORT`, `RAILWAY_ENVIRONMENT`, `RAILWAY_SERVICE_NAME`
See `resources/env-setup.md`.
## GitHub Integration
### Native
1. Connect repo: Project > Settings > Source
2. Select production branch
3. Enable PR environments
### GitHub Actions
```yaml
# See resources/deploy.yml for complete workflow
- name: Deploy to Railway
  run: railway up --service ${{ vars.RAILWAY_SERVICE }}
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```
## PR Environments (Preview)
Isolated service copies per PR.
### Enable
1. Project > Settings > Environments
2. Enable "PR Environments"
3. Each PR gets: service instances, cloned DBs, env vars
### Cleanup
Auto-destroyed on PR close/merge.
### Limits
- Share project resource limits
- DB cloning increases costs on large datasets
- Some external services need per-PR config
## Deployment Strategies
### Production via Branch
```
main branch → Production (automatic)
```
### Staging
1. Project > Environments > New
2. Name "staging"
3. Configure branch trigger (e.g., `develop`)
### Manual
```bash
railway up --service web
railway up --service web --environment staging
```
### Rollback
```bash
railway deployments
railway rollback
```
## Monitoring
### Logs
```bash
railway logs --service web
railway logs --deployment-id <id>
```
### Dashboard
Metrics (CPU/memory/network), real-time logs, deployment history.
### Health Checks
`railway.toml`:
```toml
[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
```
## Common Pitfalls
### Build
- **Nixpacks detection:** ensure standard config files or custom Dockerfile
- **Build timeout:** use `.railwayignore`
- **Missing deps:** declare all system deps
### Deployment
- **Port:** listen on `process.env.PORT` or `0.0.0.0:$PORT`
- **DB connection drops:** use pooling, `PGBOUNCER_URL`
- **Cold starts:** Pro keeps running; free sleeps
### CI/CD
- **Token scoping:** ensure access to target project
- **Service targeting:** always `--service` in multi-service
- **Environment isolation:** PR vars default to staging
## Configuration Reference
`resources/railway.toml` covers build settings, deploy settings (start command, health checks, replicas), env-specific overrides.
## Related Skills
- `ci-cd-pipeline-design`
## Resources
- `resources/railway.toml`
- `resources/deploy.yml`
- `resources/env-setup.md`
