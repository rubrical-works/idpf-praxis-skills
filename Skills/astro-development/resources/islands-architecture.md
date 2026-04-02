# Islands Architecture Decision Guide
## Decision Flowchart
For each component on a page, ask these questions in order:
```
Does this component need browser interactivity?
  |
  +- NO -> Use no directive (renders as static HTML, zero JS shipped)
  |
  +- YES -> Does it need to work immediately on page load?
              |
              +- YES -> Does it require client-only rendering (no SSR)?
              |          |
              |          +- YES -> client:only="framework"
              |          |        (canvas, WebGL, browser-only APIs)
              |          |
              |          +- NO  -> client:load
              |                   (buy buttons, critical navigation, auth forms)
              |
              +- NO  -> Is it below the fold (user must scroll to see it)?
                         |
                         +- YES -> client:visible
                         |        (carousels, accordions, image galleries)
                         |
                         +- NO  -> Is it conditional on screen size?
                                    |
                                    +- YES -> client:media="(query)"
                                    |        (mobile hamburger menu, sidebar toggle)
                                    |
                                    +- NO  -> client:idle
                                             (comment sections, chat, analytics)
```
## Directive Deep Dive
### `client:load` -- Immediate Priority
Hydrates immediately on page load. Renders server-side HTML first, then JavaScript takes over.
```astro
---
import BuyButton from '../components/BuyButton.jsx';
---
<BuyButton client:load productId="abc-123" />
```
**Use when:**
- Above-the-fold interactive elements
- Elements users interact with in the first few seconds
- Auth/login forms that must be ready immediately
**Do NOT use for:**
- Content below the fold (use `client:visible`)
- Non-critical widgets (use `client:idle`)
- Every component "just to be safe" (defeats Islands purpose)
### `client:idle` -- Deferred Priority
Hydrates after page loads and browser fires `requestIdleCallback`. Appears as static HTML until browser has spare cycles.
```astro
---
import CommentSection from '../components/CommentSection.jsx';
---
<CommentSection client:idle postId="123" />
```
**Optional timeout:** `<CommentSection client:idle={{timeout: 3000}} postId="123" />`
**Use when:**
- Visible but non-urgent interactivity (comments, reactions, share buttons)
- Analytics or tracking widgets
- Secondary navigation elements
### `client:visible` -- Viewport Priority
Hydrates only when component scrolls into viewport using `IntersectionObserver`.
```astro
---
import ImageGallery from '../components/ImageGallery.svelte';
---
<ImageGallery client:visible images={galleryData} />
```
**Optional rootMargin:** `<ImageGallery client:visible={{rootMargin: "200px"}} images={galleryData} />`
**Use when:**
- Below-the-fold content (carousels, galleries, accordions)
- Heavy components expensive to hydrate
- Content at the bottom of long pages
### `client:media` -- Conditional Priority
Hydrates only when a CSS media query matches. If the query never matches, JavaScript is never loaded.
```astro
---
import MobileMenu from '../components/MobileMenu.jsx';
---
<MobileMenu client:media="(max-width: 768px)" />
```
**Use when:**
- Mobile-only components (hamburger menus, bottom navigation)
- Components that only matter at specific viewport sizes
**Note:** The component still renders HTML on all viewports -- only JavaScript hydration is conditional.
### `client:only` -- Client-Side Only
Renders entirely on the client. No server-side HTML. Must specify framework name as a string.
```astro
---
import CanvasEditor from '../components/CanvasEditor.jsx';
---
<CanvasEditor client:only="react" />
```
**Fallback content:**
```astro
<CanvasEditor client:only="react">
  <p slot="fallback">Loading editor...</p>
</CanvasEditor>
```
**Use when:**
- Components using browser-only APIs (Canvas, WebGL, Web Audio)
- Third-party widgets that assume a DOM environment
- Components that break during SSR
**Do NOT use for:** Standard interactive components -- use `client:load` for better SEO and initial paint.
## Common Mistakes
### Mistake 1: Hydrating Everything
```astro
<!-- BAD: Every component gets client:load -->
<Header client:load />
<Hero client:load />
<Features client:load />
<Footer client:load />
<!-- GOOD: Only interactive parts get directives -->
<Header />
<Hero />
<Features>
  <FeatureDemo client:visible />
</Features>
<Footer />
```
### Mistake 2: Using `client:load` for Below-Fold Content
```astro
<!-- BAD -->
<TestimonialCarousel client:load />
<!-- GOOD -->
<TestimonialCarousel client:visible />
```
### Mistake 3: Forgetting Framework Name with `client:only`
```astro
<!-- BAD -->
<Widget client:only />
<!-- GOOD -->
<Widget client:only="react" />
```
## Performance Impact
| Directive | Initial JS Impact | Time to Interactive Impact |
|-----------|-------------------|---------------------------|
| No directive | 0 KB | None |
| `client:idle` | Deferred | Minimal |
| `client:visible` | Deferred until scroll | Minimal |
| `client:media` | Conditional | None if query doesn't match |
| `client:load` | Immediate | Proportional to component size |
| `client:only` | Immediate + no SSR HTML | Largest (no static fallback) |
**Rule of thumb:** If fewer than 20% of your page's components use `client:load`, you're using Islands effectively.
