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
**Purpose:** Guide developers through setting up Render deployments with GitHub integration
**Audience:** Developers deploying web applications, APIs, and static sites to Render
**Related Skills:** `ci-cd-pipeline-design`
## Initial Setup
### Prerequisites
- Render account (free tier available)
- GitHub repository connected to Render
- Render CLI (optional): `npm install -g @render-cli/cli`
### Connecting GitHub
1. Sign in at https://render.com with your GitHub account
2. Grant repository access in Render Dashboard > Account > GitHub
3. Create a new service: Dashboard > New > Web Service
4. Select your repository and branch
### Blueprint (Infrastructure as Code)
```yaml
services:
  - type: web
    name: my-app
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```
## Environment Configuration
### Environment Variables
Configure in Render Dashboard (Service > Environment tab) or via `render.yaml`:
| Variable | Scope | Description |
|----------|-------|-------------|
| `RENDER_API_KEY` | GitHub Actions | API key for deploy triggers |
| `DATABASE_URL` | Service | Database connection (auto-set for Render databases) |
| `PORT` | Auto-injected | Render assigns port 10000 by default |
### Environment Groups
1. Dashboard > Environment Groups > New
2. Add variables shared across services
3. Reference in `render.yaml`: `envVarGroups: [{ name: shared-config }]`
See `resources/env-setup.md` for complete guide.
## GitHub Integration
### Auto-Deploy on Push
Render auto-deploys when commits land on the configured branch. Enable in Service > Settings > Build & Deploy.
### Preview Environments
1. Service > Settings > Preview Environments > Enable
2. Each PR gets a unique URL: `https://my-app-pr-{number}.onrender.com`
3. Preview environments use same build/start commands as production
4. Destroyed automatically when the PR is closed
### GitHub Actions Deployment
```yaml
- name: Trigger Render Deploy
  run: |
    curl -X POST "https://api.render.com/v1/services/${{ vars.RENDER_SERVICE_ID }}/deploys"
      -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```
## Deployment Strategies
### Production via Branch Deploy
```
main branch -> Production service (automatic)
```
### Staging via Separate Service
1. Dashboard > New > Web Service
2. Select same repo, different branch (e.g., `develop`)
3. Configure staging-specific environment variables
### Blue-Green Deployments
Render performs zero-downtime deployments by default:
- New version built alongside running version
- Health check passes -> traffic switches
- Old version terminated
### Manual Deploy and Rollback
```bash
# Via Render Dashboard: Service > Deploys > select previous deploy > Rollback
# Via API
curl -X POST "https://api.render.com/v1/services/{service-id}/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY"
```
## Monitoring and Debugging
### Logs
Access in Render Dashboard (Service > Logs) or via API:
- Build logs show the full build process
- Runtime logs stream application output
- Log filtering by time range and search
### Metrics
- CPU and memory usage
- HTTP request rate and latency
- Bandwidth consumption
### Health Checks
```yaml
services:
  - type: web
    healthCheckPath: /api/health
```
Render checks the health endpoint after deployment and rolls back if it fails.
## Common Pitfalls and Troubleshooting
### Build Issues
- **Build timeout**: Default 30-minute limit. Optimize build steps or use build caching
- **Node.js version**: Specify in `engines` field in `package.json` or use `RENDER_NODE_VERSION` env var
- **Missing native dependencies**: Use `render.yaml` `preDeployCommand` to install system packages
### Deployment Issues
- **Port binding**: Render expects your app on port 10000 (or `PORT` env var). Always use `process.env.PORT`
- **Cold starts on free tier**: Free instances spin down after 15 minutes of inactivity
- **Static site routing**: For SPAs, set rewrite rules to redirect all routes to `index.html`
### Preview Environment Issues
- **Database sharing**: Preview environments share the production database by default; use separate databases for isolation
- **Environment variable conflicts**: Preview environments inherit from main service; override in preview settings
- **Cost awareness**: Each preview environment is a separate service instance
## Resources
- `resources/render.yaml` — Reference Render blueprint configuration
- `resources/deploy.yml` — GitHub Actions workflow for Render deployment
- `resources/env-setup.md` — Environment variable setup guide
