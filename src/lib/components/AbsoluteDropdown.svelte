<script lang="ts">
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	let menuElement: HTMLDivElement;
	let menuStyle = '';

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
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="fixed inset-0 z-40"
		aria-hidden="true"
		on:click|self={absoluteDropdownStore.close}
	/>
	<div
		bind:this={menuElement}
		style={menuStyle}
		class="fixed z-50 rounded-box bg-base-300 shadow-lg"
	>
		<svelte:component this={$absoluteDropdownStore.component} data={$absoluteDropdownStore.data} />
	</div>
{/if}
