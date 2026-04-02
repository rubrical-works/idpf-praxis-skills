---
name: anti-pattern-analysis
description: Systematic detection of anti-patterns during code review with actionable refactoring guidance
type: injector
disable-model-invocation: true
user-invocable: false
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: code-quality
relevantTechStack: [javascript, typescript, python, java, go, rust, ruby, csharp]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---

# Anti-Pattern Analysis Skill

## Purpose

Provides structured guidance for identifying common anti-patterns across languages, architectures, and testing practices. Supports code reviews, refactoring planning, technical debt assessment, and reverse-PRD extraction workflows.

---

## When to Invoke

- **Code review sessions** - Systematic pattern detection
- **Refactoring planning** - Identify improvement areas
- **Technical debt assessment** - Catalog existing issues
- **Architecture review** - Detect structural problems
- **Reverse-PRD extraction** - Document anti-patterns as technical debt/NFRs
- **Spaghetti code or god class refactoring** - Untangle tangled control flow or monolithic classes
- **Coupling analysis** - Identify and reduce interdependencies
- **Language-specific anti-patterns** - JavaScript, Python, or other language issues

---

## How to Use

### Standard Code Review

1. Identify the code area to review
2. Apply relevant anti-pattern checklist (see resources)
3. Document findings with severity level
4. Suggest specific refactoring approach

### With PRD Extraction Workflow

When used with `/create-prd extract`:

1. **Analysis**: Run anti-pattern detection alongside codebase analysis
2. **Extraction**: Include detected anti-patterns in Technical Debt section
3. **Output**: Anti-patterns become suggested NFRs in extracted PRD

---

## Anti-Pattern Categories

### 1. Design/OOP Anti-Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| **God Object** | Class with too many responsibilities (>500 lines, >10 methods) | High |
| **Singleton Abuse** | Overuse of singletons creating global state | Medium |
| **Anemic Domain Model** | Data classes with no behavior, logic in services | Medium |
| **Poltergeist** | Classes that only exist to invoke other classes | Low |
| **Golden Hammer** | Using one solution/pattern for everything | Medium |
| **Circular Dependency** | Classes that depend on each other | High |
| **Yo-yo Problem** | Inheritance hierarchy requiring constant up/down navigation | Medium |

### 2. Code Smell Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| **Long Method** | Methods exceeding 20-30 lines | Medium |
| **Deep Nesting** | More than 3 levels of indentation | Medium |
| **Magic Numbers** | Unexplained literal values in code | Low |
| **Primitive Obsession** | Using primitives instead of small objects | Medium |
| **Feature Envy** | Method uses another class's data excessively | Medium |
| **Shotgun Surgery** | One change requires edits in many places | High |
| **Divergent Change** | One class changed for many different reasons | High |
| **Data Clumps** | Same group of data items appearing together | Medium |
| **Comments Explaining Bad Code** | Comments compensating for unclear code | Low |

### 3. Architecture Anti-Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| **Big Ball of Mud** | No discernible architecture | Critical |
| **Distributed Monolith** | Microservices with tight coupling | High |
| **Lava Flow** | Dead code nobody dares remove | Medium |
| **Boat Anchor** | Unused code kept "just in case" | Low |
| **Copy-Paste Programming** | Duplicated code blocks | High |
| **Spaghetti Code** | Tangled control flow | High |
| **Lasagna Code** | Too many layers of abstraction | Medium |
| **Swiss Army Knife** | One interface trying to do everything | Medium |

### 4. Database Anti-Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| **N+1 Queries** | Loop executing individual queries | Critical |
| **SELECT *** | Fetching all columns unnecessarily | Medium |
| **Implicit Columns** | INSERT without explicit column list | Medium |
| **EAV (Entity-Attribute-Value)** | Flexible but unqueryable schema | High |
| **Soft Deletes Everywhere** | Never actually deleting data | Medium |
| **No Indexes** | Missing indexes on frequently queried columns | High |
| **God Table** | One table with too many columns | High |
| **CRUD Procedures** | Stored procedures for every operation | Low |

### 5. Testing Anti-Patterns

| Pattern | Description | Severity |
|---------|-------------|----------|
| **Flaky Tests** | Non-deterministic test results | Critical |
| **Test Interdependence** | Tests depend on execution order | High |
| **Over-Mocking** | Mocking so much the test is meaningless | High |
| **Testing Implementation** | Tests break on refactor | Medium |
| **Slow Tests** | Test suite takes too long to run | Medium |
| **Test Pollution** | Tests leave behind state | High |
| **Happy Path Only** | No edge case or error testing | Medium |
| **Ice Cream Cone** | More E2E tests than unit tests | Medium |

### 6. Security Anti-Patterns

> **Cross-reference:** For dedicated security guidance, consider a `security-patterns` skill. This section covers security patterns detectable during code review.

| Pattern | Description | Severity |
|---------|-------------|----------|
| **Hardcoded Secrets** | Credentials in source code | Critical |
| **SQL String Concatenation** | Building queries with string concatenation | Critical |
| **Trust All Input** | No input validation | Critical |
| **Rolling Own Crypto** | Custom cryptography implementation | Critical |
| **Excessive Permissions** | Overly broad access rights | High |
| **Security by Obscurity** | Relying on hidden implementation | High |
| **Missing Authentication** | Endpoints without auth checks | Critical |
| **Verbose Error Messages** | Stack traces exposed to users | Medium |

---

## Severity Levels

| Level | Impact | Action Required |
|-------|--------|-----------------|
| **Critical** | Security risk, data loss, or system failure | Must fix before merge/release |
| **High** | Major technical debt, maintainability blocker | Should fix in same PR or sprint |
| **Medium** | Code smell, degraded maintainability | Create follow-up issue |
| **Low** | Minor improvement opportunity | Optional, address when convenient |

---

## Quick Review Checklist

### Design
- [ ] No God objects (classes >500 lines or >10 public methods)
- [ ] No Singleton abuse (prefer dependency injection)
- [ ] No circular dependencies between modules
- [ ] Single Responsibility principle followed
- [ ] Reasonable inheritance depth (<4 levels)

### Code Quality
- [ ] No methods exceeding 20-30 lines
- [ ] No nesting deeper than 3 levels
- [ ] No magic numbers (use named constants)
- [ ] No commented-out code
- [ ] No duplicated code blocks (>10 lines)
- [ ] No overly generic names (data, info, manager, handler)

### Database
- [ ] No N+1 query patterns (check loops with queries)
- [ ] No SELECT * in production code
- [ ] Indexes exist for frequently queried columns
- [ ] Transactions used where needed
- [ ] No string concatenation for SQL

### Testing
- [ ] Tests are deterministic (no random, no time-dependent)
- [ ] Tests are independent (can run in any order)
- [ ] Reasonable mock usage (not over-mocked)
- [ ] Edge cases and errors tested
- [ ] Test pyramid followed (more unit than E2E)

### Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation at system boundaries
- [ ] Parameterized queries used
- [ ] Proper error handling (no stack traces to users)
- [ ] Authentication/authorization on all endpoints

---

## Refactoring Guidance

### God Object → Single Responsibility
```
Before: UserManager handles auth, profile, notifications, billing
After:  AuthService, ProfileService, NotificationService, BillingService
```
**Steps:** Identify distinct responsibilities. Extract each into a focused class/module. Replace direct field access with dependency injection. Verify each service has one reason to change.

### Long Method → Extract Method
```
Before: 100-line method with multiple responsibilities
After:  Main method calling well-named smaller methods
```
**Steps:** Identify logical blocks (often separated by blank lines or comments). Name each block as a verb phrase. Extract to named functions. The parent method becomes a readable summary.

### N+1 Query → Eager Loading
```
Before: for user in users: user.orders  # N+1 queries
After:  users = User.objects.prefetch_related('orders')  # 2 queries
```
**Steps:** Identify loops that execute queries per item. Replace with batch/eager loading (ORM-specific: `prefetch_related` in Django, `includes` in Rails, `JOIN FETCH` in JPA, `.Include()` in EF Core).

### Magic Numbers → Named Constants
```
Before: if (status === 3) { ... }
After:  if (status === OrderStatus.SHIPPED) { ... }
```

### Deep Nesting → Guard Clauses
```
Before: if (a) { if (b) { if (c) { ...do work... } } }
After:  if (!a) return; if (!b) return; if (!c) return; ...do work...
```

### Shotgun Surgery → Consolidate
```
Before: Changing "email format" requires editing 5 files
After:  EmailValidator class used by all 5 locations
```
**Steps:** Identify all locations affected by one change. Extract the shared concept into a single module. Replace scattered inline logic with references to the consolidated module.

### Copy-Paste → Extract Shared Function
```
Before: Same 15-line block appears in 3 places with minor variations
After:  Shared function with parameters for the variations
```
**Steps:** Identify the common structure. Parameterize the differences. Extract to shared function. Replace all copies with calls. Verify behavior unchanged with existing tests.

### Circular Dependency → Dependency Inversion
```
Before: Module A imports Module B, Module B imports Module A
After:  Both depend on shared interface/contract module
```
**Steps:** Identify the shared abstraction both modules need. Extract an interface or abstract type to a third module. Both original modules depend on the interface, not each other.

---

## Reverse-PRD Integration

When analyzing existing codebases for PRD extraction:

### Detection Output Format
```markdown
## Technical Debt (Auto-detected)

| Anti-Pattern | Location | Severity | Suggested NFR |
|--------------|----------|----------|---------------|
| N+1 Queries | UserService.getAll():42 | Critical | NFR-PERF-001: Optimize query patterns |
| God Object | AppController (1247 lines) | High | NFR-MAINT-001: Modularize controller |
| Hardcoded secrets | config.js:15 | Critical | NFR-SEC-001: Implement secret management |
| No input validation | api/users.js | Critical | NFR-SEC-002: Add input validation |
| Flaky tests | tests/integration/* | High | NFR-QUAL-001: Stabilize test suite |
```

### Mapping to NFR Categories
- **Security anti-patterns** → NFR-SEC-*
- **Performance anti-patterns** → NFR-PERF-*
- **Maintainability anti-patterns** → NFR-MAINT-*
- **Testing anti-patterns** → NFR-QUAL-*
- **Architecture anti-patterns** → NFR-ARCH-*

---

## Resources

- [General Anti-Patterns](resources/general-anti-patterns.md) - Design and code smell patterns
- [Architecture Anti-Patterns](resources/architecture-anti-patterns.md) - System design issues
- [Testing Anti-Patterns](resources/testing-anti-patterns.md) - Test code issues
- [Database Anti-Patterns](resources/database-anti-patterns.md) - SQL and ORM issues
- [Code Review Checklist](resources/code-review-checklist.md) - Structured review guide
- [JavaScript Anti-Patterns](resources/language-specific/javascript-anti-patterns.md)
- [Python Anti-Patterns](resources/language-specific/python-anti-patterns.md)
- [Go Anti-Patterns](resources/language-specific/go-anti-patterns.md)
- [Ruby Anti-Patterns](resources/language-specific/ruby-anti-patterns.md)

---

## Related

- **QA-Test-Engineer**: Testing anti-patterns and test strategy
- **Backend-Specialist**: Database and design patterns
- **Security-Engineer**: Security anti-patterns
- **codebase-analysis Skill**: Code analysis integration
- **create-prd Skill**: PRD extraction workflow integration

---

**End of Skill Document**
