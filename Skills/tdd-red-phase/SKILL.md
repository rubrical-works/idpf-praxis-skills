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
Guides experienced developers through the RED phase: writing failing tests and verifying expected failures.
## When to Use This Skill
- Starting implementation of a new feature or behavior
- User triggers `work #N` in IDPF-Agile framework
- Beginning a new TDD iteration
- User needs guidance on writing a failing test
## Prerequisites
- Working development environment with test framework configured
- Clear understanding of the behavior to be tested
- Familiarity with TDD principles
## RED Phase Objective
**Write a test that fails for the right reason.**
**Correct failure:** Test fails because feature/behavior doesn't exist yet; failure message clearly indicates what's missing
**Incorrect failure:** Syntax error, missing imports, incorrect test setup, or test passes unexpectedly
## Workflow
### Step 1: Identify Testable Behavior
One test per behavior, one behavior per test.
**Good:** `"Function returns sum of two numbers"`, `"GET /users returns 200"`, `"Invalid email shows validation error"`
**Poor:** `"User management works"` (too broad), `"Fix the bug"` (not a behavior)
### Step 2: Write the Failing Test
**Test structure (AAA):**
1. ARRANGE: Set up test data and preconditions
2. ACT: Execute the behavior being tested
3. ASSERT: Verify the expected outcome
**Framework-specific syntax:**
```javascript
// Jest / Vitest
describe('featureName', () => {
  it('should behave as expected', () => {
    // Arrange → Act → Assert
  });
});
```
```python
# pytest
def test_feature_name_expected_behavior():
    # Arrange → Act → Assert
    pass
```
```go
// Go testing
func TestFeatureName_ExpectedBehavior(t *testing.T) {
    // Arrange → Act → Assert
}
```
```rust
// Rust
#[test]
fn feature_name_expected_behavior() {
    // Arrange → Act → Assert
}
```
```ruby
# RSpec
describe 'FeatureName' do
  it 'behaves as expected' do
    # Arrange → Act → Assert
  end
end
```
### Step 3: Execute and Verify Failure
- [ ] Test executed without syntax errors
- [ ] Test failed (not passed)
- [ ] Failure message indicates missing implementation
- [ ] Failure message is clear and understandable
### Step 4: Analyze Failure
- **Fails as expected** → RED complete → proceed to GREEN phase
- **Passes unexpectedly** → test is invalid → revise to target unimplemented behavior
- **Errors instead of fails** → test has bugs → fix test code
## Best Practices
**Minimal tests:** One behavior, simplest test data, single assertion (or closely related)
**Clear test names:**
```
test_[feature]_[scenario]_[expected_result]
Examples:
- test_add_function_with_positive_numbers_returns_sum
- test_get_users_when_authenticated_returns_200
```
**Descriptive assertions:** Clear comparison, helpful failure messages, test observable behavior not implementation
## Common Mistakes
1. **Test passes immediately** — feature already exists. Delete implementation first, re-run.
2. **Test has syntax errors** — fix syntax, imports, framework setup.
3. **Test too broad** — split into multiple tests, one behavior each.
4. **Unclear failure message** — add descriptive assertion messages, clear variable names.
## Anti-Patterns
1. **Writing implementation first** — must write failing test before code
2. **Skipping failure verification** — must RUN test and VERIFY it fails before GREEN phase
3. **Tolerating test errors** — fix test now so it fails cleanly, don't defer to GREEN phase
## Integration with IDPF-Agile
RED phase is the first step of story implementation. The TDD cycle runs autonomously. The only user checkpoint is at story completion (In Review → Done).
## RED Phase Checklist
- [ ] Test code is complete and syntactically correct
- [ ] Test executes without errors
- [ ] Test FAILS (does not pass)
- [ ] Failure message clearly indicates missing implementation
- [ ] Test name clearly describes behavior being tested
- [ ] Test is focused on single behavior
- [ ] Test uses minimal, clear test data
## Relationship to Other Skills
- **Flows to:** `tdd-green-phase`
- **Related:** `test-writing-patterns`, `tdd-failure-recovery`
