# Electron Multi-Screen Navigation Pattern

## Problem

Simple Electron apps need navigation between screens without the complexity of a router library.

## Solution

Use CSS class toggling with screen state tracking for single-window apps with 2-5 screens.

## Pattern

### HTML Structure

```html
<!-- Each screen is a <main> element -->
<main id="setup-wizard" class="hidden">...</main>
<main id="main-screen" class="hidden">...</main>
<main id="settings-screen" class="hidden">...</main>
```

### CSS

```css
.hidden {
  display: none !important;
}
```

### TypeScript Navigation

```typescript
// Track previous screen for "back" navigation
let previousScreen: 'wizard' | 'main' = 'main';

function showSetupWizard(): void {
  setupWizard.classList.remove('hidden');
  mainScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  previousScreen = 'wizard';
}

function showMainScreen(): void {
  setupWizard.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  settingsScreen.classList.add('hidden');
  previousScreen = 'main';
}

function showSettingsScreen(): void {
  setupWizard.classList.add('hidden');
  mainScreen.classList.add('hidden');
  settingsScreen.classList.remove('hidden');
  // Don't update previousScreen - settings is a modal-like overlay
}

function handleCancel(): void {
  if (previousScreen === 'wizard') {
    showSetupWizard();
  } else {
    showMainScreen();
  }
}
```

## Rationale

- **Simple:** No router library needed for basic navigation
- **Fast:** No DOM manipulation, just CSS class changes
- **Testable:** E2E tests can check visibility with `toBeVisible()`/`toBeHidden()`
- **Accessible:** Screen readers handle display:none correctly

## When to Use

- Single-window apps with 2-5 screens
- Linear or simple branching flows
- No need for URL-based routing or deep linking

## When to Consider Alternatives

- Complex navigation with many screens → Consider a router
- Need browser history/back button → Use hash-based routing
- Deep linking requirements → Use proper routing library

## E2E Test Pattern

```typescript
test('settings screen opens and closes', async () => {
  // Click settings button
  await window.locator('#settings-button').click();

  // Settings screen visible
  await expect(window.locator('#settings-screen')).toBeVisible();
  await expect(window.locator('#main-screen')).toBeHidden();

  // Click cancel
  await window.locator('#cancel-button').click();

  // Back to main screen
  await expect(window.locator('#main-screen')).toBeVisible();
  await expect(window.locator('#settings-screen')).toBeHidden();
});
```

## Consequences

- All screens exist in DOM at all times (memory consideration for many screens)
- No URL changes (can't bookmark specific screens)
- State must be manually loaded when showing screens
