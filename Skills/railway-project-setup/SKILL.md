---
name: railway-project-setup
description: Configure automated preview, staging, and production deployments with Railway
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [railway, docker, node, python, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: railway-project-setup
**Purpose:** Guide developers through setting up Railway deployments with GitHub Actions integration
**Audience:** Developers deploying web applications and services to Railway
**Related Skills:** `ci-cd-pipeline-design`
## Step 0 — Re-read Config (MANDATORY)
Read `resources/railway-project-setup.config.json` from disk and validate against `resources/railway-project-setup.config.schema.json` at start of every invocation. Config is source of truth for CLI install/login/link/init commands, all `railway` deploy subcommand templates, required secret/var names, auto-injected env list. SKILL.md must not duplicate values.
## Overview
Provides structured guidance for configuring Railway deployments across preview (PR environments), staging, and production. Railway excels at deploying full-stack applications with databases, background workers, and cron jobs in a unified platform.
## Initial Setup
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before running `npm install -g @railway/cli`, `railway login`, or `railway link`/`railway init` to install the Railway CLI and link/create a Railway project.
- **What is asked:** acceptance of responsibility for change to global npm environment, Railway account authentication, and project's Railway service/environment bindings.
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
### Prerequisites
- Railway account (free tier or Pro plan for team features)
- Railway CLI installed via `cli.installCommand` (from config)
- GitHub repository with push access
### Linking Your Project
Run `cli.*` commands from config: `cli.loginCommand` (authenticate CLI); `cli.linkCommand` (link to existing project); `cli.initCommand` (initialize new project).
### Project Structure
Railway organizes deployments around **services** within a **project**: **Project** = top-level container; **Service** = individual deployable unit (e.g., "web", "api", "worker"); **Environment** = deployment target (e.g., "production", "staging", "pr-123").
## Environment Configuration
### Required Secrets
Configure in GitHub repository settings (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `RAILWAY_TOKEN` | Railway Dashboard > Account > Tokens | API authentication token |
### Environment Variables
Set per-service variables in Dashboard (Service > Variables): scoped to environments (production, staging, PR); use shared variables for cross-service config; Railway auto-injects `PORT`, `RAILWAY_ENVIRONMENT`, `RAILWAY_SERVICE_NAME`. See `resources/env-setup.md`.
## GitHub Integration
### Native GitHub Integration
Built-in GitHub integration auto-deploys on push: Connect GitHub repo (Project > Settings > Source); select branch for production; enable PR environments for previews.
### GitHub Actions Deployment
See `resources/deploy.yml`. Step: `run: railway up --service ${{ vars.RAILWAY_SERVICE }}` with `env: RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}`.
## PR Environments (Preview Deployments)
Railway's PR environments create isolated copies of services for each pull request.
### Enabling PR Environments
1. In Railway Dashboard: Project > Settings > Environments
2. Enable "PR Environments"
3. Each PR gets a full environment with its own: service instances, database instances (cloned from staging/production), environment variables
### Automatic Cleanup
PR environments automatically destroyed when PR is closed or merged.
### Limitations
- PR environments share project's resource limits
- Database cloning may increase costs on large datasets
- Some external services may need manual configuration per PR
## Deployment Strategies
### Production via Branch Deploy
Railway deploys automatically when commits land on configured production branch:
```
main branch → Production environment (automatic)
```
### Staging Environment
Create a dedicated staging environment in Railway:
1. Railway Dashboard > Project > Environments > New Environment
2. Name it "staging"
3. Configure branch trigger (e.g., `develop`)
### Manual Deployment
Use `deployCommands.up` (substitute `{service}`) or `deployCommands.upWithEnv` (substitute `{service}` and `{environment}`). CLI subcommand templates live in JSON so Railway CLI rename is a JSON edit.
### Rollback
Use `deployCommands.listDeployments` to find a target, then `deployCommands.rollback`.
## Monitoring and Debugging
### Deployment Logs
Use `deployCommands.logs` (substitute `{service}`) for live streams or `deployCommands.logsForDeployment` (substitute `{deploymentId}`) for specific past deployment. Both templates live in config.
### Railway Dashboard
- **Metrics**: CPU, memory, network usage per service
- **Logs**: Real-time log streaming with search and filtering
- **Deployments**: History with build logs and status
### Health Checks
Railway supports health check configuration in `railway.toml`: `[deploy] healthcheckPath = "/api/health"; healthcheckTimeout = 30`.
## Common Pitfalls and Troubleshooting
### Build Issues
- **Nixpacks detection failure**: Ensure project has standard config files (`package.json`, `requirements.txt`) or specify custom Dockerfile
- **Build timeout**: Large projects may exceed default build time. Optimize with `.railwayignore`
- **Missing dependencies**: Railway uses Nixpacks by default. Ensure all system dependencies declared
### Deployment Issues
- **Port binding**: Railway injects `PORT` automatically. Listen on `process.env.PORT` or `0.0.0.0:$PORT`
- **Database connection drops**: Use connection pooling and configure `PGBOUNCER_URL` for PostgreSQL
- **Cold starts**: Railway keeps services running on Pro plan. Free tier may sleep after inactivity
### CI/CD Issues
- **Token scoping**: Ensure `RAILWAY_TOKEN` has access to target project
- **Service targeting**: Always specify `--service` when deploying to multi-service projects
- **Environment isolation**: PR environment variables default to staging values unless overridden
## Configuration Reference
### railway.toml
See `resources/railway.toml` for reference configuration covering: build settings (builder, build command); deploy settings (start command, health checks, replicas); environment-specific overrides.
## Related Skills
- **`ci-cd-pipeline-design`** — Architecture patterns for CI/CD pipelines
## Resources
| File | Purpose |
|------|---------|
| `resources/railway-project-setup.config.json` | Volatile knobs (CLI commands, deploy subcommand templates, secrets, auto-injected env). Re-read at every invocation. |
| `resources/railway-project-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/railway.toml` | Reference Railway configuration. |
| `resources/deploy.yml` | GitHub Actions workflow for Railway deployment. |
| `resources/env-setup.md` | Environment variable setup guide. |
| `docs/railway-project-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
