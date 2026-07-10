<script lang="ts">
	import { Heart, Moon, Sun } from '@lucide/svelte';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { themeStore } from '$lib/stores/theme.svelte';

	const links = [
		{ href: `${base}/`, label: 'Pokédex' },
		{ href: `${base}/berries`, label: 'Berries' },
		{ href: `${base}/favorites`, label: 'Favorites' }
	];

	const isActive = (href: string): boolean => {
		const path: string = page.url.pathname;
		if (href === `${base}/`) {
			return path === `${base}/` || path === base || path === '';
		}
		return path.startsWith(href);
	};
</script>

<header
	class="sticky top-0 z-40 border-neutral-200 border-b bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
>
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
		<a href={`${base}/`} class="flex items-center gap-2 font-bold text-lg">
			<span aria-hidden="true">⚡</span>
			<span>Pokédex</span>
		</a>
		<nav aria-label="Main navigation" class="flex items-center gap-1">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
					class:bg-neutral-100={isActive(link.href)}
					class:dark:bg-neutral-800={isActive(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
				>
					{#if link.label === 'Favorites'}
						<Heart size={16} />
					{/if}
					{link.label}
				</a>
			{/each}
		</nav>
		<button
			type="button"
			class="rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
			onclick={() => themeStore.toggle()}
			aria-label={themeStore.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
		>
			{#if themeStore.current === 'dark'}
				<Sun size={20} />
			{:else}
				<Moon size={20} />
			{/if}
		</button>
	</div>
</header>
