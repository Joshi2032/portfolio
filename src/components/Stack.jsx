import { stackGroups } from "../logic/catalog.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Stack.css";

export function Stack() {
  const { text } = useLanguage();

  return (
    <section className="section" id="stack">
      <div className="wrap">
        <header className="section-head">
          <p className="num">02</p>
          <h2>{text.stack.title}</h2>
          <p className="section-lead">{text.stack.lead}</p>
        </header>
        <div className="stack-grid">
          {stackGroups.map((group) => (
            <section key={group.id}>
              <h3>{text.stack.groups[group.id]}</h3>
              <ul className={group.variant === "base" ? "chips chips-base" : "chips"}>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <p className="scope">{text.stack.scope}</p>
      </div>
    </section>
  );
}
