import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./logic/LanguageContext.jsx";
import "./styles/global/fonts.css";
import "./styles/global/tokens.css";
import "./styles/global/base.css";
import "./styles/global/layout.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
