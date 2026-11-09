// Renders the avocado share images (public/og/aguacate-{es,en}.png).
// Run from the repo root: CHROME_PATH=<chrome or edge> node scripts/og-aguacate.mjs
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const b64 = (f, t) => `data:${t};base64,${readFileSync("public/" + f).toString("base64")}`;
const copy = {
  es: { kicker: "Agro · App Flutter y cámaras", title: "Detector del estado del aguacate", lede: "Tres modelos YOLO11n en cascada: Hass o Fuerte, y verde, maduro o pasado.", tags: ["77.3% en fotos reales", "Flutter", "YOLO11n", "Supabase"] },
  en: { kicker: "Agriculture · Flutter app and cameras", title: "Avocado state detector", lede: "Three cascaded YOLO11n models: Hass or Fuerte, and unripe, ripe, or overripe.", tags: ["77.3% on real photos", "Flutter", "YOLO11n", "Supabase"] },
};
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [lang, c] of Object.entries(copy)) {
  await page.setContent(`<!doctype html><html><head><style>
@font-face{font-family:F;src:url(${b64("fonts/fraunces-latin.woff2","font/woff2")})}
@font-face{font-family:O;src:url(${b64("fonts/outfit-latin.woff2","font/woff2")})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#10120e;color:#f4f0e6;font-family:O;position:relative;overflow:hidden;
background-image:linear-gradient(rgba(244,240,230,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(244,240,230,.035) 1px,transparent 1px);background-size:44px 44px}
body::after{content:"";position:absolute;right:-120px;top:-160px;width:560px;height:420px;background:radial-gradient(closest-side,rgba(226,255,87,.10),transparent);}
.col{position:absolute;left:72px;top:64px;width:660px;display:flex;flex-direction:column;gap:22px}
.k{color:#c6e26a;font-weight:600;letter-spacing:.14em;text-transform:uppercase;font-size:21px}
h1{margin-top:-4px;font-family:F;font-weight:500;font-size:62px;line-height:1.04;letter-spacing:-.03em}
p{width:640px;color:#b7b2a6;font-size:24px;line-height:1.45}
ul{margin-top:6px;display:flex;flex-wrap:wrap;gap:10px;width:660px;list-style:none;padding:0}
li{border:1px solid rgba(244,240,230,.22);border-radius:999px;padding:9px 20px;font-size:19px}
li:first-child{border-color:#e2ff57;color:#e2ff57}
.f{position:absolute;left:72px;bottom:68px;display:flex;align-items:center;gap:16px;color:#b7b2a6;font-size:21px}
.f b{display:grid;place-items:center;width:46px;height:46px;border-radius:10px;background:#e2ff57;color:#15170f;font-family:F;font-size:19px}
img{position:absolute;right:72px;top:64px;width:330px;height:500px;object-fit:cover;object-position:top;border-radius:26px;border:1px solid rgba(244,240,230,.18)}
</style></head><body>
<div class="col"><div class="k">${c.kicker}</div><h1>${c.title}</h1><p>${c.lede}</p>
<ul>${c.tags.map((t) => `<li>${t}</li>`).join("")}</ul></div>
<div class="f"><b>JI</b>Josué Isaí Salazar Castro · joshi2032.github.io/portfolio</div>
<img src="${b64("proyectos/aguacate/en-vivo.webp","image/webp")}">
</body></html>`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/og/aguacate-${lang}.png` });
}
await browser.close();
