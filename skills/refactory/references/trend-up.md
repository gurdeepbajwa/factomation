# Enterprise mode: trend up, never sledgehammer

This applies when `config.md` sets `mode: enterprise`. Ratchets and trend lines help in `normal` mode too.

Refactory is built for large, shared codebases where a change can reach many teams and users, and where code ships
on a release process, usually with a business reason such as a feature. In that world a rewrite is the most
dangerous move there is, and a cleanup with no business reason may never ship.

So Refactory improves a codebase the way compound interest grows money: small changes, each safe on its own,
that never go backwards. The measure of success is the trend, not the size of any one change.

## The four moves

### 1. Ratchets: never worse, slowly better

A ratchet is a check that fails when a number gets worse, and passes when it stays the same or improves. It does not
demand the code be fixed today.

1. Count today's problems: type errors, lint violations, untested files, slow queries, bundle size.
2. Store the count, or the list of offenders, in a baseline file in the repo.
3. Add a check: new code must meet the standard, and the baseline count may only go down. When it goes down, the
   check lowers the baseline automatically or asks for it to be lowered in the same change.

A ratchet is the cheapest way to raise a tier. It ships with no behaviour change, so it rarely needs a business
reason. Prefer the project's existing tools for this (for example per-file lint overrides, type-check baselines, or
tools built for ratchets). Write a small script only when none fit.

### 2. Ride-alongs: improvements that travel with feature work

Most improvements touch behaviour or structure and need a release vehicle. Do not ship them alone. Prepare them so
they are ready when business work touches the same area:

- **Preparatory refactoring.** "Make the change easy, then make the easy change." When a feature is coming to an
  area, prepare the refactor that makes it easy, as its own small reviewable change that lands just before the
  feature.
- **Leave it better.** Every change to an area may carry one small, related improvement in the same review.
- Keep a ride-along queue: each item names its area, its size, what it improves, and what vehicle it waits for. The
  report lists them, so when a team plans work in an area they see what to bring along.

### 3. Parallel change: move without breaking

When structure must change, never switch in one step.

- **Expand, migrate, contract.** Add the new path beside the old one. Move callers across in small batches. Remove
  the old path only when nothing uses it.
- **Strangler.** Route a small slice of traffic or callers to the new code, grow the slice, then retire the old code.
- **Flags.** Ship new behaviour switched off, turn it on for a few, then for all. Remove the flag after.

Each step ships on its own and can stop halfway without harm.

### 4. Measure the trend

Pick a few numbers per area that matter to the rocket and record them every session: violations, test coverage of
hotspots, query counts, build time, error rates. The report shows them as trend lines. A flat or rising problem line
is a finding.

## Sizing

- One change does one thing and fits in one sitting of review. The config sets a size limit (default: about 300
  changed lines, excluding generated files and lockfiles).
- A change that touches many teams' code is split by owner, so each owner reviews only their part.
- Mechanical changes across many files (renames, formatting, codemods) need the user's go-ahead and an owner per
  part, even when each part is small. Run them in batches, not all at once.

## Never

- Rewrite an area from scratch.
- Reformat or restructure code you are not otherwise changing.
- Upgrade a framework, language or major dependency in one step.
- Bundle unrelated improvements into one change.
- Merge, release or turn on a flag. People do that, through their process.
- Ship an improvement against the change process: freezes, approvals, owners and release trains in `config.md` win.

## When a big change really is needed

Some limits cannot be removed in small steps. Then the skill's job is to make the case, not the change: write the
evidence, the cost of doing nothing, the steps as a parallel change, and the first small step. Put it in the report
as a finding for the people who own the decision.
