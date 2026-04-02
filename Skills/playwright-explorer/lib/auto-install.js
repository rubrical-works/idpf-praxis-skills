/**
 * Auto-installation module for playwright-explorer skill.
 *
 * Provides installation wrapper functions for missing Playwright
 * components: packages, browsers, and system dependencies. Package
 * installation requires explicit user confirmation; browser and
 * system dep installs proceed automatically.
 *
 * @module auto-install
 * @see Issue #1629 — Story: Auto-Installation Flow
 */

'use strict';

/**
 * Install a missing npm package with user confirmation gate.
 * @param {string} packageName - Package to install (e.g., '@playwright/test')
 * @param {Object} options
 * @param {boolean} options.confirmed - Whether user confirmed the install
 * @param {Function} options.execFn - Function to execute shell commands (injectable for testing)
 * @returns {{ success: boolean, command?: string, cancelled?: boolean, error?: string }}
 */
function installPackage(packageName, options) {
  const { confirmed, execFn } = options;
  const command = `npm install -D ${packageName}`;

  if (!confirmed) {
    return {
      success: false,
      cancelled: true,
      command
    };
  }

  try {
    execFn(command);
    return {
      success: true,
      command
    };
  } catch (err) {
    return {
      success: false,
      command,
      error: err.message
    };
  }
}

/**
 * Install Chromium browser. Proceeds without confirmation.
 * @param {Object} options
 * @param {Function} options.execFn - Function to execute shell commands (injectable for testing)
 * @param {boolean} [options.force=false] - Force reinstall (for stale browsers)
 * @returns {{ success: boolean, command?: string, error?: string }}
 */
function installBrowser(options) {
  const { execFn, force } = options;
  const command = force
    ? 'npx playwright install chromium --force'
    : 'npx playwright install chromium';

  try {
    execFn(command);
    return {
      success: true,
      command
    };
  } catch (err) {
    return {
      success: false,
      command,
      error: err.message
    };
  }
}

/**
 * Install system dependencies (Linux only).
 * @param {string} platform - OS platform (e.g., 'linux', 'win32', 'darwin')
 * @param {Object} options
 * @param {Function} options.execFn - Function to execute shell commands (injectable for testing)
 * @returns {{ success?: boolean, skipped?: boolean, command?: string, error?: string }}
 */
function installSystemDeps(platform, options) {
  if (platform !== 'linux') {
    return { skipped: true };
  }

  const { execFn } = options;
  const command = 'npx playwright install-deps';

  try {
    execFn(command);
    return {
      success: true,
      command
    };
  } catch (err) {
    return {
      success: false,
      command,
      error: err.message
    };
  }
}

/**
 * Generate an install plan from component detection results.
 * @param {Array} components - Array of component status objects from detect-components
 * @returns {{ ready: boolean, steps: Array, blockers?: Array }}
 */
function getInstallPlan(components) {
  const steps = [];
  const blockers = [];

  for (const c of components) {
    if (c.component === 'Node.js' && c.installed === false) {
      blockers.push({
        component: c.component,
        error: c.error || 'Node.js upgrade required'
      });
      continue;
    }

    if (c.component === 'Playwright' && c.installed === false) {
      steps.push({
        type: 'package',
        package: '@playwright/test',
        command: 'npm install -D @playwright/test',
        requiresConfirmation: true
      });
      continue;
    }

    if (c.component === 'Chromium' && c.installed === false) {
      steps.push({
        type: 'browser',
        command: 'npx playwright install chromium',
        requiresConfirmation: false,
        force: false
      });
      continue;
    }

    if (c.component === 'Browser Version' && c.stale === true) {
      steps.push({
        type: 'browser',
        command: 'npx playwright install chromium --force',
        requiresConfirmation: false,
        force: true
      });
      continue;
    }

    if (c.component === 'System Dependencies' && c.installed === false) {
      steps.push({
        type: 'system-deps',
        command: 'npx playwright install-deps',
        requiresConfirmation: false,
        missingDeps: c.missingDeps || []
      });
      continue;
    }
  }

  return {
    ready: steps.length === 0 && blockers.length === 0,
    steps,
    blockers
  };
}

module.exports = {
  installPackage,
  installBrowser,
  installSystemDeps,
  getInstallPlan
};
