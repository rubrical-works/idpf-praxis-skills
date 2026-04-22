#!/usr/bin/env node
/**
 * anti-overlap-validator.js — enforces antiOverlapRules in cross-references.json
 *
 * Pure-function validator — no I/O. Consumers (SKILL.md step, tests) pass in
 * matched signal IDs, chosen strategy IDs, and the rules array from
 * cross-references.json. Returns { ok, violations: [{description, rule}] }.
 *
 * Rules 3 and 4 are the currently-encoded conditional rules: signal-set → required
 * strategy-set membership. Rules 1 and 2 (Jaccard overlap, paradigm-pair divergence)
 * operate on the N-paths tuple and live in the path selector, not here.
 *
 * Refs #186
 */
'use strict';

const CONDITIONAL_RULES = [
  {
    description: 'External-comparison strategies required for valuation / sizing / competitive signals',
    signalSet: new Set(['market-entry-attractiveness', 'market-size-estimate', 'equity-fair-value', 'earnings-thesis-update']),
    requiredStrategySet: new Set(['benchmark-comparison', 'triangulation', 'primary-vs-secondary-sources'])
  },
  {
    description: 'Risk-aware strategies required for scenario/shock-family signals',
    signalSet: new Set(['geopolitical-risk-positioning', 'commodity-shock-exposure', 'tactical-positioning-short-horizon', 'scenario-stress-test']),
    requiredStrategySet: new Set(['ev-vs-risk-framing', 'sensitivity-analysis'])
  }
];

function validateAntiOverlap(matchedSignalIds, chosenStrategyIds) {
  const signals = new Set(matchedSignalIds);
  const strategies = new Set(chosenStrategyIds);
  const violations = [];

  for (const rule of CONDITIONAL_RULES) {
    const signalHit = [...signals].some(s => rule.signalSet.has(s));
    if (!signalHit) continue;
    const strategyHit = [...strategies].some(s => rule.requiredStrategySet.has(s));
    if (!strategyHit) {
      violations.push({
        description: rule.description,
        missingStrategySet: [...rule.requiredStrategySet]
      });
    }
  }

  return { ok: violations.length === 0, violations };
}

function validateSourceClassDiversity(paths) {
  const violations = [];

  paths.forEach((p, i) => {
    if (!p.primarySourceClass || typeof p.primarySourceClass !== 'string' || p.primarySourceClass.trim() === '') {
      violations.push({
        reason: 'missing or empty primarySourceClass',
        path: p.name || `path[${i}]`,
        remediation: 'Set primarySourceClass to one of the documented classes (primary-filing, practitioner-retrospective, quantitative-dataset, adversarial-bear-source, trade-press, analyst-coverage) and ensure it differs from every other path.'
      });
    }
  });

  const byClass = new Map();
  for (const p of paths) {
    const cls = p.primarySourceClass;
    if (!cls || typeof cls !== 'string' || cls.trim() === '') continue;
    if (!byClass.has(cls)) byClass.set(cls, []);
    byClass.get(cls).push(p.name || `path#${paths.indexOf(p)}`);
  }

  for (const [cls, pathNames] of byClass.entries()) {
    if (pathNames.length > 1) {
      violations.push({
        duplicateSourceClass: cls,
        paths: pathNames,
        remediation: `Change one of ${pathNames.join(', ')} to a different primarySourceClass — two paths sharing '${cls}' produce labeled-but-not-substantive diversity. Swap to a primary-vs-practitioner-vs-quantitative-vs-adversarial split instead.`
      });
    }
  }

  return { ok: violations.length === 0, violations };
}

module.exports = { validateAntiOverlap, validateSourceClassDiversity, CONDITIONAL_RULES };
