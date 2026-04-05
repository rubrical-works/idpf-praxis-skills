#!/usr/bin/env node
/**
 * match-signals.js — Keyword-to-signal matcher for engage-exocortex
 *
 * Usage: node match-signals.js "keyword1" "keyword2" [...] [--paths N]
 *
 * Reads cross-references.json, matches keywords against signal definitions,
 * aggregates weighted scores for paradigms/structures/strategies, and outputs
 * top N path candidates as JSON.
 *
 * Refs #158
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');
const CROSS_REF_PATH = path.join(RESOURCES_DIR, 'cross-references.json');

function main() {
  const { keywords, numPaths } = parseArgs(process.argv.slice(2));

  // Validate against colocated schema
  const schemaPath = path.join(__dirname, 'match-signals-input-schema.json');
  const validationError = validateInput({ keywords, paths: numPaths }, schemaPath);
  if (validationError) {
    outputError(validationError);
    process.exit(1);
  }

  if (keywords.length === 0) {
    outputError('No keywords provided. Usage: node match-signals.js "keyword1" "keyword2" [--paths N]');
    process.exit(1);
  }

  if (!fs.existsSync(CROSS_REF_PATH)) {
    outputError(`cross-references.json not found at ${CROSS_REF_PATH}`);
    process.exit(1);
  }

  const crossRef = JSON.parse(fs.readFileSync(CROSS_REF_PATH, 'utf-8'));
  const signals = crossRef.signals;

  // Match keywords against signals
  const { matched, unmatched } = matchKeywords(keywords, signals);

  if (matched.length === 0) {
    const result = {
      ok: false,
      matchedSignals: [],
      unmatchedKeywords: unmatched,
      message: 'No matching paradigms found for the given problem characteristics.'
    };
    process.stdout.write(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Aggregate scores across all matched signals
  const scores = aggregateScores(matched);

  // Select top N paths
  const paths = selectPaths(scores, numPaths);

  const result = {
    ok: true,
    matchedSignals: matched.map(m => ({ id: m.signal.id, matchedKeywords: m.matchedKeywords })),
    unmatchedKeywords: unmatched,
    scores: {
      paradigms: scores.paradigms,
      structures: scores.structures,
      strategies: scores.strategies
    },
    paths
  };

  process.stdout.write(JSON.stringify(result, null, 2));
}

function parseArgs(argv) {
  const keywords = [];
  let numPaths = 3;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--paths' && i + 1 < argv.length) {
      numPaths = parseInt(argv[i + 1], 10) || 3;
      i++;
    } else if (!argv[i].startsWith('--')) {
      keywords.push(argv[i]);
    }
  }

  return { keywords, numPaths };
}

function matchKeywords(keywords, signals) {
  const normalizedKeywords = keywords.map(k => k.toLowerCase().trim());
  const matched = [];
  const matchedKeywordSet = new Set();

  for (const signal of signals) {
    const signalKeywords = signal.keywords.map(k => k.toLowerCase());
    const hits = [];

    for (const userKw of normalizedKeywords) {
      for (const sigKw of signalKeywords) {
        if (sigKw.includes(userKw) || userKw.includes(sigKw)) {
          hits.push(userKw);
          matchedKeywordSet.add(userKw);
          break;
        }
      }
    }

    if (hits.length > 0) {
      matched.push({ signal, matchedKeywords: [...new Set(hits)] });
    }
  }

  const unmatched = normalizedKeywords.filter(k => !matchedKeywordSet.has(k));
  return { matched, unmatched };
}

function aggregateScores(matchedSignals) {
  const paradigmScores = {};
  const structureScores = {};
  const strategyScores = {};

  for (const { signal } of matchedSignals) {
    for (const p of (signal.paradigms || [])) {
      paradigmScores[p.id] = (paradigmScores[p.id] || 0) + p.weight;
    }
    for (const s of (signal.structures || [])) {
      structureScores[s.id] = (structureScores[s.id] || 0) + s.weight;
    }
    for (const s of (signal.strategies || [])) {
      strategyScores[s.id] = (strategyScores[s.id] || 0) + s.weight;
    }
  }

  return {
    paradigms: toSortedArray(paradigmScores),
    structures: toSortedArray(structureScores),
    strategies: toSortedArray(strategyScores)
  };
}

function toSortedArray(scoreMap) {
  return Object.entries(scoreMap)
    .map(([id, score]) => ({ id, score: Math.round(score * 1000) / 1000 }))
    .sort((a, b) => b.score - a.score);
}

function selectPaths(scores, numPaths) {
  const paths = [];
  const usedParadigms = new Set();

  // Take top paradigms, ensuring diversity
  const paradigmCandidates = [...scores.paradigms];

  for (let i = 0; i < Math.min(numPaths, paradigmCandidates.length); i++) {
    let selected = null;

    // Prefer unused paradigms for diversity
    for (const p of paradigmCandidates) {
      if (!usedParadigms.has(p.id)) {
        selected = p;
        break;
      }
    }

    if (!selected) break;
    usedParadigms.add(selected.id);

    // Pick best structure and strategy not yet heavily used
    const structure = pickBestUnused(scores.structures, paths, 'structure');
    const strategy = pickBestUnused(scores.strategies, paths, 'strategy');

    paths.push({
      paradigm: selected.id,
      paradigmScore: selected.score,
      structure: structure ? structure.id : null,
      structureScore: structure ? structure.score : 0,
      strategy: strategy ? strategy.id : null,
      strategyScore: strategy ? strategy.score : 0
    });
  }

  return paths;
}

function pickBestUnused(candidates, existingPaths, field) {
  if (!candidates || candidates.length === 0) return null;

  const usedCounts = {};
  for (const p of existingPaths) {
    const val = p[field];
    if (val) usedCounts[val] = (usedCounts[val] || 0) + 1;
  }

  // Prefer candidates not yet used, then by score
  const sorted = [...candidates].sort((a, b) => {
    const aUsed = usedCounts[a.id] || 0;
    const bUsed = usedCounts[b.id] || 0;
    if (aUsed !== bUsed) return aUsed - bUsed;
    return b.score - a.score;
  });

  return sorted[0];
}

function validateInput(input, schemaPath) {
  try {
    const Ajv = require('ajv');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    if (!validate(input)) {
      return `Input validation failed: ${validate.errors.map(e => e.message).join(', ')}`;
    }
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') return null; // ajv not available, skip
    if (e.code === 'ENOENT') return null; // schema not found, skip
    throw e;
  }
  return null;
}

function outputError(message) {
  const result = { ok: false, error: message };
  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
