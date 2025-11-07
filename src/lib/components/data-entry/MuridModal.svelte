<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher, tick } from 'svelte';
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

	function handleSelect(event: CustomEvent<number[]>) {
		const selectedId = event.detail[0];
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

	async function handleSort(event: CustomEvent<SortConfig[] | null>) {
		currentSort = event.detail ?? undefined;
		await muridModalStore.updateData(
			currentSort,
			currentFilters,
			currentPage,
			pageSize,
			editedMuridId
		);
	}

	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = event.detail; // Store the entire filter state
		currentPage = 1; // Reset page on filter change
		await muridModalStore.updateData(
			currentSort,
			currentFilters,
			currentPage,
			pageSize,
			editedMuridId
		);
	}

	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await muridModalStore.updateData(
			currentSort,
			currentFilters,
			currentPage,
			pageSize,
			editedMuridId
		);
	}

	async function handleItemsPerPageChange(event: CustomEvent<number>) {
		pageSize = event.detail;
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
	let prevShowModal = $state(showModal);
	run(() => {
		if (showModal && !prevShowModal) {
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
		}
		prevShowModal = showModal;
	});
</script>

{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-5xl">
			<h3 class="text-lg font-bold">Pilih Murid</h3>
			<div class="py-4">
				<SuperTable
					bind:this={superTableComponent}
					{columns}
					data={$muridModalStore.muridData}
					rowKey={"id" as keyof Murid}
					itemsPerPageProp={pageSize}
					totalItemsProp={$muridModalStore.totalItems}
					isLoadingProp={$muridModalStore.loading}
					sort={currentSort}
					serverSide={true}
					selectionMode="single"
					on:sort={handleSort}
					on:filter={handleFilter}
					on:pageChange={handlePageChange}
					on:itemsPerPageChange={handleItemsPerPageChange}
					on:selectionChange={handleSelect}
					dbError={$muridModalStore.hasDbError}
					disabledRowKeys={editedMuridId ? [editedMuridId] : []}
				>
					<svelte:fragment slot="errorState">
						<div class="p-8 text-center text-error">
							<p>Tidak dapat memuat data.</p>
							<button
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
					</svelte:fragment>
					<div slot="bulkActions"></div>
				</SuperTable>
			</div>
			<div class="modal-action">
				<button class="btn" onclick={closeModal}>Tutup</button>
			</div>
		</div>
	</div>
{/if}
