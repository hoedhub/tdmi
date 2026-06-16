<script lang="ts">
	import { searchMuridCompact, type MuridCompact } from '$lib/utils/db';
	import { tick } from 'svelte';

	interface Props {
		placeholder?: string;
		onselect?: (murid: MuridCompact) => void;
		disabled?: boolean;
		excludeId?: number | undefined;
	}

	let {
		placeholder = 'Cari nama murid...',
		onselect,
		disabled = false,
		excludeId = undefined
	}: Props = $props();

	let searchTerm = $state('');
	let results = $state<MuridCompact[]>([]);
	let isDropdownOpen = $state(false);
	let loading = $state(false);
	let selectedIndex = $state(-1);

	async function handleInput() {
		if (searchTerm.length < 2) {
			results = [];
			isDropdownOpen = false;
			return;
		}

		loading = true;
		// Gunakan pencarian lokal dari IndexedDB
		let searchResults = await searchMuridCompact(searchTerm);
		
		// Filter out the excluded ID (e.g., the murid themselves)
		if (excludeId) {
			searchResults = searchResults.filter(m => m.id !== excludeId);
		}
		
		results = searchResults;
		loading = false;
		isDropdownOpen = results.length > 0;
		selectedIndex = -1;
	}

	function selectMurid(murid: MuridCompact) {
		onselect?.(murid);
		searchTerm = '';
		results = [];
		isDropdownOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isDropdownOpen) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % results.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = (selectedIndex - 1 + results.length) % results.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (selectedIndex >= 0) {
				selectMurid(results[selectedIndex]);
			}
		} else if (event.key === 'Escape') {
			isDropdownOpen = false;
		}
	}

	function handleBlur() {
		// Delay to allow click on dropdown item
		setTimeout(() => {
			isDropdownOpen = false;
		}, 200);
	}
</script>

<div class="relative w-full">
	<div class="join w-full">
		<div class="relative w-full">
			<input
				type="text"
				bind:value={searchTerm}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onfocus={() => searchTerm.length >= 2 && (isDropdownOpen = true)}
				onblur={handleBlur}
				{placeholder}
				{disabled}
				class="input input-bordered w-full join-item focus:input-primary transition-all"
				autocomplete="off"
				aria-label={placeholder || 'Cari murid'}
			/>
			{#if loading}
				<div class="absolute right-3 top-1/2 -translate-y-1/2">
					<span class="loading loading-spinner loading-xs text-primary"></span>
				</div>
			{/if}
		</div>
	</div>

	{#if isDropdownOpen && results.length > 0}
		<ul
			class="menu menu-sm dropdown-content absolute z-[100] mt-1 max-h-80 w-full overflow-y-auto overflow-x-hidden flex-col flex-nowrap rounded-box bg-base-100 p-2 shadow-2xl border border-base-200"
		>
			<li class="menu-title px-4 py-1 text-xs opacity-50 uppercase tracking-wider">Hasil Pencarian</li>
			{#each results as murid, i}
				<li>
					<button
						type="button"
						class="flex flex-col items-start gap-0 py-2 {selectedIndex === i ? 'active' : ''}"
						onclick={() => selectMurid(murid)}
					>
						<div class="flex w-full items-center justify-between gap-2">
							<span class="font-bold text-sm truncate flex-1 text-left">{murid.nama}</span>
							<span class="text-[10px] opacity-40 font-mono flex-shrink-0">#{murid.id}</span>
						</div>
						{#if murid.alamat}
							<span class="text-[11px] opacity-60 line-clamp-1 w-full text-left italic">
								{murid.alamat}
							</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	:global(.dropdown-content) {
		min-width: 100%;
	}
</style>
