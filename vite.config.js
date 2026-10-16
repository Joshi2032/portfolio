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

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    breakpointTokens(),
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
        globIgnores: ["og/**", "og.png", "foto/josue-600.jpg", "foto/*.jpg", "foto/*.webp", "foto/josue-432.*"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/\/404\.html$/, /\/proyectos\/[^/.]+\/?$/, /\/notas\//, /\/en\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
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
