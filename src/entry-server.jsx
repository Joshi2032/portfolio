// Build-time render of the home page (ES at /, EN at /en/) so the HTML carries the real content.
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { LanguageProvider } from "./logic/LanguageContext.jsx";
import App from "./App.jsx";

export function render(lang) {
  return renderToString(
    <StrictMode>
      <LanguageProvider initialLang={lang}>
        <App />
      </LanguageProvider>
    </StrictMode>,
  );
}
