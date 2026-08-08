// GROQ queries, kept in one place so schema changes are easy to trace
// through to the data actually requested.

export const siteSettingsQuery = /* groq */ `*[_type == "siteSettings"][0]{
  shopName, tagline, phone, phoneHref, email, street, postalCode, city,
  googleMapsUrl, facebookUrl, instagramUrl,
  openingHours, openingHoursNotice,
  googleReviewRating, googleReviewCount, googleProfileUrl
}`;

export const homePageQuery = /* groq */ `*[_type == "homePage"][0]{
  heroEyebrow, heroHeading, heroMotto, heroText,
  heroCtaMenuLabel, heroCtaCallLabel, heroCtaRouteLabel,
  heroBadge1, heroBadge2,
  stats,
  buildEyebrow, buildHeading, buildSteps,
  locationEyebrow, locationHeading, locationText, locationNotice
}`;

export const aboutPageQuery = /* groq */ `*[_type == "aboutPage"][0]{
  eyebrow, heading, lede, timeline, storyParagraphs, facts, ctaEyebrow, ctaHeading
}`;

export const menuCategoriesQuery = /* groq */ `*[_type == "menuCategory"] | order(order asc) {
  _id, title, "slug": slug.current, meta, note, order
}`;

export const menuItemsQuery = /* groq */ `*[_type == "menuItem" && available == true] | order(coalesce(order, 999) asc, name asc) {
  _id, name, number, description, price, image, available,
  isBestseller, isVegetarian, isVegan, isSpicy, allergenNumbers,
  "category": category->{ "ref": _id, "slug": slug.current }
}`;

export const menuSettingsQuery = /* groq */ `*[_type == "menuSettings"][0]{
  standDatum, allergenLegend, footerNote
}`;
