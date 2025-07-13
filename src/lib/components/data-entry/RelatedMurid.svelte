<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import MuridModal from './MuridModal.svelte';

	// Types for the data received from the modal
	interface ModalMurid {
		id: number;
		nama: string;
		// Add other properties from the modal's Murid type if needed
	}

	// Props
	export let className: string = '';
	export let placeholder: string = 'Pilih murid';
	export let disabled: boolean = false;
	export let initialData: { id: number; nama: string } | null | undefined = null;

	// State
	let showModal = false;
	let selectedMurid: { id: number; nama: string } | null = null;

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

	onMount(() => {
		if (initialData) {
			selectedMurid = initialData;
		}
	});
</script>

<div class="flex items-center gap-2 {className}">
	<div class="w-full">
		<button
			type="button"
			class="btn btn-outline w-full justify-start"
			on:click={() => (showModal = true)}
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
			on:click={handleClear}
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

<MuridModal {showModal} on:select={handleSelect} on:close={() => (showModal = false)} />
