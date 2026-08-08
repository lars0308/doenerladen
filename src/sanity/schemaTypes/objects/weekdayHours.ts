import { defineType, defineField } from "sanity";

export const weekdayHours = defineType({
  name: "weekdayHours",
  title: "Öffnungszeit (Wochentag)",
  type: "object",
  fields: [
    defineField({
      name: "weekday",
      title: "Wochentag",
      type: "string",
      options: {
        list: [
          { title: "Montag", value: "monday" },
          { title: "Dienstag", value: "tuesday" },
          { title: "Mittwoch", value: "wednesday" },
          { title: "Donnerstag", value: "thursday" },
          { title: "Freitag", value: "friday" },
          { title: "Samstag", value: "saturday" },
          { title: "Sonntag", value: "sunday" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "closed",
      title: "Ruhetag (geschlossen)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "opens",
      title: "Öffnet um",
      description: "Format HH:MM, z. B. 11:30",
      type: "string",
      hidden: ({ parent }) => !!parent?.closed,
    }),
    defineField({
      name: "closes",
      title: "Schließt um",
      description: "Format HH:MM, z. B. 21:30",
      type: "string",
      hidden: ({ parent }) => !!parent?.closed,
    }),
  ],
  preview: {
    select: { weekday: "weekday", closed: "closed", opens: "opens", closes: "closes" },
    prepare({ weekday, closed, opens, closes }) {
      const names: Record<string, string> = {
        monday: "Montag", tuesday: "Dienstag", wednesday: "Mittwoch",
        thursday: "Donnerstag", friday: "Freitag", saturday: "Samstag", sunday: "Sonntag",
      };
      return {
        title: names[weekday] || weekday,
        subtitle: closed ? "Ruhetag" : opens && closes ? `${opens} – ${closes} Uhr` : "Zeiten fehlen",
      };
    },
  },
});
