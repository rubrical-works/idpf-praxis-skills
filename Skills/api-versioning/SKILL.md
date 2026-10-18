---
name: api-versioning
description: Guide developers through API versioning strategies, deprecation workflows, and backward compatibility patterns
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: api
relevantTechStack: [rest, graphql, api, node, express]
copyright: "Rubrical Works (c) 2026"
---
# API Versioning
Guides API versioning strategies (URL, query, header, content negotiation), deprecation workflows, and backward compatibility patterns.
## When to Use This Skill
- Designing a new API that will evolve
- Planning breaking changes to an existing API
- Establishing deprecation policies
- Migrating clients between versions
- Choosing between versioning strategies
## Why Version APIs?
**Problem:** APIs change — new features, bug fixes altering response formats, refactors renaming resources, security updates removing functionality. Without versioning, changes break existing clients.
**Goal:** allow evolution while maintaining backward compatibility, providing clear migration paths, minimizing client maintenance, and supporting multiple versions during transitions.
## Versioning Strategies
### 1. URL Path Versioning
```
/api/v1/users
/api/v2/users
```
- **Pros:** highly visible and explicit; easy to route and cache; simple client implementation; clear separation
- **Cons:** URL pollution; can't version individual resources differently; URL changes on upgrade
- **Best for:** public APIs, major version changes, simple needs
### 2. Query Parameter Versioning
```
/api/users?version=1
/api/users?api-version=2024-01-01
```
- **Pros:** optional (can default); single URL structure; easy to add to existing APIs
- **Cons:** easy to miss; can interfere with caching; less explicit
- **Best for:** optional versioning, date-based versions, gradual introduction
### 3. Header Versioning
```
GET /api/users
Accept-Version: v1
```
Or custom header:
```
GET /api/users
X-API-Version: 2
```
- **Pros:** clean URLs; follows HTTP semantics; per-request versioning
- **Cons:** harder to test in browser; less visible; requires header manipulation
- **Best for:** internal APIs, URL cleanliness, fine-grained versioning
### 4. Content Negotiation (Media Type)
```
GET /api/users
Accept: application/vnd.company.users.v2+json
```
- **Pros:** RESTful; versions representations separately; supports multiple formats
- **Cons:** complex implementation; harder for clients; less intuitive
- **Best for:** strict REST, multiple representation formats, enterprise environments
## Choosing a Strategy
| Factor | URL Path | Query Param | Header | Media Type |
|--------|----------|-------------|--------|------------|
| Visibility | High | Medium | Low | Low |
| Simplicity | High | High | Medium | Low |
| RESTful | Medium | Low | Medium | High |
| Caching | Easy | Medium | Complex | Complex |
| Testing | Easy | Easy | Medium | Hard |
**By context:** public APIs → URL path (most discoverable); internal APIs → header (cleaner URLs, more control); enterprise APIs → media type (standards, flexibility); simple APIs → query parameter (easy to add, low overhead).
## Version Numbering
**Semantic versioning:**
```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: Backward-compatible additions
PATCH: Backward-compatible fixes
```
`v1.0.0` initial → `v1.1.0` new endpoint → `v1.1.1` response bug fix → `v2.0.0` changed response structure (breaking).
**Date-based** (`YYYY-MM-DD` or `YYYY-MM`, e.g. `2024-01-01`, `2024-03`): frequent releases, rolling deprecation windows, Azure/AWS style.
**Simple major** (`v1, v2, v3`): infrequent major changes, simple lifecycle, clear breaking changes.
## Backward Compatibility
**Safe changes (usually compatible):** adding endpoints, optional parameters, response fields, enum values (if clients handle unknown).
**Breaking changes (require new version):** removing endpoints or response fields; changing field types; renaming fields; changing required parameters; changing authentication.
**Additive changes:**
```json
// v1 response
{"id": 1, "name": "Alice"}

// v1.1 response (compatible - added field)
{"id": 1, "name": "Alice", "email": "alice@example.com"}
```
**Optional fields:**
```json
{
  "id": 1,
  "name": "Alice",
  "profile": null  // Optional, may not exist in v1 clients
}
```
**Enum extension:** v1 status is `active`/`inactive`; v1.1 adds `pending` — clients must handle unknown values gracefully.
## Deprecation Workflow
```
Active → Deprecated → Sunset → Removed

1. Active: Fully supported
2. Deprecated: Announced, still works, migration encouraged
3. Sunset: Warning period, reduced support
4. Removed: No longer available
```
**Announce via:** documentation updates, API response headers, email/changelog notifications, a minimum notice period (e.g., 6 months).
**Deprecation header:**
```
Deprecation: true
Sunset: Sat, 01 Jun 2025 00:00:00 GMT
Link: <https://api.example.com/docs/migration>; rel="deprecation"
```
**During deprecation:**
1. Provide migration guide
2. Offer parallel versions
3. Log deprecated endpoint usage
4. Send notifications to heavy users
5. Provide tooling if complex
**Timeline example:**
```
Month 0:  Announce v1 deprecation, v2 released
Month 1:  Add deprecation headers to v1
Month 3:  Start warning notifications
Month 6:  Enter sunset period
Month 9:  Remove v1 (or extend if needed)
```
## Client Migration
**Migration guide template:**
```markdown
# Migration Guide: v1 to v2

## Overview
- v2 released: [date]
- v1 sunset: [date]
- v1 removal: [date]

## Breaking Changes
1. [Change description]
   - Before: [v1 behavior]
   - After: [v2 behavior]
   - Migration: [steps]

## New Features in v2
- [Feature 1]
- [Feature 2]

## Step-by-Step Migration
1. [Step 1]
2. [Step 2]
...

## FAQ
Q: [Common question]
A: [Answer]
```
**Shadow testing:** client sends to v1; server also sends to v2 internally; compare responses; log differences; switch client to v2 when confident.
**Feature flags:**
```
// Client configuration
const API_VERSION = process.env.USE_V2_API ? 'v2' : 'v1';
```
## REST API Patterns
**Version the API, not resources:**
```
/api/v1/users      ✓
/api/v1/products   ✓
/api/users/v1      ✗ (inconsistent)
```
**Exception — different resource evolution:**
```
/api/v1/users
/api/v1/products
/api/v2/products   // Only products changed significantly
```
**Envelope pattern:**
```json
{
  "data": { ... },
  "meta": {
    "version": "1.2.0",
    "deprecated": false
  }
}
```
**Version in response:**
```json
{
  "apiVersion": "1",
  "data": { ... }
}
```
## GraphQL Patterns
GraphQL naturally supports additive changes:
```graphql
# v1
type User {
  id: ID!
  name: String!
}

# v1.1 (compatible)
type User {
  id: ID!
  name: String!
  email: String  # New optional field
}
```
**Deprecating fields:**
```graphql
type User {
  id: ID!
  name: String! @deprecated(reason: "Use fullName instead")
  fullName: String!
}
```
**Multiple schemas** if breaking changes are needed:
```
/graphql       # Current version
/graphql/v2    # New version with breaking changes
```
## Implementation Checklist
**Before releasing versioned API:**
- [ ] Versioning strategy chosen
- [ ] Version numbering scheme defined
- [ ] Documentation includes version information
- [ ] Deprecation policy documented
- [ ] Client SDKs version-aware
**When deprecating:**
- [ ] Deprecation announced
- [ ] Migration guide written
- [ ] Deprecation headers added
- [ ] Sunset date set
- [ ] Usage monitoring in place
**When removing:**
- [ ] All clients migrated (or accepted)
- [ ] Logs show minimal traffic
- [ ] Final notifications sent
- [ ] Old version documentation archived
- [ ] Redirects or error messages in place
## Resources
`resources/`: `strategy-comparison.md` (detailed strategy analysis), `deprecation-workflow.md` (step-by-step deprecation), `compatibility-guide.md` (backward compatibility patterns).
## Relationship to Other Skills
- **Complements:** `error-handling-patterns` (API error responses), `postgresql-integration` (backend data evolution)
- **Independent from:** TDD skills — this skill covers API design, not testing
## Expected Outcome
Versioning strategy selected and documented; numbering scheme established; deprecation policy defined; migration workflow understood; backward compatibility patterns applied.
