---
name: refactory
description: Turn a codebase into a factory that you map, understand and automate one area at a time. Use when the user wants to explore, map or understand a codebase (often a legacy one), find bottlenecks, raise an area's automation tier, plan upgrades, answer "how does this work" questions about the codebase, or rebuild the Factory.html report. Triggers - "refactory", "factory", "map this codebase", "where are the bottlenecks", "what should we improve next". Keeps a memory per codebase in .refactory/log.md and learns from the user's questions and corrections.
---

# Refactory

A legacy codebase is code whose theory has died: the people who knew why it is the way it is have left, and the
code alone does not say. Your job is to rebuild that theory, in the user's head and in your notes, and to use it to
make the codebase safer and faster to change. You do this the way a factory game is played: explore a bit, build a
bit, upgrade, explore further. Full coverage never comes first.

This is engineering work. Do not add points, badges or game talk to anything you write. The factory words below are
the shared vocabulary, nothing more.

## Vocabulary

- **Area:** a part of the codebase you map and upgrade as a unit (an app, a package, a service, a job).
- **Automation tier:** how much an agent may change in an area without asking. See
  [references/tiers.md](references/tiers.md).

  | Tier | Name      | Means                                        | Agent may                           |
  | ---- | --------- | -------------------------------------------- | ----------------------------------- |
  | 0    | by hand   | not mapped, or no checks                     | read and map only                   |
  | 1    | burner    | mapped, current behaviour pinned by tests    | make small changes the user reviews |
  | 2    | assembler | tests, types and lint guard it automatically | run keep-or-revert upgrades alone   |
  | 3    | bots      | budgets and benchmarks are enforced          | run hill climbs unattended          |

- **Upgrade:** raise an area's tier (add the missing tests, checks or budgets), or fix an issue inside an area at
  the tier it allows.
- **Bottleneck:** the one thing that most limits the codebase right now. Work on it before anything else.
- **Hill climb:** a measured, repeated improvement of one metric. Hand it to the `hillclimb` skill.
- **Rocket:** the win condition the user sets. "The whole codebase" is not a win condition.

## The instance folder

Each codebase keeps its state in `.refactory/` at the repo root. See
[references/instance.md](references/instance.md). Create it from [templates/](templates/) on the first session.

| File                 | Who reads it               | Format                                                     |
| -------------------- | -------------------------- | ---------------------------------------------------------- |
| `config.md`          | every session              | the rocket, scope, how to run checks, local rules          |
| `log.md`             | every session              | append-only memory, fixed format                           |
| `areas.tsv`          | every session, scripts     | fixed columns, read by `scripts/areas.sh`                  |
| `notes/`             | you                        | free: organise it however works best                       |
| `hillclimbs/<id>.md` | `hillclimb` skill          | one spec per recommended climb                             |
| `report.json`        | `scripts/build-report.mjs` | [references/report-schema.md](references/report-schema.md) |
| `Factory.html`       | the user only              | built from `report.json`, never edited by hand             |

Do not read `Factory.html` in a normal session. Read it only in the report playbook.

## Every session

1. **Load.** Read `config.md`, the last 200 lines of `log.md`, and `areas.tsv`. If `.refactory/` is missing, run
   the explore playbook's setup step first.
2. **Check freshness.** Run `scripts/areas.sh`. Mark every area it reports as `stale` in `areas.tsv`, and log it.
   A stale area drops to `sketched` confidence until you verify it again.
3. **Pick a playbook.** Use the first row that matches:

   | Situation                                                                  | Playbook                            |
   | -------------------------------------------------------------------------- | ----------------------------------- |
   | The user asks how or why something works, or corrects you                  | [questions](playbooks/questions.md) |
   | The user asks for an upgrade, a fix, or "what next" with a ready win       | [upgrade](playbooks/upgrade.md)     |
   | The user asks for the report, or a session changed the map or tiers        | [report](playbooks/report.md)       |
   | The same correction appears twice in `log.md`, or the user says "remember" | [reflect](playbooks/reflect.md)     |
   | Anything else, or the map has blank areas                                  | [explore](playbooks/explore.md)     |

4. **Work within the budget** in `config.md` (default: 30 minutes or 40 files read per autonomous pass). Then stop.
5. **Close.** Append to `log.md`. Write the three questions you most need the user to answer: intent, history, or
   what is dead, never things the code can tell you. Rebuild the report if the map, a tier or an upgrade changed.
   Reply with one line of status and the three questions.

## Rules

- **Evidence or unverified.** Every claim in your notes and the report cites a `path:line` or the command that
  produced it. A claim without evidence is marked `unverified`. See [references/evidence.md](references/evidence.md).
- **The tier gates the change.** Never change code in an area beyond what its tier allows. Data, migrations, auth,
  payments, external APIs and anything without a reversible check always need the user's go-ahead, whatever the
  tier.
- **One change, one check, keep or revert, one commit.** Never batch upgrades.
- **Stop the line.** When a check fails, stop and find out why before you do anything else. Log the cause.
- **The bottleneck first.** Improving anything that is not the current bottleneck is waste. After an upgrade, check
  whether the bottleneck moved.
- **Follow the project's own rules.** `config.md` and the repo's agent files (AGENTS.md, CLAUDE.md) win over this
  skill: how to run heavy commands, what needs a human, where secrets live.
- **Write plainly.** Short sentences, active voice, one idea per sentence, the same word for the same thing.
  Notes are read by other agents with nobody to ask.
