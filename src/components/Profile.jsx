import { useLanguage } from "../logic/LanguageContext.jsx";
import "../styles/Profile.css";

export function Profile() {
  const { text } = useLanguage();
  const about = text.about;

  return (
    <section className="section" id="sobre">
      <div className="wrap profile-layout">
        <header className="section-head">
          <p className="num">01</p>
          <h2>{about.title}</h2>
          <p className="section-lead">{about.text}</p>
        </header>
        <div className="profile-soft">
          <p className="soft-title" id="soft-title">{about.softTitle}</p>
          <ul className="soft" aria-labelledby="soft-title">
            {about.soft.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
