---
name: tdd-failure-recovery
description: Guide experienced developers through TDD failure scenarios and recovery procedures when tests behave unexpectedly
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, jest, vitest, pytest, go, rust, rspec, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD Failure Recovery
Guides experienced developers through diagnosing and recovering from unexpected test behaviors in the TDD cycle.
## When to Use This Skill
- RED phase test passes unexpectedly (should fail)
- GREEN phase test still fails (should pass)
- REFACTOR phase breaks tests (should stay green)
- Tests behave unpredictably or inconsistently
- Need to rollback to previous working state
- Need diagnostic guidance for test failures
## Prerequisites
- Understanding of expected TDD cycle behavior
- Knowledge of current TDD phase (RED/GREEN/REFACTOR)
- Test execution capability via Claude Code
- Version control or ability to undo changes
## Scenario 1: RED Phase Test Passes Unexpectedly
**Expected:** Test should FAIL (feature not implemented)
**Actual:** Test PASSES immediately
> "RED phase test passes unexpectedly: The test is invalid — revise the test"
**Possible causes:**
1. **Feature already exists** — code from previous iteration, similar feature implemented earlier
2. **Test too permissive** — assertion too broad, testing wrong thing, mock returns success by default
3. **Test setup incorrect** — not exercising actual code, bypassing implementation
**Recovery:**
1. Add intentional failure to verify test can fail; remove it
2. Search codebase for existing implementation; if found, delete or write test for different behavior
3. Review assertion correctness and that test calls actual implementation
4. Write corrected test, verify it fails
5. Proceed to GREEN phase
## Scenario 2: GREEN Phase Test Still Fails
**Expected:** Implementation should make test PASS
**Actual:** Test still FAILS
> "GREEN phase test fails: Implementation is incomplete — revise the code"
**Possible causes:**
1. **Implementation incomplete** — missing edge case, incorrect logic, wrong return value
2. **Implementation has bugs** — syntax errors, logic errors, type mismatches
3. **Test expectations misunderstood** — implemented wrong behavior
4. **Environmental issues** — dependencies, database, configuration
**Recovery:**
1. Read failure message: what does test expect vs what implementation provides?
2. Verify code executes without errors and matches test requirements
3. Re-read test assertions and understand exact expectations
4. Write corrected implementation, verify it passes
5. Run full test suite — ensure no regressions
6. Proceed to REFACTOR phase
## Scenario 3: REFACTOR Phase Breaks Tests
**Expected:** Refactoring keeps all tests GREEN
**Actual:** Tests FAIL after refactoring
> "Refactoring breaks tests: Roll back refactoring; tests must stay green"
**Possible causes:**
1. **Behavioral change** — refactoring accidentally changed logic
2. **Breaking API change** — signature/return type modified
3. **Incomplete refactoring** — updated some call sites, missed others
4. **Test coupled to implementation** — test relies on specific implementation details
**Recovery:**
1. **IMMEDIATE ROLLBACK** — undo changes, return to last green state, verify tests green
```
TESTS MUST STAY GREEN
If refactoring breaks tests → ROLLBACK
Do not proceed with broken tests
```
2. Analyze: which test(s) failed? What specific refactoring caused it?
3. Choose next action:
   - **Skip refactoring** — too risky, defer to later
   - **Smaller refactoring** — break into micro-steps, test after each
   - **Fix brittle test** — update test to test behavior not implementation, re-apply refactoring
4. Proceed to next behavior or complete story
## Scenario 4: Rollback to Previous State
**When to rollback:** Refactoring broke tests, implementation made things worse, went down wrong path.
**Procedure:**
1. Identify changes to undo
2. Restore previous code version (`git checkout` or undo edits)
3. Run full test suite
4. Verify all tests GREEN
5. User decides next step (retry or skip)
## Scenario 5: Inconsistent Test Results
**Problem:** Tests pass sometimes, fail other times
**Possible causes:**
1. **Test order dependency** — shared state between tests, improper isolation
2. **Timing issues** — race conditions, async not awaited, short timeouts
3. **External dependencies** — database state varies, file system, network
4. **Random data** — non-deterministic test values
**Recovery:**
1. Run failing test alone and in different order — identify if order-dependent
2. Check test isolation — does test clean up and set up its own data?
3. Add proper setup/teardown, use fixtures, mock external dependencies
4. Run test and full suite multiple times to confirm consistency
## Diagnostic Flowchart
```
Test failed unexpectedly
    ↓
What phase?
    ↓
┌───────────┬────────────┬─────────────┐
RED         GREEN        REFACTOR
↓           ↓            ↓
Should      Should       Should
fail        pass         stay green
↓           ↓            ↓
But         But          But
passes      fails        fails
↓           ↓            ↓
Test        Impl.        ROLLBACK
invalid     incomplete   immediately
↓           ↓            ↓
Revise      Revise       Try smaller
test        impl.        or skip
```
## Prevention Strategies
**RED phase:** Always run test and verify it fails; check failure message is correct
**GREEN phase:** Run test and verify pass; run full suite for regressions
**REFACTOR phase:** Run full suite after every change; small steps; rollback immediately on failure
**Golden rule:**
```
Tests should ALWAYS be green except during RED phase
RED phase: Intentionally red (one test)
GREEN phase: Return to all green
REFACTOR phase: Stay all green
Between features: All green
If not green when expected → STOP and recover
```
## Common Recovery Patterns
| Pattern | Situation | Action |
|---------|-----------|--------|
| Reset | Confused state, unclear what's wrong | Rollback to last known green |
| Minimal Fix | Small issue, clear fix | Targeted correction |
| Skip | Risk > reward | Defer change, maintain green |
| Divide and Conquer | Large change broke something | Break into smaller incremental changes |
## Relationship to Other Skills
- `tdd-red-phase` — RED phase failures
- `tdd-green-phase` — GREEN phase failures
- `tdd-refactor-phase` — REFACTOR phase failures
- `test-writing-patterns` — Avoiding test-related failures
