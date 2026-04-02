/**
 * DOM reader module for playwright-explorer skill.
 *
 * Extracts visible text, interactive elements, layout structure,
 * computed styles, and test IDs from a live page via page.evaluate().
 * Provides structured human-readable output with graceful error handling.
 *
 * @module dom-reader
 * @see Issue #1632 — Story: DOM Reader
 */

'use strict';

/**
 * Extract all visible text content from the page.
 * Excludes elements that are hidden (offsetParent === null).
 * @param {Object} page - Playwright page object (injectable)
 * @returns {Promise<string>} Visible text content
 */
async function extractVisibleText(page) {
  return page.evaluate((doc) => {
    const elements = doc.querySelectorAll('p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6');
    const texts = [];
    for (const el of elements) {
      if (el.offsetParent !== null && el.textContent.trim()) {
        texts.push(el.textContent.trim());
      }
    }
    return texts.join('\n');
  });
}

/**
 * List all interactive elements: buttons, links, inputs, selects, and ARIA roles.
 * @param {Object} page - Playwright page object (injectable)
 * @returns {Promise<Array<{ tag: string, text?: string, role?: string, type?: string, name?: string, href?: string }>>}
 */
async function inventoryInteractiveElements(page) {
  return page.evaluate((doc) => {
    const elements = doc.querySelectorAll('button, a, input, select, textarea, [role]');
    const inventory = [];
    for (const el of elements) {
      const entry = {
        tag: el.tagName
      };
      if (el.textContent && el.textContent.trim()) {
        entry.text = el.textContent.trim();
      }
      const role = el.getAttribute('role');
      if (role) {
        entry.role = role;
      }
      const type = el.getAttribute('type');
      if (type) {
        entry.type = type;
      }
      const name = el.getAttribute('name');
      if (name) {
        entry.name = name;
      }
      const href = el.getAttribute('href');
      if (href) {
        entry.href = href;
      }
      inventory.push(entry);
    }
    return inventory;
  });
}

/**
 * Extract layout structure: heading hierarchy and landmark roles.
 * @param {Object} page - Playwright page object (injectable)
 * @returns {Promise<{ headings: Array<{ level: number, text: string }>, landmarks: Array<{ tag: string, role?: string }> }>}
 */
async function extractLayoutStructure(page) {
  return page.evaluate((doc) => {
    const headingEls = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headings = [];
    for (const el of headingEls) {
      const level = parseInt(el.tagName.charAt(1), 10);
      headings.push({ level, text: el.textContent.trim() });
    }

    const landmarkEls = doc.querySelectorAll('main, nav, aside, header, footer, section, [role="main"], [role="navigation"], [role="complementary"]');
    const landmarks = [];
    for (const el of landmarkEls) {
      const entry = { tag: el.tagName };
      const role = el.getAttribute('role');
      if (role) {
        entry.role = role;
      }
      landmarks.push(entry);
    }

    return { headings, landmarks };
  });
}

/**
 * Sample computed styles for a target element.
 * @param {Object} page - Playwright page object (injectable)
 * @param {Object} element - Target element handle
 * @returns {Promise<{ visibility: string, display: string, opacity: string, disabled: boolean }>}
 */
async function sampleComputedStyles(page, element) {
  return page.evaluate((el, win) => {
    const styles = win.getComputedStyle(el);
    return {
      visibility: styles.visibility,
      display: styles.display,
      opacity: styles.opacity,
      disabled: !!(el.disabled || el.ariaDisabled === 'true')
    };
  }, element);
}

/**
 * Discover all elements with data-testid attributes.
 * @param {Object} page - Playwright page object (injectable)
 * @returns {Promise<Array<{ tag: string, testId: string }>>}
 */
async function discoverTestIds(page) {
  return page.evaluate((doc) => {
    const elements = doc.querySelectorAll('[data-testid]');
    const testIds = [];
    for (const el of elements) {
      testIds.push({
        tag: el.tagName,
        testId: el.getAttribute('data-testid')
      });
    }
    return testIds;
  });
}

/**
 * Read the full DOM and return structured human-readable text.
 * Orchestrates all extraction functions with graceful error handling.
 * @param {Object} page - Playwright page object (injectable)
 * @returns {Promise<string>} Structured text summary of the page
 */
async function readDOM(page) {
  const sections = [];
  let hasError = false;

  // Extract visible text
  try {
    const text = await extractVisibleText(page);
    if (text) {
      sections.push('--- Visible Text ---');
      sections.push(text);
    } else {
      sections.push('--- Visible Text ---');
      sections.push('(no visible text)');
    }
  } catch (err) {
    hasError = true;
    sections.push('--- Visible Text ---');
    sections.push(`(error: ${err.message})`);
  }

  // Extract interactive elements
  try {
    const elements = await inventoryInteractiveElements(page);
    sections.push('--- Interactive Elements ---');
    if (elements.length > 0) {
      for (const el of elements) {
        const parts = [el.tag];
        if (el.role) parts.push(`role="${el.role}"`);
        if (el.text) parts.push(`"${el.text}"`);
        if (el.type) parts.push(`type=${el.type}`);
        if (el.name) parts.push(`name=${el.name}`);
        if (el.href) parts.push(`href=${el.href}`);
        sections.push(`  ${parts.join(' ')}`);
      }
    } else {
      sections.push('(none)');
    }
  } catch (err) {
    hasError = true;
    sections.push('--- Interactive Elements ---');
    sections.push(`(error: ${err.message})`);
  }

  // Extract layout structure
  try {
    const layout = await extractLayoutStructure(page);
    sections.push('--- Layout Structure ---');
    if (layout.headings.length > 0) {
      sections.push('Headings:');
      for (const h of layout.headings) {
        sections.push(`  ${'  '.repeat(h.level - 1)}H${h.level}: ${h.text}`);
      }
    }
    if (layout.landmarks.length > 0) {
      sections.push('Landmarks:');
      for (const l of layout.landmarks) {
        const label = l.role ? `${l.tag} (role="${l.role}")` : l.tag;
        sections.push(`  ${label}`);
      }
    }
    if (layout.headings.length === 0 && layout.landmarks.length === 0) {
      sections.push('(no headings or landmarks)');
    }
  } catch (err) {
    hasError = true;
    sections.push('--- Layout Structure ---');
    sections.push(`(error: ${err.message})`);
  }

  // Discover test IDs
  try {
    const testIds = await discoverTestIds(page);
    sections.push('--- Test IDs ---');
    if (testIds.length > 0) {
      for (const t of testIds) {
        sections.push(`  ${t.tag} [data-testid="${t.testId}"]`);
      }
    } else {
      sections.push('(none)');
    }
  } catch (err) {
    hasError = true;
    sections.push('--- Test IDs ---');
    sections.push(`(error: ${err.message})`);
  }

  if (hasError) {
    sections.unshift('(partial result — error during DOM read)');
  }

  return sections.join('\n');
}

module.exports = {
  extractVisibleText,
  inventoryInteractiveElements,
  extractLayoutStructure,
  sampleComputedStyles,
  discoverTestIds,
  readDOM
};
