// Accessibility check (axe-core, WCAG 2 A/AA) on key pages, dark and light.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";
import { startServer } from "./serve.mjs";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const server = await startServer();
const base = `http://localhost:${server.address().port}/portfolio/`;
const pages = ["", "?lang=en", "?p=aguacate", "?p=aguacate&lang=en", "?p=ensamble", "?p=kaizen"];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
let failures = 0;
for (const scheme of ["dark", "light"]) {
  for (const path of pages) {
    const context = await browser.newContext({ colorScheme: scheme, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.route(/goatcounter|zgo\.at|jsdelivr|unpkg/, (route) => route.abort());
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(800);
    // Expand collapsible sections (e.g. the technical note in the dialog) so they are checked too.
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] });
      return result.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 5).join(", ")}`);
    });
    const label = `${scheme} /portfolio/${path}`;
    if (violations.length) {
      failures += violations.length;
      console.error(`✗ ${label}\n  ${violations.join("\n  ")}`);
    } else {
      console.log(`✓ ${label}`);
    }
    await context.close();
  }
}
await browser.close();
server.close();
if (failures) {
  console.error(`${failures} accessibility violation(s)`);
  process.exit(1);
}
