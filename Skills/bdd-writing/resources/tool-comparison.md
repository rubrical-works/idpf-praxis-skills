# BDD Tool Comparison
**Version:** v0.4.0

Comparison of popular BDD frameworks across languages.

---

## Quick Reference

| Tool | Language | Gherkin | Best For |
|------|----------|---------|----------|
| Cucumber.js | JavaScript/TypeScript | Native | JS/TS projects, Playwright/Puppeteer |
| pytest-bdd | Python | Native | Python projects, pytest ecosystem |
| Behave | Python | Native | Python projects, standalone |
| Cucumber-JVM | Java/Kotlin | Native | Java projects, Spring Boot |
| SpecFlow | C#/.NET | Native | .NET projects |
| RSpec | Ruby | BDD-style | Ruby projects |
| Karate | Java | Modified | API testing |

---

## Cucumber.js

**Language:** JavaScript / TypeScript
**Gherkin:** Full support
**Website:** https://cucumber.io/docs/installation/javascript/

### Strengths
- Native Gherkin support
- Large community
- Integrates with Playwright, Puppeteer, WebDriverIO
- TypeScript support
- Parallel execution
- Extensible with plugins

### Installation

```bash
npm install --save-dev @cucumber/cucumber
```

### Configuration

```javascript
// cucumber.js
module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['step_definitions/**/*.js'],
    format: ['progress', 'html:reports/cucumber.html'],
    parallel: 2,
  },
};
```

### Running Tests

```bash
npx cucumber-js
npx cucumber-js --tags "@smoke"
npx cucumber-js features/login.feature
```

### Best For
- JavaScript/TypeScript projects
- Browser automation with Playwright
- API testing
- Teams already using npm ecosystem

---

## pytest-bdd

**Language:** Python
**Gherkin:** Full support
**Website:** https://pytest-bdd.readthedocs.io/

### Strengths
- Integrates with pytest ecosystem
- Uses pytest fixtures
- Pytest plugins work (coverage, parallel, etc.)
- IDE support (PyCharm)
- Parametrized scenarios
- Step argument converters

### Installation

```bash
pip install pytest-bdd
```

### Configuration

```ini
# pytest.ini
[pytest]
bdd_features_base_dir = features/
```

### Running Tests

```bash
pytest
pytest -m "smoke"
pytest --bdd-report
pytest tests/features/login.feature
```

### Example

```python
# test_login.py
from pytest_bdd import scenarios, given, when, then

scenarios('login.feature')

@given('I am on the login page')
def login_page(browser):
    browser.get('/login')
```

### Best For
- Python projects using pytest
- Teams wanting pytest plugin ecosystem
- Projects needing coverage integration
- Selenium/Playwright with Python

---

## Behave

**Language:** Python
**Gherkin:** Full support
**Website:** https://behave.readthedocs.io/

### Strengths
- Standalone BDD framework
- Simple setup
- Good documentation
- Hooks and fixtures
- Environment control
- Tag expressions

### Installation

```bash
pip install behave
```

### Project Structure

```
features/
├── login.feature
├── environment.py
└── steps/
    └── login_steps.py
```

### Running Tests

```bash
behave
behave --tags=@smoke
behave features/login.feature
behave --format=json --outfile=report.json
```

### Best For
- Python projects not using pytest
- Simpler BDD needs
- Teams new to Python BDD

---

## Cucumber-JVM

**Language:** Java / Kotlin
**Gherkin:** Full support
**Website:** https://cucumber.io/docs/installation/java/

### Strengths
- Official Cucumber implementation
- Spring Boot integration
- JUnit 5 support
- Dependency injection
- Parallel execution
- Maven/Gradle plugins

### Installation (Maven)

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>7.x.x</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>7.x.x</version>
    <scope>test</scope>
</dependency>
```

### Running Tests

```bash
mvn test
mvn test -Dcucumber.filter.tags="@smoke"
```

### Best For
- Java/Kotlin projects
- Spring Boot applications
- Enterprise environments
- Teams using Maven/Gradle

---

## SpecFlow

**Language:** C# / .NET
**Gherkin:** Full support
**Website:** https://specflow.org/

### Strengths
- .NET ecosystem integration
- Visual Studio extension
- Living documentation
- Dependency injection
- Parallel execution
- SpecFlow+ tools

### Installation

```bash
dotnet add package SpecFlow
dotnet add package SpecFlow.NUnit
```

### Running Tests

```bash
dotnet test
dotnet test --filter "Category=Smoke"
```

### Best For
- .NET projects
- Visual Studio users
- Enterprise .NET shops
- Teams using NUnit/xUnit

---

## RSpec (Ruby)

**Language:** Ruby
**Gherkin:** BDD-style (not Gherkin)
**Website:** https://rspec.info/

### Strengths
- Ruby-native BDD
- Expressive syntax
- Excellent matchers
- Mocking built-in
- Large ecosystem
- Rails integration

### Installation

```bash
gem install rspec
```

### Example (Not Gherkin)

```ruby
RSpec.describe Order do
  describe '#total' do
    context 'with no items' do
      it 'returns zero' do
        order = Order.new
        expect(order.total).to eq(0)
      end
    end

    context 'with items' do
      it 'sums item prices' do
        order = Order.new
        order.add_item(Item.new(price: 10))
        order.add_item(Item.new(price: 20))
        expect(order.total).to eq(30)
      end
    end
  end
end
```

### Note
RSpec uses a BDD-style syntax but NOT Gherkin. For Gherkin in Ruby, use Cucumber-Ruby.

### Best For
- Ruby projects
- Rails applications
- Teams preferring Ruby-native syntax

---

## Karate

**Language:** Java (runs on JVM)
**Gherkin:** Modified Gherkin
**Website:** https://github.com/karatelabs/karate

### Strengths
- API testing focused
- No code step definitions
- Built-in assertions
- JSON/XML support
- Mock server
- Performance testing

### Example

```gherkin
Feature: User API

  Scenario: Get user by ID
    Given url 'https://api.example.com/users'
    And path '123'
    When method get
    Then status 200
    And match response.name == 'Alice'
```

### Note
Karate uses a modified Gherkin where steps are built-in. No step definitions needed for most cases.

### Best For
- API testing
- Teams wanting minimal code
- Quick API test setup
- Performance testing APIs

---

## Selection Guide

### By Language

```
Python project?
├── Using pytest? → pytest-bdd
└── Not using pytest? → Behave

JavaScript/TypeScript project? → Cucumber.js

Java/Kotlin project?
├── API testing focus? → Karate
└── General BDD? → Cucumber-JVM

.NET project? → SpecFlow

Ruby project?
├── Want Gherkin? → Cucumber-Ruby
└── Want Ruby-native? → RSpec
```

### By Use Case

| Use Case | Recommended Tool |
|----------|------------------|
| Web UI testing (JS) | Cucumber.js + Playwright |
| Web UI testing (Python) | pytest-bdd + Selenium/Playwright |
| Web UI testing (Java) | Cucumber-JVM + Selenium |
| Web UI testing (.NET) | SpecFlow + Selenium |
| API testing (any) | Karate or language-native |
| Mobile testing | Cucumber + Appium |
| Enterprise Java | Cucumber-JVM |
| Enterprise .NET | SpecFlow |
| Startup/small team | Language-native tool |

### Feature Comparison

| Feature | Cucumber.js | pytest-bdd | Behave | Cucumber-JVM | SpecFlow |
|---------|-------------|------------|--------|--------------|----------|
| Gherkin | Full | Full | Full | Full | Full |
| Parallel | Yes | Yes (pytest) | Limited | Yes | Yes |
| IDE Support | Good | Excellent | Good | Excellent | Excellent |
| CI/CD | Easy | Easy | Easy | Easy | Easy |
| Reporting | Good | pytest | Good | Good | Excellent |
| Learning Curve | Low | Low | Low | Medium | Medium |

---

## Migration Considerations

### From Tool A to Tool B

**Feature files:** Usually portable (Gherkin is standard)

**Step definitions:** Must be rewritten in target language

**Configuration:** Tool-specific, needs recreation

**Reports:** Different formats, may need report tool changes

### Tips

1. Start with feature files - they're the spec
2. Rewrite step definitions methodically
3. Test each scenario as migrated
4. Update CI/CD pipeline last

---

**End of Tool Comparison**
