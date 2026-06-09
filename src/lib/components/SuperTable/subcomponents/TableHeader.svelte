<!-- TableHeader.svelte -->
<script lang="ts">
	import type { ColumnDef, SortConfig } from '../types';
	import { createEventDispatcher } from 'svelte';
	import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-svelte';

	interface Props {
		columns: ColumnDef[];
		currentSort: SortConfig[] | null;
		isSelectable?: boolean;
		allSelected?: boolean;
		someSelected?: boolean;
		filterValues?: Record<string, any>;
		onfilterChange?: (columnKey: string, value: any) => void;
		onsort?: (columnKey: string, ctrlKey: boolean) => void;
		onreset?: () => void;
		onselectAll?: (selected: boolean) => void;
	}

	let {
		columns,
		currentSort,
		isSelectable = false,
		allSelected = false,
		someSelected = false,
		filterValues = {},
		onfilterChange,
		onsort,
		onreset,
		onselectAll
	}: Props = $props();

	function handleFilterChange(columnKey: string, value: any) {
		onfilterChange?.(columnKey, value);
	}

	function handleSort(column: ColumnDef, event: MouseEvent) {
		if (!column.sortable) return;
		onsort?.(String(column.key), event.ctrlKey || event.metaKey);
	}

	function getSortForColumn(key: string): SortConfig | undefined {
		return currentSort?.find((s) => s.key === key);
	}

	function getSortIndex(key: string): number {
		if (!currentSort) return -1;
		return currentSort.findIndex((s) => s.key === key);
	}
</script>

<thead class="sticky top-0 z-30 bg-base-200 shadow-sm">
	<tr class="bg-base-200">
		<!-- Selection column header -->
		{#if isSelectable}
			<th class="w-1 pt-3 pb-1">
				<input
					type="checkbox"
					class="checkbox checkbox-xs"
					checked={allSelected}
					indeterminate={someSelected && !allSelected}
					onchange={(e) => onselectAll?.(e.currentTarget.checked)}
					aria-label="Select all rows"
				/>
			</th>
		{/if}

		{#each columns.filter((col) => !col.hidden) as column}
			{@const sortConfig = getSortForColumn(String(column.key))}
			{@const sortIndex = getSortIndex(String(column.key))}
			<th
				class="pt-3 pb-1 hover:bg-base-200 {column.headerClass || ''} {column.sortable
					? 'cursor-pointer select-none'
					: ''} {sortConfig ? 'text-primary' : ''}"
				onclick={(e) => handleSort(column, e)}
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
		<th class="w-auto"></th>
	</tr>

	<!-- Filter row -->
	<tr class="bg-base-200">
		{#if isSelectable}
			<th class="w-1"></th>
		{/if}

		{#each columns.filter((col) => !col.hidden) as column}
			<th class={column.headerClass || ''}>
				{#if column.filterable}
					<div class="mb-1">
						{#if column.filterOptions}
							<select
								class="select select-bordered select-xs w-full max-w-xs"
								value={filterValues[String(column.key)] || ''}
								onchange={(e) => handleFilterChange(String(column.key), e.currentTarget.value)}
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
								oninput={(e) => handleFilterChange(String(column.key), e.currentTarget.value)}
								aria-label={`Filter ${column.label}`}
							/>
						{/if}
					</div>
				{/if}
			</th>
		{/each}

		<!-- Actions column filter space -->
		<th class="w-auto px-2 align-bottom pt-0">
			<!-- Tombol Reset hanya muncul jika ada filter aktif -->
			{#if Object.entries(filterValues).some(([key, v]) => key !== 'propinsiName' && v && v !== 'All')}
				<button class="btn btn-ghost btn-xs -mb-1 text-error" onclick={() => onreset?.()}>
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
		border-top: none;
		padding-top: 0;
		padding-bottom: 0.375rem;
	}
</style>