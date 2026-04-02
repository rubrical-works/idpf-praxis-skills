---
name: tdd-green-phase
description: Guide experienced developers through GREEN phase of TDD cycle - writing minimal implementation to pass failing tests
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
# TDD GREEN Phase
Guides experienced developers through the GREEN phase of TDD: implementing the minimum code necessary to make a failing test pass.
## When to Use
- RED phase test has been verified as failing
- Proceeding autonomously from RED phase
- Implementing feature to pass test
- Moving from RED to GREEN in TDD cycle
## Prerequisites
- Completed RED phase with verified failing test
- Clear understanding of what test expects
- Implementation environment ready
- Claude Code available for code execution and testing
## GREEN Phase Objectives
**Write the minimum code to make the test pass.**
**Correct approach:**
- Implements exactly what test requires
- No additional features beyond test scope
- Simplest solution that makes test green
- Avoids premature optimization
**Incorrect approach:**
- Implements features not tested
- Over-engineers solution
- Adds "might need later" functionality
- Optimizes before necessary
## GREEN Phase Workflow
### Step 1: Understand Test Requirements
Review the failing test to identify:
- What behavior is expected?
- What inputs does test provide?
- What output/result does test expect?
- What edge cases does this test cover?
**Key principle:** Test defines the contract. Implementation must fulfill contract, nothing more.
### Step 2: Plan Minimal Implementation
**Identify:** Minimum logic needed, required data structures, necessary dependencies, expected return values/side effects
**Avoid planning:** Features not in test, abstractions not yet needed, optimizations not required, error handling not tested
### Step 3: Implement to Pass Test
1. Locate or create the implementation file
2. Write the minimum code to make the test pass
3. Execute the test and verify it passes
### Step 4: Execute and Verify Success
**Verification checklist:**
- [ ] Test executed without errors
- [ ] Test passed (green)
- [ ] No other tests broke (if running full suite)
- [ ] Implementation is minimal and clear
### Step 5: Analyze Success
- **Test passes:** GREEN phase complete, proceed autonomously to REFACTOR phase
- **Test still fails:** Implementation incomplete/incorrect, revise and repeat Step 3
- **Test passes but other tests fail:** Regression introduced, revise to fix, re-run all tests
## Best Practices
### YAGNI (You Aren't Gonna Need It)
**Good (minimal):** Implements exactly what test requires. Hard-coded values acceptable if test passes. Simple conditional logic. Direct implementation.
**Poor (over-engineered):** Implements untested features "just in case". Complex abstractions for single use case. Premature optimization.
### Simplest Thing That Works
```
Test: Function should return sum of two numbers
WRONG: Generic calculation engine, configuration system, plugin architecture
RIGHT: Function takes two parameters, returns their sum. Done.
```
### Let Tests Drive Design
```
Test says: get_user(id) should return user object
Implementation: Function with that exact signature. No more, no less.
```
### Hard-Code First, Generalize Later
```
Test expects specific output? -> Return that specific output (hard-coded)
Test expects list with one item? -> Return list with that one item
Test checks single condition? -> Implement that condition only
-> Generalize when future tests require it
```
## Common Mistakes
1. **Over-Implementation** - Adding features not required by test. Implement ONLY what test requires.
2. **Premature Abstraction** - Creating abstractions before needed. Rule of Three: abstract after third duplication.
3. **Ignoring Test Failure Details** - Read failure message carefully, understand exact expectation.
4. **Breaking Existing Tests** - Run full test suite, ensure all tests remain green.
## Anti-Patterns
| Anti-Pattern | Wrong | Correct |
|-------------|-------|---------|
| Feature Creep | Test: User can log in -> Login + password reset + 2FA + OAuth | Basic login functionality only |
| Optimization Before Profiling | Test: Function returns result -> Cached, memoized, async, optimized | Straightforward synchronous function |
| Copy-Paste Without Understanding | Test fails -> Copy random code -> Test passes | Understand requirement -> Implement minimal solution |
## Implementation Strategies
### Strategy 1: Fake It (Temporarily)
```
Test expects result: 5
Implementation: return 5
Next test expects different result -> Now implement real logic
```
### Strategy 2: Obvious Implementation
```
Test: Add two numbers
Implementation: return a + b
```
### Strategy 3: Triangulation
```
Test 1: add(2, 3) == 5 -> return 5
Test 2: add(1, 4) == 5 -> Still works with return 5
Test 3: add(2, 2) == 4 -> Now fails! Must implement: return a + b
```
## Integration with IDPF-Agile
GREEN phase follows RED in story implementation. When `/work` triggers TDD:
1. RED phase verified -- test is failing
2. Implement minimal code to pass test
3. Run test and verify pass
4. Proceed to REFACTOR phase
The TDD cycle runs autonomously. The only user checkpoint is at story completion (In Review -> Done).
## Full Test Suite Execution
- **During GREEN phase:** Run specific test being fixed, verify it turns green
- **Before completing GREEN phase:** Run full test suite, ensure no regressions
- **When to run full suite:** After implementation complete, before committing, before REFACTOR phase
## GREEN Phase Checklist
- [ ] Implementation code is complete and correct
- [ ] Target test now PASSES (green)
- [ ] Implementation is minimal (no over-engineering)
- [ ] No existing tests broke (full suite green)
- [ ] Code is understandable and clear
- [ ] Implementation matches test requirements exactly
- [ ] No untested features added
## Resources
- `resources/green-phase-checklist.md` - Quick reference checklist
- `resources/minimal-implementation-guide.md` - How to identify minimum code
- `resources/triangulation-examples.md` - When and how to use triangulation
## Relationship to Other Skills
**Flows from:** `tdd-red-phase` | **Flows to:** `tdd-refactor-phase`
**Related:** `tdd-failure-recovery` (unexpected failures), `test-writing-patterns` (understanding test requirements)
## Expected Outcome
- Test that was red is now green
- Implementation is minimal and clear
- No regressions in existing tests
- Code is ready for refactoring consideration
- Autonomous progression to REFACTOR phase
