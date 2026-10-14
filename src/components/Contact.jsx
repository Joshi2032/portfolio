import { useId, useState } from "react";
import { useLanguage } from "../logic/LanguageContext.jsx";
import "./Contact.css";

const MAIL = "joshi.jc2032@gmail.com";
const WHATSAPP = "523521887541";

export function Contact() {
  const { text } = useLanguage();
  const contact = text.contact;
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
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
    document.getElementById(messageId)?.focus();
  }

  return (
    <section className="section" id="contacto">
      <div className="wrap">
        <header className="section-head">
          <p className="num">06</p>
          <h2>{contact.title}</h2>
          <p className="section-lead">{contact.lead}</p>
        </header>
        <div className="contact-panel">
          <div className="contact-place">
            <span>{contact.city}</span>
            <strong>{contact.cityValue}</strong>
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
                onChange={(event) => setMessage(event.target.value)}
              />
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
