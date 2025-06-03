<!-- TableHeader.svelte -->
<script lang="ts">
	import type { ColumnDef, SortConfig } from '../types';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-svelte';
	import debounce from 'lodash.debounce';

	export let columns: ColumnDef[];
	export let currentSort: SortConfig | null;
	export let isSelectable: boolean = false;
	export let allSelected: boolean = false;
	export let someSelected: boolean = false;
	export let filterValues: Record<string, any> = {};

	const dispatch = createEventDispatcher();

	function handleFilterChange(column: ColumnDef, value: any) {
		console.log('[TableHeader] Processing filter change:', {
			column: column.key,
			value,
			filterType: column.filterable,
			currentValues: filterValues
		});

		const columnKey = String(column.key);
		const newFilterValues = { ...filterValues, [columnKey]: value };

		console.log('[TableHeader] Dispatching filter event');
		dispatch('filter', { column, value, columnKey });
	}

	function handleSort(column: ColumnDef) {
		if (!column.sortable) return;

		const columnKey = String(column.key);
		let newSort: SortConfig | null;
		if (!currentSort || currentSort.key !== columnKey) {
			// First click on this column - sort ascending
			newSort = { key: columnKey, direction: 'asc' };
		} else if (currentSort.direction === 'asc') {
			// Second click - switch to descending
			newSort = { key: columnKey, direction: 'desc' };
		} else {
			// Third click - remove sorting
			newSort = null;
		}
		dispatch('sort', newSort);
	}

	function handleSelectAll(event: Event) {
		const target = event.target as HTMLInputElement;
		dispatch('selectAll', { selected: target.checked });
	}

	// Helper function to safely get filter value
	function getFilterValue(column: ColumnDef): string {
		return filterValues[String(column.key)] || '';
	}
</script>

<thead>
	<tr class="bg-base-200/50">
		<!-- Selection column header -->
		{#if isSelectable}
			<th class="w-1 py-2">
				<input
					type="checkbox"
					class="checkbox checkbox-xs"
					checked={allSelected}
					indeterminate={someSelected && !allSelected}
					on:change={(e) => dispatch('selectAll', { selected: e.currentTarget.checked })}
					aria-label="Select all rows"
				/>
			</th>
		{/if}

		{#each columns.filter((col) => !col.hidden) as column}
			<th
				class="py-2 hover:bg-base-200 {column.headerClass || ''} {column.sortable
					? 'cursor-pointer select-none'
					: ''} {currentSort?.key === String(column.key) ? 'text-primary' : ''}"
				on:click={() => handleSort(column)}
				aria-sort={currentSort?.key === String(column.key)
					? currentSort.direction === 'asc'
						? 'ascending'
						: 'descending'
					: 'none'}
				role="columnheader"
				aria-label={`${column.label}${column.sortable ? '. Click to sort' : ''}`}
			>
				<div class="flex items-center justify-between gap-2">
					<span>{column.label}</span>
					{#if column.sortable}
						<span class="opacity-50">
							{#if currentSort?.key === String(column.key)}
								{#if currentSort.direction === 'asc'}
									<ChevronUp size={16} />
								{:else}
									<ChevronDown size={16} />
								{/if}
							{:else}
								<ChevronsUpDown size={16} />
							{/if}
						</span>
					{/if}
				</div>
			</th>
		{/each}

		<!-- Actions column header -->
		<th class="w-auto" />
	</tr>

	<!-- Filter row -->
	<tr class="border-t border-base-300 bg-base-200/50">
		{#if isSelectable}
			<th class="w-1" />
		{/if}

		{#each columns.filter((col) => !col.hidden) as column}
			<th class={column.headerClass || ''}>
				{#if column.filterable}
					<div class="mt-1">
						{#if column.filterOptions}
							<select
								class="select select-bordered select-xs w-full max-w-xs"
								value={getFilterValue(column)}
								on:change={(e) => handleFilterChange(column, e.currentTarget.value)}
								aria-label={`Filter ${column.label}`}
							>
								<option value="">All</option>
								{#each column.filterOptions as option}
									{#if typeof option === 'string'}
										<option value={option}>{option}</option>
									{:else}
										<option value={option.value}>{option.label}</option>
									{/if}
								{/each}
							</select>
						{:else}
							<input
								type="text"
								class="input input-xs input-bordered w-full max-w-xs"
								value={getFilterValue(column)}
								placeholder={`Filter ${column.label.toLowerCase()}...`}
								on:input={(e) => handleFilterChange(column, e.currentTarget.value)}
								aria-label={`Filter ${column.label}`}
							/>
						{/if}
					</div>
				{/if}
			</th>
		{/each}

		<!-- Actions column filter space -->
		<th class="w-auto" />
	</tr>
</thead>

<style>
	th {
		position: relative;
		white-space: nowrap;
		vertical-align: top !important;
	}

	/* Add border between header sections */
	thead tr:first-child {
		border-bottom: none;
	}

	thead tr:last-child th {
		border-top: 1px solid hsl(var(--b3));
		padding-top: 0.25rem;
		padding-bottom: 0.5rem;
	}
</style>
