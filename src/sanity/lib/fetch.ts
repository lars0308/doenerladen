import "server-only";

import { client } from "./client";

/**
 * Runs a GROQ query against Sanity and returns its result, or `null` when
 * Sanity isn't configured yet or the request fails for any reason. Callers
 * are expected to merge this with fallback content — the site must keep
 * working before a Sanity project exists and while content is empty.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = []
): Promise<T | null> {
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: 60, tags },
    });
  } catch (error) {
    console.error("Sanity fetch failed, falling back to default content:", error);
    return null;
  }
}
