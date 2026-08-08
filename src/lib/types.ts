import type { Image } from "sanity";

export interface WeekdayHours {
  weekday: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  closed: boolean;
  opens?: string;
  closes?: string;
}

export interface SiteSettings {
  shopName: string;
  tagline?: string;
  phone: string;
  phoneHref: string;
  email?: string;
  street: string;
  postalCode: string;
  city: string;
  googleMapsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  openingHours: WeekdayHours[];
  openingHoursNotice?: string;
  googleReviewRating?: number;
  googleReviewCount?: number;
  googleProfileUrl?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface BuildStep {
  title: string;
  text?: string;
  image?: Image;
  /** Local fallback path used when no Sanity image is set. */
  fallbackImageSrc?: string;
}

export interface HomePage {
  heroEyebrow?: string;
  heroHeading: string;
  heroMotto?: string;
  heroText?: string;
  heroCtaMenuLabel: string;
  heroCtaCallLabel: string;
  heroCtaRouteLabel: string;
  heroBadge1?: string;
  heroBadge2?: string;
  stats: StatItem[];
  buildEyebrow?: string;
  buildHeading?: string;
  buildSteps: BuildStep[];
  locationEyebrow?: string;
  locationHeading?: string;
  locationText?: string;
  locationNotice?: string;
}

export interface TimelineEntry {
  label: string;
  text: string;
}

export interface FactEntry {
  value: string;
  label: string;
  muted?: boolean;
}

export interface AboutPage {
  eyebrow?: string;
  heading: string;
  lede?: string;
  timeline: TimelineEntry[];
  storyParagraphs: string[];
  facts: FactEntry[];
  ctaEyebrow?: string;
  ctaHeading?: string;
}

export interface MenuCategory {
  _id: string;
  title: string;
  slug: string;
  meta?: string;
  note?: string;
  order: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  number?: string;
  description?: string;
  price: number;
  image?: Image;
  available: boolean;
  isBestseller?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  allergenNumbers?: number[];
  category: { ref?: string; slug?: string };
}

export interface AllergenEntry {
  number: number;
  text: string;
}

export interface MenuSettings {
  standDatum: string;
  allergenLegend: AllergenEntry[];
  footerNote?: string;
}

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}
