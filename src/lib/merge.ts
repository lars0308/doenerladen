/**
 * Shallow-merges Sanity content over fallback content, field by field.
 * A field only overrides the fallback if it actually has a value — an
 * empty string, empty array, null or undefined from Sanity is treated as
 * "not filled in yet" and the fallback keeps showing, instead of leaving
 * a blank gap on the page.
 */
export function mergeWithFallback<T extends object>(fallback: T, override: Partial<T> | null | undefined): T {
  if (!override) return fallback;
  const result = { ...fallback };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const value = override[key];
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);
    if (!isEmpty) result[key] = value as T[typeof key];
  }
  return result;
}
