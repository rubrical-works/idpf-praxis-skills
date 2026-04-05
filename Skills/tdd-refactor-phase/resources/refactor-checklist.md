# REFACTOR Phase Checklist
**Version:** v0.10.0
Quick reference for completing REFACTOR phase successfully.
## Before Refactoring
- [ ] GREEN phase complete with all tests passing
- [ ] Claude Code has analyzed code for opportunities
- [ ] ASSISTANT has evaluated refactoring suggestions
- [ ] Decision made: refactor OR skip
- [ ] If refactoring: specific improvements identified
## If Refactoring
- [ ] Refactoring scope is small and focused
- [ ] One refactoring at a time planned
- [ ] All tests are currently GREEN
- [ ] Refactoring won't change behavior
- [ ] No new features being added
## Applying Refactoring
- [ ] Refactored code is clear and improved
- [ ] Code structure or naming enhanced
- [ ] Duplication eliminated (if applicable)
- [ ] Logic simplified (if applicable)
- [ ] Changes are minimal and focused
## Testing After Refactoring
- [ ] Full test suite executed
- [ ] ALL tests still PASS (green)
- [ ] No test failures
- [ ] No test errors
- [ ] No behavioral changes introduced
## If Tests Break
- [ ] IMMEDIATE ROLLBACK performed
- [ ] Tests returned to green state
- [ ] Decision made: skip refactoring OR try smaller change
- [ ] Tests remain green before proceeding
## Before Proceeding to Next Feature
- [ ] Refactoring complete OR intentionally skipped
- [ ] All tests are green
- [ ] Code quality improved OR preserved
- [ ] Ready to start next RED phase
- [ ] Proceed autonomously to next behavior or story completion
## Quick Diagnostics
**If refactoring breaks tests:** ROLLBACK IMMEDIATELY, tests must stay green, try smaller refactoring or skip
**If refactoring seems risky:** Skip for now, defer to future session
**If unsure about refactoring value:** Skip -- don't refactor for sake of refactoring
## When to Skip Refactoring
- Premature abstraction (only one use case)
- Code already clear enough
- High risk, low value improvement
- Over-engineering suggested
- Time constraints
## Refactoring Principles
**Do:** Small incremental changes, test after each change, rollback if tests break, improve clarity
**Don't:** Add new features during refactoring, change behavior, accept broken tests, big bang refactorings
