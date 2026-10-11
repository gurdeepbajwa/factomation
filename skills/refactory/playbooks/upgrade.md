# Upgrade

Raise an area's automation tier, or fix an issue inside an area at the tier it allows.

Every upgrade is small and moves a trend the right way. In `enterprise` mode, read
[../references/trend-up.md](../references/trend-up.md) first; none of its upgrades is a rewrite.

## Pick the upgrade

1. Work on the current bottleneck. If the bottleneck's area is below the tier the fix needs, the upgrade is to
   raise that tier first.
2. Prefer the cheapest fix that removes the limit (a query, an index, a cache, a config) over a structural change.
3. Decide how it ships. In `normal` mode, a kept change ships when its checks pass; a structural change needs the
   user's go-ahead first. In `enterprise` mode, class it:
   - **Anytime:** no behaviour change (tests, ratchets, types, telemetry, docs). It can ship on its own through the
     normal process.
   - **Ride-along:** it changes behaviour or structure. Prepare it, then add it to `ridealongs.md` with its area,
     size, what it improves and the vehicle it waits for. Do not ship it alone.
   - **Too big for small steps:** write the case as a finding (evidence, cost of doing nothing, the parallel-change
     steps, the first step). Stop there.
4. Check the tier gate in `SKILL.md` and the change process in `config.md`. If the change needs a go-ahead, ask with
   the plan, the risk and the check you will run, then stop.

## Raise a tier

- **0 → 1:** map the area to `verified`, then pin its current behaviour with characterization tests. These record
  what the code does today, right or wrong. Do not fix bugs while you pin them; log them as findings.
- **1 → 2:** make the checks automatic: the tests, type checks and lint run in a hook or CI and fail the change.
  Where the area has many existing violations, add the check as a ratchet: new code must pass and the count may
  only go down. Do not fix every violation first.
- **2 → 3:** add budgets the codebase enforces: performance, bundle size, query counts, error rates. Start each
  budget at today's value as a ratchet, then tighten it as the trend improves.

When a tier goes up, update `areas.tsv` and log it as a `tier` entry.

## Ride along with business work

In `enterprise` mode, when the user mentions upcoming work in an area (a feature, a fix, a migration), or a branch touches an area:

1. Read the area's items in `ridealongs.md`.
2. Offer the items that fit the work: a preparatory refactor that makes the feature easier, or one small related
   improvement. Each lands as its own commit or change, reviewed with the work, never hidden inside it.
3. Mark the item `shipped` with the change link when it lands.

## Make one change

1. Run the area's checks on the current code and record the result. A check that already fails is a finding. Fix
   or log it first.
2. Make one change.
3. Run the checks again. Measure the number the change targets, if there is one.
4. Keep the change only when the checks pass and the number moved past noise. Otherwise revert it in full.
5. Commit a kept change on its own. Log the upgrade either way: what, the check, before and after, kept or reverted.
6. Record the area's trend numbers in `trends.tsv`.

## Make it stick

When a kept upgrade fixes a kind of problem, not just one instance, turn it into a rule the codebase enforces:
architecture first, then types, lint or CI, then tests, and a written rule last. Add it to `config.md` and log it.

## Hand off a hill climb

When an improvement needs many measured attempts on one metric, do not loop here. Write or update
`.refactory/hillclimbs/<id>.md` and tell the user to run `/hillclimb <id>`. It appears on the report as a
recommended hill climb.
