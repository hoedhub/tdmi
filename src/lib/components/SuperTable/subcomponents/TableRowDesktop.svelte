<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<script lang="ts" generics="T extends Record<string, any>">
	import type {
		ColumnDef,
		SwipeEvent,
		LongPressEvent,
		FormatterComponent,
		FormatterFunction,
		Formatter
	} from '../types';
	import { createEventDispatcher } from 'svelte';
	import { swipe } from '../actions/swipeAction';
	import { longPress } from '../actions/longPressAction';
	import { selectedIds } from '../stores';

	interface Props {
		row: T;
		columns: ColumnDef<T>[];
		rowKey: keyof T;
		isSelectable?: boolean;
		className?: string;
		disabled?: boolean;
		rowActions?: import('svelte').Snippet<[{ row: T }]>;
		onselect?: (row: T, selected: boolean) => void;
		onswipe?: (row: T, direction: 'left' | 'right') => void;
		onclick?: () => void;
	}

	let {
		row,
		columns,
		rowKey,
		isSelectable = false,
		className = '',
		disabled = false,
		rowActions,
		onselect,
		onswipe,
		onclick
	}: Props = $props();

	let isSelected = $derived($selectedIds.has(row[rowKey as keyof T]));

	function handleSwipe(event: SwipeEvent) {
		if (disabled) return;
		event.preventDefault();
		onswipe?.(row, event.detail.direction);
	}

	function handleLongPress(event: Event) {
		if (disabled) return;
		event.preventDefault();
		if (isSelectable) {
			onselect?.(row, !isSelected);
		}
	}

	function handleCheckboxChange(event: Event) {
		if (disabled) return;
		const target = event.target as HTMLInputElement;
		onselect?.(row, target.checked);
	}

	function isSvelteComponent<T>(formatter: Formatter<T>): formatter is FormatterComponent {
		return typeof formatter !== 'function';
	}
</script>

<tr
	class="group relative cursor-pointer hover:bg-base-200 [&_tbody_tr:nth-child(even)]:bg-base-200/50 {className} {isSelected
		? 'bg-base-200'
		: ''} {disabled ? 'disabled cursor-not-allowed opacity-50' : ''}"
	use:swipe
	use:longPress
	onswipe={handleSwipe}
	onlongpress={handleLongPress}
	onclick={(e) => {
		if (disabled) return;
		// If clicking the checkbox or an interactive element, don't trigger row click
		const target = e.target as HTMLElement;
		if (target.closest('.checkbox') || target.closest('button') || target.closest('a')) return;
		
		if (onclick) {
			onclick();
		} else if (isSelectable) {
			onselect?.(row, !isSelected);
		}
	}}
>
	{#if isSelectable}
		<td class="w-4 py-1">
			<input
				type="checkbox"
				class="checkbox checkbox-xs"
				checked={isSelected}
				aria-checked={isSelected}
				onchange={handleCheckboxChange}
				{disabled}
			/>
		</td>
	{/if}

	{#each columns.filter((col) => !col.hidden) as column}
		{@const value = row[String(column.key)]}
		<td
			class={`py-1 ${column.cellClass || ''} ${typeof column.cellClass === 'function' ? column.cellClass(value, row) : ''}`}
		>
			{#if column.formatter}
				{#if isSvelteComponent(column.formatter)}
					{@const Formatter = column.formatter}
					<Formatter {value} {row} {column} />
				{:else}
					{@html column.formatter(value, row, column)}
				{/if}
			{:else}
				{value}
			{/if}
		</td>
	{/each}

	<td class="py-1">
		{#if rowActions}
			{@render rowActions({ row })}
		{/if}
	</td>
</tr>

<style>
	tr {
		transition: transform 0.2s ease-out;
	}
</style>
