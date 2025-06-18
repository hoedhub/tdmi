<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { Pen, Trash, PlusCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { DatabaseUserAttributes } from '$lib/server/auth';

	// --- Type Definitions ---
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

	interface ExtendedPageData extends PageData {
		user: DatabaseUserAttributes;
		canReadMurid: true; // Corrected type: if page loads, this must be true
		canWriteMurid: boolean;
		totalItems: number;
	}

	export let data: ExtendedPageData;
	export let form: { success?: boolean; message?: string } | null;

	let muridData: Murid[] = [];
	let totalItems = data.totalItems;
	let loading = false;
	const pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig | undefined = undefined;
	let currentFilters: Record<string, any> = {};

	// --- Reactive Data from Props ---
	$: canReadMurid = data.canReadMurid;
	$: canWriteMurid = data.canWriteMurid;

	let columns: ColumnDef[] = [
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
			key: 'marhalah',
			label: 'Marhalah',
			sortable: true,
			filterable: 'select',
			filterOptions: ['1', '2', '3'],
			formatter: (value: 1 | 2 | 3) => value.toString()
		},
		{ key: 'nomorTelepon', label: 'Telepon', sortable: true, filterable: 'text' },
		{ key: 'deskelName', label: 'Deskel', sortable: true, filterable: 'text' },
		{ key: 'kecamatanName', label: 'Kecamatan', sortable: true, filterable: 'text' },
		{ key: 'kokabName', label: 'Kokab', sortable: true, filterable: 'text' },
		{ key: 'propinsiName', label: 'Propinsi', sortable: true, filterable: 'text' },
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
		sort?: SortConfig | null,
		filters?: Record<string, any>,
		page: number = 1
	) {
		loading = true;
		try {
			const response = await fetch('/member/pendataan/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters, page, pageSize })
			});
			if (!response.ok) throw new Error('Failed to fetch murid data');

			const result = await response.json();

			muridData = result.murid;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (error) {
			console.error('Error fetching table data:', error);
		} finally {
			loading = false;
		}
	}

	async function handleSort(event: CustomEvent<SortConfig | null>) {
		currentSort = event.detail ?? undefined;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = { ...event.detail.columns, global: event.detail.global };
		await fetchTableData(currentSort, currentFilters, 1); // Reset ke halaman 1 saat filter
	}

	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleDeleteMurid(muridId: number, nama: string) {
		if (
			confirm(
				`Are you sure you want to delete murid "${nama}" (ID: ${muridId})? This action cannot be undone.`
			)
		) {
			const response = await fetch(`/member/pendataan/${muridId}/delete`, {
				method: 'POST' // Using POST for delete action as per SvelteKit convention for form actions
			});
			if (response.ok) {
				alert('Murid deleted successfully.');
				invalidateAll(); // Invalidate all data to refetch the table
			} else {
				const result = await response.json().catch(() => ({ message: response.statusText }));
				alert(`Failed to delete murid: ${result.message}`);
			}
		}
	}

	// --- Reactive Statements ---
	$: if (form?.success) {
		alert(form.message);
		invalidateAll();
	} else if (form?.message && !form?.success) {
		alert(form.message);
	}

	// Initial data fetch on component mount
	onMount(async () => {
		if (canReadMurid) {
			await fetchTableData(currentSort, currentFilters, currentPage);
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

{#key muridData}
	<SuperTable
		data={muridData}
		{columns}
		rowKey="id"
		itemsPerPage={pageSize}
		{totalItems}
		isLoading={loading}
		initialSort={currentSort}
		serverSide={true}
		on:sort={handleSort}
		on:filter={handleFilter}
		on:pageChange={handlePageChange}
		on:rowClick={({ detail }) => goto(`/member/pendataan/${detail.id}/edit`)}
	>
		<svelte:fragment slot="row-actions" let:row>
			{#if canWriteMurid}
				<div class="flex gap-2">
					<a
						href={`/member/pendataan/${row.id}/edit`}
						class="btn btn-ghost btn-sm"
						on:click|stopPropagation={() => {}}
					>
						<Pen class="h-4 w-4" />
					</a>
					<button
						class="btn btn-ghost btn-sm text-error"
						on:click|stopPropagation={() => handleDeleteMurid(row.id, row.nama)}
					>
						<Trash class="h-4 w-4" />
					</button>
				</div>
			{/if}
		</svelte:fragment>
	</SuperTable>
{/key}
