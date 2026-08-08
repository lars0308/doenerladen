/**
 * One-time helper that fills a freshly created Sanity project with the
 * site's current real content (the same content used as fallback when
 * Sanity isn't configured yet), so the operator doesn't start from an
 * empty Studio.
 *
 * Usage:
 *   1. Create a Sanity project (see README) and a token with "Editor"
 *      access under https://www.sanity.io/manage → API → Tokens.
 *   2. Put NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and
 *      SANITY_API_WRITE_TOKEN into .env.local
 *   3. npm run seed
 *
 * Safe to re-run — every document has a fixed, deterministic _id, so
 * running it again updates the same documents instead of duplicating them.
 */
import "dotenv/config";
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

import { fallbackSiteSettings } from "../src/lib/fallback/site";
import { fallbackHomePage } from "../src/lib/fallback/home";
import { fallbackAboutPage } from "../src/lib/fallback/about";
import { fallbackMenuCategories, fallbackMenuItems, fallbackMenuSettings } from "../src/lib/fallback/menu";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET or SANITY_API_WRITE_TOKEN in .env.local — see scripts/seed.ts for setup steps."
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-01-01", useCdn: false });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadLocalImage(relativePath: string) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  if (!fs.existsSync(filePath)) return undefined;
  const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function seed() {
  console.log("Uploading images...");
  const buildStepImages = await Promise.all(
    fallbackHomePage.buildSteps.map((step) =>
      step.fallbackImageSrc ? uploadLocalImage(step.fallbackImageSrc.replace(/^\//, "")) : Promise.resolve(undefined)
    )
  );

  console.log("Writing siteSettings...");
  await client.createOrReplace({ _id: "siteSettings", _type: "siteSettings", ...fallbackSiteSettings });

  console.log("Writing homePage...");
  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    ...fallbackHomePage,
    buildSteps: fallbackHomePage.buildSteps.map((step, i) => ({
      _type: "buildStep",
      _key: slugify(step.title),
      title: step.title,
      text: step.text,
      ...(buildStepImages[i] ? { image: buildStepImages[i] } : {}),
    })),
  });

  console.log("Writing aboutPage...");
  await client.createOrReplace({
    _id: "aboutPage",
    _type: "aboutPage",
    ...fallbackAboutPage,
    timeline: fallbackAboutPage.timeline.map((t) => ({ _type: "timelineEntry", _key: slugify(t.label), ...t })),
    facts: fallbackAboutPage.facts.map((f) => ({ _type: "factEntry", _key: slugify(f.label), ...f })),
  });

  console.log("Writing menuSettings...");
  await client.createOrReplace({
    _id: "menuSettings",
    _type: "menuSettings",
    ...fallbackMenuSettings,
    allergenLegend: fallbackMenuSettings.allergenLegend.map((a) => ({
      _type: "allergenEntry",
      _key: `allergen-${a.number}`,
      ...a,
    })),
  });

  console.log(`Writing ${fallbackMenuCategories.length} menu categories...`);
  for (const category of fallbackMenuCategories) {
    const id = `menuCategory-${category.slug}`;
    await client.createOrReplace({
      _id: id,
      _type: "menuCategory",
      title: category.title,
      slug: { _type: "slug", current: category.slug },
      meta: category.meta,
      note: category.note,
      order: category.order,
    });
  }

  console.log(`Writing ${fallbackMenuItems.length} menu items...`);
  let i = 0;
  for (const item of fallbackMenuItems) {
    i++;
    const id = `menuItem-${slugify(item.name)}-${i}`;
    await client.createOrReplace({
      _id: id,
      _type: "menuItem",
      name: item.name,
      number: item.number,
      description: item.description,
      price: item.price,
      available: item.available,
      isBestseller: item.isBestseller || false,
      isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false,
      isSpicy: item.isSpicy || false,
      allergenNumbers: item.allergenNumbers,
      order: i,
      category: { _type: "reference", _ref: `menuCategory-${item.category.slug}` },
    });
  }

  console.log("Done. Open /studio to review and edit the content.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
