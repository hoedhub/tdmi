<script lang="ts">
	import { run, stopPropagation } from 'svelte/legacy';

	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { Pen, Trash, PlusCircle, Clock, RefreshCw, ChevronRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { DatabaseUserAttributes } from '$lib/server/auth';
	import { api } from '$lib/utils/api';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';
	import { formatDateShort } from '$lib/utils/date';

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

	let loading = $state(false);
	let pageSize = $state(10);
	let currentPage = $state(1);
	let currentSort: SortConfig[] = $state([]);
	let currentFilters: FilterState = $state({ columns: {} });
	let selectedMuridIds: number[] = [];

	// --- Reactive Data from Props ---
	let canReadMurid = $derived(data.canReadMurid);
	let canWriteMurid = $derived(data.canWriteMurid);

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
			formatter: (v, row) => renderReferencedMurid(v, row.baiatMarhalah, row.baiatQari),
			hidden: true
		},
		{
			key: 'wiridName',
			label: 'Wirid',
			sortable: true,
			filterable: 'text',
			formatter: (v, row) => renderReferencedMurid(v, row.wiridMarhalah, row.wiridQari),
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
	{#if canWriteMurid}
		<a href="/member/pendataan/new" class="btn btn-primary btn-sm">
			<PlusCircle class="h-4 w-4" /> Tambah Murid Baru
		</a>
	{/if}
</div>



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
		class={isNavigating ? 'blur-sm grayscale opacity-50 pointer-events-none transition-all duration-300' : 'transition-all duration-300'}
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
