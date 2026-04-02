# Step Definition Patterns
**Version:** v0.4.0

Examples of step definitions across different BDD frameworks.

---

## JavaScript (Cucumber.js)

### Basic Steps

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Given steps - Setup
Given('I am on the login page', async function() {
  await this.page.goto('/login');
});

Given('a user exists with email {string} and password {string}', async function(email, password) {
  await this.userService.createUser({ email, password });
});

Given('I am logged in as {string}', async function(email) {
  await this.authService.login(email);
});

// When steps - Actions
When('I enter email {string}', async function(email) {
  await this.page.fill('#email', email);
});

When('I click the login button', async function() {
  await this.page.click('#login-button');
});

When('I submit the form', async function() {
  await this.page.click('button[type="submit"]');
});

// Then steps - Assertions
Then('I am redirected to the dashboard', async function() {
  await expect(this.page).toHaveURL('/dashboard');
});

Then('I see an error {string}', async function(message) {
  const error = await this.page.locator('.error-message');
  await expect(error).toHaveText(message);
});

Then('the cart contains {int} item(s)', async function(count) {
  const cartCount = await this.page.locator('.cart-count');
  await expect(cartCount).toHaveText(String(count));
});
```

### Data Tables

```javascript
Given('the following users exist:', async function(dataTable) {
  const users = dataTable.hashes();
  // users = [{ username: 'alice', email: 'alice@example.com', role: 'admin' }, ...]
  for (const user of users) {
    await this.userService.createUser(user);
  }
});

Given('a product with the following details:', async function(dataTable) {
  const details = dataTable.rowsHash();
  // details = { name: 'Wireless Mouse', price: '29.99', category: 'Electronics' }
  await this.productService.createProduct(details);
});
```

### Doc Strings

```javascript
When('I create a post with content:', async function(docString) {
  await this.postService.createPost({ content: docString });
});

When('I send the following JSON:', async function(docString) {
  const payload = JSON.parse(docString);
  await this.apiClient.post('/api/resource', payload);
});
```

### Hooks

```javascript
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');

BeforeAll(async function() {
  // Run once before all scenarios
  await this.database.connect();
});

Before(async function() {
  // Run before each scenario
  await this.database.clear();
});

Before({ tags: '@authenticated' }, async function() {
  // Run before scenarios tagged @authenticated
  await this.authService.login('testuser@example.com');
});

After(async function(scenario) {
  // Run after each scenario
  if (scenario.result.status === 'FAILED') {
    await this.page.screenshot({ path: `screenshots/${scenario.pickle.name}.png` });
  }
});

AfterAll(async function() {
  // Run once after all scenarios
  await this.database.disconnect();
});
```

---

## Python (pytest-bdd)

### Basic Steps

```python
from pytest_bdd import given, when, then, parsers
import pytest

# Given steps - Setup
@given('I am on the login page')
def on_login_page(browser):
    browser.get('/login')

@given(parsers.parse('a user exists with email "{email}" and password "{password}"'))
def create_user(user_service, email, password):
    user_service.create_user(email=email, password=password)

@given(parsers.parse('I am logged in as "{email}"'))
def logged_in_user(auth_service, email):
    auth_service.login(email)

# When steps - Actions
@when(parsers.parse('I enter email "{email}"'))
def enter_email(browser, email):
    browser.find_element('#email').send_keys(email)

@when('I click the login button')
def click_login(browser):
    browser.find_element('#login-button').click()

@when('I submit the form')
def submit_form(browser):
    browser.find_element('button[type="submit"]').click()

# Then steps - Assertions
@then('I am redirected to the dashboard')
def verify_dashboard(browser):
    assert '/dashboard' in browser.current_url

@then(parsers.parse('I see an error "{message}"'))
def verify_error(browser, message):
    error = browser.find_element('.error-message')
    assert error.text == message

@then(parsers.parse('the cart contains {count:d} item(s)'))
def verify_cart_count(browser, count):
    cart_count = browser.find_element('.cart-count')
    assert int(cart_count.text) == count
```

### Fixtures and Conftest

```python
# conftest.py
import pytest
from pytest_bdd import given

@pytest.fixture
def browser():
    from selenium import webdriver
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

@pytest.fixture
def user_service():
    from services import UserService
    return UserService()

@pytest.fixture
def auth_service(browser):
    from services import AuthService
    return AuthService(browser)

# Shared step definitions
@given('I am logged in as an admin')
def admin_logged_in(auth_service):
    auth_service.login_as_admin()
```

### Data Tables

```python
from pytest_bdd import given, parsers

@given(parsers.parse('the following users exist:\n{users}'))
def create_users(user_service, users):
    # Parse the data table manually or use datatable parser
    for row in users.split('\n'):
        if row.strip() and not row.startswith('|'):
            continue
        # Parse row...

# Alternative with pytest-bdd datatable
@given('the following products are available')
def create_products(datatable, product_service):
    for row in datatable:
        product_service.create(
            name=row['name'],
            price=float(row['price']),
            stock=int(row['stock'])
        )
```

### Scenario Outline

```python
# feature file
"""
Scenario Outline: Login validation
  Given a user with email "<email>" exists
  When I login with email "<email>" and password "<password>"
  Then the result is "<result>"

  Examples:
    | email           | password | result  |
    | alice@test.com  | correct  | success |
    | alice@test.com  | wrong    | failure |
"""

# step definitions
@given(parsers.parse('a user with email "{email}" exists'))
def user_exists(user_service, email):
    user_service.create_user(email=email, password='correct')

@when(parsers.parse('I login with email "{email}" and password "{password}"'))
def login(auth_service, email, password):
    auth_service.attempt_login(email, password)

@then(parsers.parse('the result is "{result}"'))
def verify_result(auth_service, result):
    if result == 'success':
        assert auth_service.is_authenticated()
    else:
        assert not auth_service.is_authenticated()
```

---

## Java (Cucumber-JVM)

### Basic Steps

```java
package steps;

import io.cucumber.java.en.*;
import static org.junit.Assert.*;

public class LoginSteps {
    private WebDriver driver;
    private UserService userService;

    // Given steps - Setup
    @Given("I am on the login page")
    public void iAmOnTheLoginPage() {
        driver.get("/login");
    }

    @Given("a user exists with email {string} and password {string}")
    public void aUserExistsWithEmailAndPassword(String email, String password) {
        userService.createUser(email, password);
    }

    @Given("I am logged in as {string}")
    public void iAmLoggedInAs(String email) {
        authService.login(email);
    }

    // When steps - Actions
    @When("I enter email {string}")
    public void iEnterEmail(String email) {
        driver.findElement(By.id("email")).sendKeys(email);
    }

    @When("I click the login button")
    public void iClickTheLoginButton() {
        driver.findElement(By.id("login-button")).click();
    }

    // Then steps - Assertions
    @Then("I am redirected to the dashboard")
    public void iAmRedirectedToTheDashboard() {
        assertTrue(driver.getCurrentUrl().contains("/dashboard"));
    }

    @Then("I see an error {string}")
    public void iSeeAnError(String message) {
        WebElement error = driver.findElement(By.className("error-message"));
        assertEquals(message, error.getText());
    }

    @Then("the cart contains {int} item(s)")
    public void theCartContainsItems(int count) {
        WebElement cartCount = driver.findElement(By.className("cart-count"));
        assertEquals(count, Integer.parseInt(cartCount.getText()));
    }
}
```

### Data Tables

```java
@Given("the following users exist:")
public void theFollowingUsersExist(DataTable dataTable) {
    List<Map<String, String>> users = dataTable.asMaps();
    for (Map<String, String> user : users) {
        userService.createUser(
            user.get("username"),
            user.get("email"),
            user.get("role")
        );
    }
}

@Given("a product with the following details:")
public void aProductWithTheFollowingDetails(DataTable dataTable) {
    Map<String, String> details = dataTable.asMap();
    productService.createProduct(
        details.get("name"),
        Double.parseDouble(details.get("price")),
        details.get("category")
    );
}
```

### Hooks

```java
package hooks;

import io.cucumber.java.*;

public class Hooks {
    @BeforeAll
    public static void beforeAll() {
        // Run once before all scenarios
        Database.connect();
    }

    @Before
    public void before(Scenario scenario) {
        // Run before each scenario
        Database.clear();
    }

    @Before("@authenticated")
    public void beforeAuthenticated() {
        // Run before scenarios tagged @authenticated
        authService.login("testuser@example.com");
    }

    @After
    public void after(Scenario scenario) {
        // Run after each scenario
        if (scenario.isFailed()) {
            byte[] screenshot = driver.getScreenshotAs(OutputType.BYTES);
            scenario.attach(screenshot, "image/png", scenario.getName());
        }
    }

    @AfterAll
    public static void afterAll() {
        // Run once after all scenarios
        Database.disconnect();
    }
}
```

---

## Common Patterns

### Reusable Step Patterns

```gherkin
# These scenarios reuse the same step definitions
Given a user "alice" exists
Given a user "bob" exists
Given a user "carol" with role "admin" exists
```

```javascript
// Single flexible step definition
Given('a user {string} exists', async function(username) {
  await this.userService.createUser({ username });
});

Given('a user {string} with role {string} exists', async function(username, role) {
  await this.userService.createUser({ username, role });
});
```

### State Sharing Between Steps

```javascript
// Using World object (Cucumber.js)
Given('I create an order', async function() {
  this.order = await this.orderService.create();
});

Then('the order status is {string}', async function(status) {
  expect(this.order.status).toBe(status);
});
```

```python
# Using pytest fixtures
@pytest.fixture
def context():
    return {}

@given('I create an order')
def create_order(context, order_service):
    context['order'] = order_service.create()

@then(parsers.parse('the order status is "{status}"'))
def verify_status(context, status):
    assert context['order'].status == status
```

### Optional Words

```javascript
// Matches: "cart contains 1 item" OR "cart contains 5 items"
Then('the cart contains {int} item(s)', async function(count) {
  // ...
});

// Matches: "I am logged in" OR "I'm logged in"
Given('I am/I\'m logged in', async function() {
  // ...
});
```

---

**End of Step Definition Patterns**
