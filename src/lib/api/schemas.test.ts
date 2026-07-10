import { describe, expect, it } from "vitest";

import { berrySchema, evolutionChainSchema, pokemonSchema } from "./schemas";

const minimalPokemon = {
  abilities: [
    { ability: { name: "overgrow", url: "" }, is_hidden: false, slot: 1 },
  ],
  height: 7,
  id: 1,
  moves: [{ move: { name: "tackle", url: "" } }],
  name: "bulbasaur",
  order: 1,
  species: { name: "bulbasaur", url: "" },
  sprites: {
    back_default: null,
    back_shiny: null,
    front_default: "front.png",
    front_shiny: null,
  },
  stats: [{ base_stat: 45, effort: 0, stat: { name: "hp", url: "" } }],
  types: [
    {
      slot: 1,
      type: { name: "grass", url: "https://pokeapi.co/api/v2/type/12/" },
    },
  ],
  weight: 69,
};

describe("pokemonSchema", () => {
  it("parses a valid minimal payload", () => {
    expect(() => pokemonSchema.parse(minimalPokemon)).not.toThrow();
  });

  it("rejects a payload missing required fields", () => {
    const { id: _id, ...rest } = minimalPokemon;
    expect(() => pokemonSchema.parse(rest)).toThrow();
  });
});

describe("berrySchema", () => {
  it("parses a valid berry payload", () => {
    const berry = {
      firmness: { name: "soft", url: "" },
      flavors: [{ flavor: { name: "spicy", url: "" }, potency: 10 }],
      growth_time: 3,
      id: 1,
      item: { name: "cheri-berry", url: "" },
      max_harvest: 5,
      name: "cheri",
      natural_gift_power: 60,
      size: 20,
      smoothness: 25,
      soil_dryness: 15,
    };
    expect(() => berrySchema.parse(berry)).not.toThrow();
  });
});

describe("evolutionChainSchema", () => {
  it("parses a recursive evolution chain", () => {
    const chain = {
      chain: {
        evolution_details: [],
        evolves_to: [
          {
            evolution_details: [
              { min_level: 16, trigger: { name: "level-up", url: "" } },
            ],
            evolves_to: [],
            species: { name: "charmeleon", url: "" },
          },
        ],
        species: { name: "charmander", url: "" },
      },
      id: 1,
    };
    expect(() => evolutionChainSchema.parse(chain)).not.toThrow();
  });
});
