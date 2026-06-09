<script lang="ts">
	import { run } from 'svelte/legacy';

	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { PlusCircle, List, Map as MapIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';
	import { formatDateShort } from '$lib/utils/date';
	import IndonesiaMap from '$lib/components/charts/IndonesiaMap.svelte';
	import { fade } from 'svelte/transition';

	// Local Components
	import MuridTableSection from './components/MuridTableSection.svelte';
	import MuridInsightPanel from './components/MuridInsightPanel.svelte';
	import RecentActivityCards from './components/RecentActivityCards.svelte';
	import MuridPrintReport from './components/MuridPrintReport.svelte';

	// --- Type Definitions ---
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
		gender: boolean;
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
	let selectedMuridIds = $state<number[]>([]);
	let isGeneratingPDF = $state(false);
	let mapSvgHtml = $state('');
	let mapPaths = $state<any[]>([]);

	// --- Reactive Data from Props ---
	let canReadMurid = $derived(data.canReadMurid);
	let canWriteMurid = $derived(data.canWriteMurid);

	async function handleProvinceClick(id: number, name: string) {
		activeTab = 'table';
		if (!currentFilters.columns) {
			currentFilters.columns = {};
		}
		currentFilters.columns.propinsiName = { value: name, operator: 'contains' };
		await tick();
		await fetchTableData(currentSort, currentFilters, 1, pageSize);
		window.scrollTo({ top: 0, behavior: 'smooth' });
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

	const topColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#94a3b8'];

	let modeTotal = $derived(
		(data.sebaranMurid || []).reduce((acc: number, curr: any) => acc + (Number(curr[mapViewMode]) || 0), 0)
	);

	let othersCount = $derived(
		modeTotal - topProvinces.reduce((acc, curr) => acc + (Number(curr[mapViewMode]) || 0), 0)
	);

	async function downloadPDF() {
		isGeneratingPDF = true;
		await tick();

		// Wait for the report component to be rendered in the hidden div
		const element = document.getElementById('murid-pdf-report');
		if (!element) {
			toastError('Gagal menyiapkan dokumen laporan.');
			isGeneratingPDF = false;
			return;
		}

		// Dynamically import html2pdf
		const html2pdf = (await import('html2pdf.js')).default;

		const opt = {
			margin: 10,
			filename: `Laporan-Sebaran-TDMI-${mapViewMode}-${new Date().getTime()}.pdf`,
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: { 
				scale: 2, 
				useCORS: true, 
				logging: false,
                onclone: (clonedDoc: Document) => {
                    const styles2 = clonedDoc.querySelectorAll('style');
                    styles2.forEach(s => {
                        if (s.textContent && s.textContent.includes('oklch')) {
                            s.textContent = s.textContent.replace(/oklch\([^)]*\)/g, '#3b82f6');
                            s.textContent = s.textContent.replace(/color-mix\(in oklch,\s*[^,]+,\s*[^)]+\)/g, '#94a3b8');
                        }
                    });
                    const allElements = clonedDoc.querySelectorAll('[style]');
                    allElements.forEach(el => {
                        const style = el.getAttribute('style');
                        if (style && style.includes('oklch')) {
                            el.setAttribute('style', style.replace(/oklch\([^)]*\)/g, '#3b82f6').replace(/color-mix\(in oklch,\s*[^,]+,\s*[^)]+\)/g, '#94a3b8'));
                        }
                    });
                    const paths = clonedDoc.querySelectorAll('path');
                    paths.forEach(path => {
                        let d = path.getAttribute('d');
                        if (d && d.includes('NaN')) {
                            path.setAttribute('d', d.replace(/NaN\w*/g, '0'));
                        }
                    });
                }
			},
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
		};

		try {
			await html2pdf().set(opt).from(element).save();
			toastSuccess('Laporan PDF berhasil diunduh.');
		} catch (err) {
			console.error('PDF Generation Error:', err);
			toastError('Terjadi kesalahan saat membuat PDF.');
		} finally {
			isGeneratingPDF = false;
		}
	}

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
		if (form?.success) {
			alert(form.message);
			invalidateAll();
		} else if (form?.message && !form?.success) {
			alert(form.message);
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

<div class="mb-6 flex flex-wrap items-center justify-between space-y-2">
	<h1 class="card-title text-2xl">Manajemen Data Murid</h1>
	<div class="flex items-center gap-2">
		<div class="tabs tabs-boxed mr-4">
			<button class="tab tab-sm gap-2 {activeTab === 'table' ? 'tab-active' : ''}" onclick={() => (activeTab = 'table')}>
				<List class="h-4 w-4" /> Daftar
			</button>
			<button class="tab tab-sm gap-2 {activeTab === 'map' ? 'tab-active' : ''}" onclick={() => (activeTab = 'map')}>
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
		<div class="alert alert-warning mb-4 flex items-center gap-2 py-2 px-4 shadow-sm">
			<span class="flex-grow font-medium text-warning-content">
				Filter Propinsi: <strong>{currentFilters.columns.propinsiName.value}</strong>
			</span>
			<button class="cursor-pointer text-xl font-bold leading-none text-warning-content transition-transform hover:scale-125" onclick={resetFilter} aria-label="Reset Filter">
				&times;
			</button>
		</div>
	{/if}

	<MuridTableSection
		{muridData}
		{columns}
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
					{mapLabels}
					{topColors}
					onProvinceClick={handleProvinceClick}
					onDownloadPDF={downloadPDF}
					{isGeneratingPDF}
				/>
			</div>
		</div>
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
			{mapLabels}
			{topColors}
			paths={mapPaths.map(p => ({ ...p, d: p.d.replace(/NaN/g, '0') }))}
			{mapData}
		/>
	{/if}
</div>

