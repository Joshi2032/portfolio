import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Experience.css";

export function Experience() {
  const { text } = useLanguage();
  const experience = text.experience;

  return (
    <section className="section" id="experiencia">
      <div className="wrap">
        <header className="section-head">
          <p className="num">02</p>
          <h2>{experience.title}</h2>
          <p className="section-lead">{experience.lead}</p>
        </header>
        <p className="note">{experience.note}</p>
        <div className="jobs">
          {experience.roles.map((job) => (
            <article className="job" key={`${job.role}-${job.org}`}>
              <div className="job-top">
                <h3>
                  <span>{job.role}</span>
                  <span className="dot" aria-hidden="true"> · </span>
                  <span>{job.org}</span>
                </h3>
                <p className="when">{job.when}</p>
              </div>
              <p>{job.text}</p>
              <p className="exp-links">
                {job.links.map((link) => (
                  <a key={link.href} href={link.href}>{link.label}</a>
                ))}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
