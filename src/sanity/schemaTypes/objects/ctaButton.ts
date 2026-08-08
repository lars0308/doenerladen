import { defineType, defineField } from "sanity";

export const ctaButton = defineType({
  name: "ctaButton",
  title: "Button",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Beschriftung", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "Ziel-Link", type: "string", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
