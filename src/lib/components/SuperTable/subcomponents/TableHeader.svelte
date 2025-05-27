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

	const handleFilterChange = debounce((column: ColumnDef, value: any) => {
		const columnKey = String(column.key);
		const newFilterValues = { ...filterValues, [columnKey]: value };
		dispatch('filter', { column, value, columnKey });
	}, 300);

	onDestroy(() => {
		handleFilterChange.cancel();
	});

	function handleSort(column: ColumnDef) {
		if (!column.sortable) return;

		if (currentSort?.key === column.key) {
			if (currentSort.direction === 'asc') {
				dispatch('sort', { key: column.key, direction: 'desc' });
			} else {
				dispatch('sort', null);
			}
		} else {
			dispatch('sort', { key: column.key, direction: 'asc' });
		}
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
	<tr>
		{#if isSelectable}
			<th class="w-4">
				<input
					type="checkbox"
					class="checkbox"
					checked={allSelected}
					indeterminate={someSelected && !allSelected}
					on:change={handleSelectAll}
					aria-label="Select all rows"
				/>
			</th>
		{/if}

		{#each columns.filter((col) => !col.hidden) as column}
			<th
				class="{column.headerClass || ''} {column.sortable ? 'cursor-pointer select-none' : ''}"
				on:click={() => handleSort(column)}
				aria-sort={currentSort?.key === column.key
					? currentSort.direction === 'asc'
						? 'ascending'
						: 'descending'
					: 'none'}
				role="columnheader"
				aria-label={`${column.label}${column.sortable ? '. Click to sort' : ''}`}
			>
				<div class="flex items-center gap-2">
					<span>{column.label}</span>
					{#if column.sortable}
						<span class="opacity-50">
							{#if currentSort?.key === column.key}
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

				{#if column.filterable}
					<div class="mt-2">
						{#if column.filterable === 'select' && column.filterOptions}
							<select
								class="select select-bordered select-sm w-full max-w-xs"
								value={getFilterValue(column)}
								on:change={(e) => handleFilterChange(column, e.currentTarget.value)}
								aria-label={`Filter by ${column.label}`}
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
						{:else if column.filterable === 'date'}
							<input
								type="date"
								class="input input-sm input-bordered w-full max-w-xs"
								value={getFilterValue(column)}
								on:change={(e) => handleFilterChange(column, e.currentTarget.value)}
								aria-label={`Filter ${column.label} by date`}
							/>
						{:else}
							<input
								type="text"
								class="input input-sm input-bordered w-full max-w-xs"
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

		<!-- Actions column header -->
		<th class="w-auto"></th>
	</tr>
</thead>

<style>
	th {
		position: relative;
		white-space: nowrap;
	}
</style>
