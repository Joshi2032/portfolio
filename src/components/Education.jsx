import { useLanguage } from "../logic/LanguageContext.jsx";
import "../styles/Education.css";

export function Education() {
  const { text } = useLanguage();
  const education = text.education;

  return (
    <section className="section" id="formacion">
      <div className="wrap">
        <header className="section-head">
          <p className="num">03</p>
          <h2>{education.title}</h2>
          <p className="section-lead">{education.lead}</p>
        </header>
        <div className="edu-grid">
          {education.items.map((item) => (
            <article className="edu-card" key={item.title}>
              <p className="when">{item.when}</p>
              <h3>{item.title}</h3>
              <p>{item.place}</p>
              {item.note ? <p className="edu-note">{item.note}</p> : null}
            </article>
          ))}
        </div>
        <div className="lang-row">
          <h3>{education.languagesTitle}</h3>
          <p>{education.languages}</p>
        </div>
      </div>
    </section>
  );
}
