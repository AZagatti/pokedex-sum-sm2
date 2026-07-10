import { getGenerationList, POKEMON_TYPES } from "$lib/api/client";

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const generations = await getGenerationList(fetch);
  return {
    generations: generations.results,
    types: POKEMON_TYPES,
  };
};
