"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "lindhorster-studio",
  title: "Lindhorster Grill & Dönerhaus — Inhalte",

  projectId,
  dataset,
  basePath: "/studio",

  schema: { types: schemaTypes },

  plugins: [
    structureTool({ structure }),
    // Vision lets an admin run raw GROQ queries — dev/debugging aid only.
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],

  document: {
    // Singleton documents (siteSettings, homePage, ...) shouldn't be
    // duplicatable or deletable from the UI — there must always be exactly one.
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && !["duplicate", "delete"].includes(action))
        : input,
  },
});
