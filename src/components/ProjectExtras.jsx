import { Fragment, useEffect, useRef, useState } from "react";
import { notes } from "../notes/index.js";

// Dialog-only content, loaded on demand (see projectChunks.js).

// Draws the flow step by step the first time it scrolls into view.
// Each node gets --i (its order in the drawing); CSS turns that into a delay.
function useDrawOnView() {
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, drawn ? "pm-flow pm-draw is-drawn" : "pm-flow pm-draw"];
}

const order = (i) => ({ "--i": i });

function FlowCard({ step, className, i }) {
  return (
    <div className={className ? `pm-card ${className}` : "pm-card"} style={order(i)}>
      <strong>{step.title}</strong>
      <em>{step.note}</em>
    </div>
  );
}

function Arrow({ i, className }) {
  return <span className={className ? `pm-arrow ${className}` : "pm-arrow"} style={order(i)} aria-hidden="true" />;
}

export function TechNote({ id, lang }) {
  const n = notes[id]?.[lang];
  if (!n) return null;
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
            {(section.body ?? []).map((text) => <p key={text}>{text}</p>)}
            {section.list ? (
              <ul className="tech-list">
                {section.list.map((text) => <li key={text}>{text}</li>)}
              </ul>
            ) : null}
            {section.ordered ? (
              <ol className="tech-list tech-steps">
                {section.ordered.map((text) => <li key={text}>{text}</li>)}
              </ol>
            ) : null}
            {section.table ? (
              <table className="tech-models tech-table">
                <caption>{section.table.caption}</caption>
                <thead>
                  <tr>{section.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row) => (
                    <tr key={row[0]}>
                      <th scope="row">{row[0]}</th>
                      {row.slice(1).map((cell, j) => (
                        <td key={section.table.head[j + 1]} data-label={section.table.head[j + 1]}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
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
  const [ref, className] = useDrawOnView();
  if (flow.steps) {
    // Card n is node 2n; the arrow before it is node 2n - 1.
    const last = flow.steps.length - 1;
    const after = 2 * last + 1;
    return (
      <figure ref={ref} className={className} aria-label={flow.aria}>
        <figcaption>{flow.title}</figcaption>
        <ol className="pm-linear">
          {flow.steps.map((step, index) => (
            <li key={step.title} className={index === last ? "pm-step is-last" : "pm-step"}>
              {index > 0 ? <Arrow i={2 * index - 1} /> : null}
              <div
                className={`pm-card${index === last ? " pm-out" : step.loop ? " pm-engine" : ""}`}
                style={order(2 * index)}
              >
                <strong>{step.title}</strong>
                <em>{step.note}</em>
                {step.loop ? (
                  <span className="pm-loop" style={order(after)}><span aria-hidden="true">↺ </span>{step.loop}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        {flow.compare ? (
          <div className="pm-compare">
            {flow.compare.map((item, index) => (
              <p
                key={item.label}
                className={index === 1 ? "pm-compare-item is-now" : "pm-compare-item"}
                style={order(after + 1 + index)}
              >
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
  // Both paths draw at the same time, then merge into the engine and the output.
  const merge = 2 * Math.max(...flow.paths.map((path) => path.steps.length)) - 1;
  return (
    <figure ref={ref} className={className} aria-label={flow.aria}>
      <figcaption>{flow.title}</figcaption>
      <div className="pm-graph">
        <div className="pm-paths" style={order(merge - 1)}>
          {flow.paths.map((path) => (
            <section className="pm-path" key={path.label} aria-label={path.label}>
              <p className="pm-path-label">{path.label}</p>
              <div className="pm-path-steps">
                {path.steps.map((step, index) => (
                  <Fragment key={step.title}>
                    {index > 0 ? <Arrow i={2 * index - 1} /> : null}
                    <FlowCard step={step} i={2 * index} />
                  </Fragment>
                ))}
              </div>
            </section>
          ))}
        </div>
        <Arrow i={merge} className="pm-merge" />
        <FlowCard step={flow.engine} className="pm-engine" i={merge + 1} />
        <Arrow i={merge + 2} />
        <FlowCard step={flow.output} className="pm-out" i={merge + 3} />
      </div>
      {flow.stat ? (
        <p className="pm-stat" style={order(merge + 4)}><strong>{flow.stat}</strong><span>{flow.statNote}</span></p>
      ) : null}
    </figure>
  );
}

