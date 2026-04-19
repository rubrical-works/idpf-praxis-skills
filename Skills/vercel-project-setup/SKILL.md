---
name: vercel-project-setup
description: Configure automated preview, staging, and production deployments with Vercel
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [vercel, next, react, node, deployment]
copyright: "Rubrical Works (c) 2026"
---
# Skill: vercel-project-setup
**Purpose:** Guide setting up Vercel deployments with GitHub Actions integration.
**Audience:** Developers deploying web apps to Vercel.
**Related:** `ci-cd-pipeline-design` — broader CI/CD architecture.
## Overview
Structured guidance for Vercel deployments across preview/staging/production: initial setup via Vercel CLI, GitHub Actions workflows, env var management, monitoring.
## Initial Setup
## Responsibility Acknowledgement Gate
Implements the pattern in the **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When:** before `npm install -g vercel`, `vercel login`, `vercel link`/`vercel`.
- **What is asked:** responsibility for changes to global npm env, local `.vercel/` directory, Vercel account/project binding.
- **On decline:** exit cleanly; "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation.
Use `AskUserQuestion` with (`"I accept responsibility — proceed"` / `"Decline — exit without changes"`).
### Prerequisites
- Vercel account (free tier available)
- Vercel CLI: `npm install -g vercel`
- GitHub repo with push access
### Linking Your Project
```bash
# Login to Vercel
vercel login

# Link existing project (run from project root)
vercel link

# Or create a new project
vercel
```
Creates `.vercel/` with `project.json` (org/project IDs).
## Environment Configuration
### Required Secrets
Configure in GitHub repo (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `VERCEL_TOKEN` | Vercel Dashboard > Settings > Tokens | API auth token |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` | Org ID |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` | Project ID |
### Environment Variables
Set in Vercel Dashboard (Project > Settings > Environment Variables):
- **Production**: production deployments only
- **Preview**: preview/PR deployments
- **Development**: during `vercel dev`
See `resources/env-setup.md`.
## GitHub Integration
### Preview Deployments
Unique URL per PR for team review before merge.
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
URL auto-commented on the PR.
### Production Deployments
On push to main or release tag:
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
Configures build, routes, headers, redirects. See `resources/vercel.json`. Key areas: build settings (framework, command, output dir), routes (rewrites/redirects/headers), functions (runtime/memory/timeout), crons.
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "nextjs",
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
```
## Deployment Strategies
### Preview per PR
URL: `https://{project}-{hash}-{scope}.vercel.app`.
### Staging
Vercel environments or dedicated branch:
```yaml
on:
  push:
    branches: [develop]
```
### Production with Approval
GitHub environment protection rules:
```yaml
jobs:
  deploy:
    environment: production  # Requires approval in GitHub settings
```
### Instant Rollback
```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel rollback [deployment-url]
```
## Monitoring and Debugging
### Deployment Logs
```bash
vercel logs [deployment-url]
vercel inspect [deployment-url]
```
### Runtime Logs
Vercel Dashboard (Project > Deployments > Functions) or:
```bash
vercel logs [deployment-url] --follow
```
### Health Checks
```yaml
- name: Health Check
  run: |
    DEPLOY_URL="${{ steps.deploy.outputs.preview-url }}"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/health")
    if [ "$STATUS" != "200" ]; then
      echo "Health check failed (status: $STATUS)"
      exit 1
    fi
```
## Troubleshooting
### Build Failures
- Missing env vars → set in Vercel Dashboard for correct scope.
- Node version mismatch → `engines.node` in `package.json` or Vercel settings.
- Build command not found → verify `buildCommand` matches `package.json` scripts.
### Deployment Issues
- 404 on client-side routes → SPA rewrite:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- API routes not working → functions in `/api` by default.
- Large size → check `.vercelignore`.
### CI/CD
- Token expired → regenerate in Dashboard > Settings > Tokens.
- Rate limiting → `paths-ignore` to skip docs.
- Concurrent deploys → GitHub concurrency groups cancel superseded runs.
## Related Skills
- `ci-cd-pipeline-design` — CI/CD architecture, stage design, security.
## Resources
- `resources/vercel.json` — reference config
- `resources/deploy.yml` — GitHub Actions workflow
- `resources/env-setup.md` — env var guide
