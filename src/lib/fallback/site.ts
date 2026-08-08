import type { SiteSettings } from "@/lib/types";

export const fallbackSiteSettings: SiteSettings = {
  shopName: "Lindhorster Grill & Dönerhaus",
  tagline: "Familie Aslan · seit 1999",
  phone: "05725 / 88 85",
  phoneHref: "+4957258885",
  email: "lindhorsterdoenerhaus@hotmail.com",
  street: "Bahnhofstraße 35",
  postalCode: "31698",
  city: "Lindhorst",
  googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Bahnhofstra%C3%9Fe+35%2C+31698+Lindhorst",
  facebookUrl: "https://www.facebook.com/lindhorster.donerhaus",
  openingHours: [
    { weekday: "monday", closed: false, opens: "11:30", closes: "21:30" },
    { weekday: "tuesday", closed: true },
    { weekday: "wednesday", closed: false, opens: "11:30", closes: "21:30" },
    { weekday: "thursday", closed: false, opens: "11:30", closes: "21:30" },
    { weekday: "friday", closed: false, opens: "11:30", closes: "21:30" },
    { weekday: "saturday", closed: false, opens: "11:30", closes: "21:30" },
    { weekday: "sunday", closed: false, opens: "12:00", closes: "21:30" },
  ],
  openingHoursNotice: "An Feiertagen können die Öffnungszeiten abweichen.",
  // Platzhalter, bis die Google-Bewertung entweder manuell in Sanity
  // gepflegt oder live über die Google Places API geladen wird.
  googleReviewRating: undefined,
  googleReviewCount: undefined,
  googleProfileUrl: undefined,
};
