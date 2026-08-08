import type { SiteSettings, StatItem } from "@/lib/types";

function formatRating(rating: number): string {
  return rating.toFixed(1).replace(".", ",");
}

export function StatsList({ stats, siteSettings }: { stats: StatItem[]; siteSettings: SiteSettings }) {
  const hasReviews = siteSettings.googleReviewRating && siteSettings.googleReviewCount;

  return (
    <ul className="hero__stats">
      {stats.map((stat) => (
        <li key={stat.label}>
          <b>{stat.value}</b>
          <span>{stat.label}</span>
        </li>
      ))}
      {hasReviews && (
        <li>
          {siteSettings.googleProfileUrl ? (
            <a href={siteSettings.googleProfileUrl} target="_blank" rel="noopener">
              <b>{formatRating(siteSettings.googleReviewRating!)} ★</b>
              <span>{siteSettings.googleReviewCount}+ Google-Rezensionen</span>
            </a>
          ) : (
            <>
              <b>{formatRating(siteSettings.googleReviewRating!)} ★</b>
              <span>{siteSettings.googleReviewCount}+ Google-Rezensionen</span>
            </>
          )}
        </li>
      )}
    </ul>
  );
}
