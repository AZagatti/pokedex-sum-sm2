import { cachedFetch } from "./cache";
import {
  berryListResponseSchema,
  berrySchema,
  evolutionChainSchema,
  generationListResponseSchema,
  generationSchema,
  pokemonListResponseSchema,
  pokemonSchema,
  pokemonSpeciesSchema,
  typeSchema,
} from "./schemas";
import type {
  Berry,
  BerryListResponse,
  EvolutionChain,
  Generation,
  GenerationListResponse,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  PokemonType,
} from "./schemas";

const BASE_URL = "https://pokeapi.co/api/v2";

export const getPokemonList = (
  limit: number,
  offset: number,
  fetchFn?: typeof fetch
): Promise<PokemonListResponse> =>
  cachedFetch(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    (json) => pokemonListResponseSchema.parse(json),
    fetchFn
  );

export const getPokemon = (
  nameOrId: string | number,
  fetchFn?: typeof fetch
): Promise<Pokemon> =>
  cachedFetch(
    `${BASE_URL}/pokemon/${nameOrId}`,
    (json) => pokemonSchema.parse(json),
    fetchFn
  );

export const getPokemonSpecies = (
  nameOrId: string | number,
  fetchFn?: typeof fetch
): Promise<PokemonSpecies> =>
  cachedFetch(
    `${BASE_URL}/pokemon-species/${nameOrId}`,
    (json) => pokemonSpeciesSchema.parse(json),
    fetchFn
  );

export const getEvolutionChain = (
  url: string,
  fetchFn?: typeof fetch
): Promise<EvolutionChain> =>
  cachedFetch(url, (json) => evolutionChainSchema.parse(json), fetchFn);

export const getGenerationList = (
  fetchFn?: typeof fetch
): Promise<GenerationListResponse> =>
  cachedFetch(
    `${BASE_URL}/generation?limit=20`,
    (json) => generationListResponseSchema.parse(json),
    fetchFn
  );

export const getGeneration = (
  id: number | string,
  fetchFn?: typeof fetch
): Promise<Generation> =>
  cachedFetch(
    `${BASE_URL}/generation/${id}`,
    (json) => generationSchema.parse(json),
    fetchFn
  );

export const getType = (
  name: string,
  fetchFn?: typeof fetch
): Promise<PokemonType> =>
  cachedFetch(
    `${BASE_URL}/type/${name}`,
    (json) => typeSchema.parse(json),
    fetchFn
  );

export const getBerryList = (
  limit: number,
  offset: number,
  fetchFn?: typeof fetch
): Promise<BerryListResponse> =>
  cachedFetch(
    `${BASE_URL}/berry?limit=${limit}&offset=${offset}`,
    (json) => berryListResponseSchema.parse(json),
    fetchFn
  );

export const getBerry = (
  nameOrId: string | number,
  fetchFn?: typeof fetch
): Promise<Berry> =>
  cachedFetch(
    `${BASE_URL}/berry/${nameOrId}`,
    (json) => berrySchema.parse(json),
    fetchFn
  );

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export const extractIdFromUrl = (url: string): number => {
  const match = url.match(/\/(?<id>\d+)\/?$/u);
  return match?.groups?.id ? Number(match.groups.id) : 0;
};
