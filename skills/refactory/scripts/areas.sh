#!/usr/bin/env bash
# Size, recent changes and freshness for each area in .refactory/areas.tsv.
# Run from the repo root.
# Usage: areas.sh [days=90] [areas.tsv]
# areas.tsv columns (tab separated): area, group, paths, tier, confidence, verified_at
#   paths: space-separated git pathspecs, e.g. "apps/web packages/ui"
#   verified_at: the commit the area was last verified at, or "-"
# Output columns: area, lines, commits in the window, status, detail.
# status: fresh | stale | unverified | unknown-commit
set -eu
days="${1:-90}"
file="${2:-.refactory/areas.tsv}"
exclude="${REFACTORY_EXCLUDE:-(^|/)(node_modules|vendor|dist|build|out|output|coverage|\.refactory)/|lock(\.json|\.yaml)?$|\.lock$|\.gen\.|\.min\.|\.snap$}"

printf 'area\tlines\tcommits\tstatus\tdetail\n'
while IFS=$'\t' read -r area _group paths _tier _conf commit; do
  [[ -z "$area" || "$area" == \#* || "$area" == area ]] && continue
  read -ra specs <<<"$paths"
  lines=$(git grep -I -c '' -- "${specs[@]}" 2>/dev/null | grep -Ev "$exclude" | awk -F: '{s += $NF} END {print s + 0}')
  commits=$(git rev-list --count --since="${days}.days" HEAD -- "${specs[@]}")
  if [[ -z "${commit:-}" || "$commit" == "-" ]]; then
    printf '%s\t%s\t%s\tunverified\t\n' "$area" "$lines" "$commits"
  elif ! git cat-file -e "${commit}^{commit}" 2>/dev/null; then
    printf '%s\t%s\t%s\tunknown-commit\t%s\n' "$area" "$lines" "$commits" "$commit"
  else
    n=$(git diff --name-only "$commit"..HEAD -- "${specs[@]}" | grep -Ev "$exclude" | wc -l)
    if [ "$n" -gt 0 ]; then
      printf '%s\t%s\t%s\tstale\t%s files changed since %s\n' "$area" "$lines" "$commits" "$n" "$commit"
    else
      printf '%s\t%s\t%s\tfresh\t\n' "$area" "$lines" "$commits"
    fi
  fi
done <"$file"
