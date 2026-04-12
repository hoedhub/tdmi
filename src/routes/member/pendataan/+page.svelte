<script lang="ts">
	import { run, stopPropagation } from 'svelte/legacy';

	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { Pen, Trash, PlusCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { DatabaseUserAttributes } from '$lib/server/auth';
	import { api } from '$lib/utils/api';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';

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
	}

	interface Props {
		data: ExtendedPageData;
		form: { success?: boolean; message?: string } | null;
	}

	let { data, form }: Props = $props();

	let muridData: Murid[] = $state([]);
	let totalItems = $state(data.totalItems);
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

	let columns: ColumnDef<Murid>[] = [
		{ key: 'nama', label: 'Nama', sortable: true, filterable: 'text' },
		{ key: 'namaArab', label: 'Nama Arab', sortable: true, filterable: 'text' },
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
			formatter: (value: string) => new Date(value).toLocaleDateString()
		}
	];

	// --- Functions ---
	async function fetchTableData(
		sort: SortConfig[] | undefined = currentSort,
		filters: Record<string, any> = currentFilters.columns,
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
		await fetchTableData(currentSort, currentFilters.columns, currentPage, pageSize);
	}

	async function handleFilter(filters: FilterState) {
		currentFilters = filters; // Save the entire filter state
		currentPage = 1;
		await fetchTableData(currentSort, currentFilters.columns, currentPage, pageSize);
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await fetchTableData(currentSort, currentFilters.columns, currentPage, pageSize);
	}

	async function handleItemsPerPageChange(newSize: number) {
		pageSize = newSize;
		await fetchTableData(currentSort, currentFilters.columns, 1, pageSize);
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
			goto(`/member/pendataan/${selectedMuridIds[0]}/edit`);
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
			await fetchTableData(currentSort, currentFilters.columns, currentPage, pageSize);
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
		onrowClick={(row) => goto(`/member/pendataan/${row.id}/edit`)}
		onselectionChange={handleSelectionChange}
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
						href={`/member/pendataan/${row.id}/edit`}
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
