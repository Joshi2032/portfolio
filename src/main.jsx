import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { LanguageProvider } from "./logic/LanguageContext.jsx";
import { readLang } from "./logic/hooks.js";
import { hydration } from "./logic/hydration.js";
import "./styles/global/fonts.css";
import "./styles/global/tokens.css";
import "./styles/global/base.css";
import "./styles/global/layout.css";
import App from "./App.jsx";

const container = document.getElementById("root");
const lang = readLang();
const app = (
  <StrictMode>
    <LanguageProvider initialLang={lang}>
      <App />
    </LanguageProvider>
  </StrictMode>
);

// The HTML is prerendered in one language (ES at /, EN at /en/). Adopt it when the visitor's
// language matches; otherwise (?lang=, saved choice, browser) render fresh in their language.
if (container.dataset.prerendered === lang) {
  hydration.active = true;
  hydrateRoot(container, app);
} else {
  container.textContent = "";
  delete container.dataset.prerendered;
  createRoot(container).render(app);
}
