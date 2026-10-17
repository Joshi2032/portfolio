// End-to-end checks for the project dialogs, the image viewer, Back-button
// behaviour and ?p= deep links. Runs against the built site (dist/).
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { startServer } from "./serve.mjs";

const server = await startServer();
const base = `http://localhost:${server.address().port}/portfolio/`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const viewports = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];
let failures = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}\n  ${error.message.split("\n").slice(0, 4).join("\n  ")}`);
  }
}

async function newPage(device, locale = "es-MX") {
  const context = await browser.newContext({ ...device, locale, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.route(/goatcounter|zgo\.at/, (route) => route.abort());
  return page;
}

const projectOpen = (page) => page.locator("dialog.project-float[open]");
const viewer = (page) => page.locator("dialog.shot-zoom[open]");

async function viewerInViewport(page) {
  const box = await viewer(page).boundingBox();
  const size = page.viewportSize();
  assert.ok(box, "viewer has no box");
  assert.ok(box.y >= -1 && box.x >= -1 && box.y + box.height <= size.height + 1 && box.x + box.width <= size.width + 1,
    `viewer outside viewport: ${JSON.stringify(box)}`);
}

async function closeViewer(page, how) {
  if (how === "x") await viewer(page).locator(".project-float-close").click();
  else if (how === "esc") await page.keyboard.press("Escape");
  else await page.mouse.click(4, 4);
  await viewer(page).waitFor({ state: "detached" });
}

for (const device of viewports) {
  await test(`${device.name}: every project dialog, gallery viewer and closing`, async () => {
    const page = await newPage(device);
    await page.goto(base, { waitUntil: "load" });
    const cards = page.locator("#proyectos article[role=button]");
    const count = await cards.count();
    assert.ok(count >= 3, `expected at least 3 openable projects, got ${count}`);
    const ways = ["x", "esc", "backdrop"];
    let shotsChecked = 0;
    for (let i = 0; i < count; i += 1) {
      const card = cards.nth(i);
      const id = await card.getAttribute("id");
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await projectOpen(page).waitFor();
      const shots = projectOpen(page).locator("button.shot");
      const n = await shots.count();
      for (let j = 0; j < n; j += 1) {
        await shots.nth(j).click();
        await viewer(page).waitFor();
        await viewerInViewport(page);
        await closeViewer(page, ways[shotsChecked % 3]);
        shotsChecked += 1;
        assert.equal(await projectOpen(page).count(), 1, `${id}: project dialog closed together with the viewer`);
      }
      await page.keyboard.press("Escape");
      await projectOpen(page).waitFor({ state: "detached" });
      await page
        .waitForFunction(() => !history.state?.pfLayer, null, { timeout: 3000 })
        .catch(() => assert.fail(`${id}: stale history entry after closing`));
    }
    assert.ok(shotsChecked >= 3, `expected gallery images, checked ${shotsChecked}`);
    await page.context().close();
  });

  await test(`${device.name}: Back closes the viewer, then the dialog, and stays on the site`, async () => {
    const page = await newPage(device);
    await page.goto(base, { waitUntil: "load" });
    const card = page.locator("#proyectos article").first();
    const withShots = page.locator("#tienda");
    await withShots.scrollIntoViewIfNeeded();
    await withShots.click();
    await projectOpen(page).waitFor();
    await projectOpen(page).locator("button.shot").first().click();
    await viewer(page).waitFor();
    await page.goBack();
    await viewer(page).waitFor({ state: "detached" });
    assert.equal(await projectOpen(page).count(), 1, "Back closed the dialog instead of only the viewer");
    await page.goBack();
    await projectOpen(page).waitFor({ state: "detached" });
    assert.ok(page.url().startsWith(base), `left the site: ${page.url()}`);
    assert.ok(await card.count(), "home is not showing");
    await page.context().close();
  });

  await test(`${device.name}: ?p= deep links open the dialog and Back shows home`, async () => {
    const page = await newPage(device);
    for (const [path, title] of [["?p=aguacate", /Hass/], ["?p=kaizen&lang=en", /Kaizen/], ["proyectos/tienda/", /ventas|sales/i]]) {
      await page.goto(base + path, { waitUntil: "load" });
      await projectOpen(page).waitFor();
      assert.match(await page.locator("#project-float-title").textContent(), title);
      assert.ok(!new URL(page.url()).searchParams.has("p"), "?p= left in the URL");
      await page.goBack();
      await projectOpen(page).waitFor({ state: "detached" });
      assert.ok(page.url().startsWith(base), `Back left the site: ${page.url()}`);
    }
    await page.context().close();
  });
}

await test("mobile: menu is an opaque full-height overlay; Back, Esc and links close it", async () => {
  const page = await newPage(viewports[1]);
  await page.goto(base, { waitUntil: "load" });
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(200);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const toggle = page.locator(".nav-toggle");
  const nav = page.locator("#site-nav");

  async function assertCovered() {
    await nav.waitFor({ state: "visible" });
    const result = await page.evaluate(() => {
      const header = document.querySelector(".site-header").getBoundingClientRect();
      const menu = document.getElementById("site-nav").getBoundingClientRect();
      const leaks = [];
      for (let y = 2; y < innerHeight; y += 40) {
        for (const x of [4, innerWidth / 2, innerWidth - 4]) {
          const el = document.elementFromPoint(x, y);
          if (!el?.closest(".site-header")) leaks.push(`${Math.round(x)},${y}:${el?.tagName}.${el?.className}`);
        }
      }
      return { headerTop: header.top, gap: menu.top - header.bottom, menuBottom: menu.bottom, vh: innerHeight, leaks };
    });
    assert.ok(Math.abs(result.headerTop) < 1, `header not at the top: ${result.headerTop}`);
    assert.ok(Math.abs(result.gap) < 1.5, `gap between header and menu: ${result.gap}`);
    assert.ok(result.menuBottom >= result.vh - 1, `menu does not reach the bottom: ${result.menuBottom}/${result.vh}`);
    assert.equal(result.leaks.length, 0, `page content visible behind the menu: ${result.leaks.slice(0, 3).join(" | ")}`);
  }

  await toggle.click();
  await assertCovered();
  await page.goBack();
  await nav.waitFor({ state: "hidden" });
  assert.ok(page.url().startsWith(base), `Back left the site: ${page.url()}`);
  assert.ok(Math.abs((await page.evaluate(() => window.scrollY)) - scrollBefore) < 4, "scroll position lost after closing");

  await toggle.click();
  await assertCovered();
  await page.keyboard.press("Escape");
  await nav.waitFor({ state: "hidden" });
  await page.waitForFunction(() => history.state?.pfLayer !== "menu", null, { timeout: 3000 });

  await toggle.click();
  await assertCovered();
  await nav.locator('a[href="#stack"]').click();
  await nav.waitFor({ state: "hidden" });
  assert.ok(page.url().endsWith("#stack"), `link did not navigate: ${page.url()}`);
  assert.notEqual(await page.evaluate(() => history.state?.pfLayer ?? null), "menu", "stale menu history entry");
  await page.context().close();
});

await test("language: browser detection, ?lang override and saved toggle choice", async () => {
  const navText = (page) => page.locator("#site-nav a").first().textContent();
  const es = await newPage(viewports[0], "es-MX");
  await es.goto(base, { waitUntil: "load" });
  assert.equal(await es.evaluate(() => document.documentElement.lang), "es");
  assert.equal(await navText(es), "Proyectos");
  await es.context().close();

  const en = await newPage(viewports[0], "en-US");
  await en.goto(base, { waitUntil: "load" });
  assert.equal(await en.evaluate(() => document.documentElement.lang), "en");
  assert.equal(await navText(en), "Projects");
  await en.goto(`${base}?lang=es`, { waitUntil: "load" });
  assert.equal(await navText(en), "Proyectos", "?lang=es should override the browser language");
  await en.goto(base, { waitUntil: "load" });
  assert.equal(await navText(en), "Projects", "?lang alone must not be saved as a choice");
  await en.locator(".lang button", { hasText: "ES" }).click();
  assert.equal(await navText(en), "Proyectos");
  await en.goto(base, { waitUntil: "load" });
  assert.equal(await navText(en), "Proyectos", "toggle choice did not persist");
  assert.equal(await en.evaluate(() => document.documentElement.lang), "es");
  await en.context().close();
});

await test("language: /en/ home is English with English meta, even for a Spanish browser", async () => {
  const page = await newPage(viewports[0], "es-MX");
  await page.goto(`${base}en/`, { waitUntil: "load" });
  assert.equal(await page.evaluate(() => document.documentElement.lang), "en");
  assert.equal(await page.locator("#site-nav a").first().textContent(), "Projects");
  assert.match(await page.locator('link[rel="canonical"]').getAttribute("href"), /\/portfolio\/en\/$/);
  assert.match(await page.locator('meta[property="og:image"]').getAttribute("content"), /home-en\.png$/);
  assert.ok(!page.url().includes("lang="), "the /en/ path should not need ?lang=en");
  await page.locator(".lang button", { hasText: "ES" }).click();
  assert.equal(await page.locator("#site-nav a").first().textContent(), "Proyectos");
  assert.ok(page.url().includes("lang=es"), "switching to Spanish on /en/ should be reflected in the URL");
  await page.context().close();
});

await test("contact: validation, success note, WhatsApp channel, no phone or Gmail", async () => {
  const page = await newPage(viewports[0], "es-MX");
  await page.goto(base, { waitUntil: "load" });
  const section = page.locator("#contacto");
  await section.scrollIntoViewIfNeeded();
  const text = await section.innerText();
  assert.ok(!/352|tel:/.test(text), "phone number must not be visible");
  assert.equal(await section.locator('a[href^="tel:"]').count(), 0);
  assert.ok(!/gmail\.com\/mail|Abrir en Gmail/i.test(await section.innerHTML()), "no Gmail compose button");
  assert.ok((await section.locator('a[href^="https://wa.me/"]').count()) >= 2, "WhatsApp channel and button");
  const send = section.locator("a.contact-send");
  await send.click();
  assert.equal(await section.locator(".contact-error").count(), 2, "both required fields flagged");
  assert.equal(await section.locator('input[name="email"]').getAttribute("aria-invalid"), "true");
  await section.locator('input[name="email"]').fill("ana@empresa.com");
  await section.locator("textarea").fill("Hola");
  assert.equal(await section.locator(".contact-error").count(), 0, "errors clear while typing");
  await page.evaluate(() => document.querySelector("#contacto a.contact-send").addEventListener("click", (e) => e.preventDefault()));
  await send.click();
  await section.locator(".contact-sent").waitFor();
  assert.match(await send.getAttribute("href"), /^mailto:joshi\.jc2032@gmail\.com\?/);
  await page.context().close();
});

await browser.close();
server.close();
if (failures) {
  console.error(`${failures} e2e test(s) failed`);
  process.exit(1);
}
