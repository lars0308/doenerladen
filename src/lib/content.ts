import { sanityFetch } from "@/sanity/lib/fetch";
import {
  siteSettingsQuery,
  homePageQuery,
  aboutPageQuery,
  menuCategoriesQuery,
  menuItemsQuery,
  menuSettingsQuery,
} from "@/lib/queries";
import { mergeWithFallback } from "@/lib/merge";
import {
  fallbackSiteSettings,
  fallbackHomePage,
  fallbackAboutPage,
  fallbackMenuCategories,
  fallbackMenuItems,
  fallbackMenuSettings,
} from "@/lib/fallback";
import type { SiteSettings, HomePage, AboutPage, MenuCategory, MenuItem, MenuSettings, MenuData } from "@/lib/types";

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await sanityFetch<Partial<SiteSettings>>(siteSettingsQuery, {}, ["siteSettings"]);
  return mergeWithFallback(fallbackSiteSettings, data);
}

export async function getHomePage(): Promise<HomePage> {
  const data = await sanityFetch<Partial<HomePage>>(homePageQuery, {}, ["homePage"]);
  return mergeWithFallback(fallbackHomePage, data);
}

export async function getAboutPage(): Promise<AboutPage> {
  const data = await sanityFetch<Partial<AboutPage>>(aboutPageQuery, {}, ["aboutPage"]);
  return mergeWithFallback(fallbackAboutPage, data);
}

export async function getMenuSettings(): Promise<MenuSettings> {
  const data = await sanityFetch<Partial<MenuSettings>>(menuSettingsQuery, {}, ["menuSettings"]);
  return mergeWithFallback(fallbackMenuSettings, data);
}

export async function getMenu(): Promise<MenuData> {
  const [categories, items] = await Promise.all([
    sanityFetch<MenuCategory[]>(menuCategoriesQuery, {}, ["menuCategory"]),
    sanityFetch<MenuItem[]>(menuItemsQuery, {}, ["menuItem"]),
  ]);

  return {
    categories: categories && categories.length > 0 ? categories : fallbackMenuCategories,
    items: items && items.length > 0 ? items : fallbackMenuItems,
  };
}

/** A handful of bestseller dishes for the homepage teaser — falls back to any available items if too few are flagged. */
export async function getFeaturedMenuItems(limit = 4): Promise<MenuItem[]> {
  const { items } = await getMenu();
  const bestsellers = items.filter((i) => i.isBestseller);
  if (bestsellers.length >= limit) return bestsellers.slice(0, limit);
  const rest = items.filter((i) => !i.isBestseller);
  return [...bestsellers, ...rest].slice(0, limit);
}
