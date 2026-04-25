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

Read `resources/vercel-project-setup.config.json` and validate against `resources/vercel-project-setup.config.schema.json` at every invocation. Config is source of truth for CLI install/login/link commands, all `vercel` deploy subcommand templates, the GitHub Action `uses:` line and its three input names, and the three required secrets. SKILL.md must not duplicate config values.

## Initial Setup

### Responsibility Acknowledgement Gate

Implements the `responsibility-gate` skill pattern. See `Skills/responsibility-gate/SKILL.md`.

- **When fires:** before `npm install -g vercel`, `vercel login`, or `vercel link`/`vercel` to install CLI and link/create a project.
- **What is asked:** acceptance of responsibility for changes to global npm environment, local `.vercel/` directory, and Vercel account/project binding.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation; never persisted across runs.

Use `AskUserQuestion` with the two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).

### Prerequisites

- Vercel account (free tier available)
- Vercel CLI installed via `cli.installCommand` (from config)
- GitHub repository with push access

### Linking Your Project

Use CLI commands from config:

- `cli.loginCommand` — authenticate CLI locally
- `cli.linkCommand` — link to existing Vercel project
- `cli.createCommand` — create new Vercel project

`cli.linkCommand` creates `.vercel/` with `project.json` containing org and project IDs (sourced into `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` per config's `secrets.required`).

## Environment Configuration

### Required Secrets

Configure in GitHub repo (Settings > Secrets and variables > Actions):

| Secret | Source | Description |
|--------|--------|-------------|
| `VERCEL_TOKEN` | Vercel Dashboard > Settings > Tokens | API authentication token |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` | Vercel project ID |

### Environment Variables

Set per-environment in Vercel Dashboard (Project > Settings > Environment Variables):

- **Production**: production deployments
- **Preview**: preview/PR deployments
- **Development**: `vercel dev`

See `resources/env-setup.md`.

## GitHub Integration

### Automated Preview Deployments

Preview deployments create a unique URL per PR.

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

Preview URL is auto-commented on the PR.

### Production Deployments

Triggered on push to main or release tag:

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

Configures build settings, routes, headers, redirects. See `resources/vercel.json`.

- **Build settings**: framework detection, build command, output directory
- **Routes**: rewrites, redirects, custom headers
- **Functions**: serverless function runtime, memory, timeout
- **Crons**: scheduled function invocation

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

URL pattern: `https://{project}-{hash}-{scope}.vercel.app`

### Staging Environment

Use Vercel environments or a dedicated branch:

```yaml
on:
  push:
    branches: [develop]
```

### Production with Approval

Use GitHub environment protection rules:

```yaml
jobs:
  deploy:
    environment: production  # Requires approval in GitHub settings
```

### Instant Rollback

Use `deployCommands.list` to enumerate, then `deployCommands.rollback` (substitute `{deploymentUrl}`) to promote a previous deployment.

## Monitoring and Debugging

### Deployment Logs

Use `deployCommands.logs` (substitute `{deploymentUrl}`) for build logs, or `deployCommands.inspect` for deployment metadata.

### Runtime Logs

Use `deployCommands.logsFollow` (substitute `{deploymentUrl}`) for live streaming. Dashboard's Functions tab also available; ask the user what they see rather than describing navigation.

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

## Common Pitfalls and Troubleshooting

### Build Failures

- **Missing env vars**: ensure required vars set in Vercel Dashboard for correct scope
- **Node.js version mismatch**: set `engines.node` in `package.json` or configure in Vercel project settings
- **Build command not found**: verify `buildCommand` in `vercel.json` matches `package.json` scripts

### Deployment Issues

- **404 on client-side routes**: add SPA rewrite:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **API routes not working**: ensure functions are in correct directory (`/api` by default)
- **Large deployment size**: check `.vercelignore`

### CI/CD Issues

- **Token expired**: regenerate in Dashboard > Settings > Tokens
- **Rate limiting**: avoid deploying every commit; use `paths-ignore` for docs
- **Concurrent deployments**: handled gracefully; consider GitHub concurrency groups to cancel superseded runs

## Related Skills

- **`ci-cd-pipeline-design`** — CI/CD pipeline architecture, stage design, security

## Resources

| File | Purpose |
|------|---------|
| `resources/vercel-project-setup.config.json` | Volatile knobs (CLI commands, deploy templates, GitHub Action pin + inputs, required secrets). Re-read every invocation. |
| `resources/vercel-project-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/vercel.json` | Reference Vercel project configuration. |
| `resources/deploy.yml` | GitHub Actions workflow for preview and production deployments. |
| `resources/env-setup.md` | Environment variable setup guide. |
| `docs/vercel-project-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
