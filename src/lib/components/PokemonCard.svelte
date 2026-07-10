<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import { base } from '$app/paths';
	import PokemonImage from './PokemonImage.svelte';
	import TypeBadge from './TypeBadge.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { formatPokemonName, padDexNumber, typeColor } from '$lib/utils/pokemon';

	const {
		id,
		name,
		sprite,
		types
	}: { id: number; name: string; sprite: string | null; types: string[] } = $props();

	const isFavorite = $derived(favoritesStore.has(id));
	const primaryType = $derived(types[0] ?? 'normal');

	const handleFavoriteClick = (event: MouseEvent): void => {
		event.preventDefault();
		event.stopPropagation();
		favoritesStore.toggle({ id, name, sprite });
	};
</script>

<a
	href={`${base}/pokemon/${name}`}
	class="card-hover group relative flex flex-col items-center gap-2 rounded-2xl p-4 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
	style:background={`linear-gradient(160deg, color-mix(in srgb, ${typeColor(primaryType)} 22%, transparent), transparent 70%)`}
>
	<button
		type="button"
		class="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 shadow dark:bg-black/40"
		onclick={handleFavoriteClick}
		aria-pressed={isFavorite}
		aria-label={isFavorite ? `Remove ${formatPokemonName(name)} from favorites` : `Add ${formatPokemonName(name)} to favorites`}
	>
		<Heart
			size={18}
			fill={isFavorite ? '#f43f5e' : 'none'}
			color={isFavorite ? '#f43f5e' : 'currentColor'}
		/>
	</button>
	<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">{padDexNumber(id)}</span>
	<PokemonImage src={sprite} alt={formatPokemonName(name)} size={96} />
	<h2 class="text-center font-semibold text-neutral-900 dark:text-neutral-50">
		{formatPokemonName(name)}
	</h2>
	<div class="flex flex-wrap justify-center gap-1.5">
		{#each types as type (type)}
			<TypeBadge {type} />
		{/each}
	</div>
</a>
