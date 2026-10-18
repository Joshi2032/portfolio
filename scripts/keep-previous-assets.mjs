// Keeps the hashed CSS/JS of recent deploys available after a new deploy replaces them, so pages
// already open, restored tabs, and HTML still held by a browser cache or an old service worker can
// keep loading their styles and chunks. Runs in CI after the build and the service worker are
// generated (kept files are not precached). Never fails the build.
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = process.env.SITE_URL ?? "https://joshi2032.github.io/portfolio/";
const GENERATIONS = 10;
const HISTORY = "asset-history.json";

const get = (url) => fetch(url, { signal: AbortSignal.timeout(15000) }).then((r) => (r.ok ? r : null)).catch(() => null);
const text = async (url) => (await get(url))?.text() ?? "";
const own = readdirSync(join(dist, "assets")).filter((name) => /\.(js|css)$/.test(name));

// 1. What the live version references (pages + the chunks its JS imports).
const live = new Set();
for (const page of ["", "en/", "404.html", "sw.js"]) {
  for (const match of (await text(`${SITE}${page}`)).matchAll(/assets\/([\w.-]+\.(?:js|css))/g)) live.add(match[1]);
}
for (const name of [...live]) {
  if (!name.endsWith(".js")) continue;
  const body = await text(`${SITE}assets/${name}`);
  for (const match of body.matchAll(/(?:assets\/|["'`]\.\/)([\w.-]+\.(?:js|css))(?=["'`])/g)) live.add(match[1]);
}

// 2. Earlier generations recorded by previous deploys.
let history = [];
try {
  const parsed = JSON.parse(await text(`${SITE}${HISTORY}`));
  if (Array.isArray(parsed)) history = parsed.filter((g) => Array.isArray(g?.files));
} catch {
  /* first run or not reachable */
}

let kept = 0;
const wanted = new Set([...live, ...history.flatMap((g) => g.files)]);
for (const name of wanted) {
  const target = join(dist, "assets", name);
  if (existsSync(target)) continue;
  const response = await get(`${SITE}assets/${name}`);
  if (!response) continue;
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  kept += 1;
}

// 3. Files from before this history existed.
const legacy = join(root, "legacy-assets");
if (existsSync(legacy)) {
  for (const name of readdirSync(legacy).filter((n) => /\.(js|css)$/.test(n))) {
    const target = join(dist, "assets", name);
    if (!existsSync(target)) {
      copyFileSync(join(legacy, name), target);
      kept += 1;
    }
  }
}

// 4. Record this generation (plus the live one) for the next deploy.
const previous = [...live].filter((name) => !own.includes(name));
const next = [{ built: new Date().toISOString(), files: own }];
if (previous.length) next.push({ built: "previous", files: previous });
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, HISTORY), JSON.stringify([...next, ...history].slice(0, GENERATIONS)));
console.log(`keep-previous-assets: kept ${kept} file(s); history has ${Math.min(next.length + history.length, GENERATIONS)} generation(s)`);
