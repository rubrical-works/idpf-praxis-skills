---
name: tdd-refactor-coverage-audit
description: Audit newly added source files for paired tests during the TDD refactor phase. JSON-driven language conventions (TypeScript, JavaScript, Svelte, Vue, Python, Go, Rust, Ruby, Elixir, Java, Dart, GDScript, C#) with optional project overrides. Advisory only — never blocks the TDD gate.
type: reference
disable-model-invocation: true
version: "1.3.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-09-12"
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
Both preserve the **advisory-output contract**. Structural fields (`newSources`, `pairedSources`, `missingTests[]`, `undetermined[]`, `undeterminedCount`, `classes`, `coverage`, `diagnostics.unrecognizedExtensions`) and advisory-only semantics are identical; only prose formatting may differ.
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
4b. **Read flow declarations.** For each test file in a `classes.flow` location, read its **leading comment block only** and collect the grammar's tags — `@covers <issue-or-ac-ref>` (repeatable) and `@flow <name>`. A spec with at least one tag is declared and pairs to what it names; one with none is undeclared and is reported by path with a hint; a recognised tag carrying no value is malformed and is reported without halting.
5. **Emit output:** `newSources`, `pairedSources`, `missingTests[]`, `undetermined[]`, `undeterminedCount`, `classes` (`module` with `sources`/`paired`/`unpaired` and `coverage` only when `sources` is above 0; `flow` with `declared`/`undeclared`; `contract` with `declared`) — classify each test file **before** source detection, since a language's `excludePatterns` reject its own test shapes, and treat a spec in a `classes.flow` location as a flow spec pairing nothing by stem — `diagnostics.unrecognizedExtensions` (extension → count for files no language entry claimed, `"(none)"` for extensionless, `{}` when none), `coverage` (`pairedSources / (pairedSources + missingTests.length)`, or `1.0` when that denominator is `0` — undetermined excluded), `minTestCoverageRatio`. JSON or prose; advisory only — do not halt the workflow.
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
  "classes": {
    "module": { "sources": 5, "paired": 3, "unpaired": 1, "coverage": 0.75 },
    "flow": { "declared": 0, "undeclared": 2 },
    "contract": { "declared": 1 }
  },
  "coverage": 0.75,
  "minTestCoverageRatio": 0,
  "diagnostics": {
    "unrecognizedExtensions": { ".vue": 82, "(none)": 3 }
  }
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
| `diagnostics` | Container for what the audit could **not** account for. Always present. |
| `diagnostics.unrecognizedExtensions` | Extension → count for changed files whose extension matched no language entry. Extensionless files count under `"(none)"`. Always present; `{}` when all recognized. |
| `diagnostics.unreachableLanguageEntries` | `{ name, shadowedBy }` per language entry no file can reach, every extension being claimed ahead of it. Always present; `[]` when none. See **Which entry claims a file**. |
| `classes` | The three test classes, each with its **own** denominator. Always present. |
| `classes.module` | `sources` / `paired` / `unpaired` for stem-paired tests; same numbers as the legacy top-level fields. **`coverage` appears only when `module.sources` is above 0** — a language with no module sources has nothing to divide, so no division is performed rather than reporting a misleading `0%`. |
| `classes.flow` | `declared` / `undeclared` for specs in a `classes.flow` location. |
| `classes.contract` | `declared` for tests matching the contract class's `exempt` globs. A contract test is never listed as an orphan. |
**The legacy top-level fields carry the module class and are unchanged.** A consumer reading only `newSources`, `pairedSources`, `coverage` and `missingTests[]` sees exactly what it saw before — which is what makes the three-class output a minor release rather than a migration.
> **What decides `undetermined` (#295).** Judged on **location**, not test naming. Rule: files shaped like this language's tests exist **and** no source of this language paired anywhere in the project. Both halves matter — a project pairing somewhere understands its own layout, so an unpaired source there is genuinely missing a test. Previously the check asked only whether a test-shaped file existed anywhere; `{dir}` opens to `**`, so nine of ten bundled languages yield a location-blind glob (`**/*.test.js`) and a mirror-layout project reported `coverage: 0.0` while a project with no tests reported `1.0` — each population got the other's verdict. Only `elixir`, carrying no `{dir}`, was unaffected. Known imprecision: a monorepo pairing in one package and not another reports `missingTests` for the unreachable package; sharpening needs per-subtree classification.
> **`coverage` changed meaning (#285).** Formerly `pairedSources / newSources`. A project whose layout the bundled patterns cannot express now reports `1.0` alongside a non-empty `undetermined[]` instead of a depressed figure and impossible expected paths. Callers comparing `coverage` to a floor must also read `undeterminedCount`: a perfect score beside a non-empty `undetermined[]` means the layout was not understood, not that the project is fully tested.
> **`unrecognizedExtensions` is the other half of reading `coverage` honestly (#299).** `undeterminedCount` guards a falsely *low* score; this guards a falsely *high* one. A file whose extension matches no language entry never enters `newSources`, `pairedSources` or the `coverage` denominator, so a Vue project with 80 untested components and 2 tested utilities reports `coverage: 1.0`. **Callers comparing `coverage` to a floor must read both** — a perfect score means "of the files I understood". It is also the language backlog ordered by evidence: `".vue": 82` says what to add next.
> **Everything unrecognized is reported; nothing suppressed (#299 AC7).** A suppression list for known-non-source extensions (`.md`, `.json`, `.lock`, `.png`) was considered and **rejected** — it goes stale and can only hide a row someone wanted. Two skips are **not** reported, both recorded decisions rather than gaps: `ignoredSourcePatterns` matches, and files a language claims but whose `excludePatterns` reject. Reporting `src/types.d.ts` as an unrecognized `.ts` would claim the audit has no TypeScript entry.
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
## Pairing Scope
A language entry may declare `pairingScope`.
| Value | Meaning |
|---|---|
| `file` (default; also when the key is absent) | Source pairs only if a test matching its own expanded `testPatterns` exists. |
| `directory` | Source pairs if **any** file matching the language test shape exists in the source's own directory. |
For languages whose idiom is one test file per package. Go requires only the `_test.go` suffix, so `internal/http/handlers_test.go` conventionally exercises `routes.go` and `middleware.go`; under `file` scope both reported untested however thoroughly covered. No `testPatterns` entry expresses this — `expandTestPatterns` substitutes `{stem}` from the source, so "any test in this package" is not sayable as a glob.
Coarser by design: one test file marks every source in its package paired. Deliberate — the audit is advisory, the prior behaviour was a false negative on *every* non-eponymous source in an idiomatic Go project, and the imprecision is bounded by the package, the unit `go test -cover` reports in. Under `directory` scope the reported `expected`/`checked` list is the directory test-shape globs, not a per-file candidate, so the output does not appear to demand one test per source.
## Excluding Paths
`excludePaths` is a top-level glob list naming paths **not expected to have tests** — golden files, fixture trees, generated sources, scratch directories. A matching source is skipped before language detection, so it is **neither counted nor reported** as unpaired.
```json
"excludePaths": ["golden/**", "**/__fixtures__/**", "generated/**"]
```
**Per-language pairing is untouched** — the difference that matters. Silencing an assurance-ladder tree previously meant disabling pairing for the whole language, hiding genuine gaps to suppress known non-gaps. A non-matching source in the same language still pairs, and still reports as unpaired when it has no test.
| Key | Says |
|---|---|
| `excludePaths` (top-level) | this **path** is not expected to be tested, whatever language claims it |
| `excludePatterns` (per language) | this file is not a source **of that language** — a `.d.ts`, a generated `.pb.go`, a test file |
| `ignoredSourcePatterns` (top-level) | this file is structurally untestable anywhere — a barrel `index.ts`, a migration |
A project adds its own list through the override block; it is **concatenated** with the bundled list, not replaced, so declaring one never silently drops the shipped entries.
## Test Classes
A language entry may declare `classes`, naming the kinds of test it recognises and how each pairs. Stem matching is correct for unit tests and wrong for everything else: an end-to-end spec is named for the journey it walks, so no source shares its stem, and it is reported as an orphan while the source it exercises is reported as untested.
| Class | `pairing` | How it pairs |
|---|---|---|
| `module` | `stem` | Filename-stem matching against the language's `testPatterns` — today's behaviour, unchanged. |
| `flow` | `annotation` | The spec declares what it covers in a leading-comment tag. Filename is irrelevant; `locations` globs say where such specs live, but never pair one on their own. |
| `contract` | `declared-subject` | The test names its subject, or matches one of the class's `exempt` globs. |
```json
"classes": {
  "module": { "pairing": "stem" },
  "flow": { "pairing": "annotation", "locations": ["e2e/**", "tests/flows/**"] },
  "contract": { "pairing": "declared-subject", "exempt": ["**/fixtures/**"] }
}
```
**`classes` is optional, and its absence is not a gap.** A language declaring no `classes` block resolves to module-only behaviour — exactly what every entry did before the key existed — so no existing entry changes verdict. Bundled `python`, `go`, `rust` and `java` declare none.
`pairing` is constrained by a JSON Schema `pattern` rather than an `enum` deliberately: the bundled validator in `scripts/test-coverage-audit.js` implements `pattern` and not `enum`, so an `enum` here would be decorative and admit any string.
## Flow Annotation Grammar
The top-level `flowAnnotation` key defines the tags a flow spec uses to declare what it covers. Top-level rather than per-language because the tags are identical everywhere; only the comment syntax around them differs.
| Tag | Value | Repeatable |
|---|---|---|
| `@covers` | an issue or acceptance-criterion reference | yes — a flow spec commonly covers several |
| `@flow` | a stable journey name | no |
```js
/**
 * @covers #1114
 * @flow fork-keyboard
 */
```
**Tags are read from the leading comment block only.** A `@covers` string appearing later is prose — a fixture, a comment inside a test case — and reading further would let it silently pair a spec. Declaring the boundary in the grammar makes that rule checkable rather than an implementation detail of whichever reader runs.
## Flow Annotation Reader
The audit reads the tags defined by **Flow Annotation Grammar** out of each spec sitting in a `classes.flow` location, and pairs the spec to what the tags name.
**Only the leading comment block is read.** The block runs from the top of the file to the first line that is neither blank nor a comment — or to the close of a `/* */` comment, or to a blank line once the block has started.
| Outcome | Where it appears |
|---|---|
| At least one recognised tag | `classes.flow.declared`, with `{ file, covers[], flow }` in `classes.flow.declarations`. **Every `@covers` is recorded**, not just the first. |
| No recognised tag | `classes.flow.undeclared`, with `{ file, hint }` in `classes.flow.undeclaredSpecs` — the hint names the tags to add. |
| A recognised tag with no value | `diagnostics.malformedAnnotations` as `{ file, text }`. |
**An undeclared flow spec is not a module orphan**, and is deliberately kept out of that bucket: an orphan means "this source has no test", an undeclared spec means "this test does not say what it covers". Different problems, different fixes, reported separately.
**A malformed tag is reported, never thrown.** The audit completes and names the file and offending text; well-formed tags beside it still read. Follows the exit contract — non-zero exit is reserved for schema and usage errors, never findings. An unrecognised `@tag` is not malformed; it is prose the reader ignores.
**Pairing here is filename-independent.** Renaming an annotated spec to match a source stem changes nothing: it remains a flow spec and adds nothing to `classes.module`. That is the property the flow class exists to provide — existing end-to-end suites pair without renaming a single file.
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
| `additionalLanguages` | Merged into bundled `languages`. Same key overrides, **replacing wholesale** — every pattern you still want must be restated. |
| `additionalLanguages` — extension collision | A project entry is consulted **before** any bundled entry claiming the same extension (#301). A new key declaring `.js` takes effect without touching bundled `javascript`, which keeps its other extensions. |
| `ignoredSourcePatterns` | Concatenated with bundled patterns. |
| `excludePaths` | Concatenated with bundled patterns. Paths not expected to have tests; a match is neither counted as a source nor reported as unpaired. See **Excluding Paths**. |
| `minTestCoverageRatio` | Reported for downstream callers; not enforced here. |
### Worked example: sources under a dot-directory
The `myDsl` case is easy — a new extension, test root derived from the source's directory. The awkward case is a **dot-directory** source root with a test root that does **not** mirror the source path (`.claude/project-scripts/` → `tests/project-scripts/`):
```json
{
  "testCoverageAudit": {
    "additionalLanguages": {
      "projectScripts": {
        "sourceExtensions": [".js"],
        "testPatterns": ["tests/project-scripts/{stem}.test.js"]
      }
    }
  }
}
```
Two things this shows that `myDsl` does not:
- **The test root is fixed, not derived from `{dir}`.** `.claude/project-scripts/foo.js` is expected at `tests/project-scripts/foo.test.js`. **Any pattern omitting `{dir}` is anchored at the repository root.**
- **`{stem}` and `{dir}` substitute inside override `testPatterns` exactly as in the bundled conventions** — same tokens, same meanings. `{stem}` is the filename without extension (`foo`), `{dir}` the source's relative directory (`.claude/project-scripts`).
It declares `.js`, which bundled `javascript` already claims. Deliberate and it works: project entries are consulted first, so `projectScripts` wins for every `.js` file. Before 1.1.0 it did not — the entry validated, merged and was never reached (#301).
> **You may not need this example.** Since 1.1.0 bundled `javascript` carries `tests/**/{stem}.test.js` (#291), reaching `tests/project-scripts/foo.test.js` on its own. Reach for an override when your test root is somewhere the bundled patterns do not go, or to pin pairing to one root rather than anywhere under `tests/`. The example shows the mechanism, not a requirement.
### Which entry claims a file
Entries are consulted in order; the **first** claiming the file's extension wins, so order is precedence. Override-declared entries come first, then bundled. Two consequences:
- **You do not have to replace a bundled language to extend it.** Before #301, reaching a `.js` layout meant overriding the `javascript` key itself and restating every bundled pattern by hand — the staleness trap the table warns about. A new key declaring `.js` now works instead.
- **An entry nothing can reach is reported, not silently ignored.** When every extension of an entry is claimed ahead of it, it appears in `diagnostics.unreachableLanguageEntries` as `{ name, shadowedBy }`. A property of **position, not origin**: it catches two project entries colliding, and a bundled entry a broad project entry has fully shadowed. An entry keeping even one unclaimed extension is still reachable and is not reported.
> **Upgrading to 1.1.0 can change your `coverage` with nothing in your diff to explain it (#301).** A project carrying an `additionalLanguages` entry whose extension a bundled entry claimed has been running with it **inert**. This release makes it live, so `coverage` can move either direction on the first run after upgrade. Called out rather than shipped silently because the discontinuity is otherwise unattributable: run `--config-only` for the resolved language order and read `diagnostics.unreachableLanguageEntries`. Leaving precedence broken to avoid the jump preserves a state where the documented mechanism does not work at all.
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
## Recorded Convention Decisions
Decisions about what the bundled conventions cover, recorded so intent is not inferred from the pattern list.
| Decision | Outcome | Reason |
|---|---|---|
| Java `{stem}IT.java` (Failsafe) | **Added** (#292) | An integration test is evidence the source is exercised; the audit is advisory, so under-reporting a test that exists is the larger error. Unreachable in any layout before. |
| Java `{stem}TestCase.java` (JUnit 3) | **Added** (#292) | Common in long-lived codebases; `FooTestCase.java` is unambiguously a test. |
| `App.vue` excluded? | **No** (#300) | `**/index.ts` is excluded as a pure re-export barrel; `App.vue` carries layout, `router-view` and providers. Same answer as `cmd/**/main.go` (#294): report an entry point that sometimes holds logic. |
| Ruby engine / multi-gem `spec/` | **Not supported, deliberately** (#297) | Root-anchored `spec/`/`test/` hit the #292 problem, but the layout is rarer in Ruby and `**/spec/**/` would widen cross-package matching for every Ruby project to serve a minority. |
| Python generated-code globs | **Not added by #296** | Pattern-anchoring vs extension-coverage. Home now settled by #294: the `python` entry's own `excludePatterns`. |
| `pairingScope: directory` beyond `go` | **No other language adopts it** (#293) | The trade is only justified where the toolchain *enforces* colocated tests AND the idiom is one test file per package. Go alone meets both — `_test.go` must sit beside its package, and `go test -cover` reports per package. Python/Ruby/Elixir use mirror trees where a source's directory holds no tests at all. Rust has `inlineTests`. Absence of the key is per-file. |
| Home for generated-code globs | **Per-language `excludePatterns`** (#294) | Needed no new mechanism: `excludePatterns` is already per-language, already in the schema, and applied *in addition to* the global list. `test-coverage-audit.js` treats the two as equivalent, so neither pollutes `diagnostics.unrecognizedExtensions`. **A later language's generated-code globs belong on that language's entry** — `*_pb2.py` on `python`, `*.g.cs` on `csharp` — not in the global list, which would grow one shared list with per-language content. |
| Go `doc.go` | **Excluded** (#294) | Carries a package comment and nothing executable. |
| Go `cmd/**/main.go` | **NOT excluded** (#294) | Regularly carries wiring worth testing, and no convention guarantees it is inert. Advisory audit: a reported gap costs nothing, a hidden one is the risk. |
| Go `mock_*.go`, `*_mock.go`, `*_string.go` | **Excluded, known risk** (#294) | `mockgen`/`stringer` default names, but no marker separates them from a hand-written fake. Guard is the test asserting an ordinary `.go` source is still counted. |
| `gdscript` recognises two harnesses | **Both listed** (#309) | Incompatible file naming: **GUT** uses `test_{stem}.gd`, **gdUnit4** uses `{stem}Test.gd`. The entry cannot know which a project uses, and recognising only one reports every source in the other kind of project as untested — the all-or-nothing failure `undetermined` exists to avoid. Colocated and mirror forms are both legal in Godot; the mirror patterns carry `**` from the first commit rather than acquiring it in a later repair, following the `dart` precedent. |
| `csharp` reviewed against Godot Mono layouts | **Extended** (#309) | Checked in the gdUnit4 repositories themselves: `ExampleProject.Test/test/CalculatorTest.cs` and `Api.Test/src/asserts/BoolAssertTest.cs` (singular, separate test project) and `Examples/.../CSharpArrayTests.cs` (plural). Plural `{stem}Tests.cs` / `{stem}.Tests.cs` were already covered; the **singular `{stem}Test.cs`** — predominant in gdUnit4Net — matched nothing and was added in both colocated and `**/` forms. The separate-test-project *location* needed no change: location-blind `**/` patterns already reach a sibling `<Project>.Test/`, which `{dir}`-anchored patterns never could. gdUnit4 documents no C# naming convention, so the entry was reviewed against observed layouts rather than a published rule. |
| `kotlin` entry | **Deferred to #299** (#292) | Extension-coverage, not pattern-anchoring: `.kt` matches no `sourceExtensions`, so such files are skipped before being counted. #299 makes the priority evidence-based. Whenever written, the entry must carry `**/src/test/kotlin/**/` variants from the start — Gradle and Maven use the same module-relative layout #292 fixed for Java. |
## Limitations
- File-pairing only — no line, branch, or statement coverage.
- Only **newly added** files since `<sha>`; modifications are out of scope.
- Minimal glob support (`*`, `**`, literal) — no brace expansion or character classes.
- `testFileExists` walks to depth 8, skipping `node_modules`, `.git`, `dist`, `build`.
