<script lang="ts">
	import { onMount } from 'svelte';
	import SuperTable from '$lib/components/SuperTable/SuperTable.svelte';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable/types';
	import { Edit, Trash2, PlusCircle, Calendar } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { success, error } from '$lib/components/toast';
	import type { ActionResult } from '@sveltejs/kit';

	// PERBAIKAN: Definisikan tipe untuk baris data Anda
	interface NasyathRow {
		id: number;
		kegiatan: string;
		tanggalMulai: string | Date;
		tanggalSelesai: string | Date | null;
		durasi: string | null;
		tempat: string | null;
		murid?: {
			// Dari Opsi A (dengan relasi)
			nama: string | null;
		};
		namaMurid?: string | null; // Dari Opsi B (join manual)
	}

	// --- State untuk SuperTable Server-Side ---
	let nasyathData: NasyathRow[] = []; // Gunakan tipe yang sudah didefinisikan
	let totalItems = 0;
	let loading = true;
	let dbError = false;
	let pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig | undefined = { key: 'tanggalMulai', direction: 'desc' };
	let currentFilters: FilterState = { global: '', columns: {} };
	let dateFilter: { start: string; end: string } = {
		start: '',
		end: ''
	};

	// --- Definisi Kolom ---
	const columns: ColumnDef[] = [
		// Tambahkan kolom baru di posisi yang Anda inginkan
		{
			key: 'nama', // Key ini fiktif, kita akan gunakan formatter
			label: 'Nama Murid',
			sortable: false, // Sorting pada kolom join lebih rumit, nonaktifkan dulu
			filterable: 'text', // Filtering juga butuh penanganan khusus di backend
			formatter: (value: any, row: NasyathRow) => {
				// Gunakan salah satu dari dua ini, tergantung implementasi backend
				return row.murid?.nama || row.namaMurid || 'N/A';
			}
		},
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
			// PERBAIKAN: Tambahkan tipe pada parameter 'value'
			formatter: (value: string | Date | null) =>
				value ? new Date(value).toLocaleDateString('id-ID') : '-'
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
				body: JSON.stringify({
					sort,
					filters: {
						...filters,
						// Kirim filter tanggal di bawah key khusus
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

	// --- Event Handlers untuk SuperTable ---
	function applyDateFilter() {
		// Panggil kembali fetch data dengan filter baru
		// Reset ke halaman 1 setiap kali filter diubah
		fetchNasyathData(currentSort, currentFilters, 1);
	}

	function resetDateFilter() {
		dateFilter.start = '';
		dateFilter.end = '';
		applyDateFilter();
	}

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

	async function handleItemsPerPageChange(event: CustomEvent<number>) {
		pageSize = event.detail;
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	// --- Event Handlers untuk Aksi Baris ---
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

	onMount(() => {
		fetchNasyathData(currentSort, currentFilters, currentPage);
	});
</script>

<div class="container mx-auto p-4">
	<div class="mb-4 flex flex-wrap items-center justify-between">
		<h1 class="text-2xl font-bold">قائمة أنشطة أعضاء المجلس</h1>
		<div class="flex flex-wrap items-center gap-2">
			<a
				href={`/api/nasyath_mun/cetak.pdf?sort=${encodeURIComponent(
					JSON.stringify(currentSort)
				)}&filters=${encodeURIComponent(JSON.stringify(currentFilters))}`}
				class="btn btn-secondary btn-sm"
				target="_blank"
				rel="noopener noreferrer"
			>
				Cetak Laporan
			</a>
			<a
				href={`/api/nasyath_mun/cetak.csv?sort=${encodeURIComponent(
					JSON.stringify(currentSort)
				)}&filters=${encodeURIComponent(JSON.stringify(currentFilters))}`}
				class="btn btn-info btn-sm"
				download="laporan-nasyath.csv"
			>
				Cetak CSV
			</a>
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
		initialSort={currentSort}
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
