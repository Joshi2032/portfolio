// Renders every project's share image (public/og/<id>-{es,en}.png) from the site copy.
// Run from the repo root: CHROME_PATH=<chrome or edge> node scripts/og-projects.mjs [id ...]
// With no ids it renders all projects. Projects listed in SHOTS use a screenshot instead of the plate.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { es } from "../src/logic/copy/es.js";
import { en } from "../src/logic/copy/en.js";
import { projectOrder } from "../src/logic/catalog.js";

const b64 = (f, t) => `data:${t};base64,${readFileSync("public/" + f).toString("base64")}`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Dark-theme plate colours, same as .plate-* in src/styles/Projects.css.
const PLATES = {
  "plate-ia": ["#e2ff57", "#1a220f"],
  "plate-lim": ["#ff8a95", "#26121a"],
  "plate-food": ["#ffb088", "#271910"],
  "plate-ops": ["#8fd4ff", "#121c22"],
  "plate-plant": ["#ffb0a4", "#241716"],
  "plate-cloud": ["#c8c6ff", "#171923"],
  "plate-avo": ["#b6e37a", "#142016"],
  "plate-shop": ["#f0d36a", "#241e10"],
};

// Projects whose card shows an app screenshot, with their own lede and lead tag.
const SHOTS = {
  aguacate: {
    img: "proyectos/aguacate/en-vivo.webp",
    es: { lede: "Tres modelos YOLO11n en cascada: Hass o Fuerte, y verde, maduro o pasado.", lead: "77.3% en fotos reales" },
    en: { lede: "Three cascaded YOLO11n models: Hass or Fuerte, and unripe, ripe, or overripe.", lead: "77.3% on real photos" },
  },
};

const only = process.argv.slice(2);
const fonts = `@font-face{font-family:F;src:url(${b64("fonts/fraunces-latin.woff2", "font/woff2")})}
@font-face{font-family:O;src:url(${b64("fonts/outfit-latin.woff2", "font/woff2")})}`;

function html(project, lang, d) {
  const [mark, bg] = PLATES[project.plate];
  const shot = SHOTS[project.id];
  const lede = shot ? shot[lang].lede : d.card.summary;
  const tags = shot ? [shot[lang].lead, ...d.tags.slice(0, 3)] : d.tags.slice(0, 3);
  const side = shot
    ? `<img class="shot" src="${b64(shot.img, "image/webp")}">`
    : `<div class="plate"><b>${project.index}</b><span>${esc(d.plate)}</span></div>`;
  return `<!doctype html><html><head><style>${fonts}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#10120e;color:#f4f0e6;font-family:O;position:relative;overflow:hidden;
background-image:linear-gradient(rgba(244,240,230,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(244,240,230,.035) 1px,transparent 1px);background-size:44px 44px}
body::after{content:"";position:absolute;right:-120px;top:-160px;width:560px;height:420px;background:radial-gradient(closest-side,rgba(226,255,87,.10),transparent)}
.col{position:absolute;left:72px;top:64px;width:660px;display:flex;flex-direction:column;gap:22px}
.k{color:${shot ? "#c6e26a" : mark};font-weight:600;letter-spacing:.14em;text-transform:uppercase;font-size:21px}
h1{margin-top:-4px;font-family:F;font-weight:500;font-size:62px;line-height:1.04;letter-spacing:-.03em}
p{width:640px;color:#b7b2a6;font-size:24px;line-height:1.45}
ul{margin-top:6px;display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0}
li{border:1px solid rgba(244,240,230,.22);border-radius:999px;padding:9px 20px;font-size:19px}
${shot ? "li:first-child{border-color:#e2ff57;color:#e2ff57}" : ""}
.f{position:absolute;left:72px;bottom:68px;display:flex;align-items:center;gap:16px;color:#b7b2a6;font-size:21px}
.f b{display:grid;place-items:center;width:46px;height:46px;border-radius:10px;background:#e2ff57;color:#15170f;font-family:F;font-size:19px}
.shot,.plate{position:absolute;z-index:1;right:72px;top:64px;width:330px;height:500px;border-radius:26px;border:1px solid rgba(244,240,230,.18)}
.shot{object-fit:cover;object-position:top}
.plate{background:${bg};padding:34px 30px;display:flex;flex-direction:column;justify-content:space-between}
.plate b{font-family:F;font-weight:400;font-size:96px;line-height:.9;color:${mark};letter-spacing:-.04em}
.plate span{font-family:F;font-weight:500;font-size:34px;line-height:1.12;margin-bottom:150px}
</style></head><body>
<div class="col"><div class="k">${esc(d.category)} · ${esc(d.meta)}</div><h1>${esc(d.title)}</h1><p>${esc(lede)}</p>
<ul>${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
<div class="f"><b>JI</b>Josué Isaí Salazar Castro · joshi2032.github.io/portfolio</div>
${side}
</body></html>`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const project of projectOrder) {
  if (only.length && !only.includes(project.id)) continue;
  for (const [lang, copy] of [["es", es], ["en", en]]) {
    await page.setContent(html(project, lang, copy.projects[project.id]), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/og/${project.id}-${lang}.png` });
    console.log(`og/${project.id}-${lang}.png`);
  }
}
await browser.close();
