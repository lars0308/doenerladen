"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_KEY = "ldh_hinweis_bestaetigt_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(COOKIE_KEY) === "1";
    } catch {
      // localStorage unavailable (e.g. blocked) — just show the banner.
    }
    if (!alreadySeen) {
      const timer = window.setTimeout(() => setVisible(true), 900);
      return () => window.clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(COOKIE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <div
      className={`cookie-banner${visible ? " is-visible" : ""}`}
      role="dialog"
      aria-label="Hinweis zur Nutzung dieser Website"
      aria-hidden={!visible}
    >
      <p className="cookie-banner__chalk">Kurzer Hinweis vom Tresen —</p>
      <p>
        Wir verwenden auf dieser Seite nur technisch notwendige Speicherung, damit dieser Hinweis sich merkt, dass du
        ihn schon gesehen hast (kein Tracking, keine Werbe-Cookies, keine Weitergabe an Dritte). Details dazu findest
        du in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>
      <div className="cookie-banner__actions">
        <button className="btn btn--sm" type="button" onClick={dismiss}>
          Verstanden
        </button>
        <Link href="/datenschutz" className="btn-underline">
          Mehr erfahren
        </Link>
      </div>
    </div>
  );
}
