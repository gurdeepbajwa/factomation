# Automation tiers

A tier says how much an agent may do in an area without asking. It rises only when the area gains the checks that
make that safe. It falls when those checks go away or the area goes stale.

| Tier | Name      | The area has                                                         | Agent may                                      |
| ---- | --------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| 0    | by hand   | nothing reliable: unmapped, or no tests                              | read, map, write notes                         |
| 1    | burner    | a verified map; characterization tests pin today's behaviour         | make small changes; the user reviews each one  |
| 2    | assembler | tests, type checks and lint run automatically and block a bad change | keep-or-revert upgrades alone, one commit each |
| 3    | bots      | budgets (speed, size, queries, errors) that fail when crossed        | unattended hill climbs inside the budgets      |

## Rules

- A tier needs evidence: the command that runs the tests, the hook or CI file that enforces them, the budget file.
  Record it in the area's note.
- An area that goes `stale` keeps its tier but no autonomous change runs there until it is verified again.
- Some changes always need the user, at any tier: data and migrations, auth and permissions, payments, external
  APIs and anything you cannot revert with a check.
- The project's own rules can lower any of this. They never raise it.
- Blast radius lowers it too. In an area many teams or services depend on, treat the tier as one lower for any
  change that reaches those dependents.
- Raising a tier rarely needs a big change. Most tiers rise through ratchets: checks that stop new problems and let
  the old count fall over time. See [trend-up.md](trend-up.md).

## Why tiers

Tests and checks are what let an agent work alone safely. A tier makes that explicit, so "upgrade this area" has a
clear meaning: add the checks that let more of the work run by itself. That is the automation the skill is named
for.
