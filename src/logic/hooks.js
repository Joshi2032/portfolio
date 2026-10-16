import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "portfolio-lang";

function readLang() {
  const param = new URLSearchParams(window.location.search).get("lang");
  if (param === "en" || param === "es") return param;
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

function writeLangUrl(value) {
  const url = new URL(window.location.href);
  if (value === "en") url.searchParams.set("lang", "en");
  else url.searchParams.delete("lang");
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) history.replaceState(history.state, "", next);
}

export function useLanguageState() {
  const [lang, setLangState] = useState(readLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode */
    }
    if (lang === "en") writeLangUrl("en");
  }, [lang]);

  const setLang = (next) => {
    const value = next === "en" ? "en" : "es";
    if (value === "es") writeLangUrl("es");
    setLangState(value);
  };

  return { lang, setLang };
}

export function useDocumentMeta(lang, meta) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute("content", meta.title);
    if (ogDescription) ogDescription.setAttribute("content", meta.description);
  }, [lang, meta]);
}

export function useScrollProgress(ref) {
  useEffect(() => {
    const supported = window.CSS?.supports?.("animation-timeline: scroll()");
    if (supported) return undefined;

    const bar = ref.current;
    if (!bar) return undefined;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);
}

export function useScrollHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrolled;
}

export function useActiveSection(ids) {
  const [current, setCurrent] = useState(ids[0]);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -48% 0px" });

    sections.forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, [ids]);

  return current;
}

export function useMobileMenu(isCompactNav) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const restoreFocus = useRef(false);
  const keepScroll = useRef(false);
  // The open menu owns one history entry so Back closes it.
  const ownsEntry = useRef(false);
  const ignorePop = useRef(0);

  const releaseEntry = (href) => {
    if (!ownsEntry.current) return;
    ownsEntry.current = false;
    if (href) {
      // Turn the menu entry into the link's entry instead of stacking a new one.
      history.replaceState(null, "", href);
    } else {
      ignorePop.current += 1;
      history.back();
    }
  };

  const close = ({ followLink = false, href } = {}) => {
    keepScroll.current = followLink;
    restoreFocus.current = true;
    releaseEntry(followLink ? href : undefined);
    setOpen(false);
  };

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    history.pushState({ pfLayer: "menu" }, "");
    ownsEntry.current = true;
    setOpen(true);
  };

  useEffect(() => {
    const onPop = () => {
      if (ignorePop.current > 0) {
        ignorePop.current -= 1;
        return;
      }
      if (!ownsEntry.current) return;
      ownsEntry.current = false;
      restoreFocus.current = true;
      setOpen(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (isCompactNav) return;
    restoreFocus.current = false;
    keepScroll.current = false;
    releaseEntry();
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompactNav]);

  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    toggleRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const root = document.documentElement;
    const { body } = document;
    const scrollY = window.scrollY;

    root.classList.add("menu-open");
    body.classList.add("menu-open");
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    const onKey = (event) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const nav = navRef.current;
      const toggleButton = toggleRef.current;
      if (!nav || !toggleButton) return;

      const items = [...nav.querySelectorAll("a[href]"), toggleButton];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      const active = document.activeElement;
      const inside = items.includes(active);
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      const followLink = keepScroll.current;
      keepScroll.current = false;
      root.classList.remove("menu-open");
      body.classList.remove("menu-open");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      document.removeEventListener("keydown", onKey);

      if (followLink) {
        const target = document.getElementById(window.location.hash.slice(1));
        target?.scrollIntoView();
        return;
      }
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [open]);

  return { open, toggleRef, navRef, toggle, close };
}

const THEME_KEY = "portfolio-theme";
const THEME_COLORS = { dark: "#10120e", light: "#f3efe4" };

function readTheme() {
  const current = document.documentElement.dataset.theme;
  if (current === "light" || current === "dark") return current;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function storedTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!query) return undefined;
    const onChange = (event) => {
      if (!storedTheme()) setThemeState(event.matches ? "light" : "dark");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((current) => {
      const next = current === "light" ? "dark" : "light";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* private mode */
      }
      return next;
    });
  };

  return { theme, toggleTheme };
}
