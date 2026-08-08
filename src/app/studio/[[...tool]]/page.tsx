import { NextStudio } from "next-sanity/studio";

import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default async function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6, color: "#2c1c14" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: 16 }}>Sanity ist noch nicht eingerichtet</h1>
        <p>
          Damit hier das Studio zur Pflege der Inhalte erscheint, muss zuerst ein Sanity-Projekt
          angelegt und über Umgebungsvariablen verbunden werden.
        </p>
        <p>
          Die genauen Schritte stehen in der <code>README.md</code> im Projekt, Abschnitt
          „Sanity einrichten“.
        </p>
      </div>
    );
  }

  // Imported dynamically so sanity.config.ts (which needs a real
  // projectId) is only evaluated once Sanity is actually configured.
  const { default: config } = await import("../../../../sanity.config");
  return <NextStudio config={config} />;
}
