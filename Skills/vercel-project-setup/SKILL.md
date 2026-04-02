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
**Purpose:** Guide developers through setting up Vercel deployments with GitHub Actions integration
**Audience:** Developers deploying web applications to Vercel
**Related Skills:** `ci-cd-pipeline-design` -- for broader CI/CD pipeline architecture
## Initial Setup
### Prerequisites
- Vercel account (free tier available)
- Vercel CLI installed: `npm install -g vercel`
- GitHub repository with push access
### Linking Your Project
```bash
vercel login
vercel link    # From project root, creates .vercel/project.json
```
## Environment Configuration
### Required Secrets
Configure in GitHub repository settings (Settings > Secrets and variables > Actions):
| Secret | Source | Description |
|--------|--------|-------------|
| `VERCEL_TOKEN` | Vercel Dashboard > Settings > Tokens | API authentication token |
| `VERCEL_ORG_ID` | `.vercel/project.json` -> `orgId` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` -> `projectId` | Your Vercel project ID |
### Environment Variables
Set in Vercel Dashboard (Project > Settings > Environment Variables):
- **Production**: Variables available only in production deployments
- **Preview**: Variables available in preview/PR deployments
- **Development**: Variables available during `vercel dev`
See `resources/env-setup.md` for complete environment variable setup guide.
## GitHub Integration
### Automated Preview Deployments
```yaml
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
Preview URL is automatically commented on the PR.
### Production Deployments
```yaml
on:
  push:
    branches: [main]
steps:
  - uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-args: '--prod'
```
## Custom Configuration
### vercel.json
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
Key areas: build settings, routes/rewrites/redirects, serverless function config, cron jobs.
## Deployment Strategies
### Preview per PR
Every PR gets its own deployment: `https://{project}-{hash}-{scope}.vercel.app`
### Staging Environment
```yaml
on:
  push:
    branches: [develop]
```
### Production with Approval
```yaml
jobs:
  deploy:
    environment: production  # Requires approval in GitHub settings
```
### Instant Rollback
```bash
vercel ls                          # List recent deployments
vercel rollback [deployment-url]   # Promote previous deployment
```
## Monitoring and Debugging
```bash
vercel logs [deployment-url]            # View build logs
vercel inspect [deployment-url]         # Inspect deployment details
vercel logs [deployment-url] --follow   # Runtime logs
```
### Health Check (in workflow)
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
- **Missing environment variables**: Ensure env vars set in Vercel Dashboard for correct scope
- **Node.js version mismatch**: Set `engines.node` in `package.json` or configure in Vercel settings
- **Build command not found**: Verify `buildCommand` in `vercel.json` matches `package.json` scripts
### Deployment Issues
- **404 on client-side routes**: Add SPA rewrite:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **API routes not working**: Ensure functions in `/api` directory
- **Large deployment size**: Check `.vercelignore`
### CI/CD Issues
- **Token expired**: Regenerate in Dashboard > Settings > Tokens
- **Rate limiting**: Use `paths-ignore` to skip documentation changes
- **Concurrent deployments**: Use GitHub concurrency groups to cancel superseded runs
## Resources
- `resources/vercel.json` -- Reference Vercel project configuration
- `resources/deploy.yml` -- GitHub Actions workflow for preview and production deployments
- `resources/env-setup.md` -- Environment variable setup guide
