<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import { base } from '$app/paths';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { formatPokemonName, padDexNumber } from '$lib/utils/pokemon';
</script>

<svelte:head>
	<title>Favorites — Pokédex</title>
	<meta name="description" content="Your favorited Pokémon, saved locally." />
</svelte:head>

<h1 class="mb-6 font-bold text-2xl text-neutral-900 dark:text-neutral-50">Favorites</h1>

{#if favoritesStore.items.length === 0}
	<div class="flex flex-col items-center gap-3 py-20 text-center text-neutral-500">
		<Heart size={40} />
		<p class="text-lg font-medium">You haven't favorited any Pokémon yet.</p>
		<a
			href={`${base}/`}
			class="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
		>
			Browse the Pokédex
		</a>
	</div>
{:else}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each favoritesStore.items as fav (fav.id)}
			<div class="animate-entrance relative">
				<a
					href={`${base}/pokemon/${fav.name}`}
					class="card-hover flex flex-col items-center gap-2 rounded-2xl p-4 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					<button
						type="button"
						class="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 shadow dark:bg-black/40"
						onclick={(e) => {
							e.preventDefault();
							favoritesStore.toggle(fav);
						}}
						aria-label={`Remove ${formatPokemonName(fav.name)} from favorites`}
					>
						<Heart size={18} fill="#f43f5e" color="#f43f5e" />
					</button>
					<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
						{padDexNumber(fav.id)}
					</span>
					<PokemonImage src={fav.sprite} alt={formatPokemonName(fav.name)} size={96} />
					<h2 class="text-center font-semibold text-neutral-900 dark:text-neutral-50">
						{formatPokemonName(fav.name)}
					</h2>
				</a>
			</div>
		{/each}
	</div>
{/if}
