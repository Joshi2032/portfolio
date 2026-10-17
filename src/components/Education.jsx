import { useLanguage } from "../logic/LanguageContext.jsx";
import "../styles/Education.css";

export function Education() {
  const { text } = useLanguage();
  const education = text.education;

  return (
    <section className="section" id="formacion">
      <div className="wrap">
        <header className="section-head">
          <p className="num">04</p>
          <h2>{education.title}</h2>
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
          <ul className="lang-list">
            {education.languages.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
