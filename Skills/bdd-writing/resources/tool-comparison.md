# BDD Tool Comparison
**Version:** v0.12.0
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
## Cucumber.js
**Language:** JavaScript / TypeScript
**Website:** https://cucumber.io/docs/installation/javascript/
- Native Gherkin support, large community
- Integrates with Playwright, Puppeteer, WebDriverIO
- TypeScript support, parallel execution
```bash
npm install --save-dev @cucumber/cucumber
```
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
```bash
npx cucumber-js
npx cucumber-js --tags "@smoke"
npx cucumber-js features/login.feature
```
## pytest-bdd
**Language:** Python
**Website:** https://pytest-bdd.readthedocs.io/
- Integrates with pytest ecosystem and fixtures
- Pytest plugins work (coverage, parallel, etc.)
- IDE support (PyCharm), parametrized scenarios
```bash
pip install pytest-bdd
```
```ini
# pytest.ini
[pytest]
bdd_features_base_dir = features/
```
```bash
pytest
pytest -m "smoke"
pytest tests/features/login.feature
```
```python
# test_login.py
from pytest_bdd import scenarios, given, when, then
scenarios('login.feature')

@given('I am on the login page')
def login_page(browser):
    browser.get('/login')
```
## Behave
**Language:** Python
**Website:** https://behave.readthedocs.io/
- Standalone BDD framework, simple setup
- Good documentation, hooks and fixtures
```bash
pip install behave
```
```
features/
├── login.feature
├── environment.py
└── steps/
    └── login_steps.py
```
```bash
behave
behave --tags=@smoke
behave features/login.feature
```
## Cucumber-JVM
**Language:** Java / Kotlin
**Website:** https://cucumber.io/docs/installation/java/
- Official Cucumber implementation
- Spring Boot integration, JUnit 5 support
- Dependency injection, parallel execution
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
```bash
mvn test
mvn test -Dcucumber.filter.tags="@smoke"
```
## SpecFlow
**Language:** C# / .NET
**Website:** https://specflow.org/
- .NET ecosystem integration, Visual Studio extension
- Living documentation, dependency injection
```bash
dotnet add package SpecFlow
dotnet add package SpecFlow.NUnit
```
```bash
dotnet test
dotnet test --filter "Category=Smoke"
```
## RSpec (Ruby)
**Language:** Ruby
**Website:** https://rspec.info/
- Ruby-native BDD (not Gherkin syntax)
- Expressive syntax, excellent matchers, mocking built-in
```bash
gem install rspec
```
```ruby
RSpec.describe Order do
  describe '#total' do
    context 'with no items' do
      it 'returns zero' do
        order = Order.new
        expect(order.total).to eq(0)
      end
    end
  end
end
```
For Gherkin in Ruby, use Cucumber-Ruby instead.
## Karate
**Language:** Java (runs on JVM)
**Website:** https://github.com/karatelabs/karate
- API testing focused, no code step definitions
- Built-in assertions, JSON/XML support, mock server
```gherkin
Feature: User API

  Scenario: Get user by ID
    Given url 'https://api.example.com/users'
    And path '123'
    When method get
    Then status 200
    And match response.name == 'Alice'
```
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
### Feature Comparison
| Feature | Cucumber.js | pytest-bdd | Behave | Cucumber-JVM | SpecFlow |
|---------|-------------|------------|--------|--------------|----------|
| Gherkin | Full | Full | Full | Full | Full |
| Parallel | Yes | Yes (pytest) | Limited | Yes | Yes |
| IDE Support | Good | Excellent | Good | Excellent | Excellent |
| CI/CD | Easy | Easy | Easy | Easy | Easy |
| Reporting | Good | pytest | Good | Good | Excellent |
| Learning Curve | Low | Low | Low | Medium | Medium |
## Migration Considerations
- **Feature files:** Usually portable (Gherkin is standard)
- **Step definitions:** Must be rewritten in target language
- **Configuration:** Tool-specific, needs recreation
- **Reports:** Different formats, may need report tool changes
**Migration steps:**
1. Start with feature files - they're the spec
2. Rewrite step definitions methodically
3. Test each scenario as migrated
4. Update CI/CD pipeline last
