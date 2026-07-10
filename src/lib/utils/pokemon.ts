export const TYPE_COLOR_VARS: Record<string, string> = {
  bug: "var(--type-bug)",
  dark: "var(--type-dark)",
  dragon: "var(--type-dragon)",
  electric: "var(--type-electric)",
  fairy: "var(--type-fairy)",
  fighting: "var(--type-fighting)",
  fire: "var(--type-fire)",
  flying: "var(--type-flying)",
  ghost: "var(--type-ghost)",
  grass: "var(--type-grass)",
  ground: "var(--type-ground)",
  ice: "var(--type-ice)",
  normal: "var(--type-normal)",
  poison: "var(--type-poison)",
  psychic: "var(--type-psychic)",
  rock: "var(--type-rock)",
  steel: "var(--type-steel)",
  water: "var(--type-water)",
};

export const typeColor = (type: string): string =>
  TYPE_COLOR_VARS[type] ?? "var(--type-normal)";

const LIGHT_TEXT_TYPES = new Set([
  "fighting",
  "poison",
  "ghost",
  "dragon",
  "dark",
]);

export const typeTextColor = (type: string): string =>
  LIGHT_TEXT_TYPES.has(type) ? "#ffffff" : "#1a1b23";

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const formatPokemonName = (name: string): string =>
  name
    .split("-")
    .map((part) => capitalize(part))
    .join(" ");

export const padDexNumber = (id: number): string =>
  `#${String(id).padStart(3, "0")}`;
