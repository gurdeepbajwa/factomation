// The factory floor: an isometric drawing of the codebase for Factory.html.
// Each area is a machine on its group's platform. The machine shows the tier, its footprint the size, smoke the
// recent changes, a red flag a stale map and hatching an unmapped area.
// Projection and shading follow anatomy (https://github.com/wheresryan22/anatomy, MIT, (c) 2026 Ryan): azimuth 45°,
// elevation 30°, light from the left in the floor plane, four tones for the sides.

const A = Math.PI / 4;
const E = Math.PI / 6;
const [sinA, cosA, sinE, cosE] = [Math.sin(A), Math.cos(A), Math.sin(E), Math.cos(E)];
const VIEW = [cosA, sinA];
const LIGHT = [-sinA, cosA];
const GAP = 1.2;
const MARGIN = 1;

const tenth = (v) => {
  const t = (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
  return t === "-0" ? "0" : t;
};
const pathOf = (pts, closed = true) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${tenth(x)} ${tenth(y)}`).join("") + (closed ? "Z" : "");

// Convex hull (monotone chain) of screen points.
function hull(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const out = [];
    for (const q of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
      out.push(q);
    }
    out.pop();
    return out;
  };
  return [...half(p), ...half([...p].reverse())];
}

// Drawing context for one platform: world [x, y, z] in floor units -> screen px.
function painter(k, origin) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const P = ([x, y, z]) => {
    const q = [
      origin[0] + (x * sinA - y * cosA) * k,
      origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k,
    ];
    bounds[0] = Math.min(bounds[0], q[0]);
    bounds[1] = Math.min(bounds[1], q[1]);
    bounds[2] = Math.max(bounds[2], q[0]);
    bounds[3] = Math.max(bounds[3], q[1]);
    return q;
  };
  const poly = (pts, cls) => `<path class="${cls}" d="${pathOf(pts.map(P))}"/>`;
  const line = (pts, cls) => `<path class="${cls}" d="${pathOf(pts.map(P), false)}"/>`;
  const shade = (n) => Math.min(3, Math.floor(((n[0] * LIGHT[0] + n[1] * LIGHT[1] + 1) / 2) * 4));

  function box(x0, y0, x1, y1, z0, z1) {
    const silhouette = [
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y0, z0],
      [x1, y1, z0],
      [x0, y1, z0],
      [x0, y1, z1],
    ];
    return [
      poly(
        [
          [x0, y1, z0],
          [x1, y1, z0],
          [x1, y1, z1],
          [x0, y1, z1],
        ],
        `s${shade([0, 1])}`,
      ),
      poly(
        [
          [x1, y0, z0],
          [x1, y1, z0],
          [x1, y1, z1],
          [x1, y0, z1],
        ],
        `s${shade([1, 0])}`,
      ),
      poly(
        [
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ],
        "tp",
      ),
      line(
        [
          [x0, y1, z1],
          [x1, y1, z1],
          [x1, y0, z1],
        ],
        "c",
      ),
      line(
        [
          [x1, y1, z1],
          [x1, y1, z0],
        ],
        "c",
      ),
      poly(silhouette, "o"),
    ].join("");
  }

  function ring(cx, cy, r, z, n) {
    return Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2;
      return [cx + r * Math.cos(t), cy + r * Math.sin(t), z];
    });
  }

  function cylinder(cx, cy, r, z0, z1, n = 14) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t0 = (i / n) * Math.PI * 2;
      const t1 = ((i + 1) / n) * Math.PI * 2;
      const nrm = [Math.cos((t0 + t1) / 2), Math.sin((t0 + t1) / 2)];
      if (nrm[0] * VIEW[0] + nrm[1] * VIEW[1] <= 0) continue;
      const a = [cx + r * Math.cos(t0), cy + r * Math.sin(t0)];
      const b = [cx + r * Math.cos(t1), cy + r * Math.sin(t1)];
      out.push(
        poly(
          [
            [...a, z0],
            [...b, z0],
            [...b, z1],
            [...a, z1],
          ],
          `s${shade(nrm)}`,
        ),
      );
    }
    out.push(poly(ring(cx, cy, r, z1, n), "tp"));
    const outline = hull([...ring(cx, cy, r, z0, n), ...ring(cx, cy, r, z1, n)].map(P));
    out.push(`<path class="o" d="${pathOf(outline)}"/>`);
    return out.join("");
  }

  function gear(cx, cy, r, z, teeth = 10) {
    const pts = [];
    for (let i = 0; i < teeth * 4; i++) {
      const t = (i / (teeth * 4)) * Math.PI * 2;
      const rr = i % 4 < 2 ? r : r * 0.78;
      pts.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t), z]);
    }
    return poly(pts, "gear") + poly(ring(cx, cy, r * 0.32, z, 10), "hub");
  }

  return { P, poly, line, box, cylinder, gear, ring, bounds };
}

// One machine per tier, built inside the footprint [x0, x0 + s] x [y0, y0 + s].
function machine(d, a, s, x0, y0) {
  const x1 = x0 + s;
  const y1 = y0 + s;
  const m = 0.12 * s;
  const parts = [];
  let top;
  let emit;
  const tier = Math.max(0, Math.min(3, a.tier ?? 0));
  if (tier === 0) {
    // Workbench: a top on four legs, a crate and a vise.
    const zt = 0.55 * s;
    const leg = 0.09 * s;
    for (const [lx, ly] of [
      [x0 + m, y0 + m],
      [x1 - m - leg, y0 + m],
      [x0 + m, y1 - m - leg],
      [x1 - m - leg, y1 - m - leg],
    ])
      parts.push(d.box(lx, ly, lx + leg, ly + leg, 0, zt));
    parts.push(d.box(x0 + m * 0.6, y0 + m * 0.6, x1 - m * 0.6, y1 - m * 0.6, zt, zt + 0.07 * s));
    const zc = zt + 0.07 * s;
    parts.push(d.box(x0 + m, y0 + m, x0 + 0.45 * s, y0 + 0.45 * s, zc, zc + 0.3 * s));
    parts.push(d.box(x1 - 0.32 * s, y1 - 0.3 * s, x1 - m, y1 - m * 1.1, zc, zc + 0.1 * s));
    top = zc + 0.3 * s;
    emit = [x0 + 0.28 * s, y0 + 0.28 * s, top];
  } else if (tier === 1) {
    // Burner: a riveted furnace with a glowing door and a chimney.
    const h = 0.5 * s;
    parts.push(d.box(x0 + m, y0 + m, x1 - m, y1 - m, 0, h));
    parts.push(d.box(x0 + m * 1.4, y0 + m * 1.4, x1 - m * 1.4, y1 - m * 1.4, h, h + 0.05 * s));
    const [da, db] = [x0 + 0.34 * s, x1 - 0.34 * s];
    parts.push(
      d.poly(
        [
          [da, y1 - m, 0.06 * s],
          [db, y1 - m, 0.06 * s],
          [db, y1 - m, 0.3 * s],
          [da, y1 - m, 0.3 * s],
        ],
        "door",
      ),
    );
    parts.push(
      d.poly(
        [
          [da + 0.04 * s, y1 - m, 0.08 * s],
          [db - 0.04 * s, y1 - m, 0.08 * s],
          [db - 0.04 * s, y1 - m, 0.17 * s],
          [da + 0.04 * s, y1 - m, 0.17 * s],
        ],
        "glow pulse",
      ),
    );
    for (const rx of [x0 + m * 1.7, x1 - m * 1.7]) {
      const [px, py] = d.P([rx, y1 - m, 0.42 * s]);
      parts.push(`<circle class="rivet" cx="${tenth(px)}" cy="${tenth(py)}" r=".9"/>`);
    }
    const [cx, cy] = [x0 + 0.3 * s, y0 + 0.3 * s];
    const ch = h + 0.05 * s + 0.45 * s;
    parts.push(d.cylinder(cx, cy, 0.09 * s, h + 0.05 * s, ch));
    parts.push(
      d.line(
        d
          .ring(cx, cy, 0.09 * s, ch - 0.12 * s, 14)
          .filter(([x, y]) => (x - cx) * VIEW[0] + (y - cy) * VIEW[1] > 0),
        "seam",
      ),
    );
    top = ch;
    emit = [cx, cy, ch];
  } else if (tier === 2) {
    // Assembler: a plinth, a housing with vents and a gear on top.
    const h = 0.48 * s;
    parts.push(d.box(x0 + m * 0.5, y0 + m * 0.5, x1 - m * 0.5, y1 - m * 0.5, 0, 0.07 * s));
    parts.push(d.box(x0 + m, y0 + m, x1 - m, y1 - m, 0.07 * s, h));
    for (let i = 0; i < 3; i++) {
      const z = 0.17 * s + i * 0.08 * s;
      parts.push(
        d.line(
          [
            [x1 - m, y0 + 0.3 * s, z],
            [x1 - m, y1 - 0.3 * s, z],
          ],
          "vent",
        ),
      );
    }
    parts.push(d.gear(x0 + s / 2, y0 + s / 2, 0.27 * s, h));
    top = h;
    emit = [x0 + s / 2, y0 + s / 2, h];
  } else {
    // Bots: a roboport with a tower, an antenna and two drones.
    const h = 0.36 * s;
    parts.push(d.box(x0 + m, y0 + m, x1 - m, y1 - m, 0, h));
    const t = 0.2 * s;
    const [cx, cy] = [x0 + s / 2, y0 + s / 2];
    parts.push(d.box(cx - t, cy - t, cx + t, cy + t, h, h + 0.22 * s));
    const at = h + 0.22 * s + 0.35 * s;
    parts.push(d.cylinder(cx, cy, 0.025 * s, h + 0.22 * s, at, 8));
    const lamp = d.P([cx, cy, at]);
    parts.push(
      `<circle class="lamp pulse" cx="${tenth(lamp[0])}" cy="${tenth(lamp[1])}" r="2.2"/>`,
    );
    for (const [i, [dx, dy]] of [
      [0.22, 0.75],
      [0.78, 0.3],
    ].entries()) {
      const zx = at + 0.1 * s;
      const q = 0.05 * s;
      parts.push(
        `<g class="drone" style="animation-delay:${i * -1.3}s">${d.box(x0 + dx * s - q, y0 + dy * s - q, x0 + dx * s + q, y0 + dy * s + q, zx, zx + 0.03 * s)}</g>`,
      );
    }
    top = at + 0.15 * s;
    emit = [x0 + 0.25 * s, y0 + 0.25 * s, h];
  }
  return { body: parts.join(""), top, emit };
}

/**
 * Draw the factory floor.
 * @param {Array} areas report areas with group, name, lines, changes, tier, confidence
 * @param {{width?: number, esc: (s: unknown) => string, tierName: (t: number) => string}} opts
 */
export function floorSvg(areas, { width = 360, esc, tierName }) {
  const maxLines = Math.max(1, ...areas.map((a) => a.lines));
  const maxChanges = Math.max(1, ...areas.map((a) => a.changes ?? 0));
  const groups = [...new Set(areas.map((a) => a.group ?? ""))];

  // Lay out each group as a platform: footprints shelf-packed into a near-square.
  const plans = groups.map((g) => {
    const items = areas
      .filter((a) => (a.group ?? "") === g)
      .map((a) => ({ a, s: Math.round((2 + 4 * Math.sqrt(a.lines / maxLines)) * 2) / 2 }))
      .sort((p, q) => q.s - p.s);
    const target = Math.max(items[0].s, Math.sqrt(items.reduce((t, i) => t + (i.s + GAP) ** 2, 0)));
    let [x, y, row, w] = [0, 0, 0, 0];
    for (const it of items) {
      if (x > 0 && x + it.s > target) {
        y += row + GAP;
        x = 0;
        row = 0;
      }
      it.x = x;
      it.y = y;
      x += it.s + GAP;
      row = Math.max(row, it.s);
      w = Math.max(w, x - GAP);
    }
    return { g, items, w, d: y + row };
  });

  // One scale for every platform, set by the widest, so sizes compare across groups.
  const unit = painter(1, [0, 0]);
  const spanOf = (p) => {
    const pts = [
      [-MARGIN, -MARGIN, 0],
      [p.w + MARGIN, -MARGIN, 0],
      [p.w + MARGIN, p.d + MARGIN, 0],
      [-MARGIN, p.d + MARGIN, 0],
    ].map(unit.P);
    return Math.max(...pts.map((q) => q[0])) - Math.min(...pts.map((q) => q[0]));
  };
  const pad = 8;
  const k = Math.min(24, (width - pad * 2) / Math.max(...plans.map(spanOf)));

  const layers = [];
  const labels = [];
  let cursor = 4;
  for (const p of plans) {
    const d = painter(k, [0, 0]);
    const out = [];
    const tags = [];

    // Platform with a tile grid every two units.
    out.push(`<g class="plate">${d.box(-MARGIN, -MARGIN, p.w + MARGIN, p.d + MARGIN, -0.6, 0)}`);
    for (let gx = 1; gx < p.w + MARGIN; gx += 2)
      out.push(
        d.line(
          [
            [gx, -MARGIN, 0],
            [gx, p.d + MARGIN, 0],
          ],
          "grid",
        ),
      );
    for (let gy = 1; gy < p.d + MARGIN; gy += 2)
      out.push(
        d.line(
          [
            [-MARGIN, gy, 0],
            [p.w + MARGIN, gy, 0],
          ],
          "grid",
        ),
      );
    out.push("</g>");

    // Machines back to front: rows by y, then x. Footprints never overlap, so this order is safe.
    const ordered = [...p.items].sort((i, j) => i.y - j.y || i.x - j.x);
    for (const it of ordered) {
      const { a, s, x, y } = it;
      const tier = Math.max(0, Math.min(3, a.tier ?? 0));
      const mapped = a.confidence && a.confidence !== "unknown";
      const heat = (a.changes ?? 0) / maxChanges;
      const info = `${a.group ? a.group + "/" : ""}${a.name} · ${a.lines.toLocaleString("en-US")} lines · ${a.changes ?? 0} changes · tier ${tier} ${tierName(tier)} · ${a.confidence ?? "unknown"}`;
      let body;
      let top = 0.1;
      let emit = null;
      if (mapped) {
        ({ body, top, emit } = machine(d, a, s, x, y));
      } else {
        body =
          d.poly(
            [
              [x, y, 0],
              [x + s, y, 0],
              [x + s, y + s, 0],
              [x, y + s, 0],
            ],
            "fogtile",
          ) +
          d
            .box(x + s * 0.18, y + s * 0.18, x + s * 0.82, y + s * 0.82, 0, 0.14 * s)
            .replace(/class="/g, 'class="ghost ');
        top = 0.14 * s;
      }
      let extra = "";
      if (a.confidence === "stale") {
        const [fx, fy] = [x + 0.1 * s, y + s - 0.1 * s];
        const ft = Math.max(top, 0.5 * s) + 0.35 * s;
        extra += d
          .cylinder(fx, fy, 0.02 * s, 0, ft, 6)
          .replace(/class="(s\d|tp)"/g, 'class="pole"');
        extra += d.poly(
          [
            [fx, fy, ft],
            [fx + 0.32 * s, fy, ft - 0.1 * s],
            [fx, fy, ft - 0.2 * s],
          ],
          "flag",
        );
      }
      if (emit && heat > 0.25) {
        const [ex, ey] = d.P(emit);
        const n = heat > 0.66 ? 3 : heat > 0.45 ? 2 : 1;
        for (let i = 0; i < n; i++)
          extra += `<circle class="puff" cx="${tenth(ex + (i % 2 ? 3 : -2))}" cy="${tenth(ey - 4 - i * 7)}" r="${tenth(2.5 + i * 1.4)}" style="animation-delay:${(i * -0.9).toFixed(1)}s"/>`;
      }
      const hit = d.poly(
        [
          [x, y, top],
          [x + s, y, top],
          [x + s, y, 0],
          [x + s, y + s, 0],
          [x, y + s, 0],
          [x, y + s, top],
        ],
        "hit",
      );
      out.push(
        `<g class="tile m t${tier}${mapped ? "" : " fogged"}" tabindex="0" role="button" aria-label="${esc(info)}" data-info="${esc(info)}">${body}${extra}${hit}</g>`,
      );

      // Labels float over the machines, like Factorio's alt mode.
      const [lx, ly] = d.P([x + s / 2, y + s / 2, 0]);
      const room = Math.floor((s * (sinA + cosA) * k - 6) / 5.7);
      const name = a.name.length > room ? a.name.slice(0, Math.max(2, room - 1)) + "…" : a.name;
      const wpx = name.length * 5.7 + 8;
      tags.push(
        `<g class="alt"><rect x="${tenth(lx - wpx / 2)}" y="${tenth(ly - 2)}" width="${tenth(wpx)}" height="13" rx="3"/><text x="${tenth(lx)}" y="${tenth(ly + 7.6)}" text-anchor="middle">${esc(name)}</text></g>`,
      );
    }
    // Leave room for smoke above the tallest machine.
    const [bx0, by0, bx1, by1] = d.bounds;
    const head = p.g ? 16 : 0;
    const top = by0 - 10;
    const shift = `translate(${tenth(width / 2 - (bx0 + bx1) / 2)} ${tenth(cursor + head - top)})`;
    if (p.g)
      layers.push(
        `<text class="district" x="${pad}" y="${tenth(cursor + 12)}">${esc(p.g.toUpperCase())}</text>`,
      );
    layers.push(`<g transform="${shift}">${out.join("\n")}</g>`);
    labels.push(`<g transform="${shift}">${tags.join("")}</g>`);
    cursor += head + (by1 - top) + 18;
  }
  const height = Math.ceil(cursor);
  const svg = `<svg class="floor" viewBox="0 0 ${width} ${height}" role="img" aria-label="The factory floor. Each area is a machine on its group's platform. The kind of machine shows the automation tier: a workbench is by hand, a furnace is burner, a geared assembler is assembler, and a roboport is bots. Footprint shows lines of code. Smoke marks many recent changes, a red flag a stale map, and a hatched tile an unmapped area.">
<defs><pattern id="fog" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" class="hatch"/></pattern></defs>
${layers.join("\n")}
<g class="labels">${labels.join("")}</g>
</svg>`;
  return { svg, height };
}
