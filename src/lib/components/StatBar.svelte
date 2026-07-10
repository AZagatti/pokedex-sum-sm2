<script lang="ts">
	const {
		label,
		value,
		max = 255
	}: { label: string; value: number; max?: number } = $props();

	const percent = $derived(Math.min(100, Math.round((value / max) * 100)));
	const barColor = $derived.by(() => {
		if (percent > 66) {
			return '#4ade80';
		}
		if (percent > 33) {
			return '#facc15';
		}
		return '#f87171';
	});
</script>

<div class="flex items-center gap-3">
	<span class="w-28 shrink-0 text-neutral-500 text-xs uppercase tracking-wide dark:text-neutral-400"
		>{label}</span
	>
	<span class="w-10 shrink-0 text-right font-semibold text-sm tabular-nums">{value}</span>
	<div
		class="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
		role="progressbar"
		aria-label={label}
		aria-valuenow={value}
		aria-valuemin={0}
		aria-valuemax={max}
	>
		<div
			class="stat-bar-fill h-full rounded-full"
			style:width={`${percent}%`}
			style:background-color={barColor}
		></div>
	</div>
</div>
