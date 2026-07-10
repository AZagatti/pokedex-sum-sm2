<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} — Pokédex</title>
</svelte:head>

<div class="flex flex-col items-center gap-4 py-24 text-center">
	<span class="text-6xl" aria-hidden="true">🕳️</span>
	<h1 class="font-bold text-3xl text-neutral-900 dark:text-neutral-50">
		{page.status === 404 ? 'Pokémon not found' : 'Something went wrong'}
	</h1>
	<p class="max-w-md text-neutral-500 dark:text-neutral-400">
		{page.error?.message ?? 'An unexpected error occurred.'}
	</p>
	<a href={`${base}/`} class="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500">
		Back to Pokédex
	</a>
</div>
