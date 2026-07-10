<script lang="ts">
	import { ArrowLeft, Heart, Play } from '@lucide/svelte';
	import { base } from '$app/paths';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import StatBar from '$lib/components/StatBar.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { extractIdFromUrl } from '$lib/api/client';
	import { formatPokemonName, padDexNumber, typeColor } from '$lib/utils/pokemon';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const pokemon = $derived(data.pokemon);
	const species = $derived(data.species);
	const primaryType = $derived(pokemon.types[0]?.type.name ?? 'normal');

	const isFavorite = $derived(favoritesStore.has(pokemon.id));

	const toggleFavorite = (): void => {
		favoritesStore.toggle({
			id: pokemon.id,
			name: pokemon.name,
			sprite: pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default
		});
	};

	type SpriteVariant = 'front_default' | 'back_default' | 'front_shiny' | 'back_shiny';
	const spriteVariants: { key: SpriteVariant; label: string }[] = [
		{ key: 'front_default', label: 'Front' },
		{ key: 'back_default', label: 'Back' },
		{ key: 'front_shiny', label: 'Shiny front' },
		{ key: 'back_shiny', label: 'Shiny back' }
	];
	// oxlint-disable-next-line prefer-const -- reassigned via onclick handler in the template
	let activeVariant = $state<SpriteVariant>('front_default');
	const activeSprite = $derived(
		pokemon.sprites[activeVariant] ?? pokemon.sprites.front_default
	);

	const artwork = $derived(
		pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default
	);

	const englishFlavorText = $derived(
		species.flavor_text_entries
			.find((entry) => entry.language.name === 'en')
			?.flavor_text.replaceAll(/[\n\f]/gu, ' ') ?? ''
	);

	const exampleMoves = $derived(pokemon.moves.slice(0, 8));

	// oxlint-disable-next-line prefer-const -- reassigned via bind:this in the template
	let audio = $state<HTMLAudioElement | null>(null);
	// oxlint-disable-next-line prefer-const -- reassigned via onplay/onended handlers
	let playing = $state(false);
	const cryUrl = $derived(pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null);

	const playCry = async (): Promise<void> => {
		if (!(audio && cryUrl)) {
			return;
		}
		audio.currentTime = 0;
		try {
			await audio.play();
		} catch {
			// Autoplay/network errors are non-fatal — the cry button simply stays inert.
		}
	};

	interface EvoNode {
		species: { name: string; url: string };
		evolves_to: EvoNode[];
	}

	const flattenEvolutions = (node: EvoNode): { name: string; id: number }[] => {
		const current = { id: extractIdFromUrl(node.species.url), name: node.species.name };
		return [current, ...node.evolves_to.flatMap(flattenEvolutions)];
	};

	const evolutionLine = $derived(flattenEvolutions(data.evolutionChain.chain));
</script>

<svelte:head>
	<title>{formatPokemonName(pokemon.name)} — Pokédex</title>
	<meta name="description" content={englishFlavorText || `Details for ${formatPokemonName(pokemon.name)}.`} />
</svelte:head>

{#if cryUrl}
	<audio bind:this={audio} src={cryUrl} onplay={() => (playing = true)} onended={() => (playing = false)} preload="none">
		<track kind="captions" />
	</audio>
{/if}

<a
	href={`${base}/`}
	class="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
>
	<ArrowLeft size={16} /> Back to Pokédex
</a>

<div
	class="animate-entrance overflow-hidden rounded-3xl shadow-lg"
	style:background={`linear-gradient(160deg, color-mix(in srgb, ${typeColor(primaryType)} 30%, transparent), transparent 80%)`}
>
	<div class="flex flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:items-start">
		<div class="flex flex-col items-center gap-3">
			<PokemonImage src={artwork} alt={formatPokemonName(pokemon.name)} size={220} />
			<div class="flex flex-wrap justify-center gap-2" role="group" aria-label="Sprite variant">
				{#each spriteVariants as variant (variant.key)}
					{#if pokemon.sprites[variant.key]}
						<button
							type="button"
							class="rounded-full border px-2.5 py-1 text-xs transition-colors {activeVariant ===
							variant.key
								? 'border-indigo-600 bg-indigo-600 text-white'
								: 'border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
							onclick={() => (activeVariant = variant.key)}
							aria-pressed={activeVariant === variant.key}
						>
							{variant.label}
						</button>
					{/if}
				{/each}
			</div>
			{#if activeVariant !== 'front_default'}
				<img src={activeSprite} alt={`${formatPokemonName(pokemon.name)} ${activeVariant}`} width="96" height="96" loading="lazy" />
			{/if}
		</div>

		<div class="flex-1">
			<div class="flex items-start justify-between gap-3">
				<div>
					<span class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{padDexNumber(pokemon.id)}</span>
					<h1 class="font-bold text-3xl text-neutral-900 dark:text-neutral-50">
						{formatPokemonName(pokemon.name)}
					</h1>
				</div>
				<div class="flex items-center gap-2">
					{#if cryUrl}
						<button
							type="button"
							onclick={playCry}
							class="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-sm shadow hover:bg-white dark:bg-black/40 dark:hover:bg-black/60"
							aria-label={`Play ${formatPokemonName(pokemon.name)}'s cry`}
						>
							<Play size={16} /> Cry
						</button>
					{/if}
					<button
						type="button"
						onclick={toggleFavorite}
						class="rounded-full bg-white/80 p-2 shadow hover:bg-white dark:bg-black/40 dark:hover:bg-black/60"
						aria-pressed={isFavorite}
						aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
					>
						<Heart size={20} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : 'currentColor'} />
					</button>
				</div>
			</div>

			<div class="mt-2 flex flex-wrap gap-2">
				{#each pokemon.types as t (t.type.name)}
					<TypeBadge type={t.type.name} />
				{/each}
			</div>

			{#if englishFlavorText}
				<p class="mt-4 text-neutral-700 dark:text-neutral-300">{englishFlavorText}</p>
			{/if}

			<div class="mt-4 flex gap-6 text-sm">
				<div>
					<span class="block text-neutral-500 dark:text-neutral-400">Height</span>
					<span class="font-semibold">{(pokemon.height / 10).toFixed(1)} m</span>
				</div>
				<div>
					<span class="block text-neutral-500 dark:text-neutral-400">Weight</span>
					<span class="font-semibold">{(pokemon.weight / 10).toFixed(1)} kg</span>
				</div>
			</div>

			<div class="mt-4">
				<h2 class="mb-2 font-semibold text-neutral-900 dark:text-neutral-50">Abilities</h2>
				<div class="flex flex-wrap gap-2">
					{#each pokemon.abilities as a (a.ability.name)}
						<span
							class="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm capitalize dark:bg-neutral-800"
						>
							{a.ability.name.replace('-', ' ')}
							{#if a.is_hidden}
								<span class="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white uppercase"
									>Hidden</span
								>
							{/if}
						</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<section class="mt-8">
	<h2 class="mb-3 font-semibold text-neutral-900 text-xl dark:text-neutral-50">Base stats</h2>
	<div class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900">
		{#each pokemon.stats as stat (stat.stat.name)}
			<StatBar label={stat.stat.name.replace('special-', 'sp. ')} value={stat.base_stat} />
		{/each}
	</div>
</section>

<section class="mt-8">
	<h2 class="mb-3 font-semibold text-neutral-900 text-xl dark:text-neutral-50">Example moves</h2>
	<div class="flex flex-wrap gap-2">
		{#each exampleMoves as m (m.move.name)}
			<span class="rounded-full bg-neutral-100 px-3 py-1.5 text-sm capitalize dark:bg-neutral-800">
				{m.move.name.replace('-', ' ')}
			</span>
		{/each}
	</div>
</section>

{#if evolutionLine.length > 1}
	<section class="mt-8">
		<h2 class="mb-3 font-semibold text-neutral-900 text-xl dark:text-neutral-50">Evolution chain</h2>
		<div class="flex flex-wrap items-center gap-4">
			{#each evolutionLine as evo, i (evo.name)}
				{#if i > 0}
					<span class="text-neutral-400" aria-hidden="true">→</span>
				{/if}
				<a
					href={`${base}/pokemon/${evo.name}`}
					class="card-hover flex flex-col items-center gap-1 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-900"
				>
					<PokemonImage
						src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
						alt={formatPokemonName(evo.name)}
						size={72}
					/>
					<span class="text-sm font-medium">{formatPokemonName(evo.name)}</span>
				</a>
			{/each}
		</div>
	</section>
{/if}
