<script lang="ts" generics="T extends Record<string, any>">
	// import type { SvelteComponent } from 'svelte';
	import type { ColumnDefinition } from './types';

	interface Props {
		cellValue: any; // The specific value for this cell
		rowData: T; // The data for the entire row
		column: ColumnDefinition<T>; // The definition for this column
		globalFilter?: string; // Add global filter prop for highlighting
	}

	const { cellValue, rowData, column, globalFilter = '' }: Props = $props();

	// Destructure column properties for easier access
	const {
		formatter, // Phase 7: Custom formatting function
		component: CustomComponent, // Phase 7: Custom Svelte component for rendering
		cellClass = '', // Custom classes for the <td>
		key: columnKey, // Column key
		label: columnLabel // Column label (used for data-label)
	} = column;

	// --- Cell Content Logic ---

	// Apply formatter if provided
	let formattedValue = $derived(formatter ? formatter(cellValue, rowData) : cellValue);

	// Determine if a custom component should be rendered
	const renderCustomComponent = $derived(!!CustomComponent);
</script>

<td
	class={`block w-full py-1 text-left md:table-cell md:w-auto md:text-left ${cellClass}`}
	data-label={columnLabel}
>
	{#if renderCustomComponent}
		<!-- Phase 7: Render custom Svelte component -->
		<CustomComponent value={cellValue} {rowData} {column} />
	{:else}
		<!-- Default rendering: display formatted value -->
		<!-- Handle potential HTML rendering if formatter returns safe HTML -->
		<!-- Warning: Only use {@html ...} if formatter explicitly sanitizes output! -->
		<!-- Apply highlighting if globalFilter is active and no custom component is used -->
		{#if globalFilter && typeof formattedValue === 'string'}
			{@html formattedValue.replace(
				new RegExp(`(${globalFilter})`, 'gi'),
				'<mark class="bg-yellow-300">$1</mark>' // Use DaisyUI/Tailwind class for highlighting
			)}
		{:else}
			{@html formattedValue}
		{/if}
	{/if}
</td>

<style>
	/* Add specific styles for TableCell if needed */
	/* Example for responsive stacking (requires CSS in parent/global scope) */
</style>
