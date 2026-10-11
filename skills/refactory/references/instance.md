# The .refactory/ folder

One folder per codebase, at the repo root.

```
.refactory/
  config.md          the rocket, scope, budget, how to run checks, local rules
  log.md             append-only memory (format below)
  areas.tsv          one row per area (columns below)
  notes/             your own notes; any layout that works
  hillclimbs/<id>.md one spec per recommended hill climb
  report.json        input for the report
  Factory.html       the report; built, never edited
```

## log.md

Append only. One entry per event. Newest at the bottom.

```
## 2026-10-12 · session 9 · question/flow
Q: How does an invoice get from "send" to the customer's inbox?
A: Controller → InvoiceService → pdf-render → email job. notes/invoices.md#send
```

Entry types:

| Type                                            | Use for                                                      |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `question/start`, `/around`, `/flow`, `/system` | a question from the user, by kind                            |
| `correction`                                    | the user said a claim was wrong: what you said, what is true |
| `feedback`                                      | the user's view on how you work or what they want            |
| `decision`                                      | a choice the user made, and why                              |
| `finding`                                       | an issue or win, with evidence                               |
| `tier`                                          | an area changed tier, with the evidence                      |
| `upgrade`                                       | a change: what, check, before, after, kept or reverted       |
| `stale`                                         | areas that went stale, from `scripts/areas.sh`               |
| `reflect`                                       | rules created from the log, and where each one lives         |
| `session`                                       | the close: what moved, and the three questions               |

When `log.md` passes about 2,000 lines, move entries older than the last `reflect` to `log-<year>.md` and leave a
one-line pointer.

## areas.tsv

Tab separated, one header row.

| Column        | Meaning                                           |
| ------------- | ------------------------------------------------- |
| `area`        | short name, unique                                |
| `group`       | district on the map, for example `apps` or `jobs` |
| `paths`       | space-separated git pathspecs                     |
| `tier`        | 0–3                                               |
| `confidence`  | `unknown`, `sketched`, `verified` or `stale`      |
| `verified_at` | commit the area was last verified at, or `-`      |

`scripts/areas.sh` reads this file.
