<script lang="ts">
	import { createEventDispatcher, tick, untrack } from 'svelte';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { muridModalStore } from '$lib/stores/muridModalStore';

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
		marhalah: number;
	}

	// --- Props ---
	interface Props {
		showModal?: boolean;
		editedMuridId?: number | undefined;
	}

	let { showModal = false, editedMuridId = undefined }: Props = $props();

	// --- State ---
	let pageSize = $state(5);
	let currentPage = $state(1);
	let currentSort: SortConfig[] | undefined = $state(undefined);
	let currentFilters: FilterState = $state({ columns: {} });

	const dispatch = createEventDispatcher<{
		select: Murid;
		close: void;
	}>();

	const columns: ColumnDef[] = [
		{
			key: 'nama',
			label: 'Nama',
			sortable: true,
			filterable: 'text',
			formatter: (v, row: Murid) => {
				if (row.marhalah < 3) {
					return `
						<div class="tooltip tooltip-warning" data-tip="Peringatan: Belum mencapai Marhalah 3">
							<span class="inline-flex items-center gap-1 text-warning font-medium">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
								${v}
							</span>
						</div>
					`.trim();
				}
				return v;
			}
		},
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

	function handleSelect(selectedIds: number[]) {
		const selectedId = selectedIds[0];
		if (selectedId) {
			const selected = $muridModalStore.muridData.find((m) => m.id === selectedId);
			if (selected) {
				dispatch('select', selected);
				closeModal();
			}
		}
	}

	function closeModal() {
		dispatch('close');
	}

	async function handleSort(sort: SortConfig[] | null) {
		currentSort = sort ?? undefined;
		await muridModalStore.updateData(
			currentSort,
			currentFilters,
			currentPage,
			pageSize,
			editedMuridId
		);
	}

	async function handleFilter(filters: FilterState) {
		currentFilters = filters; // Store the entire filter state
		currentPage = 1; // Reset page on filter change
		await muridModalStore.updateData(
			currentSort,
			currentFilters,
			currentPage,
			pageSize,
			editedMuridId
		);
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await muridModalStore.updateData(
			currentSort,
			currentFilters,
			currentPage,
			pageSize,
			editedMuridId
		);
	}

	async function handleItemsPerPageChange(newSize: number) {
		pageSize = newSize;
		currentPage = 1; // Reset page on items per page change
		await muridModalStore.updateData(
			currentSort,
			currentFilters,
			currentPage,
			pageSize,
			editedMuridId
		);
	}

	let superTableComponent: SuperTable<Murid> | undefined = $state();
	
	$effect(() => {
		if (showModal) {
			untrack(() => {
				// Load data if it's not already loaded
				muridModalStore.loadDataIfNeeded(
					currentSort,
					currentFilters,
					currentPage,
					pageSize,
					editedMuridId
				);

				// Always clear selection when modal opens
				tick().then(() => {
					if (superTableComponent) {
						superTableComponent.clearSelection();
					}
				});
			});
		}
	});
</script>

{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-5xl">
			<h3 class="text-lg font-bold">Pilih Murid</h3>
			<div class="py-2">
				<SuperTable
					bind:this={superTableComponent}
					{columns}
					data={$muridModalStore.muridData}
					rowKey={"id" as keyof Murid}
					itemsPerPageProp={pageSize}
					currentPageProp={currentPage}
					filterStateProp={currentFilters}
					totalItemsProp={$muridModalStore.totalItems}
					isLoadingProp={$muridModalStore.loading}
					sort={currentSort}
					serverSide={true}
					selectionMode="single"
					onsort={handleSort}
					onfilter={handleFilter}
					onpageChange={handlePageChange}
					onitemsPerPageChange={handleItemsPerPageChange}
					onselectionChange={handleSelect}
					onrowClick={(row) => handleSelect([row.id])}
					dbError={$muridModalStore.hasDbError}
					disabledRowKeys={editedMuridId ? [editedMuridId] : []}
					containerHeight="h-[calc(100vh-320px)]"
					persistenceId="murid-modal-table"
				>
					{#snippet errorState()}
						<div class="p-8 text-center text-error">
							<p>Tidak dapat memuat data.</p>
							<button
								type="button"
								class="btn btn-outline btn-sm mt-4"
								onclick={() =>
									muridModalStore.updateData(
										currentSort,
										currentFilters,
										currentPage,
										pageSize,
										editedMuridId
									)}
							>
								Coba Lagi
							</button>
						</div>
					{/snippet}
				</SuperTable>
			</div>
			<div class="modal-action mt-2">
				<button class="btn" onclick={closeModal}>Tutup</button>
			</div>
		</div>
	</div>
{/if}
