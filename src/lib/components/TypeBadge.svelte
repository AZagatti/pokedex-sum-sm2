<script lang="ts">
	import { typeColor } from '$lib/utils/pokemon';

	const { type }: { type: string } = $props();
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-1 font-semibold text-white text-xs capitalize shadow-sm"
	style:background-color={typeColor(type)}
>
	{type}
</span>
