import { useLanguage } from "../logic/LanguageContext.jsx";
import "../styles/Footer.css";

export function Footer({ inert }) {
  const { text } = useLanguage();

  return (
    <footer className="site-footer" inert={inert}>
      <div className="wrap footer-bar">
        <p>Josué Isaí Salazar Castro</p>
        <p>{text.footer}</p>
        <div className="footer-links">
          <a href="mailto:joshi.jc2032@gmail.com">joshi.jc2032@gmail.com</a>
          <a href="https://github.com/Joshi2032?tab=repositories" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/josue-isai-salazar-castro-47600a227/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
