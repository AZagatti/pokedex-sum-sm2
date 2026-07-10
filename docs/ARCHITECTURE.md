# Architecture

## Overview

The app is a static single-page application built with SvelteKit (Svelte 5 runes) and `@sveltejs/adapter-static`. There is no backend of its own — all data comes directly from the public [PokeAPI](https://pokeapi.co/api/v2) via the browser's `fetch`, called from SvelteKit `load` functions and, for infinite-scroll pagination, directly from component script blocks.

```
┌─────────────┐      fetch       ┌──────────────┐      zod.parse      ┌───────────────┐
│  Route load │ ───────────────▶ │  src/lib/api │ ──────────────────▶ │ typed domain  │
│  functions   │                  │  /client.ts  │                     │ objects        │
└─────────────┘                  └──────┬───────┘                     └───────────────┘
                                         │
                                         ▼
                                 ┌───────────────┐
                                 │ src/lib/api   │  Map<url, parsed>
                                 │ /cache.ts     │  in-memory, per session
                                 └───────────────┘
```

## Data flow

1. A route's `+page.ts` `load` function (or a component's `$effect`, for infinite scroll) calls a typed helper from `src/lib/api/client.ts` (e.g. `getPokemon`, `getBerryList`).
2. Each helper builds the PokeAPI URL and calls `cachedFetch` (`src/lib/api/cache.ts`), which:
   - Looks up the URL in an in-memory `Map`. If present, returns the cached, already-parsed value synchronously (no network call).
   - Otherwise calls `fetch`, checks `response.ok`, parses the JSON, validates+narrows it with the matching zod schema from `src/lib/api/schemas.ts`, stores the parsed result in the cache, and returns it.
3. Because the cache is keyed by full URL and stores the _parsed_ value, repeated navigation (e.g. going back to the list after visiting a detail page) never re-fetches or re-validates data already seen this session.
4. Components consume the typed result directly — no additional client-side store/normalization layer. Cross-cutting client state (favorites, theme) lives in two small Svelte 5 rune-based stores (`src/lib/stores/*.svelte.ts`) that mirror themselves into `localStorage`.

## Route structure

```
src/routes/
├── +layout.svelte        Global shell: header/nav, theme effect, imports app.css
├── +layout.ts             prerender = true (default for static routes)
├── +page.svelte           "/" — list, search, filters, sort, infinite scroll
├── +page.ts                loads the generation list + static type list for filter UI
├── +error.svelte           shared error boundary (404 and unexpected errors)
├── pokemon/[name]/
│   ├── +page.ts             prerender = false; loads pokemon + species + evolution chain
│   └── +page.svelte         detail view: stats, abilities, moves, evolution, cry, sprites
├── berries/
│   ├── +page.ts             prerender = true
│   ├── +page.svelte         berries grid
│   └── [name]/
│       ├── +page.ts         prerender = false; loads one berry
│       └── +page.svelte     berry detail
└── favorites/
    └── +page.svelte         reads the favorites store directly, no load function needed
```

Dynamic detail routes (`pokemon/[name]`, `berries/[name]`) are **not** prerendered, since the set of possible slugs is effectively open-ended (base forms, mega evolutions, regional forms, gmax forms, etc. — PokeAPI returns >1300 pokemon). They render entirely client-side against `adapter-static`'s SPA fallback (`404.html`), which GitHub Pages serves for any path it doesn't recognize, letting the SvelteKit router take over and fetch the right data.

## Caching strategy

A single `Map<string, unknown>` scoped to `src/lib/api/cache.ts` module state. It is:

- **Per-session, in-memory only** — cleared on a full page reload. This is intentional: PokeAPI data is effectively immutable (a given Pokémon's stats don't change), so there's no staleness concern, and avoiding `localStorage`/IndexedDB here keeps the implementation simple and avoids needing a cache-eviction policy.
- **Keyed by the exact request URL**, so `getPokemon('pikachu')` and a raw `/pokemon/25` request are cached independently even though they resolve to the same Pokémon — a deliberate simplicity trade-off over URL canonicalization.

## Client-side state

- **Theme** (`src/lib/stores/theme.svelte.ts`): a `$state` rune wrapped in a small class, persisted to `localStorage` on every change, applied via `document.documentElement.dataset.theme` and a Tailwind v4 `@custom-variant dark`. An inline script in `app.html` sets the theme attribute before hydration to avoid a flash of the wrong theme.
- **Favorites** (`src/lib/stores/favorites.svelte.ts`): the same rune-class pattern, storing an array of `{ id, name, sprite }` so the favorites page can render without re-fetching anything.

## Build & deploy

`@sveltejs/adapter-static` outputs a fully static `build/` directory (`fallback: '404.html'`, `strict: true`). `paths.base` is set from the `BASE_PATH` environment variable at build time (`/pokedex-sum-sm2` in CI), so all internal links resolve correctly when served from a GitHub Pages _project_ site rather than the domain root. GitHub Actions builds, tests, and then deploys the `build/` directory via `actions/upload-pages-artifact` + `actions/deploy-pages`.
