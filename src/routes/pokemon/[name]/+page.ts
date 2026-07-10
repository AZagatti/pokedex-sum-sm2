import {
  getEvolutionChain,
  getPokemon,
  getPokemonSpecies,
} from "$lib/api/client";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const prerender = false;

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    const pokemon = await getPokemon(params.name, fetch);
    const species = await getPokemonSpecies(pokemon.species.name, fetch);
    const evolutionChain = await getEvolutionChain(
      species.evolution_chain.url,
      fetch
    );
    return { evolutionChain, pokemon, species };
  } catch {
    error(404, `Pokémon "${params.name}" not found.`);
  }
};
