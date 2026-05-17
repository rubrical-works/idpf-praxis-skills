#!/usr/bin/env python3
"""
python-adapter.py — Python execution adapter for spar-exocortex

Runs a candidate implementation against a single test case. The candidate is
expected to define a `solve` function. The test case provides `input` (any
JSON) and `expected` (any JSON). Outcome is determined by structural equality
after json round-trip.

Usage:
    python3 python-adapter.py --case <case.json> --candidate <impl.py> [--timeout-ms N]

Output JSON conforms to execution-result-schema.json.

Refs #216
"""

import argparse
import json
import os
import signal
import sys
import time


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--case', dest='case_file', required=True)
    p.add_argument('--candidate', dest='candidate_file', required=True)
    p.add_argument('--timeout-ms', dest='timeout_ms', type=int, default=5000)
    p.add_argument('--candidate-name', dest='candidate_name', default='baseline')
    p.add_argument('--case-name', dest='case_name', default=None)
    return p.parse_args()


def emit(obj):
    sys.stdout.write(json.dumps(obj))
    sys.stdout.flush()


def main():
    args = parse_args()

    with open(args.candidate_file, 'r', encoding='utf-8') as f:
        candidate_src = f.read()

    with open(args.case_file, 'r', encoding='utf-8') as f:
        tc = json.load(f)

    case_name = args.case_name or tc.get('name') or os.path.splitext(os.path.basename(args.case_file))[0]

    namespace = {}
    start = time.time()

    # POSIX-only timeout via SIGALRM. On Windows, SIGALRM isn't available;
    # the timeout-ms is best-effort and slow candidates will run to completion.
    timeout_enabled = hasattr(signal, 'SIGALRM')
    if timeout_enabled:
        def _timeout_handler(signum, frame):
            raise TimeoutError('script execution timed out')
        signal.signal(signal.SIGALRM, _timeout_handler)
        # SIGALRM granularity is whole seconds; round up.
        signal.alarm(max(1, (args.timeout_ms + 999) // 1000))

    try:
        exec(candidate_src, namespace)
        solve = namespace.get('solve')
        if not callable(solve):
            emit({
                'candidate': args.candidate_name,
                'case': case_name,
                'outcome': 'error',
                'errorMessage': 'Candidate does not define a `solve` function'
            })
            return
        actual = solve(tc['input'])
    except TimeoutError as e:
        if timeout_enabled:
            signal.alarm(0)
        emit({
            'candidate': args.candidate_name,
            'case': case_name,
            'outcome': 'timeout',
            'errorMessage': str(e),
            'wallClockMs': int((time.time() - start) * 1000)
        })
        return
    except Exception as e:
        if timeout_enabled:
            signal.alarm(0)
        emit({
            'candidate': args.candidate_name,
            'case': case_name,
            'outcome': 'error',
            'errorMessage': str(e),
            'wallClockMs': int((time.time() - start) * 1000)
        })
        return

    if timeout_enabled:
        signal.alarm(0)

    wall_clock_ms = int((time.time() - start) * 1000)

    # Round-trip both sides through json to normalize (e.g., tuple → list).
    expected_norm = json.loads(json.dumps(tc['expected']))
    actual_norm = json.loads(json.dumps(actual))
    passed = expected_norm == actual_norm

    emit({
        'candidate': args.candidate_name,
        'case': case_name,
        'outcome': 'pass' if passed else 'fail',
        'expected': json.dumps(expected_norm),
        'actual': json.dumps(actual_norm),
        'wallClockMs': wall_clock_ms
    })


if __name__ == '__main__':
    main()
