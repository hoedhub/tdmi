<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';
	import MuridModal from './MuridModal.svelte';

	// Types for the data received from the modal
	interface ModalMurid {
		id: number;
		nama: string;
		// Add other properties from the modal's Murid type if needed
	}

	// Props
	interface Props {
		className?: string;
		placeholder?: string;
		disabled?: boolean;
		initialData?: { id: number; nama: string } | null | undefined;
		editedMuridId?: number | undefined;
	}

	let {
		className = '',
		placeholder = 'Pilih murid',
		disabled = false,
		initialData = null,
		editedMuridId = undefined
	}: Props = $props();

	// State
	let showModal = $state(false);
	let selectedMurid: { id: number; nama: string } | null = $state(null);

	const dispatch = createEventDispatcher<{
		change: { selectedId: number; selectedName: string };
		clear: undefined;
	}>();

	function handleSelect(event: CustomEvent<ModalMurid>) {
		const murid = event.detail;
		selectedMurid = { id: murid.id, nama: murid.nama };
		dispatch('change', { selectedId: murid.id, selectedName: murid.nama });
		showModal = false;
	}

	function handleClear() {
		selectedMurid = null;
		dispatch('clear');
	}

	run(() => {
		selectedMurid = initialData || null;
	});
</script>

<div class="flex items-center gap-2 {className}">
	<div class="w-full">
		<button
			type="button"
			class="btn btn-outline w-full justify-start"
			onclick={() => (showModal = true)}
			{disabled}
		>
			{#if selectedMurid}
				<span class="truncate">{selectedMurid.nama}</span>
			{:else}
				{placeholder}
			{/if}
		</button>
	</div>

	<!-- Clear button -->
	{#if selectedMurid}
		<button
			type="button"
			class="btn btn-circle btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
			onclick={handleClear}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
			<span class="sr-only">Clear selection</span>
		</button>
	{/if}
</div>

<MuridModal
	{showModal}
	{editedMuridId}
	on:select={handleSelect}
	on:close={() => (showModal = false)}
/>
