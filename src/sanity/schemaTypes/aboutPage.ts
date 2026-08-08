import { defineType, defineField } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "Über uns",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Kleiner Text über der Überschrift", type: "string" }),
    defineField({ name: "heading", title: "Überschrift", type: "string", validation: (r) => r.required() }),
    defineField({ name: "lede", title: "Einleitungssatz / Motto", type: "text", rows: 2 }),

    defineField({
      name: "timeline",
      title: "Zeitleiste",
      description: "z. B. 1999 / 25+ / Heute",
      type: "array",
      of: [
        {
          type: "object",
          name: "timelineEntry",
          fields: [
            defineField({ name: "label", title: "Jahr / Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Text", type: "text", rows: 2, validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "text" } },
        },
      ],
    }),

    defineField({
      name: "storyParagraphs",
      title: "Geschichte (Absätze)",
      type: "array",
      of: [{ type: "text", rows: 3 }],
    }),

    defineField({
      name: "facts",
      title: "Kurzfakten",
      description: "z. B. Sitzplätze, Mitnahme ja/nein",
      type: "array",
      of: [
        {
          type: "object",
          name: "factEntry",
          fields: [
            defineField({ name: "value", title: "Wert / Zeichen (z. B. 50, ✓, ✕)", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", title: "Beschriftung", type: "string", validation: (r) => r.required() }),
            defineField({ name: "muted", title: "Gedämpft darstellen (z. B. bei 'nicht verfügbar')", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),

    defineField({ name: "ctaEyebrow", title: "Kleiner Text über dem Abschluss", type: "string" }),
    defineField({ name: "ctaHeading", title: "Abschluss-Überschrift", type: "string" }),
  ],
  preview: {
    prepare() {
      return { title: "Über uns" };
    },
  },
});
