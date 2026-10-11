# The .refactory/ folder

One folder per codebase, at the repo root.

```
.refactory/
  config.md          the rocket, scope, budget, how to run checks, local rules
  log.md             append-only memory (format below)
  areas.tsv          one row per area (columns below)
  trends.tsv         one row per measurement (columns below)
  ridealongs.md      improvements waiting for a vehicle (format below)
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

## trends.tsv

Tab separated, one header row, append only. One row per number measured.

| Column   | Meaning                                                  |
| -------- | -------------------------------------------------------- |
| `date`   | `YYYY-MM-DD`                                             |
| `commit` | the commit measured                                      |
| `area`   | an area from `areas.tsv`, or `-` for the whole codebase  |
| `metric` | a stable name, for example `lint-violations` or `p95-ms` |
| `value`  | a number                                                 |

Measure the same way each time, with the command recorded in the area's note, so the points compare.

## ridealongs.md

One section per item, newest at the bottom. Remove an item only after it has shipped or been dropped, and log it.

```
## Split InvoiceService.send into render and deliver
- area: invoices · size: ~120 lines · status: ready (ready, drafted or waiting)
- improves: lets the e-invoicing feature add a third channel without touching render
- vehicle: e-invoicing (Q1), or any change to invoice delivery
- evidence: src/invoices/service.ts:88, branch refactory/invoice-send-split
```
