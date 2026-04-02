# Gherkin Syntax Reference
**Version:** v0.5.0

Complete reference for Gherkin syntax used in BDD feature files.

---

## Keywords

### Primary Keywords

| Keyword | Purpose | Required |
|---------|---------|----------|
| `Feature` | Describe the feature being tested | Yes (once per file) |
| `Scenario` | Define a single test case | Yes (at least one) |
| `Given` | Set up preconditions | Optional |
| `When` | Describe the action | Recommended |
| `Then` | Define expected outcomes | Recommended |

### Secondary Keywords

| Keyword | Purpose |
|---------|---------|
| `And` | Continue the previous step type |
| `But` | Negative continuation of previous step type |
| `Background` | Steps run before each scenario |
| `Scenario Outline` | Template for parameterized scenarios |
| `Examples` | Data table for Scenario Outline |
| `Rule` | Group scenarios under a business rule (Gherkin 6+) |

### Supplementary Keywords

| Keyword | Purpose |
|---------|---------|
| `@tag` | Tag features or scenarios for filtering |
| `#` | Comments |
| `"""` | Doc strings (multi-line text) |
| `|` | Data table delimiter |

---

## Feature

```gherkin
Feature: [Feature Name]
  [Optional description]
  As a [role]
  I want [goal]
  So that [benefit]
```

**Example:**
```gherkin
Feature: Shopping Cart
  As an online shopper
  I want to manage items in my cart
  So that I can purchase what I need

  Scenario: Add item to cart
    ...
```

---

## Scenario

```gherkin
Scenario: [Descriptive name of the test case]
  Given [precondition]
  When [action]
  Then [expected outcome]
```

**Example:**
```gherkin
Scenario: Add single item to empty cart
  Given the shopping cart is empty
  When I add "Blue T-Shirt" to the cart
  Then the cart contains 1 item
  And the cart total is $19.99
```

---

## Steps: Given, When, Then, And, But

### Given (Preconditions)
Set up the initial state before the action.

```gherkin
Given the user is logged in
Given the cart contains 3 items
Given the current date is "2025-01-15"
```

### When (Actions)
Describe the action or event being tested.

```gherkin
When the user clicks "Checkout"
When the payment is processed
When 24 hours have passed
```

### Then (Outcomes)
Define the expected results.

```gherkin
Then the order is confirmed
Then the user receives an email
Then the inventory is reduced by 1
```

### And / But (Continuations)
Continue the previous step type.

```gherkin
Given the user is logged in
And the user has admin privileges
But the user has not verified their email

When the user submits the form
And the form data is valid

Then the record is created
And an audit log entry is added
But no notification is sent
```

---

## Background

Steps that run before each scenario in the feature.

```gherkin
Feature: User Account Management

  Background:
    Given the user is logged in
    And the user is on the account settings page

  Scenario: Change password
    When the user changes their password
    Then the password is updated

  Scenario: Update email
    When the user updates their email
    Then a verification email is sent
```

**Note:** Background runs before EACH scenario, not once per feature.

---

## Scenario Outline

Template for running the same scenario with different data.

```gherkin
Scenario Outline: Validate login credentials
  Given a user with username "<username>" and password "<password>"
  When the user attempts to login
  Then the result is "<result>"

  Examples:
    | username | password | result  |
    | alice    | correct  | success |
    | alice    | wrong    | failure |
    | unknown  | any      | failure |
```

### Multiple Example Tables

```gherkin
Scenario Outline: Calculate shipping cost
  Given the order weight is <weight> kg
  And the destination is "<destination>"
  When shipping cost is calculated
  Then the cost is $<cost>

  Examples: Domestic
    | weight | destination | cost  |
    | 1      | NYC         | 5.00  |
    | 5      | LA          | 12.00 |

  Examples: International
    | weight | destination | cost   |
    | 1      | London      | 25.00  |
    | 5      | Tokyo       | 45.00  |
```

---

## Data Tables

Pass structured data to steps.

```gherkin
Scenario: Create multiple users
  Given the following users exist:
    | username | email              | role  |
    | alice    | alice@example.com  | admin |
    | bob      | bob@example.com    | user  |
  When I view the user list
  Then I see 2 users
```

### Single Column Table

```gherkin
Given the following items are in stock:
  | Blue T-Shirt  |
  | Red Jacket    |
  | Black Pants   |
```

### Key-Value Table

```gherkin
Given a product with the following details:
  | name     | Wireless Mouse |
  | price    | 29.99          |
  | category | Electronics    |
  | stock    | 150            |
```

---

## Doc Strings

Multi-line text content.

```gherkin
Scenario: Create blog post
  When I create a post with content:
    """
    # My First Post

    This is the content of my blog post.
    It spans multiple lines.

    - Point 1
    - Point 2
    """
  Then the post is published
```

### With Content Type

```gherkin
When I send the following JSON:
  """json
  {
    "name": "Test Product",
    "price": 19.99
  }
  """
```

---

## Tags

Label features and scenarios for filtering.

```gherkin
@smoke @authentication
Feature: User Login

  @critical
  Scenario: Successful login
    ...

  @wip
  Scenario: Login with 2FA
    ...
```

### Running Tagged Scenarios

```bash
# Cucumber.js
cucumber-js --tags "@smoke"
cucumber-js --tags "@smoke and not @wip"
cucumber-js --tags "@critical or @smoke"

# pytest-bdd
pytest -m "smoke"
pytest -m "smoke and not wip"
```

### Common Tag Patterns

| Tag | Purpose |
|-----|---------|
| `@smoke` | Quick sanity tests |
| `@regression` | Full regression suite |
| `@wip` | Work in progress (skip) |
| `@slow` | Long-running tests |
| `@manual` | Manual test (skip automation) |
| `@critical` | Critical path tests |
| `@flaky` | Known flaky tests |

---

## Rule (Gherkin 6+)

Group related scenarios under a business rule.

```gherkin
Feature: Account Overdraft

  Rule: Overdraft is allowed up to $500

    Scenario: Withdraw within overdraft limit
      Given my balance is $100
      When I withdraw $500
      Then the transaction succeeds
      And my balance is -$400

    Scenario: Withdraw exceeding overdraft limit
      Given my balance is $100
      When I withdraw $700
      Then the transaction is declined
      And my balance is $100

  Rule: Premium accounts have $1000 overdraft limit

    Scenario: Premium account overdraft
      Given I have a premium account
      And my balance is $100
      When I withdraw $1000
      Then the transaction succeeds
```

---

## Comments

```gherkin
Feature: Shopping Cart
  # This feature covers cart management

  Scenario: Add item to cart
    # Setup
    Given the cart is empty
    # Action
    When I add an item
    # Verification
    Then the cart has 1 item
```

---

## Language Support

Gherkin supports multiple natural languages.

```gherkin
# language: fr
Fonctionnalité: Panier d'achat
  Scénario: Ajouter un article
    Soit un panier vide
    Quand j'ajoute un article
    Alors le panier contient 1 article
```

```gherkin
# language: de
Funktionalität: Einkaufswagen
  Szenario: Artikel hinzufügen
    Angenommen der Warenkorb ist leer
    Wenn ich einen Artikel hinzufüge
    Dann enthält der Warenkorb 1 Artikel
```

---

## Best Practices Summary

1. **One feature per file** - Keep files focused
2. **Descriptive names** - Scenarios should be self-documenting
3. **3-7 steps per scenario** - Keep scenarios concise
4. **Use Background sparingly** - Only for true shared setup
5. **Prefer Scenario Outline** - For data-driven tests
6. **Use tags consistently** - Establish team conventions
7. **Write in third person** - "the user" not "I"

---

**End of Gherkin Syntax Reference**
