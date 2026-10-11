#!/usr/bin/env bash
# Rank files by size x recent changes. Run from the repo root.
# Usage: hotspots.sh [days=90] [limit=20]
# REFACTORY_EXCLUDE: extended regex of paths to skip. The default skips
# dependencies, build output, lockfiles, generated and minified files.
set -eu
days="${1:-90}"
limit="${2:-20}"
exclude="${REFACTORY_EXCLUDE:-(^|/)(node_modules|vendor|dist|build|out|output|coverage|\.refactory)/|lock(\.json|\.yaml)?$|\.lock$|\.gen\.|\.min\.|\.snap$}"

printf 'score\tchanges\tlines\tpath\n'
git log --since="${days}.days" --format= --name-only |
  grep -v '^$' | grep -Ev "$exclude" | sort | uniq -c |
  while read -r n f; do
    [ -f "$f" ] && grep -Iq . "$f" || continue
    l=$(wc -l <"$f")
    printf '%s\t%s\t%s\t%s\n' "$((n * l))" "$n" "$l" "$f"
  done |
  sort -t$'\t' -k1,1nr | head -n "$limit"
