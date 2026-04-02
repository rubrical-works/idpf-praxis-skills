# Render Environment Variable Setup

## Required GitHub Repository Secrets

### 1. RENDER_API_KEY

**Where to get it:** Render Dashboard > Account Settings > API Keys

1. Go to https://dashboard.render.com/u/settings
2. Scroll to "API Keys"
3. Click "Create API Key"
4. Copy the key immediately

**Add to GitHub:** Repository > Settings > Secrets and variables > Actions > New repository secret

## GitHub Actions Variables (non-secret)

Set in Repository > Settings > Secrets and variables > Actions > Variables tab:

| Variable | Description | Example |
|----------|-------------|---------|
| `RENDER_SERVICE_ID` | Service ID for deployment API calls | `srv-xxxxxxxxxxxx` |
| `RENDER_PRODUCTION_URL` | Production URL for health checks | `https://my-app.onrender.com` |

## Render Service Variables

Set in Render Dashboard (Service > Environment tab):

| Variable | Scope | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Auto-injected | Database connection (for Render databases) |
| `PORT` | Auto-injected | Default: 10000 |
| `RENDER` | Auto-injected | Set to `true` in Render environments |
| `RENDER_EXTERNAL_URL` | Auto-injected | Public URL of the service |
| `IS_PULL_REQUEST` | Preview only | Set to `true` in preview environments |

## Tips

- Use Environment Groups for variables shared across services
- Render auto-restarts services when environment variables change
- Preview environments inherit variables from the parent service
- Use `render.yaml` `envVars` section for Infrastructure as Code variable management
- Secret files (certificates, keys) can be stored as Render secret files, not env vars
