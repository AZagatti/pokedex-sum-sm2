<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { base } from '$app/paths';
	import { capitalize } from '$lib/utils/pokemon';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const berry = $derived(data.berry);
</script>

<svelte:head>
	<title>{capitalize(berry.name)} — Pokédex</title>
	<meta name="description" content={`Details for the ${berry.name} berry.`} />
</svelte:head>

<a
	href={`${base}/berries`}
	class="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
>
	<ArrowLeft size={16} /> Back to Berries
</a>

<div
	class="animate-entrance flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-lime-100 to-transparent p-8 shadow-lg dark:from-lime-950 sm:flex-row sm:items-start"
>
	<span class="text-8xl" aria-hidden="true">🫐</span>
	<div class="flex-1">
		<span class="text-sm font-medium text-neutral-500 dark:text-neutral-400">#{berry.id}</span>
		<h1 class="font-bold text-3xl text-neutral-900 dark:text-neutral-50">
			{capitalize(berry.name.replace('-', ' '))}
		</h1>

		<dl class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
			<div>
				<dt class="text-neutral-500 text-xs uppercase dark:text-neutral-400">Firmness</dt>
				<dd class="font-semibold capitalize">{berry.firmness.name.replace('-', ' ')}</dd>
			</div>
			<div>
				<dt class="text-neutral-500 text-xs uppercase dark:text-neutral-400">Growth time</dt>
				<dd class="font-semibold">{berry.growth_time}h</dd>
			</div>
			<div>
				<dt class="text-neutral-500 text-xs uppercase dark:text-neutral-400">Size</dt>
				<dd class="font-semibold">{berry.size} mm</dd>
			</div>
			<div>
				<dt class="text-neutral-500 text-xs uppercase dark:text-neutral-400">Max harvest</dt>
				<dd class="font-semibold">{berry.max_harvest}</dd>
			</div>
			<div>
				<dt class="text-neutral-500 text-xs uppercase dark:text-neutral-400">Smoothness</dt>
				<dd class="font-semibold">{berry.smoothness}</dd>
			</div>
			<div>
				<dt class="text-neutral-500 text-xs uppercase dark:text-neutral-400">Natural gift power</dt>
				<dd class="font-semibold">{berry.natural_gift_power}</dd>
			</div>
		</dl>

		<h2 class="mt-6 mb-2 font-semibold text-neutral-900 dark:text-neutral-50">Flavors</h2>
		<div class="flex flex-wrap gap-2">
			{#each berry.flavors.filter((f) => f.potency > 0) as flavor (flavor.flavor.name)}
				<span class="rounded-full bg-neutral-100 px-3 py-1.5 text-sm capitalize dark:bg-neutral-800">
					{flavor.flavor.name.replace('-', ' ')} · {flavor.potency}
				</span>
			{/each}
		</div>
	</div>
</div>
