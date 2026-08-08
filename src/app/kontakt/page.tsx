import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/content";
import { OpeningHoursCard } from "@/components/OpeningHoursCard";
import { ContactForm } from "@/components/ContactForm";
import { MapEmbed } from "@/components/MapEmbed";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt",
  description: "Kontakt zum Lindhorster Grill & Dönerhaus. Reservierung, Veranstaltungen und Bestellungen — einfach anrufen, schreiben oder vorbeikommen.",
};

export default async function KontaktPage() {
  const site = await getSiteSettings();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Falls doch noch Fragen offen sind</p>
          <h1>Kontakt & Anfahrt</h1>
          <p className="lede">Für Reservierungen, Veranstaltungen oder Bestellungen einfach anrufen oder schreiben.</p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-info">
            <div className="card">
              <h3>So erreichen Sie uns</h3>
              <ul className="contact-list">
                <li>
                  <span>Adresse</span>
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${site.street}, ${site.postalCode} ${site.city}`)}`}
                    target="_blank"
                    rel="noopener"
                  >
                    {site.street}, {site.postalCode} {site.city}
                  </a>
                </li>
                <li>
                  <span>Telefon</span>
                  <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
                </li>
                {site.email && (
                  <li>
                    <span>E-Mail</span>
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                  </li>
                )}
                {site.facebookUrl && (
                  <li>
                    <span>Facebook</span>
                    <a href={site.facebookUrl} target="_blank" rel="noopener">
                      {site.facebookUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, "")}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <OpeningHoursCard siteSettings={site} showAddress={false} />

            <MapEmbed street={site.street} postalCode={site.postalCode} city={site.city} />
          </div>

          {site.email && <ContactForm email={site.email} />}
        </div>
      </section>
    </>
  );
}
