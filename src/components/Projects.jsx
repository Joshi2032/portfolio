import { Fragment, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { filters, matchesFilter, projectOrder } from "../logic/catalog.js";
import { useLanguage } from "../logic/LanguageContext.jsx";
import { copyText } from "../logic/clipboard.js";
import { trackEvent } from "../logic/analytics.js";
import { showWithoutScroll } from "./showWithoutScroll.js";
import { countUp, flip, growFrom, observeReveal } from "../logic/motion.js";
import { NOTE_IDS, loadExtras, loadViewer, needsExtras, prefetchProject } from "./projectChunks.js";
import "../styles/Projects.css";
import "../styles/Mosaic.css";

const SITE = "https://joshi2032.github.io/portfolio/";

function shareUrl(lang, id) {
  return `${SITE}${lang === "en" ? "en/" : ""}proyectos/${id}/`;
}

// A project id in the hash (e.g. #ensamble) is a deep link, not a section anchor:
// strip it from the URL once the dialog takes over or closes, keeping ?lang etc.
function cleanProjectHash() {
  const hash = window.location.hash.slice(1);
  if (!projectOrder.some((project) => project.id === hash)) return;
  const url = new URL(window.location.href);
  history.replaceState(history.state, "", `${url.pathname}${url.search}`);
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

function ProjectFacts({ details, withResult = true }) {
  return (
    <>
      {details.points?.length ? (
        <ul className="points">
          {details.points.map((point) => <li key={point}>{point}</li>)}
        </ul>
      ) : null}
      {details.site ? (
        <p className="project-site">
          <a href={details.site.href} target="_blank" rel="noreferrer">{details.site.label}</a>
        </p>
      ) : null}
      <ul className="tags">
        {details.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
      {!withResult ? null : details.result ? (
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
    <figure className={details.shotsWide ? "shots is-wide" : "shots"}>
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

function MiniFlow({ flow }) {
  const nodes = flow.steps
    ? flow.steps.map((step) => step.title)
    : [...flow.paths[0].steps.map((step) => step.title), flow.engine.title, flow.output.title];
  return (
    <span className="mini-flow" aria-hidden="true">
      {nodes.map((title, i) => (
        <Fragment key={title}>
          {i ? <span className="mini-arrow" style={{ "--d": i * 2 - 1 }}>↓</span> : null}
          <span className={i === nodes.length - 1 ? "mini-node is-end" : "mini-node"} style={{ "--d": i * 2 }}>{title}</span>
        </Fragment>
      ))}
    </span>
  );
}

// Visual for the big mosaic cells: the first screenshot, or the flow when there is none.
function CardMedia({ details }) {
  const first = details.shots?.[0];
  if (first) {
    return (
      <span className={`cell-media ${details.shotsWide ? "is-wide" : "is-portrait"}`}>
        <img src={`${import.meta.env.BASE_URL}${first.src}`} alt="" loading="lazy" decoding="async" />
      </span>
    );
  }
  if (details.flow) return <span className="cell-media is-flow"><MiniFlow flow={details.flow} /></span>;
  return null;
}

// A live-looking preview of a website the project built: the full page scrolls
// inside a browser frame, next to the phone view. Both open in the image viewer.
function SitePreview({ details, intro, onOpen }) {
  const [desktop, phone] = details.shots;
  return (
    <section className="site-preview" aria-label={intro.sitePreview}>
      <h4>{intro.sitePreview}</h4>
      <p className="site-preview-hint">{intro.sitePreviewHint}</p>
      <div className="site-preview-grid">
        <button type="button" className="shot browser" aria-label={desktop.alt} onClick={(event) => onOpen(desktop, event)}>
          <span className="browser-bar" aria-hidden="true"><i /><i /><i /><span>{details.site.label}</span></span>
          <span className="browser-view">
            <img src={`${import.meta.env.BASE_URL}${details.preview.src}`} alt="" loading="lazy" decoding="async" />
          </span>
        </button>
        {phone ? (
          <button type="button" className="shot phone" aria-label={phone.alt} onClick={(event) => onOpen(phone, event)}>
            <img src={`${import.meta.env.BASE_URL}${phone.src}`} alt="" loading="lazy" decoding="async" />
          </button>
        ) : null}
      </div>
      <a className="btn btn-ghost site-preview-open" href={details.site.href} target="_blank" rel="noreferrer">
        {intro.openSite} {details.site.label} ↗
      </a>
    </section>
  );
}

export function Projects() {
  const { lang, text } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const gridRef = useRef(null);
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

  useEffect(() => observeReveal(gridRef.current, (cell) => countUp(cell.querySelector("[data-count]"))), []);

  useEffect(() => {
    function onPop() {
      if (ignorePops.current > 0) {
        ignorePops.current -= 1;
        // Own close (button/Esc/backdrop): depth already dropped to 0 in
        // onDialogClose, so a leftover project hash can be cleaned here.
        if (depth.current === 0) cleanProjectHash();
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
        cleanProjectHash();
        const target = returnFocus.current;
        if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      }
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("p");
    const hashId = window.location.hash.slice(1);
    // Cold load with a project hash (#ensamble) behaves like ?p=ensamble:
    // open the dialog instead of leaving the page at the top.
    const fromHash = !id && projectOrder.some((project) => project.id === hashId);
    const target = id || (fromHash ? hashId : null);
    if (!target) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("p");
    history.replaceState(null, "", `${url.pathname}${url.search}${fromHash ? "" : url.hash}`);
    const project = projectOrder.find((item) => item.id === target);
    if (!project) return;
    returnFocus.current = document.getElementById(target);
    openProjectLayer(target);
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
    growFrom(dialog, returnFocus.current);
    dialog.querySelectorAll("[data-count]").forEach(countUp);
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

  function changeFilter(id) {
    if (id === filter) return;
    flip(gridRef.current, () => flushSync(() => setFilter(id)));
  }

  function changeView(next) {
    if (next === view) return;
    flip(gridRef.current, () => flushSync(() => setView(next)));
  }

  const gridClass = `mosaic ${view === "index" ? "is-index" : "is-grid"}${filter !== "all" ? " is-filtered" : ""}`;

  return (
    <section className="section" id="proyectos">
      <div className="wrap">
        <header className="section-head">
          <p className="num">02</p>
          <h2>{intro.title}</h2>
          <p className="section-lead">{intro.lead}</p>
        </header>
        <div className="mosaic-controls">
          <div className="filters" role="group" aria-label={intro.filters.aria}>
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => changeFilter(item.id)}
              >
                {intro.filters[item.id]}
              </button>
            ))}
          </div>
          <div className="view-switch" role="group" aria-label={intro.viewLabel}>
            {["grid", "index"].map((id) => (
              <button key={id} type="button" aria-pressed={view === id} onClick={() => changeView(id)}>
                {id === "grid" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="10" height="10" rx="2" /><rect x="15" y="3" width="6" height="10" rx="2" /><rect x="3" y="15" width="6" height="6" rx="2" /><rect x="11" y="15" width="10" height="6" rx="2" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
                {id === "grid" ? intro.viewMosaic : intro.viewIndex}
              </button>
            ))}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">{announcement}</p>
        <div className={gridClass} ref={gridRef}>
          {projectOrder.map((project, order) => {
            const details = text.projects[project.id];
            const size = project.size || "s";
            return (
              <article
                className={`cell size-${size} ${project.plate}`}
                id={project.id}
                key={project.id}
                hidden={!matchesFilter(project.tags, filter) || undefined}
                style={{ "--i": order }}
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-expanded={openId === project.id}
                aria-labelledby={`${project.id}-title`}
                onClick={(event) => openCard(project.id, event)}
                onKeyDown={(event) => onShotKeyDown(event, project.id)}
                onPointerEnter={() => prefetchProject(project.id, details)}
                onFocus={() => prefetchProject(project.id, details)}
                onTouchStart={() => prefetchProject(project.id, details)}
              >
                <span className="cell-plate" aria-hidden="true" />
                {!project.size && details.preview ? (
                  <span className="cell-thumb">
                    <img src={`${import.meta.env.BASE_URL}${details.shots[0].src}`} alt="" loading="lazy" decoding="async" />
                    <span className="cell-url">{details.site.label}</span>
                  </span>
                ) : null}
                <span className="cell-body">
                  <span className="cell-top">
                    <span className="cell-num">{project.index}</span>
                    <span className="cell-cat">{details.category}</span>
                  </span>
                  <h3 id={`${project.id}-title`}>{details.title}</h3>
                  <span className="cell-tag">{details.plate} · {details.client || details.meta}</span>
                  <span className="cell-when">{details.when}</span>
                  <span className="cell-summary">{details.card.summary}</span>
                  <span className="cell-stat">
                    <strong data-count={details.card.stat}><span className="stat-real">{details.card.stat}</span></strong>
                    <span>{details.card.label}</span>
                  </span>
                  <ul className="tags">
                    {details.tags.slice(0, 4).map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </span>
                {project.size ? <CardMedia details={details} /> : null}
                <span className="cell-cta" aria-hidden="true">{intro.showShots} →</span>
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
          <div className="pf-scroll">
            <header className={`pf-hero ${openProject.plate}`}>
              <span className="cell-plate" aria-hidden="true" />
              <p className="cell-top">
                <span className="cell-num">{openProject.index}</span>
                <span className="cell-cat">{openDetails.category}</span>
              </p>
              <h3 id="project-float-title">{openDetails.title}</h3>
              <p className="pf-tagline">{openDetails.plate}</p>
              <div className="pf-meta">
                <ProjectKind details={openDetails} intro={intro} />
                <span>{openDetails.meta}</span>
                <span>{openDetails.when}</span>
                <ShareButton lang={lang} id={openProject.id} title={openDetails.title} intro={intro} />
              </div>
            </header>
            <div className="pf-main">
              <div className="pf-cols">
                <div className="pf-text">
                  <p className="pf-lede">{openDetails.lede}</p>
                  <ProjectFacts details={openDetails} withResult={false} />
                </div>
                <aside className="pf-side">
                  <p className="result pf-result">
                    <strong data-count={openDetails.resultStat || openDetails.card.stat}>
                      <span className="stat-real">{openDetails.resultStat || openDetails.card.stat}</span>
                    </strong>
                    <span>{openDetails.result || openDetails.card.label}</span>
                  </p>
                  <div className="pf-summary">
                    <h4>{intro.summary}</h4>
                    <ul>
                      {openDetails.plateItems.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </aside>
              </div>
              {openDetails.preview ? <SitePreview details={openDetails} intro={intro} onOpen={openShot} /> : null}
              {openDetails.flow && extrasMod ? <extrasMod.ProjectFlow flow={openDetails.flow} /> : null}
              {openDetails.shots?.length && !openDetails.preview ? <ProjectShots details={openDetails} onOpen={openShot} /> : null}
              {openDetails.alongside ? <ProjectAlongside work={openDetails.alongside} /> : null}
              {NOTE_IDS.includes(openProject.id) && extrasMod ? <extrasMod.TechNote id={openProject.id} lang={lang} /> : null}
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
