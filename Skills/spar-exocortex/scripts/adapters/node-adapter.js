#!/usr/bin/env node
/**
 * node-adapter.js — JS/TS execution adapter for spar-exocortex
 *
 * Runs a candidate implementation against a single test case in an isolated
 * subprocess via vm. The candidate is expected to export (or define) a
 * `solve` function; the test case provides `input` (any JSON) and `expected`
 * (any JSON). Outcome is determined by structural equality.
 *
 * Usage:
 *   node node-adapter.js --case <case.json> --candidate <impl.js> [--timeout-ms N]
 *
 * Output JSON conforms to execution-result-schema.json.
 *
 * Refs #216
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function emit(obj) {
  process.stdout.write(JSON.stringify(obj));
}

function parseArgs(argv) {
  const args = { caseFile: null, candidateFile: null, timeoutMs: 5000, candidateName: 'baseline', caseName: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--case') args.caseFile = argv[++i];
    else if (a === '--candidate') args.candidateFile = argv[++i];
    else if (a === '--timeout-ms') args.timeoutMs = parseInt(argv[++i], 10) || 5000;
    else if (a === '--candidate-name') args.candidateName = argv[++i];
    else if (a === '--case-name') args.caseName = argv[++i];
  }
  return args;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i] || !deepEqual(a[ka[i]], b[kb[i]])) return false;
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.caseFile || !args.candidateFile) {
    emit({ candidate: args.candidateName, case: args.caseName || 'unknown', outcome: 'error', errorMessage: 'Missing --case or --candidate' });
    process.exit(2);
  }

  const candidateSrc = fs.readFileSync(args.candidateFile, 'utf8');
  const tc = JSON.parse(fs.readFileSync(args.caseFile, 'utf8'));
  const caseName = args.caseName || tc.name || path.basename(args.caseFile, '.json');

  const sandbox = { module: { exports: {} }, exports: {}, console };
  const ctx = vm.createContext(sandbox);
  const start = Date.now();

  let solve;
  try {
    vm.runInContext(candidateSrc, ctx, { timeout: args.timeoutMs });
    solve = sandbox.module.exports.solve || sandbox.solve;
    if (typeof solve !== 'function') {
      emit({ candidate: args.candidateName, case: caseName, outcome: 'error', errorMessage: 'Candidate does not export a `solve` function' });
      process.exit(0);
    }
  } catch (e) {
    const isTimeout = /script execution timed out/i.test(e && e.message || '');
    emit({
      candidate: args.candidateName,
      case: caseName,
      outcome: isTimeout ? 'timeout' : 'error',
      errorMessage: (e && e.message) || String(e),
      wallClockMs: Date.now() - start
    });
    process.exit(0);
  }

  let actual;
  try {
    // Call solve from the host — functions defined in the vm context retain
    // their lexical scope and are safe to invoke from outside. Calling via
    // vm.runInContext with a bare identifier would fail because solve was
    // assigned to module.exports, not declared as a global.
    actual = solve(tc.input);
  } catch (e) {
    emit({
      candidate: args.candidateName,
      case: caseName,
      outcome: 'error',
      errorMessage: (e && e.message) || String(e),
      wallClockMs: Date.now() - start
    });
    process.exit(0);
  }

  const wallClockMs = Date.now() - start;
  const passed = deepEqual(actual, tc.expected);
  emit({
    candidate: args.candidateName,
    case: caseName,
    outcome: passed ? 'pass' : 'fail',
    expected: JSON.stringify(tc.expected),
    actual: JSON.stringify(actual),
    wallClockMs
  });
}

main();
