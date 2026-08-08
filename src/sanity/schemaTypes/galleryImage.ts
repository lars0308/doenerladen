import { defineType, defineField } from "sanity";

export const galleryImage = defineType({
  name: "galleryImage",
  title: "Bild",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titel (nur intern, zur Wiedererkennung)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slot",
      title: "Verwendung",
      description: "Wofür ist das Bild gedacht? Hilft bei der Wiederverwendung an der richtigen Stelle.",
      type: "string",
      options: {
        list: [
          { title: "Restaurant (innen)", value: "restaurant" },
          { title: "Terrasse / Biergarten", value: "terrace" },
          { title: "Grill", value: "grill" },
          { title: "Gericht", value: "dish" },
          { title: "Team / Familie", value: "team" },
          { title: "Sonstiges", value: "other" },
        ],
      },
    }),
    defineField({
      name: "image",
      title: "Bilddatei",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt-Text (Bildbeschreibung für Barrierefreiheit & SEO)",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", media: "image", subtitle: "slot" },
  },
});
