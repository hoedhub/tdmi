<script lang="ts">
	import { onMount } from 'svelte';
	import SuperTable from '$lib/components/SuperTable/SuperTable.svelte';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable/types';
	import type { PageData } from './$types';
	import { Edit, Trash2, PlusCircle } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { success, error } from '$lib/components/toast';
	import type { ActionResult } from '@sveltejs/kit';

	export let data: PageData;

	// --- State untuk SuperTable Server-Side ---
	let nasyathData: any[] = [];
	let totalItems = 0;
	let loading = true;
	let dbError = false;
	const pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig | undefined = { key: 'tanggalMulai', direction: 'desc' };
	let currentFilters: FilterState = { global: '', columns: {} };

	// --- Definisi Kolom ---
	const columns: ColumnDef[] = [
		{ key: 'kegiatan', label: 'النشاط', sortable: true, filterable: 'text' },
		{
			key: 'tanggalMulai',
			label: 'تاريخ البدء',
			sortable: true,
			formatter: (value) => (value ? new Date(value).toLocaleDateString('id-ID') : '-')
		},
		{
			key: 'tanggalSelesai',
			label: 'تاريخ الانتهاء',
			sortable: true,
			formatter: (value) => (value ? new Date(value).toLocaleDateString('id-ID') : '-')
		},
		{ key: 'durasi', label: 'المدة', sortable: true, filterable: 'text' },
		{ key: 'tempat', label: 'المكان', sortable: true, filterable: 'text' }
	];

	// --- Fungsi Pengambilan Data ---
	async function fetchNasyathData(
		sort?: SortConfig | null,
		filters?: FilterState,
		page: number = 1
	) {
		loading = true;
		dbError = false;
		try {
			const response = await fetch('/member/nasyath_mun/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters, page, pageSize })
			});

			if (!response.ok) throw new Error('Gagal memuat data nasyath');

			const result = await response.json();
			nasyathData = result.data;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (e) {
			console.error('Error fetching nasyath data:', e);
			dbError = true;
			error('Gagal memuat data dari server.');
		} finally {
			loading = false;
		}
	}

	// --- Event Handlers untuk SuperTable ---
	async function handleSort(event: CustomEvent<SortConfig | null>) {
		currentSort = event.detail ?? undefined;
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = event.detail;
		await fetchNasyathData(currentSort, currentFilters, 1); // Reset ke halaman 1
	}

	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}

	// --- Event Handlers untuk Aksi Baris ---
	function handleEdit(id: number) {
		goto(`/member/nasyath_mun/${id}/edit`);
	}

	function handleDeleteSubmit() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'redirect') {
				success('Data berhasil dihapus.');
				// InvalidateAll akan memicu load ulang, tapi kita panggil fetch manual
				// untuk pengalaman yang lebih cepat.
				await fetchNasyathData(currentSort, currentFilters, currentPage);
			} else if (result.type === 'error') {
				error(result.error.message || 'Gagal menghapus data.');
			}
		};
	}

	// --- Lifecycle ---
	onMount(() => {
		fetchNasyathData(currentSort, currentFilters, currentPage);
	});
</script>

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl font-bold">قائمة أنشطتي الدعوية</h1>
		<a href="/member/nasyath_mun/new" class="btn btn-primary btn-sm">
			<PlusCircle class="h-4 w-4" /> Tambah Baru
		</a>
	</div>

	<SuperTable
		data={nasyathData}
		{columns}
		rowKey="id"
		serverSide={true}
		isSelectable={true}
		isLoading={loading}
		dbError={dbError}
		itemsPerPageProp={pageSize}
		totalItemsProp={totalItems}
		initialSort={currentSort}
		on:sort={handleSort}
		on:filter={handleFilter}
		on:pageChange={handlePageChange}
	>
		<!-- Slot untuk aksi per baris (Edit & Hapus) -->
		<div slot="row-actions" let:row class="flex items-center gap-1">
			<button class="btn btn-xs btn-ghost" aria-label="Edit item" on:click={() => handleEdit(row.id)}>
				<Edit class="h-4 w-4" />
			</button>

			<!-- Formulir untuk aksi Hapus -->
			<form
				method="POST"
				action="/member/nasyath_mun/{row.id}/delete"
				use:enhance={handleDeleteSubmit}
				on:submit|preventDefault={(e) => {
					if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
						e.preventDefault();
					}
				}}
			>
				<button type="submit" class="btn btn-xs btn-ghost text-error" aria-label="Delete item">
					<Trash2 class="h-4 w-4" />
				</button>
			</form>
		</div>
	</SuperTable>
</div>
