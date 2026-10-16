// Generates static share pages (per project and per note) with their own
// Open Graph / Twitter meta, plus the sitemap. Runs after `vite build`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { es } from "../src/logic/copy/es.js";
import { en } from "../src/logic/copy/en.js";
import { projectOrder } from "../src/logic/catalog.js";
import { note } from "../src/notes/detectorAguacate.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://joshi2032.github.io/portfolio/";
const BASE = "/portfolio/";
const copy = { es, en };
const today = new Date().toISOString().slice(0, 10);

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function write(path, html) {
  const file = join(dist, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html, "utf8");
}

const prefix = (lang) => (lang === "en" ? "en/" : "");
export const projectPath = (lang, id) => `${prefix(lang)}proyectos/${id}/`;
const notePath = (lang) => `${prefix(lang)}notas/${note.slug}/`;

function head({ lang, title, description, url, image, alternates, extra = "" }) {
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="es" href="${alternates.es}" />
    <link rel="alternate" hreflang="en" href="${alternates.en}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Josué Isaí Salazar Castro" />
    <meta property="og:locale" content="${lang === "en" ? "en_US" : "es_MX"}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="author" content="Josué Isaí Salazar Castro" />
    <link rel="icon" href="${BASE}favicon.ico" sizes="32x32" />
    <link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png" />
${extra}  </head>`;
}

const sitemap = [];

for (const project of projectOrder) {
  for (const lang of ["es", "en"]) {
    const details = copy[lang].projects[project.id];
    const title = `${details.title} · Josué Isaí Salazar Castro`;
    const url = `${SITE}${projectPath(lang, project.id)}`;
    const target = `${BASE}?p=${project.id}${lang === "en" ? "&lang=en" : ""}`;
    const alternates = { es: `${SITE}${projectPath("es", project.id)}`, en: `${SITE}${projectPath("en", project.id)}` };
    write(
      projectPath(lang, project.id),
      `${head({
        lang,
        title,
        description: details.lede,
        url,
        image: `${SITE}og/${project.id}-${lang}.png`,
        alternates,
        extra: `    <meta name="theme-color" content="#10120e" />
    <script>location.replace(${JSON.stringify(target)});</script>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#10120e;color:#f4f0e6;font-family:system-ui,sans-serif;text-align:center;padding:1.5rem}a{color:#e2ff57}</style>
`,
      })}
  <body>
    <main>
      <h1>${esc(details.title)}</h1>
      <p>${esc(details.lede)}</p>
      <p><a href="${target}">${lang === "en" ? "Open the project in the portfolio" : "Abrir el proyecto en el portafolio"}</a></p>
    </main>
  </body>
</html>
`,
    );
    sitemap.push({ loc: url, alternates });
  }
}

const noteCss = `
:root{--bg:#10120e;--bg-2:#171a14;--ink:#f4f0e6;--muted:#b7b2a6;--line:rgba(244,240,230,.14);--accent:#e2ff57;--accent-ink:#e2ff57;--on-accent:#15170f;color-scheme:dark}
:root[data-theme="light"]{--bg:#f3efe4;--bg-2:#fbf9f3;--ink:#1d1e17;--muted:#4a4b40;--line:rgba(64,56,32,.15);--accent:#d6f03f;--accent-ink:#4c5a04;--on-accent:#15170f;color-scheme:light}
@font-face{font-family:"Fraunces";font-style:normal;font-weight:500 600;font-display:swap;src:url("${BASE}fonts/fraunces-latin.woff2") format("woff2")}
@font-face{font-family:"Outfit";font-style:normal;font-weight:300 600;font-display:swap;src:url("${BASE}fonts/outfit-latin.woff2") format("woff2")}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:400 1.05rem/1.65 "Outfit","Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent-ink);text-underline-offset:.2em}
a:focus-visible{outline:2px solid var(--accent-ink);outline-offset:3px;border-radius:4px}
.bar{max-width:760px;margin:0 auto;padding:1.4rem 1.25rem;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.92rem}
main{max-width:760px;margin:0 auto;padding:1rem 1.25rem 4rem}
.kicker{margin:0 0 .6rem;color:var(--accent-ink);font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
h1{margin:0 0 1rem;font:500 clamp(2.1rem,6vw,3.4rem)/1.05 "Fraunces",Georgia,serif;letter-spacing:-.035em}
.lede{margin:0 0 2rem;color:var(--muted);font-size:1.15rem}
h2{margin:2.6rem 0 .8rem;font:500 clamp(1.45rem,3.4vw,1.9rem)/1.15 "Fraunces",Georgia,serif;letter-spacing:-.02em}
p{margin:0 0 1rem}
figure{margin:2rem 0;display:grid;justify-items:center;gap:.6rem}
figure img{width:min(100%,340px);height:auto;border:1px solid var(--line);border-radius:18px;background:#0c0e0b}
figcaption{color:var(--muted);font-size:.88rem;text-align:center}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.8rem;margin:0 0 1.3rem;padding:0;list-style:none}
.stats li{padding:1rem 1.1rem;border:1px solid var(--line);border-radius:16px;background:var(--bg-2)}
.stats strong{display:block;color:var(--accent-ink);font:500 1.9rem/1.1 "Fraunces",Georgia,serif;letter-spacing:-.03em}
.stats span{color:var(--muted);font-size:.9rem}
footer{max-width:760px;margin:0 auto;padding:2rem 1.25rem 3rem;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem}
`;

for (const lang of ["es", "en"]) {
  const n = note[lang];
  const other = lang === "en" ? "es" : "en";
  const url = `${SITE}${notePath(lang)}`;
  const alternates = { es: `${SITE}${notePath("es")}`, en: `${SITE}${notePath("en")}` };
  const sections = n.sections
    .map((section, index) => {
      const stats = section.stats
        ? `<ul class="stats">${section.stats.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join("")}</ul>`
        : "";
      const figure =
        index === 3
          ? `<figure><img src="${BASE}${note.image}" alt="${esc(n.imageAlt)}" width="540" height="1170" loading="lazy" /><figcaption>${esc(n.imageAlt)}</figcaption></figure>`
          : "";
      return `<section><h2>${esc(section.title)}</h2>${stats}${section.body.map((p) => `<p>${esc(p)}</p>`).join("")}${figure}</section>`;
    })
    .join("\n      ");
  write(
    notePath(lang),
    `${head({
      lang,
      title: `${n.title} · Josué Isaí Salazar Castro`,
      description: n.description,
      url,
      image: `${SITE}og/nota-${note.slug}-${lang}.png`,
      alternates,
      extra: `    <meta name="theme-color" content="#10120e" />
    <script>(function(){var t;try{t=localStorage.getItem("portfolio-theme")}catch(e){}if(t!=="light"&&t!=="dark")t=window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="light"?"#f3efe4":"#10120e"})();</script>
    <link rel="preload" href="${BASE}fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin />
    <style>${noteCss}</style>
    <script data-goatcounter="https://joshi2032.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
`,
    })}
  <body>
    <nav class="bar" aria-label="${lang === "en" ? "Note" : "Nota"}">
      <a href="${BASE}${lang === "en" ? "?lang=en" : ""}">← ${esc(n.back)}</a>
      <a href="${BASE}${notePath(other)}" hreflang="${other}" lang="${other}">${esc(n.other)}</a>
    </nav>
    <main>
      <article>
      <p class="kicker">${esc(n.kicker)}</p>
      <h1>${esc(n.title)}</h1>
      <p class="lede">${esc(n.description)}</p>
      ${sections}
      </article>
    </main>
    <footer>Josué Isaí Salazar Castro · <a href="${BASE}${projectPath(lang, "aguacate")}">${lang === "en" ? "See the project" : "Ver el proyecto"}</a></footer>
  </body>
</html>
`,
  );
  sitemap.push({ loc: url, alternates });
}

const home = { es: SITE, en: `${SITE}?lang=en` };
const entries = [{ loc: home.es, alternates: home }, { loc: home.en, alternates: home }, ...sitemap];
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url>
    <loc>${esc(e.loc)}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${esc(e.alternates.es)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${esc(e.alternates.en)}" />
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`,
  "utf8",
);

console.log(`prerender: ${sitemap.length} share pages + sitemap (${entries.length} URLs)`);
