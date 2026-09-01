# Code Review Checklist
**Version:** v0.17.0

Structured checklist for systematic anti-pattern detection during code reviews.

---

## How to Use This Checklist

1. **Before Review**: Identify the type of change (feature, bugfix, refactor)
2. **During Review**: Work through relevant sections
3. **Document Findings**: Note severity and location
4. **Suggest Fixes**: Provide specific refactoring guidance

---

## Quick Scan (All Reviews)

Run through these items for every code review:

### Critical Issues (Block Merge)
- [ ] No hardcoded secrets, API keys, or credentials
- [ ] No SQL string concatenation (injection risk)
- [ ] No unvalidated user input used directly
- [ ] No obvious N+1 query patterns in loops
- [ ] Tests are not flaky (deterministic)

### High Priority (Should Fix)
- [ ] No God objects (>500 lines or >10 public methods)
- [ ] No circular dependencies introduced
- [ ] No copy-pasted code blocks (>10 lines duplicated)
- [ ] Transactions used for multi-step database operations
- [ ] Tests are independent (can run in any order)

### Medium Priority (Create Issue)
- [ ] No methods >30 lines
- [ ] No nesting >3 levels deep
- [ ] No magic numbers (use named constants)
- [ ] No commented-out code
- [ ] Error cases handled, not just happy path

---

## Design Review Checklist

For architectural changes, new modules, or significant refactoring:

### Single Responsibility
- [ ] Each class has one reason to change
- [ ] Methods do one thing
- [ ] Modules have clear, focused purpose
- [ ] No "Manager" or "Handler" classes doing everything

### Dependencies
- [ ] No circular dependencies between modules
- [ ] Dependencies flow in one direction
- [ ] Abstractions don't depend on details
- [ ] External dependencies isolated (can mock/swap)

### Coupling & Cohesion
- [ ] Related code is grouped together
- [ ] Unrelated code is separated
- [ ] Changes don't require shotgun surgery
- [ ] Public interfaces are minimal

### Questions to Ask
- "If requirement X changes, how many files change?"
- "Can this module be tested in isolation?"
- "Can this component be reused elsewhere?"
- "Is this the right level of abstraction?"

---

## Code Quality Checklist

For all code changes:

### Readability
- [ ] Names clearly express intent
- [ ] No overly generic names (data, info, temp, result)
- [ ] No abbreviations except well-known ones
- [ ] Code is self-documenting (minimal comments needed)
- [ ] Comments explain "why" not "what"

### Complexity
- [ ] Methods are <30 lines
- [ ] Nesting is <4 levels
- [ ] Cyclomatic complexity is reasonable
- [ ] Guard clauses used instead of deep nesting
- [ ] Complex conditions extracted to named variables/methods

### Duplication
- [ ] No copy-pasted code blocks
- [ ] Similar code extracted to shared functions
- [ ] No redundant checks or operations
- [ ] DRY principle followed (but not over-abstracted)

### Error Handling
- [ ] Errors handled at appropriate level
- [ ] No swallowed exceptions (catch with no action)
- [ ] Error messages are helpful (not stack traces to users)
- [ ] Failure modes documented or obvious

---

## Database Checklist

For changes involving data access:

### Query Performance
- [ ] No SELECT * in production code
- [ ] No N+1 queries (check loops with DB calls)
- [ ] Indexes exist for WHERE/JOIN/ORDER BY columns
- [ ] EXPLAIN ANALYZE run on complex queries
- [ ] Pagination used for large result sets

### Data Integrity
- [ ] Transactions wrap multi-step operations
- [ ] Foreign keys defined where appropriate
- [ ] Unique constraints where needed
- [ ] NOT NULL on required fields
- [ ] Default values make sense

### Query Safety
- [ ] Parameterized queries used (no string concat)
- [ ] User input validated before queries
- [ ] Limits on result set sizes
- [ ] Timeouts on long-running queries

### Schema Design
- [ ] No EAV patterns for relational data
- [ ] No comma-separated values in columns
- [ ] Tables not too wide (>30 columns)
- [ ] Appropriate normalization level

---

## Testing Checklist

For changes with tests:

### Test Quality
- [ ] Tests are deterministic (no random, no time-dependent)
- [ ] Tests are independent (no order dependency)
- [ ] Tests clean up after themselves
- [ ] Tests have clear arrange/act/assert structure
- [ ] Test names describe behavior being tested

### Coverage
- [ ] Happy path tested
- [ ] Error/edge cases tested
- [ ] Boundary conditions tested
- [ ] Invalid inputs handled
- [ ] Realistic test data used

### Maintainability
- [ ] Not over-mocked (testing real behavior)
- [ ] Not testing implementation details
- [ ] Setup code is reasonable (<10 lines)
- [ ] Fixtures/factories used for common setup
- [ ] Test pyramid followed (more unit, fewer E2E)

### Questions to Ask
- "Will this test break if we refactor internals?"
- "Would this test catch a real bug?"
- "Is the test testing behavior or implementation?"
- "Can this test run in parallel with others?"

---

## Security Checklist

For changes with user input, authentication, or data handling:

### Input Handling
- [ ] All user input validated
- [ ] Input sanitized before use
- [ ] Validation happens at system boundary
- [ ] Allowlist approach (not blocklist)

### Authentication & Authorization
- [ ] Auth required on all endpoints that need it
- [ ] Authorization checks present
- [ ] Principle of least privilege followed
- [ ] Session handling is secure

### Data Protection
- [ ] Sensitive data not logged
- [ ] PII handled appropriately
- [ ] Encryption used where needed
- [ ] Secrets managed properly (not in code)

### Output
- [ ] No stack traces exposed to users
- [ ] Error messages don't leak information
- [ ] Output properly encoded/escaped
- [ ] CORS configured correctly

---

## API Checklist

For API changes:

### Design
- [ ] RESTful conventions followed (or documented deviation)
- [ ] Consistent naming patterns
- [ ] Appropriate HTTP methods used
- [ ] Status codes meaningful

### Validation
- [ ] Request validation at boundary
- [ ] Response format consistent
- [ ] Error responses standardized
- [ ] Input limits enforced (size, rate)

### Documentation
- [ ] API documented (OpenAPI/Swagger)
- [ ] Breaking changes noted
- [ ] Deprecations marked
- [ ] Examples provided

---

## Performance Checklist

For performance-sensitive changes:

### Efficiency
- [ ] No unnecessary loops or iterations
- [ ] Appropriate data structures used
- [ ] Caching considered where appropriate
- [ ] Lazy loading for expensive operations

### Resource Usage
- [ ] Memory usage reasonable
- [ ] Connections/handles properly closed
- [ ] No memory leaks (event listeners, closures)
- [ ] Appropriate timeouts set

### Scalability
- [ ] Works with large data sets
- [ ] Doesn't block on slow operations
- [ ] Parallelizable where appropriate
- [ ] No single points of contention

---

## Review Severity Guide

| Severity | Examples | Action |
|----------|----------|--------|
| **Critical** | Security vulnerability, data loss risk, production crash | Block merge, fix immediately |
| **High** | N+1 queries, God object, missing transactions | Should fix before merge |
| **Medium** | Long method, magic numbers, missing edge case tests | Create follow-up issue |
| **Low** | Naming improvement, minor optimization | Optional, comment for awareness |

---

## Review Comment Templates

### Requesting Change
```
**Issue:** [Brief description]
**Location:** [file:line]
**Severity:** [Critical/High/Medium/Low]
**Suggestion:** [How to fix]
```

### Non-blocking Suggestion
```
**Suggestion (optional):** [Description]
This would improve [readability/performance/maintainability] but isn't blocking.
```

### Asking for Clarification
```
**Question:** [What you're trying to understand]
I want to make sure I understand the intent here. Could you explain...
```

---

## Post-Review Actions

1. **Critical/High issues**: Must be addressed before merge
2. **Medium issues**: Create tracking issue if not fixed
3. **Patterns noticed**: Consider adding to team guidelines
4. **Good practices**: Call out what's done well

---

**End of Code Review Checklist**
