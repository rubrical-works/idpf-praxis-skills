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
Scans TS/JS source code to detect behavioral patterns, mapping to 6-category path format for `/paths`.
## Invocation
- `/paths --from-code [path]` — called by `/paths` Step 3b
- Manual codebase exploration
## Parameters
| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Source directory to scan |
| `issueTitle` | Yes | Issue title for context |
| `issueBody` | No | Additional context |
## Usage
1. Receive params from `/paths` Step 3b
2. Load `resources/skill-instructions.md`
3. Follow scanning/mapping workflow
4. Return structured output for `/paths` Step 5
## Output
6 category keys, each with `{ shortLabel, description }` arrays:
```json
{
  "nominalPath": [{ "shortLabel": "...", "description": "..." }],
  "alternativePaths": [],
  "exceptionPaths": [],
  "edgeCases": [],
  "cornerCases": [],
  "negativeTestScenarios": []
}
```
Maps to `/paths` Step 5a `AskUserQuestion` `options[].label`/`description`.
## Known Limitations
- Guard clause detection (`if (!x)`) may match non-boundary conditions
- `module.exports` detection more useful in route/handler files than utilities
- Catch blocks in utility code may not represent meaningful exceptions
- Not detected: callback error conventions, promise chain propagation without `.catch()`, config-driven behavior
