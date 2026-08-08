// Falls back to the known Vercel URL so metadata/sitemap/JSON-LD always
// have a valid absolute URL, even before a custom domain or the
// NEXT_PUBLIC_SITE_URL env var is set.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://doenerladen.vercel.app").replace(/\/$/, "");
