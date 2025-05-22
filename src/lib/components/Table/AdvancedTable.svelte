<script lang="ts" generics="T extends Record<string, any> & { id?: string | number }">
	import { type Snippet } from 'svelte';
	import type {
		ColumnDefinition,
		ActionDefinition,
		FetchParams,
		FetchResult,
		TableRowData
	} from './types'; // Ensure TableRowData is imported if used in snippets
	import TableHeaderCell from './TableHeaderCell.svelte';
	import TableRow from './TableRow.svelte';
	import Pagination from './Pagination.svelte';
	import { getProperty } from './utils'; // Import utility

	// --- Props ---
	// Define expected snippet parameter types explicitly
	type FilterRendererParams = { updateFilter: (key: string, value: any) => void };
	type BulkActionsRendererParams<RowType extends TableRowData> = { selectedItems: RowType[] };

	interface Props {
		data?: T[]; // Client-side data source
		columns: ColumnDefinition<T>[];
		rowKey: keyof T; // MANDATORY: Unique key for each row (used for selection, reactivity)
		fetchData?: (params: FetchParams<T>) => Promise<FetchResult<T>>; // Server-side data source function
		actions?: ActionDefinition<T>[]; // Row actions definition
		tableId?: string; // Use standard 'id' attribute
		// Configuration Props
		loading?: boolean; // External control for loading state
		error?: string | null; // External control for error state
		pagination?: boolean; // Enable/disable pagination footer
		defaultPageSize?: number;
		defaultSortKey?: keyof T | string | null;
		defaultSortDirection?: 'asc' | 'desc';
		allowSelection?: boolean; // Enable/disable row selection checkboxes
		tableClass?: string; // Additional classes for the <table> element
		// Snippets / Slots (Corrected Types)
		emptyState?: Snippet; // No params needed for basic empty state
		loadingState?: Snippet; // No params needed for basic loading state
		filterRenderer?: Snippet<[FilterRendererParams]>; // Pass params object in an array
		bulkActionsRenderer?: Snippet<[BulkActionsRendererParams<T>]>; // Pass params object in an array
	}

	const {
		data: externalData = $bindable([]),
		columns,
		rowKey,
		fetchData,
		actions = [],
		tableId = undefined, // Use standard 'id'
		loading: externalLoading = false,
		error: externalError = null,
		pagination = true,
		defaultPageSize = 10,
		defaultSortKey = null,
		defaultSortDirection = 'asc',
		allowSelection = true,
		tableClass = 'table-zebra w-full', // Default DaisyUI classes
		emptyState = undefined,
		loadingState = undefined,
		filterRenderer = undefined,
		bulkActionsRenderer = undefined
	}: Props = $props();

	// --- Internal State ---
	let internalData = $state<T[]>(externalData ?? []); // Holds data from fetch or client prop
	let totalItems = $state(0); // Total items count (especially for server-side)
	let currentPage = $state(1);
	let pageSize = $state(defaultPageSize);
	let sortKey = $state<keyof T | string | null>(defaultSortKey);
	let sortDirection = $state<'asc' | 'desc'>(defaultSortDirection);
	let globalFilter = $state(''); // Phase 4: Global Search Term
	let globalFilterTimeout: ReturnType<typeof setTimeout>; // Timer for debouncing
	let columnFilters = $state<Record<string, any>>({}); // Phase 7: Per-column filters
	let selectedRows = $state<Set<string | number>>(new Set()); // Phase 5: Selection state (using rowKey values)
	let isLoading = $state(externalLoading); // Phase 6: Loading state
	let internalError = $state<string | null>(externalError); // Phase 6: Error state
	let columnVisibility = $state<Record<string, boolean>>({}); // State to manage column visibility
	let isSelectionMode = $state(false); // State to track if multi-selection mode is active

	// --- Derived State ---
	const isServerSide = $derived(!!fetchData);
	const rowKeyStr = $derived(String(rowKey));

	// Restore $derived signal definitions
	let _clientFilteredDataSignal = $derived(() => {
		if (isServerSide || !internalData) return internalData ?? [];
		let items = internalData;
		const lowerGlobalFilter = globalFilter.toLowerCase();
		const currentColumnFilters = columnFilters;
		if (lowerGlobalFilter) {
			items = items.filter((row) =>
				columns.some((col) => {
					if (col.filterable !== false) {
						const value = String(getProperty(row, String(col.key)) ?? '').toLowerCase();
						return value.includes(lowerGlobalFilter);
					}
					return false;
				})
			);
		}
		Object.entries(currentColumnFilters).forEach(([key, filterValue]) => {
			if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
				items = items.filter((row) =>
					String(getProperty(row, key) ?? '')
						.toLowerCase()
						.includes(String(filterValue).toLowerCase())
				);
			}
		});
		return items;
	});
	let _clientSortedDataSignal = $derived(() => {
		const dataToSort = clientFilteredData();
		const currentSortKey = sortKey;
		const currentSortDirection = sortDirection;
		if (isServerSide || !dataToSort || !currentSortKey) return dataToSort ?? [];
		const sk = currentSortKey;
		const dir = currentSortDirection === 'asc' ? 1 : -1;
		return [...dataToSort].sort((a, b) => {
			const valA = getProperty(a, String(sk));
			const valB = getProperty(b, String(sk));
			if (valA < valB) return -1 * dir;
			if (valA > valB) return 1 * dir;
			return 0;
		});
	});
	let _clientPagedDataSignal = $derived(() => {
		const dataToPage = clientSortedData();
		if (isServerSide || !dataToPage) return dataToPage ?? [];
		const start = (currentPage - 1) * pageSize;
		const end = start + pageSize;
		return dataToPage.slice(start, end);
	});
	let clientFilteredData = $derived(_clientFilteredDataSignal);
	let clientSortedData = $derived(_clientSortedDataSignal);
	let clientPagedData = $derived(_clientPagedDataSignal);
	let displayData = $derived(() => (isServerSide ? internalData : clientPagedData()));
	const finalTotalItems = $derived(isServerSide ? totalItems : clientFilteredData().length);
	const totalPages = $derived(Math.ceil(finalTotalItems / pageSize));
	const getRowId = (row: T): string | number => getProperty(row, rowKeyStr) ?? '';
	const displayedRowIds = $derived(() => new Set(displayData().map(getRowId)));
	const selectedDisplayedRowCount = $derived(() => {
		let count = 0;
		const currentSelectedRows = selectedRows;
		const currentDisplayedIds = displayedRowIds();
		currentSelectedRows.forEach((id) => {
			if (currentDisplayedIds.has(id)) count++;
		});
		return count;
	});
	const selectAllChecked = $derived(
		allowSelection &&
			displayedRowIds().size > 0 &&
			selectedDisplayedRowCount() === displayedRowIds().size
	);
	const selectAllIndeterminate = $derived(
		allowSelection &&
			selectedDisplayedRowCount() > 0 &&
			selectedDisplayedRowCount() < displayedRowIds().size
	);
	let selectedItemsData = $derived(() => {
		if (!allowSelection || selectedRows.size === 0) return [];
		const sourceData = isServerSide ? internalData : (externalData ?? []);
		const currentSelectedRows = selectedRows;
		return sourceData.filter((item) => currentSelectedRows.has(getRowId(item)));
	});
	const finalColumns = $derived(
		columns.filter((c) => {
			const isHiddenByProp = c.hidden ?? false;
			const isHiddenByToggle = columnVisibility[String(c.key)] ?? false;
			return !isHiddenByProp && !isHiddenByToggle;
		})
	);

	const visibleColumnKeys = $derived(new Set(finalColumns.map((c) => c.key)));

	// --- Effects --- (Mostly unchanged, but ensure dependencies are correctly captured)
	$effect(() => {
		isLoading = externalLoading;
	});
	$effect(() => {
		internalError = externalError;
	});
	$effect(() => {
		if (!isServerSide && externalData) {
			internalData = externalData;
			totalItems = externalData.length; // Update totalItems for client-side data
		}
	});

	// Effect to exit selection mode when selectedRows becomes empty
	$effect(() => {
		if (isSelectionMode && selectedRows.size === 0) {
			isSelectionMode = false;
		}
	});
	$effect(() => {
		if (!isServerSide || !fetchData) return;
		// Dependencies: fetchData, currentPage, pageSize, sortKey, sortDirection, columnFilters, globalFilter
		const fetchDataFn = fetchData;
		let aborted = false;
		const params: FetchParams<T> = {
			page: currentPage,
			pageSize,
			sortKey,
			sortDirection,
			filters: { ...columnFilters, global: globalFilter }
		};
		const loadData = async () => {
			isLoading = true;
			internalError = null;
			try {
				const result = await fetchDataFn(params);
				if (!aborted) {
					// Check if the effect was aborted during the async operation
					internalData = result.data;
					totalItems = result.totalItems;
				}
			} catch (e: any) {
				if (!aborted) {
					console.error('Error fetching data:', e);
					internalError = e.message || 'An error occurred while fetching data.';
					internalData = []; // Clear data on error
					totalItems = 0;
				}
			} finally {
				if (!aborted) {
					isLoading = false;
				}
			}
		};
		loadData();
		return () => {
			aborted = true;
		};
	});

	// --- Event Handlers ---
	function handleSort(key: keyof T | string) {
		/* ... */
	}
	function handlePageChange(newPage: number) {
		currentPage = newPage;
	}
	function handlePageSizeChange(newPageSize: number) {
		pageSize = newPageSize;
		currentPage = 1; // Reset to first page when page size changes
	}

	function handleGlobalFilterInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		clearTimeout(globalFilterTimeout);
		globalFilterTimeout = setTimeout(() => {
			globalFilter = value;
			if (currentPage !== 1) currentPage = 1; // Reset to first page on filter change
		}, 600); // 300ms debounce delay
	}
	function updateColumnFilter(key: string, value: any) {
		/* ... */
	}

	function toggleRowSelection(row: T) {
		if (!allowSelection) return; // Only toggle if selection is allowed
		const id = getRowId(row);
		const newSet = new Set(selectedRows);

		if (newSet.has(id)) {
			// If the clicked row is already selected, deselect it.
			newSet.delete(id);
		} else {
			// If the clicked row is not selected, add it to the selection.
			newSet.add(id);
		}

		selectedRows = newSet;

		// Update selection mode based on the new selection size
		isSelectionMode = selectedRows.size > 0;
	}

	// function toggleRowSelection(row: T) {
	// 	if (!allowSelection) return;
	// 	const id = getRowId(row);
	// 	const newSet = new Set(selectedRows);
	// 	if (newSet.has(id)) newSet.delete(id);
	// 	else newSet.add(id);
	// 	selectedRows = newSet;
	// }
	function toggleSelectAll() {
		if (!allowSelection) return;
		const newSet = new Set(selectedRows);
		const allSelected = selectAllChecked; // Use derived value
		const currentDisplayData = displayData(); // Use unwrapped value

		if (allSelected) {
			// If currently all are selected, deselect all displayed rows
			currentDisplayData.forEach((row: T) => {
				const id = getRowId(row);
				newSet.delete(id);
			});
		} else {
			// If not all are selected, add all displayed rows to the selection
			currentDisplayData.forEach((row: T) => {
				const id = getRowId(row);
				newSet.add(id);
			});
		}

		selectedRows = newSet;
		// Update selection mode based on the new selection size
		isSelectionMode = selectedRows.size > 0;
	}

	function handleRowLongPress(row: T) {
		if (!allowSelection) return;
		// Initiate selection mode and select the row
		isSelectionMode = true; // Enter selection mode
		selectedRows = new Set([getRowId(row)]); // Select only the long-pressed row initially
	}
</script>

<div class="advanced-table-wrapper space-y-4">
	<!-- Filter Area -->
	<div class="filter-area flex flex-wrap items-center gap-4">
		<label class="input input-bordered input-sm flex items-center gap-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4 opacity-70"
				><path
					fill-rule="evenodd"
					d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
					clip-rule="evenodd"
				/></svg
			>
			<input
				type="text"
				class="grow"
				placeholder="Search..."
				value={globalFilter}
				oninput={handleGlobalFilterInput}
			/>
			{#if globalFilter}
				<button
					type="button"
					class="btn btn-ghost btn-xs text-lg"
					onclick={() => {
						globalFilter = '';
						clearTimeout(globalFilterTimeout); // Clear any pending debounce
						if (currentPage !== 1) currentPage = 1; // Reset to first page
					}}
					aria-label="Clear search filter"
				>
					&Cross;
				</button>
			{/if}
		</label>
		{#if filterRenderer}
			{@render filterRenderer({ updateFilter: updateColumnFilter })}
		{/if}
	</div>

	<!-- Bulk Actions Area -->
	<div class="bulk-actions-area bg-base-200 sticky top-0 z-20 flex items-center rounded-lg p-2">
		{#if isSelectionMode}
			<!-- Select All button for mobile -->
			<div class="flex items-center md:hidden">
				<button
					type="button"
					class="btn btn-sm btn-outline btn-primary"
					onclick={toggleSelectAll}
					aria-label="Select all visible rows"
				>
					Select All
				</button>
			</div>
		{/if}
		{#if allowSelection && selectedRows.size > 0}
			<div class="flex items-center gap-4">
				<button
					type="button"
					class="btn btn-ghost btn-xs -mr-4 text-lg"
					onclick={() => {
						selectedRows = new Set(); // Clear selection
					}}
					aria-label="Clear selection"
				>
					&Cross; <span class="text-xs">{selectedRows.size} selected</span>
				</button>
				{#if bulkActionsRenderer}
					{@render bulkActionsRenderer({ selectedItems: selectedItemsData() })}
				{:else}
					<!-- Default bulk action button -->
					<button
						class="btn btn-sm btn-error btn-outline"
						onclick={() => console.log('Default Delete selected:', selectedItemsData())}
					>
						Delete Selected
					</button>
				{/if}
			</div>
		{/if}

		<div class="ml-auto">
			<!-- Column Visibility Dropdown -->
			<div class="dropdown dropdown-end !relative z-[1000]" style="z-index: 1000;">
				<div
					role="button"
					tabindex="0"
					class="btn btn-sm"
					aria-haspopup="true"
					aria-expanded="false"
					aria-label="Toggle column visibility"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-columns"
					>
						<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
						<line x1="12" y1="3" x2="12" y2="21" />
					</svg>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg
					>
				</div>
				<div
					role="listbox"
					tabindex="-1"
					class="dropdown-content menu bg-base-100/85 rounded-box !z-50 w-52 border-[0.5px] p-2 shadow"
				>
					{#each columns as column}
						<div
							role="option"
							class="px-2 py-1"
							aria-selected={!columnVisibility[String(column.key)]}
						>
							<label class="label flex cursor-pointer items-center justify-between">
								<span class="label-text">{column.label}</span>
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									checked={!columnVisibility[String(column.key)]}
									onchange={(e) => {
										columnVisibility = {
											...columnVisibility,
											[String(column.key)]: !(e.target as HTMLInputElement).checked
										};
									}}
								/>
							</label>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto">
		<table class={`table ${tableClass}`} id={tableId}>
			<thead class="bg-base-200 hidden md:table-header-group">
				<tr>
					{#if allowSelection}
						<th class="bg-base-200 group sticky left-0 z-10 w-1">
							<label>
								<input
									type="checkbox"
									class="checkbox checkbox-sm transition-opacity group-hover:opacity-100"
									class:opacity-0={!selectAllChecked && !selectAllIndeterminate}
									checked={selectAllChecked}
									indeterminate={selectAllIndeterminate}
									onchange={toggleSelectAll}
									aria-label="Select all rows on this page"
								/>
							</label>
						</th>
					{/if}
					{#each finalColumns as column (column.key)}
						<TableHeaderCell
							{column}
							currentSortKey={sortKey}
							currentSortDirection={sortDirection}
							on:sort={() => handleSort(column.key)}
						/>
					{/each}
					{#if actions.length > 0}
						<th class="bg-base-200 sticky right-0 z-10 pr-4 text-right">Actions</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#if isLoading}
					{#if loadingState}
						{@render loadingState()}
					{:else}
						<!-- Loading state -->
					{/if}
				{:else if internalError}
					<!-- Error State -->
				{:else if displayData().length === 0}
					{#if emptyState}
						{@render emptyState()}
					{:else}
						<!-- Empty state -->
					{/if}
				{:else}
					{#each displayData() as row, i (getRowId(row))}
						<TableRow
							rowData={row}
							columns={finalColumns}
							rowIndex={i}
							{rowKey}
							{actions}
							{visibleColumnKeys}
							isSelected={allowSelection && selectedRows.has(getRowId(row))}
							on:toggleSelection={() => toggleRowSelection(row)}
							on:longPress={() => handleRowLongPress(row)}
							showSelection={allowSelection}
							{isSelectionMode}
						/>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination Footer -->
	{#if pagination && totalPages > 0 && !isLoading && !internalError}
		<Pagination
			{currentPage}
			{totalPages}
			{pageSize}
			{totalItems}
			on:pageChange={(e) => handlePageChange(e.detail)}
			on:pageSizeChange={(e) => handlePageSizeChange(e.detail)}
		/>
	{/if}
</div>

<style>
	/* ... */
</style>
