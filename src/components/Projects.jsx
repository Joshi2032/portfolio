import { useEffect, useRef, useState } from "react";
import { filters, matchesFilter, projectOrder } from "../logic/catalog.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Projects.css";

function ProjectFacts({ details }) {
  return (
    <>
      <ul className="points">
        {details.points.map((point) => <li key={point}>{point}</li>)}
      </ul>
      <ul className="tags">
        {details.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
      {details.result ? (
        <p className="result">
          <strong>{details.resultStat}</strong>
          <span>{details.result}</span>
        </p>
      ) : (
        <p className="delivery">{details.delivery}</p>
      )}
    </>
  );
}

function ProjectShots({ details }) {
  return (
    <figure className="shots">
      {details.shots.map((shot) => (
        <img
          key={shot.src}
          src={`${import.meta.env.BASE_URL}${shot.src}`}
          alt={shot.alt}
        />
      ))}
    </figure>
  );
}

export function Projects() {
  const { lang, text } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [announcement, setAnnouncement] = useState("");
  const [openId, setOpenId] = useState(null);
  const previous = useRef({ filter, lang });
  const dialogRef = useRef(null);
  const returnFocus = useRef(null);
  const closingFromCleanup = useRef(false);
  const intro = text.projectsIntro;
  const visibleCount = projectOrder.filter((project) => matchesFilter(project.tags, filter)).length;
  const openProject = projectOrder.find((project) => project.id === openId) ?? null;
  const openDetails = openProject ? text.projects[openProject.id] : null;

  useEffect(() => {
    if (previous.current.filter === filter && previous.current.lang === lang) return;
    previous.current = { filter, lang };
    setAnnouncement(intro.filters.count(visibleCount));
  }, [filter, lang, visibleCount, intro.filters]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !openId) return undefined;
    dialog.showModal();
    return () => {
      if (!dialog.open) return;
      closingFromCleanup.current = true;
      dialog.close();
      closingFromCleanup.current = false;
    };
  }, [openId]);

  function openCard(id, event) {
    returnFocus.current = event.currentTarget;
    setOpenId(id);
  }

  function onShotKeyDown(event, id) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openCard(id, event);
  }

  function onDialogClose() {
    if (closingFromCleanup.current) return;
    setOpenId(null);
    const target = returnFocus.current;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }

  function onDialogClick(event) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  return (
    <section className="section" id="proyectos">
      <div className="wrap">
        <header className="section-head">
          <p className="num">01</p>
          <h2>{intro.title}</h2>
          <p className="section-lead">{intro.lead}</p>
        </header>
        <div className="filters" role="group" aria-label={intro.filters.aria}>
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {intro.filters[item.id]}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{announcement}</p>
        {projectOrder.map((project) => {
          const details = text.projects[project.id];
          if (!matchesFilter(project.tags, filter)) return null;
          const hasShots = Boolean(details.shots?.length);
          return (
            <article
              className={hasShots ? "project has-shots" : "project"}
              id={project.id}
              key={project.id}
              {...(hasShots
                ? {
                    role: "button",
                    tabIndex: 0,
                    "aria-expanded": openId === project.id,
                    "aria-labelledby": `${project.id}-title`,
                    onClick: (event) => openCard(project.id, event),
                    onKeyDown: (event) => onShotKeyDown(event, project.id),
                  }
                : {})}
            >
              <div className={`plate ${project.plate}`}>
                <div>
                  <p className="plate-index">{project.index}</p>
                  <p className="plate-kicker">{details.plate}</p>
                </div>
                <div>
                  <ul className="plate-list">
                    {details.plateItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <p className="plate-org">{project.org}</p>
                </div>
              </div>
              <div className="project-body">
                <div className="project-top">
                  <p>{details.meta}</p>
                  <p className="when">{details.when}</p>
                </div>
                <h3 id={hasShots ? `${project.id}-title` : undefined}>{details.title}</h3>
                <p>{details.lede}</p>
                {hasShots ? <p className="shots-hint">{intro.showShots}</p> : <ProjectFacts details={details} />}
              </div>
            </article>
          );
        })}
      </div>
      {openProject && openDetails ? (
        <dialog
          ref={dialogRef}
          className="project-float"
          aria-labelledby="project-float-title"
          onClose={onDialogClose}
          onClick={onDialogClick}
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.close();
          }}
        >
          <button
            type="button"
            className="project-float-close"
            aria-label={intro.hideShots}
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
          <div className="project-float-layout">
            <div className={`plate ${openProject.plate}`}>
              <div>
                <p className="plate-index">{openProject.index}</p>
                <p className="plate-kicker">{openDetails.plate}</p>
              </div>
              <div>
                <ul className="plate-list">
                  {openDetails.plateItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className="plate-org">{openProject.org}</p>
              </div>
            </div>
            <div className="project-body">
              <div className="project-top">
                <p>{openDetails.meta}</p>
              </div>
              <h3 id="project-float-title">{openDetails.title}</h3>
              <p>{openDetails.lede}</p>
              <ProjectFacts details={openDetails} />
              <ProjectShots details={openDetails} />
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
