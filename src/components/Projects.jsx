import { useEffect, useRef, useState } from "react";
import { LazyLottie } from "./LazyLottie.jsx";
import { filters, matchesFilter, projectOrder } from "../logic/catalog.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import { copyText } from "../logic/clipboard.js";
import { trackEvent } from "../logic/analytics.js";
import { useMediaQuery } from "../responsive/useMediaQuery.js";
import { showWithoutScroll } from "./showWithoutScroll.js";
import { loadExtras, loadViewer, needsExtras, prefetchProject } from "./projectChunks.js";
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
        <LazyLottie
          src={`${import.meta.env.BASE_URL}lottie/abstract.lottie`}
          loop
          autoplay
          layout={{ fit: "cover", align: [0.5, 0.5] }}
        />
      ) : null}
    </div>
  );
}

const SITE = "https://joshi2032.github.io/portfolio/";

function shareUrl(lang, id) {
  return `${SITE}${lang === "en" ? "en/" : ""}proyectos/${id}/`;
}

function ShareButton({ lang, id, title, intro }) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function onShare() {
    const url = shareUrl(lang, id);
    if (canShare) {
      try {
        await navigator.share({ title, url });
        trackEvent(`share-${id}`);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    if (await copyText(url)) {
      trackEvent(`share-copy-${id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="project-share">
      <button type="button" className="btn btn-ghost project-share-btn" onClick={onShare}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4L12 18.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {copied ? intro.linkCopied : canShare ? intro.share : intro.copyLink}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? intro.linkCopied : ""}</span>
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
        <>
          {details.metric ? (
            <p className="result">
              <strong>{details.metric.value}</strong>
              <span>{details.metric.label}</span>
            </p>
          ) : null}
          {details.delivery ? <p className="delivery">{details.delivery}</p> : null}
        </>
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
  const returnFocus = useRef(null);
  const shotReturn = useRef(null);
  const closingFromCleanup = useRef(false);
  const [extrasMod, setExtrasMod] = useState(null);
  const [viewerMod, setViewerMod] = useState(null);
  // Back-button support: each open layer (project dialog, image viewer) owns one history entry.
  const ignorePops = useRef(0);
  const depth = useRef(0);
  const layers = useRef({ openId: null, shotIndex: null });
  const [shotIndex, setShotIndex] = useState(null);
  const intro = text.projectsIntro;
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const visibleCount = projectOrder.filter((project) => matchesFilter(project.tags, filter)).length;
  const openProject = projectOrder.find((project) => project.id === openId) ?? null;
  const openDetails = openProject ? text.projects[openProject.id] : null;
  const shots = openDetails?.shots ?? [];
  const shot = shotIndex == null ? null : shots[shotIndex] ?? null;
  layers.current = { openId, shotIndex };

  async function openProjectLayer(id) {
    const details = text.projects[id];
    if (needsExtras(id, details)) setExtrasMod(await loadExtras());
    setOpenId(id);
    history.pushState({ pfLayer: "project", id }, "");
    depth.current = 1;
  }

  function popOwnLayers(count) {
    if (count <= 0) return;
    ignorePops.current += 1;
    history.go(-count);
  }

  useEffect(() => {
    function onPop() {
      if (ignorePops.current > 0) {
        ignorePops.current -= 1;
        return;
      }
      depth.current = Math.max(0, depth.current - 1);
      const { openId: current, shotIndex: currentShot } = layers.current;
      if (currentShot != null) {
        setShotIndex(null);
        const target = shotReturn.current;
        if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      } else if (current) {
        setOpenId(null);
        const target = returnFocus.current;
        if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      }
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("p");
    if (!id) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("p");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    const project = projectOrder.find((item) => item.id === id);
    if (!project) return;
    returnFocus.current = document.getElementById(id);
    openProjectLayer(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function openCard(id, event) {
    returnFocus.current = event.currentTarget;
    openProjectLayer(id);
  }

  function onShotKeyDown(event, id) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openCard(id, event);
  }

  function onDialogClose() {
    if (closingFromCleanup.current) return;
    popOwnLayers(depth.current);
    depth.current = 0;
    setOpenId(null);
    setShotIndex(null);
    const target = returnFocus.current;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }

  function openShot(next, event) {
    event.stopPropagation();
    const index = (openDetails?.shots ?? []).findIndex((item) => item.src === next.src);
    shotReturn.current = event.currentTarget;
    loadViewer().then((mod) => {
      setViewerMod(mod);
      setShotIndex(index < 0 ? 0 : index);
      history.pushState({ pfLayer: "shot" }, "");
      depth.current = 2;
    });
  }

  function stepShot(delta) {
    setShotIndex((index) => {
      if (index == null || shots.length < 2) return index;
      return (index + delta + shots.length) % shots.length;
    });
  }

  function onShotDialogClose() {
    if (depth.current === 2) {
      depth.current = 1;
      popOwnLayers(1);
    }
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
          <p className="num">02</p>
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
          const opens = true;
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
                    onClick: (event) => openCard(project.id, event),
                    onKeyDown: (event) => onShotKeyDown(event, project.id),
                    onPointerEnter: () => prefetchProject(project.id, details),
                    onFocus: () => prefetchProject(project.id, details),
                    onTouchStart: () => prefetchProject(project.id, details),
                  }
                : {})}
            >
              <div className={`plate ${project.plate}`}>
                <PlateMotion reduceMotion={reduceMotion} />
                <div>
                  <p className="plate-index">{project.index}</p>
                  <p className="plate-kicker">{details.title}</p>
                </div>
                <div>
                  <ul className="plate-list">
                    {details.plateItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <p className={`plate-org${project.orgRaw ? " is-raw" : ""}`}>{project.org}</p>
                </div>
              </div>
              <div className="project-body">
                <ProjectKind details={details} intro={intro} />
                <div className="project-top">
                  <p>{details.meta}</p>
                  <p className="when">{details.when}</p>
                </div>
                <h3 id={`${project.id}-title`}>{details.plate}</h3>
                <p className="card-summary">{details.card.summary}</p>
                <p className="card-result">
                  <strong>{details.card.stat}</strong>
                  <span>{details.card.label}</span>
                </p>
                <ul className="tags card-tags">
                  {details.tags.slice(0, 4).map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
                <p className="shots-hint">{intro.showShots}</p>
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
                <p className="plate-kicker">{openDetails.title}</p>
              </div>
              <div>
                <ul className="plate-list">
                  {openDetails.plateItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className={`plate-org${openProject.orgRaw ? " is-raw" : ""}`}>{openProject.org}</p>
              </div>
            </div>
            <div className="project-body">
              <ProjectKind details={openDetails} intro={intro} />
              <div className="project-top">
                <p>{openDetails.meta}</p>
              </div>
              <div className={openDetails.alongside ? "float-works" : undefined}>
                <div>
                  <h3 id="project-float-title">{openDetails.plate}</h3>
                  <p>{openDetails.lede}</p>
                  <ProjectFacts details={openDetails} />
                  {openDetails.shots?.length ? <ProjectShots details={openDetails} onOpen={openShot} /> : null}
                </div>
                {openDetails.alongside ? <ProjectAlongside work={openDetails.alongside} /> : null}
              </div>
              <div className="project-float-actions">
                <ShareButton lang={lang} id={openProject.id} title={openDetails.title} intro={intro} />
              </div>
              {openDetails.flow && extrasMod ? <extrasMod.ProjectFlow flow={openDetails.flow} /> : null}
              {openProject.id === "aguacate" && extrasMod ? <extrasMod.TechNote lang={lang} /> : null}
            </div>
          </div>
        </dialog>
      ) : null}
      {shot && viewerMod ? (
        <viewerMod.ShotViewer
          shot={shot}
          count={shots.length}
          intro={intro}
          onStep={stepShot}
          onClose={onShotDialogClose}
        />
      ) : null}
    </section>
  );
}
