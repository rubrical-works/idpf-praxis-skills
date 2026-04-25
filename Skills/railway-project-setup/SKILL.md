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

**Purpose:** Guide Railway deployments with GitHub Actions integration
**Audience:** Developers deploying web apps/services to Railway
**Related Skills:** `ci-cd-pipeline-design`

---

## Step 0 — Re-read Config (MANDATORY)

Read `resources/railway-project-setup.config.json` and validate against `resources/railway-project-setup.config.schema.json` at the start of every invocation. Config is source of truth for CLI install/login/link/init commands, all `railway` deploy subcommand templates, required secret/var names, and auto-injected env list. SKILL.md must not duplicate config values.

---

## Overview

Structured guidance for Railway deployments across preview (PR), staging, and production. Railway deploys full-stack apps with databases, workers, and cron jobs in a unified platform.

---

## Initial Setup

## Responsibility Acknowledgement Gate

Implements `responsibility-gate` skill pattern. See `Skills/responsibility-gate/SKILL.md`.

- **When fires:** before `npm install -g @railway/cli`, `railway login`, `railway link`/`railway init`.
- **What is asked:** acceptance of responsibility for changes to global npm env, Railway auth, and project's Railway service/environment bindings.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation. Re-fires every invocation; never persisted.

Use `AskUserQuestion` with required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).

### Prerequisites

- Railway account (free tier or Pro)
- Railway CLI installed via `cli.installCommand` (config)
- GitHub repo with push access

### Linking Your Project

Run commands under `cli.*` in config:
- `cli.loginCommand` — authenticate local CLI
- `cli.linkCommand` — link existing project
- `cli.initCommand` — initialize new project

### Project Structure

- **Project**: Top-level container (e.g., "my-app")
- **Service**: Deployable unit (e.g., "web", "api", "worker")
- **Environment**: Deployment target (e.g., "production", "staging", "pr-123")

---

## Environment Configuration

### Required Secrets

Configure in GitHub (Settings > Secrets and variables > Actions):

| Secret | Source | Description |
|--------|--------|-------------|
| `RAILWAY_TOKEN` | Railway Dashboard > Account > Tokens | API authentication token |

### Environment Variables

Set per-service in Railway Dashboard (Service > Variables):
- Variables scoped to environments (production, staging, PR)
- Use shared variables for cross-service config
- Railway auto-injects `PORT`, `RAILWAY_ENVIRONMENT`, `RAILWAY_SERVICE_NAME`

See `resources/env-setup.md`.

---

## GitHub Integration

### Native GitHub Integration

1. Connect GitHub repo in Railway Dashboard (Project > Settings > Source)
2. Select branch for production deploys
3. Enable PR environments for previews

### GitHub Actions Deployment

```yaml
# See resources/deploy.yml for complete workflow
- name: Deploy to Railway
  run: railway up --service ${{ vars.RAILWAY_SERVICE }}
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## PR Environments (Preview Deployments)

### Enabling PR Environments

1. Railway Dashboard: Project > Settings > Environments
2. Enable "PR Environments"
3. Each PR gets full env with own service instances, database instances (cloned from staging/prod), env vars

### Automatic Cleanup

PR envs auto-destroyed when PR closed/merged.

### Limitations

- PR envs share project resource limits
- Database cloning may increase costs on large datasets
- Some external services need manual per-PR config

---

## Deployment Strategies

### Production via Branch Deploy

```
main branch → Production environment (automatic)
```

### Staging Environment

1. Railway Dashboard > Project > Environments > New Environment
2. Name "staging"
3. Configure branch trigger (e.g., `develop`)

### Manual Deployment

Use `deployCommands.up` (substitute `{service}`) or `deployCommands.upWithEnv` (substitute `{service}` and `{environment}`) from config. CLI subcommand templates live in JSON so a Railway CLI rename is a JSON edit.

### Rollback

Use `deployCommands.listDeployments` to find target, then `deployCommands.rollback`.

---

## Monitoring and Debugging

### Deployment Logs

Use `deployCommands.logs` (substitute `{service}`) for live streams or `deployCommands.logsForDeployment` (substitute `{deploymentId}`) for past deployment.

### Railway Dashboard

- **Metrics**: CPU, memory, network per service
- **Logs**: Real-time streaming with search/filter
- **Deployments**: History with build logs and status

### Health Checks

```toml
[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
```

---

## Common Pitfalls and Troubleshooting

### Build Issues

- **Nixpacks detection failure**: Ensure standard config files (`package.json`, `requirements.txt`) or specify custom Dockerfile
- **Build timeout**: Optimize with `.railwayignore` to exclude unnecessary files
- **Missing dependencies**: Railway uses Nixpacks by default; declare all system deps

### Deployment Issues

- **Port binding**: Listen on `process.env.PORT` or `0.0.0.0:$PORT`
- **Database connection drops**: Use connection pooling; configure `PGBOUNCER_URL` for PostgreSQL
- **Cold starts**: Pro plan keeps services running; free tier may sleep

### CI/CD Issues

- **Token scoping**: Ensure `RAILWAY_TOKEN` has access to target project
- **Service targeting**: Always specify `--service` in multi-service projects
- **Environment isolation**: PR env vars default to staging values unless overridden

---

## Configuration Reference

### railway.toml

See `resources/railway.toml` — build settings (builder, build command), deploy settings (start command, health checks, replicas), environment-specific overrides.

---

## Related Skills

- **`ci-cd-pipeline-design`** — CI/CD pipeline architecture, stage design, security

---

## Resources

| File | Purpose |
|------|---------|
| `resources/railway-project-setup.config.json` | Volatile knobs (CLI commands, deploy subcommand templates, secrets, auto-injected env). Re-read every invocation. |
| `resources/railway-project-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/railway.toml` | Reference Railway configuration. |
| `resources/deploy.yml` | GitHub Actions workflow for Railway deployment. |
| `resources/env-setup.md` | Environment variable setup guide. |
| `docs/railway-project-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
