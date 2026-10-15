import { sectionIds } from "../logic/catalog.js";
import { useActiveSection, useScrollHeader } from "../logic/hooks.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Header.css";

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
  const inert = menu.open || undefined;

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap bar">
        <a className="brand" href="#inicio" aria-label={nav.home} inert={inert}>
          <span className="mark" aria-hidden="true">JI</span>
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
          <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")}>ES</button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
        </div>
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
