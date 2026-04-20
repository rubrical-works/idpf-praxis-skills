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
 * Output schema:
 *   {
 *     ok: boolean,
 *     confidence: number,                  // [0, 1] mean of per-match relevance (#165)
 *     matchedSignals: [
 *       {
 *         id: string,
 *         matchedKeywords: string[],
 *         relevance: number                // [0, 1] semantic fit for this signal (#165)
 *       }
 *     ],
 *     unmatchedKeywords: string[],
 *     scores: { paradigms, structures, strategies },
 *     paths: [ { paradigm, structure, strategy, ...scores } ]
 *   }
 *
 * Relevance scoring (#165):
 *   - 1.0  exact keyword match
 *   - 0.7  word-boundary match (whole word/phrase inside compound keyword)
 *   - 0.3  substring-only overlap (e.g. "aggregation" inside "log-aggregation")
 *   The script's existing match behavior is unchanged — relevance is additive
 *   metadata that lets callers tier match quality without re-deriving it from
 *   model judgment.
 *
 * Fuzzier matching (#191):
 *   - Separator normalization: hyphens/underscores → spaces on both user and
 *     signal keywords before comparison (so "next-quarter" ~ "next quarter").
 *   - Light suffix strip in the 0.3 substring tier only: {s, es, ing, ed, al, ly}
 *     with a ≥4-char residue guard (so "agriculture" ~ "agricultural" but "al"
 *     alone does not pull "agricultural commodities").
 *
 * Refs #158, #165, #191
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');
const CROSS_REF_PATH = path.join(RESOURCES_DIR, 'cross-references.json');

const FALLBACK_ALLOWLIST = [
  'finance', 'financial', 'stock', 'stocks', 'etf', 'options', 'bonds',
  'sector', 'market', 'portfolio', 'invest', 'trade', 'trading', 'hedge',
  'macro', 'economic', 'recession', 'inflation', 'rates', 'fed',
  'commodity', 'equity', 'equities'
];

function hasAllowlistHit(normalizedKeywords) {
  for (const kw of normalizedKeywords) {
    for (const term of FALLBACK_ALLOWLIST) {
      if (kw.includes(term) || term.includes(kw)) return true;
    }
  }
  return false;
}

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
    const normalizedKeywords = keywords.map(k => k.toLowerCase().trim());
    if (hasAllowlistHit(normalizedKeywords)) {
      const fallbackResult = {
        ok: true,
        confidence: 0.15,
        fallback: true,
        matchedSignals: [],
        unmatchedKeywords: unmatched,
        scores: { paradigms: [], structures: [], strategies: [] },
        paths: [{
          paradigm: 'scenario-analysis',
          paradigmScore: 0,
          structure: 'scenario-grid',
          structureScore: 0,
          strategy: 'ev-vs-risk-framing',
          strategyScore: 0
        }],
        message: 'Low-confidence fallback: no signal matched but keywords include finance/macro vocabulary. Subagent must surface this degradation and prompt for keyword refinement before proceeding.'
      };
      process.stdout.write(JSON.stringify(fallbackResult, null, 2));
      process.exit(0);
    }

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

  const confidence = computeConfidence(matched);

  const result = {
    ok: true,
    confidence,
    matchedSignals: matched.map(m => ({
      id: m.signal.id,
      matchedKeywords: m.matchedKeywords,
      relevance: m.relevance
    })),
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

/**
 * Score the semantic relevance of a single keyword-vs-signal-keyword match.
 *
 * Returns a value in [0, 1]:
 *   1.0  — exact match (userKw === sigKw)
 *   0.7  — word-boundary match (userKw is a whole word/phrase inside sigKw, or vice versa)
 *   0.3  — substring-only overlap (e.g. "aggregation" inside "log-aggregation")
 *   0    — no match
 *
 * Word-boundary uses non-letter/digit characters (-, _, space, /) as delimiters,
 * which matches how signal keywords are typically written in cross-references.json.
 */
function normalizeSeparators(kw) {
  return kw.toLowerCase().trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
}

/**
 * Strip one trailing morphological suffix from a single word if the residue
 * is ≥4 characters. Used only in the 0.3 substring tier (#191).
 * Suffix list ordered longest-first so "ing" wins over "s" on "running".
 */
function stripCommonSuffix(word) {
  const suffixes = ['ing', 'es', 'ed', 'al', 'ly', 's'];
  for (const suf of suffixes) {
    if (word.endsWith(suf) && word.length - suf.length >= 4) {
      return word.slice(0, -suf.length);
    }
  }
  return word;
}

function scoreHitRelevance(userKw, sigKw) {
  if (userKw === sigKw) return 1.0;

  const longer = userKw.length >= sigKw.length ? userKw : sigKw;
  const shorter = userKw.length >= sigKw.length ? sigKw : userKw;

  if (longer.includes(shorter)) {
    // Word-boundary check: shorter must be flanked by non-word chars (or string ends) inside longer
    const escaped = shorter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const boundary = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (boundary.test(longer)) return 0.7;
    // 0.3 substring tier — require ≥4 chars so "al" does not pull "agricultural"
    if (shorter.length >= 4) return 0.3;
    return 0;
  }

  // Suffix-strip fallback (0.3 tier only): compare per-word stems.
  // Match if every shorter stem has a longer stem it shares a ≥4-char prefix with.
  const longerStems = longer.split(/\s+/).map(stripCommonSuffix);
  const shorterStems = shorter.split(/\s+/).map(stripCommonSuffix);
  const stemmed = longerStems.join(' ') !== longer || shorterStems.join(' ') !== shorter;
  if (!stemmed) return 0;
  const allMatch = shorterStems.length > 0 && shorterStems.every(ss =>
    ss.length >= 4 && longerStems.some(ls =>
      ls.length >= 4 && (ls === ss || ls.startsWith(ss) || ss.startsWith(ls))
    )
  );
  if (allMatch) return 0.3;

  return 0;
}

function matchKeywords(keywords, signals) {
  const normalizedKeywords = keywords.map(normalizeSeparators);
  const matched = [];
  const matchedKeywordSet = new Set();

  for (const signal of signals) {
    const signalKeywords = signal.keywords.map(normalizeSeparators);
    const hits = [];
    const hitDetails = [];

    for (const userKw of normalizedKeywords) {
      let bestRelevance = 0;
      for (const sigKw of signalKeywords) {
        const r = scoreHitRelevance(userKw, sigKw);
        if (r > bestRelevance) bestRelevance = r;
        if (r === 1.0) break;
      }
      if (bestRelevance > 0) {
        hits.push(userKw);
        hitDetails.push({ keyword: userKw, relevance: bestRelevance });
        matchedKeywordSet.add(userKw);
      }
    }

    if (hits.length > 0) {
      // Per-match relevance = maximum hit relevance for this signal.
      // Rationale: one strong concept hit is more meaningful than many weak substring hits.
      const relevance = hitDetails.reduce((m, h) => Math.max(m, h.relevance), 0);
      matched.push({
        signal,
        matchedKeywords: [...new Set(hits)],
        hitDetails,
        relevance: Math.round(relevance * 1000) / 1000
      });
    }
  }

  const unmatched = normalizedKeywords.filter(k => !matchedKeywordSet.has(k));
  return { matched, unmatched };
}

/**
 * Aggregate confidence across all matched signals.
 * Mean of per-match relevances. Returns 0 when there are no matches.
 */
function computeConfidence(matchedSignals) {
  if (matchedSignals.length === 0) return 0;
  const sum = matchedSignals.reduce((acc, m) => acc + (m.relevance || 0), 0);
  return Math.round((sum / matchedSignals.length) * 1000) / 1000;
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
