// Central place for Sanity environment configuration. Reading them here
// (instead of scattering process.env.* calls) makes it obvious what needs
// to be set, and lets the rest of the app check `isSanityConfigured` once.

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

// Read token for previewing draft content (e.g. from the Studio's
// "Presentation" tool). Never expose this to the client — it's only read
// in Server Components / route handlers.
export const readToken = process.env.SANITY_API_READ_TOKEN;

export const isSanityConfigured = Boolean(projectId && dataset);
