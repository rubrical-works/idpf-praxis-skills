# When to Skip Refactoring
**Version:** v0.6.0
Decision criteria for determining when to skip the REFACTOR phase in TDD.
**Golden Rule:** Refactoring is optional. Tests passing is mandatory.
Skip when cost/risk outweighs benefit for the current iteration.
## Time Constraints
**Skip When:** Sprint deadline imminent, critical bug fix needs deployment, demo/release hours away, time box expired
**Don't Skip When:** "No time" is just an excuse, code will be touched again soon, skipping creates compound problems
```
Time available > 15 minutes -> Consider refactoring
Time available < 15 minutes -> Skip, create tech debt ticket
Deadline today -> Skip unless critical clarity issue
```
## Code Stability
**Skip When:** Code unlikely to change, temporary/experimental feature, area scheduled for replacement, one-off script
**Don't Skip When:** Active development path, multiple developers will touch it, core business logic
| Code Type | Refactor Priority |
|-----------|------------------|
| Core domain logic | High |
| Shared utilities | High |
| Feature-specific code | Medium |
| One-off scripts | Low |
| Deprecated code | Skip |
## Risk Assessment
**High Risk - Consider Skipping:** Touches many files, complex interdependencies, no comprehensive test coverage, team unfamiliar with area
**Low Risk - Proceed:** Change is localized, good test coverage, simple mechanical transformation, team knows code
```
High Impact + Low Confidence -> Skip
High Impact + High Confidence -> Careful refactor
Low Impact + Low Confidence -> Skip
Low Impact + High Confidence -> Refactor
```
## Code Smell Severity
**Must Refactor (Don't Skip):** Security vulnerabilities, data corruption risks, memory leaks, blocking bugs
**Should Refactor:** Duplicated logic (3+ occurrences), functions > 50 lines, deeply nested conditionals, misleading names
**Can Skip:** Minor naming improvements, style preferences, premature abstractions
## Quick Decision Checklist
Before skipping, verify:
- [ ] Tests are passing and comprehensive
- [ ] Code is readable enough for next developer
- [ ] No obvious bugs or security issues
- [ ] Tech debt is documented if significant
**Skip Signals:** Code works and is reasonably clear, improvement is cosmetic only, time pressure is real, risk of breaking something is high
**Don't Skip Signals:** You don't understand what you wrote, copy-paste created duplication, names are misleading, next feature will touch this code
## Documenting Skipped Refactoring
```
// TODO: Refactor - [what needs improving]
// Skipped: [date] - [reason]
```
Or create a tech debt ticket with: what was skipped, why, suggested approach, priority/impact assessment.
