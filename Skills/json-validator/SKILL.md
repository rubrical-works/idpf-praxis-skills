---
name: json-validator
description: Validate JSON files against companion JSON Schema definitions
type: invokable
argument-hint: "[file.json] [--all] [--dir path]"
allowed-tools: Read, Grep, Glob, Bash
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-02"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [json, json-schema, ajv, validation]
copyright: "Rubrical Works (c) 2026"
---
# JSON Validator
Validate JSON files against their `$schema` references.
## Arguments
| Argument | Description |
|----------|-------------|
| `[file.json]` | Validate a single JSON file |
| `--all` | Scan project for all JSON files with `$schema` references |
| `--dir path` | Scan a specific directory and subdirectories |
If no arguments provided, prompt the user to choose a mode.
## Workflow
### Step 1: Discover Files
Single file: Validate the provided file path exists. If not, report error and STOP.
`--all` mode: Glob `**/*.json` in project root. Exclude `node_modules/`, `.git/`, `package-lock.json`, generated files.
`--dir path` mode: Glob `**/*.json` under specified directory.
### Step 2: Check for Schema References
For each JSON file: 1) Read file 2) Check for root-level `$schema` field 3) If present, add to validation queue 4) If absent, skip.
Report: `Found {N} JSON files, {M} with $schema references.`
If none have `$schema`, report and STOP.
### Step 3: Resolve Schemas
For each queued file, parse `$schema` value:
- Relative path (e.g., `"my-schema.json"`): resolve relative to the JSON file's directory
- Absolute path: use as-is
- URL: fetch via WebFetch if available, otherwise warn and skip
If schema file not found, warn and skip that file.
### Step 4: Validate
For each file with resolved schema, read both files and check:
- `required` fields present
- `type` constraints satisfied
- `enum` values match
- `additionalProperties` constraints
- Nested `properties` recursively
- `pattern` constraints on strings
- `minimum`/`maximum` on numbers
- `minItems`/`maxItems` on arrays
Collect all violations per file.
### Step 5: Report
```
JSON Schema Validation Results
------------------------------
{file-path}
  Schema: {schema-path}
  Status: PASS | FAIL
  {violation details if FAIL}

Summary: {passed}/{total} files passed validation.
```
If all pass, report success. If any fail, list violations grouped by file.