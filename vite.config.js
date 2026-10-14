import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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
  plugins: [react(), breakpointTokens()],
  base: command === "build" ? "/portfolio/" : "/",
}));
