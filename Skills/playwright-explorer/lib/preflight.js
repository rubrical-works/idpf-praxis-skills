/**
 * Pre-flight verification gate for playwright-explorer skill.
 *
 * Orchestrates the detect → install → re-verify pipeline.
 * Ties together detect-components (#1628) and auto-install (#1629)
 * into a single preflight check that gates session startup.
 *
 * @module preflight
 * @see Issue #1630 — Story: Pre-Flight Verification Gate
 */

'use strict';

/**
 * Run all component detection checks and return readiness status.
 * @param {Object} detectors - Map of detector functions
 * @param {Function} detectors.nodeVersion - Returns Node.js status
 * @param {Function} detectors.playwright - Returns Playwright status
 * @param {Function} detectors.chromium - Returns Chromium status
 * @param {Function} detectors.systemDeps - Returns system deps status
 * @param {Function} detectors.staleBrowser - Returns browser version status
 * @returns {{ ready: boolean, components: Array, failures: Array }}
 */
function verifyAll(detectors) {
  const components = [
    detectors.nodeVersion(),
    detectors.playwright(),
    detectors.chromium(),
    detectors.systemDeps(),
    detectors.staleBrowser()
  ];

  const failures = components.filter(c => {
    if (c.skipped) return false;
    if (c.installed === false) return true;
    if (c.stale === true) return true;
    return false;
  }).map(c => ({
    component: c.component,
    error: c.error || `${c.component} is not ready`,
    missingDeps: c.missingDeps
  }));

  return {
    ready: failures.length === 0,
    components,
    failures
  };
}

/**
 * Run the full pre-flight orchestration: detect → install → re-verify.
 * @param {Object} options
 * @param {Object} options.detectors - Map of detector functions
 * @param {Object} options.installers - Map of installer functions
 * @param {string} options.platform - OS platform
 * @param {Function} [options.playwrightCheckFn] - Optional /playwright-check delegate
 * @returns {{ ready: boolean, components?: Array, failures?: Array, blockers?: Array, installed: Array, delegated?: boolean }}
 */
function runPreflight(options) {
  const { detectors, installers, platform, playwrightCheckFn } = options;

  // Delegate to /playwright-check if available
  if (playwrightCheckFn) {
    const checkResult = playwrightCheckFn();
    return {
      ready: checkResult.ready,
      components: checkResult.components || [],
      failures: [],
      installed: [],
      delegated: true
    };
  }

  // Phase 1: Initial detection
  const initialResult = verifyAll(detectors);
  const installed = [];

  // If all pass on first check, return immediately
  if (initialResult.ready) {
    return {
      ready: true,
      components: initialResult.components,
      failures: [],
      installed,
      blockers: []
    };
  }

  // Separate blockers (Node.js — cannot auto-install) from fixable failures
  const blockers = initialResult.failures.filter(f => f.component === 'Node.js');
  const fixable = initialResult.failures.filter(f => f.component !== 'Node.js');

  // If there are blockers, stop immediately
  if (blockers.length > 0) {
    return {
      ready: false,
      components: initialResult.components,
      failures: initialResult.failures,
      installed,
      blockers
    };
  }

  // Phase 2: Install missing components
  for (const failure of fixable) {
    if (failure.component === 'Playwright' && installers.package) {
      const result = installers.package('@playwright/test');
      if (result.success) {
        installed.push({ component: 'Playwright', command: result.command });
      }
    }

    if (failure.component === 'Chromium' && installers.browser) {
      const result = installers.browser({ force: false });
      if (result.success) {
        installed.push({ component: 'Chromium', command: result.command });
      }
    }

    if (failure.component === 'Browser Version' && installers.browser) {
      const result = installers.browser({ force: true });
      if (result.success) {
        installed.push({ component: 'Browser Version', command: result.command });
      }
    }

    if (failure.component === 'System Dependencies' && installers.systemDeps) {
      const result = installers.systemDeps(platform);
      if (result.success) {
        installed.push({ component: 'System Dependencies', command: result.command });
      }
    }
  }

  // Phase 3: Re-verify after installation
  const reVerifyResult = verifyAll(detectors);

  return {
    ready: reVerifyResult.ready,
    components: reVerifyResult.components,
    failures: reVerifyResult.failures,
    installed,
    blockers: []
  };
}

module.exports = {
  verifyAll,
  runPreflight
};
