---
name: seo-optimization
description: Provide structured SEO guidance for web projects covering technical foundations and content optimization
type: educational
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [seo, html, meta-tags, structured-data, sitemap]
copyright: "Rubrical Works (c) 2026"
---

# SEO Optimization

**Purpose:** Guide developers through implementing SEO best practices during development rather than retrofitting them after launch.
**Audience:** Developers building web-facing applications who need discoverability.
**Related Skills:** `ci-cd-pipeline-design` — for deployment automation that preserves SEO settings

---

## When to Use This Skill

Invoke this skill when:

- Setting up a new web project that needs search engine visibility
- Adding meta tags, structured data, or social sharing metadata to pages
- Auditing an existing site for SEO gaps
- Configuring sitemaps, robots.txt, or canonical URLs
- Structuring content with proper heading hierarchy and semantic HTML
- Optimizing internal linking for crawlability and user navigation

---

## Overview

The `seo-optimization` skill covers two core areas:

1. **Technical SEO** — The infrastructure that search engines need to discover, crawl, and index your content (meta tags, structured data, sitemaps, robots.txt, canonical URLs, Open Graph/Twitter Cards)
2. **Content Optimization** — The structural patterns that help search engines understand your content hierarchy and relevance (heading hierarchy, semantic HTML, content structure, internal linking)

### What This Skill Does NOT Cover (v1)

These topics are deferred to a future version:

- Keyword research methodology and intent mapping
- Core Web Vitals deep-dive (LCP, FID/INP, CLS as ranking factors)
- Framework-specific guidance (SSR/SSG, SPA meta tag management)
- Accessibility-SEO overlap (covered partly by the `accessibility` domain framework)

See `Docs/02-Advanced/Skill-Guide-SEO.md` for curated external references on deferred topics.

---

## Technical SEO Essentials

### Meta Tags

Every page needs these foundational meta tags:

```html
<head>
  <title>Page Title — Site Name</title>
  <meta name="description" content="A concise 150-160 character summary of the page content.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta charset="UTF-8">
  <link rel="canonical" href="https://example.com/current-page">
</head>
```

**Rules:**
- `<title>` — 50-60 characters, unique per page, primary keyword near the front
- `meta description` — 150-160 characters, compelling summary, unique per page
- `canonical` — Always set to prevent duplicate content issues

### Structured Data (JSON-LD)

Structured data helps search engines understand page content and enables rich results (snippets, cards, breadcrumbs).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Implement SEO",
  "author": {
    "@type": "Person",
    "name": "Developer Name"
  },
  "datePublished": "2026-01-15",
  "description": "A guide to implementing SEO best practices."
}
</script>
```

**Common schema.org types:** `Article`, `Product`, `Organization`, `BreadcrumbList`, `FAQPage`, `HowTo`, `WebSite`, `LocalBusiness`

Validate with [Google Rich Results Test](https://search.google.com/test/rich-results) or [Schema.org Validator](https://validator.schema.org/).

### Sitemaps

A sitemap tells search engines which pages exist and when they were last updated.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-01-10</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Rules:**
- Place at `/sitemap.xml`
- Reference from `robots.txt`: `Sitemap: https://example.com/sitemap.xml`
- Regenerate on content changes (automate in CI/CD)
- Max 50,000 URLs per sitemap; use sitemap index for larger sites

### robots.txt

Controls which pages crawlers can access.

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
```

**Rules:**
- Place at site root (`/robots.txt`)
- Never block CSS/JS files (search engines need them to render pages)
- Use `Disallow` for admin panels, API endpoints, duplicate pages
- Always include `Sitemap` directive

### Canonical URLs

Canonical URLs prevent duplicate content penalties when the same content is accessible at multiple URLs.

```html
<link rel="canonical" href="https://example.com/page">
```

**When to use:**
- `http://` vs `https://` variations
- `www.` vs non-www variations
- URL parameters (e.g., `?sort=price` vs base URL)
- Paginated content pointing to the "main" page
- Syndicated content pointing to the original source

### Open Graph and Twitter Cards

Social sharing metadata controls how pages appear when shared on social media.

```html
<!-- Open Graph (Facebook, LinkedIn, etc.) -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Page description for social sharing.">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="article">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Page description for Twitter.">
<meta name="twitter:image" content="https://example.com/image.jpg">
```

**Rules:**
- `og:image` — Minimum 1200x630px for optimal display
- `twitter:card` — Use `summary_large_image` for articles, `summary` for profiles
- Set on every shareable page, not just the homepage

---

## Content Optimization Essentials

### Heading Hierarchy

A clear heading hierarchy helps both search engines and users understand content structure.

```html
<h1>Main Page Title</h1>          <!-- One per page, contains primary keyword -->
  <h2>Major Section</h2>          <!-- Subtopics -->
    <h3>Subsection</h3>           <!-- Details within subtopics -->
    <h3>Another Subsection</h3>
  <h2>Another Major Section</h2>
    <h3>Subsection</h3>
```

**Rules:**
- Exactly one `<h1>` per page
- Never skip levels (e.g., `<h1>` directly to `<h3>`)
- Headings should read as a logical outline of the page content
- Include relevant keywords naturally, not forced

### Semantic HTML

Semantic HTML elements give meaning to content structure, helping search engines understand page layout.

```html
<header>
  <nav><!-- Site navigation --></nav>
</header>

<main>
  <article>
    <header>
      <h1>Article Title</h1>
      <time datetime="2026-01-15">January 15, 2026</time>
    </header>

    <section>
      <h2>Introduction</h2>
      <p>Content here...</p>
    </section>

    <section>
      <h2>Main Points</h2>
      <p>More content...</p>
    </section>
  </article>

  <aside>
    <!-- Related content, sidebar -->
  </aside>
</main>

<footer>
  <!-- Site footer, copyright, links -->
</footer>
```

**Key elements:**
| Element | SEO Purpose |
|---------|-------------|
| `<main>` | Identifies primary content (one per page) |
| `<article>` | Self-contained content (blog post, news article) |
| `<section>` | Thematic grouping of content |
| `<nav>` | Navigation blocks (site nav, breadcrumbs) |
| `<header>` | Introductory content for page or section |
| `<footer>` | Footer content (copyright, links) |
| `<aside>` | Tangentially related content (sidebars) |
| `<time>` | Machine-readable dates (use `datetime` attribute) |

### Content Structure

Well-structured content improves both readability and search ranking.

**Principles:**
- **Front-load key information** — Put the most important content first (inverted pyramid)
- **Use lists** — Ordered and unordered lists are easier to scan and may appear as featured snippets
- **Short paragraphs** — 2-3 sentences per paragraph for readability
- **Descriptive link text** — Use "read the SEO guide" not "click here"
- **Image alt text** — Describe every image for accessibility and image search

```html
<!-- Good: Descriptive link text -->
<a href="/guide">Read the complete SEO implementation guide</a>

<!-- Bad: Generic link text -->
<a href="/guide">Click here</a>
```

### Internal Linking

Internal links help search engines discover pages and understand site structure.

**Strategy:**
- **Hub-and-spoke model** — Create topic "hub" pages that link to related detail pages
- **Contextual links** — Link from within content where relevant, not just navigation menus
- **Descriptive anchor text** — Use keyword-rich, descriptive text for internal links
- **Reasonable depth** — Every page should be reachable within 3 clicks from the homepage
- **Fix broken links** — Regularly audit for 404s; use redirects for moved content

```html
<!-- Good: Contextual internal link with descriptive anchor text -->
<p>For deployment best practices, see our
  <a href="/guides/deployment-checklist">deployment checklist</a>.</p>

<!-- Bad: Orphaned page with no internal links pointing to it -->
```

**Audit checklist:**
- [ ] All important pages are linked from at least one other page
- [ ] No orphan pages (pages with zero internal links pointing to them)
- [ ] Anchor text is descriptive and relevant
- [ ] No excessive links on a single page (aim for under 100 per page)

---

## Quick Reference Checklist

Use this checklist when reviewing a page for SEO completeness:

### Technical SEO
- [ ] `<title>` tag set (50-60 chars, unique)
- [ ] `meta description` set (150-160 chars, unique)
- [ ] Canonical URL set
- [ ] Open Graph tags set (`og:title`, `og:description`, `og:image`, `og:url`)
- [ ] Twitter Card tags set
- [ ] Structured data (JSON-LD) present where applicable
- [ ] Page included in sitemap
- [ ] Not blocked by robots.txt

### Content Optimization
- [ ] Single `<h1>` per page
- [ ] Heading hierarchy follows logical order (no skipped levels)
- [ ] Semantic HTML elements used (`<main>`, `<article>`, `<nav>`, `<section>`)
- [ ] Descriptive link text (no "click here")
- [ ] Images have `alt` attributes
- [ ] Internal links to related content
- [ ] Content is front-loaded (key information first)

---
