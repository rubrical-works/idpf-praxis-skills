/**
 * Error recovery module for playwright-explorer skill.
 *
 * Handles target app crashes, action timeouts, orphaned process
 * cleanup, connection loss recovery, and ensures all error states
 * clean up temp files and browser processes.
 *
 * @module error-recovery
 * @see Issue #1635 — Story: Error Recovery
 */

'use strict';

const NAVIGATION_TIMEOUT = 30000;
const ELEMENT_TIMEOUT = 10000;
const FILE_PREFIX = '.tmp-pw-';

const NAVIGATION_ACTIONS = ['goto', 'goBack'];

/**
 * Handle a page crash or close event.
 * @param {Object} event - Crash event details
 * @param {string} event.reason - 'close' or 'error'
 * @param {string} [event.error] - Error message if reason is 'error'
 * @returns {{ crashed: boolean, message: string, requiresCleanup: boolean }}
 */
function handlePageCrash(event) {
  const { reason, error } = event;

  if (reason === 'close') {
    return {
      crashed: true,
      message: 'Target app disconnected. Session ended.',
      requiresCleanup: true
    };
  }

  if (reason === 'error') {
    return {
      crashed: true,
      message: `Target app crashed: ${error || 'unknown error'}. Session ended.`,
      requiresCleanup: true
    };
  }

  return {
    crashed: true,
    message: 'Target app disconnected unexpectedly. Session ended.',
    requiresCleanup: true
  };
}

/**
 * Wrap an async action with a timeout.
 * @param {Function} actionFn - Async function to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} actionName - Human-readable action description for error messages
 * @returns {Promise<*>} Result of the action
 * @throws {Error} If action exceeds timeout
 */
function withTimeout(actionFn, timeoutMs, actionName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Action "${actionName}" timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    actionFn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Get the appropriate timeout for an action type.
 * @param {string} action - Action type (goto, goBack, click, fill, etc.)
 * @returns {number} Timeout in milliseconds
 */
function getActionTimeout(action) {
  if (NAVIGATION_ACTIONS.includes(action)) {
    return NAVIGATION_TIMEOUT;
  }
  return ELEMENT_TIMEOUT;
}

/**
 * Force cleanup of a session: kill process, close browser, remove temp files.
 * @param {Object|null} session - Session object
 * @param {Object} options
 * @param {Function} options.killFn - Function to kill process (injectable)
 * @param {Object} options.fs - File system module (injectable)
 * @param {string} options.dir - Directory for temp files
 * @returns {Promise<{ processKilled: boolean, filesRemoved: number, error?: string }>}
 */
async function forceCleanup(session, options) {
  const { killFn, fs, dir } = options;
  let processKilled = false;
  let filesRemoved = 0;
  let error = null;

  // Kill browser process
  if (session && session.pid) {
    try {
      killFn(session.pid);
      processKilled = true;
    } catch (err) {
      error = err.message;
    }
  }

  // Try to close browser gracefully
  if (session && session.browser) {
    try {
      await session.browser.close();
    } catch (_) {
      // Browser may already be dead
    }
  }

  // Remove temp files
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith(FILE_PREFIX)) {
        try {
          fs.unlinkSync(`${dir}/${file}`);
          filesRemoved++;
        } catch (_) {
          // File may be locked or already removed
        }
      }
    }
  } catch (_) {
    // Directory may not exist
  }

  return { processKilled, filesRemoved, ...(error ? { error } : {}) };
}

/**
 * Handle connection loss detected by health check.
 * @param {Object} healthStatus - Result from healthCheck()
 * @param {boolean} healthStatus.alive - Whether browser is alive
 * @param {number} [healthStatus.pid] - Process ID
 * @returns {{ disconnected: boolean, canReconnect: boolean, message: string, suggestions: string[] }}
 */
function handleConnectionLoss(healthStatus) {
  if (healthStatus.alive) {
    return {
      disconnected: false,
      canReconnect: false,
      message: 'Browser connection is active.',
      suggestions: []
    };
  }

  return {
    disconnected: true,
    canReconnect: true,
    message: `Browser connection lost (PID: ${healthStatus.pid || 'unknown'}).`,
    suggestions: [
      'Reconnect to the same URL with a new session',
      'Check if the target app is still running',
      'Start a new exploration session'
    ]
  };
}

/**
 * Clean up resources after an error occurs.
 * Handles errors during cleanup gracefully (no recursive throws).
 * @param {Error} originalError - The error that triggered cleanup
 * @param {Object|null} session - Session object
 * @param {Object} options
 * @param {Object} options.fs - File system module (injectable)
 * @param {string} options.dir - Directory for temp files
 * @returns {Promise<{ cleanedUp: boolean, cleanupError?: string }>}
 */
async function cleanupOnError(originalError, session, options) {
  const { fs, dir } = options;

  try {
    // Close browser
    if (session && session.browser) {
      await session.browser.close();
    }

    // Remove temp files
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith(FILE_PREFIX)) {
        fs.unlinkSync(`${dir}/${file}`);
      }
    }

    return { cleanedUp: true };
  } catch (cleanupErr) {
    // Error during error cleanup — swallow to prevent recursive failure
    return {
      cleanedUp: false,
      cleanupError: cleanupErr.message
    };
  }
}

module.exports = {
  handlePageCrash,
  withTimeout,
  getActionTimeout,
  forceCleanup,
  handleConnectionLoss,
  cleanupOnError,
  NAVIGATION_TIMEOUT,
  ELEMENT_TIMEOUT,
  FILE_PREFIX
};
