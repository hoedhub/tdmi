<script lang="ts">
	interface Segment {
		label?: string;
		value: number;
		color: string;
		tooltip?: string;
	}

	interface Props {
		segments: Segment[];
		height?: string;
		rounded?: string;
		className?: string;
	}

	let { segments, height = 'h-1.5', rounded = 'rounded-full', className = '' }: Props = $props();

	let total = $derived(segments.reduce((acc, s) => acc + s.value, 0) || 1);
</script>

<div class="flex {height} {rounded} w-full overflow-hidden bg-base-300 {className}">
	{#each segments as segment}
		{@const pct = (segment.value / total) * 100}
		{#if pct > 0}
			<div
				class="h-full {segment.tooltip ? 'tooltip tooltip-bottom' : ''}"
				data-tip={segment.tooltip}
				style="width: {pct}%; background-color: {segment.color}"
			></div>
		{/if}
	{/each}
</div>
