/**
 * Session lifecycle module for playwright-explorer skill.
 *
 * Manages background Playwright process persistence, file-based IPC
 * for command/result exchange, health checks, disconnect cleanup,
 * and orphaned process/file detection.
 *
 * @module session-lifecycle
 * @see Issue #1634 — Story: Session Lifecycle
 */

'use strict';

const CMD_FILE = '.tmp-pw-cmd.json';
const RESULT_FILE = '.tmp-pw-result.json';
const FILE_PREFIX = '.tmp-pw-';

/**
 * Write a command to the IPC command file.
 * @param {Object} payload - Command payload (action, selector, value, etc.)
 * @param {Object} options
 * @param {Object} options.fs - File system module (injectable)
 * @param {string} options.dir - Directory for IPC files
 */
function writeCommand(payload, options) {
  const { fs, dir } = options;
  const filePath = `${dir}/${CMD_FILE}`;
  const data = {
    ...payload,
    timestamp: Date.now()
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Read and consume the result from the IPC result file.
 * Removes the file after reading.
 * @param {Object} options
 * @param {Object} options.fs - File system module (injectable)
 * @param {string} options.dir - Directory for IPC files
 * @returns {Object|null} Parsed result or null if no result file exists
 */
function readResult(options) {
  const { fs, dir } = options;
  const filePath = `${dir}/${RESULT_FILE}`;

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const result = JSON.parse(content);
  fs.unlinkSync(filePath);
  return result;
}

/**
 * Check if the background browser process is still alive.
 * @param {Object|null} session - Session object with pid and process
 * @param {Object} options
 * @param {Function} options.killFn - Function to check process (injectable, like process.kill(pid, 0))
 * @returns {{ alive: boolean, pid?: number }}
 */
function healthCheck(session, options) {
  if (!session) {
    return { alive: false };
  }

  const { killFn } = options;

  if (session.process && session.process.killed) {
    return { alive: false, pid: session.pid };
  }

  try {
    killFn(session.pid, 0);
    return { alive: true, pid: session.pid };
  } catch (_) {
    return { alive: false, pid: session.pid };
  }
}

/**
 * Disconnect the session: close browser and remove all temp files.
 * @param {Object} session - Session object with browser and process
 * @param {Object} options
 * @param {Object} options.fs - File system module (injectable)
 * @param {string} options.dir - Directory for IPC files
 * @returns {Promise<{ closed: boolean, filesRemoved: number }>}
 */
async function disconnect(session, options) {
  const { fs, dir } = options;
  let closed = false;

  // Close browser
  try {
    if (session && session.browser) {
      await session.browser.close();
      closed = true;
    }
  } catch (_) {
    // Browser may already be closed
    closed = true;
  }

  // Remove temp files
  let filesRemoved = 0;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith(FILE_PREFIX)) {
        fs.unlinkSync(`${dir}/${file}`);
        filesRemoved++;
      }
    }
  } catch (_) {
    // Directory may not exist
  }

  return { closed, filesRemoved };
}

/**
 * Clean up orphaned .tmp-pw-*.json files from previous sessions.
 * @param {Object} options
 * @param {Object} options.fs - File system module (injectable)
 * @param {string} options.dir - Directory to scan
 * @returns {{ cleaned: number, error?: string, errors?: Array }}
 */
function cleanupOrphans(options) {
  const { fs, dir } = options;
  let cleaned = 0;
  const errors = [];

  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith(FILE_PREFIX)) {
        try {
          fs.unlinkSync(`${dir}/${file}`);
          cleaned++;
        } catch (err) {
          errors.push({ file, error: err.message });
        }
      }
    }
  } catch (err) {
    return { cleaned: 0, error: err.message };
  }

  if (errors.length > 0) {
    return { cleaned, errors };
  }

  return { cleaned };
}

/**
 * Create a new exploration session with browser and page.
 * Cleans up orphans before launching.
 * @param {Object} options
 * @param {Function} options.launchFn - Playwright chromium.launch() (injectable)
 * @param {Object} options.fs - File system module (injectable)
 * @param {string} options.dir - Directory for IPC files
 * @returns {Promise<{ browser: Object, page: Object, pid: number }>}
 */
async function createSession(options) {
  const { launchFn, fs, dir } = options;

  // Clean up orphans from previous sessions
  cleanupOrphans({ fs, dir });

  // Launch browser
  const browser = await launchFn();
  const contexts = browser.contexts();
  const context = contexts.length > 0 ? contexts[0] : await browser.newContext();
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  const pid = browser.process ? browser.process().pid : 0;

  return {
    browser,
    page,
    pid,
    process: browser.process ? browser.process() : null
  };
}

module.exports = {
  writeCommand,
  readResult,
  healthCheck,
  disconnect,
  cleanupOrphans,
  createSession,
  CMD_FILE,
  RESULT_FILE,
  FILE_PREFIX
};
