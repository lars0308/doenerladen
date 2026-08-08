import { defineType, defineField } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Startseite",
  type: "document",
  groups: [
    { name: "hero", title: "Hero-Bereich" },
    { name: "stats", title: "Kennzahlen" },
    { name: "build", title: "Zutaten-Sektion" },
    { name: "location", title: "Standort-Sektion" },
  ],
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Kleiner Text über der Überschrift",
      description: "z. B. 'Familie Aslan · seit 1999 in Lindhorst'",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero-Überschrift",
      type: "string",
      group: "hero",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroMotto",
      title: "Zitat / Motto (mit Kreide-Unterstreichung)",
      description: "z. B. „Komm als Gast, geh als Freund.“",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroText",
      title: "Kurzer Hero-Text",
      description: "Maximal 1–2 kurze Sätze. Kein Werbetext.",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    defineField({
      name: "heroCtaMenuLabel",
      title: "Beschriftung Button 'Speisekarte'",
      type: "string",
      initialValue: "Speisekarte ansehen",
      group: "hero",
    }),
    defineField({
      name: "heroCtaCallLabel",
      title: "Beschriftung Button 'Anrufen'",
      type: "string",
      initialValue: "Jetzt anrufen",
      group: "hero",
    }),
    defineField({
      name: "heroCtaRouteLabel",
      title: "Beschriftung Button 'Route'",
      type: "string",
      initialValue: "Route",
      group: "hero",
    }),
    defineField({
      name: "heroBadge1",
      title: "Kleines Schild 1 (auf dem Hero-Bild)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroBadge2",
      title: "Kleines Schild 2 (auf dem Hero-Bild)",
      type: "string",
      group: "hero",
    }),

    defineField({
      name: "stats",
      title: "Kennzahlen (z. B. Jahre am Grill, Sitzplätze)",
      description: "Die Google-Bewertung wird automatisch danach ergänzt — dafür nichts extra anlegen.",
      type: "array",
      group: "stats",
      of: [
        {
          type: "object",
          name: "statItem",
          fields: [
            defineField({ name: "value", title: "Zahl / Wert", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", title: "Beschriftung", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),

    defineField({
      name: "buildEyebrow",
      title: "Kleiner Text über der Zutaten-Überschrift",
      type: "string",
      group: "build",
    }),
    defineField({
      name: "buildHeading",
      title: "Überschrift Zutaten-Sektion",
      type: "string",
      group: "build",
    }),
    defineField({
      name: "buildSteps",
      title: "Zutaten-Schritte",
      type: "array",
      group: "build",
      of: [
        {
          type: "object",
          name: "buildStep",
          fields: [
            defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Kurztext", type: "text", rows: 2 }),
            defineField({
              name: "image",
              title: "Bild",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: { select: { title: "title", media: "image" } },
        },
      ],
      validation: (r) => r.max(4),
    }),

    defineField({
      name: "locationEyebrow",
      title: "Kleiner Text über der Standort-Überschrift",
      type: "string",
      group: "location",
    }),
    defineField({
      name: "locationHeading",
      title: "Überschrift Standort-Sektion",
      type: "string",
      group: "location",
    }),
    defineField({
      name: "locationText",
      title: "Standort-Text",
      type: "text",
      rows: 3,
      group: "location",
    }),
    defineField({
      name: "locationNotice",
      title: "Hinweis (z. B. kein Lieferdienst)",
      type: "string",
      group: "location",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Startseite" };
    },
  },
});
