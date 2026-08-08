import type { SchemaTypeDefinition } from "sanity";

import { weekdayHours } from "./objects/weekdayHours";
import { ctaButton } from "./objects/ctaButton";
import { siteSettings } from "./siteSettings";
import { homePage } from "./homePage";
import { aboutPage } from "./aboutPage";
import { menuCategory } from "./menuCategory";
import { menuItem } from "./menuItem";
import { menuSettings } from "./menuSettings";
import { galleryImage } from "./galleryImage";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons (genau ein Dokument)
  siteSettings,
  homePage,
  aboutPage,
  menuSettings,
  // Listen
  menuCategory,
  menuItem,
  galleryImage,
  // Wiederverwendbare Objekttypen
  weekdayHours,
  ctaButton,
];

export const singletonTypes = new Set(["siteSettings", "homePage", "aboutPage", "menuSettings"]);
