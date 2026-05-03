<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';
	import MuridModal from './MuridModal.svelte';
	import MuridAutocomplete from './MuridAutocomplete.svelte';

	// Types for the data received from the modal/autocomplete
	interface CompactMurid {
		id: number;
		nama: string;
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
		placeholder = 'Ketik nama murid...',
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

	function handleSelect(murid: CompactMurid) {
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

<div class="flex flex-col gap-2 {className}">
	{#if selectedMurid}
		<div class="flex items-center gap-2">
			<div class="flex-1 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 flex justify-between items-center">
				<div class="flex flex-col">
					<span class="font-bold text-primary">{selectedMurid.nama}</span>
					<span class="text-[10px] opacity-60 font-mono">ID: {selectedMurid.id}</span>
				</div>
				<button
					type="button"
					class="btn btn-circle btn-ghost btn-xs text-error"
					onclick={handleClear}
					{disabled}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
			</div>
		</div>
	{:else}
		<div class="flex items-center gap-2">
			<div class="flex-1">
				<MuridAutocomplete 
					{placeholder} 
					{disabled} 
					excludeId={editedMuridId} 
					onselect={handleSelect} 
				/>
			</div>
			<div class="tooltip tooltip-left" data-tip="Pencarian Lanjut">
				<button
					type="button"
					class="btn btn-square btn-outline"
					onclick={() => (showModal = true)}
					{disabled}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<MuridModal
	{showModal}
	{editedMuridId}
	on:select={(e) => handleSelect(e.detail)}
	on:close={() => (showModal = false)}
/>
