<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';

	const { children } = $props();

	$effect(() => {
		document.documentElement.dataset.theme = themeStore.current;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen">
	<Header />
	<main class="mx-auto max-w-6xl px-4 py-6">
		{@render children()}
	</main>
</div>
