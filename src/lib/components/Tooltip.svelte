<script lang="ts">
	import { tooltipStore } from '$lib/stores/tooltipStore';
	import { fly } from 'svelte/transition';

	let style = '';
	tooltipStore.subscribe(($store) => {
		if ($store.isVisible) {
			style = `top: ${$store.position.top}px; left: ${$store.position.left}px; transform: translateY(-50%);`;
		}
	});
</script>

{#if $tooltipStore.isVisible}
	<div
		{style}
		class="pointer-events-none fixed z-[99] rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg"
		role="tooltip"
		in:fly={{ x: -5, duration: 150, delay: 300 }}
		out:fly={{ x: -5, duration: 150 }}
	>
		{$tooltipStore.content}
	</div>
{/if}
