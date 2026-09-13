'use strict';

/**
 * Pure decision core for the electron-error-capture harness (#27).
 *
 * Everything here is a decision the harness makes that does not need Electron,
 * Playwright, or a human: how flags resolve, how a captured line is classified,
 * and what the report says. `scripts/capture-session.mjs` is the ESM shell that
 * wires Playwright to these functions and owns all the I/O.
 *
 * The split exists so the decisions are testable. The shell must be ESM —
 * `_electron` is — and an ESM module cannot be required from a CommonJS test
 * runner without the dynamic import jest's VM rejects. Logic that cannot be
 * required is logic nobody tests, so the logic lives on this side of the line.
 *
 * Nothing here reads the filesystem or the clock: the config and the session
 * timestamps are passed in. That is what lets the report tests assert exact
 * output instead of matching around a moving date.
 */

/** Flags that consume the following token (or an `=value`). */
const VALUE_FLAGS = new Set(['--entry', '--bin', '--output', '--timeout']);

/**
 * Everything after `--args` belongs to the application under test, verbatim.
 * Without a terminator an app that takes its own `--output` becomes
 * unlaunchable, because the harness would claim the flag first.
 */
const ARGS_TERMINATOR = '--args';

const BOOLEAN_FLAGS = new Set(['--screenshots', '--no-screenshots', '--warnings']);

/**
 * Resolve argv into harness options.
 *
 * @param {string[]} argv   Arguments after the script name.
 * @param {object} ctx      `{ cwd, config }` — config supplies every default,
 *                          so no default is written twice.
 * @returns {{entry: (string|null), bin: (string|null), screenshots: boolean,
 *            warnings: boolean, output: string, timeout: number, args: string[],
 *            cwd: string}}
 */
function parseArgs(argv, ctx) {
  const config = ctx && ctx.config;
  if (!config) throw new Error('parseArgs requires ctx.config');

  const opts = {
    cwd: (ctx && ctx.cwd) || process.cwd(),
    entry: null,
    bin: null,
    screenshots: true,
    warnings: false,
    output: config.output.defaultDir,
    timeout: config.launch.defaultTimeoutMs,
    args: [],
  };

  // Tracked separately from `opts.screenshots` so an explicit `--screenshots`
  // can win regardless of position. Last-flag-wins would make the result
  // depend on argv order for a pair of flags a user may well pass from a
  // wrapper script plus the command line.
  let screenshotsExplicitlyOn = false;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token === ARGS_TERMINATOR) {
      opts.args = argv.slice(i + 1);
      break;
    }

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument "${token}". Application arguments go after --args.`);
    }

    const eq = token.indexOf('=');
    const name = eq === -1 ? token : token.slice(0, eq);
    const inlineValue = eq === -1 ? null : token.slice(eq + 1);

    if (BOOLEAN_FLAGS.has(name)) {
      if (inlineValue !== null) throw new Error(`${name} takes no value.`);
      if (name === '--screenshots') screenshotsExplicitlyOn = true;
      else if (name === '--no-screenshots') opts.screenshots = false;
      else if (name === '--warnings') opts.warnings = true;
      continue;
    }

    if (!VALUE_FLAGS.has(name)) {
      // Reported, never ignored. A mistyped `--warning` would otherwise run a
      // session that silently records no warnings, and the transcript would
      // look exactly like a session that had none.
      throw new Error(`Unknown flag "${name}". Known flags: --entry, --bin, --screenshots, --no-screenshots, --warnings, --output, --timeout, --args.`);
    }

    let value = inlineValue;
    if (value === null) {
      value = argv[++i];
      if (value === undefined) throw new Error(`${name} requires a value.`);
    }

    if (name === '--timeout') {
      const ms = Number(value);
      if (!Number.isFinite(ms) || ms <= 0) {
        throw new Error(`--timeout must be a positive number of milliseconds, got "${value}".`);
      }
      opts.timeout = ms;
    } else if (name === '--entry') {
      opts.entry = value;
    } else if (name === '--bin') {
      opts.bin = value;
    } else if (name === '--output') {
      opts.output = value;
    }
  }

  if (screenshotsExplicitlyOn) opts.screenshots = true;
  return opts;
}

/**
 * Derived classifications for one captured entry.
 *
 * These are NOT hooks. Unhandled rejections, IPC failures and CSP violations
 * have no listener of their own — they are inferred from what the five real
 * listeners emit. The report has to say so, which is why this returns ids the
 * renderer labels separately rather than folding them into `entry.type`.
 *
 * @returns {string[]} ids of every classification that fired, possibly empty.
 */
function classify(entry, config) {
  const out = [];
  for (const rule of config.derivedClassifications) {
    // `appliesTo` is what stops a console line quoting a stderr message from
    // being reclassified as one. Checked before the patterns so a narrowed
    // rule costs nothing.
    if (!rule.appliesTo.includes(entry.type)) continue;
    const flags = rule.flags || '';
    const hit = rule.patterns.some((source) => new RegExp(source, flags).test(entry.message || ''));
    if (hit) out.push(rule.id);
  }
  return out;
}

/** Filesystem-safe, chronologically sortable session directory name. */
function sessionDirName(date) {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/** Count entries per listener id and per derived classification id. */
function summarize(captured, config) {
  const listeners = {};
  for (const l of config.listeners) {
    listeners[l.id] = captured.filter((e) => e.type === l.id).length;
  }

  const derived = {};
  for (const d of config.derivedClassifications) {
    derived[d.id] = captured.filter((e) => (e.derived || []).includes(d.id)).length;
  }

  // Warnings are opt-in and are not errors. Folding them into the total makes
  // a clean session read as dirty and buries the number that matters.
  const errorIds = new Set(config.listeners.filter((l) => l.isError).map((l) => l.id));
  const totalErrors = captured.filter((e) => errorIds.has(e.type)).length;

  return { listeners, derived, totalErrors };
}

function listenerLabel(id, config) {
  const found = config.listeners.find((l) => l.id === id);
  return found ? found.label : id;
}

function renderJson({ session, captured, config }) {
  const durationMs = session.end - session.start;
  return {
    session: {
      start: session.start.toISOString(),
      end: session.end.toISOString(),
      durationSeconds: Math.round(durationMs / 1000),
      app: session.app,
    },
    summary: summarize(captured, config),
    entries: captured,
  };
}

function renderMarkdown({ session, captured, config }) {
  const summary = summarize(captured, config);
  const durationMs = session.end - session.start;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  const lines = [];
  lines.push('# Error Capture Report', '');
  lines.push(`**App:** ${session.app}`);
  lines.push(`**Session:** ${session.start.toISOString().slice(0, 19)} — ${session.end.toISOString().slice(0, 19)}`);
  lines.push(`**Duration:** ${minutes}m ${seconds}s`, '');

  lines.push('## Observed channels', '');
  lines.push('Each row below is backed by a real hook, so a zero is evidence of absence.', '');
  lines.push('| Channel | Hook | Count |', '|---------|------|-------|');
  for (const l of config.listeners) {
    lines.push(`| ${l.label} | \`${l.hook}\` | ${summary.listeners[l.id]} |`);
  }
  lines.push(`| **Total errors** | | **${summary.totalErrors}** |`, '');

  lines.push('## Derived classifications', '');
  lines.push(
    'These are **pattern-matched** over the channels above, not hooked. A zero here',
    'means no captured line matched the patterns — not that no such failure occurred.',
    ''
  );
  lines.push('| Classification | id | Applies to | Count |', '|----------------|----|------------|-------|');
  for (const d of config.derivedClassifications) {
    const applies = d.appliesTo.map((id) => listenerLabel(id, config)).join(', ');
    lines.push(`| ${d.label} | \`${d.id}\` | ${applies} | ${summary.derived[d.id]} |`);
  }
  lines.push('');

  if (captured.length === 0) {
    lines.push('## No errors captured', '');
    lines.push('Clean session — no errors, warnings, or crashes were observed on any channel.', '');
  } else {
    lines.push('## Entries (chronological)', '');
    captured.forEach((entry, i) => {
      const ts = entry.timestamp.slice(11, 19);
      lines.push(`### ${i + 1}. [${ts}] ${listenerLabel(entry.type, config)}`);
      lines.push(`**Observed on:** \`${entry.type}\` (hook)`);
      if ((entry.derived || []).length > 0) {
        lines.push(`**Classified as (pattern-matched):** ${entry.derived.map((d) => `\`${d}\``).join(', ')}`);
      }
      lines.push(`**Message:** ${entry.message}`);
      if (entry.stack) lines.push('**Stack:**', '```', entry.stack, '```');
      if (entry.location) lines.push(`**Location:** ${JSON.stringify(entry.location)}`);
      if (entry.screenshot) lines.push(`**Screenshot:** \`${entry.screenshot}\``);
      lines.push('');
    });
  }

  lines.push('---', '*Generated by the electron-error-capture skill.*', '');
  return lines.join('\n');
}

module.exports = {
  parseArgs,
  classify,
  sessionDirName,
  summarize,
  renderJson,
  renderMarkdown,
  VALUE_FLAGS,
  BOOLEAN_FLAGS,
  ARGS_TERMINATOR,
};
