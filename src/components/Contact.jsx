import { useId, useState } from "react";
import { useLanguage } from "../logic/LanguageContext.jsx";
import { copyText } from "../logic/clipboard.js";
import { trackEvent } from "../logic/analytics.js";
import "../styles/Contact.css";

const MAIL = "joshi.jc2032@gmail.com";
const WHATSAPP = "523521887541";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const { text } = useLanguage();
  const contact = text.contact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();
  const mailSubject = subject.trim() || contact.subject;
  const body = [
    name.trim() ? `${contact.name}: ${name.trim()}` : "",
    email.trim() ? `${contact.yourEmail}: ${email.trim()}` : "",
    message.trim(),
  ].filter(Boolean).join("\n\n");
  const mailHref = `mailto:${MAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
  const draft = [name.trim() ? `${contact.name}: ${name.trim()}` : "", message.trim()].filter(Boolean).join("\n\n");
  const whatsappHref = draft
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(draft)}`
    : `https://wa.me/${WHATSAPP}`;

  async function onCopyEmail() {
    const ok = await copyText(MAIL);
    if (!ok) return;
    trackEvent("email-copy");
    setCopied(true);
    window.clearTimeout(onCopyEmail.timer);
    onCopyEmail.timer = window.setTimeout(() => setCopied(false), 2500);
  }

  function validate() {
    const next = {};
    if (!email.trim()) next.email = contact.emailMissing;
    else if (!EMAIL_RE.test(email.trim())) next.email = contact.emailInvalid;
    if (!message.trim()) next.message = contact.messageMissing;
    return next;
  }

  function onSend(event) {
    const next = validate();
    setErrors(next);
    if (!next.email && !next.message) return;
    event.preventDefault();
    document.getElementById(next.email ? emailId : messageId)?.focus();
  }

  function clearError(key) {
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
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
          <div className="contact-body">
            <p className="contact-destination">
              <span>{contact.email}</span>
              <span className="contact-mail-row">
                <strong>{MAIL}</strong>
                <button
                  type="button"
                  className={`contact-copy${copied ? " is-copied" : ""}`}
                  aria-label={contact.copyEmail}
                  title={copied ? contact.copied : contact.copyEmail}
                  onClick={onCopyEmail}
                >
                  {copied ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                      <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                      <rect x="8.5" y="8.5" width="11" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M15.5 8.5V6a2.2 2.2 0 0 0-2.2-2.2H6.7A2.2 2.2 0 0 0 4.5 6v8.3a2.2 2.2 0 0 0 2.2 2.2h1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                  <span className="contact-copy-tip" aria-hidden="true">{copied ? contact.copied : contact.copyEmail}</span>
                </button>
                <span className="sr-only" aria-live="polite">{copied ? contact.copiedLong : ""}</span>
              </span>
            </p>
            <form className="contact-form" noValidate onSubmit={(event) => event.preventDefault()}>
              <label htmlFor={nameId}>{contact.name}</label>
              <input
                id={nameId}
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <label htmlFor={emailId}>{contact.yourEmail}</label>
              <input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${emailId}-error` : undefined}
                onChange={(event) => { setEmail(event.target.value); clearError("email"); }}
              />
              {errors.email ? (
                <p className="contact-error" id={`${emailId}-error`} role="alert">{errors.email}</p>
              ) : null}
              <label htmlFor={subjectId}>{contact.subjectLabel}</label>
              <input
                id={subjectId}
                name="subject"
                placeholder={contact.subject}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
              <label htmlFor={messageId}>{contact.message}</label>
              <textarea
                id={messageId}
                name="message"
                required
                rows={5}
                placeholder={contact.messagePlaceholder}
                value={message}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? `${messageId}-error` : undefined}
                onChange={(event) => { setMessage(event.target.value); clearError("message"); }}
              />
              {errors.message ? (
                <p className="contact-error" id={`${messageId}-error`} role="alert">{errors.message}</p>
              ) : null}
              <div className="contact-actions">
                <a className="btn btn-primary" href={mailHref} onClick={onSend}>{contact.send}</a>
                <a className="btn btn-ghost" href={whatsappHref} target="_blank" rel="noreferrer">{contact.whatsapp}</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
