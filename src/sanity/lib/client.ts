import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, readToken } from "../env";

// Only construct a client when the project is actually configured — lets
// the rest of the app run (with fallback content) before Sanity is set up.
export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      token: readToken,
      perspective: "published",
    })
  : null;
