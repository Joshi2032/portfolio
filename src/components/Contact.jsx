import { useId, useState } from "react";
import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Contact.css";

const MAIL = "joshi.jc2032@gmail.com";
const WHATSAPP = "523521887541";
const MAP_PLACE = "Nicolás Régules 63, La Piedad, Michoacán, México";
const MAP_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_PLACE)}`;

function mapSrc(place, lang) {
  const language = lang === "en" ? "en" : "es";
  const query = encodeURIComponent(place);
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (key) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${query}&zoom=17&language=${language}`;
  }
  return `https://maps.google.com/maps?q=${query}&z=17&hl=${language}&output=embed`;
}

export function Contact() {
  const { lang, text } = useLanguage();
  const contact = text.contact;
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [missing, setMissing] = useState(false);
  const nameId = useId();
  const messageId = useId();
  const draft = [
    name.trim() ? `${contact.name}: ${name.trim()}` : "",
    message.trim(),
  ].filter(Boolean).join("\n\n");
  const mailHref = `mailto:${MAIL}?subject=${encodeURIComponent(contact.subject)}&body=${encodeURIComponent(draft)}`;
  const whatsappHref = draft
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(draft)}`
    : `https://wa.me/${WHATSAPP}`;

  function onSend(event) {
    if (message.trim()) return;
    event.preventDefault();
    setMissing(true);
    document.getElementById(messageId)?.focus();
  }

  function onMessage(event) {
    const value = event.target.value;
    setMessage(value);
    if (value.trim()) setMissing(false);
  }

  return (
    <section className="section" id="contacto">
      <div className="wrap">
        <header className="section-head">
          <p className="num">05</p>
          <h2>{contact.title}</h2>
          <p className="section-lead">{contact.lead}</p>
        </header>
        <div className="contact-panel">
          <div className="contact-place">
            <span>{contact.city}</span>
            <div className="contact-map">
              <iframe
                title={MAP_PLACE}
                src={mapSrc(MAP_PLACE, lang)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a className="contact-map-link" href={MAP_HREF} target="_blank" rel="noreferrer">{contact.openMap}</a>
            <div>
              <strong>{contact.street}</strong>
              <p>{contact.cityValue}</p>
            </div>
          </div>
          <div className="contact-body">
            <p className="contact-destination">
              <span>{contact.email}</span>
              <strong>{MAIL}</strong>
            </p>
            <form className="contact-form">
              <label htmlFor={nameId}>{contact.name}</label>
              <input
                id={nameId}
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <label htmlFor={messageId}>{contact.message}</label>
              <textarea
                id={messageId}
                name="message"
                required
                rows={5}
                placeholder={contact.messagePlaceholder}
                value={message}
                aria-invalid={missing || undefined}
                aria-describedby={missing ? `${messageId}-error` : undefined}
                onChange={onMessage}
              />
              {missing ? (
                <p className="contact-error" id={`${messageId}-error`} role="alert">{contact.messageMissing}</p>
              ) : null}
              <div className="contact-actions">
                <a className="btn btn-primary" href={mailHref} onClick={onSend}>{contact.send}</a>
                <a className="btn btn-ghost" href={whatsappHref} target="_blank" rel="noreferrer">{contact.whatsapp}</a>
              </div>
            </form>
            <a className="contact-phone" href="tel:+523521887541">
              <span>{contact.phone}</span>
              <strong>352 188 7541</strong>
              <em>{contact.call}</em>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
