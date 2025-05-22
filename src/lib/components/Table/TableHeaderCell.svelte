<script lang="ts" generics="T extends Record<string, any>">
	import { createEventDispatcher } from 'svelte';
	import type { ColumnDefinition } from './types';

	interface Props {
		column: ColumnDefinition<T>;
		currentSortKey: keyof T | string | null;
		currentSortDirection: 'asc' | 'desc';
		// Add props later for per-column filtering UI if needed
	}

	const { column, currentSortKey = null, currentSortDirection = 'asc' }: Props = $props();

	const dispatch = createEventDispatcher<{ sort: void }>();

	// Destructure column properties
	const {
		key: columnKey,
		label,
		sortable = false, // Phase 3: Default to not sortable
		headerClass = '' // Custom classes for the <th>
		// filterable // Phase 7: Used later for rendering filter UI
	} = column;

	// --- Derived State for Sorting ---
	const isCurrentSortColumn = $derived(currentSortKey === columnKey);
	const isSortAsc = $derived(isCurrentSortColumn && currentSortDirection === 'asc');
	const isSortDesc = $derived(isCurrentSortColumn && currentSortDirection === 'desc');
	const sortState = $derived(
		isCurrentSortColumn ? (isSortAsc ? 'ascending' : 'descending') : 'none'
	);

	function handleClick() {
		if (sortable) {
			dispatch('sort');
		}
	}
</script>

<!-- Move aria-sort to the th element -->
<th class={headerClass} scope="col" aria-sort={sortable ? sortState : undefined}>
	{#if sortable}
		<!-- Phase 3: Sortable header - Use a button for accessibility and clear click target -->
		<button
			type="button"
			class="btn btn-ghost btn-sm group flex w-full items-center justify-between gap-1 p-1"
			onclick={handleClick}
			aria-label={`Sort by ${label}${isCurrentSortColumn ? ` (${sortState})` : ''}`}
		>
			<span class="whitespace-nowrap">{label}</span>
			<!-- Sort Icons -->
			<span class="inline-flex h-4 w-4 flex-col opacity-50 group-hover:opacity-100">
				{#if isSortAsc}
					<!-- Ascending Arrow -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="-mb-1 h-3 w-3"
						><path
							fill-rule="evenodd"
							d="M8 14a.75.75 0 0 1-.75-.75V3.56l-1.97 1.97a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 1 1-1.06 1.06L8.75 3.56v9.69A.75.75 0 0 1 8 14Z"
							clip-rule="evenodd"
						/></svg
					>
				{:else if isSortDesc}
					<!-- Descending Arrow -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3 w-3"
						><path
							fill-rule="evenodd"
							d="M8 2a.75.75 0 0 1 .75.75v9.69l1.97-1.97a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 11.53a.75.75 0 1 1 1.06-1.06l1.97 1.97V2.75A.75.75 0 0 1 8 2Z"
							clip-rule="evenodd"
						/></svg
					>
				{:else}
					<!-- Default Unsorted Indicator (subtle, shows on hover/focus of button) -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-3 w-3 opacity-0 group-focus-within:opacity-50 group-hover:opacity-50"
						><path
							d="M4.75 8.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z"
						/></svg
					>
				{/if}
			</span>
		</button>
	{:else}
		<!-- Non-sortable header -->
		<div class="px-1 py-1">
			<!-- Match button padding roughly -->
			{label}
		</div>
	{/if}

	<!-- Placeholder for Per-Column Filter UI (Phase 7) -->
	<!--  -->
	{#if column.filterable}
		<div class="column-filter mt-1">
			<input type="text" placeholder="Filter {label}" class="input input-xs w-full" />
		</div>
	{/if}
	<!-- -->
</th>

<style>
	th {
		vertical-align: middle;
	}
	.btn span svg {
		transition: opacity 0.2s ease-in-out;
	}
</style>
