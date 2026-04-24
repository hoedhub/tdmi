<script lang="ts" generics="T extends Record<string, any>">
	import type { ColumnDef, SortConfig, FilterState, SuperTableProps } from './types';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { filterState, selectedIds, currentPage, itemsPerPage, isLoading } from './stores';
	import { sortData } from './features/sorting';
	import { filterData } from './features/filtering';
	import { paginateData, calculateTotalPages } from './features/pagination';
	import { tablePersistence } from '$lib/stores/tablePersistence.svelte';
	import { page } from '$app/stores';

	// Components
	import TableHeader from './subcomponents/TableHeader.svelte';
	import FilterDrawer from './subcomponents/FilterDrawer.svelte';
	import TableRowDesktop from './subcomponents/TableRowDesktop.svelte';
	import TableRowMobileCard from './subcomponents/TableRowMobileCard.svelte';
	import PaginationControls from './subcomponents/PaginationControls.svelte';
	import FilterInput from './subcomponents/FilterInput.svelte';
	import SortModal from './subcomponents/SortModal.svelte';
	import FilterModal from './subcomponents/FilterModal.svelte';
	import { XCircle, Trash2, Columns, Funnel, ArrowUpDown, ListFilter } from 'lucide-svelte';

	// Define props with event handlers at the top to ensure they are initialized before use
	let {
		data = [],
		columns = [],
		rowKey,
		mobileView = 'cards',
		sort = $bindable([]),
		itemsPerPageProp = $bindable(10),
		currentPageProp = $bindable(1),
		totalItemsProp = undefined,
		isLoadingProp = false,
		tableClass = '',
		cardClass = '',
		rowClass = '',
		isSelectable = true,
		serverSide = false,
		dbError = false,
		maxVisibleColumns = 5,
		selectionMode = 'multiple',
		disabledRowKeys = [],
		containerHeight = 'h-[calc(100vh-140px)]',
		persistenceId,
		filterStateProp = $bindable({ columns: {} }),
		// Snippets (Svelte 5 slots replacement)
		globalFilter,
		customFilters,
		bulkActions,
		loadingState,
		emptyState,
		rowActions,
		errorState,
		// Event Props (Modern Svelte 5 style)
		onfilter,
		onsort,
		onpageChange,
		onitemsPerPageChange,
		onselectionChange,
		ondeleteSelected,
		onrowClick
	}: SuperTableProps<T> & {
		globalFilter?: import('svelte').Snippet<[{ searchTerm: string | undefined, updateSearchTerm: (value: string) => void }]>;
		customFilters?: import('svelte').Snippet;
		bulkActions?: import('svelte').Snippet<[{ selectedIds: any[] }]>;
		loadingState?: import('svelte').Snippet;
		emptyState?: import('svelte').Snippet;
		rowActions?: import('svelte').Snippet<[{ row: T }]>;
		errorState?: import('svelte').Snippet;
		onfilter?: (state: FilterState) => void;
		onsort?: (sort: SortConfig[] | null) => void;
		onpageChange?: (page: number) => void;
		onitemsPerPageChange?: (ipp: number) => void;
		onselectionChange?: (selected: any[]) => void;
		ondeleteSelected?: (selected: any[]) => void;
		onrowClick?: (row: T) => void;
	} = $props();




	// --- State Management ---
	let internalColumns: ColumnDef<T>[] = $state([]);
	let filteredData: T[] = $state([]);
	let isFilterDrawerOpen = $state(false);
	let isSortModalOpen = $state(false);
	let isFilterModalOpen = $state(false);
	let filterTimeout: NodeJS.Timeout;
	const FILTER_DEBOUNCE_MS = 300;
	let isMobile = $state(false);

	// --- Lifecycle & Reactivity ---
	onMount(() => {
		$selectedIds = new Set();
		
		// Load persisted state if available
		const cacheKey = persistenceId || $page.url.pathname;
		const savedState = tablePersistence.getState(cacheKey);
		
		if (savedState) {
			// Restore bound props to push back to parent
			$currentPage = savedState.currentPage;
			$itemsPerPage = savedState.itemsPerPage;
			$filterState = savedState.filterState;
			
			currentPageProp = savedState.currentPage;
			itemsPerPageProp = savedState.itemsPerPage;
			sort = savedState.sort || [];
			filterStateProp = savedState.filterState;
		} else {
			$filterState = { global: '', columns: {} };
		}

		const onResize = () => {
			isMobile = window.innerWidth < 768;
		};

		window.addEventListener('resize', onResize);
		onResize(); // Call once to set initial value

		return () => {
			if (filterTimeout) clearTimeout(filterTimeout);
			window.removeEventListener('resize', onResize);
		};
	});

	// Persist state changes
	$effect(() => {
		const cacheKey = persistenceId || $page.url.pathname;
		const segments = $page.url.pathname.split('/').filter(Boolean);
		const baseArea = segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : `/${segments[0] || ''}`;

		tablePersistence.saveState(cacheKey, {
			currentPage: $currentPage,
			itemsPerPage: $itemsPerPage,
			filterState: $filterState,
			sort: sort,
			baseArea
		});
	});

	// Sync stores with props using effects
	$effect(() => {
		$isLoading = Boolean(isLoadingProp);
	});
	$effect(() => {
		if (currentPageProp !== undefined && currentPageProp !== $currentPage) {
			$currentPage = currentPageProp;
		}
	});
	$effect(() => {
		if (itemsPerPageProp !== undefined && itemsPerPageProp !== $itemsPerPage) {
			$itemsPerPage = itemsPerPageProp;
		}
	});

	// Sync internal stores back to bound props (this pushes changes back to parent)
	$effect(() => {
		currentPageProp = $currentPage;
	});
	$effect(() => {
		itemsPerPageProp = $itemsPerPage;
	});
	$effect(() => {
		filterStateProp = $filterState;
	});

	// Handle internal columns synchronization
	let internalColumnsSync = $derived(columns.map((col) => ({ ...col })));
	$effect(() => {
		// Only sync if the base columns prop changes meaningfully
		internalColumns = internalColumnsSync;
	});

	// Reactive data handling
	$effect(() => {
		if (serverSide) {
			filteredData = data;
		} else {
			// Re-filter when data or filterState changes
			filteredData = filterData(data, $filterState, internalColumns);
		}
	});

	// --- Computed Properties ---
	let sortedData = $derived(sortData(filteredData, sort ?? null, internalColumns));
	let totalItems = $derived(serverSide ? (totalItemsProp ?? 0) : sortedData.length);
	let totalPageCount = $derived(calculateTotalPages(totalItems, $itemsPerPage));
	let displayData = $derived(
		serverSide ? sortedData : paginateData(sortedData, $currentPage, $itemsPerPage)
	);
	let allSelected = $derived(
		displayData.length > 0 && displayData.every((row) => $selectedIds.has(row[rowKey as keyof T]))
	);
	let someSelected = $derived(displayData.some((row) => $selectedIds.has(row[rowKey as keyof T])));

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
			onfilter?.(state);
		}, FILTER_DEBOUNCE_MS);
	}

	function handleSort(columnKey: string, ctrlKey: boolean) {
		const currentSorts = sort ? [...sort] : [];
		const existingIndex = currentSorts.findIndex((s) => s.key === columnKey);

		let newSortState: SortConfig[];

		if (!ctrlKey) {
			// SINGLE SORT LOGIC
			if (existingIndex !== -1 && currentSorts.length === 1) {
				if (currentSorts[existingIndex].direction === 'asc') {
					newSortState = [{ key: columnKey, direction: 'desc' }];
				} else {
					newSortState = [];
				}
			} else {
				newSortState = [{ key: columnKey, direction: 'asc' }];
			}
		} else {
			// MULTI SORT LOGIC
			newSortState = currentSorts;
			if (existingIndex !== -1) {
				if (currentSorts[existingIndex].direction === 'desc') {
					newSortState.splice(existingIndex, 1);
				} else {
					newSortState[existingIndex] = { ...currentSorts[existingIndex], direction: 'desc' };
				}
			} else {
				newSortState.push({ key: columnKey, direction: 'asc' });
			}
		}

		const finalSort = newSortState.length > 0 ? newSortState : null;
		sort = finalSort || [];
		onsort?.(finalSort);
	}

	function handleGlobalFilter(value: string) {
		$filterState.global = value;
		debouncedDispatchFilter($filterState);
	}

	function handleLiveFilterChange(key: string, value: any) {
		// Create a new object to ensure Svelte reactivity
		$filterState.columns = { ...$filterState.columns, [key]: value };
		debouncedDispatchFilter($filterState);
	}

	function handleApplyDrawerFilters(filters: Record<string, any>) {
		$filterState.columns = filters;
		// Dispatch immediately without debounce for drawer's "Apply" button
		if (serverSide) $isLoading = true;
		onfilter?.($filterState);
	}

	function resetColumnFilters() {
		$filterState.columns = {};
		debouncedDispatchFilter($filterState);
	}

	function handleSelectAll(selected: boolean) {
		if (selectionMode === 'multiple') {
			const newSelectedIds = new Set($selectedIds);
			if (selected) {
				displayData.forEach((row) => newSelectedIds.add(row[rowKey as keyof T]));
			} else {
				displayData.forEach((row) => newSelectedIds.delete(row[rowKey as keyof T]));
			}
			$selectedIds = newSelectedIds;
			onselectionChange?.(Array.from(newSelectedIds));
		}
	}

	function handleSelect(row: T, selected: boolean) {
		let newSelectedIds: Set<any>;

		if (selectionMode === 'single') {
			newSelectedIds = new Set();
			if (selected) {
				newSelectedIds.add(row[rowKey as keyof T]);
			}
		} else {
			newSelectedIds = new Set($selectedIds);
			if (selected) {
				newSelectedIds.add(row[rowKey as keyof T]);
			} else {
				newSelectedIds.delete(row[rowKey as keyof T]);
			}
		}

		$selectedIds = newSelectedIds;
		onselectionChange?.(Array.from(newSelectedIds));
	}

	function handlePageChange(page: number) {
		$currentPage = page;
		onpageChange?.(page);
	}

	function handleItemsPerPageChange(ipp: number) {
		$itemsPerPage = ipp;
		$currentPage = 1; // Reset to first page
		onitemsPerPageChange?.(ipp);
	}

	function handleSwipe(row: T, direction: 'left' | 'right') {
		// handle swipe
	}

	export function clearSelection() {
		$selectedIds = new Set();
		onselectionChange?.([]);
	}

	function selectAllOnPage() {
		if (selectionMode === 'multiple') {
			const newSelectedIds = new Set($selectedIds);
			displayData.forEach((row) => newSelectedIds.add(row[rowKey as keyof T]));
			$selectedIds = newSelectedIds;
			onselectionChange?.(Array.from(newSelectedIds));
		}
	}

	function handleDeleteSelected() {
		ondeleteSelected?.(Array.from($selectedIds));
	}

	function toggleColumnVisibility(key: string) {
		internalColumns = internalColumns.map((col) =>
			col.key === key ? { ...col, hidden: !col.hidden } : col
		);
	}

	function handleSortSave(newSortState: SortConfig[]) {
		onsort?.(newSortState.length > 0 ? newSortState : null);
	}

	function handleFilterSave(advancedFilter: import('./types').AdvancedFilterState) {
		$filterState = { ...$filterState, advanced: advancedFilter };
		debouncedDispatchFilter($filterState);
	}

</script>

<SortModal
	isOpen={isSortModalOpen}
	columns={internalColumns}
	currentSort={sort ?? []}
	onclose={() => (isSortModalOpen = false)}
	onsave={handleSortSave}
/>

<FilterModal
	isOpen={isFilterModalOpen}
	columns={internalColumns}
	currentFilter={$filterState.advanced ?? { conditions: [], logic: 'AND' }}
	onclose={() => (isFilterModalOpen = false)}
	onsave={handleFilterSave}
/>

<div
	class="flex {containerHeight} flex-col gap-0 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-xl"
>
	<!-- Unified Scroll Container - Handles both horizontal and vertical scrolling correctly -->
	<div class="flex-1 overflow-auto bg-base-100" id="super-table-scroll-root">
		<!-- Section 1: Global filter and general actions -->
		<div class="z-40 w-full border-b border-base-200 bg-base-100 p-4">
			<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<!-- Global Filter Area -->
				<div class="min-w-0 flex-1">
					{#if globalFilter}
						{@render globalFilter({
							searchTerm: $filterState.global,
							updateSearchTerm: handleGlobalFilter
						})}
					{:else}
						<FilterInput value={$filterState.global || ''} oninput={(val) => handleGlobalFilter(val)} />
					{/if}
					{#if customFilters}
						{@render customFilters()}
					{/if}
				</div>

				<!-- Toolbar -->
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2 lg:flex-nowrap">
					<!-- Column Visibility -->
					<div class="dropdown">
						<div tabindex="0" role="button" class="btn btn-ghost btn-sm border border-base-300">
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
							class="menu dropdown-content z-[40] w-52 rounded-box bg-base-100 p-2 shadow-2xl"
						>
							{#each internalColumns as column (column.key)}
								<li>
									<label class="label cursor-pointer">
										<span class="label-text">{column.label}</span>
										<input
											type="checkbox"
											class="checkbox checkbox-sm checkbox-primary"
											checked={!column.hidden}
											onchange={() => toggleColumnVisibility(String(column.key))}
										/>
									</label>
								</li>
							{/each}
						</ul>
					</div>

					<!-- Sort Modal Button -->
					<div class="tooltip tooltip-bottom z-50" data-tip="Manage sort">
						<button class="btn btn-circle btn-ghost btn-sm" onclick={() => (isSortModalOpen = true)}>
							<ArrowUpDown class="h-4 w-4" />
						</button>
					</div>

					<!-- Filter Modal Button -->
					<div class="tooltip tooltip-bottom z-50" data-tip="Manage filter">
						<button
							class="btn btn-circle btn-ghost btn-sm relative {($filterState.advanced?.conditions?.length ?? 0) > 0 ? 'text-primary' : ''}"
							onclick={() => (isFilterModalOpen = true)}
							id="manage-filter-btn"
						>
							<ListFilter class="h-4 w-4" />
							{#if ($filterState.advanced?.conditions?.length ?? 0) > 0}
								<span class="badge badge-primary badge-xs absolute right-0 top-0 font-bold">{$filterState.advanced?.conditions?.length ?? 0}</span>
							{/if}
						</button>
					</div>

					<!-- Mobile Filter Drawer Button -->
					{#if isMobile && mobileView === 'cards'}
						<button
							class="btn btn-outline btn-sm relative"
							onclick={() => (isFilterDrawerOpen = !isFilterDrawerOpen)}
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
							onclose={() => (isFilterDrawerOpen = false)}
							onapplyFilters={handleApplyDrawerFilters}
							onreset={resetColumnFilters}
						/>
					{/if}
				</div>
			</div>
		</div>

		<!-- Main table section - Horizontal scroll handled by parent #super-table-scroll-root -->
		<div class="p-0 min-w-full inline-block align-top">
			{#if isMobile && mobileView === 'cards'}
				<!-- Mobile Card View -->
				<div class="w-full">
					{#if $isLoading}
						{#if loadingState}
							{@render loadingState()}
						{:else}
							<div class="flex w-full justify-center p-8">
								<span class="loading loading-spinner"></span>
							</div>
						{/if}
					{:else if data.length === 0}
						{#if emptyState}
							{@render emptyState()}
						{:else}
							<div class="p-8 text-center text-base-content/70">No data available</div>
						{/if}
					{:else}
						<div class="space-y-2 p-4">
							{#each displayData as row (String(row[rowKey as keyof T]))}
								<TableRowMobileCard
									{row}
									columns={internalColumns}
									rowKey={String(rowKey)}
									isSelectable={true}
									className={typeof rowClass === 'function' ? rowClass(row) : rowClass}
									{cardClass}
									{maxVisibleColumns}
									onselect={handleSelect}
									onswipe={handleSwipe}
									disabled={(disabledRowKeys || []).includes(row[rowKey as keyof T])}
									{rowActions}
									onclick={onrowClick ? (row) => onrowClick!(row) : undefined}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<!-- Desktop Table View -->
				<table class="table table-md w-full {tableClass}">
					<TableHeader
						columns={internalColumns}
						currentSort={sort ?? null}
						filterValues={$filterState.columns}
						isSelectable={true}
						{allSelected}
						{someSelected}
						onsort={handleSort}
						onfilterChange={handleLiveFilterChange}
						onreset={resetColumnFilters}
						onselectAll={handleSelectAll}
					/>
					<tbody>
						{#if dbError}
							<tr>
								<td
									colspan={internalColumns.filter((c) => !c.hidden).length + 2}
									class="p-8 text-center text-error"
								>
									{#if errorState}
										{@render errorState()}
									{:else}
										Gagal memuat data. Silakan coba lagi.
									{/if}
								</td>
							</tr>
						{:else if $isLoading}
							<tr>
								<td
									colspan={internalColumns.filter((c) => !c.hidden).length + 2}
									class="p-8 text-center"
								>
									{#if loadingState}
										{@render loadingState()}
									{:else}
										<span class="loading loading-spinner"></span>
									{/if}
								</td>
							</tr>
						{:else if data.length === 0}
							<tr>
								<td
									colspan={internalColumns.filter((c) => !c.hidden).length + 2}
									class="p-8 text-center text-base-content/70"
								>
									{#if emptyState}
										{@render emptyState()}
									{:else}
										No data available
									{/if}
								</td>
							</tr>
						{:else}
							{#each displayData as row (String(row[rowKey as keyof T]))}
								<TableRowDesktop
									{row}
									columns={internalColumns}
									rowKey={String(rowKey)}
									isSelectable={true}
									className={typeof rowClass === 'function' ? rowClass(row) : rowClass}
									onselect={handleSelect}
									onswipe={handleSwipe}
									disabled={(disabledRowKeys || []).includes(row[rowKey as keyof T])}
									{rowActions}
									onclick={() => onrowClick?.(row)}
								/>
							{/each}
						{/if}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<!-- Floating Bulk Actions Bar -->
	{#if selectionMode === 'multiple' && $selectedIds.size > 0}
		<div 
			transition:fly={{ y: 20, duration: 300 }}
			class="absolute bottom-20 left-1/2 -translate-x-1/2 z-50"
		>
			<div class="flex items-center gap-4 bg-neutral text-neutral-content px-6 py-3 rounded-full shadow-2xl">
				<div class="flex items-center gap-2 border-r border-neutral-content/20 pr-4">
					<span class="badge badge-primary font-bold">{$selectedIds.size}</span>
					<span class="text-sm font-medium">terpilih</span>
				</div>
				
				<div class="flex items-center gap-2">
					{#if bulkActions}
						{@render bulkActions({ selectedIds: Array.from($selectedIds) })}
					{/if}
					<button class="btn btn-error btn-sm rounded-full" onclick={handleDeleteSelected}>
						<Trash2 class="h-4 w-4" />
						Hapus
					</button>
				</div>

				<div class="border-l border-neutral-content/20 pl-4 ml-2">
					<button class="btn btn-ghost btn-sm btn-circle text-neutral-content/70 hover:text-white" onclick={clearSelection} title="Batal Pilih Semua">
						<XCircle class="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Sticky Pagination at the very bottom of the component -->
	<div
		class="flex-none sticky bottom-0 z-30 w-full border-t border-base-300 bg-base-100/95 p-2 px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] backdrop-blur-sm"
	>
		{#if !$isLoading && totalItems > 0}
			<PaginationControls
				currentPage={$currentPage}
				totalPages={totalPageCount}
				itemsPerPage={$itemsPerPage}
				{totalItems}
				onpageChange={handlePageChange}
				onitemsPerPageChange={handleItemsPerPageChange}
			/>
		{/if}
	</div>
</div>
