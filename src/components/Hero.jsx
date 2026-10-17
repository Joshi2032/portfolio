import { LazyLottie } from "./LazyLottie.jsx";
import { useLanguage } from "../logic/LanguageContext.jsx";
import { useMediaQuery } from "../responsive/useMediaQuery.js";
import "../styles/Hero.css";

export function Hero() {
  const { text } = useLanguage();
  const hero = text.hero;
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <section className="hero" id="inicio">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="kicker">{hero.kicker}</p>
          <p className="role">{hero.role}</p>
          <h1>Josué Isaí<br /><em>Salazar Castro</em></h1>
          <p className="hero-title">{hero.title}</p>
          <p className="lede">{hero.lede}</p>
          <div className="actions">
            <a className="btn btn-primary" href="#proyectos">{hero.primary}</a>
            <a className="btn btn-ghost" href="#cv">{hero.cv}</a>
            <a className="btn btn-ghost" href="#contacto">{hero.secondary}</a>
          </div>
        </div>
        <aside className="dossier">
          {reduceMotion ? null : (
            <div className="hero-lottie" aria-hidden="true">
              <LazyLottie
                src={`${import.meta.env.BASE_URL}lottie/waves.lottie`}
                loop
                autoplay
                layout={{ fit: "cover", align: [0.5, 0.5] }}
              />
            </div>
          )}
          <p className="dossier-kicker">{text.dossier.kicker}</p>
          <ul>
            {text.dossier.items.map((item) => (
              <li key={item.title}>
                <span>{item.title}</span>
                <small>{item.detail}</small>
              </li>
            ))}
          </ul>
        </aside>
        <section className="highlights" aria-labelledby="highlights-title">
          <div className="highlights-head">
            <h2 id="highlights-title">{text.metricsTitle}</h2>
            <p>{text.metricsLead}</p>
          </div>
          <dl className="metrics">
            {text.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>
                  {metric.label}
                  <a className="metric-project" href={`#${metric.project}`}>
                    {text.metricsProject}: {metric.projectName}
                  </a>
                </dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  );
}
