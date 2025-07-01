<script lang="ts" generics="T extends Record<string, any>">
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
	import FilterDrawer from './subcomponents/FilterDrawer.svelte';
	import TableRowDesktop from './subcomponents/TableRowDesktop.svelte';
	import TableRowMobileCard from './subcomponents/TableRowMobileCard.svelte';
	import PaginationControls from './subcomponents/PaginationControls.svelte';
	import FilterInput from './subcomponents/FilterInput.svelte';
	import { XCircle, Trash2, Columns, Funnel } from 'lucide-svelte';

	// Props
	type Props = SuperTableProps<T>;
	export let data: Props['data'] = [];
	export let columns: Props['columns'] = [];
	export let rowKey: Props['rowKey'];
	export let mobileView: Props['mobileView'] = 'cards';
	export let initialSort: Props['initialSort'] = undefined;
	export let itemsPerPageProp: Props['itemsPerPage'] = 10;
	export let totalItemsProp: Props['totalItems'] = undefined;
	export let isLoadingProp: Props['isLoading'] = false;
	export let tableClass: Props['tableClass'] = '';
	export let cardClass: Props['cardClass'] = '';
	export let rowClass: Props['rowClass'] = '';
	export let isSelectable: boolean = true;
	export let serverSide = false;
	export let dbError: Props['dbError'] = false;
	export let maxVisibleColumns: Props['maxVisibleColumns'] = 5;

	const dispatch = createEventDispatcher();

	// --- State Management ---
	let internalColumns: ColumnDef<T>[] = [];
	let filteredData: T[] = [];
	let isFilterDrawerOpen = false;
	let filterTimeout: NodeJS.Timeout;
	const FILTER_DEBOUNCE_MS = 300;

	// --- Lifecycle & Reactivity ---
	onMount(() => {
		$sortState = initialSort ?? null;
		$itemsPerPage = itemsPerPageProp ?? 10;
		$isLoading = false;

		// Initialize internal state
		internalColumns = columns.map((col) => ({ ...col }));
		if (!serverSide) {
			filteredData = filterData(data, $filterState, internalColumns);
		} else {
			filteredData = data;
		}

		onResize();
		window.addEventListener('resize', onResize);

		return () => {
			if (filterTimeout) clearTimeout(filterTimeout);
			window.removeEventListener('resize', onResize);
		};
	});

	// Sync loading state with prop
	$: $isLoading = Boolean(isLoadingProp);

	// Update internal columns when prop changes
	$: internalColumns = columns.map((col) => ({ ...col }));

	// When data changes (especially in server-side mode), update filteredData
	$: if (serverSide) {
		filteredData = data;
	}

	// --- Computed Properties ---
	$: sortedData = sortData(filteredData, $sortState, internalColumns);
	$: totalItems = serverSide ? totalItemsProp ?? 0 : sortedData.length;
	$: totalPageCount = calculateTotalPages(totalItems, $itemsPerPage);
	$: displayData = serverSide ? sortedData : paginateData(sortedData, $currentPage, $itemsPerPage);
	$: allSelected =
		displayData.length > 0 && displayData.every((row) => $selectedIds.has(row[rowKey]));
	$: someSelected = displayData.some((row) => $selectedIds.has(row[rowKey]));

	// --- Mobile Detection ---
	let isMobile: boolean = false;
	function onResize() {
		if (typeof window !== 'undefined') {
			isMobile = window.innerWidth < 768;
		}
	}

	// --- Event Handlers ---

	// Central debounced function for all filter updates
	function debouncedDispatchFilter(state: FilterState) {
		if (filterTimeout) clearTimeout(filterTimeout);

		// For client-side, immediately apply filtering to the UI
		if (!serverSide) {
			filteredData = filterData(data, state, internalColumns);
		}

		// Debounce the event dispatch to the parent (for server-side calls)
		filterTimeout = setTimeout(() => {
			if (serverSide) $isLoading = true;
			dispatch('filter', state);
		}, FILTER_DEBOUNCE_MS);
	}

	function handleSort(event: CustomEvent<SortConfig | null>) {
		$sortState = event.detail;
		dispatch('sort', event.detail);
	}

	function handleGlobalFilter(value: string) {
		$filterState.global = value;
		debouncedDispatchFilter($filterState);
	}

	function handleLiveFilterChange(event: CustomEvent<{ key: string; value: any }>) {
		const { key, value } = event.detail;
		// Create a new object to ensure Svelte reactivity
		$filterState.columns = { ...$filterState.columns, [key]: value };
		debouncedDispatchFilter($filterState);
	}

	function handleApplyDrawerFilters(event: CustomEvent<Record<string, any>>) {
		$filterState.columns = event.detail;
		// Dispatch immediately without debounce for drawer's "Apply" button
		if (serverSide) $isLoading = true;
		dispatch('filter', $filterState);
	}

	function resetColumnFilters() {
		$filterState.columns = {};
		debouncedDispatchFilter($filterState);
	}

	function handleSelectAll(event: CustomEvent<{ selected: boolean }>) {
		const newSelectedIds = new Set($selectedIds);
		if (event.detail.selected) {
			displayData.forEach((row) => newSelectedIds.add(row[rowKey]));
		} else {
			displayData.forEach((row) => newSelectedIds.delete(row[rowKey]));
		}
		$selectedIds = newSelectedIds;
		dispatch('selectionChange', Array.from(newSelectedIds));
	}

	function handleSelect(event: CustomEvent<{ row: T; selected: boolean }>) {
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
		$currentPage = 1; // Reset to first page
		dispatch('itemsPerPageChange', event.detail);
	}

	function handleSwipe(event: CustomEvent<{ row: T; direction: 'left' | 'right' }>) {
		dispatch('swipe', event.detail);
	}

	function clearSelection() {
		$selectedIds = new Set();
		dispatch('selectionChange', []);
	}

	function selectAllOnPage() {
		const newSelectedIds = new Set($selectedIds);
		displayData.forEach((row) => newSelectedIds.add(row[rowKey]));
		$selectedIds = newSelectedIds;
		dispatch('selectionChange', Array.from(newSelectedIds));
	}

	function handleDeleteSelected() {
		dispatch('deleteSelected', Array.from($selectedIds));
	}

	function toggleColumnVisibility(key: string) {
		internalColumns = internalColumns.map((col) =>
			col.key === key ? { ...col, hidden: !col.hidden } : col
		);
	}
</script>

<svelte:window on:resize={onResize} />

<div class="w-full space-y-1">
	<!-- Bulk actions and global filter section -->
	<div class="card mb-4 bg-base-100 shadow">
		<div class="card-body p-4">
			<div class="flex flex-col gap-4">
				<!-- Global Filter -->
				<div class="w-full">
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

				<!-- Toolbar -->
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
					<!-- Column Visibility -->
					<div class="dropdown">
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

					<!-- Mobile Filter Drawer Button -->
					{#if isMobile && mobileView === 'cards'}
						<button
							class="btn btn-outline btn-sm relative"
							on:click={() => (isFilterDrawerOpen = !isFilterDrawerOpen)}
						>
							<Funnel class="h-4 w-4" />
							Filters
							{#if Object.values($filterState.columns).some((v) => v && v !== 'All')}
								<div class="badge badge-primary badge-xs absolute right-1 top-1 scale-75"></div>
							{/if}
						</button>
						<FilterDrawer
							isOpen={isFilterDrawerOpen}
							columns={internalColumns}
							filterValues={$filterState.columns}
							on:close={() => (isFilterDrawerOpen = false)}
							on:applyFilters={handleApplyDrawerFilters}
							on:reset={resetColumnFilters}
						/>
					{/if}

					<!-- Bulk Selection Actions -->
					{#if $selectedIds.size > 0}
						<div class="flex flex-grow flex-wrap items-center justify-end gap-x-4 gap-y-2">
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
								<button class="btn btn-link btn-sm" on:click={selectAllOnPage}>
									Select all ({displayData.length})
								</button>
							{:else if allSelected}
								<button class="btn btn-link btn-sm" on:click={clearSelection}>
									Deselect all
								</button>
							{/if}
							<button class="btn btn-error btn-sm" on:click={handleDeleteSelected}>
								<Trash2 class="h-4 w-4" />
								Delete Selected
							</button>
							<slot name="bulk-actions" selectedIds={Array.from($selectedIds)} />
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Main table/cards section -->
	<div class="card bg-base-100 shadow">
		<div class="card-body px-0 py-0">
			{#if isMobile && mobileView === 'cards'}
				<!-- Mobile Card View -->
				{#if $isLoading}
					<slot name="loading-state">
						<div class="flex w-full justify-center p-8"><span class="loading loading-spinner" /></div>
					</slot>
				{:else if data.length === 0}
					<slot name="empty-state">
						<div class="p-8 text-center text-base-content/70">No data available</div>
					</slot>
				{:else}
					{#each displayData as row (String(row[rowKey]))}
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
				{/if}
			{:else}
				<!-- Desktop Table View -->
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
							on:filterChange={handleLiveFilterChange}
							on:reset={resetColumnFilters}
							on:selectAll={handleSelectAll}
						/>
						<tbody>
							{#if dbError}
								<slot name="error-state">
									<tr>
										<td colspan={internalColumns.filter((c) => !c.hidden).length + 2} class="p-8 text-center text-error">
											Gagal memuat data. Silakan coba lagi.
										</td>
									</tr>
								</slot>
							{:else if $isLoading}
								<slot name="loading-state">
									<tr>
										<td colspan={internalColumns.filter((c) => !c.hidden).length + 2} class="p-8 text-center">
											<span class="loading loading-spinner" />
										</td>
									</tr>
								</slot>
							{:else if data.length === 0}
								<slot name="empty-state">
									<tr>
										<td colspan={internalColumns.filter((c) => !c.hidden).length + 2} class="p-8 text-center text-base-content/70">
											No data available
										</td>
									</tr>
								</slot>
							{:else}
								{#each displayData as row (String(row[rowKey]))}
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
							{/if}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<!-- Pagination -->
	<div class="borer card mx-0 bg-base-100 shadow">
		<div class="card-body px-4 py-2">
			{#if !$isLoading && totalItems > 0}
				<PaginationControls
					currentPage={$currentPage}
					totalPages={totalPageCount}
					itemsPerPage={$itemsPerPage}
					{totalItems}
					on:pageChange={handlePageChange}
					on:itemsPerPageChange={handleItemsPerPageChange}
				/>
			{/if}
		</div>
	</div>
</div>
