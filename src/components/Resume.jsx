import { cvFiles, cvHref } from "../logic/catalog.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Resume.css";

export function Resume() {
  const { text } = useLanguage();
  const cv = text.cv;
  const cards = [
    { href: cvHref(cvFiles.es), file: "Josue-Isai-Salazar-Castro-CV-ES.pdf", lang: cv.esLang, title: cv.esTitle },
    { href: cvHref(cvFiles.en), file: "Josue-Isai-Salazar-Castro-CV-EN.pdf", lang: cv.enLang, title: cv.enTitle },
  ];

  return (
    <section className="section" id="cv">
      <div className="wrap">
        <header className="section-head">
          <p className="num">04</p>
          <h2>{cv.title}</h2>
          <p className="section-lead">{cv.lead}</p>
        </header>
        <div className="cv-grid">
          {cards.map((card) => (
            <a key={card.file} className="cv-card" href={card.href} download={card.file}>
              <span>{card.lang}</span>
              <strong>{card.title}</strong>
              <em>{cv.download}</em>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
