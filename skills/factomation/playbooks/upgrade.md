# Upgrade

Raise an area's automation tier, or fix an issue inside an area at the tier it allows.

## Pick the upgrade

1. Work on the current bottleneck. If the bottleneck's area is below the tier the fix needs, the upgrade is to
   raise that tier first.
2. Prefer the cheapest fix that removes the limit (a query, an index, a cache, a config) over a rewrite.
3. Check the tier gate in `SKILL.md`. If the change needs the user's go-ahead, ask with the plan, the risk and the
   check you will run, then stop.

## Raise a tier

- **0 → 1:** map the area to `verified`, then pin its current behaviour with characterization tests. These record
  what the code does today, right or wrong. Do not fix bugs while you pin them; log them as findings.
- **1 → 2:** make the checks automatic: the tests, type checks and lint run in a hook or CI and fail the change.
- **2 → 3:** add budgets the codebase enforces: performance, bundle size, query counts, error rates. A budget is a
  check that fails when a number crosses a line.

When a tier goes up, update `areas.tsv` and log it as a `tier` entry.

## Make one change

1. Run the area's checks on the current code and record the result. A check that already fails is a finding. Fix
   or log it first.
2. Make one change.
3. Run the checks again. Measure the number the change targets, if there is one.
4. Keep the change only when the checks pass and the number moved past noise. Otherwise revert it in full.
5. Commit a kept change on its own. Log the upgrade either way: what, the check, before and after, kept or reverted.

## Make it stick

When a kept upgrade fixes a kind of problem, not just one instance, turn it into a rule the codebase enforces:
architecture first, then types, lint or CI, then tests, and a written rule last. Add it to `config.md` and log it.

## Hand off a hill climb

When an improvement needs many measured attempts on one metric, do not loop here. Write or update
`.factomation/hillclimbs/<id>.md` and tell the user to run `/hillclimb <id>`. It appears on the report as a
recommended hill climb.
