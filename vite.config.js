import { existsSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { breakpoints } from "./src/responsive/breakpoints.js";

const breakpointValues = {
  tablet: `${breakpoints.tablet}px`,
  nav: `${breakpoints.nav}px`,
  compact: `${breakpoints.compact}px`,
};

function breakpointTokens() {
  return {
    name: "breakpoint-tokens",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0];
      if (!file.endsWith(".css") || !/\bbp-(tablet|nav|compact)\b/.test(code)) return null;
      return {
        code: code.replace(/\bbp-(tablet|nav|compact)\b/g, (_, name) => breakpointValues[name]),
        map: null,
      };
    },
  };
}

// Puts the server-rendered Spanish home (built first with `vite build --ssr`) into index.html,
// before the service worker precache is generated. scripts/prerender.mjs writes /en/ the same way.
function prerenderHome() {
  const entry = new URL("./dist-ssr/entry-server.js", import.meta.url);
  return {
    name: "prerender-home",
    apply: (_, env) => env.command === "build" && !env.isSsrBuild,
    transformIndexHtml: {
      order: "post",
      async handler(html) {
        if (!existsSync(entry)) throw new Error("prerender-home: run `vite build --ssr src/entry-server.jsx --outDir dist-ssr` first");
        const { render } = await import(`${entry.href}?t=${Date.now()}`);
        const shell = /<div id="root">[\s\S]*?<\/main>\s*<\/div>/;
        if (!shell.test(html)) throw new Error("prerender-home: #root shell not found in index.html");
        return html.replace(shell, () => `<div id="root" data-prerendered="es">${render("es")}</div>`);
      },
    },
  };
}

export default defineConfig(({ command, isSsrBuild }) => ({
  build: isSsrBuild ? { outDir: "dist-ssr", emptyOutDir: true, copyPublicDir: false } : undefined,
  plugins: isSsrBuild ? [react(), breakpointTokens()] : [
    react(),
    breakpointTokens(),
    prerenderHome(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Josué Isaí Salazar Castro · Portafolio",
        short_name: "Josué",
        description: "Portafolio de Josué Isaí Salazar Castro, desarrollador Full Stack enfocado en Flutter y en IA aplicada.",
        lang: "es",
        start_url: "/portfolio/",
        scope: "/portfolio/",
        display: "standalone",
        theme_color: "#10120e",
        background_color: "#10120e",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{html,js,css,woff2,png,jpg,avif,webp,ico,svg,lottie,pdf,xml,txt}"],
        globIgnores: ["**/index.html", "og/**", "og.png", "foto/josue-600.jpg", "foto/*.jpg", "foto/*.webp", "foto/josue-432.*", "foto/josue-288.*"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Pages always come from the network first, so a returning visitor gets HTML that matches
        // the deployed CSS/JS; the cached copy is only used offline or on a very slow network.
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\/npm\/@lottiefiles\/.*\.wasm$/,
            handler: "CacheFirst",
            options: {
              cacheName: "lottie-wasm",
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: command === "build" ? "/portfolio/" : "/",
}));
