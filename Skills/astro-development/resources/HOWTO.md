# Using astro-development Without IDPF Framework

Architectural decision patterns for the Astro web framework -- Islands hydration directives, Content Collections with type-safe schemas, multi-framework integration, and deployment adapter selection.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Main guide covering Islands Architecture overview, Content Collections API, rendering modes, and quick-reference decision table |
| `resources/islands-architecture.md` | Deep dive into hydration directives (`client:load`, `client:idle`, `client:visible`, etc.) with decision flowchart and performance trade-offs |
| `resources/content-collections.md` | Schema design patterns with Zod validation, querying strategies, cross-collection references, and migration guidance |
| `resources/integration-and-deployment.md` | Multi-framework integration (React + Vue + Svelte), rendering mode selection (static/hybrid/server), and deployment adapter configuration |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/astro-development/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
This is an Astro project. When making architectural decisions about hydration
directives, Content Collection schemas, rendering modes, or deployment adapters,
read .claude/skills/astro-development/SKILL.md first. Load the relevant resource
file from resources/ for detailed guidance on Islands architecture, content
collections, or integration/deployment.
```

## Customization

- Update `resources/islands-architecture.md` if your project has specific hydration rules (e.g., "always use `client:visible` for below-fold components").
- Extend `resources/content-collections.md` with your project's actual collection schemas and custom Zod validators.
- Edit `resources/integration-and-deployment.md` to document your chosen deployment adapter and hosting platform configuration.

## How IDPF Projects Use This

In IDPF projects, this skill is loaded on demand when working on Astro-based applications. The framework detects `astro` in the tech stack and makes this skill available for architectural decisions. When a developer asks about hydration, content schemas, or deployment, the relevant resource file is read into context. The approach above replicates that behavior for any Claude Code project.
