---
name: code-path-discovery
description: Scan TypeScript/JavaScript source files for behavioral paths and return candidates in 6-category format for /paths turn-based discovery
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [javascript, typescript]
defaultSkill: false
copyright: "Rubrical Works (c) 2026"
---
# Code Path Discovery
Scans TS/JS source code in a directory to detect behavioral patterns, mapping to the 6-category `/paths` format. Returns `{ shortLabel, description }` per category.
## When to Invoke
- `/paths --from-code [path]` -- called by `/paths` Step 3b
- Manual code analysis of unfamiliar codebases
## Parameters
| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `path` | Yes | string | Source directory to scan |
| `issueTitle` | Yes | string | Issue title for context |
| `issueBody` | No | string | Issue body for context |
## How to Use
1. Receive parameters from `/paths` Step 3b
2. Load `resources/skill-instructions.md`
3. Follow scanning and mapping workflow
4. Return results for `/paths` Step 5
## Output Format
```json
{
  "nominalPath": [
    { "shortLabel": "User login flow", "description": "POST /login validates credentials and returns JWT token" }
  ],
  "alternativePaths": [
    { "shortLabel": "OAuth redirect", "description": "GET /auth/callback handles third-party authentication" }
  ],
  "exceptionPaths": [
    { "shortLabel": "Database connection error", "description": "catch block in db.connect() returns 503" }
  ],
  "edgeCases": [
    { "shortLabel": "Empty request body", "description": "Guard clause returns 400 when req.body is null/undefined" }
  ],
  "cornerCases": [
    { "shortLabel": "Concurrent session limit", "description": "Auth guard + session count check reject login at max sessions" }
  ],
  "negativeTestScenarios": [
    { "shortLabel": "Invalid token format", "description": "JWT validation middleware rejects malformed tokens with 401" }
  ]
}
```
Each `shortLabel`/`description` maps to `/paths` Step 5a `AskUserQuestion` options.
## Resources
- [Skill Instructions](resources/skill-instructions.md) -- Pattern scanning rules and category mapping
## Known Limitations
Validated against `.claude/scripts/shared/` (36 JS files, CLI utilities).
**False positives:** Guard clause detection (`if (!x)`) may match non-boundary control flow. `module.exports` as nominal path more useful in route/handler files than utilities. Catch blocks in utility code may not be meaningful exception paths. User validation in `/paths` Step 5b mitigates.
**Not detected:** Implicit error flows via callbacks, promise chain propagation without `.catch()`, config-driven behavior not visible in code structure.
