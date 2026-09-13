#!/usr/bin/env node
/**
 * Electron Error Capture Session (electron-error-capture skill, #27).
 *
 * Launches the target Electron app headed via Playwright, attaches the five
 * listener channels, and records everything that arrives while a human drives
 * the app by hand. On exit it writes a timestamped report directory.
 *
 * Usage:
 *   node capture-session.mjs [--entry <main.js>] [--bin <electron>]
 *                            [--screenshots|--no-screenshots] [--warnings]
 *                            [--output <dir>] [--timeout <ms>]
 *                            [--args <app args...>]
 *
 * Press Ctrl+C, or close the app window, to stop and generate the report.
 *
 * THIS FILE IS THE SHELL, NOT THE LOGIC. Flag parsing, classification and
 * report rendering live in `../lib/capture-core.js` so they can be tested
 * without Electron, Playwright, or a person at the keyboard. Keep decisions
 * there; keep I/O here.
 *
 * EVERYTHING IS RESOLVED FROM THE TARGET PROJECT, never from this skill's own
 * directory. The skill is installed under `.claude/skills/`, which has no
 * `node_modules` of its own — resolving from here would find nothing, or worse,
 * find the framework repository's copy of Playwright rather than the app's.
 */
import { createRequire } from 'node:module';
import { resolve, join, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

import core from '../lib/capture-core.js';

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = join(SKILL_DIR, 'resources', 'electron-error-capture.config.json');

const cwd = process.cwd();

/**
 * Step 0 — re-read the config from disk (External-Orchestration Config
 * Pattern). Every default below comes from the parsed object; none is
 * duplicated in this file.
 */
const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));

/**
 * Resolution anchored at the target project. `createRequire` needs a file to
 * resolve relative to; the path need not exist, only locate the directory.
 */
const requireFromProject = createRequire(join(cwd, 'noop.js'));

/**
 * Prerequisite check — this skill installs nothing.
 *
 * Reported and stopped rather than repaired: installing a browser runtime as a
 * side effect of asking for an error report is a surprise, and `playwright-setup`
 * already owns that job, including the platform cases this harness does not know.
 */
function requirePlaywright() {
  try {
    return requireFromProject('@playwright/test');
  } catch {
    console.error('electron-error-capture: @playwright/test does not resolve from ' + cwd + '.');
    console.error('This skill installs nothing. Run the `playwright-setup` skill in this project first, then re-run.');
    process.exit(1);
  }
  return null;
}

/** The Electron binary: the app's own `require("electron")` export, or --bin. */
function resolveBinary(opts) {
  if (opts.bin) return isAbsolute(opts.bin) ? opts.bin : resolve(cwd, opts.bin);
  try {
    const exported = requireFromProject('electron');
    if (typeof exported === 'string' && exported.length > 0) return exported;
  } catch {
    // fall through to the per-platform fallback below
  }
  const rel = config.binaryResolution.relativeToPackage[process.platform];
  if (rel) {
    const guess = resolve(cwd, 'node_modules', 'electron', rel);
    if (existsSync(guess)) return guess;
  }
  console.error('electron-error-capture: could not resolve an Electron binary. Pass --bin <path>.');
  process.exit(1);
  return null;
}

/** The app entry point: --entry, or the first configured candidate that exists. */
function resolveEntry(opts) {
  if (opts.entry) return isAbsolute(opts.entry) ? opts.entry : resolve(cwd, opts.entry);
  for (const candidate of config.launch.entryCandidates) {
    const abs = resolve(cwd, candidate);
    if (existsSync(abs)) return abs;
  }
  console.error('electron-error-capture: no entry script found. Tried: ' + config.launch.entryCandidates.join(', '));
  console.error('Pass --entry <main.js>.');
  process.exit(1);
  return null;
}

let opts;
try {
  opts = core.parseArgs(process.argv.slice(2), { cwd, config });
} catch (err) {
  console.error('electron-error-capture: ' + err.message);
  process.exit(1);
}

const { _electron } = requirePlaywright();
const entry = resolveEntry(opts);
const binary = resolveBinary(opts);

const sessionStart = new Date();
const sessionTs = core.sessionDirName(sessionStart);
const outputRoot = isAbsolute(opts.output) ? opts.output : resolve(cwd, opts.output);
const OUTPUT_DIR = join(outputRoot, sessionTs);
mkdirSync(OUTPUT_DIR, { recursive: true });

const captured = [];
let screenshotCounter = 0;

function log(prefix, message) {
  const ts = new Date().toISOString().slice(11, 19);
  const line = '[' + prefix + ' ' + ts + '] ' + message;
  console.log(line);
  writeFileSync(join(OUTPUT_DIR, config.output.sessionLog), line + '\n', { flag: 'a' });
}

async function capture(window, type, message, stack, location) {
  const entryRecord = {
    timestamp: new Date().toISOString(),
    type,
    message,
    stack: stack || null,
    location: location || null,
    screenshot: null,
    // Recorded per entry so the report can separate what was observed from
    // what was inferred. An empty array is a real answer, not a missing field.
    derived: core.classify({ type, message }, config),
  };

  const channel = config.listeners.find((l) => l.id === type);
  if (opts.screenshots && window && channel && channel.isError) {
    screenshotCounter++;
    const filename = config.output.screenshotPattern.replace('{n}', String(screenshotCounter));
    try {
      await window.screenshot({ path: join(OUTPUT_DIR, filename) });
      entryRecord.screenshot = filename;
      log('SCREENSHOT', filename);
    } catch {
      // The window may already have gone; the entry is still worth keeping.
    }
  }

  captured.push(entryRecord);
}

console.log('\nElectron Error Capture');
console.log('  App entry:  ' + entry);
console.log('  Binary:     ' + binary);
console.log('  Output:     ' + join(opts.output, sessionTs));
console.log('  Screenshots: ' + (opts.screenshots ? 'on' : 'off') + '   Warnings: ' + (opts.warnings ? 'on' : 'off'));
console.log('');

const app = await _electron.launch({
  executablePath: binary,
  args: [entry, ...opts.args],
  cwd,
  timeout: opts.timeout,
});

const window = await app.firstWindow();

// --- The five listener channels. Each is a real hook; see config.listeners. ---

window.on('pageerror', async (error) => {
  log('ERROR', error.message);
  await capture(window, 'page-error', error.message, error.stack);
});

window.on('console', async (msg) => {
  if (msg.type() === 'error') {
    log('CONSOLE-ERROR', msg.text());
    await capture(window, 'console-error', msg.text(), null, msg.location());
  } else if (msg.type() === 'warning' && opts.warnings) {
    log('WARN', msg.text());
    await capture(window, 'console-warning', msg.text(), null, msg.location());
  }
});

window.on('crash', async () => {
  log('CRASH', 'Renderer process crashed');
  await capture(window, 'crash', 'Renderer process crashed');
});

const proc = app.process();
if (proc.stderr) {
  let stderrBuf = '';
  proc.stderr.on('data', (data) => {
    stderrBuf += data.toString();
    const lines = stderrBuf.split('\n');
    stderrBuf = lines.pop();
    for (const line of lines) {
      const text = line.trim();
      if (text) {
        log('MAIN', text);
        capture(null, 'main-stderr', text);
      }
    }
  });
}

console.log('Capture session active. Interact with the app.');
console.log('Press Ctrl+C to stop and generate the report.\n');

let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('\nGenerating report...');
  const session = { start: sessionStart, end: new Date(), app: opts.entry || entry };

  writeFileSync(
    join(OUTPUT_DIR, config.output.reportMarkdown),
    core.renderMarkdown({ session, captured, config })
  );
  writeFileSync(
    join(OUTPUT_DIR, config.output.reportJson),
    JSON.stringify(core.renderJson({ session, captured, config }), null, 2)
  );

  const summary = core.summarize(captured, config);
  console.log('\nError Capture Report');
  for (const l of config.listeners) {
    console.log('  ' + l.label + ': ' + summary.listeners[l.id]);
  }
  console.log('  Total errors: ' + summary.totalErrors);
  console.log('  Screenshots:  ' + screenshotCounter);
  console.log('  Report: ' + join(OUTPUT_DIR, config.output.reportMarkdown));

  try {
    await app.close();
  } catch {
    // The app may already have exited.
  }

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
app.on('close', () => {
  if (!shuttingDown) shutdown();
});

// Hold the process open until a shutdown path fires.
await new Promise(() => {});
