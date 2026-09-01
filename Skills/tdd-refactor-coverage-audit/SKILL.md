---
name: tdd-refactor-coverage-audit
description: Audit newly added source files for paired tests during the TDD refactor phase. JSON-driven language conventions (TypeScript, JavaScript, Svelte, Python, Go, Rust, Ruby, Elixir, Java, C#) with optional project overrides. Advisory only — never blocks the TDD gate.
type: reference
disable-model-invocation: true
version: "1.0.1"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-05-15"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD Refactor Coverage Audit
Companion to `tdd-process` and `tdd-refactor-phase`. Audits whether source files added since a reference commit have paired tests. **Advisory only** — never blocks the TDD gate.
## Runtime Requirements
Applies the **No-Runtime Fallback Pattern** (`SKILL-DEVELOPMENT-GUIDE.md`):
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node 18+ on `PATH` | Invokes `scripts/test-coverage-audit.js` — deterministic, convention-JSON-driven pairing check. |
| **Fallback** | None (Claude inline) | Reads `resources/test-coverage-conventions.json`, runs `git diff --name-status --diff-filter=A <sha>..HEAD` via Bash, applies the same rules, emits equivalent warnings. |
Both preserve the **advisory-output contract**. Structural fields (`newSources`, `pairedSources`, `missingTests[]`, `undetermined[]`, `undeterminedCount`, `coverage`) and advisory-only semantics are identical; only prose formatting may differ.
### Preflight
1. `node --version` available?
2. **Yes (primary):** invoke per "Invocation". Done.
3. **No (fallback):** surface the Pattern 4 diagnostic — *"This audit pairs newly added source files with their expected test files using language conventions. The Node script is the primary path; without Node, Claude can perform the same pairing inline by reading the convention JSON + running `git diff` via the Bash tool. The result is structurally equivalent and remains advisory. Or install Node 18+ for the deterministic primary path."* Then run the **Fallback Procedure**.
### Fallback Procedure
1. **Read the convention JSON:** `Skills/tdd-refactor-coverage-audit/resources/test-coverage-conventions.json`. Defines `languages` (→ `sourceExtensions[]`, `testPatterns[]`, optional `excludePatterns`, `inlineTests`), `ignoredSourcePatterns[]`, `minTestCoverageRatio` (default 0).
2. **Read the project override:** `framework-config.json` at project root. If a `testCoverageAudit` block exists, merge over the bundled convention — `additionalLanguages` added to `languages`, `ignoredSourcePatterns` unioned, `minTestCoverageRatio` overridden when present.
3. **Enumerate added files:** `git diff --name-status --diff-filter=A <since-commit>..HEAD` via Bash. Leading `A\t` marks added files.
4. **For each added file:**
   - Skip if it matches any `ignoredSourcePatterns` glob.
   - Detect language by extension against `sourceExtensions`. Skip if no match.
   - Skip if it matches the language's `excludePatterns`.
   - Skip if the file is **itself a test**: substitute `{dir}` with its own directory and `{stem}` with `*` in each `testPatterns` entry, then glob-match the file against the results. A match means it is a test, excluded from the source set before being counted. `{stem}` must stay open — a fully expanded candidate can never match, since the stem of `foo.test.js` is `foo.test`, yielding `foo.test.test.js`.
   - Substitute `{stem}` (filename without extension) and `{dir}` (relative directory) into each `testPatterns` entry; check whether any expanded path exists (Bash `test -f` or Read).
   - For `inlineTests: true` (Rust), also read the source and check for an inline `#[cfg(test)]` block; if present, count as paired.
   - If nothing pairs, choose between two findings. Search the project for any file matching the language's test-shape globs — `testPatterns` with `{dir}` replaced by any directory and `{stem}` by any filename. None anywhere → the layout is not expressible by these conventions: append to `undetermined[]` with file, language, and the candidates `checked`. Otherwise the convention is in use and this source simply lacks a test: append to `missingTests[]` with file, language, and the `expected` patterns. Search once per language, not once per file.
5. **Emit output:** `newSources`, `pairedSources`, `missingTests[]`, `undetermined[]`, `undeterminedCount`, `coverage` (`pairedSources / (pairedSources + missingTests.length)`, or `1.0` when that denominator is `0` — undetermined excluded), `minTestCoverageRatio`. JSON or prose; advisory only — do not halt the workflow.
## When to Use
- REFACTOR phase of a TDD cycle, after the GREEN gate
- A deterministic check for "did this cycle add source files without tests?"
- Extending pairing conventions for a new language without writing code
## Self-Contained
```
.claude/skills/tdd-refactor-coverage-audit/
├── SKILL.md
├── LICENSE.txt
├── resources/
│   ├── test-coverage-conventions.json          # language conventions
│   └── test-coverage-conventions-schema.json   # JSON Schema (Draft 2020-12)
├── scripts/
│   └── test-coverage-audit.js                  # pure Node, zero deps
└── tests/
    ├── fixtures/{valid,invalid}-conventions.json
    └── test-coverage-audit.test.js
```
No dependency on `.claude/scripts/shared/`, `.claude/metadata/`, or any framework-hub path. Drop into any project's `.claude/skills/`.
## Invocation
```bash
node .claude/skills/tdd-refactor-coverage-audit/scripts/test-coverage-audit.js \
  --since-commit <sha>
```
| Flag | Description |
|------|-------------|
| `--since-commit <sha>` | Compare against this commit (required unless `--config-only`) |
| `--config-only` | Print resolved config and exit |
| `--project-root <path>` | Override project root (default: `git rev-parse --show-toplevel`) |
| `-h`, `--help` | Show usage |
## Output
```json
{
  "ok": true,
  "newSources": 5,
  "pairedSources": 3,
  "missingTests": [
    {
      "file": "src/lib/foo.ts",
      "language": "typescript",
      "expected": ["src/lib/foo.test.ts", "src/lib/__tests__/foo.ts"]
    }
  ],
  "undetermined": [
    {
      "file": "src/pkg/loader.py",
      "language": "python",
      "checked": ["src/pkg/test_loader.py", "tests/test_loader.py"]
    }
  ],
  "undeterminedCount": 1,
  "coverage": 0.75,
  "minTestCoverageRatio": 0
}
```
| Field | Meaning |
|-------|---------|
| `ok` | `true` if the audit ran cleanly; `false` only on schema/git errors. |
| `newSources` | Newly added source files matched by some language. |
| `pairedSources` | Count with at least one matching test file. |
| `missingTests[]` | Per-file warnings with the patterns checked. |
| `undetermined[]` | Per-file `{ file, language, checked }` where the language was detected but no `testPatterns` entry can express the layout. **Not** a missing test. |
| `undeterminedCount` | Length of `undetermined[]`. |
| `coverage` | `pairedSources / (pairedSources + missingTests.length)` — 1.0 when that denominator is 0. Undetermined sources are excluded, so the ratio describes only files the audit understood. |
| `minTestCoverageRatio` | Optional project floor (advisory). |
> **`coverage` changed meaning (#285).** Formerly `pairedSources / newSources`. A project whose layout the bundled patterns cannot express now reports `1.0` alongside a non-empty `undetermined[]` instead of a depressed figure and impossible expected paths. Callers comparing `coverage` to a floor must also read `undeterminedCount`: a perfect score beside a non-empty `undetermined[]` means the layout was not understood, not that the project is fully tested.
Never exits non-zero for missing tests. Exit `2` is reserved for schema validation failures and usage errors.
## How It Works
1. Loads the conventions JSON and validates it against the bundled schema.
2. Resolves project root (`git rev-parse --show-toplevel`); optionally reads `framework-config.json` → `testCoverageAudit`, which is schema-validated and merged over the bundled conventions.
3. Runs `git diff --name-status --diff-filter=A <sha>..HEAD`.
4. Per new file: skips `ignoredSourcePatterns`; detects language by extension and skips `excludePatterns`; skips any file **itself a test** (matched by substituting `{stem}` with `*` and glob-matching — deliberately separate from `expandTestPatterns`, which the pairing path shares); substitutes `{stem}`/`{dir}` into `testPatterns` and checks for an existing file; for `inlineTests: true` (Rust) checks for an inline `#[cfg(test)]` block. When nothing pairs, reports **undetermined** rather than missing if the project contains no file anywhere matching that language's test-shape globs — scanned once per language, not once per file.
5. Emits the JSON above; the caller (e.g. `tdd-process`) surfaces warnings.
## Pattern Substitution
| Token | Meaning | Example for `src/lib/foo.ts` |
|-------|---------|------------------------------|
| `{stem}` | filename without extension | `foo` |
| `{dir}` | relative directory of source file | `src/lib` |
`{dir}/__tests__/{stem}.ts` → `src/lib/__tests__/foo.ts`.
## Adding a Language
Add an entry under `languages` in `resources/test-coverage-conventions.json`:
```json
"kotlin": {
  "sourceExtensions": [".kt"],
  "testPatterns": [
    "{dir}/{stem}Test.kt",
    "src/test/kotlin/**/{stem}Test.kt"
  ]
}
```
Required: `sourceExtensions` (each starting with `.`) and `testPatterns` (at least one). Optional: `excludePatterns`, `inlineTests`. One PR, no script edits.
## Project Override
Optional `testCoverageAudit` block in `framework-config.json`:
```json
{
  "testCoverageAudit": {
    "additionalLanguages": {
      "myDsl": {
        "sourceExtensions": [".mydsl"],
        "testPatterns": ["spec/{stem}.spec.mydsl"]
      }
    },
    "ignoredSourcePatterns": ["**/legacy/**"],
    "minTestCoverageRatio": 0.8
  }
}
```
| Field | Behavior |
|-------|----------|
| `additionalLanguages` | Merged into bundled `languages` (same key overrides). |
| `ignoredSourcePatterns` | Concatenated with bundled patterns. |
| `minTestCoverageRatio` | Reported for downstream callers; not enforced here. |
Validated against the **lenient** schema entry point (`#/$defs/override`), which shares the conventions file's property shapes but requires no fields; the conventions file uses the strict root, which still requires `languages`. Separate because `mergeConfig` reads only the three keys above — requiring `languages` on an override would mandate a field the consumer discards.
## Interpreting Warnings
A `missingTests[]` entry is **not a failure** — it prompts a decision on whether the file is intentionally untested (config, types, glue, generated code):
- Add a test at one of the `expected` paths.
- Add it to `ignoredSourcePatterns` if structurally untestable (e.g. `*.config.ts`).
- Add the directory to the project override if an entire area is excluded (e.g. legacy code).
## Integration with `tdd-process`
Invoked from the refactor phase as a `required[]` checklist item; warnings surface inline without blocking the gate. If absent, `tdd-process` skips the item with a one-line notice. **No code coupling** — only name and invocation path.
## Testing
```bash
node .claude/skills/tdd-refactor-coverage-audit/tests/test-coverage-audit.test.js
```
Covers arg parsing, glob translation, language detection with excludes, `{stem}`/`{dir}` substitution, override merging, Rust inline-test detection, and schema validation against valid + invalid fixtures.
## Limitations
- File-pairing only — no line, branch, or statement coverage.
- Only **newly added** files since `<sha>`; modifications are out of scope.
- Minimal glob support (`*`, `**`, literal) — no brace expansion or character classes.
- `testFileExists` walks to depth 8, skipping `node_modules`, `.git`, `dist`, `build`.
