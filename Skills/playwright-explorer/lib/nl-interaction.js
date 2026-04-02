/**
 * Natural language interaction module for playwright-explorer skill.
 *
 * Provides priority-based selector resolution (data-testid > ARIA role >
 * visible text > CSS) and action execution mapped to Playwright API calls.
 * Reports selector strategy used and provides partial match suggestions
 * on resolution failure.
 *
 * @module nl-interaction
 * @see Issue #1633 — Story: Natural Language Interaction
 */

'use strict';

/**
 * Escape a value for safe use in a CSS attribute selector.
 * Prevents selector injection when values contain quotes or brackets.
 * @param {string} value
 * @returns {string} Escaped value safe for [attr="value"] selectors
 */
function cssEscapeAttr(value) {
  return String(value).replace(/[\\"'\]]/g, '\\$&');
}

const SUPPORTED_ACTIONS = ['click', 'fill', 'type', 'goto', 'goBack', 'waitForSelector'];

/**
 * Execute an action on the page.
 * @param {Object} page - Playwright page object (injectable)
 * @param {Object} intent - Parsed action intent
 * @param {string} intent.action - Action type (click, fill, goto, goBack, waitForSelector)
 * @param {string} [intent.selector] - CSS selector for the target element
 * @param {string} [intent.value] - Value for fill/goto actions
 * @returns {Promise<{ success: boolean, report?: string, domSummary?: string, error?: string }>}
 */
async function executeAction(page, intent) {
  const { action, selector, value } = intent;

  if (!SUPPORTED_ACTIONS.includes(action)) {
    return {
      success: false,
      error: `Unsupported action: "${action}". Supported: ${SUPPORTED_ACTIONS.join(', ')}`
    };
  }

  try {
    let report = '';

    switch (action) {
      case 'click':
        await page.click(selector);
        report = `Clicked "${selector}"`;
        break;

      case 'fill':
      case 'type':
        await page.fill(selector, value);
        report = `Filled "${selector}" with "${value}"`;
        break;

      case 'goto':
        await page.goto(value);
        report = `Navigated to "${value}"`;
        break;

      case 'goBack':
        await page.goBack();
        report = 'Navigated back';
        break;

      case 'waitForSelector':
        await page.waitForSelector(selector);
        report = `Waited for "${selector}"`;
        break;
    }

    // Post-action DOM re-read
    let domSummary = null;
    try {
      domSummary = await page.evaluate(() => 'DOM re-read');
    } catch (_) {
      // DOM re-read failure is non-blocking
    }

    return {
      success: true,
      report,
      domSummary
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Resolve a natural language description to a selector using priority-based strategy.
 * Priority: data-testid > ARIA role + accessible name > visible text > CSS selector
 * @param {Object} page - Playwright page object (injectable)
 * @param {string} description - Natural language description of the target element
 * @returns {Promise<{ found: boolean, selector?: string, strategy?: string, error?: string, triedStrategies?: string[], partialMatches?: Array }>}
 */
async function resolveSelector(page, description) {
  const triedStrategies = [];
  const partialMatches = [];
  const descLower = description.toLowerCase();

  // Strategy 1: data-testid match
  triedStrategies.push('data-testid');
  try {
    const testIdResult = await page.evaluate((doc) => {
      const elements = doc.querySelectorAll('[data-testid]');
      return Array.from(elements).map(el => ({
        testId: el.getAttribute('data-testid'),
        tag: el.tagName,
        text: el.textContent ? el.textContent.trim() : ''
      }));
    });

    for (const item of testIdResult) {
      const testIdLower = item.testId.toLowerCase();
      // Normalize separators: convert hyphens/underscores to spaces for comparison
      const testIdNormalized = testIdLower.replace(/[-_]/g, ' ');
      const descNormalized = descLower.replace(/[-_]/g, ' ');
      if (testIdLower.includes(descLower) ||
          descLower.includes(testIdLower) ||
          testIdNormalized.includes(descNormalized) ||
          descNormalized.includes(testIdNormalized)) {
        return {
          found: true,
          selector: `[data-testid="${cssEscapeAttr(item.testId)}"]`,
          strategy: 'data-testid'
        };
      }
      // Collect as partial match for failure reporting
      partialMatches.push({
        selector: `[data-testid="${cssEscapeAttr(item.testId)}"]`,
        text: item.text,
        strategy: 'data-testid'
      });
    }
  } catch (_) {
    // Strategy failed, continue to next
  }

  // Strategy 2: ARIA role + accessible name
  triedStrategies.push('role');
  try {
    const roleResult = await page.evaluate((doc) => {
      const elements = doc.querySelectorAll('[role]');
      return Array.from(elements).map(el => ({
        role: el.getAttribute('role'),
        label: el.getAttribute('aria-label') || '',
        tag: el.tagName,
        text: el.textContent ? el.textContent.trim() : ''
      }));
    });

    for (const item of roleResult) {
      const roleMatch = descLower.includes(item.role);
      const labelMatch = item.label && descLower.includes(item.label.toLowerCase());
      const textMatch = item.text && descLower.includes(item.text.toLowerCase());
      if (roleMatch || labelMatch || textMatch) {
        const selectorParts = [`[role="${cssEscapeAttr(item.role)}"]`];
        if (item.label) selectorParts.push(`[aria-label="${cssEscapeAttr(item.label)}"]`);
        return {
          found: true,
          selector: selectorParts.join(''),
          strategy: 'role'
        };
      }
    }
  } catch (_) {
    // Strategy failed, continue to next
  }

  // Strategy 3: Visible text match
  triedStrategies.push('text');
  try {
    const textResult = await page.evaluate((doc) => {
      const elements = doc.querySelectorAll('button, a, input, select, textarea, label, span');
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        text: el.textContent ? el.textContent.trim() : '',
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || ''
      }));
    });

    for (const item of textResult) {
      if (item.text && item.text.toLowerCase() === descLower) {
        return {
          found: true,
          selector: `${item.tag.toLowerCase()}:text("${item.text}")`,
          strategy: 'text'
        };
      }
    }

    // Collect text elements as partial matches
    for (const item of textResult) {
      if (item.text) {
        partialMatches.push({
          selector: `${item.tag.toLowerCase()}`,
          text: item.text,
          strategy: 'text'
        });
      }
    }
  } catch (_) {
    // Strategy failed, continue to next
  }

  // Strategy 4: CSS selector (try description as literal CSS selector)
  triedStrategies.push('css');
  try {
    const cssResult = await page.evaluate((doc) => {
      const el = doc.querySelector(description);
      if (el) return { tag: el.tagName };
      return null;
    });

    if (cssResult) {
      return {
        found: true,
        selector: description,
        strategy: 'css'
      };
    }
  } catch (_) {
    // Not a valid CSS selector or strategy failed
  }

  // Nothing matched
  return {
    found: false,
    error: `Could not find element matching "${description}". Tried: ${triedStrategies.join(', ')}.`,
    triedStrategies,
    partialMatches: partialMatches.slice(0, 5) // Limit to 5 suggestions
  };
}

module.exports = {
  executeAction,
  resolveSelector,
  SUPPORTED_ACTIONS
};
