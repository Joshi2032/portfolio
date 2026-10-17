// Generates static share pages (per project), redirects for retired note URLs, with their own
// Open Graph / Twitter meta, plus the sitemap. Runs after `vite build`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { es } from "../src/logic/copy/es.js";
import { en } from "../src/logic/copy/en.js";
import { projectOrder } from "../src/logic/catalog.js";

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
const notePath = (lang) => `${prefix(lang)}notas/detector-aguacate/`;

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
    const target = `${BASE}?p=${project.id}${lang === "en" ? "&lang=en" : "&lang=es"}`;
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

// The technical note now lives inside the avocado project dialog.
// Old note URLs redirect there so shared links keep working.
for (const lang of ["es", "en"]) {
  const target = `${BASE}?p=aguacate${lang === "en" ? "&lang=en" : "&lang=es"}`;
  const label = lang === "en" ? "Open the avocado project" : "Abrir el proyecto del aguacate";
  write(
    notePath(lang),
    `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(label)}</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${SITE}${projectPath(lang, "aguacate")}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)});</script>
  </head>
  <body>
    <p><a href="${target}">${esc(label)}</a></p>
  </body>
</html>
`,
  );
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
