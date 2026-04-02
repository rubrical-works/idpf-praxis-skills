# Feature File Template
**Version:** v0.4.0

Use this template as a starting point for new feature files.

---

## Basic Template

```gherkin
@tag1 @tag2
Feature: [Feature Name]
  [Brief description of what this feature does]

  As a [role/persona]
  I want [goal/desire]
  So that [benefit/value]

  Background:
    Given [shared precondition for all scenarios]

  @scenario-tag
  Scenario: [Descriptive scenario name - happy path]
    Given [precondition]
    And [additional precondition]
    When [action]
    And [additional action]
    Then [expected outcome]
    And [additional verification]

  Scenario: [Descriptive scenario name - alternative path]
    Given [precondition]
    When [action]
    Then [expected outcome]

  Scenario: [Descriptive scenario name - error case]
    Given [precondition leading to error]
    When [action that triggers error]
    Then [error handling behavior]
```

---

## Example: E-commerce Cart Feature

```gherkin
@cart @shopping
Feature: Shopping Cart Management
  Allows customers to manage items before checkout

  As an online shopper
  I want to add, remove, and update items in my cart
  So that I can purchase exactly what I need

  Background:
    Given I am logged in as a customer
    And I am on the product catalog page

  @smoke @happy-path
  Scenario: Add single item to empty cart
    Given my shopping cart is empty
    When I add "Blue T-Shirt" to my cart
    Then my cart contains 1 item
    And the cart shows "Blue T-Shirt"
    And the cart total is $29.99

  @happy-path
  Scenario: Add multiple items to cart
    Given my shopping cart is empty
    When I add "Blue T-Shirt" to my cart
    And I add "Black Jeans" to my cart
    Then my cart contains 2 items
    And the cart total is $79.98

  Scenario: Increase item quantity
    Given my cart contains 1 "Blue T-Shirt"
    When I change the quantity to 3
    Then my cart contains 3 items
    And the cart total is $89.97

  Scenario: Remove item from cart
    Given my cart contains "Blue T-Shirt" and "Black Jeans"
    When I remove "Blue T-Shirt" from my cart
    Then my cart contains 1 item
    And the cart shows "Black Jeans"
    But the cart does not show "Blue T-Shirt"

  @edge-case
  Scenario: Add out-of-stock item
    Given "Red Sneakers" is out of stock
    When I try to add "Red Sneakers" to my cart
    Then I see an error "This item is currently unavailable"
    And my cart remains unchanged

  Scenario Outline: Apply discount codes
    Given my cart total is $100.00
    When I apply discount code "<code>"
    Then the discount is "<discount>"
    And the new total is "<total>"

    Examples:
      | code      | discount | total  |
      | SAVE10    | $10.00   | $90.00 |
      | PERCENT20 | $20.00   | $80.00 |
      | INVALID   | $0.00    | $100.00|
```

---

## Example: User Authentication Feature

```gherkin
@authentication @security
Feature: User Authentication
  Secure login and logout functionality

  As a registered user
  I want to securely access my account
  So that my personal information is protected

  Background:
    Given I am on the login page

  @smoke @critical
  Scenario: Successful login with valid credentials
    Given a user exists with email "alice@example.com" and password "SecurePass123!"
    When I enter email "alice@example.com"
    And I enter password "SecurePass123!"
    And I click the login button
    Then I am redirected to the dashboard
    And I see "Welcome, Alice"

  @security
  Scenario: Failed login with incorrect password
    Given a user exists with email "alice@example.com"
    When I enter email "alice@example.com"
    And I enter password "WrongPassword"
    And I click the login button
    Then I see an error "Invalid email or password"
    And I remain on the login page
    And no session is created

  @security
  Scenario: Account lockout after failed attempts
    Given a user exists with email "alice@example.com"
    When I enter incorrect password 5 times
    Then the account is locked
    And I see "Account locked. Please try again in 30 minutes."

  Scenario: Logout ends session
    Given I am logged in as "alice@example.com"
    When I click the logout button
    Then I am redirected to the login page
    And my session is terminated
    And I cannot access protected pages
```

---

## Example: API Feature

```gherkin
@api @orders
Feature: Order API
  RESTful API for order management

  As an API consumer
  I want to manage orders via REST endpoints
  So that I can integrate with the order system

  Background:
    Given I am authenticated with a valid API key

  @smoke
  Scenario: Create a new order
    When I POST to "/api/orders" with:
      """json
      {
        "customerId": "cust-123",
        "items": [
          {"productId": "prod-456", "quantity": 2}
        ]
      }
      """
    Then the response status is 201
    And the response contains an order ID
    And the order status is "pending"

  Scenario: Get order by ID
    Given an order exists with ID "order-789"
    When I GET "/api/orders/order-789"
    Then the response status is 200
    And the response contains:
      | field      | value      |
      | id         | order-789  |
      | status     | pending    |
      | customerId | cust-123   |

  Scenario: Order not found
    When I GET "/api/orders/nonexistent"
    Then the response status is 404
    And the response contains error "Order not found"

  Scenario: Update order status
    Given an order exists with ID "order-789" and status "pending"
    When I PATCH "/api/orders/order-789" with:
      """json
      {"status": "shipped"}
      """
    Then the response status is 200
    And the order status is "shipped"
```

---

## File Naming Conventions

| Pattern | Example |
|---------|---------|
| `[feature-name].feature` | `shopping-cart.feature` |
| `[domain]/[feature].feature` | `orders/create-order.feature` |
| `[number]-[feature].feature` | `001-user-login.feature` |

---

## Directory Structure

```
features/
├── authentication/
│   ├── login.feature
│   ├── logout.feature
│   ├── password-reset.feature
│   └── two-factor-auth.feature
├── orders/
│   ├── create-order.feature
│   ├── cancel-order.feature
│   └── order-history.feature
├── cart/
│   ├── add-items.feature
│   ├── remove-items.feature
│   └── apply-discounts.feature
└── api/
    ├── orders-api.feature
    └── products-api.feature
```

---

**End of Feature File Template**
