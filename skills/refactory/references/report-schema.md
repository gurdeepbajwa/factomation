# report.json

`scripts/build-report.mjs` turns this into `Factory.html`. Every field is optional except `project`. Text fields
accept `**bold**` and `` `code` `` and nothing else. See `examples/demo/report.json` in the repository for a full
example.

```jsonc
{
  "banner": "text above the title, for demos and warnings",
  "project": "name",
  "commit": "short sha the map was built at",
  "date": "12 Oct 2026",
  "session": 9,
  "summary": "two sentences: where things stand",
  "win": {
    "rocket": "the win condition from config.md",
    "items": [{ "state": "done | part | todo", "value": "2 / 3", "text": "what is measured" }],
  },
  "since": "what changed since the last build",
  "areas": [
    {
      "group": "apps",
      "name": "web",
      "lines": 18400,
      "changes": 61, // commits in the window, from scripts/areas.sh
      "tier": 2,
      "confidence": "unknown | sketched | verified | stale",
    },
  ],
  "bottleneck": { "title": "", "confidence": "", "body": "", "plan": "", "evidence": "" },
  "questions": [{ "text": "", "evidence": "" }], // three at most
  "hillclimbs": [
    {
      "id": "matches hillclimbs/<id>.md",
      "title": "",
      "why": "",
      "metric": "",
      "baseline": "",
      "target": "",
      "area": "",
    },
  ],
  "flows": [{ "title": "", "caption": "", "steps": [{ "name": "", "note": "", "hot": true }] }], // 3–7 steps
  "findings": [
    {
      "title": "",
      "impact": "high | med | low",
      "confidence": "verified | sketched | unverified",
      "body": "",
      "evidence": "",
    },
  ],
  "upgrades": [
    {
      "date": "",
      "session": 8,
      "verdict": "kept | reverted",
      "title": "",
      "before": { "value": 51, "label": "51 queries" },
      "after": { "value": 2, "label": "2 queries" },
      "lowerIsBetter": true,
      "note": "",
    },
  ],
  "trends": [
    {
      "metric": "lint violations in invoices",
      "area": "invoices",
      "unit": "",
      "lowerIsBetter": true,
      "target": 0,
      "points": [{ "label": "S3", "value": 212 }], // oldest first, 2–12 points
    },
  ],
  "ridealongs": [
    {
      "area": "",
      "title": "",
      "size": "~120 lines",
      "status": "ready | drafted | waiting",
      "improves": "",
      "vehicle": "the business work it ships with",
      "evidence": "",
    },
  ],
  "stories": [{ "title": "", "body": "why it is like this", "source": "" }],
  "hotspots": [{ "path": "", "lines": 0, "changes": 0 }], // top 5 from scripts/hotspots.sh
}
```

Map colours show the tier. Hatching marks `unknown` areas. An orange outline marks areas with many recent changes. A
red corner marks `stale` areas. Tapping a tile shows its numbers.
