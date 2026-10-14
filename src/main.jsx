import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./logic/LanguageContext.jsx";
import "./design/tokens.css";
import "./design/base.css";
import "./responsive/layout.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
