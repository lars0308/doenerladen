import { defineType, defineField } from "sanity";

export const menuSettings = defineType({
  name: "menuSettings",
  title: "Speisekarten-Einstellungen",
  type: "document",
  fields: [
    defineField({
      name: "standDatum",
      title: "Stand (z. B. 05/2026)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "allergenLegend",
      title: "Zusatzstoffe & Allergene (nummerierte Liste)",
      type: "array",
      of: [
        {
          type: "object",
          name: "allergenEntry",
          fields: [
            defineField({ name: "number", title: "Nummer", type: "number", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Text", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "number", subtitle: "text" } },
        },
      ],
    }),
    defineField({
      name: "footerNote",
      title: "Fußnotentext unter der Speisekarte",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Speisekarten-Einstellungen" };
    },
  },
});
