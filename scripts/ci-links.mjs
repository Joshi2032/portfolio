// Link and image check over the built site (internal + external).
import { LinkChecker } from "linkinator";
import { startServer } from "./serve.mjs";

const server = await startServer();
const base = `http://localhost:${server.address().port}/portfolio/`;
const checker = new LinkChecker();
const tolerant = /linkedin\.com|wa\.me|mail\.google\.com|goatcounter\.com|zgo\.at|doi\.org/;
const result = await checker.check({
  path: [base, `${base}?lang=en`, `${base}notas/detector-aguacate/`, `${base}404.html`],
  recurse: true,
  timeout: 20000,
  retry: true,
  retryErrors: true,
  retryErrorsCount: 2,
  // Absolute links to the production site are checked against this build,
  // so new pages and assets don't fail before they are deployed.
  urlRewriteExpressions: [{ pattern: /^https:\/\/joshi2032\.github\.io\/portfolio\//, replacement: base }],
  linksToSkip: ["^mailto:", "^tel:", "^data:"],
});
server.close();
const broken = result.links.filter((link) => {
  if (link.state !== "BROKEN") return false;
  // External sites that block bots or rate-limit: only a hard 404/410 counts.
  if (tolerant.test(link.url) || !link.url.startsWith(base.replace(/\/portfolio\/$/, ""))) {
    return link.status === 404 || link.status === 410;
  }
  return true;
});
console.log(`checked ${result.links.length} links`);
for (const link of broken) console.error(`✗ ${link.status} ${link.url} (from ${link.parent})`);
if (broken.length) process.exit(1);
console.log("✓ no broken links");
