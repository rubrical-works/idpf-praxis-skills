---
name: vercel-project-setup
description: Configure automated preview, staging, and production deployments with Vercel
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [vercel, next, react, node, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: vercel-project-setup
**Purpose:** Guide developers through setting up Vercel deployments with GitHub Actions integration
**Audience:** Developers deploying web applications to Vercel
**Related Skills:** `ci-cd-pipeline-design`
## Step 0 — Re-read Config (MANDATORY)
Read `resources/vercel-project-setup.config.json` from disk and validate against `resources/vercel-project-setup.config.schema.json` at start of every invocation. Config is source of truth for CLI install/login/link commands, all `vercel` deploy subcommand templates, GitHub Action `uses:` line and its three input names, three required secrets. SKILL.md must not duplicate values.
## Overview
Provides structured guidance for configuring Vercel deployments across preview, staging, and production environments. Covers initial project setup through Vercel CLI, GitHub Actions workflows for automated deployments, environment variable management, monitoring.
## Initial Setup
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before running `npm install -g vercel`, `vercel login`, or `vercel link`/`vercel` to install the Vercel CLI and link/create a Vercel project.
- **What is asked:** acceptance of responsibility for change to global npm environment, local `.vercel/` directory, and Vercel account/project binding.
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
### Prerequisites
- Vercel account (free tier available)
- Vercel CLI installed via `cli.installCommand` (from config)
- GitHub repository with push access
### Linking Your Project
Use CLI commands recorded in config:
- `cli.loginCommand` — authenticate CLI locally
- `cli.linkCommand` — link to existing Vercel project
- `cli.createCommand` — create new Vercel project
`cli.linkCommand` creates `.vercel/` directory with `project.json` containing org and project IDs (sourced into `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` per config's `secrets.required`).
## Environment Configuration
### Required Secrets
Configure in GitHub repository settings (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `VERCEL_TOKEN` | Vercel Dashboard > Settings > Tokens | API authentication token |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` | Your Vercel project ID |
### Environment Variables
Set environment-specific variables in Vercel Dashboard (Project > Settings > Environment Variables):
- **Production**: Variables available only in production deployments
- **Preview**: Variables available in preview/PR deployments
- **Development**: Variables available during `vercel dev`
See `resources/env-setup.md`.
## GitHub Integration
### Automated Preview Deployments
Preview deployments create unique URL for every pull request:
```yaml
# See resources/deploy.yml for complete workflow
on:
  pull_request:
    types: [opened, synchronize]

steps:
  - uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
      vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```
Preview URL automatically commented on PR for easy access.
### Production Deployments
Production deployments triggered when pushing to main branch or creating release tag:
```yaml
on:
  push:
    branches: [main]
    # Or use tags for explicit releases:
    # tags: ['v*']

steps:
  - uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-args: '--prod'
```
## Custom Configuration
### vercel.json
Configures build settings, routes, headers, redirects. See `resources/vercel.json`. Key areas: build (framework detection, build command, output directory); routes (rewrites, redirects, custom headers); functions (runtime, memory, timeout); crons (scheduled invocation). Example: `{"buildCommand": "npm run build", "outputDirectory": "dist", "framework": "nextjs", "routes": [{"src": "/api/(.*)", "dest": "/api/$1"}]}`
## Deployment Strategies
### Preview per PR
Every pull request gets its own deployment. URL pattern: `https://{project}-{hash}-{scope}.vercel.app`
### Staging Environment
Use Vercel's environment feature or dedicated branch:
```yaml
# Deploy to staging on develop branch push
on:
  push:
    branches: [develop]
```
### Production with Approval
Use GitHub environment protection rules for production deployments:
```yaml
jobs:
  deploy:
    environment: production  # Requires approval in GitHub settings
```
### Instant Rollback
Vercel maintains deployment history. Use `deployCommands.list` to enumerate, then `deployCommands.rollback` (substitute `{deploymentUrl}`) to promote previous deployment.
## Monitoring and Debugging
### Deployment Logs
Use `deployCommands.logs` (substitute `{deploymentUrl}`) for build logs, or `deployCommands.inspect` for deployment metadata. Both live in config.
### Runtime Logs
Use `deployCommands.logsFollow` (substitute `{deploymentUrl}`) for live streaming. Dashboard's Functions tab also available; ask user what they see rather than describing navigation path.
### Health Checks
After deployment, verify application responds correctly via GitHub Actions step that curls `$DEPLOY_URL/api/health` with `-w "%{http_code}"` and exits 1 if status != 200.
## Common Pitfalls and Troubleshooting
### Build Failures
- **Missing environment variables**: Ensure all required env vars set in Vercel Dashboard for correct environment scope
- **Node.js version mismatch**: Set `engines.node` in `package.json` or configure in Vercel project settings
- **Build command not found**: Verify `buildCommand` in `vercel.json` matches `package.json` scripts
### Deployment Issues
- **404 on client-side routes**: Add rewrite rule for SPA routing:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **API routes not working**: Ensure serverless functions in correct directory (`/api` by default)
- **Large deployment size**: Check `.vercelignore` to exclude unnecessary files
### CI/CD Issues
- **Token expired**: Vercel tokens can expire. Regenerate in Dashboard > Settings > Tokens
- **Rate limiting**: Avoid deploying on every commit. Use `paths-ignore` to skip documentation changes
- **Concurrent deployments**: Vercel handles concurrent deployments gracefully, but consider using GitHub's concurrency groups to cancel superseded runs
## Related Skills
- **`ci-cd-pipeline-design`** — Architecture patterns for CI/CD pipelines
## Resources
| File | Purpose |
|------|---------|
| `resources/vercel-project-setup.config.json` | Volatile knobs (CLI commands, deploy subcommand templates, GitHub Action pin + inputs, required secrets). Re-read at every invocation. |
| `resources/vercel-project-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/vercel.json` | Reference Vercel project configuration. |
| `resources/deploy.yml` | GitHub Actions workflow for preview and production deployments. |
| `resources/env-setup.md` | Environment variable setup guide. |
| `docs/vercel-project-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
