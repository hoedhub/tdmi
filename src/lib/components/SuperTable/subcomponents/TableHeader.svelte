<!-- TableHeader.svelte -->
<script lang="ts">
	import type { ColumnDef, SortConfig } from '../types';
	import { createEventDispatcher } from 'svelte';
	import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-svelte';

	export let columns: ColumnDef[];
	export let currentSort: SortConfig[] | null;
	export let isSelectable: boolean = false;
	export let allSelected: boolean = false;
	export let someSelected: boolean = false;
	export let filterValues: Record<string, any> = {};

	const dispatch = createEventDispatcher();

	function handleFilterChange(columnKey: string, value: any) {
		dispatch('filterChange', { key: columnKey, value });
	}

	function handleSort(column: ColumnDef, event: MouseEvent) {
		if (!column.sortable) return;
		dispatch('sort', { key: String(column.key), ctrlKey: event.ctrlKey || event.metaKey });
	}

	function getSortForColumn(key: string): SortConfig | undefined {
		return currentSort?.find((s) => s.key === key);
	}

	function getSortIndex(key: string): number {
		if (!currentSort) return -1;
		return currentSort.findIndex((s) => s.key === key);
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
			{@const sortConfig = getSortForColumn(String(column.key))}
			{@const sortIndex = getSortIndex(String(column.key))}
			<th
				class="py-2 hover:bg-base-200 {column.headerClass || ''} {column.sortable
					? 'cursor-pointer select-none'
					: ''} {sortConfig ? 'text-primary' : ''}"
				on:click={(e) => handleSort(column, e)}
				aria-sort={sortConfig
					? sortConfig.direction === 'asc'
						? 'ascending'
						: 'descending'
					: 'none'}
				role="columnheader"
				aria-label={`${column.label}${column.sortable ? '. Click to sort' : ''}`}
			>
				<div class="flex items-center justify-between gap-2">
					<span>{column.label}</span>
					{#if column.sortable}
						<span class="relative opacity-50">
							{#if sortConfig}
								{#if sortConfig.direction === 'asc'}
									<ChevronUp size={16} />
								{:else}
									<ChevronDown size={16} />
								{/if}
								{#if sortIndex !== -1 && (currentSort?.length || 0) > 1}
									<span class="absolute -bottom-1 -right-1 text-xs">{sortIndex + 1}</span>
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
								value={filterValues[String(column.key)] || ''}
								on:change={(e) => handleFilterChange(String(column.key), e.currentTarget.value)}
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
								type="search"
								class="input input-xs input-bordered w-full max-w-xs"
								value={filterValues[String(column.key)] || ''}
								placeholder={`Filter ${column.label.toLowerCase()}...`}
								on:input={(e) => handleFilterChange(String(column.key), e.currentTarget.value)}
								aria-label={`Filter ${column.label}`}
							/>
						{/if}
					</div>
				{/if}
			</th>
		{/each}

		<!-- Actions column filter space -->
		<th class="w-auto px-2 align-bottom">
			<!-- Tombol Reset hanya muncul jika ada filter aktif -->
			{#if Object.values(filterValues).some((v) => v && v !== 'All')}
				<button class="btn btn-ghost btn-xs -mb-1 text-error" on:click={() => dispatch('reset')}>
					Reset
				</button>
			{/if}
		</th>
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
