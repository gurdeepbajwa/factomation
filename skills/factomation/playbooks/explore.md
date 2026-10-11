# Explore

Map the codebase: first broad and shallow, then deeper where it matters.

## Setup (first session only)

1. Create `.factomation/` from `templates/`: `config.md`, `log.md`, `areas.tsv`, and an empty `notes/`.
2. Ask the user for the rocket (the win condition) and the scope. Offer a concrete draft, for example "invoices,
   payments and the API reach assembler tier, and month-end runs in under 10 minutes". Write it in `config.md`.
3. Read the project's own agent files (AGENTS.md, CLAUDE.md, CONTRIBUTING) and copy the rules that apply into
   `config.md`: how to run tests and heavy commands, what needs a human, what never to touch.
4. Ask whether `.factomation/` is committed (shared with the team) or ignored (private). Default: commit it, but
   never commit secrets or customer data into it.

## First pass: landmarks

Aim for a rough map of the whole codebase in one session. Do not read deeply yet.

1. Read the manifests, entry points, build and deploy config, and the test setup.
2. Split the codebase into 8–25 areas. Use the codebase's own boundaries (apps, packages, services, jobs). Add a
   group per area for the map (for example `apps`, `packages`, `jobs`).
3. Write `areas.tsv`: every area at tier 0, confidence `unknown`, `verified_at` `-`.
4. Run `scripts/hotspots.sh` and `scripts/areas.sh`. Hotspots (big files that change often) hold most of the risk.
5. For each area, write one note: what it is for, its entry points, what it depends on, and its landmarks (the 3–5
   files everyone must know). Set confidence to `sketched`.

## Later passes: routes and the survey

Pick the next area in this order:

1. Areas the user's questions cluster on (count them in `log.md`).
2. The area that holds the current bottleneck.
3. The highest hotspot score.
4. Areas still `unknown`.

In the chosen area:

- **Trace routes.** Follow one real request, job or data flow end to end. Record each step with `path:line`.
- **Ask why.** For code that looks odd, read `git log -L` or `git blame` and the linked PRs or issues before you
  guess. Record the reason as a story with its source. If nothing explains it, add it to the user's three questions.
- **Look for waste** along each route: waiting (sequential IO, N+1 queries), transport (data reshaped between
  layers), overproduction (work nobody uses), inventory (dead code, unused features), defects (retries, swallowed
  errors), and misleading names.
- **Record findings** with impact, confidence and how to measure them. A measurable finding with a clear metric is a
  hill climb candidate: write `.factomation/hillclimbs/<id>.md` from `templates/hillclimb.md`.
- **Verify.** An area is `verified` when you can answer a question about it from your notes that you did not trace,
  and the code confirms the answer. Set `verified_at` to the current commit.

## When to move on

Leave an area when the last pass found little compared with what other areas are likely to give. Do not try to
finish an area before you start the next. The map fills in over many sessions.
