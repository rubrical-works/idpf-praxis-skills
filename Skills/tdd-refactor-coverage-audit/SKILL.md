---
name: tdd-refactor-coverage-audit
description: Audit newly added source files for paired tests during the TDD refactor phase. JSON-driven language conventions (TypeScript, JavaScript, Svelte, Python, Go, Rust, Ruby, Elixir, Java, C#) with optional project overrides. Advisory only — never blocks the TDD gate.
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-23"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD Refactor Coverage Audit
Companion to `tdd-process`/`tdd-refactor-phase`. Mechanically audits whether source files added since a reference commit have paired tests via bundled JSON conventions. **Advisory only.**
## When to Use
- REFACTOR phase after GREEN gate
- Deterministic "did this cycle add source files without tests?"
- Extend test pairing conventions for a new language without code
## Self-Contained
```
.claude/skills/tdd-refactor-coverage-audit/
├── SKILL.md
├── LICENSE.txt
├── resources/
│   ├── test-coverage-conventions.json
│   └── test-coverage-conventions-schema.json
├── scripts/
│   └── test-coverage-audit.js
└── tests/
    ├── fixtures/{valid,invalid}-conventions.json
    └── test-coverage-audit.test.js
```
No dep on `.claude/scripts/shared/`, `.claude/metadata/`, or framework-hub. Drop into any project's `.claude/skills/`.
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
JSON to stdout:
```json
{
  "ok": true,
  "newSources": 4,
  "pairedSources": 3,
  "missingTests": [
    {
      "file": "src/lib/foo.ts",
      "language": "typescript",
      "expected": ["src/lib/foo.test.ts", "src/lib/__tests__/foo.ts"]
    }
  ],
  "coverage": 0.75,
  "minTestCoverageRatio": 0
}
```
| Field | Meaning |
|-------|---------|
| `ok` | `true` if audit ran cleanly. `false` only on schema/git errors. |
| `newSources` | Count of newly added source files matched by some language. |
| `pairedSources` | Count with ≥1 matching test file. |
| `missingTests[]` | Per-file warnings with patterns checked. |
| `coverage` | `pairedSources / newSources` (1.0 when no new sources). |
| `minTestCoverageRatio` | Optional project floor (advisory). |
Never returns non-zero exit for missing tests. Exit `2` reserved for schema/usage errors.
## How It Works
1. Loads `resources/test-coverage-conventions.json`, validates against bundled JSON Schema.
2. Resolves project root (`git rev-parse --show-toplevel`); optionally reads `framework-config.json` → `testCoverageAudit`, schema-validates, merges over bundled.
3. Runs `git diff --name-status --diff-filter=A <sha>..HEAD` to enumerate newly added files.
4. For each new file:
   - Skips files matching `ignoredSourcePatterns`.
   - Detects language by extension; skips `excludePatterns` matches.
   - Substitutes `{stem}` (filename no ext) and `{dir}` (relative dir) into `testPatterns`.
   - Checks if any expanded pattern matches existing file.
   - For `inlineTests: true` (Rust), also checks source for inline `#[cfg(test)]` before reporting missing.
5. Emits JSON. Caller (e.g., `tdd-process`) surfaces warnings.
## Pattern Substitution
| Token | Meaning | Example for `src/lib/foo.ts` |
|-------|---------|------------------------------|
| `{stem}` | filename without extension | `foo` |
| `{dir}` | relative directory of source file | `src/lib` |
Example: `{dir}/__tests__/{stem}.ts` → `src/lib/__tests__/foo.ts`.
## Adding a Language
Edit `resources/test-coverage-conventions.json`, add entry under `languages`:
```json
"kotlin": {
  "sourceExtensions": [".kt"],
  "testPatterns": [
    "{dir}/{stem}Test.kt",
    "src/test/kotlin/**/{stem}Test.kt"
  ]
}
```
Required: `sourceExtensions` (each starts with `.`), `testPatterns` (≥1). Optional: `excludePatterns`, `inlineTests`.
## Project Override
Optional. Add `testCoverageAudit` block to `framework-config.json`:
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
| `additionalLanguages` | Merged into bundled `languages` (project overrides same key). |
| `ignoredSourcePatterns` | Concatenated with bundled. |
| `minTestCoverageRatio` | Reported; audit does not enforce. |
Override fully optional.
## Interpreting Warnings
`missingTests[]` is **not a failure**. Resolutions:
- Add test at one of `expected` paths.
- Add file to `ignoredSourcePatterns` if untestable (`*.config.ts`).
- Add directory to project override if area excluded (legacy).
## Integration with `tdd-process`
Invoked from refactor phase as `required[]` checklist item. Orchestrator surfaces warnings inline; does not block gate. If not installed, `tdd-process` skips item with one-line notice. **No code coupling**: known only by name and invocation path.
## Testing
```bash
node .claude/skills/tdd-refactor-coverage-audit/tests/test-coverage-audit.test.js
```
Covers arg parsing, glob translation, language detection, `{stem}`/`{dir}` substitution, override merging, inline-test detection (Rust), schema validation.
## Limitations
- File-pairing only — no line/branch/statement coverage.
- Only **newly added** files since `<sha>`. Modifications out of scope.
- Glob minimal (`*`, `**`, literal). No brace expansion or character classes.
- `testFileExists` walks up to depth 8, skipping `node_modules`, `.git`, `dist`, `build`.
