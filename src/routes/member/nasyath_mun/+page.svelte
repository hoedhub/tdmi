<script lang="ts">
	// 1. IMPORTS
	import { onMount } from 'svelte';
	import SuperTable from '$lib/components/SuperTable/SuperTable.svelte';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable/types';
	import { Edit, Trash2, PlusCircle, Calendar, Download } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { success, error } from '$lib/components/toast';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageData } from './$types';

	// 2. PROPS
	export let data: PageData;

	// 3. TYPES
	interface NasyathRow {
		id: number;
		kegiatan: string;
		tanggalMulai: string | Date;
		tanggalSelesai: string | Date | null;
		durasi: string | null;
		tempat: string | null;
		murid?: {
			nama: string | null;
		};
	}

	// 4. STATE
	let nasyathData: NasyathRow[] = [];
	let totalItems = 0;
	let loading = true;
	let dbError = false;
	let pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig[] | undefined = [
		{ key: 'murid.nama', direction: 'asc' },
		{ key: 'tanggalMulai', direction: 'desc' }
	];
	let currentFilters: FilterState = { global: '', columns: {} };
	let dateFilter: { start: string; end: string } = {
		start: '',
		end: ''
	};
	let isExporting = false;

	// 5. REACTIVE STATEMENTS
	$: columns = (() => {
		const baseColumns: ColumnDef[] = [
			{ key: 'kegiatan', label: 'النشاط', sortable: true, filterable: 'text' },
			{
				key: 'tanggalMulai',
				label: 'تاريخ البدء',
				sortable: true,
				formatter: (value: string | Date) =>
					value ? new Date(value).toLocaleDateString('id-ID') : '-'
			},
			{
				key: 'tanggalSelesai',
				label: 'تاريخ الانتهاء',
				sortable: true,
				formatter: (value: string | Date | null) =>
					value ? new Date(value).toLocaleDateString('id-ID') : '-'
			},
			{ key: 'durasi', label: 'المدة', sortable: true, filterable: 'text' },
			{ key: 'tempat', label: 'المكان', sortable: true, filterable: 'text' }
		];

		if (data && data.canReadAll) {
			return [
				{
					key: 'murid.nama',
					label: 'الاسم',
					sortable: true,
					filterable: 'text',
					formatter: (value: any, row: NasyathRow) => {
						return row.murid?.nama || 'N/A';
					}
				} as ColumnDef<NasyathRow>,
				...baseColumns
			];
		}
		return baseColumns;
	})();

	// 6. FUNCTIONS
	async function fetchNasyathData(
		sort?: SortConfig[] | null,
		filters?: FilterState,
		page: number = 1
	) {
		loading = true;
		dbError = false;
		try {
			const response = await fetch('/member/nasyath_mun/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sort,
					filters: {
						...filters,
						dateRange: dateFilter
					},
					page,
					pageSize
				})
			});

			if (!response.ok) throw new Error('Gagal memuat data nasyath');

			const result = await response.json();
			nasyathData = result.data;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (err) {
			console.error('Error fetching nasyath data:', err);
			dbError = true;
			error('Gagal memuat data dari server.');
		} finally {
			loading = false;
		}
	}

	function applyDateFilter() {
		fetchNasyathData(currentSort, currentFilters, 1);
	}

	function resetDateFilter() {
		dateFilter.start = '';
		dateFilter.end = '';
		applyDateFilter();
	}

	async function handleSort(event: CustomEvent<SortConfig[] | null>) {
		currentSort = event.detail ?? undefined;
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = event.detail;
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}

	async function handleItemsPerPageChange(event: CustomEvent<number>) {
		pageSize = event.detail;
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	function handleEdit(id: number) {
		goto(`/member/nasyath_mun/${id}/edit`);
	}

	function handleDeleteSubmit() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'redirect') {
				success('Data berhasil dihapus.');
				await fetchNasyathData(currentSort, currentFilters, currentPage);
			} else if (result.type === 'error' && result.error) {
				error(result.error.message || 'Gagal menghapus data.');
			}
		};
	}

	const handleSubmit = (e: Event) => {
		if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
			e.preventDefault();
		}
	};

	async function handleExport() {
		if (isExporting) return;
		isExporting = true;

		try {
			const response = await fetch('/member/nasyath_mun/export', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort: currentSort, filters: currentFilters })
			});

			if (!response.ok) {
				throw new Error(await response.text());
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			const contentDisposition = response.headers.get('content-disposition');
			let fileName = 'nasyath_export.xlsx';
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="?([^"]+)"?/);
				if (match && match[1]) {
					fileName = match[1];
				}
			}
			a.download = fileName;
			document.body.appendChild(a);
a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
			success('Data berhasil diekspor!');
		} catch (e: any) {
			console.error('Error exporting data:', e);
			error(`Gagal mengekspor data: ${e.message}`);
		} finally {
			isExporting = false;
		}
	}

	// 7. LIFECYCLE
	onMount(() => {
		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth();

		const startDate = new Date(year, month, 1);
		const endDate = new Date(year, month + 1, 0);

		const formatDate = (d: Date) => {
			const y = d.getFullYear();
			const m = (d.getMonth() + 1).toString().padStart(2, '0');
			const day = d.getDate().toString().padStart(2, '0');
			return `${y}-${m}-${day}`;
		};

		dateFilter.start = formatDate(startDate);
		dateFilter.end = formatDate(endDate);

		fetchNasyathData(currentSort, currentFilters, currentPage);
	});
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl font-bold">قائمة أنشطتي الدعوية</h1>
		<div class="flex items-center gap-2">
			<button class="btn btn-secondary btn-sm" on:click={handleExport} disabled={isExporting}>
				<Download class="h-4 w-4" />
				{#if isExporting}
					Mengekspor...
				{:else}
					Export ke Excel
				{/if}
			</button>
			<a href="/member/nasyath_mun/new" class="btn btn-primary btn-sm">
				<PlusCircle class="h-4 w-4" /> Tambah Baru
			</a>
		</div>
	</div>

	<SuperTable
		data={nasyathData}
		{columns}
		rowKey="id"
		serverSide={true}
		isSelectable={true}
		isLoadingProp={loading}
		{dbError}
		itemsPerPageProp={pageSize}
		totalItemsProp={totalItems}
		sort={currentSort}
		on:sort={handleSort}
		on:filter={handleFilter}
		on:pageChange={handlePageChange}
		on:itemsPerPageChange={handleItemsPerPageChange}
		><svelte:fragment slot="custom-filters">
			<div class="flex items-end gap-2">
				<!-- Filter Tanggal Mulai -->
				<div class="form-control">
					<label for="startDate" class="label pb-1">
						<span class="label-text">Dari Tanggal</span>
					</label>
					<input
						type="date"
						id="startDate"
						bind:value={dateFilter.start}
						class="input input-sm input-bordered w-full max-w-xs"
					/>
				</div>

				<!-- Filter Tanggal Selesai -->
				<div class="form-control">
					<label for="endDate" class="label pb-1">
						<span class="label-text">Hingga Tanggal</span>
					</label>
					<input
						type="date"
						id="endDate"
						bind:value={dateFilter.end}
						class="input input-sm input-bordered w-full max-w-xs"
					/>
				</div>

				<!-- Tombol Apply & Reset -->
				<div class="flex items-center gap-1">
					<button class="btn btn-primary btn-sm" on:click={applyDateFilter}> Filter </button>
					<button class="btn btn-ghost btn-sm" on:click={resetDateFilter}> Reset </button>
				</div>
			</div>
		</svelte:fragment>
		<!-- Slot untuk aksi per baris (Edit & Hapus) -->
		<div slot="row-actions" let:row class="flex items-center gap-1">
			<button
				class="btn btn-ghost btn-xs"
				aria-label="Edit item"
				on:click={() => handleEdit(row.id)}
			>
				<Edit class="h-4 w-4" />
			</button>

			<!-- Formulir untuk aksi Hapus -->
			<form
				method="POST"
				action={`/member/nasyath_mun/${row.id}/delete`}
				use:enhance={handleDeleteSubmit}
				on:submit|preventDefault={handleSubmit}
			>
				<button type="submit" class="btn btn-ghost btn-xs text-error" aria-label="Delete item">
					<Trash2 class="h-4 w-4" />
				</button>
			</form>
		</div>
	</SuperTable>
</div>
