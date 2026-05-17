#!/usr/bin/env node
/**
 * run-harness.js — execution harness coordinator for spar-exocortex
 *
 * Given a baseline implementation, a challenger implementation, an attacker
 * input, and a set of standard + edge test cases, runs all candidates across
 * all cases via the appropriate adapter and emits an array of
 * execution-result-schema.json envelopes.
 *
 * Usage:
 *   node run-harness.js --language <js|ts|python> \
 *                       --baseline <impl-file> \
 *                       --challenger <impl-file> \
 *                       --cases <cases.json> \
 *                       [--timeout-ms N]
 *
 * cases.json shape:
 *   [{ "name": "case-id", "input": <any>, "expected": <any>, "kind": "standard"|"attacker"|"edge" }]
 *
 * Output: JSON array of per-case results (one per candidate × case).
 * The adapter is selected from --language:
 *   js, ts → node-adapter.js
 *   python → python-adapter.py
 *
 * Refs #216
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ADAPTERS_DIR = path.join(__dirname, 'adapters');

function parseArgs(argv) {
  const args = { language: null, baseline: null, challenger: null, cases: null, timeoutMs: 5000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--language') args.language = argv[++i];
    else if (a === '--baseline') args.baseline = argv[++i];
    else if (a === '--challenger') args.challenger = argv[++i];
    else if (a === '--cases') args.cases = argv[++i];
    else if (a === '--timeout-ms') args.timeoutMs = parseInt(argv[++i], 10) || 5000;
  }
  return args;
}

function adapterCommand(language) {
  if (language === 'js' || language === 'ts') {
    return { cmd: 'node', script: path.join(ADAPTERS_DIR, 'node-adapter.js') };
  }
  if (language === 'python') {
    return { cmd: 'python3', script: path.join(ADAPTERS_DIR, 'python-adapter.py') };
  }
  return null;
}

function runOne(adapter, candidateName, candidateFile, caseFile, caseName, timeoutMs) {
  const r = spawnSync(adapter.cmd, [
    adapter.script,
    '--case', caseFile,
    '--candidate', candidateFile,
    '--candidate-name', candidateName,
    '--case-name', caseName,
    '--timeout-ms', String(timeoutMs)
  ], { encoding: 'utf8', timeout: timeoutMs + 2000 });

  if (r.error) {
    return { candidate: candidateName, case: caseName, outcome: 'error', errorMessage: `adapter spawn failed: ${r.error.message}` };
  }
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    return { candidate: candidateName, case: caseName, outcome: 'error', errorMessage: `adapter output not JSON: ${r.stdout.slice(0, 200)}` };
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.language || !args.baseline || !args.cases) {
    process.stdout.write(JSON.stringify({ ok: false, error: 'Missing required args: --language, --baseline, --cases (and optionally --challenger)' }));
    process.exit(2);
  }

  const adapter = adapterCommand(args.language);
  if (!adapter) {
    process.stdout.write(JSON.stringify({ ok: false, error: `Unsupported language "${args.language}". Supported: js, ts, python.` }));
    process.exit(2);
  }
  if (!fs.existsSync(adapter.script)) {
    process.stdout.write(JSON.stringify({ ok: false, error: `Adapter script not found: ${adapter.script}` }));
    process.exit(2);
  }

  const cases = JSON.parse(fs.readFileSync(args.cases, 'utf8'));
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'spar-harness-'));
  const results = [];

  try {
    for (const tc of cases) {
      const caseFile = path.join(tmpDir, `case-${tc.name.replace(/[^a-z0-9]/gi, '_')}.json`);
      fs.writeFileSync(caseFile, JSON.stringify(tc));
      results.push(runOne(adapter, 'baseline', args.baseline, caseFile, tc.name, args.timeoutMs));
      if (args.challenger) {
        results.push(runOne(adapter, 'challenger', args.challenger, caseFile, tc.name, args.timeoutMs));
      }
    }
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_e) {}
  }

  process.stdout.write(JSON.stringify(results, null, 2));
}

main();
