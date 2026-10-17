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
  const [sent, setSent] = useState(false);
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
    if (!next.email && !next.message) {
      trackEvent("contact-send");
      setSent(true);
      return;
    }
    setSent(false);
    event.preventDefault();
    document.getElementById(next.email ? emailId : messageId)?.focus();
  }

  function onWhatsApp() {
    trackEvent("contact-whatsapp");
  }

  function clearError(key) {
    setSent(false);
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }

  const copyIcon = copied ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <rect x="8.5" y="8.5" width="11" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 8.5V6a2.2 2.2 0 0 0-2.2-2.2H6.7A2.2 2.2 0 0 0 4.5 6v8.3a2.2 2.2 0 0 0 2.2 2.2h1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
  const mailIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 7l7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
  const chatIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3L3.8 20.2l4.2-1.1A8.2 8.2 0 1 0 12 3.8z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 9.2c.2 1.9 2.1 4.3 4.6 5.3l1.2-1.2 1.7.8c-.2 1-1 1.7-2 1.6-3.3-.3-6.4-3.6-6.7-6.6-.1-1 .6-1.8 1.6-2l.8 1.7z" fill="currentColor" />
    </svg>
  );
  const emailDescribedBy = [errors.email ? `${emailId}-error` : null].filter(Boolean).join(" ") || undefined;
  const messageDescribedBy = [`${messageId}-count`, errors.message ? `${messageId}-error` : null].filter(Boolean).join(" ");

  return (
    <section className="section" id="contacto">
      <div className="wrap">
        <header className="section-head">
          <p className="num">06</p>
          <h2>{contact.title}</h2>
          <p className="section-lead">{contact.lead}</p>
        </header>
        <div className="contact-panel">
          <aside className="contact-info" aria-labelledby="contact-channels-title">
            <h3 className="contact-kicker" id="contact-channels-title">{contact.channelsTitle}</h3>
            <div className="contact-channel">
              <span className="contact-channel-icon">{mailIcon}</span>
              <div className="contact-channel-body">
                <span className="contact-channel-label">{contact.email}</span>
                <span className="contact-mail-row">
                  <a className="contact-mail" href={`mailto:${MAIL}`}>{MAIL}</a>
                  <button
                    type="button"
                    className={`contact-copy${copied ? " is-copied" : ""}`}
                    aria-label={contact.copyEmail}
                    title={copied ? contact.copied : contact.copyEmail}
                    onClick={onCopyEmail}
                  >
                    {copyIcon}
                    <span className="contact-copy-tip" aria-hidden="true">{copied ? contact.copied : contact.copyEmail}</span>
                  </button>
                  <span className="sr-only" aria-live="polite">{copied ? contact.copiedLong : ""}</span>
                </span>
                <span className="contact-channel-note">{contact.emailNote}</span>
              </div>
            </div>
            <a className="contact-channel is-link" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" onClick={onWhatsApp}>
              <span className="contact-channel-icon">{chatIcon}</span>
              <span className="contact-channel-body">
                <span className="contact-channel-label">{contact.whatsapp}</span>
                <span className="contact-channel-value">{contact.whatsappNote}</span>
              </span>
              <span className="contact-channel-arrow" aria-hidden="true">↗</span>
            </a>
            <div className="contact-topics">
              <h3 className="contact-kicker">{contact.topicsTitle}</h3>
              <ul>
                {contact.topics.map((topic) => <li key={topic}>{topic}</li>)}
              </ul>
              <p>{contact.tip}</p>
            </div>
          </aside>
          <form className="contact-form" noValidate aria-labelledby="contact-form-title" onSubmit={(event) => event.preventDefault()}>
            <h3 className="contact-form-title" id="contact-form-title">{contact.formTitle}</h3>
            <div className="contact-row">
              <div className="contact-field">
                <label htmlFor={nameId}>{contact.name} <span className="contact-flag">{contact.optional}</span></label>
                <input
                  id={nameId}
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => { setName(event.target.value); setSent(false); }}
                />
              </div>
              <div className="contact-field">
                <label htmlFor={emailId}>{contact.yourEmail} <span className="contact-flag is-required">{contact.required}</span></label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={emailDescribedBy}
                  onChange={(event) => { setEmail(event.target.value); clearError("email"); }}
                />
                {errors.email ? (
                  <p className="contact-error" id={`${emailId}-error`} role="alert">{errors.email}</p>
                ) : null}
              </div>
            </div>
            <div className="contact-field">
              <label htmlFor={subjectId}>{contact.subjectLabel} <span className="contact-flag">{contact.optional}</span></label>
              <input
                id={subjectId}
                name="subject"
                placeholder={contact.subject}
                value={subject}
                onChange={(event) => { setSubject(event.target.value); setSent(false); }}
              />
            </div>
            <div className="contact-field">
              <label htmlFor={messageId}>{contact.message} <span className="contact-flag is-required">{contact.required}</span></label>
              <textarea
                id={messageId}
                name="message"
                required
                rows={6}
                placeholder={contact.messagePlaceholder}
                value={message}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={messageDescribedBy}
                onChange={(event) => { setMessage(event.target.value); clearError("message"); }}
              />
              <div className="contact-field-foot">
                {errors.message ? (
                  <p className="contact-error" id={`${messageId}-error`} role="alert">{errors.message}</p>
                ) : <span />}
                <span className="contact-count" id={`${messageId}-count`}>{contact.charCount(message.trim().length)}</span>
              </div>
            </div>
            <div className="contact-actions">
              <a className="btn btn-primary contact-send" href={mailHref} onClick={onSend}>
                {mailIcon}
                {contact.send}
              </a>
              <a className="btn btn-ghost contact-wa" href={whatsappHref} target="_blank" rel="noreferrer" onClick={onWhatsApp}>
                {chatIcon}
                {contact.whatsapp}
              </a>
              <p className="contact-send-note">{contact.sendNote}</p>
            </div>
            <div className="contact-status" role="status" aria-live="polite">
              {sent ? (
                <p className="contact-sent">
                  <strong>{contact.sentTitle}</strong>{" "}
                  {contact.sentText} <a href={`mailto:${MAIL}`}>{MAIL}</a>.
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
