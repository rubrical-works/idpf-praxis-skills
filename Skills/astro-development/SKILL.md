---
name: astro-development
description: Architectural decision patterns for Astro web framework — Islands hydration, Content Collections, multi-framework integration, and deployment
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [astro, javascript, typescript, react, vue, svelte]
copyright: "Rubrical Works (c) 2026"
---
# Astro Development
Architectural decision patterns for Astro. When/why to use specific features.
## When to Use
- Choosing hydration directives for interactive components
- Designing Content Collection schemas
- Mixing UI frameworks (React, Vue, Svelte)
- Choosing rendering modes (static/server/hybrid)
- Selecting deployment adapters
## Prerequisites
Node.js 18+, Astro project (`npm create astro@latest`), familiarity with HTML/CSS/JS and one component framework. **Target:** Astro v4.x+
## Quick Reference
| Decision | Resource |
|----------|----------|
| Hydration directive | [islands-architecture.md](resources/islands-architecture.md) |
| Content with type safety | [content-collections.md](resources/content-collections.md) |
| Mix frameworks / rendering / adapters | [integration-and-deployment.md](resources/integration-and-deployment.md) |
## Islands Architecture
Static HTML default. Interactive components hydrate independently as "islands."
| Directive | Loads When | Use For |
|-----------|-----------|---------|
| `client:load` | Immediately | Critical interactive (buy buttons, nav) |
| `client:idle` | Browser idle | Non-critical (comments, chat) |
| `client:visible` | In viewport | Below-fold (carousels) |
| `client:media` | Media query match | Responsive-only (mobile menu) |
| `client:only` | Immediately, no SSR | Canvas, WebGL |
| No directive | Never | Static content |
Default: no directive. Add `client:*` only when needed. See [islands-architecture.md](resources/islands-architecture.md).
## Content Collections
Organized content with schema validation and TypeScript types. Define in `src/content.config.ts` with loader + Zod schema.
**APIs:** `getCollection('blog')`, `getEntry('blog', 'id')`, `render()`, `reference('authors')`. See [content-collections.md](resources/content-collections.md).
## Rendering Modes
| Mode | Server Required | Best For |
|------|-----------------|----------|
| Static (default) | No | Blogs, docs, marketing |
| Hybrid | Yes (adapter) | Mostly static + some dynamic |
| Server | Yes (adapter) | Auth, real-time, personalization |
Start static. Opt routes into SSR with `export const prerender = false`. See [integration-and-deployment.md](resources/integration-and-deployment.md).
