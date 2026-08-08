import Image from "next/image";
import Link from "next/link";

import { getSiteSettings, getHomePage, getFeaturedMenuItems } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { urlForImage } from "@/sanity/lib/image";
import { StatsList } from "@/components/StatsList";
import { OpeningHoursCard } from "@/components/OpeningHoursCard";

export default async function HomePage() {
  const [site, home, featured] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getFeaturedMenuItems(4),
  ]);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            {home.heroEyebrow && <p className="eyebrow eyebrow--light">{home.heroEyebrow}</p>}
            <h1 className="hero__title">{home.heroHeading}</h1>
            {home.heroMotto && (
              <p className="hero__motto">
                <span className="chalk-underline">
                  {home.heroMotto}
                  <svg className="chalk-underline__svg" viewBox="0 0 420 26" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 16 C 70 4, 140 22, 210 12 S 350 2, 416 14" fill="none" stroke="#d7a13c" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </p>
            )}
            {home.heroText && <p className="hero__desc">{home.heroText}</p>}
            <div className="hero__actions">
              <Link href="/speisekarte" className="btn">{home.heroCtaMenuLabel}</Link>
              <a href={`tel:${site.phoneHref}`} className="btn btn--ghost">{home.heroCtaCallLabel}</a>
              {site.googleMapsUrl && (
                <a href={site.googleMapsUrl} target="_blank" rel="noopener" className="btn btn--ghost">
                  {home.heroCtaRouteLabel}
                </a>
              )}
            </div>
            <StatsList stats={home.stats} siteSettings={site} />
          </div>

          <div className="hero__visual" aria-hidden="true">
            <video className="hero__media" autoPlay muted loop playsInline poster="/img/ing-meat-video.jpg">
              <source src="/video/hero-charred.mp4" type="video/mp4" />
            </video>
            {home.heroBadge1 && <span className="hero__badge hero__badge--1">{home.heroBadge1}</span>}
            {home.heroBadge2 && <span className="hero__badge hero__badge--2">{home.heroBadge2}</span>}
          </div>
        </div>
      </section>

      <div className="ornament-divider" aria-hidden="true" />

      {/* ============ SO ENTSTEHT UNSER DÖNER ============ */}
      {home.buildSteps.length > 0 && (
        <section className="section build">
          <div className="container">
            {home.buildEyebrow && <p className="eyebrow">{home.buildEyebrow}</p>}
            {home.buildHeading && <h2 className="build__title">{home.buildHeading}</h2>}

            <div className="build__stack">
              {home.buildSteps.map((step, i) => {
                const imageUrl = urlForImage(step.image)?.width(280).height(280).url() ?? step.fallbackImageSrc;
                return (
                  <div className={`build__row${i % 2 === 1 ? " build__row--reverse" : ""}`} key={step.title}>
                    <div className="build__num">{String(i + 1).padStart(2, "0")}</div>
                    <div className="build__shape">
                      {imageUrl && <Image src={imageUrl} alt={step.title} fill sizes="140px" />}
                    </div>
                    <div className="build__text">
                      <h3>{step.title}</h3>
                      {step.text && <p>{step.text}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ AUS DER KÜCHE ============ */}
      {featured.length > 0 && (
        <section className="section section--coal menu-teaser">
          <div className="container">
            <div className="menu-teaser__head">
              <div>
                <p className="eyebrow">Aus der Küche</p>
                <h2>Ein paar Favoriten unserer Gäste</h2>
              </div>
              <Link href="/speisekarte" className="btn-underline">Ganze Speisekarte ansehen →</Link>
            </div>

            <div className="menu-teaser__grid">
              {featured.map((dish, i) => (
                <article className={`mcard${i === 0 ? " mcard--big" : ""}`} key={dish._id}>
                  {dish.number && <span className="mcard__num">{dish.number}</span>}
                  <h3>
                    {dish.name} <span className="mcard__price">{formatPrice(dish.price)}</span>
                  </h3>
                  {dish.description && <p>{dish.description}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="ornament-divider" aria-hidden="true" />

      {/* ============ STANDORT / ÖFFNUNGSZEITEN ============ */}
      <section className="section location">
        <div className="container location__grid">
          <div>
            {home.locationEyebrow && <p className="eyebrow">{home.locationEyebrow}</p>}
            {home.locationHeading && <h2>{home.locationHeading}</h2>}
            {home.locationText && <p className="hero__desc">{home.locationText}</p>}
            {home.locationNotice && <p><strong>Bitte beachten:</strong> {home.locationNotice}</p>}
            <Link href="/kontakt" className="btn-underline">Anfahrt & Kontakt →</Link>
          </div>
          <OpeningHoursCard siteSettings={site} />
        </div>
      </section>
    </>
  );
}
