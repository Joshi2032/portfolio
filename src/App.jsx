import { useEffect, useRef } from "react";
import { Contact } from "./components/Contact.jsx";
import { Education } from "./components/Education.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { Profile } from "./components/Profile.jsx";
import { Projects } from "./components/Projects.jsx";
import { Resume } from "./components/Resume.jsx";
import { Stack } from "./components/Stack.jsx";
import { useMobileMenu, useScrollProgress } from "./logic/hooks.js";
import { useLanguage } from "./logic/LanguageContext.jsx";
import { mediaQueries } from "./responsive/breakpoints.js";
import { useMediaQuery } from "./responsive/useMediaQuery.js";

export default function App() {
  const { text } = useLanguage();
  const compactNav = useMediaQuery(mediaQueries.nav);
  const menu = useMobileMenu(compactNav);
  const progressRef = useRef(null);
  useScrollProgress(progressRef);
  const inert = menu.open || undefined;

  // index.html hides the prerendered page when it is in the other language; show it once React has rendered.
  useEffect(() => {
    document.documentElement.classList.remove("lang-swap");
  }, []);

  return (
    <>
      <div className="grid-overlay" aria-hidden="true" />
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <a className="skip" href="#contenido" inert={inert}>{text.nav.skip}</a>
      <Header menu={menu} />
      <main id="contenido" inert={inert}>
        <Hero />
        <Profile />
        <Projects />
        <Stack />
        <Education />
        <Resume />
        <Contact />
      </main>
      <Footer inert={inert} />
    </>
  );
}
