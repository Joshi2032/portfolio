import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Profile.css";

export function Profile() {
  const { text } = useLanguage();

  return (
    <section className="section" id="sobre">
      <div className="wrap">
        <header className="section-head">
          <p className="num">00</p>
          <h2>{text.about.title}</h2>
          <p className="section-lead">{text.about.text}</p>
        </header>
        <ul className="soft">
          {text.about.soft.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </div>
    </section>
  );
}
