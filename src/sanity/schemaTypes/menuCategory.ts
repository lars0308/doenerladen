import { defineType, defineField } from "sanity";

export const menuCategory = defineType({
  name: "menuCategory",
  title: "Speisekarten-Kategorie",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug (für den Link in der Kategorie-Navigation)",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "meta",
      title: "Zusatz neben dem Titel (z. B. '28 cm')",
      type: "string",
    }),
    defineField({
      name: "note",
      title: "Hinweistext unter dem Titel",
      description: "z. B. 'Kalb- oder Geflügelfleisch' oder 'Alle Gerichte mit Pommes oder Reis und Zaziki'",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "order",
      title: "Reihenfolge",
      description: "Kleinere Zahl erscheint weiter oben. Bei Gleichstand wird alphabetisch sortiert.",
      type: "number",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Reihenfolge",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "note" },
  },
});
