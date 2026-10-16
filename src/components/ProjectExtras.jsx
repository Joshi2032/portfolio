import { Fragment } from "react";
import { note as techNote } from "../notes/detectorAguacate.js";

// Dialog-only content, loaded on demand (see projectChunks.js).

function FlowCard({ step, className }) {
  return (
    <div className={className ? `pm-card ${className}` : "pm-card"}>
      <strong>{step.title}</strong>
      <em>{step.note}</em>
    </div>
  );
}

export function TechNote({ lang }) {
  const n = techNote[lang];
  return (
    <section className="tech-note" aria-labelledby="tech-note-title">
      <h4 id="tech-note-title">{n.title}</h4>
      <p className="tech-note-summary">{n.summary}</p>
      {n.sections.map((section) => (
        <details key={section.id} className="tech-note-item">
          <summary>{section.title}</summary>
          <div className="tech-note-body">
            {section.stats ? (
              <ul className="tech-stats">
                {section.stats.map((stat) => (
                  <li key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.body.map((text) => <p key={text}>{text}</p>)}
            {section.models ? (
              <table className="tech-models">
                <caption>
                  {section.models.caption} · <span className="tech-final-key">● {n.finalLabel}</span>
                </caption>
                <thead>
                  <tr>{section.models.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {section.models.rows.map((row, i) => (
                    <tr key={row[0]} className={i === 1 ? "is-final" : undefined}>
                      <th scope="row">{row[0]}</th>
                      {row.slice(1).map((cell, j) => (
                        <td key={cell} data-label={section.models.head[j + 1]}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {(section.after ?? []).map((text) => <p key={text}>{text}</p>)}
          </div>
        </details>
      ))}
    </section>
  );
}

export function ProjectFlow({ flow }) {
  if (flow.steps) {
    return (
      <figure className="pm-flow" aria-label={flow.aria}>
        <figcaption>{flow.title}</figcaption>
        <ol className="pm-linear">
          {flow.steps.map((step, index) => (
            <li key={step.title} className={index === flow.steps.length - 1 ? "pm-step is-last" : "pm-step"}>
              {index > 0 ? <span className="pm-arrow" aria-hidden="true" /> : null}
              <div className={`pm-card${index === flow.steps.length - 1 ? " pm-out" : step.loop ? " pm-engine" : ""}`}>
                <strong>{step.title}</strong>
                <em>{step.note}</em>
                {step.loop ? <span className="pm-loop"><span aria-hidden="true">↺ </span>{step.loop}</span> : null}
              </div>
            </li>
          ))}
        </ol>
        {flow.compare ? (
          <div className="pm-compare">
            {flow.compare.map((item, index) => (
              <p key={item.label} className={index === 1 ? "pm-compare-item is-now" : "pm-compare-item"}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <em>{item.note}</em>
              </p>
            ))}
          </div>
        ) : null}
      </figure>
    );
  }
  return (
    <figure className="pm-flow" aria-label={flow.aria}>
      <figcaption>{flow.title}</figcaption>
      <div className="pm-graph">
        <div className="pm-paths">
          {flow.paths.map((path) => (
            <section className="pm-path" key={path.label} aria-label={path.label}>
              <p className="pm-path-label">{path.label}</p>
              <div className="pm-path-steps">
                {path.steps.map((step, index) => (
                  <Fragment key={step.title}>
                    {index > 0 ? <span className="pm-arrow" aria-hidden="true" /> : null}
                    <FlowCard step={step} />
                  </Fragment>
                ))}
              </div>
            </section>
          ))}
        </div>
        <span className="pm-arrow pm-merge" aria-hidden="true" />
        <FlowCard step={flow.engine} className="pm-engine" />
        <span className="pm-arrow" aria-hidden="true" />
        <FlowCard step={flow.output} className="pm-out" />
      </div>
      <p className="pm-stat"><strong>{flow.stat}</strong><span>{flow.statNote}</span></p>
    </figure>
  );
}

