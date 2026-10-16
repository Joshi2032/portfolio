import { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { filters, matchesFilter, projectOrder } from "../logic/catalog.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import { useMediaQuery } from "../responsive/useMediaQuery.js";
import "../styles/Projects.css";

function PlateMotion({ reduceMotion }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (reduceMotion || !node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  if (reduceMotion) return null;
  return (
    <div className="plate-lottie" aria-hidden="true" ref={ref}>
      {visible ? (
        <DotLottieReact
          src={`${import.meta.env.BASE_URL}lottie/abstract.lottie`}
          loop
          autoplay
          layout={{ fit: "cover", align: [0.5, 0.5] }}
        />
      ) : null}
    </div>
  );
}

function ProjectKind({ details, intro }) {
  if (details.client) {
    return (
      <p className="project-kind">
        <span>{intro.forCompany}</span>
        <strong>{details.client}</strong>
      </p>
    );
  }
  return (
    <p className="project-kind is-own">
      <span>{intro.ownWork}</span>
    </p>
  );
}

function ProjectFacts({ details }) {
  return (
    <>
      <ul className="points">
        {details.points.map((point) => <li key={point}>{point}</li>)}
      </ul>
      {details.site ? (
        <p className="project-site">
          <a href={details.site.href} target="_blank" rel="noreferrer">{details.site.label}</a>
        </p>
      ) : null}
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

function ProjectAlongside({ work }) {
  return (
    <div className="project-alongside">
      <p className="work-kicker">{work.kicker}</p>
      <h3>{work.title}</h3>
      <p>{work.lede}</p>
      <ProjectFacts details={work} />
    </div>
  );
}

function showWithoutScroll(dialog) {
  const top = window.scrollY;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  dialog.showModal();
  window.scrollTo(0, top);
  requestAnimationFrame(() => {
    window.scrollTo(0, top);
    root.style.scrollBehavior = previous;
  });
}

function ProjectShots({ details, onOpen }) {
  return (
    <figure className="shots">
      {details.shots.map((shot) => (
        <button
          key={shot.src}
          type="button"
          className="shot"
          onClick={(event) => onOpen(shot, event)}
        >
          <img
            src={`${import.meta.env.BASE_URL}${shot.src}`}
            alt={shot.alt}
          />
        </button>
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
  const shotRef = useRef(null);
  const returnFocus = useRef(null);
  const shotReturn = useRef(null);
  const closingFromCleanup = useRef(false);
  const shotCleanup = useRef(false);
  const [shotIndex, setShotIndex] = useState(null);
  const intro = text.projectsIntro;
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const visibleCount = projectOrder.filter((project) => matchesFilter(project.tags, filter)).length;
  const openProject = projectOrder.find((project) => project.id === openId) ?? null;
  const openDetails = openProject ? text.projects[openProject.id] : null;
  const shots = openDetails?.shots ?? [];
  const shot = shotIndex == null ? null : shots[shotIndex] ?? null;

  useEffect(() => {
    if (previous.current.filter === filter && previous.current.lang === lang) return;
    previous.current = { filter, lang };
    setAnnouncement(intro.filters.count(visibleCount));
  }, [filter, lang, visibleCount, intro.filters]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !openId) return undefined;
    showWithoutScroll(dialog);
    return () => {
      if (!dialog.open) return;
      closingFromCleanup.current = true;
      dialog.close();
      closingFromCleanup.current = false;
    };
  }, [openId]);

  useEffect(() => {
    const dialog = shotRef.current;
    if (!dialog || shotIndex == null) return undefined;
    showWithoutScroll(dialog);
    return () => {
      if (!dialog.open) return;
      shotCleanup.current = true;
      dialog.close();
      shotCleanup.current = false;
    };
  }, [shotIndex == null]);

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
    setShotIndex(null);
    const target = returnFocus.current;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }

  function openShot(next, event) {
    event.stopPropagation();
    const index = (openDetails?.shots ?? []).findIndex((item) => item.src === next.src);
    shotReturn.current = event.currentTarget;
    setShotIndex(index < 0 ? 0 : index);
  }

  function stepShot(delta) {
    setShotIndex((index) => {
      if (index == null || shots.length < 2) return index;
      return (index + delta + shots.length) % shots.length;
    });
  }

  function onShotDialogClose() {
    if (shotCleanup.current) return;
    setShotIndex(null);
    const target = shotReturn.current;
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
        <div className="project-list">
        {projectOrder.map((project) => {
          const details = text.projects[project.id];
          if (!matchesFilter(project.tags, filter)) return null;
          const hasShots = Boolean(details.shots?.length);
          const opens = hasShots || Boolean(details.alongside);
          const kind = details.client ? "is-client" : "is-own";
          return (
            <article
              className={`project ${kind}${opens ? " has-shots" : ""}`}
              id={project.id}
              key={project.id}
              {...(opens
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
                <PlateMotion reduceMotion={reduceMotion} />
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
                <ProjectKind details={details} intro={intro} />
                <div className="project-top">
                  <p>{details.meta}</p>
                  <p className="when">{details.when}</p>
                </div>
                <h3 id={opens ? `${project.id}-title` : undefined}>{details.title}</h3>
                {details.alongside ? (
                  <p className="alongside-name" id={details.alongside.anchor}>{details.alongside.title}</p>
                ) : (
                  <p>{details.lede}</p>
                )}
                {opens ? <p className="shots-hint">{intro.showShots}</p> : <ProjectFacts details={details} />}
              </div>
            </article>
          );
        })}
        </div>
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
              <PlateMotion reduceMotion={reduceMotion} />
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
              <ProjectKind details={openDetails} intro={intro} />
              <div className="project-top">
                <p>{openDetails.meta}</p>
              </div>
              <div className={openDetails.alongside ? "float-works" : undefined}>
                <div>
                  <h3 id="project-float-title">{openDetails.title}</h3>
                  <p>{openDetails.lede}</p>
                  <ProjectFacts details={openDetails} />
                  {openDetails.shots?.length ? <ProjectShots details={openDetails} onOpen={openShot} /> : null}
                </div>
                {openDetails.alongside ? <ProjectAlongside work={openDetails.alongside} /> : null}
              </div>
            </div>
          </div>
        </dialog>
      ) : null}
      {shot ? (
        <dialog
          ref={shotRef}
          className="shot-zoom"
          aria-label={shot.alt}
          onClose={onShotDialogClose}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.close();
            if (event.key === "ArrowRight") {
              event.preventDefault();
              stepShot(1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              stepShot(-1);
            }
          }}
        >
          {shots.length > 1 ? (
            <button
              type="button"
              className="shot-nav prev"
              aria-label={intro.prevShot}
              onClick={() => stepShot(-1)}
            >
              ‹
            </button>
          ) : null}
          <button
            type="button"
            className="project-float-close"
            aria-label={intro.closeShot}
            onClick={() => shotRef.current?.close()}
          >
            ×
          </button>
          {shots.length > 1 ? (
            <button
              type="button"
              className="shot-nav next"
              aria-label={intro.nextShot}
              onClick={() => stepShot(1)}
            >
              ›
            </button>
          ) : null}
          <img
            src={`${import.meta.env.BASE_URL}${shot.src}`}
            alt={shot.alt}
          />
        </dialog>
      ) : null}
    </section>
  );
}
