# Framework Examples
**Version:** v0.4.0

Setup and usage examples for popular mutation testing frameworks.

## Python - mutmut

### Installation

```bash
pip install mutmut
```

### Basic Usage

```bash
# Run mutation testing
mutmut run

# View results summary
mutmut results

# View specific mutant
mutmut show 42

# View all survivors
mutmut results | grep "survived"

# Generate HTML report
mutmut html
```

### Configuration

Create `setup.cfg` or `pyproject.toml`:

```ini
# setup.cfg
[mutmut]
paths_to_mutate=src/
tests_dir=tests/
runner=pytest
```

```toml
# pyproject.toml
[tool.mutmut]
paths_to_mutate = "src/"
tests_dir = "tests/"
runner = "pytest"
```

### Example Session

```bash
$ mutmut run
- Mutation testing starting -
...
⠙ 150/150  🎉 114  ⏰ 4  🤔 32  🙈 0

$ mutmut results
Survived:
  src/calculator.py:5 - mutant 3
  src/calculator.py:12 - mutant 7
  ...

$ mutmut show 3
--- src/calculator.py
+++ src/calculator.py
@@ -5 +5 @@
-    if price > 0:
+    if price >= 0:
```

### CI Integration

```yaml
# GitHub Actions
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

```bash
# Interactive setup
npx stryker init
```

Or create `stryker.conf.json`:

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
# Run mutation testing
npx stryker run

# With specific config
npx stryker run --configFile stryker.conf.json
```

### Example Output

```
All tests
  ✓ Calculator
    ✓ should add two numbers (2 ms)
    ✓ should subtract two numbers
...

Mutation testing complete!
┌─────────────────────┬──────────┬──────────┬───────────┬──────────┬──────────┐
│ File                │ % score  │ # killed │ # survived│ # timeout│ # no cov │
├─────────────────────┼──────────┼──────────┼───────────┼──────────┼──────────┤
│ src/calculator.js   │   76.92% │       10 │         3 │        0 │        0 │
└─────────────────────┴──────────┴──────────┴───────────┴──────────┴──────────┘
```

### CI Integration

```yaml
# GitHub Actions
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

### Example Output

```
================================================================================
- Statistics
================================================================================
>> Line Coverage: 89% (80/90)
>> Mutation Coverage: 76% (95/125)

>> Generated 125 mutations Killed 95 (76%)
>> Mutations with no coverage 12. Test strength 87%
>> Ran 312 tests (2.50 tests per mutation)
```

### CI Integration

```yaml
# GitHub Actions
- name: Run PIT
  run: mvn org.pitest:pitest-maven:mutationCoverage

- name: Check mutation threshold
  run: |
    # PIT exits non-zero if threshold not met when configured
    mvn org.pitest:pitest-maven:mutationCoverage \
      -DmutationThreshold=75
```

## C# - Stryker.NET

### Installation

```bash
dotnet tool install -g dotnet-stryker
```

### Configuration

Create `stryker-config.json`:

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
# Run in test project directory
cd MyProject.Tests
dotnet stryker

# With specific config
dotnet stryker -c stryker-config.json
```

### Example Output

```
All mutants tested. Score: 78%
┌──────────────────────┬─────────┬────────┬────────┬────────┐
│ File                 │ Mutants │ Killed │ Survived │ Score │
├──────────────────────┼─────────┼────────┼────────┼────────┤
│ Calculator.cs        │      15 │     12 │        3 │   80% │
│ Validator.cs         │      10 │      7 │        3 │   70% │
└──────────────────────┴─────────┴────────┴────────┴────────┘
```

## Ruby - mutant

### Installation

```bash
gem install mutant
gem install mutant-rspec  # For RSpec
```

### Configuration

Create `.mutant.yml`:

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
# Run on all subjects
bundle exec mutant run --include lib --require my_gem --use rspec MyGem*

# Run on specific class
bundle exec mutant run --include lib --require my_gem --use rspec MyGem::Calculator
```

### Example Output

```
Mutant configuration:
Matcher:        #<Mutant::Matcher::Config>
Integration:    Mutant::Integration::Rspec
Jobs:          4
...
Mutations:      150
Kills:          120
Alive:          30
Timeouts:       0
Runtime:        45.23s
Killtime:       38.11s
Overhead:       18.70%
Mutations/s:    3.32
Coverage:       80.00%
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

---

**See SKILL.md for complete mutation testing guidance**
