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
**Purpose:** Guide developers through setting up Render deployments with GitHub integration
**Audience:** Developers deploying web applications, APIs, and static sites to Render
**Related Skills:** `ci-cd-pipeline-design`
## Step 0 — Re-read Config (MANDATORY)
Read `resources/render-project-setup.config.json` from disk and validate against `resources/render-project-setup.config.schema.json` at start of every invocation. Config is source of truth for (optional) CLI install command, deploy-trigger API endpoint and curl template, required secrets, default HTTP port, preview URL pattern. SKILL.md must not duplicate values.
## Overview
Render uses IaC via `render.yaml` blueprints, supports automatic preview environments for PRs, offers native GitHub integration with zero-configuration deploys.
## Initial Setup
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before running `npm install -g @render-cli/cli` or creating/connecting a Render service and adding a `render.yaml` blueprint to the project.
- **What is asked:** acceptance of responsibility for change to global npm environment, Render account (new services, GitHub integration), and project's `render.yaml` configuration.
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
### Prerequisites
- Render account (free tier available)
- GitHub repository connected to Render
- Render CLI (optional) — install via `cli.installCommand` from config when CLI workflows needed
### Connecting GitHub
Dashboard flow skill cannot script. Ask user what they see in Render dashboard rather than describing a navigation path — dashboard layout unstable. Minimum: sign in with GitHub, grant repository access, create Web Service pointing at target repo and branch.
### Blueprint (Infrastructure as Code)
Render uses `render.yaml` to define services declaratively. See `resources/render.yaml`. Example: `services: - type: web, name: my-app, runtime: node, buildCommand: npm install && npm run build, startCommand: npm start`.
## Environment Configuration
### Environment Variables
Configure in Render Dashboard (Service > Environment tab) or via `render.yaml`:
| Variable | Scope | Description |
|----------|-------|-------------|
| `RENDER_API_KEY` | GitHub Actions | API key for deploy triggers |
| `DATABASE_URL` | Service | Database connection (auto-set for Render databases) |
| `PORT` | Auto-injected | Render assigns port 10000 by default |
### Environment Groups
Render supports shared environment groups across services:
1. Dashboard > Environment Groups > New
2. Add variables shared across services
3. Reference in `render.yaml`: `envVarGroups: [{ name: shared-config }]`
See `resources/env-setup.md`.
## GitHub Integration
### Auto-Deploy on Push
Render auto-deploys when commits land on configured branch. Enable in Service > Settings > Build & Deploy.
### Preview Environments
Render creates preview instances for pull requests automatically:
1. Service > Settings > Preview Environments > Enable
2. Each PR gets unique URL: `https://my-app-pr-{number}.onrender.com`
3. Preview environments use same build/start commands as production
4. Destroyed automatically when PR closed
### GitHub Actions Deployment
See `resources/deploy.yml`. Step: `run: curl -X POST "https://api.render.com/v1/services/${{ vars.RENDER_SERVICE_ID }}/deploys" -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"`.
## Deployment Strategies
### Production via Branch Deploy
Render auto-deploys from configured production branch:
```
main branch → Production service (automatic)
```
### Staging via Separate Service
Create second service pointing to staging branch:
1. Dashboard > New > Web Service
2. Select same repo, different branch (e.g., `develop`)
3. Configure staging-specific environment variables
### Blue-Green Deployments
Render performs zero-downtime deployments by default: new version built alongside running version; health check passes → traffic switches; old version terminated.
### Manual Deploy and Rollback
Via Dashboard: Service > Deploys > select previous deploy > Rollback. Via API: `curl -X POST "https://api.render.com/v1/services/{service-id}/deploys" -H "Authorization: Bearer $RENDER_API_KEY"`.
## Monitoring and Debugging
### Logs
Access in Render Dashboard (Service > Logs) or via API:
- Build logs show full build process
- Runtime logs stream application output
- Log filtering by time range and search
### Metrics
Render provides built-in metrics for: CPU and memory usage; HTTP request rate and latency; bandwidth consumption.
### Health Checks
Configure health check path in `render.yaml` (`services: - type: web, healthCheckPath: /api/health`) or Dashboard. Render checks endpoint after deployment and rolls back if it fails.
## Common Pitfalls and Troubleshooting
### Build Issues
- **Build timeout**: Default 30-minute limit. Optimize build steps or use build caching
- **Node.js version**: Specify in `engines` field in `package.json` or use `RENDER_NODE_VERSION` env var
- **Missing native dependencies**: Use `render.yaml` `preDeployCommand` to install system packages
### Deployment Issues
- **Port binding**: Render expects your app on `defaults.httpPort` (from config) or `PORT` env var. Always use `process.env.PORT`
- **Cold starts on free tier**: Free instances spin down after `defaults.freeTierIdleMinutes` of inactivity (from config). Upgrade for always-on
- **Static site routing**: For SPAs, set rewrite rules to redirect all routes to `index.html`
### Preview Environment Issues
- **Database sharing**: Preview environments share production database by default. Use separate databases for isolation
- **Environment variable conflicts**: Preview environments inherit from main service. Override specific variables in preview settings
- **Cost awareness**: Each preview environment is a separate service instance. Monitor usage on team plans
## Related Skills
- **`ci-cd-pipeline-design`** — Architecture patterns for CI/CD pipelines
## Resources
| File | Purpose |
|------|---------|
| `resources/render-project-setup.config.json` | Volatile knobs (CLI install, API templates, secrets, default port, preview URL pattern). Re-read at every invocation. |
| `resources/render-project-setup.config.schema.json` | JSON Schema validating the config. |
| `resources/render.yaml` | Reference Render blueprint configuration. |
| `resources/deploy.yml` | GitHub Actions workflow for Render deployment. |
| `resources/env-setup.md` | Environment variable setup guide. |
| `docs/render-project-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
