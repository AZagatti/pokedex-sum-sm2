<script lang="ts">
	import { getBerry, getBerryList } from '$lib/api/client';
	import PokemonCardSkeleton from '$lib/components/PokemonCardSkeleton.svelte';
	import { capitalize } from '$lib/utils/pokemon';
	import { base } from '$app/paths';

	interface BerryEntry { id: number; name: string; firmness: string; flavor: string | null }

	let berries = $state<BerryEntry[]>([]);
	let loading = $state(true);
	let errorMessage = $state<string | null>(null);

	const loadBerries = async (): Promise<void> => {
		loading = true;
		errorMessage = null;
		try {
			const list = await getBerryList(64, 0);
			const entries = await Promise.all(
				list.results.map(async (item) => {
					const berry = await getBerry(item.name);
					return {
						firmness: berry.firmness.name,
						flavor: [...berry.flavors].toSorted((a, b) => b.potency - a.potency)[0]?.flavor.name ?? null,
						id: berry.id,
						name: berry.name
					};
				})
			);
			berries = entries.toSorted((a, b) => a.id - b.id);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to load berries.';
		} finally {
			loading = false;
		}
	};

	$effect(() => {
		loadBerries();
	});
</script>

<svelte:head>
	<title>Berries — Pokédex</title>
	<meta name="description" content="Browse every berry with firmness, flavor, and growth details." />
</svelte:head>

<h1 class="mb-6 font-bold text-2xl text-neutral-900 dark:text-neutral-50">Berries</h1>

{#if errorMessage}
	<p role="alert" class="rounded-xl bg-red-100 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
		{errorMessage}
	</p>
{:else if loading}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each Array(12) as _, i (i)}
			<PokemonCardSkeleton />
		{/each}
	</div>
{:else}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each berries as berry (berry.id)}
			<a
				href={`${base}/berries/${berry.name}`}
				class="card-hover animate-entrance flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-lime-100 to-transparent p-4 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:from-lime-950"
			>
				<span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">#{berry.id}</span>
				<span class="text-4xl" aria-hidden="true">🫐</span>
				<h2 class="text-center font-semibold text-neutral-900 dark:text-neutral-50">
					{capitalize(berry.name.replace('-', ' '))}
				</h2>
				<span class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs capitalize dark:bg-neutral-800">
					{berry.firmness.replace('-', ' ')}
				</span>
			</a>
		{/each}
	</div>
{/if}
