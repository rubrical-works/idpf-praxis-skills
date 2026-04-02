# Integration and Deployment Patterns
## Multi-Framework Integration
Astro supports mixing multiple UI frameworks in a single project. Each framework integration renders independently — they don't share state or lifecycle.
### Adding Integrations
```bash
npx astro add react
npx astro add react svelte vue
```
Updates `astro.config.mjs` automatically:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
export default defineConfig({
  integrations: [react(), svelte()],
});
```
### Supported UI Frameworks
| Framework | Package | JSX/Template |
|-----------|---------|-------------|
| React | `@astrojs/react` | `.jsx` / `.tsx` |
| Preact | `@astrojs/preact` | `.jsx` / `.tsx` |
| Vue | `@astrojs/vue` | `.vue` |
| Svelte | `@astrojs/svelte` | `.svelte` |
| Solid | `@astrojs/solid-js` | `.jsx` / `.tsx` |
| Alpine.js | `@astrojs/alpinejs` | Inline directives |
### When to Mix Frameworks
| Scenario | Recommended Approach |
|----------|---------------------|
| Team has React and Vue developers | Use both — each team works in their framework |
| Migrating from React to Svelte | Add Svelte, migrate incrementally, remove React when done |
| Need a specific library (e.g., React Three Fiber) | Add React for that component only |
| Building everything from scratch | Pick one framework and stick with it |
| Prototyping with existing component libraries | Use whichever framework the library targets |
### Multi-Framework Considerations
**File extension conflicts:** React and Solid both use `.jsx`/`.tsx`. If using both, configure explicit file inclusion:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
export default defineConfig({
  integrations: [
    react({ include: ['**/react/*'] }),
    solid({ include: ['**/solid/*'] }),
  ],
});
```
Organize components accordingly:
```
src/components/
  react/
    Counter.tsx    -> Rendered by React
  solid/
    Toggle.tsx     -> Rendered by Solid
```
**State sharing between frameworks:** Framework islands are isolated. For cross-island state:
- Use custom events on `document` or `window`
- Use shared stores via `nanostores` (framework-agnostic)
- Pass data through Astro component props (parent coordinates children)
**Bundle size impact:** Each framework adds its runtime:
- React: ~40KB gzipped
- Preact: ~3KB gzipped (React-compatible, much smaller)
- Svelte: ~2KB gzipped (compile-time, minimal runtime)
- Vue: ~33KB gzipped
- Solid: ~7KB gzipped
If you only need one or two React components, consider Preact with `compat` mode to reduce bundle size while maintaining React API compatibility.
## Rendering Mode Selection
### Decision Matrix
```
Does this page need real-time data or user-specific content?
  |
  +- NO -> Static (default)
  |       Pre-rendered at build time, fastest performance
  |
  +- YES -> Does most of the site need dynamic rendering?
              |
              +- NO -> Hybrid mode
              |       Static by default, opt routes into SSR:
              |       export const prerender = false
              |
              +- YES -> Server mode
                       All routes SSR by default, opt routes into static:
                       export const prerender = true
```
### Static Mode (Default)
No configuration needed. All pages pre-rendered at build time.
```javascript
export default defineConfig({});
```
**Best for:** Blogs, documentation, marketing sites, portfolios.
### Hybrid Mode
Static by default. Individual routes opt into server rendering:
```javascript
import node from '@astrojs/node';
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
});
```
```astro
---
// src/pages/dashboard.astro — this route renders on-demand
export const prerender = false;
const user = await getUser(Astro.cookies.get('session'));
---
<h1>Welcome, {user.name}</h1>
```
**Best for:** Mostly static sites with a few dynamic pages (login, dashboard, API routes).
### Server Mode
All routes render on-demand by default:
```javascript
import node from '@astrojs/node';
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
```
Opt specific pages into static rendering:
```astro
---
export const prerender = true;
---
<h1>About Us</h1>
```
**Best for:** Apps with authentication, real-time data, per-user content.
## Deployment Adapter Selection
An adapter is required for hybrid or server rendering modes.
### Official Adapters
| Adapter | Package | Platform | Mode |
|---------|---------|----------|------|
| Node.js | `@astrojs/node` | Self-hosted, Docker, VPS | `standalone` or `middleware` |
| Vercel | `@astrojs/vercel` | Vercel | Serverless or Edge |
| Netlify | `@astrojs/netlify` | Netlify | Serverless or Edge |
| Cloudflare | `@astrojs/cloudflare` | Cloudflare Pages/Workers | Edge |
### Adapter Decision Guide
| Your Setup | Adapter | Why |
|------------|---------|-----|
| Deploying to Vercel | `@astrojs/vercel` | Native integration, zero config |
| Deploying to Netlify | `@astrojs/netlify` | Native integration, zero config |
| Deploying to Cloudflare | `@astrojs/cloudflare` | Edge rendering, global distribution |
| Self-hosting (Docker, VPS) | `@astrojs/node` | Full control, `standalone` mode |
| Behind Express/Fastify | `@astrojs/node` | `middleware` mode for integration |
| Static site only | No adapter needed | No server-side rendering |
### Installation
```bash
npx astro add vercel    # or netlify, cloudflare, node
```
### Node.js Adapter Modes
**Standalone:** Runs as an independent Node.js server:
```javascript
import node from '@astrojs/node';
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
});
```
Start with `node ./dist/server/entry.mjs`.
**Middleware:** Integrates with an existing Node.js framework:
```javascript
import node from '@astrojs/node';
export default defineConfig({
  adapter: node({ mode: 'middleware' }),
});
```
Import the handler into Express, Fastify, or other frameworks.
## Performance Patterns
### Zero-JS by Default
Astro ships zero JavaScript unless you add `client:*` directives. Verify with browser DevTools:
1. Open Network tab, filter by JS
2. Check that only hydrated island scripts appear
3. No framework runtime should load for static-only pages
### Image Optimization
Use Astro's built-in `<Image />` component:
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---
<Image src={heroImage} alt="Hero image" width={800} />
```
**Benefits:** Automatic WebP/AVIF conversion, responsive srcset, lazy loading, CLS prevention.
**When NOT to use:** External images from CDNs that already optimize (Cloudinary, Imgix).
### View Transitions
Enable smooth page transitions without a client-side router:
```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<html>
  <head>
    <ViewTransitions />
  </head>
  <body><slot /></body>
</html>
```
Uses browser-native View Transitions API. Pages still fully reload but with smooth morphing animations. Persistent elements use `transition:persist`:
```astro
<audio id="player" transition:persist>
  <source src="/music.mp3" />
</audio>
```
**When to use:** Sites where page transitions feel jarring. Minimal JavaScript overhead via native browser APIs.
