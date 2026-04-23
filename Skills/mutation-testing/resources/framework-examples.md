# Framework Examples
**Version:** v0.13.1
Setup and usage examples for popular mutation testing frameworks.
## Python - mutmut
### Installation
```bash
pip install mutmut
```
### Basic Usage
```bash
mutmut run
mutmut results
mutmut show 42
mutmut results | grep "survived"
mutmut html
```
### Configuration
```toml
# pyproject.toml
[tool.mutmut]
paths_to_mutate = "src/"
tests_dir = "tests/"
runner = "pytest"
```
### CI Integration
```yaml
- name: Run mutation tests
  run: |
    pip install mutmut
    mutmut run --CI
    mutmut results
- name: Check mutation score
  run: |
    SCORE=$(mutmut results --json | jq '.score')
    if (( $(echo "$SCORE < 75" | bc -l) )); then
      echo "Mutation score too low: $SCORE"
      exit 1
    fi
```
## JavaScript - Stryker
### Installation
```bash
npm install --save-dev @stryker-mutator/core
npm install --save-dev @stryker-mutator/jest-runner  # For Jest
# or
npm install --save-dev @stryker-mutator/mocha-runner  # For Mocha
```
### Configuration
```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/**/*.js", "!src/**/*.test.js"]
}
```
### Basic Usage
```bash
npx stryker run
npx stryker run --configFile stryker.conf.json
```
### CI Integration
```yaml
- name: Install dependencies
  run: npm ci
- name: Run Stryker
  run: npx stryker run
- name: Upload mutation report
  uses: actions/upload-artifact@v3
  with:
    name: mutation-report
    path: reports/mutation/
```
## Java - PIT (Pitest)
### Maven Setup
```xml
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <version>1.15.0</version>
    <dependencies>
        <dependency>
            <groupId>org.pitest</groupId>
            <artifactId>pitest-junit5-plugin</artifactId>
            <version>1.2.0</version>
        </dependency>
    </dependencies>
    <configuration>
        <targetClasses>
            <param>com.example.*</param>
        </targetClasses>
        <targetTests>
            <param>com.example.*Test</param>
        </targetTests>
        <mutationThreshold>75</mutationThreshold>
    </configuration>
</plugin>
```
### Gradle Setup
```groovy
plugins {
    id 'info.solidsoft.pitest' version '1.15.0'
}
pitest {
    targetClasses = ['com.example.*']
    targetTests = ['com.example.*Test']
    mutationThreshold = 75
    outputFormats = ['HTML', 'XML']
}
```
### Basic Usage
```bash
# Maven
mvn org.pitest:pitest-maven:mutationCoverage
# Gradle
./gradlew pitest
```
### CI Integration
```yaml
- name: Run PIT
  run: mvn org.pitest:pitest-maven:mutationCoverage
- name: Check mutation threshold
  run: |
    mvn org.pitest:pitest-maven:mutationCoverage \
      -DmutationThreshold=75
```
## C# - Stryker.NET
### Installation
```bash
dotnet tool install -g dotnet-stryker
```
### Configuration
```json
{
  "stryker-config": {
    "solution": "MySolution.sln",
    "project": "MyProject.csproj",
    "test-projects": ["MyProject.Tests.csproj"],
    "reporters": ["html", "progress"],
    "threshold-high": 80,
    "threshold-low": 60,
    "threshold-break": 50
  }
}
```
### Basic Usage
```bash
cd MyProject.Tests
dotnet stryker
dotnet stryker -c stryker-config.json
```
## Ruby - mutant
### Installation
```bash
gem install mutant
gem install mutant-rspec  # For RSpec
```
### Configuration
```yaml
integration: rspec
includes:
  - lib
requires:
  - my_gem
mutation:
  subjects:
    - MyGem::*
```
### Basic Usage
```bash
bundle exec mutant run --include lib --require my_gem --use rspec MyGem*
bundle exec mutant run --include lib --require my_gem --use rspec MyGem::Calculator
```
## Framework Comparison
| Feature | mutmut | Stryker (JS) | PIT | Stryker.NET | mutant |
|---------|--------|--------------|-----|-------------|--------|
| Language | Python | JS/TS | Java | C# | Ruby |
| Setup | Easy | Easy | Medium | Easy | Medium |
| Speed | Medium | Fast | Fast | Medium | Slow |
| Reporting | Basic | Excellent | Good | Excellent | Good |
| CI Support | Good | Excellent | Excellent | Excellent | Good |
## Common Configuration Patterns
### Excluding Files
```javascript
// Stryker
{
  "mutate": [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/generated/**"
  ]
}
```
```xml
<!-- PIT -->
<excludedClasses>
    <param>com.example.generated.*</param>
</excludedClasses>
```
### Targeting Specific Operators
```javascript
// Stryker
{
  "mutator": {
    "excludedMutations": ["StringLiteral", "OptionalChaining"]
  }
}
```
### Setting Thresholds
```javascript
// Stryker
{
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  }
}
```
