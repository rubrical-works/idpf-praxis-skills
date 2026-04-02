# QA Automation Domain Module

**Source:** `Domains/QA-Automation/`
**Tools:** Playwright
**Pattern:** Page Object Model (POM)

## Required Packages

```
@playwright/test
playwright
```

## Generated Artifacts

### Artifact 1: `tests/e2e/pages/BasePage.ts`

Base page object with common functionality shared across all page objects.

```typescript
// tests/e2e/pages/BasePage.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to the page's URL */
  abstract goto(): Promise<void>;

  /** Wait for the page to be fully loaded */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Get the current page title */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Get the current URL path */
  getPath(): string {
    return new URL(this.page.url()).pathname;
  }

  /** Check if an element is visible */
  async isVisible(selector: string): Promise<boolean> {
    return this.page.isVisible(selector);
  }

  /** Wait for navigation to complete */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
```

### Artifact 2: `tests/e2e/pages/LoginPage.ts`

Example page object using data-testid selectors and meaningful action methods.

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators — private, encapsulated
  private readonly emailInput = '[data-testid="email"]';
  private readonly passwordInput = '[data-testid="password"]';
  private readonly submitButton = '[data-testid="login-submit"]';
  private readonly errorMessage = '[data-testid="error-message"]';
  private readonly forgotPasswordLink = '[data-testid="forgot-password"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForLoad();
  }

  // Actions — public, meaningful names
  async login(email: string, password: string): Promise<void> {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
    await this.waitForNavigation();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.page.textContent(this.errorMessage)) ?? '';
  }

  async isErrorVisible(): Promise<boolean> {
    return this.page.isVisible(this.errorMessage);
  }

  async clickForgotPassword(): Promise<void> {
    await this.page.click(this.forgotPasswordLink);
    await this.waitForNavigation();
  }
}
```

### Artifact 3: `tests/e2e/pages/HomePage.ts`

Home page object generated from discovered routes.

```typescript
// tests/e2e/pages/HomePage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly heading = '[data-testid="page-heading"]';
  private readonly navigation = '[data-testid="main-nav"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async getHeadingText(): Promise<string> {
    return (await this.page.textContent(this.heading)) ?? '';
  }

  async isNavigationVisible(): Promise<boolean> {
    return this.page.isVisible(this.navigation);
  }
}
```

### Artifact 4: `tests/e2e/fixtures/test-data.ts`

Shared test data fixtures for authentication and common scenarios.

```typescript
// tests/e2e/fixtures/test-data.ts
export const testUsers = {
  standard: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    name: 'Admin User',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrong-password',
    name: 'Invalid User',
  },
};

export const routes = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  // {{DISCOVERED_ROUTES}}
};
```

### Artifact 5: `tests/e2e/fixtures/auth.fixture.ts`

Playwright fixture for authenticated test contexts.

```typescript
// tests/e2e/fixtures/auth.fixture.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testUsers } from './test-data';

type AuthFixtures = {
  authenticatedPage: ReturnType<typeof base['page']> extends Promise<infer T> ? T : never;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.standard.email, testUsers.standard.password);
    // Verify login succeeded
    await expect(page).not.toHaveURL(/\/login/);
    await use(page);
  },
});

export { expect };
```

### Artifact 6: `tests/e2e/smoke.spec.ts`

Critical path smoke tests executed after every deployment.

```typescript
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { testUsers } from './fixtures/test-data';

test.describe('Smoke Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('homepage loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    expect(homePage.getPath()).toBe('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('login page loads successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    expect(loginPage.getPath()).toBe('/login');
  });

  test('user can log in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.standard.email, testUsers.standard.password);

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('invalid credentials show error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.invalid.email, testUsers.invalid.password);

    expect(await loginPage.isErrorVisible()).toBeTruthy();
  });
});
```

### Artifact 7: `tests/e2e/regression.spec.ts`

Full feature coverage regression spec template.

```typescript
// tests/e2e/regression.spec.ts
import { test, expect } from './fixtures/auth.fixture';
import { HomePage } from './pages/HomePage';

test.describe('Regression Tests', () => {
  test('authenticated user sees navigation', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);
    await homePage.goto();

    expect(await homePage.isNavigationVisible()).toBeTruthy();
  });

  test('page heading is present', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);
    await homePage.goto();

    const heading = await homePage.getHeadingText();
    expect(heading.length).toBeGreaterThan(0);
  });

  // Add regression tests for each discovered route
  // {{DISCOVERED_ROUTE_TESTS}}
});
```

### Artifact 8: `playwright.config.ts` (updates)

Playwright configuration additions for smoke, regression, and nightly tiers.

```typescript
// Add to existing playwright.config.ts or create new
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'smoke',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'regression',
      testMatch: /regression\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
      },
});
```

### CI Job: `smoke`

```yaml
smoke:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Install Playwright browsers
      run: npx playwright install chromium --with-deps

    - name: Build application
      run: npm run build

    - name: Run smoke tests
      run: npx playwright test --project=smoke
      env:
        BASE_URL: ${{ env.DEPLOY_URL || 'http://localhost:3000' }}

    - name: Upload smoke report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: smoke-report
        path: playwright-report/
```

### CI Job: `regression`

```yaml
regression:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      browser: [chromium, firefox, webkit]
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Install Playwright browsers
      run: npx playwright install --with-deps ${{ matrix.browser }}

    - name: Build application
      run: npm run build

    - name: Run regression tests
      run: npx playwright test --project=${{ matrix.browser }}

    - name: Upload regression report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: regression-report-${{ matrix.browser }}
        path: playwright-report/
```

### CI Job: `nightly`

```yaml
nightly:
  runs-on: ubuntu-latest
  # Trigger via schedule in parent workflow: cron: '0 2 * * *'
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Install all Playwright browsers
      run: npx playwright install --with-deps

    - name: Build application
      run: npm run build

    - name: Run full test suite
      run: npx playwright test

    - name: Upload nightly report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: nightly-report
        path: playwright-report/
```

## Manual Testing Areas

QA automation covers repeatable functional flows but several areas need human judgment:

- **Visual regression** -- Verifying UI appearance, layout, and styling are correct (consider adding Percy or Applitools for automation)
- **Exploratory testing** -- Ad-hoc testing outside scripted paths to discover unexpected behaviors
- **Usability assessment** -- Evaluating whether workflows are intuitive and user-friendly
- **Cross-device testing** -- Physical device testing for responsive design edge cases beyond browser emulation
- **Test data design** -- Creating realistic test datasets that cover edge cases and boundary conditions
- **Flaky test investigation** -- Diagnosing root causes of tests with inconsistent pass/fail results (> 5% failure rate)
- **Page Object maintenance** -- Updating selectors and actions when the UI changes
- **Mobile-specific interactions** -- Swipe, pinch-to-zoom, and gesture-based interactions require real device testing

**Selector Priority (from framework):**

| Priority | Selector Type | Reliability |
|----------|---------------|-------------|
| 1 | `data-testid` | Highest |
| 2 | ID | High |
| 3 | ARIA role/label | Medium-High |
| 4 | CSS class (stable) | Medium |
| 5 | Text content | Low |

**CI Tier Targets (from framework):**

| Tier | Execution Time | Trigger |
|------|---------------|---------|
| Smoke | < 5 minutes | Every deployment |
| Regression | 30-60 minutes | PR merge, nightly |
| Nightly | Full suite | Scheduled 2 AM daily |
