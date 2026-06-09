<script lang="ts">
	import { run, stopPropagation } from 'svelte/legacy';

	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { Pen, Trash, PlusCircle, Clock, RefreshCw, ChevronRight, List, Map as MapIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { DatabaseUserAttributes } from '$lib/server/auth';
	import { api } from '$lib/utils/api';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';
	import { formatDateShort } from '$lib/utils/date';
	import IndonesiaMap from '$lib/components/charts/IndonesiaMap.svelte';
	import { fade } from 'svelte/transition';

	// --- Type Definitions ---
	// Use a type intersection (&) to extend PageData, which is the correct approach.
	type ExtendedPageData = PageData & {
		dbError: boolean;
		message?: string;
	};

	interface Murid {
		id: number;
		updatedAt: string;
		updaterId: string;
		nama: string;
		namaArab: string | null;
		gender: boolean; // true for pria, false for wanita
		deskelId: number | null;
		alamat: string | null;
		nomorTelepon: string | null;
		muhrimId: number | null;
		mursyidId: number | null;
		baiatId: number | null;
		wiridId: number | null;
		qari: boolean;
		marhalah: 1 | 2 | 3;
		tglLahir: string | null;
		aktif: boolean;
		partisipasi: boolean;
		nik: string | null;
		foto: Uint8Array | null; // Assuming blob is Uint8Array in JS
		// Joined fields from territory tables
		deskelName: string | null;
		kecamatanName: string | null;
		kokabName: string | null;
		propinsiName: string | null;
		mursyidName: string | null;
		baiatName: string | null;
		wiridName: string | null;
		mursyidMarhalah: number | null;
		baiatMarhalah: number | null;
		wiridMarhalah: number | null;
		mursyidQari: boolean | null;
		baiatQari: boolean | null;
		wiridQari: boolean | null;
	}

	interface Props {
		data: ExtendedPageData;
		form: { success?: boolean; message?: string } | null;
	}

	let { data, form }: Props = $props();

	let muridData: Murid[] = $state([]);
	let totalItems = $state(data.totalItems);
	let isNavigating = $state(false);
	let activeTab = $state<'table' | 'map'>('table');
	let mapViewMode = $state<'total' | 'marhalah1' | 'marhalah2' | 'marhalah3' | 'pria' | 'wanita'>('total');

	let loading = $state(false);
	let pageSize = $state(10);
	let currentPage = $state(1);
	let currentSort: SortConfig[] = $state([]);
	let currentFilters: FilterState = $state({ columns: {} });
	let selectedMuridIds: number[] = [];

	// --- Reactive Data from Props ---
	let canReadMurid = $derived(data.canReadMurid);
	let canWriteMurid = $derived(data.canWriteMurid);

	async function handleProvinceClick(id: number, name: string) {
		// Switch to table tab
		activeTab = 'table';
		
		console.log('Before update:', JSON.stringify(currentFilters));

		// 1. Update filter state secara langsung
		if (!currentFilters.columns) {
			currentFilters.columns = {};
		}
		currentFilters.columns.propinsiName = { value: name, operator: 'contains' };
		
		console.log('After update:', JSON.stringify(currentFilters));
		
		// 2. Beri waktu sejenak agar Svelte mendeteksi perubahan state
		await tick();
		
		// 3. Trigger fetch
		await fetchTableData(currentSort, currentFilters, 1, pageSize);
		
		// Scroll to top
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function resetFilter() {
		// Reset filter state
		currentFilters = { columns: {} };
		// Trigger fetch
		await fetchTableData(currentSort, currentFilters, 1, pageSize);
	}

	// Transform data based on selected view mode
	let mapData = $derived(
		(data.sebaranMurid || []).map((item: any) => {
			const val = item[mapViewMode];
			return {
				id: item.id,
				propinsi: item.propinsi,
				count: typeof val === 'number' ? val : Number(val || 0)
			};
		})
	);

	const mapLabels: Record<string, string> = {
		total: 'Total Murid',
		marhalah1: 'Murid Marhalah 1',
		marhalah2: 'Murid Marhalah 2',
		marhalah3: 'Murid Marhalah 3',
		pria: 'Murid Pria',
		wanita: 'Murid Wanita'
	};

	// --- Insights Logic ---
	let sortedProvinces = $derived(
		[...(data.sebaranMurid || [])].sort((a, b) => (b[mapViewMode] || 0) - (a[mapViewMode] || 0))
	);

	let topProvinces = $derived(sortedProvinces.slice(0, 5).filter((p) => (p[mapViewMode] || 0) > 0));

	let nationalStats = $derived({
		total: (data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (curr.total || 0), 0),
		m1: (data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (curr.marhalah1 || 0), 0),
		m2: (data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (curr.marhalah2 || 0), 0),
		m3: (data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (curr.marhalah3 || 0), 0),
		pria: (data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (curr.pria || 0), 0),
		wanita: (data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (curr.wanita || 0), 0)
	});

	const topColors = [
		'#6366f1', // Indigo
		'#ec4899', // Pink
		'#10b981', // Emerald
		'#f59e0b', // Amber
		'#3b82f6', // Blue
		'#94a3b8'  // Others (Slate)
	];

	let modeTotal = $derived(
		(data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (Number(curr[mapViewMode]) || 0), 0)
	);

	let othersCount = $derived(
		modeTotal - topProvinces.reduce((acc, curr) => acc + (Number(curr[mapViewMode]) || 0), 0)
	);

	function calculateAge(tglLahir: string | null): number | null {
		if (!tglLahir) return null;
		const birthDate = new Date(tglLahir);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}
	
	function renderReferencedMurid(name: string | null, marhalah: number | null, qari: boolean | null) {
		if (!name) return '-';
		const isLowMarhalah = marhalah !== null && marhalah < 3;
		const isGhoiruQari = qari === false;
		
		if (isLowMarhalah || isGhoiruQari) {
			let tip = "Peringatan:";
			if (isLowMarhalah) tip += " Belum Marhalah 3.";
			if (isGhoiruQari) tip += " Ghoiru Qari.";
			
			return `
				<div class="tooltip tooltip-warning" data-tip="${tip}">
					<span class="inline-flex items-center gap-1 text-warning font-medium">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
						${name}
					</span>
				</div>
			`.trim();
		}
		return name;
	}

	let columns: ColumnDef<Murid>[] = [
		{ key: 'nama', label: 'Nama', sortable: true, filterable: 'text' },
		{ key: 'namaArab', label: 'Nama Arab', sortable: true, filterable: 'text', hidden: true },
		{
			key: 'gender',
			label: 'Gender',
			sortable: true,
			filterable: 'select',
			filterOptions: ['Pria', 'Wanita'],
			formatter: (value: boolean) => (value ? 'Pria' : 'Wanita')
		},
		{
			key: 'tglLahir',
			label: 'Umur',
			sortable: true,
			formatter: (value) => {
				const age = calculateAge(value);
				return age !== null ? `${age} tahun` : '-';
			}
		},
		{
			key: 'marhalah',
			label: 'Marhalah',
			sortable: true,
			filterable: 'select',
			filterOptions: ['1', '2', '3'],
			formatter: (value: 1 | 2 | 3) => value.toString()
		},
		{
			key: 'mursyidName',
			label: 'Mursyid',
			sortable: true,
			filterable: 'text',
			formatter: (v, row) => renderReferencedMurid(v, row.mursyidMarhalah, row.mursyidQari)
		},
		{
			key: 'baiatName',
			label: 'Baiat',
			sortable: true,
			filterable: 'text',
			formatter: (v, row) => renderReferencedMurid(v, row.marhalah, row.qari),
			hidden: true
		},
		{
			key: 'wiridName',
			label: 'Wirid',
			sortable: true,
			filterable: 'text',
			formatter: (v, row) => renderReferencedMurid(v, row.marhalah, row.qari),
			hidden: true
		},
		{ key: 'nomorTelepon', label: 'Telepon', sortable: true, filterable: 'text' },
		{
			key: 'alamat',
			label: 'Alamat',
			sortable: true,
			filterable: 'text',
			formatter: (value, row) => {
				return [value, row.deskelName, row.kecamatanName, row.kokabName, row.propinsiName]
					.filter(Boolean)
					.join(', ');
			}
		},
		{
			key: 'aktif',
			label: 'Aktif',
			sortable: true,
			filterable: 'select',
			filterOptions: ['Aktif', 'Tidak Aktif'],
			formatter: (value: boolean) => (value ? 'Aktif' : 'Tidak Aktif'),
			cellClass: (value: boolean) => (value ? 'text-success' : 'text-error')
		},
		{
			key: 'partisipasi',
			label: 'Partisipasi',
			sortable: true,
			filterable: 'select',
			filterOptions: ['Ya', 'Tidak'],
			formatter: (value: boolean) => (value ? 'Ya' : 'Tidak'),
			cellClass: (value: boolean) => (value ? 'text-success' : 'text-error')
		},
		{
			key: 'qari',
			label: 'Qari',
			sortable: true,
			filterable: 'select',
			filterOptions: ['Ya', 'Tidak'],
			formatter: (value: boolean) => (value ? 'Ya' : 'Tidak'),
			cellClass: (value: boolean) => (value ? 'text-success' : 'text-error')
		},
		{
			key: 'updatedAt',
			label: 'Terakhir Diperbarui',
			sortable: true,
			formatter: (value: string) => formatDateShort(value),
			hidden: true
		}
	];

	// --- Functions ---
	async function fetchTableData(
		sort: SortConfig[] | undefined = currentSort,
		filters: FilterState = currentFilters,
		page: number = currentPage,
		limit: number = pageSize
	) {
		loading = true;
		try {
			const response = await api('/member/pendataan/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters, page, pageSize: limit })
			});

			if (!response.ok) {
				throw new Error('Gagal mengambil data murid');
			}

			const result = await response.json();
			muridData = result.murid;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (err) {
			const error = err as Error;
			toastError(error.message || 'Tidak dapat terhubung ke server.');
		} finally {
			loading = false;
		}
	}

	async function handleSort(sort: SortConfig[] | null) {
		currentSort = sort ?? [];
		await fetchTableData(currentSort, currentFilters, currentPage, pageSize);
	}

	async function handleFilter(filters: FilterState) {
		currentFilters = filters; // Save the entire filter state
		currentPage = 1;
		await fetchTableData(currentSort, currentFilters, currentPage, pageSize);
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await fetchTableData(currentSort, currentFilters, currentPage, pageSize);
	}

	async function handleItemsPerPageChange(newSize: number) {
		pageSize = newSize;
		await fetchTableData(currentSort, currentFilters, 1, pageSize);
	}

	async function handleDeleteMurid(muridId: number, nama: string) {
		if (
			confirm(
				`Are you sure you want to delete murid "${nama}" (ID: ${muridId})? This action cannot be undone.`
			)
		) {
			try {
				const response = await api(`/member/pendataan/${muridId}/delete`, {
					method: 'POST'
				});
				if (response.ok) {
					toastSuccess('Murid berhasil dihapus.');
					invalidateAll();
				} else {
					const result = await response.json().catch(() => ({ message: response.statusText }));
					throw new Error(result.message);
				}
			} catch (err) {
				const error = err as Error;
				toastError(`Gagal menghapus murid: ${error.message}`);
			}
		}
	}

	function handleSelectionChange(selectedIds: number[]) {
		console.log('Selection changed:', selectedIds);
		selectedMuridIds = selectedIds;
	}

	function handleEditSelected() {
		if (selectedMuridIds.length === 1) {
			goto(`/member/pendataan/${selectedMuridIds[0]}/edit?from=table`);
		}
	}

	// --- Reactive Statements ---
	run(() => {
		if (form?.success) {
			alert(form.message);
			invalidateAll();
		} else if (form?.message && !form?.success) {
			alert(form.message);
		}
	});

	// Initial data fetch on component mount
	onMount(async () => {
		if (data.dbError) {
			toastError(data.message || 'Gagal memuat halaman. Coba muat ulang.');
			return;
		}
		if (canReadMurid) {
			// Use tick to ensure SuperTable onMount has run and restored state
			await tick();
			await fetchTableData(currentSort, currentFilters, currentPage, pageSize);
		}
	});
</script>

<div class="mb-6 flex flex-wrap items-center justify-between space-y-2">
	<h1 class="card-title text-2xl">Manajemen Data Murid</h1>
	<div class="flex items-center gap-2">
		<div class="tabs tabs-boxed mr-4">
			<button 
				class="tab tab-sm gap-2 {activeTab === 'table' ? 'tab-active' : ''}" 
				onclick={() => activeTab = 'table'}
			>
				<List class="h-4 w-4" /> Daftar
			</button>
			<button 
				class="tab tab-sm gap-2 {activeTab === 'map' ? 'tab-active' : ''}" 
				onclick={() => activeTab = 'map'}
			>
				<MapIcon class="h-4 w-4" /> Peta Sebaran
			</button>
		</div>
		{#if canWriteMurid}
			<a href="/member/pendataan/new" class="btn btn-primary btn-sm">
				<PlusCircle class="h-4 w-4" /> Tambah Murid Baru
			</a>
		{/if}
	</div>
</div>



{#if activeTab === 'table'}
	{#if currentFilters.columns.propinsiName}
		<div class="alert alert-warning shadow-sm mb-4 py-2 px-4 flex items-center gap-2">
			<span class="font-medium text-warning-content flex-grow">
				Filter Propinsi: <strong>{currentFilters.columns.propinsiName.value}</strong>
			</span>
			<button 
                class="cursor-pointer hover:scale-125 transition-transform text-warning-content font-bold text-xl leading-none" 
                onclick={resetFilter}
                aria-label="Reset Filter"
            >
				&times;
			</button>
		</div>
	{/if}

	<div in:fade={{ duration: 200 }}>
		<SuperTable
				data={muridData}
				{columns}
				rowKey="id"
				bind:itemsPerPageProp={pageSize}
				bind:currentPageProp={currentPage}
				totalItemsProp={totalItems}
				isLoadingProp={loading}
				bind:sort={currentSort}
				serverSide={true}
				bind:filterStateProp={currentFilters}
				onsort={handleSort}
				onfilter={handleFilter}
				onpageChange={handlePageChange}
				onitemsPerPageChange={handleItemsPerPageChange}
				onrowClick={(row) => {
					isNavigating = true;
					goto(`/member/pendataan/${row.id}`);
				}}
				onselectionChange={handleSelectionChange}
				tableClass={isNavigating ? 'blur-sm grayscale opacity-50 pointer-events-none transition-all duration-300' : 'transition-all duration-300'}
			>
				{#snippet bulkActions({ selectedIds })}
					{#if canWriteMurid && selectedIds.length === 1}
						<button class="btn btn-secondary btn-sm" onclick={handleEditSelected}>
							<Pen class="h-4 w-4" />
							Edit Selected
						</button>
					{/if}
				{/snippet}
				
				{#snippet loadingState()}
					<div class="p-8 text-center">
						<span class="loading loading-spinner mb-4"></span>
						<p class="text-lg font-semibold">Memuat data...</p>
						<p class="text-sm text-base-content/70">Harap tunggu sebentar.</p>
					</div>
				{/snippet}

				{#snippet rowActions({ row })}
					{#if canWriteMurid}
						<div class="flex gap-2">
							<a
								href={`/member/pendataan/${row.id}/edit?from=table`}
								class="btn btn-ghost btn-sm"
								onclick={stopPropagation(() => {})}
							>
								<Pen class="h-4 w-4" />
							</a>
							<button
								class="btn btn-ghost btn-sm text-error"
								onclick={stopPropagation(() => handleDeleteMurid(row.id, row.nama))}
							>
								<Trash class="h-4 w-4" />
							</button>
						</div>
					{/if}
				{/snippet}
			</SuperTable>
	</div>
{:else}
	<div in:fade={{ duration: 200 }} class="space-y-4">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div class="alert alert-info shadow-sm py-2 px-4 flex items-center gap-2 flex-1">
				<MapIcon class="h-5 w-5" />
				<span class="text-sm">Klik wilayah untuk melihat detail di tabel.</span>
			</div>

			<div class="join shadow-sm border border-base-200">
				<select 
					class="select select-sm select-bordered join-item font-bold"
					bind:value={mapViewMode}
				>
					<optgroup label="Demografi">
						<option value="total">Total Murid</option>
						<option value="pria">Pria</option>
						<option value="wanita">Wanita</option>
					</optgroup>
					<optgroup label="Marhalah">
						<option value="marhalah1">Marhalah 1</option>
						<option value="marhalah2">Marhalah 2</option>
						<option value="marhalah3">Marhalah 3</option>
					</optgroup>
				</select>
				<div class="bg-base-200 px-4 py-1 flex items-center join-item text-xs font-black uppercase opacity-50">
					Mode View
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- Map Section -->
			<div class="lg:col-span-3 space-y-4">
				<IndonesiaMap 
					data={mapData} 
					onProvinceClick={handleProvinceClick}
				/>
			</div>

			<!-- Insight Panel -->
			<div class="lg:col-span-1 space-y-3">
				<!-- National Summary (Compact) -->
				<div class="card bg-base-200 shadow-sm border border-base-300">
					<div class="card-body p-3">
						<div class="flex justify-between items-center mb-2">
							<span class="text-[10px] font-black uppercase opacity-40 tracking-widest">Nasional</span>
							<div class="badge badge-neutral badge-xs font-mono">{nationalStats.total} Murid</div>
						</div>
						<div class="flex justify-between items-center text-xs">
							<div class="flex flex-col">
								<span class="opacity-50 text-[9px] uppercase font-bold">Rasio Gender</span>
								<span class="font-black text-primary">
									{nationalStats.pria} <span class="opacity-30 mx-0.5">/</span> {nationalStats.wanita}
									<span class="text-[10px] opacity-60 font-medium ml-1">({(nationalStats.pria / (nationalStats.wanita || 1)).toFixed(1)})</span>
								</span>
							</div>
							<div class="flex gap-0.5 h-4 w-12 rounded-sm overflow-hidden bg-base-300">
								<div class="bg-blue-500" style="width: {(nationalStats.pria / (nationalStats.total || 1)) * 100}%"></div>
								<div class="bg-pink-500" style="width: {(nationalStats.wanita / (nationalStats.total || 1)) * 100}%"></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Marhalah Distribution -->
				<div class="card bg-base-100 shadow-sm border border-base-200">
					<div class="card-body p-3">
						<h3 class="card-title text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Distribusi Marhalah</h3>
						<div class="flex h-1.5 w-full rounded-full overflow-hidden bg-base-300 my-1.5">
							<div class="bg-info" style="width: {(nationalStats.m1 / (nationalStats.total || 1)) * 100}%"></div>
							<div class="bg-warning" style="width: {(nationalStats.m2 / (nationalStats.total || 1)) * 100}%"></div>
							<div class="bg-success" style="width: {(nationalStats.m3 / (nationalStats.total || 1)) * 100}%"></div>
						</div>
						<div class="grid grid-cols-3 gap-1 text-center">
							<div class="flex flex-col">
								<span class="text-[8px] font-bold opacity-50">M1</span>
								<span class="text-[10px] font-black">{((nationalStats.m1 / (nationalStats.total || 1)) * 100).toFixed(0)}%</span>
							</div>
							<div class="flex flex-col border-x border-base-content/10">
								<span class="text-[8px] font-bold opacity-50">M2</span>
								<span class="text-[10px] font-black">{((nationalStats.m2 / (nationalStats.total || 1)) * 100).toFixed(0)}%</span>
							</div>
							<div class="flex flex-col">
								<span class="text-[8px] font-bold opacity-50">M3</span>
								<span class="text-[10px] font-black">{((nationalStats.m3 / (nationalStats.total || 1)) * 100).toFixed(0)}%</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Top Regions -->
				<div class="card bg-base-100 border border-base-200 shadow-md">
					<div class="card-body p-3">
						<h3 class="card-title text-[10px] font-black uppercase tracking-tighter mb-1">
							Top 5 Wilayah
						</h3>
						
						<!-- Stacked Distribution Bar with Tooltips -->
						<div class="flex h-2 w-full rounded-sm overflow-hidden bg-base-300 mb-3">
							{#each topProvinces as p, i}
								{@const pct = ((p[mapViewMode] / (modeTotal || 1)) * 100).toFixed(1)}
								<div 
									class="tooltip tooltip-bottom h-full" 
									data-tip="{p.propinsi}: {pct}%"
									style="width: {pct}%; background-color: {topColors[i]}"
								></div>
							{/each}
							{#if othersCount > 0}
								{@const otherPct = ((othersCount / (modeTotal || 1)) * 100).toFixed(1)}
								<div 
									class="tooltip tooltip-bottom h-full opacity-50" 
									data-tip="Lainnya: {otherPct}%"
									style="width: {otherPct}%; background-color: {topColors[5]}"
								></div>
							{/if}
						</div>

						<div class="flex flex-col gap-1.5">
							{#if topProvinces.length === 0}
								<p class="text-[10px] opacity-50 italic py-2 text-center">Tidak ada data.</p>
							{:else}
								{#each topProvinces as p, i}
									{@const pct = ((p[mapViewMode] / (modeTotal || 1)) * 100).toFixed(1)}
									<button 
										class="flex items-center justify-between p-1.5 rounded bg-base-200/50 hover:bg-primary hover:text-primary-content transition-all group text-left border-l-4 tooltip tooltip-left w-full"
										style="border-left-color: {topColors[i]}"
										data-tip="Porsi: {pct}% dari total"
										onclick={() => handleProvinceClick(p.id, p.propinsi)}
									>
										<div class="flex items-center gap-2 overflow-hidden pl-1">
											<span class="text-xs font-bold truncate">{p.propinsi}</span>
										</div>
										<span class="text-[10px] font-mono font-black">{p[mapViewMode]}</span>
									</button>
								{/each}
								{#if othersCount > 0}
									<div class="flex items-center justify-between p-1.5 rounded opacity-40 text-left border-l-4 border-base-content/20 bg-base-200/30">
										<span class="text-[9px] font-bold pl-1 uppercase">Lainnya</span>
										<span class="text-[10px] font-mono">{othersCount}</span>
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</div>

				<!-- Action -->
				<button class="btn btn-primary btn-sm no-animation hover:brightness-110 border-none w-full gap-2 shadow-lg shadow-primary/20">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
					<span class="font-black uppercase tracking-tighter text-[10px]">Cetak Laporan PDF</span>
				</button>
			</div>
		</div>
	</div>
{/if}

	{#if isNavigating}
		<div class="fixed inset-0 z-[100] flex items-center justify-center bg-base-100/10 backdrop-blur-[2px]">
			<div class="flex flex-col items-center gap-4 p-8 bg-base-100 rounded-2xl shadow-2xl border border-base-200">
				<span class="loading loading-spinner loading-lg text-primary"></span>
				<p class="text-lg font-bold animate-pulse">Memuat detail murid...</p>
			</div>
		</div>
	{/if}

{#if canReadMurid && !data.dbError}
	<div class="mb-6 mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
			<div class="card-body p-4">
				<h3 class="card-title flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
					<Clock class="h-3.5 w-3.5" /> Murid Baru
				</h3>
				<div class="mt-2 flex flex-col divide-y divide-base-200">
					{#each data.recentlyAdded || [] as m}
						<a
							href="/member/pendataan/{m.id}"
							class="flex items-center justify-between py-2 transition-colors hover:text-primary"
						>
							<span class="truncate text-sm font-semibold">{m.nama}</span>
							<ChevronRight class="h-4 w-4 opacity-20" />
						</a>
					{/each}
				</div>
			</div>
		</div>

		<div class="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
			<div class="card-body p-4">
				<h3 class="card-title flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
					<RefreshCw class="h-3.5 w-3.5" /> Baru Diperbarui
				</h3>
				<div class="mt-2 flex flex-col divide-y divide-base-200">
					{#each data.recentlyUpdated || [] as m}
						<a
							href="/member/pendataan/{m.id}"
							class="flex items-center justify-between py-2 transition-colors hover:text-primary"
						>
							<div class="flex min-w-0 flex-col">
								<span class="truncate text-sm font-semibold">{m.nama}</span>
								<span class="text-[10px] opacity-50">{formatDateShort(m.updatedAt)}</span>
							</div>
							<ChevronRight class="h-4 w-4 opacity-20" />
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
