/**
 * Component detection module for playwright-explorer skill.
 *
 * Detects Node.js version, Playwright package, Chromium browser,
 * system dependencies, and stale browser binaries. Returns standardized
 * status objects for each component.
 *
 * @module detect-components
 * @see Issue #1628 — Story: Component Detection
 */

'use strict';

const MIN_NODE_VERSION = 18;

/**
 * Detect and validate Node.js version.
 * @param {string} versionString - Version string (e.g., 'v18.0.0' or '18.0.0')
 * @returns {{ component: string, installed: boolean, version?: string, error?: string }}
 */
function detectNodeVersion(versionString) {
  if (!versionString) {
    return {
      component: 'Node.js',
      installed: false,
      error: `Node.js version could not be determined. Version ${MIN_NODE_VERSION}+ required.`
    };
  }

  const cleaned = versionString.replace(/^v/, '');
  const major = parseInt(cleaned.split('.')[0], 10);

  if (isNaN(major)) {
    return {
      component: 'Node.js',
      installed: false,
      error: `Invalid Node.js version: "${versionString}". Version ${MIN_NODE_VERSION}+ required.`
    };
  }

  if (major < MIN_NODE_VERSION) {
    return {
      component: 'Node.js',
      installed: false,
      version: cleaned,
      error: `Node.js ${cleaned} is below minimum version ${MIN_NODE_VERSION}. Please download Node.js ${MIN_NODE_VERSION}+ from https://nodejs.org/`
    };
  }

  return {
    component: 'Node.js',
    installed: true,
    version: cleaned
  };
}

/**
 * Detect Playwright package installation.
 * @param {Function} resolveFn - A function that attempts to resolve the playwright module path (injectable for testing)
 * @returns {{ component: string, installed: boolean, error?: string }}
 */
function detectPlaywright(resolveFn) {
  try {
    resolveFn('playwright');
    return {
      component: 'Playwright',
      installed: true
    };
  } catch (err) {
    return {
      component: 'Playwright',
      installed: false,
      error: err.code === 'MODULE_NOT_FOUND'
        ? 'Playwright package not installed. Run: npm install -D @playwright/test'
        : `Playwright detection failed: ${err.message}`
    };
  }
}

/**
 * Detect Chromium browser installation from dry-run output.
 * @param {string} dryRunOutput - Output from `npx playwright install --dry-run`
 * @returns {{ component: string, installed: boolean, version?: string }}
 */
function detectChromium(dryRunOutput) {
  if (!dryRunOutput) {
    return { component: 'Chromium', installed: false };
  }

  const chromiumLine = dryRunOutput
    .split('\n')
    .find(line => /chromium/i.test(line));

  if (!chromiumLine) {
    return { component: 'Chromium', installed: false };
  }

  if (/not installed/i.test(chromiumLine)) {
    return { component: 'Chromium', installed: false };
  }

  const versionMatch = chromiumLine.match(/chromium\s+([\d.]+)/i);
  return {
    component: 'Chromium',
    installed: true,
    version: versionMatch ? versionMatch[1] : undefined
  };
}

/**
 * Detect system dependencies (Linux only).
 * @param {string} platform - OS platform (e.g., 'linux', 'win32', 'darwin')
 * @param {string} depsOutput - Output from `npx playwright install-deps --dry-run`
 * @returns {{ component: string, installed?: boolean, skipped?: boolean, missingDeps?: string[] }}
 */
function detectSystemDeps(platform, depsOutput) {
  if (platform !== 'linux') {
    return {
      component: 'System Dependencies',
      skipped: true
    };
  }

  if (/all dependencies are satisfied/i.test(depsOutput)) {
    return {
      component: 'System Dependencies',
      installed: true
    };
  }

  const missingMatch = depsOutput.match(/missing:\s*(.+)/i);
  const missingDeps = missingMatch
    ? missingMatch[1].trim().split(/\s+/)
    : [];

  return {
    component: 'System Dependencies',
    installed: false,
    missingDeps
  };
}

/**
 * Detect stale browser binaries (version mismatch).
 * @param {string} packageVersion - Installed Playwright package version
 * @param {string|null} browserVersion - Installed browser revision/version
 * @returns {{ component: string, stale: boolean }}
 */
function detectStaleBrowser(packageVersion, browserVersion) {
  if (!browserVersion || packageVersion !== browserVersion) {
    return {
      component: 'Browser Version',
      stale: true
    };
  }

  return {
    component: 'Browser Version',
    stale: false
  };
}

/**
 * Format component status array into human-readable summary.
 * @param {Array} components - Array of component status objects
 * @returns {string} Formatted status summary
 */
function formatStatusSummary(components) {
  return components.map(c => {
    if (c.skipped) {
      return `  - ${c.component}: skipped (not applicable)`;
    }
    if (c.installed === true) {
      const ver = c.version ? ` ${c.version}` : '';
      return `  ✓ ${c.component}${ver}`;
    }
    return `  ✗ ${c.component}: not installed`;
  }).join('\n');
}

module.exports = {
  detectNodeVersion,
  detectPlaywright,
  detectChromium,
  detectSystemDeps,
  detectStaleBrowser,
  formatStatusSummary,
  MIN_NODE_VERSION
};
