import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  robots: { index: false, follow: true },
};

export default async function DatenschutzPage() {
  const site = await getSiteSettings();
  const stand = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Rechtliches</p>
          <h1>Datenschutzerklärung</h1>
          <p className="lede">
            Kurz vorweg: Diese Website kommt bewusst ohne Google Fonts, ohne Analyse-Tools und ohne Werbe-Tracker
            aus. Was trotzdem an Daten anfällt, erklären wir hier vollständig.
          </p>
        </div>
      </section>

      <section className="section legal-section">
        <div className="container legal-text">
          <h2>1. Verantwortlicher</h2>
          <p>
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
            <br />
            <br />
            Ömer Aslan<br />
            {site.shopName}<br />
            {site.street}, {site.postalCode} {site.city}<br />
            Telefon: <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
            {site.email && (
              <>
                <br />
                E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
              </>
            )}
          </p>

          <h2>2. Übersicht: Was wir nicht tun</h2>
          <p>
            Wir binden keine Google Fonts, kein Google Analytics, keinen Facebook-/Meta-Pixel und keine sonstigen
            Analyse- oder Werbe-Tracker ein. Alle Schriftarten dieser Website sind lokal auf unserem Server
            gespeichert — beim Aufruf der Seite werden dadurch keine Verbindungen zu Google-Servern aufgebaut.
          </p>

          <h2>3. Hosting & Server-Logfiles</h2>
          <p>
            Diese Website wird bei einem externen Hosting-Anbieter (Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
            91789, USA) betrieben. Beim Aufruf der Website erhebt der Hosting-Anbieter automatisiert technische
            Zugriffsdaten (sogenannte Server-Logfiles), die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit
            der Anfrage, aufgerufene Seite, verwendeter Browser und Betriebssystem sowie die zuvor besuchte Seite
            (Referrer-URL). Diese Daten sind technisch erforderlich, um die Website auszuliefern und die
            Betriebssicherheit zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse an einem
            stabilen und sicheren Betrieb). Eine Übermittlung in die USA als Drittland kann dabei stattfinden; der
            Anbieter verpflichtet sich vertraglich auf EU-Standardvertragsklauseln als Garantie für ein
            angemessenes Datenschutzniveau.
          </p>

          <h2>4. Hinweis-Banner (lokale Speicherung)</h2>
          <p>
            Der Hinweis-Banner am unteren Bildschirmrand merkt sich, ob Sie ihn bereits bestätigt haben. Diese
            Information wird ausschließlich lokal in Ihrem Browser gespeichert (sogenannter „Local Storage“) und
            verlässt Ihr Gerät zu keinem Zeitpunkt. Diese Speicherung ist technisch notwendig für die von Ihnen
            gewünschte Funktion und bedarf daher gemäß § 25 Abs. 2 Nr. 2 TTDSG keiner gesonderten Einwilligung. Sie
            können diese Daten jederzeit über die Einstellungen Ihres Browsers löschen.
          </p>

          <h2>5. Kontaktformular</h2>
          <p>
            Das Formular für allgemeine Anfragen (Kontaktseite) sendet keine Daten an einen Server. Stattdessen
            öffnet sich beim Absenden Ihr eigenes E-Mail-Programm mit einer vorausgefüllten Nachricht an{" "}
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}. Erst wenn Sie diese E-Mail
            tatsächlich versenden, erhalten wir die von Ihnen eingegebenen Daten (z. B. Name, E-Mail-Adresse,
            Anfrageinhalt). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bearbeitung Ihrer Anfrage). Diese Daten
            werden nur so lange gespeichert, wie es zur Bearbeitung Ihrer Anfrage erforderlich ist, und
            anschließend gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>

          <h2>6. Anfahrtskarte (OpenStreetMap)</h2>
          <p>
            Auf der Kontaktseite bieten wir eine Anfahrtskarte an. Diese wird nicht automatisch geladen, sondern
            erst, wenn Sie aktiv auf „Karte laden“ klicken. Danach wird eine Verbindung zu Servern der
            OpenStreetMap Foundation (St John&apos;s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes
            Königreich) aufgebaut, wobei Ihre IP-Adresse an diesen Anbieter übermittelt wird. Rechtsgrundlage ist
            Ihre Einwilligung durch den aktiven Klick (Art. 6 Abs. 1 lit. a DSGVO). Weitere Informationen:{" "}
            <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener">
              osmfoundation.org/wiki/Privacy_Policy
            </a>
            .
          </p>

          <h2>7. Schriftarten</h2>
          <p>
            Diese Website nutzt die Schriftarten „Fraunces“ und „Karla“. Beide sind als Dateien fest in unsere
            Website eingebunden (selbst gehostet) und werden nicht von externen Servern wie Google Fonts
            nachgeladen. Es entstehen dadurch keine Verbindungen zu Dritten und keine Übermittlung Ihrer IP-Adresse
            zu diesem Zweck.
          </p>

          <h2>8. Ihre Rechte</h2>
          <p>Ihnen stehen als betroffene Person folgende Rechte zu:</p>
          <ul className="legal-list">
            <li>Auskunft über die von uns verarbeiteten personenbezogenen Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
          </ul>
          <p>
            Zur Ausübung dieser Rechte genügt eine formlose Nachricht an{" "}
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}. Ihnen steht zudem ein
            Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde zu — für Niedersachsen ist dies die
            Landesbeauftragte für den Datenschutz Niedersachsen (LfD Niedersachsen).
          </p>

          <h2>9. SSL-/TLS-Verschlüsselung</h2>
          <p>
            Diese Website nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung für die Übertragung
            vertraulicher Inhalte. Eine verschlüsselte Verbindung erkennen Sie am „https://“ in der Adresszeile
            Ihres Browsers.
          </p>

          <h2>10. Änderungen dieser Datenschutzerklärung</h2>
          <p>
            Wir passen diese Datenschutzerklärung an, sobald sich die Website oder die rechtlichen Vorgaben ändern.
            Stand: {stand}.
          </p>
        </div>
      </section>
    </>
  );
}
