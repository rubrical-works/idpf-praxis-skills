# GREEN Phase Checklist
**Version:** v0.13.0
## Before Implementing
- [ ] RED phase complete with verified failing test
- [ ] Test requirements clearly understood
- [ ] Minimum implementation approach identified
- [ ] No plans to add untested features
## Writing Implementation
- [ ] Code implements exactly what test requires
- [ ] Implementation is minimal (YAGNI principle)
- [ ] No features beyond test scope added
- [ ] Code is clear and understandable
- [ ] Implementation is complete (no placeholders)
## Executing the Test
- [ ] Implementation runs without errors
- [ ] Target test now PASSES (green)
- [ ] Implementation code is syntactically correct
- [ ] No unexpected side effects
## Regression Check
- [ ] Full test suite executed (if available)
- [ ] All existing tests still pass
- [ ] No regressions introduced
- [ ] All tests are green
## Before Proceeding to REFACTOR
- [ ] Test is green and verified
- [ ] Implementation is minimal but complete
- [ ] No broken tests exist
- [ ] Ready for refactoring analysis
- [ ] Proceed autonomously to REFACTOR phase
## Quick Diagnostics
- **Test still fails:** Implementation incomplete/incorrect, review expectations, revise
- **Other tests break:** Regression introduced, fix implementation to keep all tests green
- **Implementation seems too simple:** That's OK! Simplest thing that works is correct. Future tests will drive complexity.
## YAGNI Reminders
- Don't add "might need later" features
- Don't optimize prematurely
- Don't create abstractions before third use
- Trust that tests will drive future features
