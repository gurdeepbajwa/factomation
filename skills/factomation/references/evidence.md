# Evidence

The biggest risk in mapping a codebase is a confident, wrong map. A wrong claim written today is read as fact by
the next session. These rules stop that.

- Every claim cites where it came from: a `path:line`, a command and its output, a commit, a PR or issue, or "user,
  session N".
- A claim with no citation is `unverified`. Show that word wherever the claim appears, including the report.
- Confidence per area:
  - `unknown`: not looked at.
  - `sketched`: read, not checked.
  - `verified`: checked against the code at `verified_at`; you answered an untraced question from the notes and
    the code agreed.
  - `stale`: files in the area changed since `verified_at`.
- Treat old docs, comments and READMEs as claims to check, not as facts.
- Numbers come from commands run in this session. Never copy a number from an old note or report without running
  the command again.
- For timings, run each side at least five times, alternating, and report the median and range. Prefer counts
  (queries, bytes, files, failures) over timings: they do not drift with machine load.
