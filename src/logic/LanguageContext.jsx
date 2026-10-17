import { createContext, useContext, useMemo } from "react";
import { copy } from "./copy.js";
import { useDocumentMeta, useLanguageState } from "./hooks.js";

const LanguageContext = createContext(null);

export function LanguageProvider({ children, initialLang }) {
  const { lang, setLang } = useLanguageState(initialLang);
  const text = copy[lang];

  useDocumentMeta(lang, text.meta);

  const value = useMemo(() => ({ lang, setLang, text }), [lang, text]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
