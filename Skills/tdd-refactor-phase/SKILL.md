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
Guide experienced developers through the REFACTOR phase of TDD: improving code quality, structure, and clarity while ensuring all tests remain green.
## When to Use
- GREEN phase complete with passing test
- Proceeding autonomously from GREEN phase
- Code works but could be improved
- Evaluating refactoring opportunities
## Prerequisites
- Completed GREEN phase with all tests passing
- Working implementation that satisfies test requirements
- Full test suite available to verify refactoring safety
## REFACTOR Phase Objectives
1. **Improve code quality** - Make code cleaner, more maintainable, better structured
2. **Keep tests green** - Ensure all improvements maintain existing functionality
**Refactoring IS:**
- Improving code structure without changing behavior
- Making code more readable and maintainable
- Eliminating duplication, simplifying complex logic, improving naming
**Refactoring IS NOT:**
- Adding new features or changing tested behavior
- Fixing bugs (that's a new test + implementation)
- Performance optimization without measurement
- Breaking tests to "improve" code
## REFACTOR Phase Workflow
### Step 1: Analyze Refactoring Opportunities
Identify: code duplication, long/complex functions, unclear names, missing abstractions, SOLID/DRY violations, complex conditionals, magic numbers/strings.
### Step 2: Evaluate Refactoring Suggestions
**Refactor Now:** Clear improvement, low risk/high value, directly improves code, won't over-engineer
**Skip Refactoring:** Premature abstraction, risk > reward, better addressed later, code already clear
### Step 3: Apply Refactoring (if approved)
1. Apply the refactored code
2. Run full test suite
3. Verify ALL tests still pass
### Step 4: Verify Tests Remain Green
- Run FULL test suite (not just recent test)
- ALL tests must pass, no failures or errors
**If any test fails:** Rollback immediately, keep tests green, try smaller refactoring
### Step 5: Complete REFACTOR Phase
- **If refactoring applied and tests green:** Proceed to next behavior or complete story
- **If refactoring skipped:** Proceed to next behavior or complete story
- TDD cycle continues autonomously until story implementation is complete
## Best Practices
### Refactor in Small Steps
```
1. Extract one variable -> Run tests
2. Rename one function -> Run tests
3. Extract one function -> Run tests
Each step verified independently
```
### One Refactoring at a Time
Focus on one improvement, run tests, then next refactoring.
### Keep Tests Green
```
Tests must ALWAYS be green after refactoring.
If refactoring breaks tests -> Rollback immediately -> Try smaller refactoring
```
### Refactor for Clarity, Not Cleverness
- Makes code easier to understand, reduces cognitive load
- Avoid clever one-liners, over-abstraction, premature design patterns
## Common Refactorings
1. **Extract Variable** - Name embedded calculations for clarity
2. **Extract Function** - Split long functions into focused, reusable parts
3. **Rename for Clarity** - Replace unclear/abbreviated names with intent-expressing names
4. **Eliminate Duplication** - Extract duplicated code to single source of truth
5. **Simplify Conditionals** - Guard clauses, early returns, extracted boolean expressions
## When to Skip Refactoring
1. **Premature Abstraction** - Only one use; wait for Rule of Three
2. **Code Already Clear** - Minor naming changes that don't add clarity
3. **High Risk, Low Value** - Touches many files, complex change for minor improvement
4. **Over-Engineering** - Adds patterns prematurely, "might need this later"
## Anti-Patterns
- **Refactoring without tests** - Always run tests and verify green after changes
- **Accepting broken tests** - Rollback immediately if tests fail
- **Big bang refactoring** - Small incremental changes, test after each
- **Refactoring + features** - Never combine; refactor OR add feature, not both
## Integration with IDPF-Agile
REFACTOR phase follows GREEN in story implementation. When `/work` triggers TDD:
1. GREEN phase verified -- tests passing
2. Analyze code for refactoring opportunities
3. Either apply refactoring or skip with reason
4. Run tests, verify green
5. Proceed to next behavior or complete story
The TDD cycle runs autonomously. The only user checkpoint is at story completion (In Review -> Done).
## Rollback Procedures
**If refactoring breaks tests:**
1. Rollback changes (git checkout or undo)
2. Verify tests return to green
3. Options: try smaller refactoring, skip, or investigate
**Rollback is immediate** -- maintain green tests throughout the TDD cycle.
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
## Resources
- `resources/refactor-checklist.md` - Quick reference checklist
- `resources/common-refactorings.md` - Catalog of common refactoring patterns
- `resources/when-to-skip-refactoring.md` - Decision guide for skipping refactoring
## Relationship to Other Skills
**Flows from:** `tdd-green-phase`
**Flows to:** `tdd-red-phase` - Next feature starts new RED phase
**Related:** `tdd-failure-recovery`
## Expected Outcome
- Code quality improved (if refactored) OR intentionally left as-is (if skipped)
- All tests remain green, no behavioral changes
- Ready to start next feature with RED phase
- Autonomous progression to next behavior or story completion
