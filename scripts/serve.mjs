// Minimal static server for CI checks: serves dist/ under /portfolio/.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.env.PORT || 4180);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".jpg": "image/jpeg", ".avif": "image/avif",
  ".webp": "image/webp", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".pdf": "application/pdf",
  ".xml": "application/xml", ".txt": "text/plain", ".lottie": "application/zip",
};

export function startServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/portfolio/")) {
      res.writeHead(302, { location: "/portfolio/" }).end();
      return;
    }
    let file = normalize(join(dist, decodeURIComponent(url.pathname.slice("/portfolio/".length))));
    if (!file.startsWith(dist)) return res.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(body);
    } catch {
      const body = await readFile(join(dist, "404.html"));
      res.writeHead(404, { "content-type": types[".html"] }).end(body);
    }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await startServer();
  console.log(`serving dist at http://localhost:${port}/portfolio/`);
}
