/**
 * Browser connection module for playwright-explorer skill.
 *
 * Provides URL-based and CDP-based connection modes, auto-detection
 * of running dev servers, and structured error reporting with
 * actionable suggestions.
 *
 * @module browser-connection
 * @see Issue #1631 — Story: Browser Connection
 */

'use strict';

const COMMON_PORTS = [3000, 5173, 8080, 4200, 8000, 4000, 3001];

/**
 * Normalize a URL by adding http:// if no protocol is present.
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL with protocol
 */
function normalizeURL(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `http://${url}`;
}

/**
 * Connect to a web app by launching Chromium and navigating to a URL.
 * @param {string} url - Target URL
 * @param {Object} options
 * @param {Function} options.launchFn - Playwright chromium.launch() (injectable)
 * @returns {Promise<{ success: boolean, browser?, page?, url?: string, error?: string, suggestions?: string[] }>}
 */
async function connectToURL(url, options) {
  const { launchFn } = options;
  const normalizedURL = normalizeURL(url);

  try {
    const browser = await launchFn();
    const contexts = browser.contexts();
    const context = contexts.length > 0 ? contexts[0] : await browser.newContext();
    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();

    await page.goto(normalizedURL);

    return {
      success: true,
      browser,
      page,
      url: normalizedURL
    };
  } catch (err) {
    const suggestions = [];

    if (/CONNECTION_REFUSED|ECONNREFUSED/i.test(err.message)) {
      suggestions.push('Check that the dev server is running');
      suggestions.push('Verify the URL and port are correct');
    }

    if (/[Tt]imeout/i.test(err.message)) {
      suggestions.push('The server may still be starting up');
      suggestions.push('Check that the dev server is running on the specified port');
    }

    if (suggestions.length === 0) {
      suggestions.push('Check that the URL is correct and the server is accessible');
    }

    return {
      success: false,
      url: normalizedURL,
      error: err.message,
      suggestions
    };
  }
}

/**
 * Connect to an Electron app via Chrome DevTools Protocol.
 * @param {string} endpoint - CDP endpoint (e.g., 'http://localhost:9222')
 * @param {Object} options
 * @param {Function} options.connectFn - Playwright chromium.connectOverCDP() (injectable)
 * @returns {Promise<{ success: boolean, browser?, page?, error?: string, suggestions?: string[] }>}
 */
async function connectToCDP(endpoint, options) {
  const { connectFn } = options;
  const normalizedEndpoint = normalizeURL(endpoint);

  try {
    const browser = await connectFn(normalizedEndpoint);
    const contexts = browser.contexts();
    const context = contexts[0];
    const pages = context.pages();
    const page = pages[0];

    return {
      success: true,
      browser,
      page
    };
  } catch (err) {
    const suggestions = [];

    if (/ECONNREFUSED/i.test(err.message)) {
      suggestions.push('Electron may not have remote debugging enabled');
      suggestions.push('Start Electron with --remote-debugging-port=9222');
      suggestions.push('Verify the debug port is correct');
    }

    if (/EADDRINUSE/i.test(err.message)) {
      suggestions.push('Port is already in use by a different session');
      suggestions.push('Try a different port or close the existing session');
    }

    if (suggestions.length === 0) {
      suggestions.push('Check that the Electron app is running with remote debugging enabled');
    }

    return {
      success: false,
      error: err.message,
      suggestions
    };
  }
}

/**
 * Auto-detect running dev servers by probing common ports.
 * @param {Object} options
 * @param {Function} options.probeFn - Function to probe a URL (injectable)
 * @returns {Promise<{ found: boolean, url?: string }>}
 */
async function autoDetectServer(options) {
  const { probeFn } = options;

  for (const port of COMMON_PORTS) {
    const url = `http://localhost:${port}`;
    const responding = await probeFn(url);
    if (responding) {
      return { found: true, url };
    }
  }

  return { found: false };
}

module.exports = {
  connectToURL,
  connectToCDP,
  autoDetectServer,
  normalizeURL,
  COMMON_PORTS
};
