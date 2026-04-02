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
Guides experienced developers through the REFACTOR phase: improving code quality, structure, and clarity while ensuring all tests remain green.
## When to Use This Skill
- GREEN phase complete with passing test
- Proceeding autonomously from GREEN phase
- Code works but could be improved
- Evaluating refactoring opportunities
## Prerequisites
- Completed GREEN phase with all tests passing
- Working implementation that satisfies test requirements
- Full test suite available to verify refactoring safety
## REFACTOR Phase Objectives
1. **Improve code quality** — cleaner, more maintainable, better structured
2. **Keep tests green** — all improvements maintain existing functionality
**Refactoring IS:** Improving structure without changing behavior, improving readability, eliminating duplication, simplifying logic, improving naming
**Refactoring IS NOT:** Adding features, changing behavior, fixing bugs, performance optimization without measurement, breaking tests
## Workflow
### Step 1: Analyze Refactoring Opportunities
Identify: code duplication, long/complex functions, unclear names, missing abstractions, SOLID/DRY violations, complex conditionals, magic numbers/strings.
### Step 2: Evaluate Suggestions
- **Refactor Now:** Clear improvement, low risk/high value, directly improves current code
- **Skip:** Premature abstraction, risk > reward, better addressed later, already clear enough
### Step 3: Apply Refactoring (if worthwhile)
1. Apply the refactored code
2. Run full test suite
3. Verify ALL tests still pass
### Step 4: Verify Tests Remain Green
Run FULL test suite. ALL tests must pass. No failures or errors.
**If any test fails** → rollback immediately → keep tests green → try smaller refactoring
### Step 5: Complete Phase
- **Refactoring applied + tests green** → proceed to next behavior or complete story
- **Refactoring skipped** → proceed to next behavior or complete story
TDD cycle continues autonomously until story completion (In Review → Done).
## Best Practices
### Refactor in Small Steps
```
1. Extract one variable → Run tests
2. Rename one function → Run tests
3. Extract one function → Run tests
Each step verified independently
```
### One Refactoring at a Time
Focus on one improvement, run tests, then next refactoring.
### Keep Tests Green
```
Tests must ALWAYS be green after refactoring.
If refactoring breaks tests → Rollback immediately
```
### Refactor for Clarity, Not Cleverness
Good: easier to understand, clearer intent, reduced cognitive load
Poor: clever one-liners obscuring intent, over-abstracted solutions, premature patterns
## Common Refactorings
| Refactoring | Before | After |
|-------------|--------|-------|
| Extract Variable | Expression embedded in code | Well-named variable with clear intent |
| Extract Function | Long function doing multiple things | Well-named single-purpose function |
| Rename for Clarity | Unclear/abbreviated names | Names that express intent |
| Eliminate Duplication | Same code in multiple places | Extracted to single function |
| Simplify Conditional | Nested conditions | Guard clauses, early returns, named booleans |
## When to Skip Refactoring
| Scenario | Indicators | Decision |
|----------|-----------|----------|
| Premature Abstraction | Only one use, future needs unclear | Wait for Rule of Three |
| Code Already Clear | Minor naming changes, already descriptive | Don't refactor for its own sake |
| High Risk, Low Value | Touches many files, complex change | Defer to future session |
| Over-Engineering | Premature patterns, single use case | Keep it simple |
## Anti-Patterns
1. **Without Tests** — make changes → run tests → verify green (never hope)
2. **Accepting Broken Tests** — tests fail → ROLLBACK (never "fix tests later")
3. **Big Bang** — small incremental changes, test after each (never everything at once)
4. **Refactoring + Features** — never both at same time; refactor OR add feature
## Rollback Procedures
If refactoring breaks tests:
1. **Immediate:** Rollback changes (git checkout or undo)
2. **Verify:** Tests return to green
3. **Options:** Try smaller refactoring, skip for now, investigate why tests broke
## REFACTOR Phase Checklist
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
## Relationship to Other Skills
- **Flows from:** `tdd-green-phase`
- **Flows to:** `tdd-red-phase` (next feature)
- **Related:** `tdd-failure-recovery`
