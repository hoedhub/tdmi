<!-- SuperTable.svelte -->
<script lang="ts">
	import type { ColumnDef, SortConfig, FilterState, SuperTableProps } from './types';
	import { createEventDispatcher } from 'svelte';
	import {
		sortState,
		filterState,
		selectedIds,
		currentPage,
		itemsPerPage,
		isLoading
	} from './stores';
	import { sortData } from './features/sorting';
	import { filterData } from './features/filtering';
	import { paginateData, calculateTotalPages } from './features/pagination';

	// Components
	import TableHeader from './subcomponents/TableHeader.svelte';
	import TableRowDesktop from './subcomponents/TableRowDesktop.svelte';
	import TableRowMobileCard from './subcomponents/TableRowMobileCard.svelte';
	import PaginationControls from './subcomponents/PaginationControls.svelte';
	import FilterInput from './subcomponents/FilterInput.svelte';

	// Props
	export let data: SuperTableProps['data'] = [];
	export let columns: SuperTableProps['columns'] = [];
	export let rowKey: SuperTableProps['rowKey'];
	export let mobileView: SuperTableProps['mobileView'] = 'cards';
	export let initialSort: SuperTableProps['initialSort'] = undefined;
	export let itemsPerPageProp: SuperTableProps['itemsPerPage'] = 10;
	export let totalItemsProp: SuperTableProps['totalItems'] = undefined;
	export let isLoadingProp: SuperTableProps['isLoading'] = false;
	export let tableClass: SuperTableProps['tableClass'] = '';
	export let cardClass: SuperTableProps['cardClass'] = '';
	export let rowClass: SuperTableProps['rowClass'] = '';

	const dispatch = createEventDispatcher();

	// Initialize stores
	$: {
		$sortState = initialSort ?? null;
		$itemsPerPage = itemsPerPageProp ?? 10;
		$isLoading = isLoadingProp ?? false;
	}

	// Reactive data processing
	$: filteredData = filterData(data, $filterState, columns);
	$: sortedData = sortData(filteredData, $sortState, columns);
	$: totalItems = totalItemsProp ?? sortedData.length;
	$: totalPageCount = calculateTotalPages(totalItems, $itemsPerPage);
	$: paginatedData = paginateData(sortedData, $currentPage, $itemsPerPage);

	// Selection state
	$: allSelected =
		paginatedData.length > 0 && paginatedData.every((row) => $selectedIds.has(row[rowKey]));
	$: someSelected = paginatedData.some((row) => $selectedIds.has(row[rowKey]));

	// Mobile detection
	let isMobile: boolean;

	function onResize() {
		isMobile = window.innerWidth < 768;
	}

	// Initialize isMobile on mount
	onResize();

	// Event handlers
	function handleSort(event: CustomEvent<SortConfig | null>) {
		$sortState = event.detail;
		dispatch('sort', event.detail);
	}

	function handleFilter(event: CustomEvent<{ column: ColumnDef; value: any; columnKey: string }>) {
		const { column, value, columnKey } = event.detail;
		$filterState.columns = { ...$filterState.columns, [columnKey]: value };
		dispatch('filter', $filterState);
	}

	function handleGlobalFilter(value: string) {
		$filterState.global = value;
		dispatch('filter', $filterState);
	}

	function handleSelectAll(event: CustomEvent<{ selected: boolean }>) {
		const newSelectedIds = new Set($selectedIds);

		if (event.detail.selected) {
			paginatedData.forEach((row) => newSelectedIds.add(row[rowKey]));
		} else {
			paginatedData.forEach((row) => newSelectedIds.delete(row[rowKey]));
		}

		$selectedIds = newSelectedIds;
		dispatch('selectionChange', Array.from(newSelectedIds));
	}

	function handleSelect(event: CustomEvent<{ row: any; selected: boolean }>) {
		const { row, selected } = event.detail;
		const newSelectedIds = new Set($selectedIds);

		if (selected) {
			newSelectedIds.add(row[rowKey]);
		} else {
			newSelectedIds.delete(row[rowKey]);
		}

		$selectedIds = newSelectedIds;
		dispatch('selectionChange', Array.from(newSelectedIds));
	}

	function handlePageChange(event: CustomEvent<number>) {
		$currentPage = event.detail;
		dispatch('pageChange', event.detail);
	}

	function handleItemsPerPageChange(event: CustomEvent<number>) {
		$itemsPerPage = event.detail;
		$currentPage = 1;
	}

	function handleSwipe(event: CustomEvent<{ row: any; direction: 'left' | 'right' }>) {
		dispatch('swipe', event.detail);
	}
</script>

<svelte:window on:resize={onResize} />

<div class="w-full">
	<!-- Global filter and bulk actions -->
	<div class="mb-4 flex items-center justify-between">
		<div class="w-64">
			<slot
				name="global-filter"
				searchTerm={$filterState.global}
				updateSearchTerm={handleGlobalFilter}
			>
				<FilterInput
					value={$filterState.global || ''}
					on:input={(e) => handleGlobalFilter(e.detail)}
				/>
			</slot>
		</div>

		{#if $selectedIds.size > 0}
			<div class="flex items-center gap-2">
				<slot name="bulk-actions" selectedIds={Array.from($selectedIds)}></slot>
			</div>
		{/if}
	</div>

	{#if $isLoading}
		<slot name="loading-state">
			<div class="flex w-full justify-center p-8">
				<span class="loading loading-spinner"></span>
			</div>
		</slot>
	{:else if data.length === 0}
		<slot name="empty-state">
			<div class="p-8 text-center text-base-content/70">No data available</div>
		</slot>
	{:else}
		<!-- Mobile card view -->
		{#if isMobile && mobileView === 'cards'}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each paginatedData as row (String(row[rowKey]))}
					<TableRowMobileCard
						{row}
						{columns}
						rowKey={String(rowKey)}
						isSelectable={true}
						className={typeof rowClass === 'function' ? rowClass(row) : rowClass}
						{cardClass}
						on:select={handleSelect}
						on:swipe={handleSwipe}
					>
						<svelte:fragment slot="row-actions" let:row>
							<slot name="row-actions" {row}></slot>
						</svelte:fragment>
					</TableRowMobileCard>
				{/each}
			</div>
			<!-- Table view -->
		{:else}
			<div class="overflow-x-auto">
				<table class="table table-zebra w-full {tableClass}">
					<TableHeader
						{columns}
						currentSort={$sortState}
						filterValues={$filterState.columns}
						isSelectable={true}
						{allSelected}
						{someSelected}
						on:sort={handleSort}
						on:filter={handleFilter}
						on:selectAll={handleSelectAll}
					/>

					<tbody>
						{#each paginatedData as row (String(row[rowKey]))}
							<TableRowDesktop
								{row}
								{columns}
								rowKey={String(rowKey)}
								isSelectable={true}
								className={typeof rowClass === 'function' ? rowClass(row) : rowClass}
								on:select={handleSelect}
								on:swipe={handleSwipe}
							>
								<svelte:fragment slot="row-actions" let:row>
									<slot name="row-actions" {row}></slot>
								</svelte:fragment>
							</TableRowDesktop>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Pagination -->
		<div class="mt-4">
			<PaginationControls
				currentPage={$currentPage}
				totalPages={totalPageCount}
				itemsPerPage={$itemsPerPage}
				{totalItems}
				on:pageChange={handlePageChange}
				on:itemsPerPageChange={handleItemsPerPageChange}
			/>
		</div>
	{/if}
</div>
