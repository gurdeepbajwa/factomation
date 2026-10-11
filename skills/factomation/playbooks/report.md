# Report

Rebuild `Factory.html`, the one page the user reads. Run this when the map, a tier, the bottleneck or an upgrade
changed since the last build, or when the user asks.

1. Read the current `report.json` and `Factory.html`.
2. Rebuild `report.json` from your notes, `areas.tsv`, `log.md` and the hill climb specs. Follow
   [../references/report-schema.md](../references/report-schema.md). Keep every entry short: the user reads it on a
   phone.
   - Run `scripts/areas.sh` and `scripts/hotspots.sh` for the numbers. Do not copy numbers from old reports.
   - `since`: what really changed since the last build, in one or two sentences.
   - Remove anything stale, reverted or wrong. Do not keep an entry because it was there before.
   - Every finding, bottleneck and story keeps its evidence. Show `unverified` where it applies.
   - `questions`: the three questions from this session's close.
   - `hillclimbs`: one entry per open spec in `.factomation/hillclimbs/`.
3. Build: `node <skill>/scripts/build-report.mjs .factomation/report.json`.
4. Check: `node <skill>/scripts/check-report.mjs .factomation/Factory.html`. It needs Playwright. Fix every problem
   it lists. If Playwright is not available, say so in your reply.
5. Compare the new page with the old one. Every number must trace to a command you ran in this session or to a
   cited file.
6. Commit `report.json` and `Factory.html` if the project commits `.factomation/`. Send or link the page to the user
   if your environment can.
