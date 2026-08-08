import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Allgemeine Einstellungen",
  type: "document",
  fields: [
    defineField({ name: "shopName", title: "Ladenname", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Kurzer Untertitel", type: "string" }),
    defineField({ name: "phone", title: "Telefonnummer (Anzeige, z. B. 05725 / 88 85)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "phoneHref", title: "Telefonnummer für Anruf-Links (z. B. +4957258885)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", title: "E-Mail-Adresse", type: "string" }),
    defineField({ name: "street", title: "Straße & Hausnummer", type: "string", validation: (r) => r.required() }),
    defineField({ name: "postalCode", title: "Postleitzahl", type: "string", validation: (r) => r.required() }),
    defineField({ name: "city", title: "Ort", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "googleMapsUrl",
      title: "Google-Maps-Link (für den Route-Button)",
      description: "Link, der beim Klick auf 'Route' direkt die Navigation öffnet.",
      type: "url",
    }),
    defineField({ name: "facebookUrl", title: "Facebook-Link", type: "url" }),
    defineField({ name: "instagramUrl", title: "Instagram-Link", type: "url" }),

    defineField({
      name: "openingHours",
      title: "Öffnungszeiten",
      type: "array",
      of: [{ type: "weekdayHours" }],
      validation: (r) => r.max(7),
    }),
    defineField({
      name: "openingHoursNotice",
      title: "Hinweis zu Öffnungszeiten (z. B. Feiertage)",
      description: "Wird zusätzlich zu den regulären Zeiten angezeigt, z. B. 'An Feiertagen ggf. abweichende Zeiten.'",
      type: "text",
      rows: 2,
    }),

    defineField({
      name: "googleReviewRating",
      title: "Google-Bewertung (Sterne, z. B. 4.9)",
      description: "Manuell pflegen, bis die Live-Anbindung an die Google-API eingerichtet ist.",
      type: "number",
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "googleReviewCount",
      title: "Anzahl Google-Rezensionen",
      type: "number",
    }),
    defineField({
      name: "googleProfileUrl",
      title: "Link zum Google-Unternehmensprofil",
      description: "Wird geöffnet, wenn jemand auf die Bewertung klickt.",
      type: "url",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Allgemeine Einstellungen" };
    },
  },
});
