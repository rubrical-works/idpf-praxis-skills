---
name: bdd-writing
description: Guide developers on writing BDD specifications using Gherkin syntax, feature files, and step definitions
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [cucumber, gherkin, bdd, javascript, typescript]
copyright: "Rubrical Works (c) 2026"
---
# BDD Writing
Guide for writing Behavior-Driven Development specifications using Gherkin syntax, covering feature files, step definitions, and TDD integration.
## When to Use This Skill
- Writing acceptance criteria as executable specifications
- Creating feature files for new functionality
- Defining step definitions for scenarios
- Organizing BDD test suites
- Integrating BDD with TDD workflow
- Gherkin syntax questions
- Tool selection guidance (Cucumber, pytest-bdd, etc.)
## Prerequisites
- Understanding of testing concepts
- Familiarity with TDD (recommended)
- Knowledge of at least one programming language
## What is BDD?
**Key Principle:** Describe behavior in terms users understand, then automate those descriptions as tests.
```
Traditional: "Test that login validates credentials"
BDD:         "Given a registered user, When they enter valid credentials, Then they see the dashboard"
```
## Gherkin Syntax
### Core Keywords
| Keyword | Purpose | Example |
|---------|---------|---------|
| **Feature** | Groups related scenarios | `Feature: User Authentication` |
| **Scenario** | Single test case | `Scenario: Successful login` |
| **Given** | Preconditions/context | `Given a registered user exists` |
| **When** | Action/event | `When the user submits credentials` |
| **Then** | Expected outcome | `Then they see the dashboard` |
| **And** | Continue previous step type | `And they see a welcome message` |
| **But** | Negative continuation | `But they don't see admin menu` |
| **Background** | Shared setup for all scenarios | Runs before each scenario |
| **Scenario Outline** | Parameterized scenarios | Data-driven tests |
| **Examples** | Data table for outlines | Test data variations |
### Basic Feature File Structure
```gherkin
Feature: User Authentication
  As a registered user
  I want to log into the system
  So that I can access my account

  Background:
    Given the login page is displayed

  Scenario: Successful login with valid credentials
    Given a user "alice" exists with password "secret123"
    When the user enters username "alice"
    And the user enters password "secret123"
    And the user clicks the login button
    Then the user sees the dashboard
    And the user sees "Welcome, alice"

  Scenario: Failed login with wrong password
    Given a user "alice" exists with password "secret123"
    When the user enters username "alice"
    And the user enters password "wrongpassword"
    And the user clicks the login button
    Then the user sees an error message "Invalid credentials"
    But the user remains on the login page
```
### Scenario Outline (Parameterized Tests)
```gherkin
Scenario Outline: Login with various credentials
  Given a user "<username>" exists with password "<password>"
  When the user attempts to login with "<input_user>" and "<input_pass>"
  Then the result is "<outcome>"

  Examples:
    | username | password  | input_user | input_pass | outcome |
    | alice    | secret123 | alice      | secret123  | success |
    | alice    | secret123 | alice      | wrong      | failure |
    | alice    | secret123 | bob        | secret123  | failure |
```
### Data Tables
```gherkin
Scenario: Create multiple users
  Given the following users exist:
    | username | email            | role  |
    | alice    | alice@example.com| admin |
    | bob      | bob@example.com  | user  |
  When I view the user list
  Then I see 2 users
```
## Step Definitions
**JavaScript (Cucumber.js):**
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

Given('a user {string} exists with password {string}', async (username, password) => {
  await createUser(username, password);
});

When('the user enters username {string}', async (username) => {
  await enterUsername(username);
});

Then('the user sees the dashboard', async () => {
  await expect(page).toHaveURL('/dashboard');
});
```
**Python (pytest-bdd):**
```python
from pytest_bdd import given, when, then, parsers

@given(parsers.parse('a user "{username}" exists with password "{password}"'))
def create_user(username, password):
    User.create(username=username, password=password)

@when(parsers.parse('the user enters username "{username}"'))
def enter_username(username, login_page):
    login_page.enter_username(username)

@then('the user sees the dashboard')
def verify_dashboard(page):
    assert page.url == '/dashboard'
```
### Step Definition Best Practices
**1. Keep Steps Reusable**
```gherkin
# Good - Reusable
Given a user "alice" exists
# Poor - Too specific
Given alice the admin user exists in the system
```
**2. Use Parameters**
```javascript
// Good - Single definition handles multiple cases
Given('a user {string} with role {string}', (name, role) => { ... });
```
**3. Declarative Over Imperative**
```gherkin
# Good - Declarative (what, not how)
Given the user is logged in
# Poor - Imperative (too detailed)
Given the user opens the login page
And the user enters username "alice"
And the user enters password "secret"
And the user clicks login
```
## Best Practices
### Feature Organization
```
features/
├── authentication/
│   ├── login.feature
│   ├── logout.feature
│   └── password_reset.feature
├── orders/
│   ├── create_order.feature
│   └── order_history.feature
└── support/
    ├── step_definitions/
    │   ├── auth_steps.js
    │   └── order_steps.js
    └── hooks.js
```
### Writing Good Scenarios
| Do | Don't |
|----|-------|
| One behavior per scenario | Multiple behaviors per scenario |
| Use business language | Use technical jargon |
| Keep scenarios short (3-7 steps) | Write long scenarios (10+ steps) |
| Make scenarios independent | Create dependencies between scenarios |
| Focus on behavior | Focus on UI mechanics |
## Anti-Patterns to Avoid
**1. UI-Focused Steps**
```gherkin
# Poor
When I click the button with id "submit-btn"
# Good
When I submit my order
```
**2. Too Many Steps** -- Split into focused scenarios:
```gherkin
Scenario: Enter shipping information
Scenario: Select shipping method
Scenario: Process payment
Scenario: Confirm order
```
**3. Coupled Steps**
```gherkin
# Poor
Given I set the username variable to "alice"
When I use the username variable to login
# Good
When the user "alice" logs in
```
**4. Inconsistent Language** -- Use consistent terminology (pick "user", not "customer"/"client"/"user" interchangeably).
## BDD + TDD Integration (Double Loop)
```
OUTER LOOP: BDD (Acceptance Tests)
  1. Write failing acceptance scenario
  INNER LOOP: TDD (Unit Tests)
    2. RED: Write failing unit test
    3. GREEN: Write minimal code to pass
    4. REFACTOR: Improve code quality
    5. Repeat until feature complete
  6. Acceptance scenario passes
  7. Move to next scenario
```
## Tool Selection Guide
| Tool | Language | Best For |
|------|----------|----------|
| **Cucumber** | JS, Java, Ruby | Most popular, multi-language |
| **pytest-bdd** | Python | Python projects, pytest integration |
| **SpecFlow** | C#/.NET | .NET ecosystem |
| **Behave** | Python | Python alternative to pytest-bdd |
| **RSpec** | Ruby | Ruby with BDD-style syntax |
| **Karate** | Java | API testing with BDD |
### Quick Selection
```
Python project?
├── Using pytest? -> pytest-bdd
└── Not using pytest? -> Behave
JavaScript project? -> Cucumber.js
Java project?
├── API testing focus? -> Karate
└── General BDD? -> Cucumber-JVM
.NET project? -> SpecFlow
Ruby project? -> Cucumber or RSpec
```
## Resources
See `resources/` directory for:
- `gherkin-syntax.md` - Complete Gherkin reference
- `feature-file-template.md` - Feature file template
- `step-definition-patterns.md` - Step definition examples by language
- `tool-comparison.md` - Detailed tool comparison
## Relationship to Other Skills
**Complements:** `test-writing-patterns`, `tdd-red-phase`, `beginner-testing`
**Used by:** IDPF-Agile for user story validation and acceptance criteria verification
