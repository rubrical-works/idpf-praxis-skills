# Technical SEO Reference

Quick-reference for the technical foundations that search engines need to discover, crawl, and index your content.

---

## Meta Tags

### Essential Tags

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Primary Keyword — Brand Name</title>
  <meta name="description" content="Compelling 150-160 character summary with target keywords.">
  <link rel="canonical" href="https://example.com/this-page">
</head>
```

### Title Tag Rules

| Rule | Guideline |
|------|-----------|
| Length | 50-60 characters (Google truncates beyond ~60) |
| Uniqueness | Every page must have a unique `<title>` |
| Keywords | Primary keyword near the front |
| Branding | Brand name at the end: `Page Title — Brand` |
| Separators | Use ` — `, ` | `, or ` - ` between segments |

### Meta Description Rules

| Rule | Guideline |
|------|-----------|
| Length | 150-160 characters |
| Uniqueness | Every page must have a unique description |
| Content | Summarize page value; include a call-to-action |
| Keywords | Include primary keyword naturally |
| No duplicates | Google may ignore duplicate descriptions |

### Additional Useful Meta Tags

```html
<!-- Prevent indexing (for staging, admin, etc.) -->
<meta name="robots" content="noindex, nofollow">

<!-- Language declaration -->
<html lang="en">

<!-- Alternate language versions -->
<link rel="alternate" hreflang="es" href="https://example.com/es/page">
<link rel="alternate" hreflang="en" href="https://example.com/en/page">
```

---

## Structured Data (JSON-LD)

### Why JSON-LD

Search engines use structured data to:
- Display rich results (stars, prices, FAQs, breadcrumbs)
- Understand content type and relationships
- Power knowledge graph entries

JSON-LD is the recommended format over Microdata or RDFa.

### Common Schema Types

#### Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Implement Technical SEO",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2026-01-15",
  "dateModified": "2026-02-01",
  "publisher": {
    "@type": "Organization",
    "name": "Company Name",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  },
  "description": "A comprehensive guide to technical SEO implementation.",
  "image": "https://example.com/article-image.jpg"
}
```

#### Breadcrumbs

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://example.com/guides/" },
    { "@type": "ListItem", "position": 3, "name": "Technical SEO" }
  ]
}
```

#### FAQ Page

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a canonical URL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A canonical URL tells search engines which version of a page is the original."
      }
    }
  ]
}
```

#### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/company",
    "https://github.com/company"
  ]
}
```

### Validation

- Google Rich Results Test: `https://search.google.com/test/rich-results`
- Schema.org Validator: `https://validator.schema.org/`

---

## Sitemaps

### XML Sitemap Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### Sitemap Index (for large sites)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
    <lastmod>2026-01-14</lastmod>
  </sitemap>
</sitemapindex>
```

### Rules

| Rule | Guideline |
|------|-----------|
| Location | `/sitemap.xml` at site root |
| Size limit | Max 50,000 URLs or 50MB per file |
| Large sites | Use sitemap index to split across files |
| Reference | Add `Sitemap:` directive to `robots.txt` |
| Freshness | Regenerate when content changes |
| Exclude | Admin pages, API endpoints, duplicate pages |

---

## robots.txt

### Standard Template

```
# Allow all crawlers
User-agent: *
Allow: /

# Block admin and API
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /_next/    # Next.js internals (if applicable)

# Sitemap reference
Sitemap: https://example.com/sitemap.xml
```

### Common Mistakes

| Mistake | Why It Hurts |
|---------|-------------|
| Blocking CSS/JS | Search engines cannot render your page |
| Blocking images | Removes image search traffic |
| Using `Disallow: /` | Blocks entire site from indexing |
| Missing `Sitemap:` | Crawlers may not find your sitemap |
| Forgetting trailing `/` | `Disallow: /admin` blocks `/administrator` too |

---

## Canonical URLs

### When to Set Canonical

| Scenario | Canonical Points To |
|----------|-------------------|
| HTTP vs HTTPS | HTTPS version |
| www vs non-www | Preferred version |
| URL parameters | Base URL without parameters |
| Pagination | First page (or self-referencing) |
| Syndicated content | Original source URL |
| Mobile vs desktop | Desktop URL (with `rel="alternate"`) |

### Implementation

```html
<!-- Self-referencing canonical (recommended on every page) -->
<link rel="canonical" href="https://example.com/current-page">

<!-- HTTP header alternative (for non-HTML resources) -->
Link: <https://example.com/page>; rel="canonical"
```

---

## Open Graph and Twitter Cards

### Open Graph (Facebook, LinkedIn, etc.)

```html
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Compelling description for social sharing.">
<meta property="og:image" content="https://example.com/og-image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Site Name">
```

| Property | Requirements |
|----------|-------------|
| `og:image` | Min 1200x630px, max 8MB, JPG/PNG |
| `og:title` | 60-90 characters |
| `og:description` | 2-4 sentences |
| `og:type` | `website`, `article`, `product` |

### Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description for Twitter preview.">
<meta name="twitter:image" content="https://example.com/twitter-image.jpg">
<meta name="twitter:site" content="@handle">
```

| Card Type | Use Case |
|-----------|----------|
| `summary` | Default; small image + text |
| `summary_large_image` | Large image above text (articles, posts) |
| `player` | Video/audio content |
| `app` | Mobile app promotion |

---
