<script lang="ts">
	import { tick } from 'svelte';
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import type { propTable, kokabTable, kecamatanTable, deskelTable } from '$lib/drizzle/schema';
	import { type InferSelectModel } from 'drizzle-orm';
	import { muridFormStore, type MuridFormData } from '$lib/stores/muridForm';

	// Types
	type Propinsi = InferSelectModel<typeof propTable>;
	type Kokab = InferSelectModel<typeof kokabTable>;
	type Kecamatan = InferSelectModel<typeof kecamatanTable>;
	type Deskel = InferSelectModel<typeof deskelTable>;

	const dispatch = createEventDispatcher();

	// Props
	export let selectedPropinsi: Propinsi | null = null;
	export let selectedKokab: Kokab | null = null;
	export let selectedKecamatan: Kecamatan | null = null;
	export let deskelId: number | undefined = undefined;
	export let alamat: string = '';

	// State
	let propinsiList: Propinsi[] = [];
	let kokabList: Kokab[] = [];
	let kecamatanList: Kecamatan[] = [];
	let deskelList: Deskel[] = [];

	let loadingPropinsi = false;
	let loadingKokab = false;
	let loadingKecamatan = false;
	let loadingDeskel = false;
	let mounted = false;

	// Search state for each dropdown
	let propinsiSearchTerm = '';
	let kokabSearchTerm = '';
	let kecamatanSearchTerm = '';
	let deskelSearchTerm = '';

	// --- Core Logic (largely unchanged, adapted for daisyUI) ---

	const unsubscribe = muridFormStore.subscribe((store: MuridFormData) => {
		// ... subscription logic remains the same ...
		if (!mounted) return;
		if (store.propinsiList.length > 0) propinsiList = store.propinsiList;
		if (store.kokabList.length > 0) kokabList = store.kokabList;
		if (store.kecamatanList.length > 0) kecamatanList = store.kecamatanList;
		if (store.deskelList.length > 0) deskelList = store.deskelList;
		if (store.formData.alamat !== alamat) alamat = store.formData.alamat || '';
		if (
			store.selectedPropinsi &&
			(!selectedPropinsi || selectedPropinsi.id !== store.selectedPropinsi.id)
		) {
			selectedPropinsi = store.selectedPropinsi;
			loadKokab();
		}
		if (store.selectedKokab && (!selectedKokab || selectedKokab.id !== store.selectedKokab.id)) {
			selectedKokab = store.selectedKokab;
			loadKecamatan();
		}
		if (
			store.selectedKecamatan &&
			(!selectedKecamatan || selectedKecamatan.id !== store.selectedKecamatan.id)
		) {
			selectedKecamatan = store.selectedKecamatan;
			loadDeskel();
		}
	});

	onDestroy(() => {
		mounted = false;
		unsubscribe();
	});

	// Data loading functions (loadPropinsi, loadKokab, etc.)
	async function loadPropinsi() {
		if (propinsiList.length > 0) return;
		loadingPropinsi = true;
		try {
			const response = await fetch('/api/propinsi');
			propinsiList = await response.json();
			muridFormStore.updateLists({ propinsiList });
		} catch (error) {
			console.error('Error loading propinsi:', error);
		} finally {
			loadingPropinsi = false;
		}
	}

	async function loadKokab() {
		if (!selectedPropinsi) return;
		loadingKokab = true;
		try {
			const response = await fetch(`/api/kokab?propinsiId=${selectedPropinsi.id}`);
			kokabList = await response.json();
			muridFormStore.updateLists({ kokabList });
		} catch (error) {
			console.error('Error loading kokab:', error);
		} finally {
			loadingKokab = false;
		}
	}

	async function loadKecamatan() {
		if (!selectedKokab) return;
		loadingKecamatan = true;
		try {
			const response = await fetch(`/api/kecamatan?kokabId=${selectedKokab.id}`);
			kecamatanList = await response.json();
			muridFormStore.updateLists({ kecamatanList });
		} catch (error) {
			console.error('Error loading kecamatan:', error);
		} finally {
			loadingKecamatan = false;
		}
	}

	async function loadDeskel() {
		if (!selectedKecamatan) return;
		loadingDeskel = true;
		try {
			const response = await fetch(`/api/deskel?kecamatanId=${selectedKecamatan.id}`);
			deskelList = await response.json();
			muridFormStore.updateLists({ deskelList });
		} catch (error) {
			console.error('Error loading deskel:', error);
		} finally {
			loadingDeskel = false;
		}
	}

	// clearLowerSelections remains the same
	function clearLowerSelections(level: 'propinsi' | 'kokab' | 'kecamatan' | 'deskel') {
		switch (level) {
			case 'propinsi':
				selectedKokab = null;
				selectedKecamatan = null;
				deskelId = undefined;
				kokabList = [];
				kecamatanList = [];
				deskelList = [];
				muridFormStore.update((store: MuridFormData) => ({
					...store,
					selectedKokab: null,
					selectedKecamatan: null,
					kokabList: [],
					kecamatanList: [],
					deskelList: [],
					formData: {
						...store.formData,
						kokabId: undefined,
						kecamatanId: undefined,
						deskelId: undefined
					}
				}));
				break;
			case 'kokab':
				selectedKecamatan = null;
				deskelId = undefined;
				kecamatanList = [];
				deskelList = [];
				muridFormStore.update((store: MuridFormData) => ({
					...store,
					selectedKecamatan: null,
					kecamatanList: [],
					deskelList: [],
					formData: {
						...store.formData,
						kecamatanId: undefined,
						deskelId: undefined
					}
				}));
				break;
			case 'kecamatan':
				deskelId = undefined;
				deskelList = [];
				muridFormStore.update((store: MuridFormData) => ({
					...store,
					deskelList: [],
					formData: {
						...store.formData,
						deskelId: undefined
					}
				}));
				break;
		}
	}

	function closeDropdown() {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	async function handlePropinsiSelect(propinsi: Propinsi) {
		if (selectedPropinsi?.id === propinsi.id) return;
		clearLowerSelections('propinsi');
		selectedPropinsi = propinsi;
		muridFormStore.updateSelections({ selectedPropinsi });
		closeDropdown();
		await loadKokab();
		await tick();
		notifyChange();
	}

	async function handleKokabSelect(kokab: Kokab) {
		if (selectedKokab?.id === kokab.id) return;
		clearLowerSelections('kokab');
		selectedKokab = kokab;
		muridFormStore.updateSelections({ selectedKokab });
		closeDropdown();
		await loadKecamatan();
		await tick();
		notifyChange();
	}

	async function handleKecamatanSelect(kecamatan: Kecamatan) {
		if (selectedKecamatan?.id === kecamatan.id) return;
		clearLowerSelections('kecamatan');
		selectedKecamatan = kecamatan;
		muridFormStore.updateSelections({ selectedKecamatan });
		closeDropdown();
		await loadDeskel();
		await tick();
		notifyChange();
	}

	async function handleDeskelSelect(deskel: Deskel) {
		if (deskelId === deskel.id) return;
		deskelId = deskel.id;
		closeDropdown();
		notifyChange();
	}

	function handleAlamatChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		alamat = target.value;
		muridFormStore.updateFormData({ alamat });
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

	onMount(async () => {
		// ... onMount logic remains the same ...
		mounted = true;
		const store: MuridFormData = get(muridFormStore);
		if (store.formData.alamat) alamat = store.formData.alamat;
		if (!store.propinsiList.length) await loadPropinsi();
		else propinsiList = store.propinsiList;
		if (store.selectedPropinsi) {
			selectedPropinsi = store.selectedPropinsi;
			await loadKokab();
		}
		if (store.selectedKokab) {
			selectedKokab = store.selectedKokab;
			await loadKecamatan();
		}
		if (store.selectedKecamatan) {
			selectedKecamatan = store.selectedKecamatan;
			await loadDeskel();
		}
	});

	// Filtered lists for search
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
			<label
				tabindex="0"
				class={'btn btn-outline w-full justify-between font-normal normal-case' +
					(!selectedPropinsi ? ' text-base-content/60' : '')}
			>
				{#if loadingPropinsi}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					{selectedPropinsi?.propinsi || 'Pilih propinsi...'}
				{/if}
			</label>
			<div
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
									class="ml-auto h-4 w-4"
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
			<label
				tabindex="0"
				class={'btn btn-outline w-full justify-between font-normal normal-case' +
					(!selectedPropinsi ? ' text-base-content/60' : '')}
				class:btn-disabled={!selectedPropinsi}
			>
				{#if loadingKokab}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					{selectedKokab?.kokab || 'Pilih kota/kabupaten...'}
				{/if}
			</label>
			<div
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
									class="ml-auto h-4 w-4"
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
			<label
				tabindex="0"
				class={'btn btn-outline w-full justify-between font-normal normal-case' +
					(!selectedKokab ? ' text-base-content/60' : '')}
				class:btn-disabled={!selectedKokab}
			>
				{#if loadingKecamatan}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					{selectedKecamatan?.kecamatan || 'Pilih kecamatan...'}
				{/if}
			</label>
			<div
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
									class="ml-auto h-4 w-4"
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
			<label
				tabindex="0"
				class={'btn btn-outline w-full justify-between font-normal normal-case' +
					(!selectedKecamatan ? ' text-base-content/60' : '')}
				class:btn-disabled={!selectedKecamatan}
			>
				{#if loadingDeskel}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					{deskelList.find((d) => d.id === deskelId)?.deskel || 'Pilih desa/kelurahan...'}
				{/if}
			</label>
			<div
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
									class="ml-auto h-4 w-4"
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
