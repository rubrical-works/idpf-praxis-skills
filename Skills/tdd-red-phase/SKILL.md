---
name: tdd-red-phase
description: Guide experienced developers through RED phase of TDD cycle - writing failing tests and verifying expected failures
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
# TDD RED Phase
Guide experienced developers through the RED phase of TDD: writing failing tests and verifying expected failures.
## When to Use
- Starting implementation of a new feature or behavior
- User triggers `work #N` in IDPF-Agile framework
- Beginning a new TDD iteration
- User needs guidance on writing a failing test
## Prerequisites
- Working development environment with test framework configured
- Clear understanding of the behavior to be tested
- Familiarity with TDD principles
## RED Phase Objectives
**Write a test that fails for the right reason.**
**Correct failure:**
- Test fails because feature doesn't exist yet
- Failure message clearly indicates what's missing
**Incorrect failure:**
- Test fails due to syntax error, missing imports, or incorrect setup
- Test passes unexpectedly (test is invalid)
## RED Phase Workflow
### Step 1: Identify Testable Behavior
- "Decompose story into testable behaviors"
- Focus on smallest testable behavior (one test case covering one behavior)
- **Key principle:** One test per behavior, one behavior per test
**Good behavior identification:**
```
"Function returns sum of two numbers"
"GET /users returns 200 status"
"Invalid email shows validation error"
```
**Poor behavior identification:**
```
"User management works" (too broad)
"Fix the bug" (not a behavior)
```
### Step 2: Write the Failing Test
**Test structure (AAA):**
```
1. ARRANGE: Set up test data and preconditions
2. ACT: Execute the behavior being tested
3. ASSERT: Verify the expected outcome
```
1. Identify the test file (create if needed)
2. Write the test with AAA structure
3. Include all imports and setup
4. Execute the test and verify it fails
**Framework-specific syntax:**
```javascript
// Jest / Vitest
describe('featureName', () => {
  it('should behave as expected', () => {
    // Arrange -> Act -> Assert
  });
});
```
```python
# pytest
def test_feature_name_expected_behavior():
    # Arrange -> Act -> Assert
    pass
```
```go
// Go testing
func TestFeatureName_ExpectedBehavior(t *testing.T) {
    // Arrange -> Act -> Assert
}
```
```rust
// Rust
#[test]
fn feature_name_expected_behavior() {
    // Arrange -> Act -> Assert
}
```
```ruby
# RSpec
describe 'FeatureName' do
  it 'behaves as expected' do
    # Arrange -> Act -> Assert
  end
end
```
### Step 3: Execute and Verify Failure
Execute the test and verify it FAILS (not passes, not errors).
**Verification checklist:**
- [ ] Test executed without syntax errors
- [ ] Test failed (not passed)
- [ ] Failure message indicates missing implementation
- [ ] Failure message is clear and understandable
### Step 4: Analyze Failure
**If test fails as expected:** RED phase complete, proceed to GREEN phase
**If test passes unexpectedly:** Test is invalid -- revise to target unimplemented behavior, repeat Step 2
**If test errors instead of fails:** Test has bugs -- fix test code, repeat Step 2
## Best Practices
- **Minimal tests:** One specific behavior, simplest test data, single assertion
- **Clear test names:** `test_[feature]_[scenario]_[expected_result]`
- **Descriptive assertions:** Include helpful failure messages, test observable behavior not implementation
## Common Mistakes
1. **Test passes immediately** -- verify feature doesn't exist yet; delete implementation first
2. **Test has syntax errors** -- fix syntax, imports, framework setup
3. **Test too broad** -- split into multiple focused tests
4. **Unclear failure message** -- add descriptive assertion messages
## Anti-Patterns
- **Writing implementation first** -- always write failing test first
- **Skipping failure verification** -- always RUN test and VERIFY it fails before GREEN phase
- **Tolerating test errors** -- fix test so it fails cleanly, don't defer to GREEN phase
## Integration with IDPF-Agile
RED phase is the first step of story implementation. When `/work` triggers TDD:
1. Break story into testable behaviors
2. Write and run RED phase test
3. Verify failure
4. Proceed to GREEN phase
The TDD cycle runs autonomously. The only user checkpoint is at story completion (In Review -> Done).
## RED Phase Checklist
Before proceeding to GREEN phase:
- [ ] Test code is complete and syntactically correct
- [ ] Test executes without errors
- [ ] Test FAILS (does not pass)
- [ ] Failure message clearly indicates missing implementation
- [ ] Test name clearly describes behavior being tested
- [ ] Test is focused on single behavior
- [ ] Test uses minimal, clear test data
## Resources
- `resources/red-phase-checklist.md` - Quick reference checklist
- `resources/test-structure-patterns.md` - Common test structure patterns
- `resources/failure-verification-guide.md` - How to verify test failures correctly
## Relationship to Other Skills
**Flows to:** `tdd-green-phase` - Next phase after RED phase success
**Related:** `test-writing-patterns`, `tdd-failure-recovery`
## Expected Outcome
- One failing test exists
- Failure is verified and understood
- Test clearly defines expected behavior
- Ready to implement minimum code to pass test (GREEN phase)
- Autonomous progression to GREEN phase (no user command needed)
