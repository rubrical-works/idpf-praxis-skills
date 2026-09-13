# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.21.1] - 2026-09-13

`tdd-refactor-coverage-audit` 1.6.0 counts flow and contract tests wherever they live. A test file under a path listed in `ignoredSourcePatterns` is now classified like any other, so projects that kept their test directories in that list see their real flow and contract counts. `excludePaths` is the one list that skips a test file, and every file it skips is now named in a new `diagnostics.skippedTestFiles` field, so a zero count always means none were found. Re-import the skill to pick it up.

**Upgrade notes:**
- **The skill version moved 1.5.1 → 1.6.0, so re-import to pick this up.** `/fw-import-skills` replaces imported skills wholesale; a project still on 1.5.1 keeps the old behaviour.
- **Flow and contract counts can rise with no config change.** Any test file under an `ignoredSourcePatterns` entry — your own override or a bundled one such as `**/dist/**` or `**/vendor/**` — is now tallied. Module coverage, `newSources`, `pairedSources` and `missingTests[]` are unchanged.
- **To keep a test tree out of the classes, move it to `excludePaths`.** That is now the documented rule for skipping a test file, and each skip is reported rather than silent.
- **`diagnostics.skippedTestFiles` is additive** — always present, `[]` when nothing was skipped. Consumers reading the existing fields need change nothing.

### Fixed
- **Test files under a source skip list were never classified (#335).** Both skip lists ran ahead of test classification, so flow and contract declarations under an ignored or excluded path were never read and their counts read `0`. `ignoredSourcePatterns` now applies only to sources; `excludePaths` skips a test file and reports it. The trade-offs between this rule and the alternatives considered are recorded in `Construction/Design-Decisions/2026-09-13-exclude-paths-is-the-one-test-skip-rule.md`.

### Changed
- **`tdd-refactor-coverage-audit` 1.5.1 → 1.6.0.** Minor rather than patch because the output gains a field and SKILL.md gains a section, per the versioning policy in `Skills/MAINTENANCE.md`. The fallback procedure documents the same order and field, so the no-Node path stays in parity with the script.

## [0.21.0] - 2026-09-12

A new `electron-error-capture` skill records what happens while you drive an Electron app by hand — page errors, console errors and warnings, renderer crashes and main-process stderr — and writes a timestamped markdown and JSON report with screenshots you can paste straight into a bug. `tdd-refactor-coverage-audit` extends the three-class coverage model from TypeScript and JavaScript to every bundled language, and contract pairing stops being a declaration with no implementation: a contract test can now name the subject it covers in a leading-comment tag instead of depending on its filename. Skill packages are built deterministically from this release on, so regenerating metadata no longer churns checksums for content that did not change. The published skill surface is linted under a consumer-representative ruleset for the first time.

**Upgrade notes:**
- **`tdd-refactor-coverage-audit` moved 1.3.1 → 1.5.1, so re-import to pick any of this up.** `/fw-import-skills` replaces imported skills wholesale; a project still on 1.3.1 sees none of it.
- **`electron-error-capture` is new at 1.0.0** and is not installed anywhere until you import it. It is `category: testing`, `type: invokable`, and needs Playwright available in the target project.
- **Existing audit verdicts are unchanged by the new language coverage.** A `classes` block is additive and a language declaring none still resolves to module-only, so the eleven languages that gained one keep their previous pairing behaviour for module tests.
- **The `**/` glob fix does change which paths some patterns match, deliberately.** `**/` previously compiled without a path-segment boundary, so `**/build/**` matched `electron-cross-build/…` mid-filename. Measured across this repository: 85 patterns contain `**/`, and the fix removes 8 over-matches over 1388 tracked files. A project whose exclusions leaned on the old loose behaviour will see those paths become visible to the audit again.
- **`electron-development` moved 1.1.0 → 1.1.1 for a cross-reference only.** It gained a pointer to `electron-error-capture`; no guidance or snippet changed.

### Added
- **A new `electron-error-capture` skill (#27).** Launches an Electron app headed under Playwright and records every error that arrives while a person drives the app: page errors, console errors and warnings, renderer process crashes, and main-process stderr. On exit it writes a timestamped session directory containing a markdown report, a JSON record and screenshots. It exists because the two things that already worked did not cover this case — errors scroll out of DevTools while you click, and a scripted E2E test cannot explore freely. The report keeps **observed** and **inferred** separate, so it never presents a classification as something it saw. Playwright launch is deliberately excluded from the test suite; the 28 tests cover argument parsing, classification, session naming, summarisation and both renderers, which are the parts that can be asserted without a live app.
- **A `contractAnnotation` grammar and its reader (#329).** `contract` pairing declared `pairing: declared-subject` from #308 onward with nothing implementing the declaration, so the class could only ever pair by its `exempt` globs — the half that needs no reader. A contract test now declares its subject in a leading-comment `@subject` tag, repeatable because one contract commonly covers several subjects, read from the leading comment block only under the same boundary rule as `@covers` and `@flow`. The reader is **injected rather than imported** at the classification site, so the grammar and the classifier can be tested independently; `mergeConfig` carries `contractAnnotation` explicitly, which is what arms it. `contract.declared` remains a total, so existing consumers asserting on it stay satisfied.
- **A `classes` block for eleven more languages (#326).** The three-class model shipped in v0.20.0 reached TypeScript and JavaScript only, so every other bundled language stayed module-only and an end-to-end spec in a Python, Go, Rust, Java, C#, Ruby, PHP, Swift, Kotlin, Dart or Elixir project was still reported as an orphan. Each language gained the classes its ecosystem actually distinguishes, along with support-file ignores that were previously counted as untested sources: `spec/spec_helper.rb`, `spec/rails_helper.rb` and `**/version.rb` for Ruby, `**/package-info.java` and `**/module-info.java` for Java, and the designer, generated, `AssemblyInfo` and `GlobalUsings` files for C#.
- **The published skill surface is linted (#324).** `eslint` now runs over the distributed skill tree under a ruleset chosen to represent what a consuming project is likely to enforce, so a shape that trips a consumer's linter is caught here rather than after import. This is what would have caught #314 in this repository instead of downstream.

### Changed
- **`tdd-refactor-coverage-audit` 1.3.1 → 1.5.1.** One version line covers the language coverage, the contract reader and the glob fix; they were worked as one batch and ship together.
- **A flow location must be a directory reserved for end-to-end tests, never a naming convention inside the shared test tree (#326).** Three bundled languages had encoded the convention instead: Java's `*IT.java`, C#'s `*.IntegrationTests/` and Elixir's `test/**/*_integration_test.exs` are all *also* stem-pairing shapes, so a flow location written that way silently unpaired the module test beside it — Failsafe's suffix took `Payment.java`'s test away from it. All three now name a directory (`e2e/**`, `test/features/**`). The rule is pinned by a test, because it was rediscovered twice after being fixed once.

### Fixed
- **`globToRegex` compiled `**/` with no path-segment boundary (#330).** `**/` became `.*`, so a pattern matched mid-filename: `**/build/**` matched `electron-cross-build/LICENSE.txt` because the compiled expression did not require `build` to start a path segment. It now compiles to `(?:.*/)?`, which matches zero or more complete segments and nothing partial. Affects every consumer of the bundled conventions — `ignoredSourcePatterns`, `excludePaths`, per-language `excludePatterns`, and both `classes.flow.locations` and `classes.contract.exempt`.
- **The `/prepare-release` incomplete-issues pre-check matched nothing (#316).** `gh pmu list` declares `-s, --status string` — a single value, not a repeatable list — so `--status backlog,in_progress,in_review` was passed as one status named `backlog,in_progress,in_review`, which no issue carries. The command still exited 0 and printed `No issues found` whatever was open on the branch, so a release over unfinished work looked exactly like a release over a clear one. The correction reads the unfiltered `gh pmu list --branch current`, whose `STATUS` column is what a releaser wants anyway. **The correction lives in a `USER-EXTENSION` block**, because the command spec is a hub-regenerated copy and anything outside a block is overwritten; the durable fix is filed upstream as `rubrical-worker/idpf-praxis-dev#2898`.
- **Skill packages were not built deterministically (#317).** Zip archives embedded file timestamps, so rebuilding byte-identical content produced a different archive and therefore a different registry checksum — four hand reconciliations across v0.19.0 and v0.20.0 were correcting exactly that. Archive timestamps are now zeroed, so a rebuild of unchanged content is a git no-op. Verified on this release: all 54 packages rebuilt with zero diff.
- **Registry `generatedAt` churned on every regeneration (#327).** Even with deterministic archives the registry rewrote a fresh timestamp each run, so the regeneration step could never be a clean no-op and the drift it was meant to detect stayed hidden in the noise. `generatedAt` is now frozen against the tree's content.
- **The release metadata check compared two constants (#319).** It asserted `skill-registry.json`'s `version` against `package.json`'s. Both have read `0.1.0` since before v0.19.0 and neither tracks the release tag, so it printed `Match: true` whatever had happened to the registry — a vacuous gate sitting beside a real one. It now verifies that the registry describes the skills actually on disk and that every recorded checksum matches the archive it names, which is only a stable assertion because #317 made the archive bytes deterministic.
- **`coverage/` was not gitignored (#318).** The release coverage gate left roughly 1.3MB untracked on every run, which made `git status` unreadable at exactly the moment a releaser needs to trust it. Added in a project-owned block, deliberately outside the hub-managed sections.
- **Every `/skill-validate` step is runnable again (#331).** Step 3.3 invoked `build-skill-catalog.js`, deleted by `a511aef`, and Step 4.1's grep was imprecise enough to pass on files it had not really checked. The command also read skill metadata through the hub symlink rather than from this repository. All three are corrected inside `USER-EXTENSION` blocks and held by a spec test, with the durable fix owed upstream.

### Repository
- **The gate-path assertion narrowing is recorded as a design decision (#320).** `51fa6bf` narrowed `ci-gate-exit-contract.test.js` to assert path existence only where absence would be this repository's fault. The reasoning — that the original assertion read an environment property as a repository one — lived only in a commit message, which is not where the next person looks.
- **The extension-block correction pattern is recorded (#316).** Three parts: place the correction inside a `USER-EXTENSION` block, name the superseded form explicitly so a correct listing does not sit silently beside a misleading one, and scope any guard test to the block's own content so it survives hub regeneration.

## [0.20.1] - 2026-09-12

`tdd-refactor-coverage-audit` 1.3.1 removes the regex shape in its flow-annotation reader that failed `eslint-plugin-security`'s `security/detect-unsafe-regex`, so a project running that rule as an error can lint a tree containing the imported skill again. Parsing behaviour is unchanged in every case: a recognised tag carrying a value still reads as declared, a recognised tag with no value still reports as malformed, and an unrecognised `@tag` is still prose the reader ignores. Re-import the skill to pick it up — nothing else in the catalogue changes.

**Upgrade notes:**
- **The skill version moved 1.3.0 → 1.3.1, so re-import to pick this up.** A project still on 1.3.0 keeps the flagged shape; `/fw-import-skills` replaces imported skills wholesale, so a local patch there is erased at the next import.
- **No output or configuration change.** Pairing verdicts, the `classes` object, the legacy top-level fields and every language entry are identical to 1.3.0. Consumers need change nothing.

### Fixed
- **The flow-annotation tag regex tripped a star-height check (#314).** `parseFlowAnnotations` matched the tag and its optional whitespace-separated value in one end-anchored expression, which placed quantifiers inside a `?`-quantified group — star height 2, which is what `safe-regex` flags and therefore what `security/detect-unsafe-regex` reports. The tag match and the value extraction are now separate: the tag is matched on its own and the remainder taken by offset and trimmed, so no quantifier sits inside a quantified group and **any** star-height checker is satisfied, not one rule in one linter. Suppressing the rule with a disable comment was rejected for that reason — a comment silences one scanner, must itself survive into `.min-mirror/` and the packaged zip to reach a consumer at all, and leaves the shape in place. **The rule's verdict was structural, not a real hazard:** the expression was measured across four adversarial shapes at 20,000–40,000 characters and scales linearly, worst case 0.35 ms. **The new tag match is deliberately not `^`-anchored** — the original searched anywhere in the pre-trimmed line, and anchoring would silently stop recognising a tag preceded by prose, a behaviour change no test pins. Verified by a differential run over 14 inputs with no differences. Recorded in `Construction/Design-Decisions/2026-09-12-measure-the-regex-before-trusting-the-scanner.md`.

### Repository
- **The mirror's copy of the audit script was synced explicitly.** `scripts/test-coverage-audit.js` is a copy-as-is file, so no prose regeneration reaches it and the mirror is what the distribution ships — an unsynced copy would have published 1.3.1 still carrying the old shape, the failure v0.20.0 hit one release earlier with a stale mirror.
- **The guard pins the regressed shape rather than deriving it.** It asserts the old literal's absence and the new form's presence in the source, using `String.raw` on both needles: written through a quoted heredoc the first version's `\s` reached the file as an escape, so the needle became a string appearing nowhere — a vacuous pass in a test whose only purpose is to detect a literal. It will not catch a different star-height shape introduced elsewhere, which is accepted: this repository has no eslint, no `eslint-plugin-security` and no `lint` script, so the rule's own verdict cannot be asserted here at all.

## [0.20.0] - 2026-09-12

`tdd-refactor-coverage-audit` goes from one notion of a test to three. A language entry can declare `module`, `flow` and `contract` classes, each pairing by its own rule and reported against its own denominator — so an end-to-end spec named for the journey it walks is no longer counted as an orphan beside the source it exercises. Flow specs say what they cover in a leading-comment `@covers` / `@flow` tag instead of by filename, which lets an existing end-to-end suite pair without renaming a single file. GDScript joins the bundled languages with both mainstream harnesses recognised, and a new top-level `excludePaths` list silences fixture and generated trees without disabling pairing for the whole language.

**Upgrade notes:**
- **The skill version moved 1.2.0 → 1.3.0, so re-import to pick any of this up.** Everything below ships inside that one skill; a project still on 1.2.0 sees none of it.
- **Existing verdicts do not change.** A language entry that declares no `classes` block resolves to module-only behaviour, `excludePaths` is optional, and the legacy top-level `newSources` / `pairedSources` / `coverage` / `missingTests[]` fields carry the module class exactly as before. Adding the new language entries widens reach without altering any existing pairing.
- **`classes.module.coverage` is absent, not zero, when a language has no module sources.** A consumer reading it unconditionally will see `undefined` rather than a misleading `0%`.

### Added
- **Per-language test classes (#308).** A language entry may declare `classes`, naming the kinds of test it recognises and how each pairs: `module` by filename stem (today's behaviour), `flow` by leading-comment annotation, `contract` by declared subject or an `exempt` glob. Stem matching is correct for unit tests and wrong for everything else — an end-to-end spec is named for the journey it walks, so no source shares its stem, and it was reported as an orphan while the source it exercises was reported as untested. Both halves of one mistake, from one cause. The block is **optional and its absence is not a gap**: a language declaring no `classes` resolves to module-only, so no existing entry changes verdict, and the bundled `python`, `go`, `rust` and `java` entries declare none. `pairing` is constrained by a JSON Schema `pattern` rather than an `enum` deliberately — the bundled validator in `test-coverage-audit.js` implements `pattern` and not `enum`, so an `enum` would be decorative and admit any string. Recorded in `Construction/Design-Decisions/2026-09-11-pattern-not-enum-in-bundled-conventions-schema.md`.
- **A top-level `flowAnnotation` grammar (#308).** Defines the tags a flow spec uses to declare what it covers: `@covers` (an issue or acceptance-criterion reference, repeatable, because a flow commonly covers several) and `@flow` (a stable journey name, not repeatable). Top-level rather than per-language because the tags are identical everywhere and only the comment syntax around them differs. **Tags are read from the leading comment block only**, and that boundary is part of the grammar rather than an implementation detail — a `@covers` string appearing later in a file is prose, a fixture or a comment inside a test case, and reading further would let it silently pair a spec. Declaring the boundary is what makes the rule checkable by whichever reader runs.
- **The flow annotation reader (#311).** Reads the tags out of each spec sitting in a `classes.flow` location and pairs the spec to what they name. The leading block runs from the top of the file to the first line that is neither blank nor a comment, to the close of a `/* */` comment, or to a blank line once the block has started. **Every `@covers` is recorded**, not just the first. A spec with no recognised tag lands in `classes.flow.undeclaredSpecs` with a hint naming the tags to add; a recognised tag carrying no value lands in `diagnostics.malformedAnnotations` and is **reported, never thrown**, so well-formed tags beside it still read — following the existing exit contract, where a non-zero exit is reserved for schema and usage errors and never for findings. An unrecognised `@tag` is not malformed at all, just prose the reader ignores. **An undeclared flow spec is deliberately not a module orphan**: an orphan means "this source has no test", an undeclared spec means "this test does not say what it covers" — different problems, different fixes, reported separately. Pairing here is filename-independent, so renaming an annotated spec to match a source stem changes nothing; that is the property the flow class exists to provide.
- **A top-level `excludePaths` glob list (#309).** Names paths that are **not expected to have tests** — golden files, fixture trees, generated sources, scratch directories. A matching source is skipped before language detection, so it is neither counted nor reported as unpaired. **Per-language pairing is untouched, and that is the difference that matters**: silencing an assurance-ladder tree previously meant disabling pairing for the whole language, which hides genuine gaps in order to suppress known non-gaps. A non-matching source in the same language still pairs and still reports as unpaired when it has no test. Three keys now say three different things, documented side by side: `excludePaths` (this path is not expected to be tested, whatever language claims it), per-language `excludePatterns` (this file is not a source *of that language*), and `ignoredSourcePatterns` (this file is structurally untestable anywhere). A project's own list is **concatenated** with the bundled one, so declaring one never silently drops the shipped entries.
- **A `gdscript` language entry recognising both mainstream harnesses (#309).** GUT uses `test_{stem}.gd` and gdUnit4 uses `{stem}Test.gd`, and the two namings are incompatible. Both are listed, because the entry cannot know which a project uses and recognising only one would report every source in the other kind of project as untested — the same all-or-nothing failure `undetermined` exists to avoid. Colocated and mirror forms are both legal in Godot projects, and the mirror patterns carry `**` from the first commit rather than acquiring it in a later repair, following the `dart` precedent set in #298.

### Changed
- **`tdd-refactor-coverage-audit` 1.2.0 → 1.3.0.** One version covers every engine and convention change in this release; they were worked as one batch and ship together.
- **The audit reports module, flow and contract with separate denominators (#310).** Output gains a `classes` object — `module` with `sources`/`paired`/`unpaired`, `flow` with `declared`/`undeclared`, `contract` with `declared` — each computed over its own population rather than one blended ratio. **`classes.module.coverage` appears only when `module.sources` is above zero**: a language with no module sources has nothing to divide, so no division is performed rather than reporting a misleading `0%`. Test files are classified **before** source detection, because a language's `excludePatterns` reject its own test shapes, and a spec in a `classes.flow` location is treated as a flow spec that pairs nothing by stem. **The legacy top-level fields carry the module class and are unchanged**, which is what makes this a minor release rather than a migration — a consumer reading only `newSources`, `pairedSources`, `coverage` and `missingTests[]` sees exactly what it saw before.
- **The `csharp` entry reaches Godot Mono layouts (#309).** Checked against the gdUnit4 repositories themselves rather than a published rule, since gdUnit4 documents no C# naming convention and defers to standard .NET practice: `ExampleProject.Test/test/CalculatorTest.cs` and `Api.Test/src/asserts/BoolAssertTest.cs` (singular, separate test project) alongside `Examples/.../CSharpArrayTests.cs` (plural). The plural `{stem}Tests.cs` and `{stem}.Tests.cs` forms were already covered; the **singular `{stem}Test.cs`**, predominant in gdUnit4Net, matched nothing and is now added in both the colocated and `**/` forms. The separate-test-project *location* needed no change — the location-blind `**/` patterns already reach a sibling `<Project>.Test/` directory, which `{dir}`-anchored patterns never could.

### Fixed
- **`deploy-dist.yml` referenced three scripts absent from a runner checkout (#312).** `update-release-notes.js` and its require closure — `lib/input-validation.js` and `lib/exec.js` — existed locally only through the `.claude/scripts/shared` symlink into the framework hub, so the deploy job was exposed to a runtime failure on the step that invokes them. **The cause was a `.gitignore` rule this repository owns, not the hub upgrade that exposed it**: a blanket `.claude/scripts/shared` entry sat seventy lines below a carefully written by-contents block, and git will not re-include a file whose parent directory is excluded, so the force-track negations above it had never taken effect. This was the third occurrence of one loop — #210 force-tracked the file, a hub upgrade deleted it, #303 force-tracked it again, the v0.102.0 upgrade deleted it again — because each previous fix used `git add -f`, which works once and leaves the cause in place. The blanket rule is removed, `lib/exec.js` gains the negation it never had (the closure is three files, not two), and a comment in both `.gitignore` and `README.md` records that such a rule must never be reinstated. Two properties kept it hidden for three rounds: the symlink makes tracked and untracked indistinguishable in ordinary use, and the blanket rule kept the deletions out of `git status`. Recorded in `Construction/Design-Decisions/2026-09-12-fix-the-blanket-ignore-rule-not-the-fourth-retrack.md`.
- **`prepare-beta.md` Step 4.3 invoked the CI gate unscoped (#312).** Bare, `wait-for-ci.js` passes a null filter and `selectRun()` returns the newest run repo-wide, so a green run on an unrelated branch could supply the verdict for a beta tag — the #2464 contract. Step 3 of the same command, thirty-nine lines above, already scoped it correctly, so one command carried both forms of the same call. The tracked copy is now scoped to match. It is hub-managed and reverts on the next regeneration, so the durable fix is filed upstream as `rubrical-worker/idpf-praxis-dev#2889`.

### Repository
- **`tests/workflows/` now runs in CI (#312).** `skill-ci.yml` ran `npx jest tests/skills/` only, so the three suites that guard this pipeline had never executed on a runner. That is why `581594e` — the commit that deleted the three scripts above — is recorded green: `deploy-dist-tracked-paths.test.js` lives in `tests/workflows/` and was never loaded, and the defect was caught instead by a local `/work` verification sweep. A guard that only runs locally is not a guard. 163 suites before, 166 after.
- **The gate-path existence assertion was narrowed to paths this repository owns (#312).** Widening CI surfaced `ci-gate-exit-contract.test.js` asserting `fs.existsSync` on every invoked `wait-for-ci.js` path — which passes on a developer machine only because the hub symlink resolves it, and cannot pass in a checkout where that script is not force-tracked. It was reading an environment property as a repository one. A path is now asserted when its absence would be this repository's fault: tracked in git, or hub-provided and the hub tree present, detected by `lstat` for a symlink rather than by directory existence, since the directory exists in both environments. **Narrowed, not relaxed** — no workflow invokes `wait-for-ci.js`; it runs from command specs on a developer machine, which is where the hub provides it, and that is the distinction from `deploy-dist-tracked-paths.test.js`, which asserts tracking for scripts a *workflow* invokes and is left untouched. A guard test holds the narrowing against becoming a silent no-op.
- **The minimized mirror for `tdd-refactor-coverage-audit` was stale and shipping.** Its `SKILL.md` was committed at the #298 state and carried none of this release's documentation, while three sibling files had been regenerated but never committed. `deploy-dist.yml` ships the browsable skill directories from `.min-mirror/`, so the distribution would have published pre-#308 content under a current version. The mirror is regenerated at 79% of source against an 86% threshold.
- **The skill version and its six recording surfaces were reconciled.** 1.2.0 was already published without any of this release's features, so the source and mirror frontmatter, the packaged zip, `skill-registry.json`, `SKILLS-manifest.json` and the `MAINTENANCE.md` row were all moved to 1.3.0 together — a partial bump is worse than none, because it makes the artifacts disagree about what they are.
- **A registry/zip checksum divergence was reconciled twice.** Registry checksums are computed over packaged zip bytes and zips embed timestamps, so any rebuild changes the checksum for byte-identical content; a stray rebuild between commits leaves the registry asserting a checksum for a zip not in the tree. v0.19.0 recorded the same thing. Deterministic packaging — zeroed archive timestamps — is the fix worth having rather than a fourth manual reconciliation.

## [0.19.0] - 2026-09-10

### Changed
- **`electron-cross-build` and `electron-development` reclassified `injector` → `reference` (#277, #278).** Both skills' `resources/` hold only Markdown guides, and no framework command or shared script reads anything from them at runtime — so neither was ever an injector. `/fw-audit-skills` surfaced this as a `defaultSkill` regression against #256/#257, which it is not: **#264** deliberately set `defaultSkill: false` for both a day later, because `category: platform` skills must not auto-install into every project, and added `tests/metadata/skill-registry-default-platform.test.js` to hold that. The real conflict was between `typeRules.injector`, which requires `defaultSkill: true`, and #264, which requires it stay `false`. Both cannot hold for a platform-category injector, and the field that was wrong is `type`. Resolved by reclassifying rather than relaxing `typeRules` or reverting a recorded decision — see `Construction/Design-Decisions/2026-09-10-platform-skills-reclassified-not-defaultskill-relaxed.md`. `user-invocable: false` is removed rather than set to `true`, matching all 17 existing reference skills, which omit the key. **This is substantive, not frontmatter-only:** minimization is type-aware, so both skills' `SKILL.md` and every resource guide moved from copied-verbatim to AI-minimized, changing `.min-mirror/` content and both packaged zips. `validate-minimization.js` now validates them instead of skipping them as type-exempt.
- **`tdd-refactor-coverage-audit` 1.1.0 → 1.2.0.** One version covers all seven engine and convention changes below; they ship together and were worked as one batch.
- **Go now pairs by package, via a declared `pairingScope` (#293).** Go requires only the `_test.go` suffix, not one test file per source file, and the dominant idiom is one test file per package — so in a package where `handlers_test.go` exercises `handlers.go`, `routes.go` and `middleware.go`, two of the three were reported untested however thoroughly covered. Per-file pairing encoded a JavaScript/Java assumption into a language whose community does not follow it. No pattern can express the fix: `expandTestPatterns` substitutes `{stem}` from the source, so "any `_test.go` in this directory" is not sayable as a glob, and a literal `*` in the stem position would abuse the placeholder rather than declare intent. Adds `pairingScope` to the language definition — `file` by default and when the key is absent, `directory` opt-in — following the precedent `rust` set with `inlineTests`. Declared in the schema rather than admitted silently by `additionalProperties: true`. Coarser by design: one test file marks every source in its package paired. The trade is deliberate — the audit is advisory, the previous behaviour was a false negative on *every* non-eponymous source in an idiomatic Go project, and the imprecision is bounded by the package, which is the unit `go test -cover` itself reports in. Under `directory` scope the reported `expected`/`checked` list is the directory's test-shape globs, not a per-file candidate, so the output no longer appears to demand one test per source. **No other language adopts it**, recorded with the reason: the trade is justified only where the toolchain *enforces* colocated tests and the idiom is package-level test files, and Go alone meets both.

### Added
- **`vue` language entry (#300).** `.vue` matched no `sourceExtensions`, so single-file components were skipped before being counted — not paired, not missing, not undetermined, and absent from `newSources`. A Vue project's coverage was computed over whatever `.ts` utilities it happened to contain, with every component invisible and nothing saying so. The conventions file is keyed by **extension, not framework**: React, Angular, Solid and Preact are `.ts`/`.tsx`/`.js`/`.jsx` and were already covered, so `.vue` sat in `svelte`'s position — an extension nothing else claims — and was missing for no reason beyond not having been added. Twelve patterns covering colocated, sibling `__tests__/`, and both mirror conventions (Vue CLI `tests/`, Nuxt `test/`). Vue tests are `.ts`/`.js` and never `.vue`, so the entry maps a `.vue` source to a TypeScript or JavaScript test, exactly as `svelte` does. `App.vue` is deliberately **not** excluded: `**/index.ts` is excluded because a barrel file is pure re-export with nothing to test, whereas `App.vue` regularly carries layout, `router-view` and global providers.
- **`dart` language entry (#298).** Every `.dart` file was skipped by `detectLanguage`, so a Dart or Flutter project was not audited at all. Dart is the cheapest well-specified addition available: `flutter test` and `dart test` *require* test files to end in `_test.dart` and live under `test/`, and the community mirrors the `lib/` tree exactly, so there is one layout to encode and pairing is unambiguous. Both halves ship together deliberately — the convention *is* a mirror tree, so a `{dir}`-anchored set would pair nothing, and `build_runner` emits generated files directly into `lib/` beside hand-written ones where they routinely outnumber them. An entry without exclusions would report a coverage figure dominated by machine-written code: a worse first impression than the current silence. Excludes `*.g.dart`, `*.freezed.dart`, `*.mocks.dart`, `*.gr.dart`, `*.config.dart`, `generated_plugin_registrant.dart` and `.dart_tool/`.
- **Generated Go sources are excluded from the audit (#294).** `*.pb.go`, `*_grpc.pb.go`, `zz_generated*.go`, `mock_*.go`, `*_mock.go`, `*_string.go` and `doc.go` were all counted as untested human-written sources. In a service with protobuf definitions and generated mocks these routinely outnumber hand-written files, so the untested count was dominated by files that will never have tests, drowning the genuine gaps the audit exists to surface. **The placement decision is the substantive part**, and it needed no new mechanism: a per-language exclusion list already exists as `excludePatterns`, already in the schema, already used by `go` for `_test.go` and `vendor`, and applied *in addition to* the global `ignoredSourcePatterns` rather than instead of it. `test-coverage-audit.js` already treats the two as equivalent, so neither pollutes `diagnostics.unrecognizedExtensions` — routing a `.go` exclusion there would report the audit as having no Go entry at all. **A later language's generated-code globs belong on that language's entry** (`*_pb2.py` on `python`, `*.g.cs` on `csharp`), recorded so the next person has a known home. `cmd/**/main.go` is deliberately **not** excluded: it regularly carries wiring worth testing, and no convention guarantees it is inert.
- **Java reaches a multi-module test tree (#292).** The mirror pattern was anchored at the repository root, so a Maven or Gradle build where each module carries its own `src/main/java` and `src/test/java` paired nothing. Worse than #291's case, because the `undetermined` safety net does not fire: `testShapeGlobs` opens `{dir}/{stem}Test.java` to `**/*Test.java`, which *does* match the module test, so the convention is judged present and every unpaired source routes to **missing** — a confident zero on a project the tool cannot read. Adds `**/src/test/java/**/` variants, retaining every existing pattern. `{stem}IT.java` (Maven Failsafe) and `{stem}TestCase.java` (JUnit 3) are now recognised, both previously unreachable in any layout. A `kotlin` entry is **deferred to #299**, recorded with the reason: Kotlin is an extension-coverage question, not a pattern-anchoring one.
- **Python reaches a nested test tree (#296).** This entry was #291's cited exemplar of correct behaviour, and that citation was only half right — its `tests/` patterns reach a **flat** `tests/` directory, which `typescript` and `javascript` could not, but none carried `**` in the directory portion. The `src/` layout the Python Packaging Authority recommends pushes projects straight into a nested `tests/` tree that paired nothing. Adds `tests/**/` and `test/**/` variants for both naming conventions; the fourth also closes an asymmetry where `tests/` supported both `test_{stem}` and `{stem}_test` while `test/` supported only the first.
- **Ruby gains a colocated minitest pattern and a Rails migration exclusion (#297).** The spec side carried colocated, flat and mirror forms; the test side only flat and mirror, so a project keeping minitest files beside their sources paired nothing while the equivalent RSpec project paired. Separately, the global list carries `**/migrations/**` but Rails uses `db/migrate` — singular, different word — so every migration in every Rails project sat permanently in the untested denominator. Engine and multi-gem `spec/` layouts are deliberately **not** supported, recorded rather than left to be rediscovered.
- **A test asserting typeRule field *values* across all skills (#280).** Type-rule conformance was enforced only by `/fw-audit-skills`, run on demand and verified by hand, and that gap had already cost the project once: #256 and #257 each carried the AC "Add `defaultSkill: true`", both were checked off after confirming the field was **present**, and it had been added as `false`. A presence check and a value check are one character apart to write and were three months apart to discover. The test reads `typeRules` and `validValues` from `skill-requirements.json` at test time rather than restating them, and derives the skill list by listing `Skills/` — a hard-coded list would reintroduce the same class of gap, since a new skill would simply go unchecked. Distinguishes a missing field from one present with the wrong value, and names skill, field, expected and actual. Verified against the real pre-fix files rather than a fixture: the checker run over both electron `SKILL.md` files at their pre-reclassification commits reports exactly two violations, both wrong-value on `defaultSkill`.

### Fixed
- **YAML frontmatter delimiters were stripped from a minimized `SKILL.md` (#278).** A minimization pass removed standalone `---` lines as horizontal rules, which also removed the frontmatter's own opening and closing delimiters — so the block parsed as body text, and the damage reached the packaged zip. Worth recording because it passed **every existing gate**: `validate-minimization.js` compares sizes only, packaging does not parse mirror frontmatter, and `skills-manifest.test.js` reads `Skills/` source rather than the mirror. It was caught by the value-level assertion added for #277/#278 attempting to parse the zip's frontmatter and getting an empty document.
- **Directory listings are now cached for the life of one audit run (#296).** Adding the first glob-bearing patterns to `python` meant each unpaired source triggered full tree walks, taking #285's cache guard from under 78 `readdirSync` calls to 123. Caching match results does not help — candidates are expanded per source (`tests/**/test_mod0.py`, `tests/**/test_mod1.py`), so the strings differ; what repeats is the `readdirSync` of the same directories, once per candidate per source. One directory cache per run fixes it and is strictly cheaper than the previous behaviour, since the tree does not change during a run.

### Repository
- **Registry checksums are computed over packaged zip bytes**, and zips embed timestamps, so a rebuild changes the checksum for byte-identical content. A transient rebuild of `api-versioning.zip` during this release's work left the committed registry asserting a checksum for a zip that had since been restored. Regenerated and verified against the committed artifact — for a distribution repository the checksum is a consumer-facing verification artifact, so a stale value is a correctness problem rather than noise.
- **`README-DIST.md` skill-type tables corrected.** Injector Skills 5 → 3 and Reference Skills 17 → 19, with both electron skills moved between the tables to match their new `type`.

## [0.18.0] - 2026-09-09

### Changed
- **`tdd-refactor-coverage-audit` 1.0.1 → 1.1.0.** One version covers all four engine changes below; they ship together and are only meaningful together.
- **Stock `typescript`, `javascript` and `svelte` conventions now pair a mirror test tree (#291).** Every `testPattern` for those three was `{dir}`-anchored, so a project keeping tests in a repository-rooted mirror (`tests/unit/services/foo.test.ts` for `src/main/services/foo.ts`) paired **nothing** and the audit reported zero coverage for the whole project. The mirror layout is conventional in both ecosystems, and `python`, `ruby`, `elixir` and `java` already carried non-`{dir}` patterns — these three were the outliers. Adds `tests/**`, `test/**` and `__tests__/**` rooted patterns to all three entries, retaining every existing pattern so colocated pairing is unaffected. The matcher already supported `**` in the directory portion, so no engine change was required. Measured against this repository: 51 tracked JavaScript sources paired **0** under the `{dir}`-anchored set and **29** with the mirror patterns added.
- **`undetermined` is now decided by test *location*, not test *shape* (#295).** The safety net added in #285 asked only whether a project contained a file shaped like its language's tests. Shape and location are independent axes and it measured the first: `testShapeGlobs` opens `{dir}` to `**`, so nine of the ten bundled languages produce a location-blind glob such as `**/*.test.js`, which matches the project's own correctly-named tests wherever they sit. A mirror-layout project therefore *satisfied* the check and every source was reported as missing a test. The two populations received each other's verdicts — a project with 173 tests reported `coverage: 0.0` while a project with **no tests at all** reported `1.0`, and #285's documented behaviour was delivered exclusively to projects it was not written for. Only `elixir`, whose patterns carry no `{dir}`, was unaffected. Classification now requires that tests of the language exist **and** that no source of that language paired anywhere in the project. This needs project-wide pairing counts, which are not known inside the per-file loop, so unpaired sources are deferred into a pending bucket and partitioned after iteration — a re-partition of an array already in memory, not a second filesystem walk. Known imprecision, recorded rather than left to be discovered: a monorepo pairing in one package and not another still reports `missingTests` for the unreachable package.

### Added
- **`diagnostics.unrecognizedExtensions` in the result envelope (#299).** A source file whose extension matched no language entry left the loop before it was counted, and no envelope field made the skip visible — a Vue project with 80 untested components and 2 tested utilities reported `coverage: 1.0`, and a change touching only `.vue` files reported `newSources: 0`, indistinguishable from a change that touched nothing. Reported as a **count keyed by extension** rather than a file list: the audit runs over changed files, and a real change set is mostly `.md`, `.json`, `.lock` and `.png`, which a per-file list would bury. The grouped form stays readable at any change-set size and is self-prioritising — an entry reading `".vue": 82` says what to add next, so the language backlog populates from evidence. Files with no extension count under an explicit `"(none)"` key. A `diagnostics` **container** rather than a top-level field, so #301 could add its own entry kind instead of a second field meaning "something the audit ignored". Two skips deliberately stay out: `ignoredSourcePatterns` matches and `excludePatterns` rejections are recorded decisions, not gaps. A suppression list for known-non-source extensions was considered and rejected — it goes stale and can only hide a row someone wanted.
- **`diagnostics.unreachableLanguageEntries` in the result envelope (#301).** Reports each language entry no file can reach, as `{ name, shadowedBy }`, because every one of its extensions is already claimed by an entry ahead of it. Reuses the `diagnostics` container #299 introduced. Partial shadowing is deliberately not reported — an entry keeping even one unclaimed extension can still match.

### Fixed
- **An `additionalLanguages` override was unreachable whenever a bundled entry claimed the same extension (#301).** `mergeConfig` appended override keys *after* the bundled map and `detectLanguage` returns on the first extension match, so a project entry declaring `.js` sat nine positions behind bundled `javascript` and was never consulted. It validated, merged, and had **no observable effect of any kind** — dead config that looked live. The only expressible workaround was overriding the `javascript` key itself, which replaces the bundled definition wholesale and requires restating every bundled pattern by hand: the staleness trap #291 argues against, and for a claimed extension it was the *only* route. Override-declared entries are now consulted before bundled ones, with same-key wholesale replacement unchanged. Entries that remain unreachable are reported rather than passing silently, stated as a property of **position, not origin**, so two override entries colliding with each other are caught by the same check. **Upgrade note:** a project already carrying a colliding override has been running with it inert; this release makes it live, so `coverage` can move in either direction on the first run after upgrade. Called out explicitly rather than shipped as a silent bug fix, because the discontinuity is otherwise unattributable — `--config-only` shows the resolved language order.
- **A worked `testCoverageAudit` example for dot-directory layouts (#289).** `SKILL.md` carried exactly one Project Override example — a `myDsl` block with `spec/{stem}.spec.mydsl` — which demonstrates the three merge keys but not the awkward case a field report actually hit: a source root that is a dot-directory with a test root that does not mirror the source path. Adds that example, states that a pattern omitting `{dir}` is anchored at the repository root, and states that `{stem}` and `{dir}` substitute inside override `testPatterns` exactly as in the bundled conventions — documented until now only for the bundled set. `_meta.description` in the conventions file named the config key and stopped there; it now points at the section where the mechanism is explained. The example only works because of #301; before 1.1.0 the entry validated, merged and was never reached. The docs also state plainly that this particular layout no longer *requires* an override, since #291 gave bundled `javascript` a `tests/**` pattern that reaches it — the example shows the mechanism, not a necessity.

### Repository
- **Charter refreshed against the codebase.** `generateFromCharter()` had been failing outright on the charter title, so `domain-entities.json` had never been generated; it now exists and validates. Tech Stack recorded as Node.js with Jest 29 rather than "to be determined", Test-Strategy records the 173 test files and the `verificationCommands` gap, and Architecture and Milestones record that the distribution repository exists and that `SKILLS-manifest.json` — not a `skill-catalog.json` — is the Praxis Hub Manager registry.
- **Release-gate recipes installed** into `prepare-release`, `prepare-beta` and `merge-branch`: `nodejs-tests`, `dependency-audit`, `coverage-gate` and `ci-gate-before-merge`. The coverage gate is calibrated to this suite's measured baseline (statements 60, branches 57, functions 68, lines 60 against actuals of 62.17/59.77/70.85/62.47) rather than the recipe's default 80%, so a failure means a real drop instead of standing debt.
- **`prepare-beta.md` Step 4.3 invoked `wait-for-ci.js` bare.** Unscoped, the gate passes a null filter and `selectRun()` returns the newest run repo-wide, so an unrelated branch could supply the verdict (#2464). Now scoped with `--branch`, matching `merge-branch` and `prepare-release`.
- **`json-validator`, `mutation-testing` and `property-based-testing` enabled for this project** via Praxis Hub Manager.

## [0.17.0] - 2026-09-01

### Changed
- **`tdd-refactor-coverage-audit` gained an `undetermined` verdict, and `coverage` changed meaning (#285).** The audit had two outcomes per source — paired or missing — so a project layout its `testPatterns` could not express was reported identically to a source whose test was never written: a depressed coverage figure and a list of expected paths that were never going to exist. The reader had no signal that the tool had not understood the layout, so the natural response was to doubt the project rather than the audit. A source is now **undetermined** when its language was detected, no candidate exists on disk, and the project contains no file anywhere matching that language's test-shape globs. Output gains `undetermined[]` (`{ file, language, checked }`) and `undeterminedCount`. **`coverage` is now `pairedSources / (pairedSources + missingTests.length)`** — undetermined sources leave the denominator, so the ratio describes only files the audit understood. This is a **breaking change in meaning** for any caller comparing `coverage` to a floor: an unreadable layout now reports `1.0` beside a non-empty `undetermined[]`. Recorded in `Construction/Design-Decisions/2026-09-01-coverage-undetermined-verdict.md`.
- **CI now runs on every branch (#287).** `skill-ci.yml` restricted its push trigger to `branches: [ main, 'isd/**' ]`, so every other branch got no CI at all — silently, with no run and no error. The gap reached the release path: `/prepare-release` creates `release/$VERSION` itself, and `release/**` was not listed either, so the release command produced a branch its own pre-merge CI gate could never see a run for. The filter is removed rather than extended: `/create-branch` takes an arbitrary name, so no enumerated list stays correct. `pull_request` keeps its `main` filter. Recorded in `Construction/Design-Decisions/2026-09-01-ci-branch-coverage-no-allowlist.md`.

### Fixed
- **`tdd-refactor-coverage-audit`'s self-exclusion guard was dead for every compound-suffix test file (#284).** The guard compared a file against a candidate built by `expandTestPatterns`, which substitutes the file's own stem — and `path.basename('foo.test.js', '.js')` is `foo.test`, so the candidate was `foo.test.test.js`, never equal to the file being tested. Test files were therefore counted as unpaired sources, depressing `coverage` and emitting impossible expected paths. Replaced with a glob predicate matching `{stem}` left open. The fix is confined to the guard: `expandTestPatterns` is shared with the pairing path, so changing its stem derivation would also alter the expected test path of every dotted source filename in every language. Adds the suite's first `audit()`-level tests, over a temp git repo covering all ten bundled languages.
- **The conventions schema required a `languages` field that `mergeConfig` discards (#286).** Every `framework-config.json` → `testCoverageAudit` override had to carry a field the consumer never reads; omitting it failed validation, and the documented example in `SKILL.md` was itself rejected by the shipped schema. The schema now exposes two entry points over shared `$defs`: a strict root that still requires `languages` for the bundled conventions file, and a lenient `#/$defs/override` that requires nothing. Composed with `allOf` rather than a `$ref` carrying a sibling `required`, because the bundled validator early-returns on `$ref` and would have dropped the sibling silently. A test now asserts schema and consumer agree in both directions — the assertion whose absence allowed the defect.
- **`wait-for-ci.js` exit 3 is now documented identically at every repo-owned gate (#287).** It returns `3` with `success: false` and `status: "no_runs"` when no CI run exists — not a pass. `/prepare-release` enumerated no exit codes at all under a heading reading *"CRITICAL: Do not proceed until CI passes"*, while `/work` Step 1a enumerated `3` as *continue*. Each site now states the same meaning and its own action. Two adjacent defects fixed alongside: `merge-branch.md` pointed at `.claude/scripts/framework/wait-for-ci.js`, which does not exist (disabled template, so it never fired), and both `merge-branch.md` and `prepare-beta.md` invoked the gate bare — the #2464 defect where a null filter lets `selectRun()` return the newest run repo-wide.
- **`js-yaml` promoted from a hoisted transitive of `jest` to a declared devDependency** (5.4.1), so the workflow regression tests cannot break on an unrelated `jest` bump.

## [0.16.0] - 2026-08-27

### Added
- **Real-run case studies for the engage-\* family** — worked examples under `Docs/case-studies/`, each cross-linked from its skill row in `README-DIST.md`: `engage-crucible` (LLM inference cost plateau), `engage-apothecary` (post-flight DVT differential) and `engage-forge` (observability onboarding redesign) (#262); `engage-prism` (B2B SaaS AI-features make-vs-buy) (#265); `engage-exocortex` (ANN search over 100M embeddings on a 64GB budget) (#266); `engage-chorus` (four-VP budget mediation) (#267); `engage-codex` (forensic-accountant mountain-town Act I) (#268); `engage-lexicon` (SaaS click-through arbitration under the California McGill rule) (#269); `debate-prism` (mid-cap enterprise SaaS buyback vs AI reinvestment) (#270); `spar-exocortex` (streaming-log dedup under a 512MB budget) (#271). The deploy pipeline now copies `Docs/` into the distribution repo and gates on a case-study placeholder-URL check.
- **`effort: high` declared across the engage/spar/debate skill family**, with the governing rule added to `SKILL-DEVELOPMENT-GUIDE.md` and a regression test pinning it (#263).

### Changed
- **The `ajv`-missing contract is now loud-optional for `engage-exocortex` and `engage-prism`** — this reconciles a contract that had diverged in *opposite* directions between this repository (#252 — hard-fail, exit `1`) and `rubrical-worker/idpf-praxis-dev#2562` (loud-optional, exit `0`). When Node is present but `ajv` is unresolvable the scripts no longer halt: they emit exactly one stderr warning naming the module and the consequence, report `"validation": "unavailable"` in the result envelope, and exit `0`. A genuine schema violation still exits `1`, and a missing schema file (`ENOENT`) keeps its own distinct branch and never borrows the `ajv` diagnostic. Recorded in `Construction/Design-Decisions/2026-08-18-ajv-contract-reconciliation.md`, which supersedes #252 on the `ajv`-missing branch only and leaves the rest of the No-Runtime Fallback Pattern standing. `spar-exocortex` deliberately retains its own hard-fail contract. (#275)
- **`codebase-analysis` 1.0.0 → 1.1.0** — new sections, backward compatible; see *Fixed* (#274).
- **`engage-chorus` stakeholder briefs render as Markdown tables** instead of embedded JSON (#272).
- **Electron skills dropped from the `defaultSkill` list** — `electron-cross-build` and `electron-development` are platform-category skills and no longer install by default (#264).
- Verbatim-prompt blockquotes standardized across every case study, with a regression test (#273).

### Fixed
- **`codebase-analysis` Tech Stack Detection had no defined output for a zero-match run** (#274) — the detection table carried thirteen file-pattern rows and no null branch, while the Confidence Levels ladder bottomed out at *Low — weak signals*, which still presumes a signal. Since `## Usage` mandates a "technology summary **with confidence**", a run that found no manifest had no honest answer available to it. Surfaced by a consumer artifact asserting a Go ecosystem "detected via `go.mod`" in a repository containing no `go.mod` at any depth. The procedure now defines an explicit **Empty result** branch (separating *no manifest* from *no evidence*, so secondary evidence can be reported without ever being attributed to a manifest), a **None** confidence rung, an explicit root-only **Search depth** statement covering the monorepo case, and an **Attribution rule** requiring every named technology to cite a file that was actually opened. `resources/tech-stack-detection.md` is reconciled so that extension evidence stays admissible but is never reportable as a manifest-derived detection.
- **Three high-severity advisories cleared in transitive dependencies** — `fast-uri` 3.1.2 → 3.1.6 (host confusion), `js-yaml` 3.14.2 → 3.15.2 (quadratic-complexity DoS), and `brace-expansion` 1.1.13 → 1.1.18. No `package.json` change was required: the advisories were published against an unchanged lockfile, and the superseded `fast-uri` pin had itself been added to patch an earlier advisory in the same package.

## [0.15.0] - 2026-05-17

### Added
- **6 new `/engage-*` cooperative-refraction skills** — broadens the engage-family beyond `/engage-prism` (business/marketing/finance) and `/engage-exocortex` (code/algorithm) into six new domains. Each refracts a question into N parallel subagent paths, enforces a domain-appropriate citation/artefact contract, and synthesizes a structured proposal: `engage-lexicon` (legal / policy / compliance — pre-emption analysis, jurisdictional citation discipline, #202); `engage-crucible` (scientific research / hypothesis generation — Bayesian prior-update, falsification gates, evidence-tier-weighted citations, `--offline` mode, #203); `engage-forge` (product / UX design exploration — artefact-first contract, paradigm-palette inspiration, mandatory audit + critique gates, #204); `engage-apothecary` (educational clinical reasoning — refusal-as-load-bearing-contract preflight, Bayesian pre/post-test reasoning, red-flag-advocate gate, strictly educational disclaimer, #205); `engage-codex` (narrative / screenplay / long-form structure — beat-sheet/scene-outline/character-arc/thematic-resonance artefact schemas, #206); `engage-chorus` (multi-stakeholder negotiation / mediation — stakeholder briefs + mediator output schema, #207). All ship with packaged zips, 3 worked examples each, and entries in `Skills/MAINTENANCE.md`'s "when to pick which" selector.
- **`spar-exocortex` skill — propose-attack-measure loop with execution-backed validation** — adversarial sibling to `/engage-exocortex`. Spawns proposer/attacker subagent pairs that produce diff-and-test artefacts (real executable code, not prose), runs them in an isolated workspace, and a judge subagent scores proposals against measured outcomes rather than projected ones. Adopts the no-runtime preflight + scoped-fallback pattern. (#216)
- **`/engage-exocortex` incremental refinements** — execution-phase enhancement: paths now produce real run artefacts under `examples/` (sliding-window-max algorithmic, rate-limiter architecture); complexity-class diversity enforced via `targetComplexity` + `invariantChoice` brief slots and `antiOverlapRules` in `cross-references.json`; paradigm-strategy tuples reclassified as advisory (no auto-routing); slim catalog reduces token budget while preserving the four core paradigms. (#215)

### Changed
- **No-Runtime Fallback Pattern (Pattern 4) rolled out across script-using skills** — invokable skills that depended on Node-based helper scripts now preflight for runtime availability and surface a scoped-fallback path with explicit "limited mode" messaging when Node is absent. Touches `engage-*` family preflights (#252), `json-validator` (#253), and `tdd-refactor-coverage-audit` (#254). Pattern formally documented in `SKILL-DEVELOPMENT-GUIDE.md`'s **No-Runtime Fallback Pattern** section so future skill authors adopt it by default. (#240, #251, #255)

### Fixed
- **4 skills brought into conformance with SKILL-DEVELOPMENT-GUIDE.md type-rule standards** (mechanical audit follow-up surfaced by `/fw-audit-skills` on 2026-05-16):
  - `electron-cross-build` (#256): added 3 injector typeRule fields (`disable-model-invocation: true`, `user-invocable: false`, `defaultSkill: true`).
  - `electron-development` (#257): same 3 injector typeRule fields.
  - `responsibility-gate` (#258): added `disable-model-invocation: true` (reference-skill contract — was being auto-invoked from description prior to fix).
  - `engage-prism` (#259): rephrased L411/L413 prose (`render each path` → `serialize each path`) to dodge the `provider-cli-invocation` drift-indicator regex collision; preserved markdown-rendering semantics. Output-contract test assertion updated to match.

## [0.14.1] - 2026-04-25

### Fixed
- **`build-skill-packages.js` produces spec-compliant ZIPs on Windows** — replaced the Windows PowerShell `Compress-Archive` branch with the cross-platform `archiver` package. The old branch produced backslash path separators (e.g. `docs\foo.md`), violating ZIP APPNOTE 4.4.17.1 and causing Claude Desktop's skill-upload validator to reject every Windows-built distributable zip with the misleading "Skill files must have a .skill, .zip, or .md file extension." error. One archiver-based code path now serves Windows, macOS, and Linux. New regression test inspects every `Skills/Packaged/*.zip` central directory and fails on any backslash entry. All 46 packaged zips rebuilt. (#238)

### Changed
- **8 invokable/reference skills refurbished to the JSON-driven config pattern** — `install-node` (#231); the five hosted-platform setup skills `digitalocean-app-setup`, `playwright-setup`, `railway-project-setup`, `render-project-setup`, `vercel-project-setup` (#232); `flask-setup` + `sinatra-setup` (#233); and the three invokable scaffold/integration skills `i18n-setup`, `postgresql-integration`, `sqlite-integration` (#234). Each skill bumped to v2.0.0; volatile knobs (CLI install commands, doctl/CLI subcommand templates, default ports, secret names, GitHub Action versions) moved to `resources/{skill}.config.json` validated by a sibling `.schema.json`; SKILL.md gains a mandatory Step 0 config re-read; companion `docs/{skill}-rationale.md` preserves the original prose during refurbishment.
- **External-orchestration audit pattern added to `/fw-audit-skills`** — new Step 3f (External-Orchestration Drift) checks that any skill declaring `externalOrchestration: true` in `.claude/local-metadata/skill-requirements.json` keeps its config keys aligned with what SKILL.md references. Schema entry + new section in `SKILL-DEVELOPMENT-GUIDE.md`. Design decision captured in `Construction/Design-Decisions/2026-04-25-external-orchestration-config-pattern.md`. (#235)

## [0.14.0] - 2026-04-24

### Added
- **Canonical skill category taxonomy with authoring-side label ownership** — introduces `.claude/local-metadata/skill-categories.json` (+ schema) as the single source of truth for category slugs AND display labels. Initial 9-slug taxonomy (`testing`, `code-quality`, `analysis`, `documentation`, `platform`, `api`, `database`, `devops`, `compliance`) with a deprecation/aliases map so renames (e.g., `problem-solving` → `analysis`) never break historical SKILL.md frontmatter. New `.claude/scripts/framework/skill-category-loader.js` centralizes load + resolve + alias routing; `build-skill-registry.js` enriches every registry entry with a canonical `category` slug and a `categoryLabel`. `SKILL-DEVELOPMENT-GUIDE.md` gains a **Skill Categories** section covering the list, slug naming rule, selection heuristic, and the expansion process (adding a new category is a JSON edit — no code changes to the generator, validator, or auditor). Design decision captured in `Construction/Design-Decisions/2026-04-24-skill-category-taxonomy-source-of-truth.md`. (#228)
- **`validate-skill-category.js` — category enforcement CLI** — new `.claude/scripts/framework/validate-skill-category.js` resolves a SKILL.md's category through the loader: exits 0 on canonical slugs, exits 0 with a `Deprecated alias` warning for aliases, exits 1 with skill path + value + reason on unknown slugs. Wired into `/skill-validate` Step 2.2 and `/fw-audit-skills` Step 3d so authoring-time drift fails at edit rather than at display. (#228)

### Changed
- **Registry generator fails fast on unknown category slugs** — `build-skill-registry.js` now resolves each skill's `category:` through `skill-category-loader.js` and exits 1 with a skill-by-skill list when any value is neither canonical nor aliased. Bad categories cannot reach the dist repo. (#228)
- **7 skills migrated to canonical category slugs** — `engage-exocortex` (`problem-solving` → `analysis`), `error-handling-patterns` + `resilience-patterns` (`development` → `code-quality`; reclassified from the proposal's default `platform` suggestion because both are programming-pattern references), `i18n-setup` + `seo-optimization` (`web` → `platform`), `install-node` + `responsibility-gate` (`setup` → `devops`). 46 skills now distributed across 9 canonical slugs; 0 skills on aliases (alias map remains as a safety net). (#228)
- **`/fw-audit-skills`, `/skill-validate`, `/fw-add-skill`, `/fw-edit-skill` load from `skill-categories.json`** — command specs updated to read categories from the new source of truth instead of the obsolete `validCategories` array in `skill-requirements.json`. Deprecated aliases now surface as `warn` findings naming the canonical replacement. (#228)

### Fixed
- **3 pre-existing failing test suites converted to proper jest form** — `tests/skills/build-skill-packages.test.js` (19 assertions → 9 jest tests), `Skills/tdd-process/tests/tdd-checklist.test.js` (custom runner → 10 jest tests), `Skills/tdd-refactor-coverage-audit/tests/test-coverage-audit.test.js` (custom runner → 22 jest tests). All three used a `tests.push()` + `process.exit()` harness that jest's worker-lifecycle reported as "suite failed to run" while the inner assertions all passed — producing false red on every full-suite run and defeating regression gates. Canonical `npm test` (jest --runInBand): 1039/1039 tests, 75/75 suites, 0 failures. (#230)
- **`.github/workflows/skill-ci.yml` drops the custom-runner step** — the CI workflow explicitly excluded `build-skill-packages` from the jest step and invoked it separately as `node tests/skills/build-skill-packages.test.js`, because the file was historically a standalone script. With the #230 conversion to describe/it blocks, the custom invocation fails with `describe is not defined`. Drop the special step; jest covers the whole `tests/skills/` tree uniformly. (#230)

### Deprecated
- **`validCategories` array in `skill-requirements.json`** — removed in favor of `.claude/local-metadata/skill-categories.json`. A `_validCategoriesNote` pointer is left in place. Tooling that still reads `validCategories` should migrate to `skill-categories.json` → `categories[].slug` + `aliases`. (#228)

## [0.13.1] - 2026-04-23

### Changed
- **`tdd-refactor-coverage-audit` promoted to a default skill** — `Skills/tdd-refactor-coverage-audit/SKILL.md` frontmatter flips `defaultSkill: false` → `defaultSkill: true`, adding the skill to the `defaultSkills` array in `.claude/local-metadata/skill-keywords.json` (now 11 default skills). `/work` Step 6a audit (3) coverage audit now runs in IDPF projects without per-project opt-in; the previous "Skipped coverage audit: tdd-refactor-coverage-audit skill not installed." notice no longer fires when the default skill set is installed. README-DIST description annotated accordingly. (#226)
- **`engage-prism` return-side validation + citation liveness spot-check** — primary agent now rejects zero-fetch subagent returns (patterns A/B) and re-dispatches once with a directive naming a specific primary-source URL from the research plan; a second zero-fetch tags the path `evidence-fabrication-risk` (behavioral) distinctly from `degradationEvidence="unverified"` (environmental). Synthesis surfaces fabrication-risk paths under a top-of-proposal banner and excludes them from any `convergent: true` claim. A per-path URL liveness spot-check (WebFetch against one citation per subagent) confirms reachability + publish-date sanity before the proposal is written; blatant publish-date mismatches trigger the same fabrication-risk tag. `proposal-template-schema.json` extended for the `fabricationRisk` flag; docs updated to describe the behavioral-vs-environmental distinction. (#220)
- **`debate-prism` subagent web-research enforcement** — parity import of the #220 return-side validation contract: zero-fetch advocate returns rejected + re-dispatched with a named primary-source URL; second zero-fetch tags the advocate `evidence-fabrication-risk`. Judge output schema extended with `perAdvocateFabricationRisk: {for, against}` which the judge MUST reference in `confidenceRationale` whenever either flag is set. Weakening-evidence URL live-verification runs before proposal generation; dead URLs or publish-date mismatches on the load-bearing weakening citation re-dispatch the judge once, then block the proposal with an explicit error rather than writing it with an unverified citation. (#221)
- **`argument-hint` frontmatter for `/engage-prism` and `/debate-prism`** — both SKILL.md files now surface every documented flag at skill registration time. Parity tests (`tests/skills/engage-prism-argument-hint-parity.test.js`, `tests/skills/debate-prism-argument-hint-parity.test.js`) assert frontmatter ↔ body Options-table flag parity in both directions, so adding or renaming a flag fails CI until both surfaces are updated. Docs for both skills reference the argument-hint as the flag-discovery surface. (#223, #224)
- **Shared `engage-*` scripts relocated post-v0.90 hub upgrade** — `match-signals.js` + input/config schemas moved to `scripts/skills-shared/` (project-owned, outside the symlinked framework territory that the v0.90 hub upgrade overwrote). `inline-shared-scripts.js` + drift test updated to read from the new path; `engage-prism` and `engage-exocortex` SKILL.md frontmatter restored with `sharedScripts:`; `MAINTENANCE.md` "Shared scripts (build-time inlining)" section points at the new path with the v0.90 rationale. Design decision captured in `Construction/Design-Decisions/2026-04-22-shared-scripts-relocated-post-v0.90.md`. (#225)

### Documented
- **`/engage-exocortex` has no web-research enforcement by design** — docs explain why `engage-exocortex` targets code/algorithm/architecture problems where path briefs are reasoning-only and do not require citations, so the #220 return-side validation machinery does not apply. (#222)

## [0.13.0] - 2026-04-22

### Added
- **debate-prism skill — adversarial-dialectic sibling to `/engage-prism`** — new invokable skill that spins up for/against subagent paths on a question, enforces a shared citation schema (cloned from `/engage-prism` for contract parity), and terminates with a judge-output schema requiring `weakeningEvidence`, `verdict`, and `flipConditions`. For/against briefs carry a citation-overlap contract so the two sides cannot lean on the same sources. Proposal template supports conditional disclaimers and round-history sections; a `--round-two` flag triggers a second judging round when the first verdict is unresolved. Ships with two narrative worked examples (`DEBATE-acme-stock-buy-current-prices`, `DEBATE-shut-consumer-focus-enterprise`), a "when to pick which" guide in `Skills/MAINTENANCE.md` distinguishing `/debate-prism` from `/engage-prism`, and a packaged zip. (#214)
- **Shared `match-signals.js` + build-time consumer inlining** — adds `.claude/scripts/shared/lib/match-signals.js` (with `match-signals-input-schema.json` and `match-signals-config.schema.json`) as the single source of truth for fuzzy keyword-to-signal matching across `/engage-prism` and `/engage-exocortex`. Consumers declare their dependency via `sharedScripts:` in `SKILL.md` frontmatter; `inline-shared-scripts.js` runs at build time (and in a new jest `globalSetup`) to copy the authoritative file into each consumer's `scripts/` directory. The `.min-mirror/` pipeline writes inlined copies too so the dist repo stays consistent. A drift test (`tests/skills/shared-script-inlining.test.js`) asserts byte-identity; an explicit CI step (`skill-ci.yml`) runs the inliner before tests. `MAINTENANCE.md` gains a shared-scripts section documenting the contract. Design decision captured in `Construction/Design-Decisions/2026-04-22-shared-scripts-inlining-mechanism.md`. (#209)
- **`--confirm-keywords` and `--structured-routing` flags for `/engage-prism`** — both flags default off; the pre-existing mandatory `AskUserQuestion` keyword-confirmation gate (solo-review friction) and the mandatory match-signals taxonomy routing (~15-file overhead producing labeled-only diversity) are now opt-in. Default flow: primary agent names paths in one sentence each and loads taxonomy entries only when genuinely useful. Pre-v0.13.0 behavior is fully recoverable via `--confirm-keywords --structured-routing`; the backward-compat recipe is recorded in `Skills/MAINTENANCE.md`. (#213)
- **`primarySourceClass` evidence-based anti-overlap for `/engage-prism`** — new field on each path brief (e.g., `primary-filing`, `practitioner-retrospective`, `quantitative-dataset`, `adversarial-bear-source`). The anti-overlap validator rejects runs where two paths share a primary source class — path diversity is now substantive (different evidence classes), not labeled (different paradigm/structure/strategy tuples). (#213)
- **Mandatory red-team path for directional `/engage-prism` questions** — when the question contains a stated recommendation direction ("should we X"), N automatically includes a bear path whose brief requires the strongest counter-case with citations the for-path did not use. Synthesis explicitly records whether the bear survived validation. (#213)
- **`convergent` flag + disagreement-audit phase in `/engage-prism` synthesis** — before writing the recommendation, synthesis enumerates where paths disagreed. If all paths agree across validated dimensions, the run is tagged `convergent: true` and surfaced as a user-visible note so consensus vs. groupthink becomes judgable, not hidden. (#213)
- **`examples` and `domains` codified as copy-as-is subdirectories** — `.claude/scripts/framework/minimize-config.json` adds `"examples"` and `"domains"` to `copyAsIsSubdirectories`; `isCopyAsIs()` extends its always-verbatim early-return so these subdirs bypass the `.md`-vs-type-minimizable check (same semantics as `docs/`). Codifies existing observed behavior and contract-protects contract-demonstration examples (output schemas, gate behaviors, citation shapes, refusal paths) and domain-scoped reference material against silent compression drift if the orchestrator's `.md` scope is ever widened. New test `tests/scripts/framework/minimize-helper-copy-as-is.test.js` pins the contract for invokable/reference skills. `minimize-files.md` Step 2 documentation enumerates all four copy-as-is subdirectories with per-subdir rationale. (#217)
- **Force-tracked `update-release-notes.js`** — adds `.claude/scripts/shared/update-release-notes.js` + `.claude/scripts/shared/lib/input-validation.js` to `.gitignore` force-track exceptions so the deploy-dist workflow can invoke them from a fresh clone of the dist repo. New `tests/workflows/deploy-dist-tracked-paths.test.js` asserts both paths ship. README gains a "Force-Tracked Hub-Managed Scripts" section documenting the pattern. v0.12.3 stub-release-body decision recorded in `Construction/Design-Decisions/`. (#210)

### Changed
- **`/engage-prism` proposal output slimmed** — signal-analysis table collapsed to a one-line footnote; raw subagent envelope JSON offloaded to a sibling `Proposal/PRISM-{slug}.audit.json` file so the main proposal stays decision-focused. Typical proposal size target < 8KB. Docs refreshed (`getting-started.md`, `proposal-format-guide.md`, `synthesis-guide.md`) to reflect the new default flow; new worked example `examples/PRISM-default-flow-should-we-expand-jp-saas.md` demonstrates source-class diversity, the bear path, and the convergent flag in action. (#213)
- **`/engage-exocortex` and `/engage-prism` declared as `sharedScripts:` consumers** — both SKILL.md files list `match-signals.js` (and matching input schemas) in their frontmatter. The inliner copies the authoritative hub version into each skill's `scripts/` at build; `.gitignore` excludes the inlined copies so local dev pulls fresh at build. (#209)

### Fixed
- **`Skills/debate-prism/docs/` tracked in git** — empty-dir regression guard: added `docs/getting-started.md` stub so the `docs/` subdir is tracked, preventing a CI failure where the packaging pipeline expected the directory to exist. Test asserts the file exists (`tests/skills/debate-prism-scaffolding.test.js`). (#214)

## [0.12.3] - 2026-04-20

### Added
- **engage-prism: OSS / dev-tool GTM signal coverage** — 5 new signals in `cross-references.json` (`oss-monetization-design`, `developer-tool-community-growth`, `solo-maintainer-unit-economics`, `devtool-content-seo-ia`, `product-led-licensing-enforcement`) with keyword, paradigm, structure, and strategy triples. Match-signals confidence on a representative OSS/dev-tool GTM query rises from 0.15 (fallback) to 1.0. Added paradigms `comparable-benchmark` and `policy-design` and strategy `driver-tree-with-sparse-priors`. New worked example `examples/PRISM-oss-monetization-sample.md`. `docs/research-plan-guide.md` gains a "Sparse-data unit economics" section. Closes the second-audience gap for builders/founders alongside the existing finance/marketing-analytics coverage. (#200)

### Changed
- **deploy-dist workflow: populate GitHub Release body from CHANGELOG** — `.github/workflows/deploy-dist.yml` now invokes `update-release-notes.js` from `cwd=dist` after `gh release create`, replacing the `"Skills distribution release $VERSION"` stub with the full per-version CHANGELOG section (promoted heading levels, Summary block, Full Changelog compare link). Missing CHANGELOG section logs a warning and leaves the stub in place; does not fail the deploy. Resets `origin` URL to the clean `https://github.com/rubrical-works/idpf-praxis-skills.git` before the script runs so `getRepoUrl()` does not embed `DIST_REPO_TOKEN` in the public compare link. Mirrors the praxis pipeline's dist-repo release-body step. (#201)

## [0.12.2] - 2026-04-20

### Changed
- **engage-prism / engage-exocortex: fuzzier keyword matching** — `match-signals.js` now normalizes hyphens/underscores to spaces on both user and signal keywords, and applies a light suffix strip (`s`, `es`, `ing`, `ed`, `al`, `ly`) in the 0.3 substring tier only, guarded by a ≥4-char residue rule. Exact (1.0) and word-boundary (0.7) tiers unchanged. Closes the mechanical-miss class where `"agriculture"` failed to reach `"agricultural commodities"` and `"next-quarter"` failed to reach `"next quarter"`. (#191, #192)
- **engage-prism: attempted-call evidence required for degraded reports** — a subagent setting `webResearch.performed = false` must now populate `webResearch.attemptedCalls[]` with ≥1 entry documenting an actual fetch attempt. Reports with `performed=false` and empty `attemptedCalls[]` are rejected as contract violations and re-dispatched once with an explicit "attempt at least one fetch" directive; if the retry still returns zero attempts, the report is accepted but tagged `degradationEvidence="unverified"` so synthesis deprioritizes it further. Touches `report-template.json`, `brief-template.json`, `synthesis-config.json`, `SKILL.md`. (#193)
- **engage-prism: recency gate + anchor corroboration + date-qualified queries** — new configurable `freshnessClass` arg (`geopolitical | market | general`; default `general`) with thresholds 24h/24h/72h. When a path's freshest cited anchor source exceeds the threshold, the path is rejected and re-dispatched once with a "fetch a source dated within the last {threshold}h" directive. Probability weights and price levels now require ≥2 independent-domain citations before driving synthesis (single-source anchors tagged `anchorEvidence="single-source"`). Subagent briefs instruct including `YYYY-MM-DD` or `last 24h` in ≥1 search query for time-sensitive entities. Gate failure after retry emits `⚠️ Recency-gate degraded: freshest citation Xh old (threshold Yh)` in the path Report — never silent. (#194)
- **engage-prism / engage-exocortex: fail-fast Node preflight** — both `SKILL.md` files now document a Preflight step that runs `node --version` before Step 0 / any workflow step. Missing node or version < 18 halts with an explicit error and install link (https://nodejs.org/); a new `Node missing or < 18` row appears in each Error Handling table. The `engage-prism` prerequisites section now points to nodejs.org directly instead of the previously unresolved `install-node` skill referral. Language mirrors between the two skills so they degrade identically. (#196, #197)

### Added
- `tests/skills/engage-prism/match-signals-fuzzy.test.js`, `tests/skills/engage-exocortex/match-signals-fuzzy.test.js` — fuzzier-matching unit tests covering separator normalization, suffix-strip hits, ≥4-char guard, and 1.0/0.7 tier regression.
- `tests/skills/engage-prism-attempted-calls.test.js`, `tests/skills/engage-prism-recency-gate.test.js` — contract tests pinning the attempted-call and recency-gate language across `report-template.json`, `brief-template.json`, `synthesis-config.json`, and `SKILL.md`.
- `tests/skills/engage-prism-preflight.test.js`, `tests/skills/engage-exocortex-preflight.test.js` — preflight contract tests (including cross-skill consistency check).

## [0.12.1] - 2026-04-19

### Changed
- **engage-prism: licensed-advice constraint softened** — `SKILL.md` now permits the synthesis agent to name specific securities, options, or positions when the user asks, provided outputs stamp the new Disclaimer template. Trade execution / order placement guard retained. Refusing to name securities when the user has acknowledged informational framing is now itself a contract violation. (#184)
- **engage-prism: signal catalog expanded** — added 5 new signals in `cross-references.json` (`geopolitical-risk-positioning`, `commodity-shock-exposure`, `sector-rotation-thesis`, `tactical-positioning-short-horizon`, `investment-tooling-discovery`) and broadened keywords on 3 existing signals (`scenario-stress-test`, `portfolio-allocation-decision`, `macro-trend-assessment`). Closes the geopolitical / commodity-shock / tactical-trade vocabulary gap that previously produced zero matches. (#185)
- **engage-prism: risk-aware anti-overlap rule** — new `antiOverlapRule` requires at least one chosen strategy to be `ev-vs-risk-framing` or `sensitivity-analysis` when the matched signal is in the scenario/shock family. New `scripts/anti-overlap-validator.js` encodes both conditional rules as a pure function. (#186)
- **engage-prism: graceful fallback on zero signal matches** — `match-signals.js` now emits `ok: true, fallback: true, confidence: 0.15` with a default `scenario-analysis / scenario-grid / ev-vs-risk-framing` path when no signal matches but a finance/macro allowlist term is present. Hard error preserved when no allowlist hit. `SKILL.md` instructs the subagent to acknowledge the low-confidence routing and ask one refinement question before proceeding. (#187)
- **engage-prism: markdown output contract** — `SKILL.md` now declares a user-facing output contract: synthesis agent MUST render each path as markdown (heading, narrative, bulleted findings, numbered citation footnotes, markdown tables) and MUST preserve raw JSON inside a `<details>` block for audit. Raw-JSON-in-primary-narrative is an explicit contract violation. New example `PRISM-output-contract-reference.md` demonstrates the shape. (#188)

### Added
- `tests/skills/engage-prism-disclaimer-contract.test.js`, `engage-prism-anti-overlap.test.js`, `engage-prism-fallback.test.js`, `engage-prism-output-contract.test.js` — 18 new structural/unit tests pinning the four contract changes above.

## [0.12.0] - 2026-04-19

### Added
- **engage-prism skill** — analytical-reasoning sibling to `engage-exocortex`. JSON-driven parallel analytical explorer with citation-first contract (mandatory `citation-schema.json`), domain-specific paradigms/strategies/structures, and 5 per-domain end-to-end examples with schema-conformant citations (competitor teardown, equity ticker, paid-search ROI, remote-work trend, EV-charging TAM). Includes `docs/` reference material and Node.js prerequisite documentation. (#176, #182)
- **install-node skill** — safe, guided Node.js installer. Detects existing Node and version managers (nvm/fnm/volta), recommends a single vetted package-manager command per platform (winget/brew/nvm), runs dry-run by default, and requires explicit responsibility acknowledgement before any execution path. Bootstrap does not itself require Node. (#179)
- **responsibility-gate shared-pattern skill** — reusable responsibility-acknowledgement gate contract referenced by `install-node` and rolled out to 12 install-capable skills (digitalocean-app-setup, electron-cross-build, flask-setup, i18n-setup, observability-setup, playwright-setup, postgresql-integration, railway-project-setup, render-project-setup, sinatra-setup, sqlite-integration, vercel-project-setup). (#180)
- **engage-exocortex: Node.js prerequisite documentation** — SKILL.md now declares the Node.js runtime prerequisite explicitly and routes to `install-node` when missing. (#178)

### Changed
- Regenerated all skill metadata (registry, keywords, schemas, public manifest) to include the 3 new skills. `Skills/MAINTENANCE.md` registry table updated to 45 skills.
- Re-minimized and repackaged affected skills in `.min-mirror/` / `Skills/Packaged/`.

## [0.11.1] - 2026-04-06

### Fixed
- **build-skill-packages: tests/ subdir leaked into distributed zips** — `build-skill-packages.js` now reads `excludedSkillSubdirectories` from `minimize-config.json` (same source as `minimize-helper.js`) and skips matching directory names when walking each skill for companion files. Resolves a config-script desync that landed in `d023e2f` and shipped silently in v0.11.0. Adds a regression test that asserts no excluded subdir entries appear in distributed zips. (#171)
- **SKILLS-manifest.json silent drift** — added `build-skills-manifest.js` that scans `Skills/*/SKILL.md` frontmatter and writes a deterministic manifest (alphabetized, preserves `$schema`/`version`/`renamed`/`deprecated`). Supports `--check` mode for CI gates. New `tests/skills/skills-manifest.test.js` (9 tests) asserts the manifest stays in sync with `Skills/` on disk. `/prepare-release` extension now runs the builder alongside the other metadata builders. One-time correction: `tdd-refactor-coverage-audit` is now present in the manifest (was missing in v0.11.0). (#174)

## [0.11.0] - 2026-04-06

### Added
- **tdd-refactor-coverage-audit skill** — new self-contained companion to `tdd-process` that mechanically audits whether source files added during a TDD cycle have paired tests. JSON-driven language conventions for 10 languages (TypeScript, JavaScript, Svelte, Python, Go, Rust, Ruby, Elixir, Java, C#) with optional project overrides via `framework-config.json` → `testCoverageAudit`. Pure Node, zero external deps, schema-validated, advisory-only (never blocks the TDD gate). 22 unit tests (#168)
- **tdd-process: refactor phase audit integration** — refactor phase gains a `required[]` checklist item invoking `tdd-refactor-coverage-audit` and a new `deepReferences[]` array containing both `tdd-refactor-phase` and the audit skill. `tdd-checklist-schema.json` accepts both legacy `deepReference` and new `deepReferences[]` (backwards-compatible). Soft-skip when audit script is absent. 10 unit tests covering schema fixtures and probe behavior (#169)
- **engage-exocortex: semantic relevance scoring** — `match-signals.js` output gains per-match `relevance` (0-1) and top-level `confidence` field. Scoring tiers: 1.0 exact, 0.7 word-boundary, 0.3 substring-only. Lets callers tier match quality without re-deriving from model judgment. 6 new unit tests (#165)
- **engage-exocortex: tension-to-path collapse guidance** — new step 1a in adaptive mode methodology. Rank tensions by solution divergence, combine interdependent tensions, map top N as primary differentiators with remainders as secondary variables, then verify anti-overlap on primaries. Includes a 4→3 worked example for parallel code review architecture (#166)
- **engage-exocortex: operational scoring dimensions** — synthesis-config.json gains `operationalDimensions` block (extensibility, operational simplicity, user transparency, cost predictability) and a new `operational-graft` hybridization question. SKILL.md gains a worked example where the graft changes the recommendation (#167)

### Changed
- **minimize-config: excludedSkillSubdirectories** — new config field lets `minimize-config.json` exclude per-skill subdirectories by name from `.min-mirror/` and distributed packages. Initial value `["tests"]` keeps test infrastructure out of user-facing zips while preserving it in source for CI

## [0.10.0] - 2026-04-05

### Added
- **engage-exocortex: helper scripts** — `match-signals.js` for keyword-to-signal matching with weighted score aggregation and top-N path selection; `load-entries.js` for selective entry loading from paradigms/structures/strategies with token budget estimation (#158)
- **engage-exocortex: keyword confirmation gate** — mandatory `AskUserQuestion` gate between problem parsing and signal matching; handles zero/single/multi-keyword flows, adjust/rephrase loops, and text-based fallback (#159)
- **engage-exocortex: adaptive fallback methodology** — three-tier match quality classification (strong/weak/none) with graceful degradation; weak-match anchoring with closest-neighbor supplementation; no-match tension-driven path definition preserving parallel exploration structure (#162)
- **engage-exocortex: input schema validation** — colocated JSON schemas for both helper scripts with ajv validation (graceful degradation if unavailable)
- Unit tests for `match-signals.js` (14 tests) and `load-entries.js` (12 tests)

## [0.9.1] - 2026-04-04

### Added
- **engage-exocortex: Opus model default** — subagents now spawn with `model: "opus"` by default regardless of parent session model; `--model` flag allows override for cost-conscious usage
- **engage-exocortex: model requirements docs** — getting-started guide updated with Model Requirements section, component-model table, and trade-off warning

### Fixed
- **SKILLS-manifest not deployed** — `SKILLS-manifest.json` and `SKILLS-manifest-schema.json` added to deploy-dist.yml "Copy root files" step so they reach the distribution repo

## [0.9.0] - 2026-04-04

### Added
- **SKILLS-manifest.json** — centralized manifest for all distributable skills with schema validation (`SKILLS-manifest-schema.json`), rename migration support via `renamed` blocks, and deprecation tracking
- **engage-exocortex: getting-started guide** — new `docs/getting-started.md` explaining how to use the skill, example questions, expected output, and tips for effective usage

### Changed
- **hal-2026 renamed to engage-exocortex** — skill directory, SKILL.md frontmatter, all internal references (docs, resources, schemas, registry, keywords, tests, .min-mirror, README-DIST, MAINTENANCE.md, SKILL-DEVELOPMENT-GUIDE), framework-config.json, .gitignore, and packaged zip all updated. Historical artifacts (CHANGELOG, PRD, Proposal) preserved with original names. Skill version bumped to 2.0.0.

### Fixed
- skill-versioning-e2e test hardcoded `1.0.0` for all non-test skills — now compares against original registry versions to support skills at any version

## [0.8.0] - 2026-04-03

### Added
- **hal-2026: software engineering domains** — expanded from 8 algorithmic-only paradigms to 31 paradigms (8 algorithmic + 23 SE), 22 structures (8 + 14), and 22 strategies (9 + 13) covering architecture, testing, deployment, security, and more
- **hal-2026: context gathering pre-step** — optional Step 0 detects architecture/design keywords and loads up to 3 relevant skills via `skill-context-map.json` to enrich signal extraction
- **hal-2026: exploration proposal generation** — new Step 5 writes a persistent `Proposal/HAL-{slug}.md` document capturing the full exploration lifecycle (signals, paths, reports, synthesis); opt-out via `--no-proposal`

### Fixed
- hal-2026 SKILL.md frontmatter `description` field converted from multi-line to single-line for parser compatibility

## [0.7.1] - 2026-04-03

### Fixed
- **Minimization pipeline gap** (#140) — non-`.md` files in `resources/` and `docs/` directories (JSON, JS, YAML, etc.) were silently dropped during minimization. `cmdCopyCompanionFiles()` now copies non-`.md` files from `copyAsIsSubdirectories` instead of skipping those directories entirely.
- Additional non-`.md` resource files discovered and copied across multiple skills (`.py`, `.rb`, `.yaml`, `.toml`, `.yml`)

### Changed
- SKILL-DEVELOPMENT-GUIDE.md updated to document that `resources/` supports any file type with hal-2026 example

## [0.7.0] - 2026-04-03

### Added
- **hal-2026 skill** — JSON-driven parallel solution explorer with structured decision matrix, schema-validated references, and selective loading for minimal token usage
- **json-validator: .gitignore support** (#119) — file discovery now parses `.gitignore` patterns to complement hardcoded exclusions
- **json-validator: schema override** (#120) — `--schema-override` flag and SKILL.md prompt workflow when `$schema` references a missing file; also fixed latent bug where `type:'missing'` schemas with non-null resolved path fell through to validateFile
- **$schema references** (#121) — added `$schema` to all project-owned JSON files; created `minimize-config-schema.json` and `framework-config-schema.json`; updated existing schemas to allow `$schema` property
- **docs/ minimization exclusion** (#125) — `docs/` subdirectory convention for human-readable skill documentation, always copied as-is during minimization
- Unit tests for minimization quality gate thresholds, json-validator gitignore parsing, and json-validator schema override

### Changed
- **Sliding-scale quality gate** (#116) — replaced step-function thresholds with a hyperbolic curve that smoothly scales from 100% (near-minimum 2KB files) to 82% floor (50KB+ files)
- CI workflow now runs `npm ci` before tests (required for ajv dependency)

### Fixed
- json-validator `isCopyAsIs()` now always returns `true` for `docs/` paths regardless of skill type
- Test runner uses `cwd: PROJECT_ROOT` instead of `NODE_PATH` env override for cross-platform CI compatibility

## [0.6.0] - 2026-04-02

### Added
- Destructive pattern detection (Category 5) in command-spec-audit skill
- `defaultSkill: true` for command-spec-audit — auto-installed in IDPF projects
- `deepReference` field in tdd-checklist.json for conditional skill loading
- LICENSE and SECURITY.md to dist repo
- CodeQL workflow to dist-workflows

### Changed
- Reclassified 5 skills to correct types: command-spec-audit (invokable→reference), codebase-analysis (invokable→reference+defaultSkill), bdd-writing (invokable→reference), observability-setup (invokable→educational), property-based-testing (invokable→educational)
- Type-aware resource minimization — resource `.md` files for invokable/reference types now AI-minimized
- Full `.min-mirror` reset with updated minimization pipeline
- Removed `reference` from `minimizeTypes` — reference skills now copied as-is

### Fixed
- Copyright year updated to 2026 in all skill LICENSE.txt files
- MAINTENANCE.md lastUpdated dates synced with SKILL.md frontmatter
- Removed audit-commands directory (incorrectly copied from dev repo)

## [0.5.0] - 2026-04-02

### Added
- `resources/HOWTO.md` for all 11 reference skills — usage guides for non-IDPF projects
- CodeQL code scanning workflow for dist repo
- SECURITY.md vulnerability disclosure policy for dist repo
- Dependabot config for GitHub Actions scanning on dist repo
- Branch protection (force-push/deletion blocked) on dist repo main
- CodeQL badge to README-DIST.md
- HOWTO.md check in `/fw-edit-skill` type-change cascading — prompts to create stub when switching to injector or reference
- Reference skill HOWTO template in SKILL-DEVELOPMENT-GUIDE.md
- Docker Development Skill proposal transferred from idpf-praxis-dev

### Changed
- Renamed `HOW-TO.md` to `HOWTO.md` across all skills and references (standard naming convention)
- `SKILL-DEVELOPMENT-GUIDE.md` now documents HOWTO requirement for both injector and reference skill types
- `/fw-add-skill` reference template now generates HOWTO stub (separated from educational template)
- Dist repo CI workflow and deploy step added

## [0.4.2] - 2026-04-02

### Added
- Tiered minimization thresholds based on source file size (<3KB: 98%, 3-5KB: 92%, 5-10KB: 88%, >10KB: 85%)
- Summary report step in `/minimize-files` pipeline

### Fixed
- `LICENSE.txt` now copied to `.min-mirror/` for all skills — was missing from deployed unpacked directories
- Replaced `px-manager` shorthand with `Praxis Hub Manager` across all documentation

## [0.4.1] - 2026-04-02

### Added
- `json-validator` invokable skill — validates JSON files against `$schema` references using Ajv (single file, `--all`, `--dir` modes)

### Fixed
- `fw-edit-skill` edit menu exceeded `AskUserQuestion` 4-option limit — consolidated 6 options to 4
- `fw-add-skill` injector template missing `resources/HOW-TO.md` generation
- README-DIST.md rewritten for dist repo audience (language, title, framework compatibility accuracy)
- Minimization pipeline now copies companion files (`.json`, `.js`) and non-standard subdirectories (`lib/`, `scripts/`) to `.min-mirror/` and packages

### Changed
- Skill count increased from 39 to 40

## [0.4.0] - 2026-04-02

### Added
- Skill type taxonomy — all 39 skills classified as injector, invokable, reference, or educational via `type` field in frontmatter
- `tdd-process` injector skill with `tdd-checklist.json` for structured TDD enforcement (RED/GREEN/REFACTOR gates + failure recovery)
- `resources/HOW-TO.md` for all 5 injector skills — usage guides for non-IDPF projects
- Type-aware minimization pipeline — injector and educational skills copied as-is, invokable and reference AI-minimized
- `/fw-add-skill` interactive skill scaffolding command
- `/fw-edit-skill` interactive skill editing with type-aware cascading updates
- `/fw-audit-skills` command for auditing skills against development guide
- Skill metadata regeneration as pre-phase-1 extension in `/prepare-release`
- `SKILL-DEVELOPMENT-GUIDE.md` with full type taxonomy, frontmatter reference, and HOW-TO template
- `README-DIST.md` with per-type skill tables and usage examples
- Frontmatter hints added to `/minimize-files` command spec
- Publish unpackaged skill directories to dist repo

### Changed
- Default skills reduced from 10 to 7
- Skill registry reads version from `package.json` instead of hardcoding
- Removed skill-catalog files (replaced by registry)
- Build script output moved from `metadata/` to `local-metadata/`

### Fixed
- Added `type` field and removed deprecated `invocationMode` from all 39 skills
- CRLF line ending handling in frontmatter parsers

## [0.3.1] - 2026-03-31

### Fixed
- Add 4 new build scripts to `deploy-dist.yml` workflow for dist repo deployment
- Relax `skill-versioning.test.js` from exact `1.0.0` to `>= 1.0.0` for version-bumped skills
- Document root cause of MAINTENANCE.md version drift during v0.3.0 release

### Changed
- Add dependency audit and cross-OS testing to `skill-ci.yml`

## [0.3.0] - 2026-03-31

### Added
- `build-skill-keywords.js` — generates `skill-keywords.json` from registry and curated data
- `build-skill-catalog-schema.js` — generates JSON Schema for skill catalog
- `build-skill-registry-schema.js` — generates JSON Schema for skill registry
- `build-skill-keywords-schema.js` — generates JSON Schema for skill keywords
- Unit tests for all 4 new build scripts (39 tests)

### Fixed
- Separate release creation from asset upload in `deploy-dist.yml`

## [0.2.1] - 2026-03-30

### Added
- Incremental minimization via `.last-run` timestamp tracking in `minimize-helper.js`
- `stamp-run` command writes ISO 8601 timestamp after successful minimization
- `changed` command lists files modified since last run (mtime comparison)
- `/minimize-files` Step 1 now detects changed files and skips unchanged ones

## [0.2.0] - 2026-03-30

### Added
- Minimization pipeline: `minimize-config.json`, `minimize-helper.js`, `validate-minimization.js`
- AI-driven two-pass minimization in `/minimize-files` command (85% quality gate)
- `build-skill-packages.js` now sources from `.min-mirror/Skills/` when minimized versions exist
- `/add-skill` command for scaffolding new skill directories with validation
- `.claude/local-metadata/skill-requirements.json` — machine-readable skill requirements
- `.claude/local-metadata/` directory (repo-owned, px-manager upgrade-safe)
- MAINTENANCE.md auto-generation step in `/minimize-files` (Step 7)
- Selective metadata deployment — only skill-related files deployed to dist repo
- `/minimize-files` integrated as pre-phase-1 extension in `/prepare-release`
- `.gitattributes` for LF line ending normalization

### Changed
- `deploy-dist.yml` copies only skill metadata (catalog, registry, keywords + schemas) instead of all `*.json`
- `deploy-dist.yml` generates and copies `skill-registry.json` alongside catalog
- `/skill-validate` now consumes `skill-requirements.json` for field validation

### Fixed
- CRLF line ending handling in frontmatter parsers (`build-skill-registry.js`) and all test files
- Synced `command-spec-audit` SKILL.md with upstream `idpf-praxis-dev`

## [0.1.0] - 2026-03-30

### Added
- Transfer 38 skill source directories and packages from idpf-praxis-dev
- Build and validation scripts for skill registry and catalog
- `build-skill-packages.js` with CLI interface and module exports
- `build-skill-registry.js` for generating skill-registry.json from SKILL.md frontmatter
- `build-skill-catalog.js` for generating distribution catalog with download URLs
- `validate-skill-version.js` for rejecting invalid skill versions
- `generate-checksums.js` for SHA-256 file integrity manifests
- `.github/workflows/skill-ci.yml` — CI workflow with Jest tests, concurrency groups, paths-ignore, and dependency caching
- `.github/workflows/deploy-dist.yml` — Distribution deployment to rubrical-works/idpf-praxis-skills
- `.github/workflows/deploy-skill.yml` — Individual skill deployment via skill/*/v* tags
- `Skills/MAINTENANCE.md` with skill registry table and versioning policy
- Post-tag deployment verification in `/prepare-release` (Steps 4.9-4.11)
- Project charter and lifecycle structure

### Fixed
- Removed framework-level tests that depend on hub symlink modules (CI migration artifact)
- Fixed skill-versioning-e2e.test.js to generate registry if missing in CI
- Fixed test parallelism issue with --runInBand for e2e version mutation tests
