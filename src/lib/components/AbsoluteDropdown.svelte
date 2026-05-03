<script lang="ts">
	import { self } from 'svelte/legacy';

	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	let menuElement: HTMLDivElement | undefined = $state();
	let menuStyle = $state('');

	absoluteDropdownStore.subscribe(($store) => {
		if ($store.isOpen && $store.position) {
			const { position, direction } = $store;
			const horizontalPosition =
				window.innerWidth - position.right > 208 // w-52 approx
					? `left: ${position.left}px;`
					: `right: ${window.innerWidth - position.right}px;`;

			const verticalPosition =
				direction === 'up'
					? `bottom: ${window.innerHeight - position.top + 4}px;`
					: `top: ${position.bottom + 4}px;`;

			menuStyle = verticalPosition + ' ' + horizontalPosition;
		}
	});
</script>

{#if $absoluteDropdownStore.isOpen && $absoluteDropdownStore.component}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[80]"
		aria-hidden="true"
		onclick={self(absoluteDropdownStore.close)}
	></div>
	{@const SvelteComponent = $absoluteDropdownStore.component}
	<div
		bind:this={menuElement}
		style={menuStyle}
		class="fixed z-[90] rounded-box bg-base-300 shadow-lg"
	>
		<SvelteComponent {...$absoluteDropdownStore.data} />
	</div>
{/if}
