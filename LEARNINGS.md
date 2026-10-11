# Learnings

Lessons from real codebases that changed how the skill works. Each one arrives through a pull request from the
reflect playbook, with project details removed.

Format: `- YYYY-MM-DD: the lesson — where it now lives in the skill`

- 2026-10-12: Generated files (route trees, lockfiles, snapshots) top the hotspot list but carry no risk — default
  `REFACTORY_EXCLUDE` in `scripts/hotspots.sh` and `scripts/areas.sh`.
- 2026-10-12: Large data and output folders swamp hotspot scores — default exclude covers `out/`, `output/`,
  `coverage/`.
