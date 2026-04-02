---
name: tdd-failure-recovery
description: Guide experienced developers through TDD failure scenarios and recovery procedures when tests behave unexpectedly
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-02"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, jest, vitest, pytest, go, rust, rspec, testing]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# TDD Failure Recovery
Guides experienced developers through diagnosing and recovering from unexpected test behaviors in the TDD cycle.
## When to Use
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
**Expected:** Test should FAIL | **Actual:** Test PASSES immediately
> "RED phase test passes unexpectedly: The test is invalid -- revise the test"
**Possible causes:**
1. **Feature already exists** - Code from previous iteration, similar feature implemented earlier
2. **Test is too permissive** - Assertion too broad, testing wrong thing, mock returns success by default
3. **Test setup incorrect** - Not exercising the code, bypassing implementation, testing test data
**Recovery Steps:**
1. **Verify test is executing** - Add intentional failure, confirm test can fail, remove it
2. **Check for existing implementation** - Search codebase; if found, delete impl OR write test for different behavior; re-run, verify fails
3. **Review test logic** - Is assertion correct? Calling actual implementation? Accurately represents requirement?
4. **Revise test** - Write corrected test, execute, verify it fails as expected
5. **Resume TDD cycle** - Proceed to GREEN phase
## Scenario 2: GREEN Phase Test Still Fails
**Expected:** Implementation should make test PASS | **Actual:** Test still FAILS
> "GREEN phase test fails: Implementation is incomplete -- revise the code"
**Possible causes:**
1. **Implementation incomplete** - Missing edge case, incorrect logic, wrong return value
2. **Implementation has bugs** - Syntax errors, logic errors, type mismatches
3. **Test expectations misunderstood** - Implemented wrong behavior, misread requirements
4. **Environmental issues** - Dependencies unavailable, database/file system issues, configuration problems
**Recovery Steps:**
1. **Read failure message carefully** - What does test expect? What did implementation provide? Specific mismatch?
2. **Verify implementation** - Executes without errors? Matches test requirements? Syntax/logic errors?
3. **Check test requirements** - Re-read assertions, understand exact expectations, verify test data/setup
4. **Revise implementation** - Write corrected implementation, verify it passes
5. **Run full test suite** - Ensure no regressions, all tests green
6. **Resume TDD cycle** - Proceed to REFACTOR phase
## Scenario 3: REFACTOR Phase Breaks Tests
**Expected:** Refactoring keeps all tests GREEN | **Actual:** Tests FAIL after refactoring
> "Refactoring breaks tests: Roll back refactoring; tests must stay green"
**Possible causes:**
1. **Behavioral change introduced** - Accidentally changed logic, different code path, side effects changed
2. **Breaking change in API** - Signature changed, return type modified, interface violated
3. **Incomplete refactoring** - Updated some call sites not others, partial extraction
4. **Test dependency on implementation** - Test coupled to specific implementation, test too brittle
**Recovery Steps:**
1. **IMMEDIATE ROLLBACK** - Undo refactoring, return to last green state, verify tests green
```
TESTS MUST STAY GREEN
If refactoring breaks tests -> ROLLBACK
Do not proceed with broken tests
```
2. **Analyze what broke** - Which test(s)? Failure message? What specific refactoring caused it?
3. **Decide next action:**
   - **Option A: Skip** - Too risky, defer to later
   - **Option B: Smaller refactoring** - Break into smaller steps, test after each micro-step
   - **Option C: Fix test (if brittle)** - Update test to test behavior not implementation, re-apply refactoring
4. **Resume TDD cycle**
## Scenario 4: Rollback to Previous State
**When to rollback:** Refactoring broke tests, implementation made things worse, went down wrong path, need known good state
**Procedure:**
1. Identify changes to undo
2. Restore previous code version (`git checkout` or undo edits)
3. Run full test suite
4. Verify all tests GREEN
**After rollback:** All tests green, code at last known good state, ready for different approach, user decides next step
## Scenario 5: Inconsistent Test Results
**Problem:** Tests pass sometimes, fail other times
**Possible causes:**
1. **Test order dependency** - Relies on another test running first, shared state, improper isolation
2. **Timing issues** - Race conditions, async not awaited, timeouts too short
3. **External dependencies** - Database state varies, file system changes, network unreliable
4. **Random data in tests** - Random values, non-deterministic behavior
**Recovery Steps:**
1. **Isolate the test** - Run alone, run in different order, identify if order-dependent
2. **Check test isolation** - Cleans up after itself? Sets up own data? Depends on external state?
3. **Fix test isolation** - Add proper setup/teardown, use fixtures, mock external dependencies
4. **Verify consistency** - Run test multiple times, run full suite multiple times
## Diagnostic Flowchart
```
Test failed unexpectedly
    |
What phase?
    |
+-----------+------------+-------------+
RED         GREEN        REFACTOR
|           |            |
Should      Should       Should
fail        pass         stay green
|           |            |
But         But          But
passes      fails        fails
|           |            |
Test        Impl.        ROLLBACK
invalid     incomplete   immediately
|           |            |
Revise      Revise       Try smaller
test        impl.        or skip
```
## Prevention Strategies
**RED phase:** Always run test and verify it fails. Never assume. Check failure message is correct.
**GREEN phase:** Run test and verify it passes. Run full suite for regressions. Don't skip verification.
**REFACTOR phase:** Run full suite after every change. Small steps, test after each. Rollback immediately if any test fails.
**Golden rule:**
```
Tests should ALWAYS be green except during RED phase
RED phase: Intentionally red (one test)
GREEN phase: Return to all green
REFACTOR phase: Stay all green
Between features: All green
If not green when expected -> STOP and recover
```
## Common Recovery Patterns
| Pattern | Situation | Action | Outcome |
|---------|-----------|--------|---------|
| The Reset | Confused state, unclear what's wrong | Rollback to last known green | Clean slate, try again |
| The Minimal Fix | Small issue, clear fix | Targeted correction | Tests green, proceed |
| The Skip | Risk > reward | Skip problematic change | Defer to later, maintain green |
| Divide and Conquer | Large change broke something | Break into smaller changes | Identify exactly what breaks |
## Resources
- `resources/failure-diagnostic-flowchart.md` - Visual decision tree
- `resources/recovery-procedures.md` - Step-by-step recovery for each scenario
- `resources/test-isolation-guide.md` - Ensuring test independence
## Relationship to Other Skills
**Supports all phases:** `tdd-red-phase`, `tdd-green-phase`, `tdd-refactor-phase`
**Related:** `test-writing-patterns` - Avoiding test-related failures
## Expected Outcome
- Tests returned to expected state (all green)
- Understanding of what went wrong
- Correction applied or change reverted
- Ready to resume TDD cycle
