import { z } from "zod";

const namedResource = z.object({
  name: z.string(),
  url: z.string(),
});

export const pokemonListItemSchema = namedResource;
export type PokemonListItem = z.infer<typeof pokemonListItemSchema>;

export const pokemonListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(pokemonListItemSchema),
});
export type PokemonListResponse = z.infer<typeof pokemonListResponseSchema>;

const pokemonSpriteSet = z.object({
  back_default: z.string().nullable(),
  back_shiny: z.string().nullable(),
  front_default: z.string().nullable(),
  front_shiny: z.string().nullable(),
});

export const pokemonSchema = z.object({
  abilities: z.array(
    z.object({
      ability: namedResource,
      is_hidden: z.boolean(),
      slot: z.number(),
    })
  ),
  cries: z
    .object({
      latest: z.string().nullable().optional(),
      legacy: z.string().nullable().optional(),
    })
    .optional(),
  height: z.number(),
  id: z.number(),
  moves: z.array(
    z.object({
      move: namedResource,
    })
  ),
  name: z.string(),
  order: z.number(),
  species: namedResource,
  sprites: pokemonSpriteSet.extend({
    other: z
      .object({
        "official-artwork": z
          .object({
            front_default: z.string().nullable(),
          })
          .optional(),
      })
      .optional(),
  }),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      effort: z.number(),
      stat: namedResource,
    })
  ),
  types: z.array(
    z.object({
      slot: z.number(),
      type: namedResource,
    })
  ),
  weight: z.number(),
});
export type Pokemon = z.infer<typeof pokemonSchema>;

export const pokemonSpeciesSchema = z.object({
  evolution_chain: z.object({
    url: z.string(),
  }),
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: namedResource,
    })
  ),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: namedResource,
    })
  ),
  generation: namedResource,
  id: z.number(),
  name: z.string(),
});
export type PokemonSpecies = z.infer<typeof pokemonSpeciesSchema>;

interface EvolutionNode {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
  evolution_details: {
    min_level: number | null;
    trigger: { name: string } | null;
  }[];
}

const evolutionNodeSchema: z.ZodType<EvolutionNode> = z.lazy(() =>
  z.object({
    evolution_details: z.array(
      z.object({
        min_level: z.number().nullable(),
        trigger: namedResource.nullable(),
      })
    ),
    evolves_to: z.array(evolutionNodeSchema),
    species: namedResource,
  })
);

export const evolutionChainSchema = z.object({
  chain: evolutionNodeSchema,
  id: z.number(),
});
export type EvolutionChain = z.infer<typeof evolutionChainSchema>;

export const generationListResponseSchema = z.object({
  count: z.number(),
  results: z.array(namedResource),
});
export type GenerationListResponse = z.infer<
  typeof generationListResponseSchema
>;

export const generationSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(namedResource),
});
export type Generation = z.infer<typeof generationSchema>;

export const typeSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: namedResource,
      slot: z.number(),
    })
  ),
});
export type PokemonType = z.infer<typeof typeSchema>;

export const berryListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(namedResource),
});
export type BerryListResponse = z.infer<typeof berryListResponseSchema>;

export const berrySchema = z.object({
  firmness: namedResource,
  flavors: z.array(
    z.object({
      flavor: namedResource,
      potency: z.number(),
    })
  ),
  growth_time: z.number(),
  id: z.number(),
  item: namedResource,
  max_harvest: z.number(),
  name: z.string(),
  natural_gift_power: z.number(),
  size: z.number(),
  smoothness: z.number(),
  soil_dryness: z.number(),
});
export type Berry = z.infer<typeof berrySchema>;
