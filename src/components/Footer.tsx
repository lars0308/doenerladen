import Link from "next/link";

import type { SiteSettings } from "@/lib/types";
import { groupOpeningHours } from "@/lib/opening-hours";

export function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  const [first, ...rest] = siteSettings.shopName.split(" ");
  const hoursGroups = groupOpeningHours(siteSettings.openingHours, true);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand" style={{ marginBottom: 14 }}>
            <span className="brand__mark">LD</span>
            <span className="brand__name" style={{ color: "var(--parchment)" }}>
              <b style={{ color: "var(--parchment)" }}>{first}</b>
              <span style={{ color: "var(--mustard-light)" }}>{rest.join(" ")}</span>
            </span>
          </div>
          <p>Familie Aslan bereitet seit 1999 frische Gerichte für Jedermann — komm als Gast, geh als Freund.</p>
        </div>
        <div>
          <h4>Navigation</h4>
          <ul>
            <li><Link href="/">Startseite</Link></li>
            <li><Link href="/speisekarte">Speisekarte</Link></li>
            <li><Link href="/ueber-uns">Über uns</Link></li>
            <li><Link href="/kontakt">Kontakt</Link></li>
          </ul>
        </div>
        <div>
          <h4>Kontakt</h4>
          <ul>
            <li>{siteSettings.street}<br />{siteSettings.postalCode} {siteSettings.city}</li>
            <li><a href={`tel:${siteSettings.phoneHref}`}>{siteSettings.phone}</a></li>
            {siteSettings.email && (
              <li><a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a></li>
            )}
            {siteSettings.facebookUrl && (
              <li><a href={siteSettings.facebookUrl} target="_blank" rel="noopener">Facebook</a></li>
            )}
          </ul>
        </div>
        <div>
          <h4>Geschäftszeiten</h4>
          <ul>
            {hoursGroups.map((g) => (
              <li key={g.label}>{g.label}{g.closed ? " " : ": "}{g.timeText}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {year} {siteSettings.shopName}, Inh. Ömer Aslan</span>
        <span>
          <Link href="/impressum">Impressum</Link>
          &nbsp;·&nbsp;
          <Link href="/datenschutz">Datenschutz</Link>
        </span>
      </div>
    </footer>
  );
}
