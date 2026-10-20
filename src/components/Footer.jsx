import "../styles/Footer.css";

export function Footer({ inert }) {
  return (
    <footer className="site-footer" inert={inert}>
      <div className="wrap footer-bar">
        <div className="footer-brand">
          <img
            className="footer-rowlet"
            src={`${import.meta.env.BASE_URL}rowlet.gif`}
            width="44"
            height="44"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
          <p>Josué Isaí Salazar Castro</p>
        </div>
        <div className="footer-links">
          <a href="mailto:joshi.jc2032@gmail.com">joshi.jc2032@gmail.com</a>
          <a href="https://github.com/Joshi2032?tab=repositories" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/josue-isai-salazar-castro-47600a227/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
