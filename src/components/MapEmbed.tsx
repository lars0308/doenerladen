"use client";

import { useState } from "react";
import Link from "next/link";

export function MapEmbed({ street, postalCode, city }: { street: string; postalCode: string; city: string }) {
  const [loaded, setLoaded] = useState(false);
  const query = encodeURIComponent(`${street}, ${postalCode} ${city}`);

  return (
    <div className="map-embed card">
      <h3>Anfahrt</h3>
      {loaded ? (
        <iframe
          title={`Karte: ${street}, ${postalCode} ${city}`}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=9.0175%2C52.3495%2C9.0355%2C52.3575&layer=mapnik&marker=52.3535%2C9.0265`}
          style={{ border: 0, width: "100%", height: 320, borderRadius: 8 }}
          loading="lazy"
        />
      ) : (
        <div className="map-embed__frame">
          <button type="button" className="btn btn--sm" onClick={() => setLoaded(true)}>
            Karte laden
          </button>
          <p className="map-embed__hint">
            Beim Laden wird eine Verbindung zu openstreetmap.org aufgebaut. Details siehe{" "}
            <Link href="/datenschutz">Datenschutzerklärung</Link>.
          </p>
        </div>
      )}
      <p className="order-form__hint" style={{ marginTop: 10 }}>
        <a href={`https://www.openstreetmap.org/search?query=${query}`} target="_blank" rel="noopener">
          In OpenStreetMap öffnen →
        </a>
      </p>
    </div>
  );
}
