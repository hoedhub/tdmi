<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import type { InferSelectModel } from 'drizzle-orm';
	import { muridTable } from '$lib/drizzle/schema';
	import PhoneInput from './PhoneInput.svelte';

	// Types
	type Murid = InferSelectModel<typeof muridTable>;

	interface NewMuridData {
		id: number;
		nama: string;
		countryId: string;
		countryCode: string;
		nomorTelepon: string;
	}

	// Constants
	const INITIAL_MURID_DATA: NewMuridData = {
		id: -1,
		nama: '',
		countryId: '',
		countryCode: '',
		nomorTelepon: ''
	};
	const API_ENDPOINT = '/api/murid';
	const PAGE_SIZE = 10;

	// Props
	export let className: string = '';
	export let placeholder: string = 'Pilih murid';
	export let disabled: boolean = false;
	export let initialData:
		| { id: number; nama: string; nomorTelepon: string | null }
		| null
		| undefined = null;

	// State
	let mounted = false;
	let murids: Murid[] = [];
	let searchTerm = '';
	let selectedMurid: Murid | null = null;
	let newMuridData: NewMuridData = { ...INITIAL_MURID_DATA };
	let loading = false;
	let error: string | null = null;

	const dispatch = createEventDispatcher<{
		change: { newMuridData: NewMuridData };
		clear: undefined;
	}>();

	function debounce<T extends (search?: string) => void>(fn: T, delay: number) {
		let timeoutId: ReturnType<typeof setTimeout>;
		return (search?: string) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(search), delay);
		};
	}

	async function fetchMurids(search: string = '') {
		loading = true;
		error = null;
		try {
			const filterParams = search ? JSON.stringify([{ column: 'nama', keyword: search }]) : '';
			const params = new URLSearchParams({
				pageSize: PAGE_SIZE.toString(),
				page: '1',
				...(search && { filterBy: filterParams })
			});
			const response = await fetch(`${API_ENDPOINT}?${params}`);
			if (!response.ok) throw new Error('Failed to fetch data');
			const data = await response.json();
			murids = data.murid || [];
		} catch (err) {
			console.error('Error fetching murids:', err);
			error = 'Failed to load data. Please try again.';
			murids = [];
		} finally {
			loading = false;
		}
	}

	const debouncedFetchMurids = debounce(fetchMurids, 300);

	function closeDropdown() {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	async function handleSelect(murid: Murid) {
		selectedMurid = murid;
		newMuridData = {
			...newMuridData,
			id: murid.id,
			nama: murid.nama,
			nomorTelepon: murid.nomorTelepon ?? ''
		};
		dispatch('change', { newMuridData });
		closeDropdown();
	}

	function handleAddNew() {
		selectedMurid = { id: 0, nama: '', nomorTelepon: null } as Murid;
		newMuridData = { ...INITIAL_MURID_DATA, id: 0 };
		dispatch('change', { newMuridData });
		closeDropdown();
	}

	function handleClear() {
		selectedMurid = null;
		searchTerm = '';
		newMuridData = { ...INITIAL_MURID_DATA };
		dispatch('clear');
		closeDropdown();
	}

	onMount(async () => {
		await fetchMurids();
		if (initialData && (!selectedMurid || selectedMurid.id !== initialData.id)) {
			selectedMurid = {
				id: initialData.id,
				nama: initialData.nama,
				nomorTelepon: initialData.nomorTelepon
			} as Murid;
			newMuridData = {
				...newMuridData,
				id: initialData.id,
				nama: initialData.nama,
				nomorTelepon: initialData.nomorTelepon ?? ''
			};
		}
		mounted = true;
	});

	// Refetch when search term changes, after component is mounted
	$: if (mounted) {
		debouncedFetchMurids(searchTerm);
	}

	$: filteredMurids = searchTerm
		? murids.filter((m) => m.nama.toLowerCase().includes(searchTerm.toLowerCase()))
		: murids;

	$: if (mounted && !initialData) handleClear();
</script>

<div class="flex items-center gap-2 {className}">
	<div class="dropdown w-full">
		<button
			type="button"
			tabindex="0"
			class={'select select-bordered w-full justify-between py-2 font-normal normal-case' +
				(!selectedMurid ? ' text-base-content/60' : '')}
			class:btn-disabled={disabled}
		>
			{#if selectedMurid}
				{#if selectedMurid?.id > 0}
					<span class="truncate">{selectedMurid?.nama}</span>
				{:else if selectedMurid?.id === 0}
					<span class="truncate">Tambah baru</span>
				{/if}
			{:else}
				{placeholder}
			{/if}
		</button>

		<div
			role="menu"
			tabindex="0"
			class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"
		>
			<input
				type="text"
				placeholder="Cari murid..."
				bind:value={searchTerm}
				class="input input-sm input-bordered sticky top-0 w-full"
			/>
			<ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">
				{#if error}
					<li class="menu-title px-4">{error}</li>
				{:else}
					<!-- Add New Item -->
					<li>
						<button type="button" on:click={handleAddNew} class:font-bold={selectedMurid?.id === 0}>
							Tambahkan data baru.
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
								class="ml-auto h-4 w-4"
								class:text-transparent={selectedMurid?.id !== 0}
							>
								<path
									fill="currentColor"
									d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"
								/>
							</svg>
						</button>
					</li>

					{#if loading}
						<li class="menu-title px-4">Memuat...</li>
					{:else}
						{#each filteredMurids as murid (murid.id)}
							<li>
								<button
									on:click={() => handleSelect(murid)}
									class:font-bold={selectedMurid?.id === murid.id}
								>
									<div class="flex w-full flex-col items-start">
										<span>{murid.nama}</span>
										{#if murid.nomorTelepon}
											<span class="text-sm font-normal text-base-content/60">
												{murid.nomorTelepon}
											</span>
										{/if}
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1em"
										height="1em"
										viewBox="0 0 24 24"
										class="ml-auto h-4 w-4"
										class:text-transparent={selectedMurid?.id !== murid.id}
									>
										<path
											fill="currentColor"
											d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"
										/>
									</svg>
								</button>
							</li>
						{/each}
					{/if}
				{/if}
			</ul>
		</div>
	</div>

	<!-- Clear button -->
	{#if selectedMurid?.id === 0}
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

<!-- "Add New" Form -->
{#if selectedMurid?.id === 0}
	<div class="mt-2 space-y-4 rounded-md border border-base-300 p-4">
		<div>
			<input
				type="text"
				placeholder="Nama"
				bind:value={newMuridData.nama}
				class="input input-bordered w-full"
			/>
		</div>
		<div>
			<PhoneInput
				bind:countryId={newMuridData.countryId}
				bind:countryCode={newMuridData.countryCode}
				bind:value={newMuridData.nomorTelepon}
				placeholder="Nomor Telepon"
				on:change={() => dispatch('change', { newMuridData: { ...newMuridData, id: 0 } })}
			/>
		</div>
	</div>
{/if}
