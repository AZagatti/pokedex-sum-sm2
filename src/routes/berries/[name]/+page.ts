import { getBerry } from "$lib/api/client";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = false;

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    const berry = await getBerry(params.name, fetch);
    return { berry };
  } catch {
    error(404, `Berry "${params.name}" not found.`);
  }
};
