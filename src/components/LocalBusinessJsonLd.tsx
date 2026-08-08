import type { SiteSettings } from "@/lib/types";
import { siteUrl } from "@/lib/site-url";

const DAY_MAP: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function LocalBusinessJsonLd({ siteSettings }: { siteSettings: SiteSettings }) {
  const openingHoursSpecification = siteSettings.openingHours
    .filter((h) => !h.closed && h.opens && h.closes)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_MAP[h.weekday],
      opens: h.opens,
      closes: h.closes,
    }));

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: siteSettings.shopName,
    image: `${siteUrl}/img/ing-meat-video.jpg`,
    url: siteUrl,
    telephone: siteSettings.phoneHref,
    servesCuisine: ["Döner", "Türkisch", "Grillgerichte"],
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.street,
      postalCode: siteSettings.postalCode,
      addressLocality: siteSettings.city,
      addressCountry: "DE",
    },
    ...(siteSettings.googleMapsUrl ? { hasMap: siteSettings.googleMapsUrl } : {}),
    openingHoursSpecification,
    ...(siteSettings.googleReviewRating && siteSettings.googleReviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: siteSettings.googleReviewRating,
            reviewCount: siteSettings.googleReviewCount,
          },
        }
      : {}),
    sameAs: [siteSettings.facebookUrl, siteSettings.instagramUrl].filter(Boolean),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
