import type { StructureResolver } from "sanity/structure";

// Custom desk structure: singleton documents get their own fixed entry
// (no list, no "create new" — there's always exactly one), everything
// else appears as a normal, orderable list. Keeps the Studio simple for
// a non-technical operator.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Inhalte")
    .items([
      S.listItem()
        .title("Allgemeine Einstellungen")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Startseite")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("Über uns")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Speisekarten-Einstellungen")
        .id("menuSettings")
        .child(S.document().schemaType("menuSettings").documentId("menuSettings")),
      S.divider(),
      S.listItem()
        .title("Speisekarten-Kategorien")
        .schemaType("menuCategory")
        .child(S.documentTypeList("menuCategory").title("Speisekarten-Kategorien")),
      S.listItem()
        .title("Gerichte")
        .schemaType("menuItem")
        .child(S.documentTypeList("menuItem").title("Gerichte")),
      S.divider(),
      S.listItem()
        .title("Bilder")
        .schemaType("galleryImage")
        .child(S.documentTypeList("galleryImage").title("Bilder")),
    ]);
