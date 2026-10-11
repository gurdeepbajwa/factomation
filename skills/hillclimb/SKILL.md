---
name: hillclimb
description: Improve one measurable metric step by step - one change, one measurement, keep or revert - until it hits a target. Use when the user runs "/hillclimb <id>" for a climb that factomation recommended (spec in .factomation/hillclimbs/<id>.md), or asks to hill climb, optimise or tune one number (speed, size, query count, memory, error rate, accuracy) against a target. Works with or without factomation.
---

# Hill climb

You own one metric and the honesty of the experiment. You improve the metric through small attempts, each one
measured, each one kept or reverted in full. You never claim a win from reading code.

## 1. Load the spec

- With factomation: read `.factomation/hillclimbs/<id>.md`, `.factomation/config.md`, and the notes for the areas the
  spec names. Check each area's tier in `.factomation/areas.tsv`:
  - tier 3: run unattended inside the spec's guards;
  - tier 2: run alone, but stop after each kept change if the user asked to review;
  - tier 0–1: ask the user before every change, or raise the tier first with factomation's upgrade playbook.
- Without factomation: write the same spec with the user from `templates/hillclimb.md` in the factomation skill, or
  these fields: metric, measure command, baseline, target, guards, lower is better, out of bounds. Save it as
  `hillclimb-<id>.md` at the repo root, or wherever the user wants it.
- If the target, the metric or the guards are unclear, ask now. Do not start a loop on a vague target.

## 2. Build the measurement and prove it

1. Pick a workload that reproduces the real problem: realistic data size, state and concurrency.
2. Write or reuse one command that prints the metric. It also prints an error count and a work count (rows written,
   requests served), so a fast failure cannot pass as a win.
3. Prove it is sensitive: run it on a case that should be slower or bigger and check the number moves. If it does
   not move, the harness measures the wrong thing. Fix it before you go on.
4. Measure the baseline. For timings, run at least five times and note the median and range. That range is the
   noise. Prefer counts over timings when the metric allows.
5. Freeze the harness. From now on, do not change it. A change to the harness invalidates every earlier result.

Vet every number with [references/benchmark-checklist.md](references/benchmark-checklist.md).

## 3. Loop

Keep a decision log: `.factomation/hillclimbs/<id>.tsv`, or `hillclimb-<id>.tsv` without factomation. One row per
attempt:

```
n	hypothesis	change	before	after	delta	guards	verdict	note
```

Read the log before each attempt. Then, one hypothesis per attempt:

1. Name the mechanism: "batch the per-customer balance query into one join", not "try caching". Ground it in the
   code you read. Try the cheapest change that could remove the limit first.
2. Make the change. Keep it small and inside the spec's bounds.
3. Measure with the frozen harness, alternating with the previous version for timings. Run the guards.
4. **Keep** only when the metric moved past the noise and every guard is green. **Revert** in full otherwise. "Might
   help" is a revert.
5. Commit a kept change on its own, staging only the files you changed. Log the row either way.
6. After a kept change, check whether the limit moved somewhere else. Re-profile before the next hypothesis.

Correctness and simplicity outrank the number. Revert a win that makes the code much harder to follow, and log why.

## 4. Plateaus and stopping

- After three reverts in a row, change approach: re-read the code, profile again, combine two near misses, or try
  something bigger.
- Stop when the target is met, when the budget in the spec or `config.md` runs out, or when the remaining ideas cost
  more than they could gain. Never relax the target to meet it.
- If you are stuck, stop and say so with what you tried. Do not spin.

## 5. Report

- Update the spec: status, final value, date and commit.
- With factomation: append one `upgrade` entry per kept change to `.factomation/log.md`, and a `session` entry with
  the result. The next report build shows them.
- Reply with: metric and target, baseline → final with the percent change, attempts (kept and reverted), one line
  per kept change, the log path, and the next idea you would try.
