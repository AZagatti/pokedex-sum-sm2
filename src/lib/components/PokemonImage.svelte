<script lang="ts">
	const {
		src,
		alt,
		size = 96,
		class: className = ''
	}: { src: string | null; alt: string; size?: number; class?: string } = $props();

	// oxlint-disable-next-line prefer-const -- reassigned in onload handler below
	let loaded = $state(false);
</script>

<div
	class={`relative flex items-center justify-center ${className}`}
	style:width={`${size}px`}
	style:height={`${size}px`}
>
	{#if !loaded}
		<div class="skeleton absolute inset-0 rounded-full" aria-hidden="true"></div>
	{/if}
	{#if src}
		<img
			{src}
			{alt}
			width={size}
			height={size}
			loading="lazy"
			decoding="async"
			class={`relative object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
			onload={() => (loaded = true)}
		/>
	{:else}
		<span class="relative text-3xl" aria-hidden="true">❓</span>
	{/if}
</div>
