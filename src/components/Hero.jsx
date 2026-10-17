import { LazyLottie } from "./LazyLottie.jsx";
import { useLanguage } from "../logic/LanguageContext.jsx";
import { useMediaQuery } from "../responsive/useMediaQuery.js";
import "../styles/Hero.css";

const base = import.meta.env.BASE_URL;
// Matches .hero-photo in Hero.css: 280px beside the copy on desktop, up to 150px above it on narrow screens.
const photoSizes = "(max-width: 980px) 150px, 280px";

export function Hero() {
  const { text } = useLanguage();
  const hero = text.hero;
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <section className="hero" id="inicio">
      <div className="wrap hero-grid">
        {/* Same photo as the header mark, large; the name is right next to it, so it stays decorative. */}
        <picture className="hero-photo">
          <source type="image/avif" srcSet={`${base}foto/josue-288.avif 288w, ${base}foto/josue-432.avif 432w`} sizes={photoSizes} />
          <source type="image/webp" srcSet={`${base}foto/josue-288.webp 288w, ${base}foto/josue-432.webp 432w`} sizes={photoSizes} />
          <img
            src={`${base}foto/josue-432.jpg`}
            srcSet={`${base}foto/josue-288.jpg 288w, ${base}foto/josue-432.jpg 432w, ${base}foto/josue-600.jpg 600w`}
            sizes={photoSizes}
            width="432"
            height="432"
            alt=""
            fetchPriority="high"
          />
        </picture>
        <div className="hero-copy">
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
