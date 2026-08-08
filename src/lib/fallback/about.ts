import type { AboutPage } from "@/lib/types";

export const fallbackAboutPage: AboutPage = {
  eyebrow: "Seit 1999 in Lindhorst",
  heading: "Familie Aslan",
  lede: "„Komm als Gast, geh als Freund.“ Das ist unser Motto — und so werden Sie bei uns auch behandelt, ob alt oder jung.",
  timeline: [
    { label: "1999", text: "Familie Aslan eröffnet das Lindhorster Grill & Dönerhaus in der Bahnhofstraße." },
    { label: "25+", text: "Jahre später kochen wir noch immer nach denselben Rezepten — mit frischen Zutaten und ohne Abkürzungen." },
    { label: "Heute", text: "Eine stetig wachsende Stammkundschaft und ein Restaurant, das sich wie zu Hause anfühlt." },
  ],
  storyParagraphs: [
    "Ob kurz zwischendurch oder ein längerer Abend mit Freunden — beides ist bei uns möglich. Gekocht wird frisch, nicht auf Vorrat.",
    "Die Rezepte sind bis heute die gleichen wie 1999. Verwendet wird, was frisch ist — und sonst nichts.",
  ],
  facts: [
    { value: "50", label: "Sitzplätze im Restaurant" },
    { value: "25", label: "Plätze im Biergarten bei gutem Wetter" },
    { value: "✓", label: "Essen auch zum Mitnehmen" },
    { value: "✕", label: "Aktuell kein Lieferdienst", muted: true },
  ],
  ctaEyebrow: "Kommen Sie doch einfach vorbei",
  ctaHeading: "Wir freuen uns auf Ihren Besuch.",
};
