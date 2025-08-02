<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';

	// --- Type Definitions ---
	interface Murid {
		id: number;
		nama: string;
		namaArab: string | null;
		gender: boolean;
		deskelName: string | null;
		kecamatanName: string | null;
		kokabName: string | null;
		propinsiName: string | null;
		aktif: boolean;
	}

	// --- Props ---
	export let showModal = false;
	export let editedMuridId: number | undefined = undefined;

	// --- State ---
	let muridData: Murid[] = [];
	let totalItems = 0;
	let loading = false;
	let pageSize = 5;
	let currentPage = 1;
	let currentSort: SortConfig[] | undefined = undefined;
	let currentFilters: Record<string, any> = {};
	let hasDbError = false;

	const dispatch = createEventDispatcher<{
		select: Murid;
		close: void;
	}>();

	const columns: ColumnDef[] = [
		{ key: 'nama', label: 'Nama', sortable: true, filterable: 'text' },
		{
			key: 'gender',
			label: 'Gender',
			sortable: true,
			filterable: 'select',
			filterOptions: ['Pria', 'Wanita'],
			formatter: (v) => (v ? 'Pria' : 'Wanita')
		},
		{ key: 'deskelName', label: 'Desa/Kelurahan', sortable: true, filterable: 'text' },
		{ key: 'kecamatanName', label: 'Kecamatan', sortable: true, filterable: 'text' }
	];

	async function fetchTableData(
		sort?: SortConfig[] | null,
		filters?: Record<string, any>,
		page: number = 1
	) {
		loading = true;
		hasDbError = false;
		try {
			const response = await fetch('/member/pendataan/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters, page, pageSize, excludeId: editedMuridId })
			});

			if (!response.ok) throw new Error('Failed to fetch murid data');

			const result = await response.json();
			muridData = result.murid;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (error) {
			console.error('Error fetching table data:', error);
			hasDbError = true;
		} finally {
			loading = false;
		}
	}

	function handleSelect(event: CustomEvent<number[]>) {
		const selectedId = event.detail[0];
		if (selectedId) {
			const selected = muridData.find((m) => m.id === selectedId);
			if (selected) {
				dispatch('select', selected);
				closeModal();
			}
		}
	}

	function closeModal() {
		dispatch('close');
	}

	async function handleSort(event: CustomEvent<SortConfig[] | null>) {
		currentSort = event.detail ?? undefined;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = event.detail;
		await fetchTableData(currentSort, currentFilters, 1);
	}

	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleItemsPerPageChange(event: CustomEvent<number>) {
		pageSize = event.detail;
		await fetchTableData(currentSort, currentFilters, 1);
	}

	onMount(() => {
		if (showModal) {
			fetchTableData(currentSort, currentFilters, currentPage);
		}
	});

	$: if (showModal) {
		fetchTableData(currentSort, currentFilters, currentPage);
	}
</script>

{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-5xl">
			<h3 class="text-lg font-bold">Pilih Murid</h3>
			<div class="py-4">
				<SuperTable
					{columns}
					data={muridData}
					rowKey="id"
					itemsPerPageProp={pageSize}
					totalItemsProp={totalItems}
					isLoadingProp={loading}
					sort={currentSort}
					serverSide={true}
					selectionMode="single"
					on:sort={handleSort}
					on:filter={handleFilter}
					on:pageChange={handlePageChange}
					on:itemsPerPageChange={handleItemsPerPageChange}
					on:selectionChange={handleSelect}
					dbError={hasDbError}
					disabledRowKeys={editedMuridId ? [editedMuridId] : []}
				>
					<svelte:fragment slot="error-state">
						<div class="p-8 text-center text-error">
							<p>Tidak dapat memuat data.</p>
							<button
								class="btn btn-outline btn-sm mt-4"
								on:click={() => fetchTableData(currentSort, currentFilters, currentPage)}
							>
								Coba Lagi
							</button>
						</div>
					</svelte:fragment>
					<div slot="bulk-actions" />
				</SuperTable>
			</div>
			<div class="modal-action">
				<button class="btn" on:click={closeModal}>Tutup</button>
			</div>
		</div>
	</div>
{/if}
