<!-- SuperTable.svelte -->
<script lang="ts">
	import type { ColumnDef, SortConfig, FilterState, SuperTableProps } from './types';
	import { createEventDispatcher, onMount } from 'svelte';
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
	import { XCircle, Trash2, Columns } from 'lucide-svelte';

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
	export let serverSide = false;
	export let maxVisibleColumns: SuperTableProps['maxVisibleColumns'] = undefined;

	const dispatch = createEventDispatcher();

	// Initialize stores only once on mount
	// Initialize stores
	onMount(() => {
		$sortState = initialSort ?? null;
		$itemsPerPage = itemsPerPageProp ?? 10;
		$isLoading = false;
	});

	// Keep loading state in sync with prop, ensuring we always have a boolean
	$: $isLoading = Boolean(isLoadingProp);

	// Internal state for column visibility
	let internalColumns: ColumnDef[] = [];
	$: internalColumns = columns.map((col) => ({ ...col })); // Deep copy to allow modification

	function toggleColumnVisibility(key: string) {
		internalColumns = internalColumns.map((col) =>
			col.key === key ? { ...col, hidden: !col.hidden } : col
		);
	}

	// State for filtered and sorted data
	let filteredData: typeof data = [];
	let hasFilterListener = false;

	// Use explicit serverSide prop for determining filtering mode
	$: hasFilterListener = serverSide;

	// Reactive data processing
	$: {
		// console.log('[SuperTable] Data update received:', {
		// 	serverSide,
		// 	dataLength: data.length,
		// 	filterState: $filterState,
		// 	loading: $isLoading
		// });

		// Simply use the data as-is - filtering will be handled appropriately by event handlers
		filteredData = data;
	}
	$: sortedData = sortData(filteredData, $sortState, internalColumns); // Use internalColumns
	$: totalItems = totalItemsProp ?? sortedData.length;
	$: totalPageCount = calculateTotalPages(totalItems, $itemsPerPage);
	$: paginatedData = paginateData(sortedData, $currentPage, $itemsPerPage);
	$: totalFilteredAndSortedItems = sortedData.length;

	// Selection state
	$: allSelected =
		paginatedData.length > 0 && paginatedData.every((row) => $selectedIds.has(row[rowKey]));
	$: someSelected = paginatedData.some((row) => $selectedIds.has(row[rowKey]));

	import { browser } from '$app/environment';

	// Mobile detection
	let isMobile: boolean = false;

	function onResize() {
		if (typeof window !== 'undefined') {
			isMobile = window.innerWidth < 768;
		}
	}

	onMount(() => {
		onResize();
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', onResize);
			return () => {
				if (filterTimeout) clearTimeout(filterTimeout);
				window.removeEventListener('resize', onResize);
			};
		}
	});

	// Event handlers
	function handleSort(event: CustomEvent<SortConfig | null>) {
		$sortState = event.detail;
		dispatch('sort', event.detail);
	}

	function handleFilter(event: CustomEvent<{ column: ColumnDef; value: any; columnKey: string }>) {
		const { column, value, columnKey } = event.detail;
		console.log('[SuperTable] Column filter change:', { column: columnKey, value, serverSide });

		// Update filter state
		$filterState.columns = { ...$filterState.columns, [columnKey]: value };

		if (!serverSide) {
			// Only apply client-side filtering if we're not in server-side mode
			filteredData = filterData(data, $filterState, internalColumns);
		}

		debouncedDispatchFilter($filterState);
	}

	function handleGlobalFilter(value: string) {
		console.log('[SuperTable] Global filter change:', { value, serverSide });
		// Update filter state
		$filterState.global = value;

		if (!serverSide) {
			// Only apply client-side filtering if we're not in server-side mode
			filteredData = filterData(data, $filterState, internalColumns);
		}

		debouncedDispatchFilter($filterState);
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

	function clearSelection() {
		$selectedIds = new Set();
		dispatch('selectionChange', []);
	}

	function selectAllFilteredAndSorted() {
		const newSelectedIds = new Set($selectedIds);
		sortedData.forEach((row) => newSelectedIds.add(row[rowKey]));
		$selectedIds = newSelectedIds;
		dispatch('selectionChange', Array.from(newSelectedIds));
	}

	function handleDeleteSelected() {
		dispatch('deleteSelected', Array.from($selectedIds));
	}

	// Debouncing configuration
	let filterTimeout: NodeJS.Timeout;
	const FILTER_DEBOUNCE_MS = 300; // 300ms debounce - more responsive while still preventing excess calls

	// Create a debounced function for filter updates
	function debouncedDispatchFilter(filterState: FilterState) {
		if (filterTimeout) clearTimeout(filterTimeout);
		console.log('[SuperTable] Setting up filter dispatch with state:', {
			globalFilter: filterState.global,
			columnFilters: filterState.columns,
			debounceDelay: FILTER_DEBOUNCE_MS,
			serverSide
		});

		if (!serverSide) {
			// Only update internal state for client-side filtering
			filteredData = filterData(data, filterState, internalColumns);
		}

		// Debounce the event dispatch to parent
		filterTimeout = setTimeout(() => {
			console.log('[SuperTable] Dispatching debounced filter event to parent');
			if (serverSide) $isLoading = true; // Show loading state for server-side filtering
			dispatch('filter', filterState);
		}, FILTER_DEBOUNCE_MS);
	}
</script>

<svelte:window on:resize={onResize} />

<div class="w-full space-y-1">
	<!-- Bulk actions and global filter section with card styling -->
	<div class="card mb-4 bg-base-100 shadow">
		<div class="card-body p-4">
			<div class="flex items-center justify-between gap-4">
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
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-1">
							<span class="text-sm text-base-content/70">{$selectedIds.size} selected</span>
							<div class="tooltip tooltip-bottom" data-tip="Clear selection">
								<button
									class="btn btn-circle btn-ghost btn-sm"
									on:click={clearSelection}
									aria-label="Clear selection"
								>
									<XCircle class="h-4 w-4" />
								</button>
							</div>
						</div>
						{#if someSelected && !allSelected}
							<button class="btn btn-link btn-sm" on:click={selectAllFilteredAndSorted}>
								Select all ({totalFilteredAndSortedItems})
							</button>
						{:else if allSelected}
							<button class="btn btn-link btn-sm" on:click={clearSelection}> Deselect all </button>
						{/if}
						<button class="btn btn-error btn-sm" on:click={handleDeleteSelected}>
							<Trash2 class="h-4 w-4" />
							Delete Selected
						</button>
						<slot name="bulk-actions" selectedIds={Array.from($selectedIds)} />
					</div>
				{/if}

				<!-- Column Visibility Toggler -->
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-sm">
						<Columns class="h-4 w-4" />
						Columns
						<svg
							width="12px"
							height="12px"
							class="inline-block h-2 w-2 fill-current opacity-60"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 2048 2048"
							><path d="M1799 349l-839 839-839-839-128 128 967 967 967-967z" /></svg
						>
					</div>
					<ul
						role="menu"
						tabindex="0"
						class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
					>
						{#each internalColumns as column (column.key)}
							<li>
								<label class="label cursor-pointer">
									<span class="label-text">{column.label}</span>
									<input
										type="checkbox"
										class="checkbox checkbox-sm"
										checked={!column.hidden}
										on:change={() => toggleColumnVisibility(String(column.key))}
									/>
								</label>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Main table/cards section with card styling -->
	<div class="card bg-base-100 shadow">
		<div class="card-body px-0 py-0">
			{#if $isLoading}
				<slot name="loading-state">
					<div class="flex w-full justify-center p-8">
						<span class="loading loading-spinner" />
					</div>
				</slot>
			{:else if data.length === 0}
				<slot name="empty-state">
					<div class="p-8 text-center text-base-content/70">No data available</div>
				</slot>
			{:else}
				<!-- Mobile card view -->
				{#if isMobile && mobileView === 'cards'}
					<div class="grid gap-4 px-4 sm:grid-cols-2">
						{#each paginatedData as row (String(row[rowKey]))}
							<TableRowMobileCard
								{row}
								columns={internalColumns}
								rowKey={String(rowKey)}
								isSelectable={true}
								className={typeof rowClass === 'function' ? rowClass(row) : rowClass}
								{cardClass}
								{maxVisibleColumns}
								on:select={handleSelect}
								on:swipe={handleSwipe}
							>
								<svelte:fragment slot="row-actions" let:row>
									<slot name="row-actions" {row} />
								</svelte:fragment>
							</TableRowMobileCard>
						{/each}
					</div>
					<!-- Table view -->
				{:else}
					<div class="overflow-x-auto">
						<table class="table table-sm w-full {tableClass}">
							<TableHeader
								columns={internalColumns}
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
										columns={internalColumns}
										rowKey={String(rowKey)}
										isSelectable={true}
										className={typeof rowClass === 'function' ? rowClass(row) : rowClass}
										on:select={handleSelect}
										on:swipe={handleSwipe}
									>
										<svelte:fragment slot="row-actions" let:row>
											<slot name="row-actions" {row} />
										</svelte:fragment>
									</TableRowDesktop>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Pagination section with card styling -->
	<div class="borer card mx-0 bg-base-100 shadow">
		<div class="card-body px-4 py-2">
			<PaginationControls
				currentPage={$currentPage}
				totalPages={totalPageCount}
				itemsPerPage={$itemsPerPage}
				{totalItems}
				on:pageChange={handlePageChange}
				on:itemsPerPageChange={handleItemsPerPageChange}
			/>
		</div>
	</div>
</div>
