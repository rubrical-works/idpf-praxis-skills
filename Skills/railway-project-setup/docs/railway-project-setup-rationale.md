# railway-project-setup Rationale

Preserved prose from the original SKILL.md. SKILL.md now references `resources/railway-project-setup.config.json` for volatile values.

## CLI is the primary path

Unlike Render where the CLI is optional, Railway's `railway` CLI is required for the `railway up`-from-CI flow this skill recommends. The CLI commands (`up`, `logs`, `rollback`, etc.) are the substantive volatile surface — they ship in the config so a Railway CLI subcommand rename is a JSON edit.

## Auto-injected environment variables

Railway injects `PORT`, `RAILWAY_ENVIRONMENT`, and `RAILWAY_SERVICE_NAME` into running services. The config records this list (`autoInjectedEnv`) so the skill can warn when a user shadows one of them in their own env config — a common source of confusion.

## Why no GitHub Action reference

Railway does not maintain an official GitHub Action; the recommended path is `railway up` from a workflow step with the CLI installed. No action `uses:` line lives in the config because there is no stable upstream pin to record.

## PR environment isolation

Railway's PR environments share project resource limits and may clone databases (which costs money on large datasets). These behaviors are documented in SKILL.md prose since they are policy/design observations, not volatile knobs.

## Wizard prose removal

UI navigation paths ("Dashboard > New > Web Service", "Project > Settings > Environments") were removed and replaced with "ask the user what they see" prompts.
