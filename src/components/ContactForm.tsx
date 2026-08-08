"use client";

import { useState } from "react";

export function ContactForm({ email }: { email: string }) {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const anliegen = String(form.get("anliegen") || "");
    const name = String(form.get("name") || "");
    const senderEmail = String(form.get("email") || "");
    const nachricht = String(form.get("nachricht") || "");

    const body = `Anliegen: ${anliegen}\nName: ${name}\nE-Mail: ${senderEmail}\n\nNachricht:\n${nachricht}`;
    const mailto = `mailto:${email}?subject=${encodeURIComponent(`Kontaktanfrage: ${anliegen}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSubmitting(false);
  }

  return (
    <form className="card contact-form" onSubmit={handleSubmit} noValidate>
      <h3>Schreiben Sie uns</h3>
      <label>
        Name*
        <input type="text" name="name" required />
      </label>
      <label>
        E-Mail*
        <input type="email" name="email" required />
      </label>
      <label>
        Anliegen
        <select name="anliegen" defaultValue="Reservierung">
          <option>Reservierung</option>
          <option>Veranstaltung</option>
          <option>Bestellung</option>
          <option>Sonstiges</option>
        </select>
      </label>
      <label>
        Nachricht*
        <textarea name="nachricht" rows={5} required />
      </label>
      <button type="submit" className="btn btn--block" disabled={submitting}>
        Nachricht senden
      </button>
      <p className="order-form__note">
        Öffnet dein E-Mail-Programm mit vorausgefüllter Nachricht an <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </form>
  );
}
