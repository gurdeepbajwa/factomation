# Reflect

Turn what the user taught you into rules, so no session makes the same mistake twice.

## In this codebase (do it yourself)

1. Read `log.md` for `correction`, `feedback` and `question` entries since the last `reflect` entry.
2. Group entries that share a cause. One correction is a fix. Two of the same kind are a rule.
3. For each rule, pick the strongest place it can live, in this order:
   1. the code (an architecture change that makes the mistake impossible),
   2. types, lint or CI,
   3. a test,
   4. a line in `config.md`.
4. Make the change, or propose it when the tier gate requires the user's go-ahead.
5. Append a `reflect` entry that lists each rule and where it now lives.

## In the skill (propose, never apply)

Some lessons are not about this codebase. They are about how this skill works, for example "skip generated files
when you score hotspots".

1. Write the lesson in general terms. Remove every project name, path, person, number and business detail.
2. Show the user the exact text and ask whether to send it upstream.
3. Only with a yes: open an issue or pull request on the factomation repository with the lesson as a change to the
   skill, or append it to `LEARNINGS.md` in a pull request.
