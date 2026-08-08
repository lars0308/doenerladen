# Lindhorster Grill & Dönerhaus

Next.js-Website mit Sanity als CMS. Alle Inhalte (Speisekarte, Öffnungszeiten,
Texte, Bilder) sind über das Sanity Studio unter `/studio` pflegbar, ohne den
Code anzufassen.

Die Seite funktioniert auch **ohne** eingerichtetes Sanity-Projekt — dann
werden die aktuellen Inhalte aus `src/lib/fallback/` angezeigt. Sobald Sanity
angebunden ist, überschreiben die dort gepflegten Inhalte die Fallback-Werte
Feld für Feld (ein leeres Feld in Sanity fällt automatisch auf den
Fallback-Wert zurück, statt eine Lücke zu zeigen).

## Lokal starten

```bash
npm install
npm run dev
```

Seite: http://localhost:3000 — Studio: http://localhost:3000/studio

## Sanity einrichten (einmalig)

1. Kostenloses Konto anlegen: https://www.sanity.io/manage
2. Dort ein neues Projekt erstellen (z. B. "Lindhorster Dönerhaus"), Dataset
   `production` verwenden.
3. Projekt-ID kopieren (steht direkt neben dem Projektnamen).
4. `.env.example` zu `.env.local` kopieren und ausfüllen:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=<deine Projekt-ID>
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
5. Unter Project → API → CORS Origins die lokale und die spätere
   Live-Domain freigeben (z. B. `http://localhost:3000` und
   `https://doenerladen.vercel.app`), jeweils mit "Allow credentials".
6. `npm run dev` neu starten, dann `/studio` öffnen und mit dem
   Sanity-Konto einloggen (einmaliger Login im Browser, das kann nicht
   automatisiert werden).

### Vorhandene Inhalte einmalig einspielen (optional, empfohlen)

Damit das Studio nicht leer startet, können die aktuellen Website-Inhalte
(komplette Speisekarte, Texte, Bilder) automatisch eingespielt werden:

1. Unter Project → API → Tokens einen Token mit **Editor**-Rechten anlegen.
2. In `.env.local` ergänzen: `SANITY_API_WRITE_TOKEN=<der Token>`
3. `npm run seed` ausführen.
4. Danach den Token wieder löschen (unter sanity.io/manage), er wird nur
   für diesen einmaligen Import gebraucht.

Das Skript ist gefahrlos mehrfach ausführbar — es überschreibt jeweils
dieselben Dokumente, statt Duplikate anzulegen.

## Auf Vercel deployen

1. Im Vercel-Projekt unter Settings → Environment Variables dieselben
   Variablen wie in `.env.local` eintragen (mindestens
   `NEXT_PUBLIC_SANITY_PROJECT_ID` und `NEXT_PUBLIC_SANITY_DATASET`).
2. Die Vercel-Domain zusätzlich unter Sanity → API → CORS Origins
   freigeben, sonst kann die Live-Seite die Inhalte nicht laden.
3. Vercel erkennt Next.js automatisch — kein spezielles Build-Kommando
   nötig.

## Google-Bewertungen

Aktuell wird die Bewertung manuell im Studio unter "Allgemeine
Einstellungen" gepflegt (Sterne, Anzahl Rezensionen, Link zum
Google-Profil). Sobald ein Google Places API Key vorhanden ist, kann das
auf eine Live-Anbindung umgestellt werden — die Anzeige ist dafür bereits
vorbereitet (`src/lib/content.ts` → `getSiteSettings`).

## Struktur

- `src/app/*` — Seiten (Next.js App Router)
- `src/sanity/schemaTypes/*` — Sanity-Schemas
- `src/lib/content.ts` — lädt Inhalte aus Sanity, mit Fallback
- `src/lib/fallback/*` — Fallback-/Ausgangsinhalte
- `scripts/seed.ts` — einmaliger Import der Fallback-Inhalte nach Sanity
