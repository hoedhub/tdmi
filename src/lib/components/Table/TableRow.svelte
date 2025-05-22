<script lang="ts" generics="T extends Record<string, any>">
	import { createEventDispatcher } from 'svelte';
	import type { ColumnDefinition, ActionDefinition } from './types';
	import TableCell from './TableCell.svelte';
	// Import ActionMenu if it's created as a separate component
	import ActionMenu from './ActionMenu.svelte'; // Assuming ActionMenu handles the dropdown

	interface Props {
		rowData: T;
		columns: ColumnDefinition<T>[];
		rowIndex: number;
		rowKey: keyof T; // Key field for unique identification
		actions?: ActionDefinition<T>[];
		isSelected: boolean;
		showSelection: boolean; // Controls if the selection checkbox cell is rendered
		isSelectionMode: boolean; // New prop to indicate if multi-selection mode is active
		// expanded?: boolean; // Prop for future expansion state (Phase 7+)
		visibleColumnKeys: Set<string | number | symbol>; // Prop for column visibility
	}

	const {
		rowData,
		columns,
		// rowIndex, // Included but maybe not directly used in render yet
		rowKey,
		actions = [],
		isSelected = false,
		showSelection = false,
		isSelectionMode = false, // Initialize new prop
		// expanded = false, // For future use
		visibleColumnKeys // Use the new prop
	}: Props = $props();

	const dispatch = createEventDispatcher<{ toggleSelection: void; longPress: void; click: void }>(); // Add click event for potential future use or clarity

	let pressTimer: number | null = null;
	const LONG_PRESS_DURATION = 500; // milliseconds
	let longPressHandled = false; // Flag to prevent immediate click handling after long press

	function handleTouchStart() {
		pressTimer = window.setTimeout(() => {
			dispatch('longPress');
			longPressHandled = true; // Set flag after long press
			pressTimer = null; // Reset timer after long press
			// Reset the flag after a short delay to allow subsequent clicks
			setTimeout(() => {
				longPressHandled = false;
			}, 100); // Adjust delay as needed
		}, LONG_PRESS_DURATION);
	}

	function handleTouchEnd() {
		if (pressTimer !== null) {
			clearTimeout(pressTimer);
			pressTimer = null;
			// If it was a short press AND we are in selection mode AND long press wasn't just handled, toggle selection
			if (isSelectionMode && !longPressHandled) {
				dispatch('toggleSelection');
			} else if (!isSelectionMode && !longPressHandled) {
				// If not in selection mode and not a long press, dispatch a regular click event
				// The parent component (AdvancedTable) is responsible for handling the regular click event.
				dispatch('click');
			}
		}
		// If longPressHandled is true, this touchEnd is part of the long press sequence, do nothing.
	}

	function handleTouchMove() {
		if (pressTimer !== null) {
			clearTimeout(pressTimer);
			pressTimer = null;
		}
	}

	function handleSelectionChange() {
		dispatch('toggleSelection');
	}

	// Filter columns based on the passed visibleColumnKeys set
	const displayColumns = $derived(columns.filter((c) => visibleColumnKeys.has(c.key)));

	const rowId = $derived(rowData[rowKey] ?? `row-${Math.random()}`); // Fallback ID if key is missing
</script>

<tr
	class:active={isSelected}
	class="{isSelected
		? 'border-primary bg-gray-100 '
		: ''}group hover border-base-300 mb-4 block rounded-lg border p-4 shadow-md md:mb-0 md:table-row md:rounded-none md:border-0 md:p-0"
	ontouchstart={(e) => {
		if (window.innerWidth < 768) handleTouchStart();
	}}
	ontouchend={(e) => {
		if (window.innerWidth < 768) handleTouchEnd();
	}}
	ontouchmove={(e) => {
		if (window.innerWidth < 768) handleTouchMove();
	}}
	onmousedown={(e) => {
		if (window.innerWidth < 768) handleTouchStart();
	}}
	onmouseup={(e) => {
		if (window.innerWidth < 768) handleTouchEnd();
	}}
	onmouseleave={(e) => {
		if (window.innerWidth < 768) handleTouchEnd();
	}}
>
	<td class="sticky left-0 z-10 hidden w-1 md:table-cell md:w-auto">
		<label class="flex h-full items-center justify-center">
			<label class="flex h-full w-full items-center justify-center">
				<input
					type="checkbox"
					class="checkbox checkbox-xs transition-opacity group-hover:opacity-100"
					class:opacity-0={!isSelected}
					checked={isSelected}
					onchange={handleSelectionChange}
					aria-label={`Select row ${rowId}`}
				/>
			</label>
		</label>
	</td>
	{#each displayColumns as column (column.key)}
		<!-- Pass rowData, column definition, and computed cell value -->
		<td class="-mb-3 block p-0 md:hidden">
			<div class="mb-1 block text-sm font-bold md:hidden">
				{column.label}
			</div>
		</td>
		<TableCell cellValue={rowData[column.key]} {rowData} {column} />
	{/each}

	{#if actions.length > 0}
		<!-- Actions Cell (Phase 5) -->
		<td class="z-10 flex w-full justify-end py-2 md:sticky md:right-0">
			<!-- Needs sticky background handling -->
			<div class="flex h-full items-center justify-end pr-2">
				<ActionMenu {rowData} {actions} />
			</div>
		</td>
	{/if}
</tr>

<!-- Placeholder for Row Expansion Content (Phase 7) -->
{#if false}
	<!-- {#if expanded} -->
	<tr class="row-expansion">
		<td colspan={displayColumns.length + (showSelection ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
			<!-- {@render expansionSnippet({rowData})} -->
			<div>Expanded Content for row {rowId}</div>
		</td>
	</tr>
	<!-- {/if} -->
{/if}
