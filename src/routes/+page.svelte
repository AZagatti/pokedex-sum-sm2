<script lang="ts">
	import { X } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { getGeneration, getPokemon, getPokemonList, getType, extractIdFromUrl } from '$lib/api/client';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import PokemonCardSkeleton from '$lib/components/PokemonCardSkeleton.svelte';
	import { formatPokemonName } from '$lib/utils/pokemon';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	interface PokemonEntry {
		id: number;
		name: string;
		sprite: string | null;
		types: string[];
		statTotal: number;
	}

	const PAGE_SIZE = 30;

	let allEntries = $state<PokemonEntry[]>([]);
	let displayedCount = $state(0);
	let loading = $state(false);
	let initialLoading = $state(true);
	let errorMessage = $state<string | null>(null);
	// oxlint-disable-next-line prefer-const -- reassigned via bind:this in the template
	let sentinel = $state<HTMLDivElement | null>(null);

	let searchQuery = $state('');
	let debouncedQuery = $state('');
	let selectedGeneration = $state<string>('');
	let selectedTypes = $state<string[]>([]);
	let sortBy = $state<'dex' | 'stats'>('dex');

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const q = searchQuery;
		debounceTimer = setTimeout(() => {
			debouncedQuery = q;
		}, 250);
		return () => clearTimeout(debounceTimer);
	});

	const cache = new Map<number, PokemonEntry>();

	const fetchEntry = async (name: string, fetchFn = fetch): Promise<PokemonEntry> => {
		const pokemon = await getPokemon(name, fetchFn);
		let statTotal = 0;
		for (const s of pokemon.stats) {
			statTotal += s.base_stat;
		}
		const entry: PokemonEntry = {
			id: pokemon.id,
			name: pokemon.name,
			sprite:
				pokemon.sprites.other?.['official-artwork']?.front_default ??
				pokemon.sprites.front_default,
			statTotal,
			types: pokemon.types.toSorted((a, b) => a.slot - b.slot).map((t) => t.type.name)
		};
		cache.set(entry.id, entry);
		return entry;
	};

	const loadFilteredNameSet = async (): Promise<Set<string> | null> => {
		if (!selectedGeneration && selectedTypes.length === 0) {
			return null;
		}
		const sets: Set<string>[] = [];
		if (selectedGeneration) {
			const gen = await getGeneration(selectedGeneration);
			sets.push(new Set(gen.pokemon_species.map((s) => s.name)));
		}
		const typeDataList = await Promise.all(selectedTypes.map((type) => getType(type)));
		for (const typeData of typeDataList) {
			sets.push(new Set(typeData.pokemon.map((p) => p.pokemon.name)));
		}
		let result = sets[0] ?? new Set<string>();
		for (const set of sets.slice(1)) {
			result = new Set([...result].filter((name) => set.has(name)));
		}
		return result;
	};

	let filteredNames = $state<Set<string> | null>(null);
	let baseList = $state<{ name: string; url: string }[]>([]);
	let filterRequestId = 0;

	let visibleList = $state<{ name: string; url: string }[]>([]);

	const computeVisibleList = (): void => {
		let list = baseList;
		if (filteredNames) {
			list = list.filter((p) => filteredNames?.has(p.name));
		}
		if (debouncedQuery.trim()) {
			const q = debouncedQuery.trim().toLowerCase();
			list = list.filter((p) => p.name.includes(q));
		}
		visibleList = list;
	};

	const loadMore = async (): Promise<void> => {
		if (loading) {
			return;
		}
		const nextSlice = visibleList.slice(displayedCount, displayedCount + PAGE_SIZE);
		if (nextSlice.length === 0) {
			return;
		}
		loading = true;
		try {
			const entries = await Promise.all(
				nextSlice.map((p) => cache.get(extractIdFromUrl(p.url)) ?? fetchEntry(p.name))
			);
			allEntries =
				sortBy === 'stats'
					? [...allEntries, ...entries].toSorted((a, b) => b.statTotal - a.statTotal)
					: [...allEntries, ...entries].toSorted((a, b) => a.id - b.id);
			displayedCount += nextSlice.length;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to load Pokémon.';
		} finally {
			loading = false;
		}
	};

	const resetDisplay = (): void => {
		computeVisibleList();
		allEntries = [];
		displayedCount = 0;
		loadMore();
	};

	const loadBaseList = async (): Promise<void> => {
		initialLoading = true;
		errorMessage = null;
		try {
			const response = await getPokemonList(2000, 0);
			baseList = response.results;
			filteredNames = await loadFilteredNameSet();
			resetDisplay();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to load Pokémon.';
		} finally {
			initialLoading = false;
		}
	};

	$effect(() => {
		void debouncedQuery;
		void selectedGeneration;
		void selectedTypes.length;
		untrack(() => {
			filterRequestId += 1;
			const requestId = filterRequestId;
			(async () => {
				const names = await loadFilteredNameSet();
				if (requestId !== filterRequestId) {
					return;
				}
				filteredNames = names;
				resetDisplay();
			})();
		});
	});

	$effect(() => {
		void sortBy;
		untrack(() => {
			allEntries =
				sortBy === 'stats'
					? [...allEntries].toSorted((a, b) => b.statTotal - a.statTotal)
					: [...allEntries].toSorted((a, b) => a.id - b.id);
		});
	});

	$effect(() => {
		loadBaseList();
	});

	$effect(() => {
		if (!sentinel) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					loadMore();
				}
			},
			{ rootMargin: '400px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	const toggleType = (type: string): void => {
		selectedTypes = selectedTypes.includes(type)
			? selectedTypes.filter((t) => t !== type)
			: [...selectedTypes, type];
	};

	const clearFilters = (): void => {
		searchQuery = '';
		debouncedQuery = '';
		selectedGeneration = '';
		selectedTypes = [];
		sortBy = 'dex';
	};

	const hasActiveFilters = $derived(
		Boolean(searchQuery || selectedGeneration || selectedTypes.length > 0 || sortBy !== 'dex')
	);

	const hasMore = $derived(displayedCount < visibleList.length);
</script>

<svelte:head>
	<title>Pokédex</title>
	<meta
		name="description"
		content="Browse, search, and filter every Pokémon with an animated, accessible Pokédex."
	/>
</svelte:head>

<h1 class="sr-only">Pokédex — browse Pokémon</h1>

<div
	class="sticky top-[57px] z-30 -mx-4 mb-6 border-neutral-200 border-b bg-white/90 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90"
>
	<div class="flex flex-wrap items-center gap-3">
		<label class="relative flex-1 basis-56">
			<span class="sr-only">Search Pokémon by name</span>
			<input
				id="pokemon-search"
				type="search"
				placeholder="Search Pokémon…"
				class="w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-neutral-700 dark:bg-neutral-900"
				bind:value={searchQuery}
			/>
		</label>

		<label class="flex items-center gap-2 text-sm">
			<span class="sr-only">Filter by generation</span>
			<select
				bind:value={selectedGeneration}
				class="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
			>
				<option value="">All generations</option>
				{#each data.generations as gen (gen.name)}
					<option value={gen.name}>{formatPokemonName(gen.name.replace('generation-', 'Gen '))}</option>
				{/each}
			</select>
		</label>

		<label class="flex items-center gap-2 text-sm">
			<span class="sr-only">Sort by</span>
			<select
				bind:value={sortBy}
				class="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
			>
				<option value="dex">Sort: Dex number</option>
				<option value="stats">Sort: Base stat total</option>
			</select>
		</label>

		{#if hasActiveFilters}
			<button
				type="button"
				onclick={clearFilters}
				class="flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
			>
				<X size={14} /> Clear filters
			</button>
		{/if}
	</div>

	<div class="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
		{#each data.types as type (type)}
			<button
				type="button"
				onclick={() => toggleType(type)}
				aria-pressed={selectedTypes.includes(type)}
				class="rounded-full px-2.5 py-1 text-xs capitalize transition-transform {selectedTypes.includes(
					type
				)
					? 'scale-105 font-semibold text-white shadow'
					: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}"
				style:background-color={selectedTypes.includes(type)
					? `var(--type-${type})`
					: undefined}
			>
				{type}
			</button>
		{/each}
	</div>
</div>

{#if errorMessage}
	<p role="alert" class="rounded-xl bg-red-100 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
		{errorMessage}
	</p>
{:else if initialLoading}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each Array(15) as _, i (i)}
			<PokemonCardSkeleton />
		{/each}
	</div>
{:else if visibleList.length === 0}
	<div class="flex flex-col items-center gap-3 py-20 text-center text-neutral-500">
		<p class="text-lg font-medium">No Pokémon match your filters.</p>
		<button
			type="button"
			onclick={clearFilters}
			class="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
		>
			Clear filters
		</button>
	</div>
{:else}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each allEntries as entry (entry.id)}
			<div class="animate-entrance">
				<PokemonCard id={entry.id} name={entry.name} sprite={entry.sprite} types={entry.types} />
			</div>
		{/each}
		{#if loading}
			{#each Array(5) as _, i (i)}
				<PokemonCardSkeleton />
			{/each}
		{/if}
	</div>
	{#if hasMore}
		<div bind:this={sentinel} class="h-10 w-full" aria-hidden="true"></div>
	{/if}
{/if}
