#!/usr/bin/env node
// Build Factory.html from report.json.
// Usage: node build-report.mjs [report.json] [Factory.html]
// Defaults: .factomation/report.json -> .factomation/Factory.html
// The schema is documented in ../references/report-schema.md.
import { readFileSync, writeFileSync } from "node:fs";

const input = process.argv[2] ?? ".factomation/report.json";
const output = process.argv[3] ?? input.replace(/report\.json$/, "Factory.html");
const r = JSON.parse(readFileSync(input, "utf8"));

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
// Plain text with **bold** and `code` only.
const txt = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
const fmt = (n) => Number(n).toLocaleString("en-US");
const list = (a) => (Array.isArray(a) ? a : []);

const TIERS = [
  { key: "t0", name: "by hand" },
  { key: "t1", name: "burner" },
  { key: "t2", name: "assembler" },
  { key: "t3", name: "bots" },
];

// ---------- treemap ----------
function worst(row, side) {
  const s = row.reduce((a, x) => a + x.a, 0);
  const max = Math.max(...row.map((x) => x.a));
  const min = Math.min(...row.map((x) => x.a));
  return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min));
}
function squarify(items, x, y, w, h) {
  const total = items.reduce((a, i) => a + i.v, 0);
  if (!total) return [];
  const scale = (w * h) / total;
  let rest = items.map((i) => ({ ...i, a: i.v * scale })).sort((a, b) => b.a - a.a);
  const out = [];
  while (rest.length) {
    const side = Math.min(w, h);
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side))
      row.push(rest[i++]);
    rest = rest.slice(i);
    const s = row.reduce((a, q) => a + q.a, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      for (const q of row) {
        const rh = q.a / cw;
        out.push({ ...q, x, y: cy, w: cw, h: rh });
        cy += rh;
      }
      x += cw;
      w -= cw;
    } else {
      const rh = s / w;
      let cx = x;
      for (const q of row) {
        const rw = q.a / rh;
        out.push({ ...q, x: cx, y, w: rw, h: rh });
        cx += rw;
      }
      y += rh;
      h -= rh;
    }
  }
  return out;
}

const areas = list(r.areas).filter((a) => a.lines > 0);
const groups = [...new Set(areas.map((a) => a.group ?? ""))];
const totalLines = areas.reduce((s, a) => s + a.lines, 0) || 1;
const maxChanges = Math.max(1, ...areas.map((a) => a.changes ?? 0));
const W = 360;
const LABEL = 18;
const MAP_H = Math.max(260, Math.min(520, 120 * groups.length + 200));
const usable = MAP_H - LABEL * groups.length;
let cursor = 0;
const groupSvg = [];
const tiles = [];
for (const g of groups) {
  const members = areas.filter((a) => (a.group ?? "") === g);
  const lines = members.reduce((s, a) => s + a.lines, 0);
  const h = Math.max(60, (usable * lines) / totalLines);
  if (g) {
    groupSvg.push(
      `<text class="district" x="0" y="${(cursor + 12).toFixed(1)}">${esc(g.toUpperCase())}</text>`,
    );
  }
  tiles.push(
    ...squarify(
      members.map((a) => ({ ...a, v: a.lines })),
      0,
      cursor + LABEL,
      W,
      h,
    ),
  );
  cursor += LABEL + h;
}
const mapH = Math.ceil(cursor);

const tileSvg = tiles
  .map((t) => {
    const p = 1.5;
    const x = t.x + p;
    const y = t.y + p;
    const w = t.w - p * 2;
    const h = t.h - p * 2;
    const tier = Math.max(0, Math.min(3, t.tier ?? 0));
    const mapped = t.confidence && t.confidence !== "unknown";
    const heat = (t.changes ?? 0) / maxChanges;
    const sub = `${(t.lines / 1000).toFixed(1)}k lines`;
    const label = w > Math.max(t.name.length * 7, sub.length * 6.7) + 12 && h > 34;
    const small = !label && w > 24 && h > 15;
    const info = `${t.group ? t.group + "/" : ""}${t.name} · ${fmt(t.lines)} lines · ${t.changes ?? 0} changes · tier ${tier} ${TIERS[tier].name} · ${t.confidence ?? "unknown"}`;
    const box = (cls, extra = "") =>
      `<rect class="${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3"${extra}/>`;
    return `<g class="tile t${tier}${mapped ? "" : " fogged"}" tabindex="0" data-info="${esc(info)}">
<title>${esc(info)}</title>
${box("base")}
${mapped ? "" : box("fog", ' fill="url(#fog)"')}
${t.confidence === "stale" ? `<path class="stale" d="M${(x + w - 12).toFixed(1)} ${y.toFixed(1)}h9a3 3 0 0 1 3 3v9z"/>` : ""}
${heat > 0.25 ? `<rect class="heat" x="${(x + 1).toFixed(1)}" y="${(y + 1).toFixed(1)}" width="${(w - 2).toFixed(1)}" height="${(h - 2).toFixed(1)}" rx="2.5" stroke-width="${(1 + heat * 2.5).toFixed(1)}"/>` : ""}
${label ? `<text class="t-name" x="${(x + 7).toFixed(1)}" y="${(y + 16).toFixed(1)}">${esc(t.name)}</text><text class="t-sub" x="${(x + 7).toFixed(1)}" y="${(y + 29).toFixed(1)}">${sub}</text>` : ""}
${small ? `<text class="t-tiny" x="${(x + 4).toFixed(1)}" y="${(y + 12).toFixed(1)}">${esc(t.name.slice(0, Math.floor((w - 7) / 5.6)))}</text>` : ""}
</g>`;
  })
  .join("\n");

const tierShare = TIERS.map((_, i) =>
  (
    (areas.filter((a) => (a.tier ?? 0) === i).reduce((s, a) => s + a.lines, 0) / totalLines) *
    100
  ).toFixed(1),
);

// ---------- sections ----------
const section = (title, body) => (body ? `<h2>${esc(title)}</h2>\n${body}` : "");
const conf = (c) => (c ? `<span class="tag c-${esc(c)}">${esc(c)}</span>` : "");
const evidence = (e) => (e ? `<div class="evidence">${txt(e)}</div>` : "");

const win = r.win
  ? `<section class="goal" aria-label="Win condition">
<div class="label">Win condition</div>
${r.win.rocket ? `<p class="rocket">${txt(r.win.rocket)}</p>` : ""}
<ul>${list(r.win.items)
      .map(
        (i) =>
          `<li class="${esc(i.state ?? "todo")}"><b>${esc(i.value ?? "")}</b><span>${txt(i.text)}</span></li>`,
      )
      .join("")}</ul>
<div class="bar" role="img" aria-label="Share of code by automation tier">${TIERS.map((t, i) => `<i class="${t.key}" style="width:${tierShare[i]}%"></i>`).join("")}</div>
<div class="legend">${TIERS.map((t, i) => `<span class="${t.key}">${t.name} ${tierShare[i]}%</span>`).join("")}</div>
</section>`
  : "";

const map = areas.length
  ? `<section class="map">
<svg viewBox="0 0 ${W} ${mapH}" role="img" aria-label="Treemap of the codebase. Size is lines of code, colour is automation tier, hatching is unmapped, an orange outline is a hotspot, a red corner is stale.">
<defs><pattern id="fog" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--paper)" stroke-width="2" opacity=".5"/></pattern></defs>
${groupSvg.join("\n")}
${tileSvg}
</svg>
<div class="legend">${TIERS.map((t) => `<span class="${t.key}">${t.name}</span>`).join("")}<span class="fogk">unmapped</span><span class="hs">hotspot</span><span class="st">stale</span></div>
<div class="tileinfo" id="tileinfo">Tap a tile.</div>
<p class="caption">Size is lines of code. Colour is the automation tier: how much an agent may do there alone. An orange outline marks an area that changed a lot recently.</p>
</section>`
  : "";

const b = r.bottleneck;
const bottleneck = b
  ? `<article class="card focus"><h3>${txt(b.title)}</h3><p>${conf(b.confidence)}${txt(b.body)}</p>${b.plan ? `<p><b>Plan:</b> ${txt(b.plan)}</p>` : ""}${evidence(b.evidence)}</article>`
  : "";

const questions = list(r.questions).length
  ? `<section class="qs">${list(r.questions)
      .map((q) => `<div class="card q"><p>${txt(q.text)}</p>${evidence(q.evidence)}</div>`)
      .join("")}</section>`
  : "";

function flowSvg(f) {
  const steps = list(f.steps);
  const H = steps.length * 70;
  const nodes = steps
    .map((s, i) => {
      const y = i * 70 + 6;
      const arrow =
        i < steps.length - 1
          ? `<path class="edge" d="M180 ${y + 40}V${y + 68}" marker-end="url(#ar)"/>`
          : "";
      return `<g class="node${s.hot ? " hot" : ""}"><rect x="90" y="${y}" width="180" height="40" rx="6"/><text x="180" y="${y + 19}" text-anchor="middle">${esc(s.name)}</text>${s.note ? `<text class="s" x="180" y="${y + 33}" text-anchor="middle">${esc(s.note)}</text>` : ""}</g>${arrow}`;
    })
    .join("");
  return `<h3 class="ftitle">${txt(f.title)}</h3><svg viewBox="0 0 360 ${H}" role="img" aria-label="${esc(f.title)}"><defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--faint)"/></marker></defs>${nodes}</svg>${f.caption ? `<p class="caption">${txt(f.caption)}</p>` : ""}`;
}
const flows = list(r.flows).length
  ? `<section class="flow">${list(r.flows).map(flowSvg).join("")}</section>`
  : "";

const findings = list(r.findings).length
  ? `<div class="cols">${list(r.findings)
      .map(
        (f) =>
          `<article class="card"><h3>${txt(f.title)}</h3><p><span class="tag i-${esc(f.impact ?? "low")}">${esc(f.impact ?? "low")}</span>${conf(f.confidence)}${txt(f.body)}</p>${evidence(f.evidence)}</article>`,
      )
      .join("")}</div>`
  : "";

const climbs = list(r.hillclimbs).length
  ? `<div class="cols">${list(r.hillclimbs)
      .map(
        (h) =>
          `<article class="card climb"><h3>${txt(h.title)}</h3><p>${txt(h.why)}</p><dl><dt>metric</dt><dd>${txt(h.metric)}</dd><dt>now</dt><dd>${txt(h.baseline ?? "not measured")}</dd><dt>target</dt><dd>${txt(h.target)}</dd>${h.area ? `<dt>area</dt><dd>${txt(h.area)}</dd>` : ""}</dl><div class="run">Ask your agent: <code>/hillclimb ${esc(h.id)}</code></div></article>`,
      )
      .join("")}</div>`
  : "";

function bars(u) {
  const bv = Number(u.before?.value);
  const av = Number(u.after?.value);
  if (!Number.isFinite(bv) || !Number.isFinite(av)) return "";
  const max = Math.max(bv, av) || 1;
  const better = u.lowerIsBetter === false ? av > bv : av < bv;
  return `<div class="delta"><span>before</span><span class="b" style="width:${((bv / max) * 100).toFixed(0)}%"></span><span>${esc(u.before.label ?? bv)}</span><span>after</span><span class="a${better ? "" : " bad"}" style="width:${((av / max) * 100).toFixed(0)}%"></span><span>${esc(u.after.label ?? av)}</span></div>`;
}
const upgrades = list(r.upgrades).length
  ? `<ul class="tl">${list(r.upgrades)
      .map(
        (u) =>
          `<li class="v-${esc(u.verdict)}"><div class="when">${esc(u.date ?? "")}${u.session ? ` · session ${esc(u.session)}` : ""}</div><div class="what"><span class="tag v-${esc(u.verdict)}">${esc(u.verdict)}</span>${txt(u.title)}</div>${bars(u)}${evidence(u.note)}</li>`,
      )
      .join("")}</ul>`
  : "";

const stories = list(r.stories)
  .map(
    (s) =>
      `<div class="story"><h3>${txt(s.title)}</h3><p>${txt(s.body)}</p>${s.source ? `<div class="src">From: ${txt(s.source)}</div>` : ""}</div>`,
  )
  .join("");

const hs = list(r.hotspots);
const maxScore = Math.max(1, ...hs.map((h) => h.lines * h.changes));
const hotspots = hs.length
  ? `<ul class="hot-list">${hs
      .map(
        (h) =>
          `<li><span class="hf">${esc(h.path)}</span><span class="hbar"><i style="width:${(((h.lines * h.changes) / maxScore) * 100).toFixed(0)}%"></i></span><span class="hn">${fmt(h.lines)} lines · ${fmt(h.changes)} changes</span></li>`,
      )
      .join(
        "",
      )}</ul><p class="caption">Size × recent changes. A small share of files usually holds most of the risk.</p>`
  : "";

// ---------- page ----------
const css = readFileSync(new URL("./report.css", import.meta.url), "utf8");
const meta = [
  r.commit && `Map at ${esc(r.commit)}`,
  r.date && esc(r.date),
  r.session && `session ${esc(r.session)}`,
]
  .filter(Boolean)
  .join(" · ");
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark light">
<title>Factory · ${esc(r.project)}</title>
<style>
${css}
</style>
</head>
<body>
<main>
${r.banner ? `<div class="banner">${txt(r.banner)}</div>` : ""}
<header>
<div class="kicker">Factory</div>
<h1>${esc(r.project)}</h1>
<div class="meta">${meta}</div>
${r.summary ? `<p class="lede">${txt(r.summary)}</p>` : ""}
</header>
${win}
${section("Since last time", r.since ? `<p>${txt(r.since)}</p>` : "")}
${section("The map", map)}
${section("Current bottleneck", bottleneck)}
${section("Questions for you", questions)}
${section("Recommended hill climbs", climbs)}
${section("How it flows", flows)}
${section("Findings", findings)}
${section("Upgrades", upgrades)}
${section("Why it's like this", stories)}
${section("Hotspots", hotspots)}
<footer>Built by factomation from the agents' notes${r.commit ? ` at ${esc(r.commit)}` : ""}. Agents read this page only when they rebuild it.</footer>
</main>
<script>
document.querySelectorAll(".tile").forEach(function (g) {
  function pick() {
    document.querySelectorAll(".tile.sel").forEach(function (x) { x.classList.remove("sel"); });
    g.classList.add("sel");
    document.getElementById("tileinfo").textContent = g.dataset.info;
  }
  g.addEventListener("click", pick);
  g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") pick(); });
});
</script>
</body>
</html>
`;
writeFileSync(output, html);
console.log(`wrote ${output} (${areas.length} areas, ${Math.round(html.length / 1024)} KB)`);
