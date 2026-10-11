#!/usr/bin/env node
// Check that Factory.html lays out on a phone and a desktop.
// Usage: node check-report.mjs [Factory.html] [--shots <dir>]
// Needs Playwright with Chromium. WebKit is used too when it is installed,
// because every iPhone browser is WebKit.
// REFACTORY_PLAYWRIGHT: path to the playwright or @playwright/test package,
// when it is not resolvable from the current directory.
// Exits 1 and lists the problems when a check fails.
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const shotsAt = args.indexOf("--shots");
const shots = shotsAt >= 0 ? args[shotsAt + 1] : null;
const file = resolve(
  args.find((a, i) => !a.startsWith("--") && (shotsAt < 0 || i !== shotsAt + 1)) ??
    ".refactory/Factory.html",
);

const req = createRequire(resolve(process.cwd(), "noop.js"));
let pw;
for (const name of [process.env.REFACTORY_PLAYWRIGHT, "playwright", "@playwright/test"].filter(
  Boolean,
)) {
  try {
    pw = req(name);
    break;
  } catch {
    // try the next one
  }
}
if (!pw) {
  console.error(
    "Playwright not found. Install it, or set REFACTORY_PLAYWRIGHT to its package path.",
  );
  process.exit(2);
}

const runs = [
  ["phone", "webkit", { ...pw.devices["iPhone 15 Pro"], colorScheme: "dark" }],
  ["phone-light", "webkit", { ...pw.devices["iPhone 15 Pro"], colorScheme: "light" }],
  ["desktop", "chromium", { viewport: { width: 1280, height: 900 }, colorScheme: "dark" }],
];

const problems = [];
for (const [name, engine, opts] of runs) {
  let browser;
  try {
    browser = await pw[engine].launch();
  } catch (e) {
    if (engine === "webkit") {
      console.warn(`skip ${name}: WebKit did not launch (${String(e.message).split("\n")[0]})`);
      continue;
    }
    throw e;
  }
  const page = await (await browser.newContext(opts)).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(pathToFileURL(file).href);
  const found = await page.evaluate(() => {
    const out = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1)
      out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px > ${vw}px)`);
    for (const el of document.querySelectorAll("main *")) {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > vw + 1)
        out.push(
          `overflows the viewport: <${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}">`,
        );
    }
    // Factory floor: every machine and label inside the drawing, and no two labels on top of each other.
    for (const svg of document.querySelectorAll("svg.floor")) {
      const frame = svg.getBoundingClientRect();
      const inside = (r) =>
        r.left >= frame.left - 1 &&
        r.right <= frame.right + 1 &&
        r.top >= frame.top - 1 &&
        r.bottom <= frame.bottom + 1;
      for (const g of svg.querySelectorAll(".tile"))
        if (!inside(g.getBoundingClientRect()))
          out.push(`machine outside the floor: ${g.dataset.info.split(" ·")[0]}`);
      const tags = [...svg.querySelectorAll(".alt rect")].map((r) => r.getBoundingClientRect());
      tags.forEach((r, i) => {
        if (!inside(r))
          out.push(`label outside the floor: ${svg.querySelectorAll(".alt text")[i].textContent}`);
        for (const q of tags.slice(i + 1))
          if (
            r.left < q.right - 1 &&
            q.left < r.right - 1 &&
            r.top < q.bottom - 1 &&
            q.top < r.bottom - 1
          )
            out.push(`labels overlap: ${svg.querySelectorAll(".alt text")[i].textContent}`);
      });
    }
    const text = document.body.innerText;
    for (const bad of ["undefined", "NaN", "[object Object]", "${"]) {
      if (text.includes(bad)) out.push(`page text contains "${bad}"`);
    }
    return [...new Set(out)];
  });
  found.push(...errors.map((e) => `script error: ${e}`));
  for (const f of found) problems.push(`${name}: ${f}`);
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
  await browser.close();
  console.log(`${name}: ${found.length ? `${found.length} problem(s)` : "ok"}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
