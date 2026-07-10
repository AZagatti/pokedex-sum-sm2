# Decisions

Why each pinned choice in the spec was made, and the trade-offs accepted.

## SvelteKit + Svelte 5 runes

Runes (`$state`, `$derived`, `$effect`) give explicit, fine-grained reactivity that maps cleanly onto a fetch-cache-render pipeline without needing an external state library. SvelteKit's file-based routing and `load` functions map directly onto the required page set (list, detail, berries, favorites) with minimal boilerplate.

## `@sveltejs/adapter-static` in SPA mode

GitHub Pages can only serve static files. `adapter-static` with `fallback: '404.html'` and `strict: true` produces a directory GitHub Pages can serve as-is: static routes (`/`, `/berries`, `/favorites`) are prerendered at build time, while `/pokemon/[name]` and `/berries/[name]` render client-side after the SPA fallback loads, since PokeAPI's ~1300+ Pokémon (including forms/megas) make full prerendering both slow and unnecessary. `paths.base` is templated from a `BASE_PATH` env var so the same build works locally (empty base) and on Pages (`/pokedex-sum-sm2`).

## Tailwind CSS v4 + hand-written CSS for motion

Tailwind v4's Vite plugin (`@tailwindcss/vite`) needs zero PostCSS config and compiles fast. It covers layout/spacing/color utilities well, but keyframe animations, the shimmer skeleton, and the `prefers-reduced-motion` overrides are easier to read and maintain as plain CSS in `src/app.css` than as arbitrary-value Tailwind utility soup.

## Native `fetch` + a hand-rolled cache instead of a data-fetching library

The spec explicitly rules out TanStack Query et al. PokeAPI data is immutable for the lifetime of a tab (a Pokémon's stats don't change), so the only thing a fetching library would add — revalidation, background refetch, mutation handling — isn't needed here. A `Map<url, parsed>` gives memoization with three lines of code and no extra dependency or bundle weight.

## Zod for validation

PokeAPI's shapes are large, and the app is a static SPA that can never fall back to a server-side schema check — so response shape errors would otherwise only surface as a runtime crash deep in a component. Parsing every response through a Zod schema at the fetch boundary means a shape change in the API fails loudly and immediately, with a typed, IDE-autocompletable result on success. The evolution-chain schema in particular needs `z.lazy` for its self-referential structure, which Zod supports directly.

## Ultracite (Oxlint + Oxfmt) over ESLint/Prettier or Biome

The spec pins Oxlint + Oxfmt specifically for their speed (both are Rust-based, ~50–100x faster than the ESLint/Prettier equivalents) with Ultracite supplying an opinionated, low-config rule preset on top so the project doesn't need to hand-curate hundreds of lint rules.

## Lefthook over Husky

Lefthook is a single static binary with no Node runtime overhead per hook invocation, configured declaratively in one YAML file, and supports running jobs in parallel (`pre-commit` lints, formats, and typechecks staged files concurrently) — a meaningful speed win for a hook that runs on every commit.

## Vitest + Playwright

Vitest shares Vite's config and transform pipeline with the app itself, so no separate test bundler config is needed, and its `projects` field lets unit tests split cleanly into a jsdom "client" project (for `.svelte.ts` rune-based store tests) and a plain Node "server" project (for schema/cache tests) in one config file. Playwright is the natural e2e counterpart for a Svelte/Vite app and integrates with the same `npm run build && npm run preview` static output that ships to Pages, so e2e tests exercise the exact artifact that gets deployed.

## GitHub Actions → GitHub Pages via `actions/deploy-pages`

Using the official `upload-pages-artifact` / `deploy-pages` actions (rather than pushing to a `gh-pages` branch) avoids committing build output to git history, gets HTTPS and cache headers configured automatically, and only requires `pages: write` + `id-token: write` permissions scoped to the single deploy job.
