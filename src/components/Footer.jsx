import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Footer.css";

export function Footer({ inert }) {
  const { text } = useLanguage();

  return (
    <footer className="site-footer" inert={inert}>
      <div className="wrap footer-bar">
        <p>Josué Isaí Salazar Castro</p>
        <p>{text.footer}</p>
        <a href="mailto:joshi.jc2032@gmail.com">joshi.jc2032@gmail.com</a>
      </div>
    </footer>
  );
}
