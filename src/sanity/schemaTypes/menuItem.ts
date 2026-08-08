import { defineType, defineField } from "sanity";

export const menuItem = defineType({
  name: "menuItem",
  title: "Gericht",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "number",
      title: "Nummer auf der Speisekarte",
      description: "z. B. '25'. Gerichte ohne feste Nummer können ein '·' bekommen.",
      type: "string",
    }),
    defineField({ name: "description", title: "Beschreibung", type: "text", rows: 2 }),
    defineField({ name: "price", title: "Preis in Euro", type: "number", validation: (r) => r.required().positive() }),
    defineField({
      name: "category",
      title: "Kategorie",
      type: "reference",
      to: [{ type: "menuCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Bild (optional)",
      description: "Nicht jedes Gericht braucht ein Bild.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "available", title: "Verfügbar", type: "boolean", initialValue: true }),
    defineField({ name: "isBestseller", title: "Bestseller / Empfehlung", type: "boolean", initialValue: false }),
    defineField({ name: "isVegetarian", title: "Vegetarisch", type: "boolean", initialValue: false }),
    defineField({ name: "isVegan", title: "Vegan", type: "boolean", initialValue: false }),
    defineField({ name: "isSpicy", title: "Scharf", type: "boolean", initialValue: false }),
    defineField({
      name: "allergenNumbers",
      title: "Zusatzstoffe / Allergene (Nummern)",
      description: "Verweist auf die nummerierte Liste unter Speisekarten-Einstellungen, z. B. [5, 20].",
      type: "array",
      of: [{ type: "number" }],
    }),
    defineField({
      name: "order",
      title: "Reihenfolge innerhalb der Kategorie",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Reihenfolge",
      name: "orderAsc",
      by: [
        { field: "category.order", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "price", media: "image" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `${subtitle} €` : undefined, media };
    },
  },
});
