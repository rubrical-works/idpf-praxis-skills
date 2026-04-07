# TDD Failure Recovery Procedures
**Version:** v0.11.1
## Test Pollution Recovery
**Symptom:** Tests pass in isolation but fail when run together
1. **Identify the polluting test** - Run failing test alone (passes), run full suite (fails), binary search: run half the tests with failing test
2. **Find shared state** - Global variables modified, class-level attributes changed, database records not cleaned up, file system artifacts
3. **Fix isolation**
   ```
   Option A: Add cleanup in polluting test
   Option B: Add setup in affected test
   Option C: Use fresh fixtures for each test
   ```
4. **Verify fix** - Run full suite multiple times, run in different orders, confirm consistent results
## Fixture Failure Recovery
**Symptom:** Test setup or teardown fails
1. **Read fixture error message** - Which fixture? Setup or teardown? What resource missing?
2. **Check fixture dependencies** - Database connection? Required files? External services?
3. **Fix fixture**
   ```
   Database: Ensure test DB exists and is accessible
   Files: Create required test files/directories
   Services: Mock external dependencies
   ```
4. **Add fixture resilience** - Use try/finally for cleanup, check preconditions in setup, clear error messages
5. **Verify fix** - Run affected tests, run full suite, confirm consistency
## Assertion Failure Recovery
**Symptom:** Test assertion fails with unexpected value
1. **Read assertion message carefully**
   ```
   Expected: [what test expects]
   Actual:   [what code returned]
   ```
2. **Determine root cause**
   | Situation | Likely Cause |
   |-----------|--------------|
   | Expected correct, actual wrong | Implementation bug |
   | Expected wrong, actual correct | Test needs updating |
   | Both seem wrong | Requirements misunderstood |
3. **Fix based on cause**
   ```
   Implementation bug -> Fix the code
   Test outdated -> Update test expectations
   Requirements unclear -> Clarify and adjust both
   ```
4. **Verify fix** - Run the specific test, related tests, full suite for regressions
## Timeout Failure Recovery
**Symptom:** Test fails due to timeout/slow execution
1. **Identify timeout type** - Framework, network, database, or async timeout
2. **Diagnose cause** - Infinite loop (check conditions), slow query (check indexes), network (check connectivity/mock), deadlock (check locking)
3. **Fix timeout** - Fix slow code, mock slow dependencies, increase timeout only as last resort
4. **Verify** - Run test, ensure reasonable time
## Flaky Test Recovery
**Symptom:** Test passes sometimes, fails randomly
1. **Confirm flakiness** - Run test 10+ times
2. **Identify source** - Fails after specific test (pollution), random timing (race condition), works locally fails CI (environment)
3. **Fix flakiness** - Pollution: add isolation; Race condition: add synchronization; Environment: mock external factors
## Quick Recovery Checklist
- [ ] Read full error message
- [ ] Check if test passes in isolation
- [ ] Review recent changes
- [ ] Apply recovery procedure above
- [ ] Run full suite before proceeding
