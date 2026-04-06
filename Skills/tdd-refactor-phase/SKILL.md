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

Guides REFACTOR phase: improve code quality, structure, clarity while keeping tests green.

## When to Use
- GREEN phase complete with passing test
- Proceeding autonomously from GREEN
- Code works but could be improved
- Evaluating refactoring opportunities

## Prerequisites
- GREEN phase complete, all tests passing
- Working implementation satisfying tests
- Full test suite available
- Claude Code available

## Objectives
1. **Improve code quality** - cleaner, more maintainable, better structured
2. **Keep tests green** - improvements maintain existing functionality

### Refactoring IS
- Improving structure without changing behavior
- Making code readable/maintainable
- Eliminating duplication
- Simplifying complex logic
- Improving naming/organization

### Refactoring IS NOT
- Adding new features
- Changing tested behavior
- Fixing bugs (new test + impl)
- Performance opt without measurement
- Breaking tests to "improve" code

## Workflow

### Step 1: Analyze Opportunities
Identify: duplication, long/complex functions, unclear names, missing abstractions, SOLID/DRY violations, complex conditionals, magic numbers/strings.

### Step 2: Evaluate Suggestions
**Refactor Now:** clear improvement, low risk/high value, improves this iteration, won't over-engineer.
**Skip:** premature abstraction, risk > reward, better in future iteration, already clear enough.
Either: **A** apply, or **B** skip with reason.

### Step 3: Apply (if approved)
1. Apply refactored code
2. Run full test suite
3. Verify ALL tests pass

### Step 4: Verify Green
- Run FULL test suite (not just recent test)
- ALL tests must pass; no failures or errors

**If any test fails:** rollback immediately → keep tests green → optionally try smaller refactoring.

### Step 5: Complete
**Applied + green:** REFACTOR complete, proceed to next behavior or complete story.
**Skipped:** REFACTOR complete (no changes), proceed.

TDD cycle continues autonomously until story complete. Only checkpoint is story completion (In Review → Done).

## Best Practices

### 1: Small Steps
```
1. Extract one variable → Run tests
2. Rename one function → Run tests
3. Extract one function → Run tests
```
Each step verified independently. Not: extract+rename+restructure all at once.

### 2: One Refactoring at a Time
Eliminate one duplication, improve one name, extract one function, simplify one conditional. Then test. Then next.

### 3: Keep Tests Green
```
Tests must ALWAYS be green after refactoring.
If broken: rollback immediately, try smaller refactoring.
```

### 4: Clarity Not Cleverness
Good: easier to understand, clearer intent, less cognitive load, more maintainable.
Poor: clever one-liners, over-abstraction, premature patterns, language showoffs.

## Common Refactorings

### Extract Variable
Before: expression embedded, unclear meaning. After: well-named variable, clear intent.

### Extract Function
Before: long function doing multiple things. After: extracted, one clear thing, reusable/testable.

### Rename for Clarity
Before: unclear/abbreviated names. After: self-documenting, clear intent.

### Eliminate Duplication
Before: same code in multiple places. After: extracted to function, single source of truth.

### Simplify Conditional Logic
Before: nested conditions, complex booleans. After: guard clauses, early returns, extracted named booleans.

## When to Skip

### Premature Abstraction
Only one use, future unclear, abstraction more complex than original → wait for Rule of Three.

### Already Clear
Minor naming changes, current names descriptive, no added clarity → don't refactor for its own sake.

### High Risk, Low Value
Touches many files, complex change for minor improvement → defer to dedicated session.

### Over-Engineering
Premature patterns, abstraction for single use, "might need later" → keep simple, wait for need.

## Anti-Patterns

### 1: Refactoring Without Tests
```
✗ Make changes → Hope nothing broke
✓ Make changes → Run tests → Verify green → Proceed
```

### 2: Accepting Broken Tests
```
✗ Refactor → Tests fail → "fix later"
✓ Refactor → Tests fail → ROLLBACK → Green again
```

### 3: Big Bang Refactoring
```
✗ Change everything; tests fail; unclear cause
✓ Small incremental; test each; identify breakage
```

### 4: Refactoring + Features
```
✗ Refactor + add feature simultaneously
✓ Refactor (green) OR add feature (new test) — never both
```

## Integration with IDPF-Agile
REFACTOR follows GREEN. When `/work` triggers TDD:
1. GREEN verified — tests passing
2. Analyze for opportunities
3. Apply or skip with reason
4. Run tests, verify green
5. Proceed to next behavior or complete story

Autonomous cycle. Only user checkpoint: story completion (In Review → Done).

## Rollback Procedures
If refactoring breaks tests:
1. Rollback (git checkout or undo)
2. Verify tests return to green
3. Options: smaller refactoring, skip for now, investigate cause

Rollback is immediate — maintain green throughout TDD cycle.

## Checklist
- [ ] Code analyzed for opportunities
- [ ] Suggestions evaluated
- [ ] If applied:
  - [ ] Refactored code clear/improved
  - [ ] All tests run and PASS
  - [ ] No failures/errors
  - [ ] Behavior unchanged
- [ ] If skipped:
  - [ ] Valid reason
  - [ ] Tests still green

## Resources
See `resources/`:
- `refactor-checklist.md`
- `common-refactorings.md`
- `when-to-skip-refactoring.md`

## Relationship to Other Skills
**Flows from:** `tdd-green-phase`
**Flows to:** `tdd-red-phase`
**Related:**
- `tdd-failure-recovery` - handle broken tests during refactoring
- `tdd-refactor-coverage-audit` - Optional companion. Mechanically audits newly added source files for paired tests using JSON-driven language conventions. Advisory only — never blocks the refactor gate. If installed, invoke as:
  ```bash
  node .claude/skills/tdd-refactor-coverage-audit/scripts/test-coverage-audit.js --since-commit <last-cycle-sha>
  ```
  No code coupling — referenced by name only. See that skill's `SKILL.md` for output format, language conventions, and project overrides.

## Expected Outcome
- Code quality improved (or intentionally left as-is)
- All tests remain green
- No behavioral changes
- Ready for next RED phase
- Autonomous progression to next behavior or story completion
