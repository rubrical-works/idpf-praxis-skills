# Railway Environment Variable Setup

## Required GitHub Repository Secrets

### 1. RAILWAY_TOKEN

**Where to get it:** Railway Dashboard > Account Settings > Tokens

1. Go to https://railway.app/account/tokens
2. Click "Create Token"
3. Name it (e.g., "GitHub Actions")
4. Copy the token immediately

**Add to GitHub:** Repository > Settings > Secrets and variables > Actions > New repository secret

## GitHub Actions Variables (non-secret)

Set these in Repository > Settings > Secrets and variables > Actions > Variables tab:

| Variable | Description | Example |
|----------|-------------|---------|
| `RAILWAY_SERVICE` | Service name for production deployment | `web` |
| `RAILWAY_PRODUCTION_URL` | Production URL for health checks | `https://myapp.up.railway.app` |

## Railway Service Variables

Set per-service in Railway Dashboard (Service > Variables tab):

| Variable | Scope | Description |
|----------|-------|-------------|
| `DATABASE_URL` | All environments | Database connection (auto-set for Railway databases) |
| `PORT` | Auto-injected | Railway assigns the port automatically |
| `RAILWAY_ENVIRONMENT` | Auto-injected | Current environment name |
| `REDIS_URL` | All environments | Redis connection (auto-set for Railway Redis) |

## Tips

- Railway auto-injects `PORT` — always use `process.env.PORT` for your server
- Use Railway's internal networking for service-to-service communication (e.g., `${{web.RAILWAY_PRIVATE_DOMAIN}}`)
- Shared variables propagate across all services in a project
- PR environment variables inherit from the parent environment (staging by default)
