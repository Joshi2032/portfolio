import { sectionIds } from "../logic/catalog.js";
import { useActiveSection, useScrollHeader, useTheme } from "../logic/hooks.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import { trackEvent } from "../logic/analytics.js";
import "../styles/Header.css";

const navItems = [
  ["proyectos", "projects"],
  ["stack", "stack"],
  ["formacion", "education"],
  ["cv", "cv"],
  ["contacto", "contact"],
];

export function Header({ menu }) {
  const { lang, setLang, text } = useLanguage();
  const scrolled = useScrollHeader();
  const current = useActiveSection(sectionIds);
  const nav = text.nav;
  const { theme, toggleTheme } = useTheme();
  const inert = menu.open || undefined;

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap bar">
        <a className="brand" href="#inicio" inert={inert}>
          <picture className="mark">
            <source type="image/avif" srcSet={`${import.meta.env.BASE_URL}foto/josue-144.avif`} />
            <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}foto/josue-144.webp`} />
            <img src={`${import.meta.env.BASE_URL}foto/josue-144.jpg`} width="40" height="40" alt="" decoding="async" fetchPriority="high" />
          </picture>
          <span className="brand-text">Josué Isaí</span>
        </a>
        <nav
          ref={menu.navRef}
          className={`nav${menu.open ? " is-open" : ""}`}
          id="site-nav"
          aria-label={nav.label}
        >
          {navItems.map(([id, key]) => (
            <a
              key={id}
              href={`#${id}`}
              className={current === id ? "is-current" : undefined}
              onClick={() => menu.close({ followLink: true })}
            >
              {nav[key]}
            </a>
          ))}
        </nav>
        <div className="lang" role="group" aria-label={lang === "es" ? "Idioma" : "Language"} inert={inert}>
          <button type="button" aria-pressed={lang === "es"} onClick={() => { if (lang !== "es") trackEvent("lang-es"); setLang("es"); }}>ES</button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => { if (lang !== "en") trackEvent("lang-en"); setLang("en"); }}>EN</button>
        </div>
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === "light" ? nav.themeDark : nav.themeLight}
          title={theme === "light" ? nav.themeDark : nav.themeLight}
          onClick={() => {
            trackEvent(theme === "light" ? "theme-dark" : "theme-light");
            toggleTheme();
          }}
          inert={inert}
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <button
          ref={menu.toggleRef}
          className="nav-toggle"
          type="button"
          aria-expanded={menu.open}
          aria-controls="site-nav"
          aria-label={menu.open ? nav.close : nav.open}
          onClick={menu.toggle}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
