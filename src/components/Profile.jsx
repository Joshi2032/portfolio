import { useLanguage } from "../logic/LanguageContext.jsx";
import "../styles/Profile.css";

export function Profile() {
  const { text } = useLanguage();
  const about = text.about;

  return (
    <section className="section" id="sobre">
      <div className="wrap profile-layout">
        <header className="section-head">
          <p className="num">00</p>
          <h2>{about.title}</h2>
          <p className="section-lead">{about.text}</p>
          <ul className="soft">
            {about.soft.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </header>
        <div className="profile-notes">
          {about.notes.map((note) => (
            <article key={note.title}>
              <h3>{note.title}</h3>
              <p>{note.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
