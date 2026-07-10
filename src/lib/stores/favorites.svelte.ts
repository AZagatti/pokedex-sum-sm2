const FAVORITES_KEY = "pokedex:favorites";

export interface FavoritePokemon {
  id: number;
  name: string;
  sprite: string | null;
}

const loadFavorites = (): FavoritePokemon[] => {
  if (typeof localStorage === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as FavoritePokemon[]) : [];
  } catch {
    return [];
  }
};

class FavoritesStore {
  items = $state<FavoritePokemon[]>([]);

  constructor() {
    this.items = loadFavorites();
  }

  private persist(): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.items));
    }
  }

  has(id: number): boolean {
    return this.items.some((item) => item.id === id);
  }

  toggle(pokemon: FavoritePokemon): void {
    this.items = this.has(pokemon.id)
      ? this.items.filter((item) => item.id !== pokemon.id)
      : [...this.items, pokemon];
    this.persist();
  }
}

export const favoritesStore = new FavoritesStore();
