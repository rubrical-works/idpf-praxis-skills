---
name: bdd-writing
description: Guide developers on writing BDD specifications using Gherkin syntax, feature files, and step definitions
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-02"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [cucumber, gherkin, bdd, javascript, typescript]
copyright: "Rubrical Works (c) 2026"
---
# BDD Writing
Bridges technical and non-technical stakeholders using natural language specifications that are also executable tests. Describe behavior in terms users understand, then automate as tests.
## Gherkin Syntax
| Keyword | Purpose |
|---------|---------|
| Feature | Groups related scenarios |
| Scenario | Single test case |
| Given | Preconditions/context |
| When | Action/event |
| Then | Expected outcome |
| And/But | Continue previous step type |
| Background | Shared setup for all scenarios |
| Scenario Outline + Examples | Parameterized data-driven tests |
### Feature File Structure
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
### Scenario Outline
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
### Step Best Practices
Keep steps reusable (parameterized, not hardcoded). Use `{string}` parameters for single definitions handling multiple cases. Prefer declarative ("Given the user is logged in") over imperative (listing each login step).
## Best Practices
### Feature Organization
```
features/
├── authentication/
│   ├── login.feature
│   └── password_reset.feature
├── orders/
│   ├── create_order.feature
│   └── order_history.feature
└── support/
    ├── step_definitions/
    └── hooks.js
```
### Writing Good Scenarios
| Do | Don't |
|----|-------|
| One behavior per scenario | Multiple behaviors |
| Business language | Technical jargon |
| 3-7 steps | 10+ steps |
| Independent scenarios | Inter-scenario dependencies |
| Focus on behavior | Focus on UI mechanics |
## Anti-Patterns
1. UI-Focused Steps: Use `When I submit my order` not `When I click button id "submit-btn"`
2. Too Many Steps: Split into focused scenarios (shipping, payment, confirmation)
3. Coupled Steps: Self-contained (`When user "alice" logs in`) not variable-passing
4. Inconsistent Language: Pick one term (user/customer/client) and use it consistently
## BDD + TDD Double Loop
1. Write failing BDD scenario (outer loop)
2. TDD inner loop: RED (failing unit test) -> GREEN (minimal code) -> REFACTOR
3. Repeat inner loop until acceptance scenario passes
4. Next scenario
## Tool Selection
| Tool | Language | Best For |
|------|----------|----------|
| Cucumber | JS, Java, Ruby | Most popular, multi-language |
| pytest-bdd | Python | pytest integration |
| SpecFlow | C#/.NET | .NET ecosystem |
| Behave | Python | Python alternative |
| Karate | Java | API testing with BDD |
Quick pick: Python+pytest->pytest-bdd, Python other->Behave, JS->Cucumber.js, Java API->Karate, Java general->Cucumber-JVM, .NET->SpecFlow, Ruby->Cucumber/RSpec.