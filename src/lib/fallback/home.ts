import type { HomePage } from "@/lib/types";

export const fallbackHomePage: HomePage = {
  heroEyebrow: "Familie Aslan · seit 1999 in Lindhorst",
  heroHeading: "Lindhorster Grill & Dönerhaus",
  heroMotto: "„Komm als Gast, geh als Freund.“",
  heroText: "Seit 1999 steht Familie Aslan in Lindhorst am Grill — Döner und Grillgerichte, jeden Tag frisch zubereitet.",
  heroCtaMenuLabel: "Speisekarte",
  heroCtaCallLabel: "Anrufen",
  heroCtaRouteLabel: "Route",
  heroBadge1: "Frisch vom Grill",
  heroBadge2: "Kein Lieferdienst — dafür schnell fertig zum Abholen",
  stats: [
    { value: "25+", label: "Jahre am Grill" },
    { value: "50", label: "Plätze im Restaurant" },
    { value: "25", label: "Plätze im Biergarten" },
  ],
  buildEyebrow: "Handwerk, kein Fließband",
  buildHeading: "So baut sich unser Döner auf — Schicht für Schicht, jeden Tag frisch.",
  buildSteps: [
    {
      title: "Fladenbrot & Rollo",
      text: "Ofenwarm, außen knusprig, innen weich — die Basis für Rollo, Dürüm und Lahmacun.",
      fallbackImageSrc: "/img/ing-pita.jpg",
    },
    {
      title: "Fleisch vom Spieß",
      text: "Kalb, Geflügel oder Lamm — täglich frisch zubereitet, nicht aus der Tiefkühltruhe.",
      fallbackImageSrc: "/img/ing-meat-video.jpg",
    },
    {
      title: "Salat & Gemüse",
      text: "Krautsalat, Tomaten, Gurken, Peperoni — frisch geschnitten, nicht vorgeschnippelt aus der Tüte.",
      fallbackImageSrc: "/img/ing-salad.jpg",
    },
    {
      title: "Hausgemachte Saucen",
      text: "Zaziki, Knoblauch- oder scharfe Sauce — nach Rezept der Familie Aslan.",
      fallbackImageSrc: "/img/ing-sauces.jpg",
    },
  ],
  locationEyebrow: "Bei uns in Lindhorst",
  locationHeading: "Restaurant, Biergarten & Mitnahme",
  locationText: "Bis zu 50 Sitzplätze im Innenraum, bei gutem Wetter 25 weitere im Biergarten. Alle Gerichte gibt es auch zum Mitnehmen — kurz anrufen genügt.",
  locationNotice: "Wir bieten aktuell keinen Lieferdienst an.",
};
