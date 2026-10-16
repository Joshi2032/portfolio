import { useEffect, useRef, useState } from "react";
import { cvFiles, cvHref } from "../logic/catalog.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import "../styles/Resume.css";

export function Resume() {
  const { text } = useLanguage();
  const cv = text.cv;
  const [viewing, setViewing] = useState(null);
  const dialogRef = useRef(null);
  const returnFocus = useRef(null);
  const cards = [
    { href: cvHref(cvFiles.es), file: "Josue-Isai-Salazar-Castro-CV-ES.pdf", lang: cv.esLang, title: cv.esTitle },
    { href: cvHref(cvFiles.en), file: "Josue-Isai-Salazar-Castro-CV-EN.pdf", lang: cv.enLang, title: cv.enTitle },
  ];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !viewing) return undefined;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [viewing]);

  function openViewer(card, event) {
    returnFocus.current = event.currentTarget;
    setViewing(card);
  }

  function onClose() {
    setViewing(null);
    const target = returnFocus.current;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }

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
            <div key={card.file} className="cv-card">
              <span>{card.lang}</span>
              <strong>{card.title}</strong>
              <div className="cv-actions">
                <button type="button" className="btn btn-primary" onClick={(event) => openViewer(card, event)}>
                  {cv.view}
                </button>
                <a className="btn btn-ghost" href={card.href} download={card.file}>{cv.download}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
      {viewing ? (
        <dialog
          ref={dialogRef}
          className="cv-viewer"
          aria-label={viewing.title}
          onClose={onClose}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.close();
          }}
        >
          <header className="cv-viewer-head">
            <strong>{viewing.title}</strong>
            <a href={viewing.href} target="_blank" rel="noreferrer">{cv.openTab}</a>
            <button
              type="button"
              className="cv-viewer-close"
              aria-label={cv.close}
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
          </header>
          <iframe className="cv-viewer-frame" title={viewing.title} src={`${viewing.href}#view=FitH`} />
        </dialog>
      ) : null}
    </section>
  );
}
