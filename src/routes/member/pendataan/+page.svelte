<script lang="ts">
	import { run } from 'svelte/legacy';

	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { PlusCircle, List, Map as MapIcon, Printer, FileDown, FileUp, FileSpreadsheet } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { page } from '$app/stores';
	import { tablePersistence } from '$lib/stores/tablePersistence.svelte';
	import { error as toastError, success as toastSuccess, loading as showLoadingToast, update as updateToast } from '$lib/components/toast';

	import IndonesiaMap from '$lib/components/charts/IndonesiaMap.svelte';
	import { fade } from 'svelte/transition';

	// Local Components
	import MuridTableSection from './components/MuridTableSection.svelte';
	import MuridInsightPanel from './components/MuridInsightPanel.svelte';
	import RecentActivityCards from './components/RecentActivityCards.svelte';
	import MuridPrintReport from './components/MuridPrintReport.svelte';

	// Config & Actions
	import { MURID_COLUMNS, type Murid } from './config/columns';
	import { MAP_LABELS, TOP_COLORS, PROVINCE_PAGE_SIZE, type MapViewMode } from './config/constants';
	import { printMuridTable } from './actions/printTable';
	import { downloadMuridPDF } from './actions/downloadPDF';
	import { exportMuridToXLSX } from './actions/exportExcel';

	// --- Type Definitions ---
	type ExtendedPageData = PageData & {
		dbError: boolean;
		message?: string;
	};

	interface Props {
		data: ExtendedPageData;
		form: { success?: boolean; message?: string } | null;
	}

	let { data, form }: Props = $props();

	let muridData: Murid[] = $state([]);
	let totalItems = $state(data.totalItems);
	let isNavigating = $state(false);
	let activeTab = $state<'table' | 'map'>('table');
	let mapViewMode = $state<MapViewMode>('total');

	let loading = $state(false);
	let pageSize = $state(10);
	let currentPage = $state(1);
	let currentSort: SortConfig[] = $state([]);
	let currentFilters: FilterState = $state({ columns: {} });
	let selectedMuridIds = $state<number[]>([]);
	let isGeneratingPDF = $state(false);
	let mapSvgHtml = $state('');
	let mapPaths = $state<any[]>([]);
	let selectedProvince = $state<{ id: number; name: string } | null>(null);
	let provinceData: any[] = $state([]);
	let provinceLoading = $state(false);
	let provinceTotalItems = $state(0);
	let provincePage = $state(1);
	let lastFetchedProvinceName: string | null = null;
	let tableNeedsRefresh = $state(false);
	let loadingPrint = $state(false);

	// --- Reactive Data from Props ---
	let canReadMurid = $derived(data.canReadMurid);
	let canWriteMurid = $derived(data.canWriteMurid);

	let selectedProvinceStats = $derived(
		(() => {
			const sp = selectedProvince;
			return sp
				? (data.sebaranMurid || []).find(
						(p) => p.propinsi.toUpperCase() === sp.name.toUpperCase()
				  ) ?? null
				: null;
		})()
	);

	async function handleProvinceClick(id: number, name: string) {
		selectedProvince = { id, name };
		if (!currentFilters.columns) {
			currentFilters.columns = {};
		}
		currentFilters.columns.propinsiName = { value: name, operator: 'contains' };
		provincePage = 1;
		await fetchProvinceData(1);
	}

	async function fetchProvinceData(page: number) {
		provinceLoading = true;
		provincePage = page;
		try {
			const provinceFilters: FilterState = currentFilters.columns?.propinsiName
				? { columns: { propinsiName: currentFilters.columns.propinsiName } }
				: { columns: {} };
			const response = await api('/member/pendataan/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sort: [],
					filters: provinceFilters,
					page,
					pageSize: PROVINCE_PAGE_SIZE
				})
			});
			if (!response.ok) throw new Error('Gagal mengambil data');
			const result = await response.json();
			provinceData = result.murid;
			provinceTotalItems = result.totalItems;
		} catch (err) {
			const error = err as Error;
			toastError(error.message || 'Gagal memuat data provinsi.');
			provinceData = [];
		} finally {
			provinceLoading = false;
		}
	}

	function deselectProvince() {
		selectedProvince = null;
		provinceData = [];
		provinceTotalItems = 0;
		tableNeedsRefresh = true;
		if (currentFilters.columns) {
			delete currentFilters.columns.propinsiName;
		}
		// Hapus persistence agar SuperTable tidak restore filter lama saat dibuat ulang
		tablePersistence.saveState($page.url.pathname, {
			currentPage: 1,
			itemsPerPage: pageSize,
			filterState: { columns: {} },
			sort: [],
			baseArea: '/member/pendataan'
		});
	}

	function applyProvinceFilter() {
		currentFilters = { columns: { propinsiName: currentFilters.columns?.propinsiName } };
		currentPage = 1;
		fetchTableData(currentSort, currentFilters, 1, pageSize);
	}

	function viewProvinceInTable() {
		activeTab = 'table';
		const provinceName = currentFilters.columns?.propinsiName?.value;
		lastFetchedProvinceName = provinceName ?? null;
		applyProvinceFilter();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function removeProvinceFilter() {
		deselectProvince();
		lastFetchedProvinceName = null;
		fetchTableData(currentSort, currentFilters, currentPage, pageSize);
	}

	function switchToTable() {
		const hadProvinceFilter = !!currentFilters.columns?.propinsiName;
		const provinceName = currentFilters.columns?.propinsiName?.value;
		activeTab = 'table';
		currentPage = 1;
		if (hadProvinceFilter) {
			if (provinceName !== lastFetchedProvinceName) {
				lastFetchedProvinceName = provinceName ?? null;
				applyProvinceFilter();
			}
		} else if (tableNeedsRefresh) {
			tableNeedsRefresh = false;
			fetchTableData(currentSort, currentFilters, 1, pageSize);
		}
	}

	async function resetFilter() {
		currentFilters = { columns: {} };
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

	let modeTotal = $derived(
		(data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (Number(curr[mapViewMode]) || 0), 0)
	);

	let othersCount = $derived(
		modeTotal - topProvinces.reduce((acc, curr) => acc + (Number(curr[mapViewMode]) || 0), 0)
	);

	async function downloadPDF() {
		isGeneratingPDF = true;
		await tick();
		const element = document.getElementById('murid-pdf-report');
		if (!element) {
			toastError('Gagal menyiapkan dokumen laporan.');
			isGeneratingPDF = false;
			return;
		}
		try {
			await downloadMuridPDF(element, `Laporan-Sebaran-TDMI-${mapViewMode}`);
			toastSuccess('Laporan PDF berhasil diunduh.');
		} catch (err) {
			console.error('PDF Generation Error:', err);
			toastError('Terjadi kesalahan saat membuat PDF.');
		} finally {
			isGeneratingPDF = false;
		}
	}

	async function printTable() {
		loadingPrint = true;
		const toastId = showLoadingToast('Memuat semua data untuk dicetak...', { duration: 0 });
		try {
			await printMuridTable({ sort: currentSort, filters: currentFilters, columns: MURID_COLUMNS, api });
			updateToast(toastId, { type: 'success', message: 'Data siap dicetak.', duration: 300 });
		} catch (err) {
			const error = err as Error;
			updateToast(toastId, { type: 'error', message: `Gagal: ${error.message}`, duration: 5000 });
		} finally {
			loadingPrint = false;
		}
	}

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
		currentFilters = filters;
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
		if (confirm(`Are you sure you want to delete murid "${nama}" (ID: ${muridId})? This action cannot be undone.`)) {
			try {
				const response = await api(`/member/pendataan/${muridId}/delete`, { method: 'POST' });
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
		selectedMuridIds = selectedIds;
	}

	function handleEditSelected() {
		if (selectedMuridIds.length === 1) {
			goto(`/member/pendataan/${selectedMuridIds[0]}/edit?from=table`);
		}
	}

	run(() => {
		if (form?.success && form.message) {
			toastSuccess(form.message);
			invalidateAll();
		} else if (form?.message && !form?.success) {
			toastError(form.message);
		}
	});

	onMount(async () => {
		// Fetch map paths for sharing with PDF component
		try {
			const res = await fetch('/indonesia-paths.json');
			mapPaths = await res.json();
		} catch (e) {
			console.error('Failed to pre-load map paths:', e);
		}

		if (data.dbError) {
			toastError(data.message || 'Gagal memuat halaman. Coba muat ulang.');
			return;
		}
		if (canReadMurid) {
			await tick();
			await fetchTableData(currentSort, currentFilters, currentPage, pageSize);
		}
	});
</script>

<div class="mb-6 flex flex-wrap items-center justify-between gap-2">
	<h1 class="card-title text-2xl">Manajemen Data Murid</h1>
	<div class="flex items-center gap-1 sm:gap-2">
		<div class="flex items-center gap-1 rounded-lg bg-base-200 p-1">
			<button class="btn btn-sm btn-circle btn-ghost {activeTab === 'table' ? 'btn-active' : ''}" onclick={switchToTable} title="Daftar">
				<List class="h-4 w-4" />
			</button>
			<button class="btn btn-sm btn-circle btn-ghost {activeTab === 'map' ? 'btn-active' : ''}" onclick={() => (activeTab = 'map')} title="Peta Sebaran">
				<MapIcon class="h-4 w-4" />
			</button>
		</div>
		{#if canWriteMurid}
			<a href="/member/pendataan/new" class="btn btn-primary btn-sm btn-circle" title="Tambah Murid Baru">
				<PlusCircle class="h-4 w-4" />
			</a>
		{/if}
		{#if activeTab === 'table'}
			<div class="dropdown sm:dropdown-end">
				<button class="btn btn-ghost btn-sm" title="Ekspor / Impor">
					<FileDown class="h-4 w-4" />
				</button>
				<ul class="dropdown-content menu bg-base-100 rounded-box z-[60] w-56 p-2 shadow-sm">
					<li><button onclick={() => exportMuridToXLSX()} class="flex items-center gap-2"><FileDown class="h-4 w-4" /> Ekspor Excel</button></li>
					<li><a href="/member/pendataan/template" class="flex items-center gap-2"><FileSpreadsheet class="h-4 w-4" /> Download Template</a></li>
					<li class="menu-divider my-1 h-px bg-base-300"></li>
					<li><a href="/member/pendataan/import" class="flex items-center gap-2"><FileUp class="h-4 w-4" /> Import Excel</a></li>
				</ul>
			</div>
			<button class="btn btn-ghost btn-sm" onclick={printTable} disabled={loadingPrint} title="Cetak Tabel">
				<Printer class="h-4 w-4" />
			</button>
		{/if}
	</div>
</div>

{#if activeTab === 'table'}
	{#if currentFilters.columns.propinsiName}
		<div class="alert alert-warning mb-4 flex items-center gap-2 py-2 px-4 shadow-sm">
			<span class="flex-grow font-medium text-warning-content">
				Filter Propinsi: <strong>{currentFilters.columns.propinsiName.value}</strong>
			</span>
			<button class="cursor-pointer text-xl font-bold leading-none text-warning-content transition-transform hover:scale-125" onclick={removeProvinceFilter} aria-label="Hapus Filter Propinsi">
				&times;
			</button>
		</div>
	{/if}

	<MuridTableSection
		{muridData}
		columns={MURID_COLUMNS}
		bind:pageSize
		bind:currentPage
		{totalItems}
		loading={loading}
		bind:currentSort
		bind:currentFilters
		{canWriteMurid}
		{isNavigating}
		onsort={handleSort}
		onfilter={handleFilter}
		onpageChange={handlePageChange}
		onitemsPerPageChange={handleItemsPerPageChange}
		ondelete={handleDeleteMurid}
		oneditSelected={handleEditSelected}
		{selectedMuridIds}
		onselectionChange={handleSelectionChange}
	/>
{:else}
	<div in:fade={{ duration: 200 }} class="space-y-4">
		<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<div class="alert alert-info flex flex-1 items-center gap-2 py-2 px-4 shadow-sm">
				<MapIcon class="h-5 w-5" />
				<span class="text-sm">Klik wilayah untuk melihat detail di tabel.</span>
			</div>

			<div class="join border border-base-200 shadow-sm">
				<select class="join-item select select-bordered select-sm font-bold" bind:value={mapViewMode}>
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
				<div class="join-item flex items-center bg-base-200 px-4 py-1 text-xs font-black uppercase opacity-50">
					Mode View
				</div>
			</div>
		</div>

		{#if selectedProvince}
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
				<div class="lg:col-span-3">
					<IndonesiaMap
						data={mapData}
						onProvinceClick={handleProvinceClick}
						paths={mapPaths}
						selectedProvince={selectedProvince.name}
					/>
				</div>
				<div class="lg:col-span-1">
					<div class="card border border-base-300 bg-base-200 shadow-sm">
						<div class="card-body p-3">
							<div class="mb-2 flex items-center justify-between">
								<span class="text-[10px] font-black uppercase tracking-widest opacity-40">Wilayah</span>
								<button class="btn btn-ghost btn-xs btn-circle" onclick={deselectProvince} aria-label="Tutup">
									&times;
								</button>
							</div>
							<div class="font-black text-lg leading-tight">{selectedProvince.name}</div>

							{#if selectedProvinceStats}
								<div class="stats stats-vertical bg-base-100 shadow-sm mt-2">
									<div class="stat px-2 py-1">
										<div class="stat-title text-[8px]">Total Murid</div>
										<div class="stat-value text-lg">{selectedProvinceStats.total}</div>
									</div>
									<div class="stat px-2 py-1">
										<div class="stat-title text-[8px]">Marhalah</div>
										<div class="stat-value text-lg flex items-center gap-2">
											<span class="text-info">{selectedProvinceStats.marhalah1}</span>
											<span class="text-warning">{selectedProvinceStats.marhalah2}</span>
											<span class="text-success">{selectedProvinceStats.marhalah3}</span>
										</div>
									</div>
									<div class="stat px-2 py-1">
										<div class="stat-title text-[8px]">Rasio P/W</div>
										<div class="stat-value text-lg">
											{selectedProvinceStats.pria}<span class="mx-0.5 opacity-30">/</span>{selectedProvinceStats.wanita}
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div class="card border border-base-300 bg-base-100 shadow-sm mt-4">
				<div class="card-body p-3">
					<div class="flex items-center justify-between mb-3">
						<div>
							<span class="text-[10px] font-black uppercase tracking-widest opacity-40">Data Murid</span>
							<span class="text-sm font-black ml-2">{selectedProvince.name}</span>
							{#if !provinceLoading}
								<span class="text-xs opacity-50 ml-1">({provinceTotalItems} murid)</span>
							{/if}
						</div>
						<div class="flex gap-2">
							<button class="btn btn-ghost btn-xs" onclick={deselectProvince}>Tutup</button>
							<button class="btn btn-primary btn-xs" onclick={viewProvinceInTable}>Lihat Semua</button>
						</div>
					</div>

					{#if provinceLoading}
						<div class="flex justify-center py-8">
							<span class="loading loading-spinner loading-md text-primary"></span>
						</div>
					{:else if provinceData.length === 0}
						<p class="py-4 text-center text-sm opacity-50 italic">Tidak ada data murid di provinsi ini.</p>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-sm">
								<thead>
									<tr>
										<th>Nama</th>
										<th class="hidden sm:table-cell"> Gender</th>
										<th class="hidden md:table-cell">Marhalah</th>
										<th class="hidden lg:table-cell">Daerah</th>
									</tr>
								</thead>
								<tbody>
									{#each provinceData as m}
										<tr class="hover">
											<td class="font-bold">{m.nama}</td>
											<td class="hidden sm:table-cell">{m.gender ? 'Pria' : 'Wanita'}</td>
											<td class="hidden md:table-cell">M{m.marhalah}</td>
											<td class="hidden lg:table-cell text-xs opacity-60">{m.kokabName ?? '-'}</td>
										</tr>
									{:else}
										<tr><td colspan="4" class="text-center text-sm opacity-50 py-8">Tidak ada data murid di provinsi ini.</td></tr>
									{/each}
								</tbody>
							</table>
						</div>

						{#if provinceTotalItems > PROVINCE_PAGE_SIZE}
							<div class="flex justify-center gap-2 mt-3">
								<button
									class="btn btn-ghost btn-xs"
									disabled={provincePage <= 1}
									onclick={() => fetchProvinceData(provincePage - 1)}
								>
									Sebelumnya
								</button>
								<span class="text-xs self-center opacity-50">
									Halaman {provincePage} dari {Math.ceil(provinceTotalItems / PROVINCE_PAGE_SIZE)}
								</span>
								<button
									class="btn btn-ghost btn-xs"
									disabled={provincePage >= Math.ceil(provinceTotalItems / PROVINCE_PAGE_SIZE)}
									onclick={() => fetchProvinceData(provincePage + 1)}
								>
									Selanjutnya
								</button>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
				<div class="space-y-4 lg:col-span-3">
					<IndonesiaMap data={mapData} onProvinceClick={handleProvinceClick} paths={mapPaths} />
				</div>
				<div class="lg:col-span-1">
					<MuridInsightPanel
						{nationalStats}
						{topProvinces}
						{modeTotal}
						{othersCount}
						{mapViewMode}
						mapLabels={MAP_LABELS}
						topColors={TOP_COLORS}
						onProvinceClick={handleProvinceClick}
						onDownloadPDF={downloadPDF}
						{isGeneratingPDF}
					/>
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if isNavigating}
	<div class="fixed inset-0 z-[100] flex items-center justify-center bg-base-100/10 backdrop-blur-[2px]">
		<div class="flex flex-col items-center gap-4 rounded-2xl border border-base-200 bg-base-100 p-8 shadow-2xl">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="animate-pulse text-lg font-bold">Memuat detail murid...</p>
		</div>
	</div>
{/if}

{#if canReadMurid && !data.dbError}
	<RecentActivityCards recentlyAdded={data.recentlyAdded} recentlyUpdated={data.recentlyUpdated} />
{/if}

<!-- HIDDEN PDF REPORT TEMPLATE -->
<div class="hidden">
	{#if isGeneratingPDF}
		<MuridPrintReport
			{nationalStats}
			{topProvinces}
			{modeTotal}
			{othersCount}
			{mapViewMode}
			mapLabels={MAP_LABELS}
			topColors={TOP_COLORS}
			paths={mapPaths.map(p => ({ ...p, d: p.d.replace(/NaN/g, '0') }))}
			{mapData}
		/>
	{/if}
</div>



