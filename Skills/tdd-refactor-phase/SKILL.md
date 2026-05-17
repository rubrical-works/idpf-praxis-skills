---
name: tdd-refactor-phase
description: Guide experienced developers through REFACTOR phase of TDD cycle - improving code quality while maintaining green tests
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD REFACTOR Phase
Guides experienced developers through REFACTOR phase of Test-Driven Development cycle: improving code quality, structure, and clarity while ensuring all tests remain green.
## When to Use This Skill
Invoke when:
- GREEN phase complete with passing test
- Proceeding autonomously from GREEN phase
- Code works but could be improved
- Evaluating refactoring opportunities
## Prerequisites
- Completed GREEN phase with all tests passing
- Working implementation that satisfies test requirements
- Full test suite available to verify refactoring safety
- Claude Code available for analysis and execution
## REFACTOR Phase Objectives
Dual goals:
1. **Improve code quality** - Make code cleaner, more maintainable, better structured
2. **Keep tests green** - Ensure all improvements maintain existing functionality
### What "Refactoring" Means
**✓ Refactoring IS:**
- Improving code structure without changing behavior
- Making code more readable and maintainable
- Eliminating duplication
- Simplifying complex logic
- Improving naming and organization
**✗ Refactoring IS NOT:**
- Adding new features
- Changing tested behavior
- Fixing bugs (that's a new test + implementation)
- Performance optimization without measurement
- Breaking tests to "improve" code
## REFACTOR Phase Workflow
**Step 1: Analyze Refactoring Opportunities** — Identify: code duplication; long/complex functions; unclear variable/function names; missing abstractions; SOLID/DRY violations; complex conditional logic; magic numbers/strings.
**Step 2: Evaluate Refactoring Suggestions** — Decision: Refactor Now (clear improvement, low risk, high value, this iteration, won't over-engineer). Decision: Skip (premature abstraction; risk > reward; better in future iteration; code already clear enough). Either Option A: Apply, or Option B: Skip (with reason).
**Step 3: Apply Refactoring (if approved)** — Apply refactored code; run full test suite; verify ALL tests still pass.
**Step 4: Verify Tests Remain Green** — Run FULL test suite (not just recent test); ALL tests must pass; no failures, no errors. If any test fails → refactoring broke something → rollback immediately → keep tests green → option: try smaller refactoring.
**Step 5: Complete REFACTOR Phase** — If applied and tests green: REFACTOR complete; code improved and safe; proceed to next behavior or complete story. If skipped: REFACTOR complete (no changes); proceed to next behavior or complete story.
**TDD cycle continues autonomously** until story complete. Only workflow checkpoint is story completion (In Review → Done).
## REFACTOR Phase Best Practices
**Practice 1: Refactor in Small Steps** — Good: extract one variable → run tests; rename one function → run tests; extract one function → run tests; each step verified independently. Poor: extract variables + rename + restructure all at once, multiple failures, unclear which change broke what.
**Practice 2: One Refactoring at a Time** — Focus on one improvement: eliminate duplication (one instance); improve naming (one variable/function); extract function (one extraction); simplify conditional (one condition). Then run tests. Then next refactoring.
**Practice 3: Keep Tests Green** — Tests must ALWAYS be green after refactoring. If refactoring breaks tests: rollback immediately; tests must stay green; try smaller refactoring.
**Practice 4: Refactor for Clarity, Not Cleverness** — Good: makes code easier to understand; makes intent clearer; reduces cognitive load; improves maintainability. Poor: clever one-liners that obscure intent; over-abstracted "elegant" solutions; premature design patterns; showing off language features.
## Common Refactorings
**1: Extract Variable** — Before: embedded calculation/expression, hard to understand. After: value assigned to well-named variable; intent clear.
**2: Extract Function** — Before: long function doing multiple things. After: logic extracted to well-named function; does one thing; reusable, testable.
**3: Rename for Clarity** — Before: unclear names, abbreviations. After: names express intent; self-documenting.
**4: Eliminate Duplication** — Before: same code in multiple places; changes must sync. After: extracted to function; single source of truth.
**5: Simplify Conditional Logic** — Before: nested conditions; complex booleans. After: guard clauses; early returns; extracted booleans with clear names.
## When to Skip Refactoring
**Skip 1: Premature Abstraction** — Indicators: only one use; future needs unclear; abstraction more complex than original. Skip: wait for 2nd/3rd occurrence; Rule of Three.
**Skip 2: Code Already Clear** — Indicators: minor naming suggestions; current names already descriptive; change doesn't add clarity. Skip: good enough; don't refactor for sake of it.
**Skip 3: High Risk, Low Value** — Indicators: touches many files; complex change for minor improvement; could introduce bugs. Skip/Defer: not worth risk; consider dedicated session.
**Skip 4: Over-Engineering** — Indicators: premature design patterns; abstraction for single use case; "might need this later". Skip: keep simple; wait for actual need.
## REFACTOR Phase Anti-Patterns
**Anti-Pattern 1: Refactoring Without Tests** — ✗ Make changes → hope nothing broke. ✓ Make changes → run tests → verify green → proceed.
**Anti-Pattern 2: Accepting Broken Tests** — ✗ Refactor → tests fail → "I'll fix later". ✓ Refactor → tests fail → ROLLBACK → tests green again.
**Anti-Pattern 3: Big Bang Refactoring** — ✗ Change everything at once, tests fail, don't know which change broke what. ✓ Small incremental changes; test after each; identify exactly what breaks when.
**Anti-Pattern 4: Refactoring + Features** — ✗ Refactor + add feature simultaneously. ✓ Refactor (tests stay green) OR add feature (new test); never both at same time.
## Integration with IDPF-Agile
REFACTOR phase follows GREEN in story implementation. When `/work` triggers TDD:
1. GREEN phase verified — tests passing
2. Analyze code for refactoring opportunities
3. Either apply refactoring or skip with reason
4. Run tests, verify green
5. Proceed to next behavior or complete story
TDD cycle runs autonomously. Only user checkpoint is at story completion (In Review → Done).
## Rollback Procedures
**If refactoring breaks tests:**
1. **Immediate action:** Rollback changes (git checkout or undo)
2. **Verify:** Tests return to green
3. **Options:** Try smaller refactoring; skip refactoring for now; investigate why tests broke
**Rollback is immediate** — revert broken changes and maintain green tests throughout TDD cycle.
## REFACTOR Phase Checklist
Before proceeding to next feature, verify:
- [ ] Code analyzed for refactoring opportunities
- [ ] Suggestions evaluated
- [ ] If refactoring applied:
  - [ ] Refactored code is clear and improved
  - [ ] All tests run and PASS (green)
  - [ ] No test failures or errors
  - [ ] Behavior unchanged
- [ ] If refactoring skipped:
  - [ ] Valid reason for skipping
  - [ ] Tests still green
## Resources
See `resources/` for:
- `refactor-checklist.md` - Quick reference checklist
- `common-refactorings.md` - Catalog of common refactoring patterns
- `when-to-skip-refactoring.md` - Decision guide for skipping refactoring
## Relationship to Other Skills
**Flows from:** `tdd-green-phase` - Previous phase with passing tests
**Flows to:** `tdd-red-phase` - Next feature starts new RED phase
**Related skills:**
- `tdd-failure-recovery` - Handle broken tests during refactoring
- `tdd-refactor-coverage-audit` - Optional companion. Mechanically audits newly added source files for paired tests using JSON-driven language conventions. Advisory only — never blocks the refactor gate. Applies the No-Runtime Fallback Pattern (Pattern 4): preflight detects Node, runs the script when available, falls back to Claude-inline execution of the same pairing procedure when not. If installed, invoke as:
  ```bash
  # Primary path (Node available):
  node .claude/skills/tdd-refactor-coverage-audit/scripts/test-coverage-audit.js --since-commit <last-cycle-sha>
  # Fallback path (no Node): follow the "Fallback Procedure" section in
  # that skill's SKILL.md — Claude reads convention JSON + runs git diff + applies pairing rules inline.
  ```
  No code coupling — referenced by name only. See that skill's `SKILL.md` for preflight contract, output format, language conventions, project overrides, inline fallback procedure.
## Expected Outcome
After successful REFACTOR phase: code quality improved (if refactored) OR intentionally left as-is (if skipped); all tests remain green; no behavioral changes; ready to start next feature with RED phase; autonomous progression to next behavior or story completion.
---
**End of TDD REFACTOR Phase Skill**
