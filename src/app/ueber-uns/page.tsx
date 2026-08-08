import type { Metadata } from "next";
import Link from "next/link";

import { getSiteSettings, getAboutPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Seit 1999 kocht Familie Aslan im Lindhorster Grill & Dönerhaus für Jedermann. Restaurant mit 50 Plätzen, Biergarten mit 25 Plätzen, Essen zum Mitnehmen.",
};

export default async function AboutPageRoute() {
  const [site, about] = await Promise.all([getSiteSettings(), getAboutPage()]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          {about.eyebrow && <p className="eyebrow">{about.eyebrow}</p>}
          <h1>{about.heading}</h1>
          {about.lede && <p className="lede">{about.lede}</p>}
        </div>
      </section>

      <section className="section about">
        <div className="container about__grid">
          <div className="about__timeline">
            {about.timeline.map((entry) => (
              <div className="about__mark" key={entry.label}>
                <span className="about__year">{entry.label}</span>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>

          <div className="about__story">
            {about.storyParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            <div className="about__facts">
              {about.facts.map((fact) => (
                <div className={`fact-card${fact.muted ? " fact-card--muted" : ""}`} key={fact.label}>
                  <b>{fact.value}</b>
                  <span>{fact.label}</span>
                </div>
              ))}
            </div>
            <Link href="/speisekarte" className="btn">Speisekarte entdecken</Link>
          </div>
        </div>
      </section>

      <section className="section section--coal about-cta">
        <div className="container text-center">
          {about.ctaEyebrow && <p className="eyebrow">{about.ctaEyebrow}</p>}
          {about.ctaHeading && <h2>{about.ctaHeading}</h2>}
          <div className="hero__actions" style={{ justifyContent: "center" }}>
            <Link href="/kontakt" className="btn">Anfahrt & Kontakt</Link>
            <a href={`tel:${site.phoneHref}`} className="btn btn--ghost">Jetzt anrufen</a>
          </div>
        </div>
      </section>
    </>
  );
}
