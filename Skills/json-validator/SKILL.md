---
name: json-validator
description: Validate JSON files against companion JSON Schema definitions
type: invokable
argument-hint: "[file.json] [--all] [--dir path] [--inline]"
allowed-tools: Read, Grep, Glob, Bash
version: "1.0.1"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-05-15"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [json, json-schema, ajv, validation]
copyright: "Rubrical Works (c) 2026"
---
# JSON Validator
Validate JSON files against their `$schema` references.
## Runtime Requirements
Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`) with *scoped fallback*. Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node 18+ AND `ajv` installed | Full JSON Schema validation via `ajv` — Draft 7 / 2020-12 features, `$ref` resolution, format validators, all constraint checking. |
| **Scoped fallback (`--inline`)** | None (runs in Claude inline) | Parse-only structural check: valid JSON syntax + top-level `type` matches `$schema`-declared type if trivially derivable. **No constraint checking, no `$ref` resolution, no format validators.** |
Fallback's deliverable intentionally narrower than primary's. JSON Schema too large a spec to faithfully approximate inline. Fallback gives users on hosts without `ajv` *some* useful validation (catches malformed JSON and top-level type mismatches) rather than nothing.
## Arguments
| Argument | Description |
|----------|-------------|
| `[file.json]` | Validate a single JSON file |
| `--all` | Scan project and subdirectories for all JSON files with `$schema` references |
| `--dir path` | Scan a specific directory and subdirectories |
| `--inline` | Force the scoped fallback path (parse-only structural check, no `ajv` required). Use when Node + `ajv` are unavailable, or when you only need a parse sanity check. |
If no arguments provided, prompt user to choose a mode.
## Workflow
### Step 0: Preflight (Pattern 4)
1. **`--inline` passed:** skip to Step 1; script runs scoped fallback.
2. **Default (primary path):** invoke script. If `ajv` missing, script exits with Pattern 4 diagnostic; surface verbatim and offer to re-invoke with `--inline`.
Preflight diagnostic shape: **what the skill would have done** "Validate JSON files against JSON Schema using `ajv` (Draft 7 / 2020-12, `$ref` resolution, format validators)."; **fallback** "Re-invoke with `--inline` for parse-only structural checks. The fallback does NOT perform schema validation."; **install path** "Or install Node 18+ and run: `npm install ajv`".
### Step 1: Discover Files
**Single file:** Validate provided file path exists. If not, report error and STOP.
**`--all` mode:** Use Glob to find all `**/*.json` files in project root. Exclude `node_modules/`, `.git/`, `package-lock.json`, other generated files.
**`--dir path` mode:** Use Glob to find all `**/*.json` files under specified directory.
### Step 2: Check for Schema References
For each discovered JSON file:
1. Read the file
2. Check for `$schema` field at root level
3. If `$schema` present, add to validation queue
4. If `$schema` absent, skip (not schema-validated)
Report discovery summary:
```
Found {N} JSON files, {M} with $schema references.
```
If no files have `$schema` references, report and STOP.
### Step 3: Resolve Schemas
For each file in validation queue: parse `$schema` value; **Relative path** → resolve relative to JSON file's directory; **Absolute path** → use as-is; **URL** → fetch via WebFetch if available, otherwise warn and skip; if schema not found, ask user "Schema `{$schema}` not found for `{file}`. Provide schema path, or skip?" — if path provided, re-run validation with `--schema-override "file=schemaPath"`; if "skip", proceed without validating that file.
### Step 4: Validate
For each file with resolved schema: read JSON file and schema file; compare JSON structure against schema (`required` fields present; `type` constraints satisfied; `enum` values match; `additionalProperties` constraints; nested `properties` recursively; `pattern` on strings; `minimum`/`maximum` on numbers; `minItems`/`maxItems` on arrays); collect all violations per file.
### Step 5: Report Results
```
JSON Schema Validation Results
------------------------------
{file-path}
  Schema: {schema-path}
  Status: PASS | FAIL
  {violation details if FAIL}

Summary: {passed}/{total} files passed validation.
```
If all files pass, report success. If any fail, list all violations grouped by file.
## Fallback Mode (`--inline`)
Runs **scoped fallback** path. Use when Node + `ajv` not installed and still want some validation, or when only need parse sanity check.
**What `--inline` does:** Parses each JSON file (catches malformed JSON); if schema declares top-level `type` trivially derivable without `$ref` resolution, asserts file's top-level type matches.
**What `--inline` does NOT do:** No `$ref` resolution; no format validators (`date-time`, `uri`, `email`); no constraint checking beyond top-level type (no `required`, `enum`, `pattern`/`minimum`/`maximum`, nested `properties`, `additionalProperties`); no recursive schema traversal.
**Output marker:** JSON envelope carries `mode: "inline"` and `note` field "Structural check only; schema validation not performed." Individual file results also carry `mode: "inline"` so downstream consumers detect scope gap programmatically.
File passing `--inline` validation has only been confirmed as valid JSON with matching top-level type. **Not** confirmed against full schema. For full validation, install Node 18+ and `ajv` (`npm install ajv`) and re-run without `--inline`.
