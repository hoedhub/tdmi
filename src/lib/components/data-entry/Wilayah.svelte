<!-- src/lib/components/data-entry/Wilayah.svelte -->
<script lang="ts">
	import { tick } from 'svelte';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import type { propTable, kokabTable, kecamatanTable, deskelTable } from '$lib/drizzle/schema';
	import { type InferSelectModel } from 'drizzle-orm';

	// --- TYPES ---
	type Propinsi = InferSelectModel<typeof propTable>;
	type Kokab = InferSelectModel<typeof kokabTable>;
	type Kecamatan = InferSelectModel<typeof kecamatanTable>;
	type Deskel = InferSelectModel<typeof deskelTable>;

	const dispatch = createEventDispatcher();

	// --- PROPS ---
	export let selectedPropinsi: Propinsi | null = null;
	export let selectedKokab: Kokab | null = null;
	export let selectedKecamatan: Kecamatan | null = null;
	export let deskelId: number | undefined = undefined;
	export let alamat: string = '';

	// --- INTERNAL STATE ---
	export let propinsiList: Propinsi[] = [];
	let kokabList: Kokab[] = [];
	let kecamatanList: Kecamatan[] = [];
	let deskelList: Deskel[] = [];

	// Loading indicators for user feedback
	let loadingPropinsi = false;
	let loadingKokab = false;
	let loadingKecamatan = false;
	let loadingDeskel = false;
	let initialLoading = false; // For the initial load in edit mode

	// Error state variables
	let kokabError = false;
	let kecamatanError = false;
	let deskelError = false;

	// Search state for each dropdown
	let propinsiSearchTerm = '';
	let kokabSearchTerm = '';
	let kecamatanSearchTerm = '';
	let deskelSearchTerm = '';

	// --- DATA FETCHING & LOGIC ---

	// New function to handle pre-filling the form in "Edit" mode
	async function loadWilayahByDeskel(id: number) {
		initialLoading = true;
		try {
			const response = await fetch(`/api/wilayah-by-deskel?deskelId=${id}`);
			if (!response.ok) {
				throw new Error(`Gagal memuat data wilayah: ${response.statusText}`);
			}
			const data = await response.json();

			// Populate all the state variables from the API response
			selectedPropinsi = data.selectedPropinsi;
			selectedKokab = data.selectedKokab;
			selectedKecamatan = data.selectedKecamatan;

			kokabList = data.kokabList;
			kecamatanList = data.kecamatanList;
			deskelList = data.deskelList;

			await tick(); // Wait for Svelte to update the component state
			notifyChange(); // Inform the parent component of the changes
		} catch (error) {
			console.error('Error loading wilayah by deskelId:', error);
			// Optionally, show a toast notification to the user
		} finally {
			initialLoading = false;
		}
	}

	// --- Svelte Lifecycle Hook ---
	onMount(async () => {
		if (deskelId) {
			// If deskelId is provided (Edit Mode), fetch the full hierarchy
			await loadWilayahByDeskel(deskelId);
		}
		// If no deskelId (New Mode), the component is ready for user input.
	});

	async function loadKokab() {
		if (!selectedPropinsi) return;
		loadingKokab = true;
		kokabError = false; // Reset error state on new attempt
		kokabList = []; // Clear previous list
		try {
			const response = await fetch(`/api/kokab?propinsiId=${selectedPropinsi.id}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			kokabList = await response.json();
		} catch (error) {
			console.error('Error loading kokab:', error);
			kokabList = []; // Ensure list is an empty array on error
			kokabError = true; // Set error state
		} finally {
			loadingKokab = false;
		}
	}

	async function loadKecamatan() {
		if (!selectedKokab) return;
		loadingKecamatan = true;
		kecamatanError = false; // Reset
		kecamatanList = []; // Clear previous list
		try {
			const response = await fetch(`/api/kecamatan?kokabId=${selectedKokab.id}`);
			if (!response.ok) {
				// Check response status
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			kecamatanList = await response.json();
		} catch (error) {
			console.error('Error loading kecamatan:', error);
			kecamatanError = true; // Set error
			kecamatanList = []; // Ensure empty
		} finally {
			loadingKecamatan = false;
		}
	}

	async function loadDeskel() {
		if (!selectedKecamatan) return;
		loadingDeskel = true;
		deskelError = false; // Reset
		deskelList = []; // Clear previous list
		try {
			const response = await fetch(`/api/deskel?kecamatanId=${selectedKecamatan.id}`);
			if (!response.ok) {
				// Check response status
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			deskelList = await response.json();
		} catch (error) {
			console.error('Error loading deskel:', error);
			deskelError = true; // Set error
			deskelList = []; // Ensure empty
		} finally {
			loadingDeskel = false;
		}
	}

	function clearLowerSelections(level: 'propinsi' | 'kokab' | 'kecamatan') {
		if (level === 'propinsi') {
			selectedKokab = null;
			kokabList = [];
			kokabError = false;
		}
		if (level === 'propinsi' || level === 'kokab') {
			selectedKecamatan = null;
			kecamatanList = [];
			kecamatanError = false;
		}
		if (level === 'propinsi' || level === 'kokab' || level === 'kecamatan') {
			deskelId = undefined;
			deskelList = [];
			deskelError = false;
		}
	}

	function closeDropdown() {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	async function handlePropinsiSelect(propinsi: Propinsi) {
		if (selectedPropinsi?.id === propinsi.id) {
			closeDropdown();
			return;
		}
		clearLowerSelections('propinsi');
		selectedPropinsi = propinsi;
		closeDropdown();
		await loadKokab();
		notifyChange();
	}

	async function handleKokabSelect(kokab: Kokab) {
		if (selectedKokab?.id === kokab.id) {
			closeDropdown();
			return;
		}
		clearLowerSelections('kokab');
		selectedKokab = kokab;
		closeDropdown();
		await loadKecamatan();
		notifyChange();
	}

	async function handleKecamatanSelect(kecamatan: Kecamatan) {
		if (selectedKecamatan?.id === kecamatan.id) {
			closeDropdown();
			return;
		}
		clearLowerSelections('kecamatan');
		selectedKecamatan = kecamatan;
		closeDropdown();
		await loadDeskel();
		notifyChange();
	}

	function handleDeskelSelect(deskel: Deskel) {
		if (deskelId === deskel.id) {
			closeDropdown();
			return;
		}
		deskelId = deskel.id;
		closeDropdown();
		notifyChange();
	}

	function handleAlamatChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		alamat = target.value;
		notifyChange();
	}

	function notifyChange() {
		dispatch('change', {
			selectedPropinsi,
			selectedKokab,
			selectedKecamatan,
			deskelId,
			alamat
		});
	}

	// --- REACTIVE STATEMENTS FOR FILTERING ---
	$: filteredPropinsiList = propinsiSearchTerm
		? propinsiList.filter((p) =>
				p.propinsi.toLowerCase().includes(propinsiSearchTerm.toLowerCase())
			)
		: propinsiList;

	$: filteredKokabList = kokabSearchTerm
		? kokabList.filter((k) => k.kokab.toLowerCase().includes(kokabSearchTerm.toLowerCase()))
		: kokabList;

	$: filteredKecamatanList = kecamatanSearchTerm
		? kecamatanList.filter((k) =>
				k.kecamatan.toLowerCase().includes(kecamatanSearchTerm.toLowerCase())
			)
		: kecamatanList;

	$: filteredDeskelList = deskelSearchTerm
		? deskelList.filter((d) => d.deskel.toLowerCase().includes(deskelSearchTerm.toLowerCase()))
		: deskelList;
</script>

<div class="space-y-4">
	<!-- Propinsi Dropdown -->
	<div>
		<label for="propinsi" class="mb-1 block text-sm font-medium">Propinsi:</label>
		<div class="dropdown w-full">
			<button
				type="button"
				tabindex="0"
				class="select select-bordered w-full justify-between py-2 font-normal normal-case {!selectedPropinsi
					? 'text-base-content/60'
					: ''}"
			>
				{#if initialLoading || loadingPropinsi}
					<span class="loading loading-spinner loading-xs" />
					<span class="ml-2">Memuat...</span>
				{:else}
					{selectedPropinsi?.propinsi || 'Pilih propinsi...'}
				{/if}
			</button>
			<div
				role="menu"
				tabindex="0"
				class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"
			>
				<input
					type="text"
					placeholder="Cari propinsi..."
					bind:value={propinsiSearchTerm}
					class="input input-sm input-bordered sticky top-0 w-full"
				/>
				<ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">
					{#if loadingPropinsi}
						<li class="menu-title">Memuat...</li>
					{:else if filteredPropinsiList.length === 0}
						<li class="menu-title">Tidak ditemukan.</li>
					{/if}
					{#each filteredPropinsiList as propinsi (propinsi.id)}
						<li>
							<button type="button" on:click={() => handlePropinsiSelect(propinsi)}>
								{propinsi.propinsi}
								<svg
									class:text-transparent={selectedPropinsi?.id !== propinsi.id}
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									class="ml-auto h-4 w-4 shrink-0"
								>
									<path
										fill="currentColor"
										d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"
									/>
								</svg>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Kokab Dropdown -->
	<div>
		<label for="kokab" class="mb-1 block text-sm font-medium">Kota/Kabupaten:</label>
		<div class="dropdown w-full">
			<button
				type="button"
				tabindex="0"
				disabled={!selectedPropinsi || initialLoading}
				class="select select-bordered w-full justify-between py-2 font-normal normal-case {!selectedKokab
					? 'text-base-content/60'
					: ''}"
			>
				{#if loadingKokab}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					{selectedKokab?.kokab || 'Pilih kota/kabupaten...'}
				{/if}
			</button>
			<div
				role="menu"
				tabindex="0"
				class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"
			>
				<input
					type="text"
					placeholder="Cari kota/kabupaten..."
					bind:value={kokabSearchTerm}
					class="input input-sm input-bordered sticky top-0 w-full"
				/>
				<ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">
					{#if loadingKokab}
						<li class="menu-title">Memuat...</li>
					{:else if kokabError}
						<li class="menu-title text-error">Gagal memuat data.</li>
						<li>
							<button type="button" on:click={loadKokab}>Coba Lagi</button>
						</li>
					{:else if !selectedPropinsi}
						<li class="menu-title">Pilih propinsi dahulu.</li>
					{:else if filteredKokabList.length === 0}
						<li class="menu-title">Tidak ditemukan.</li>
					{/if}
					{#each filteredKokabList as kokab (kokab.id)}
						<li>
							<button type="button" on:click={() => handleKokabSelect(kokab)}>
								{kokab.kokab}
								<svg
									class:text-transparent={selectedKokab?.id !== kokab.id}
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									class="ml-auto h-4 w-4 shrink-0"
								>
									<path
										fill="currentColor"
										d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"
									/>
								</svg>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Kecamatan Dropdown -->
	<div>
		<label for="kecamatan" class="mb-1 block text-sm font-medium">Kecamatan:</label>
		<div class="dropdown w-full">
			<button
				type="button"
				tabindex="0"
				disabled={!selectedKokab || initialLoading}
				class="select select-bordered w-full justify-between py-2 font-normal normal-case {!selectedKecamatan
					? 'text-base-content/60'
					: ''}"
			>
				{#if loadingKecamatan}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					{selectedKecamatan?.kecamatan || 'Pilih kecamatan...'}
				{/if}
			</button>
			<div
				role="menu"
				tabindex="0"
				class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"
			>
				<input
					type="text"
					placeholder="Cari kecamatan..."
					bind:value={kecamatanSearchTerm}
					class="input input-sm input-bordered sticky top-0 w-full"
				/>
				<ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">
					{#if loadingKecamatan}
						<li class="menu-title">Memuat...</li>
					{:else if kecamatanError}
						<li class="menu-title text-error">Gagal memuat data.</li>
						<li>
							<button type="button" on:click={loadKecamatan}>Coba Lagi</button>
						</li>
					{:else if !selectedKokab}
						<li class="menu-title">Pilih kota/kabupaten dahulu.</li>
					{:else if filteredKecamatanList.length === 0}
						<li class="menu-title">Tidak ditemukan.</li>
					{/if}
					{#each filteredKecamatanList as kecamatan (kecamatan.id)}
						<li>
							<button type="button" on:click={() => handleKecamatanSelect(kecamatan)}>
								{kecamatan.kecamatan}
								<svg
									class:text-transparent={selectedKecamatan?.id !== kecamatan.id}
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									class="ml-auto h-4 w-4 shrink-0"
								>
									<path
										fill="currentColor"
										d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"
									/>
								</svg>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Deskel Dropdown -->
	<div>
		<label for="deskel" class="mb-1 block text-sm font-medium">Desa/Kelurahan:</label>
		<div class="dropdown w-full">
			<button
				type="button"
				tabindex="0"
				disabled={!selectedKecamatan || initialLoading}
				class="select select-bordered w-full justify-between py-2 font-normal normal-case {!deskelId
					? 'text-base-content/60'
					: ''}"
			>
				{#if loadingDeskel}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					{deskelList.find((d) => d.id === deskelId)?.deskel || 'Pilih desa/kelurahan...'}
				{/if}
			</button>
			<div
				role="menu"
				tabindex="0"
				class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"
			>
				<input
					type="text"
					placeholder="Cari desa/kelurahan..."
					bind:value={deskelSearchTerm}
					class="input input-sm input-bordered sticky top-0 w-full"
				/>
				<ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">
					{#if loadingDeskel}
						<li class="menu-title">Memuat...</li>
					{:else if deskelError}
						<li class="menu-title text-error">Gagal memuat data.</li>
						<li>
							<button type="button" on:click={loadDeskel}>Coba Lagi</button>
						</li>
					{:else if !selectedKecamatan}
						<li class="menu-title">Pilih kecamatan dahulu.</li>
					{:else if filteredDeskelList.length === 0}
						<li class="menu-title">Tidak ditemukan.</li>
					{/if}
					{#each filteredDeskelList as deskel (deskel.id)}
						<li>
							<button type="button" on:click={() => handleDeskelSelect(deskel)}>
								{deskel.deskel}
								<svg
									class:text-transparent={deskelId !== deskel.id}
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									class="ml-auto h-4 w-4 shrink-0"
								>
									<path
										fill="currentColor"
										d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"
									/>
								</svg>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Alamat Textarea -->
	<div>
		<label for="alamat" class="mb-1 block text-sm font-medium">Alamat:</label>
		<textarea
			id="alamat"
			bind:value={alamat}
			on:input={handleAlamatChange}
			class="textarea textarea-bordered w-full"
			placeholder="Dusun, nama jalan, RT/RW, dll."
			rows="2"
		/>
	</div>
</div>
