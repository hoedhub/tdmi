<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<!-- TableRowMobileCard.svelte -->
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
	import { getContext } from 'svelte';
	import { TABLE_CONTEXT_KEY, type TableStores } from '../stores';

	interface Props {
		row: T;
		columns: ColumnDef<T>[];
		rowKey: keyof T;
		isSelectable?: boolean;
		cardClass?: string;
		className?: string;
		maxVisibleColumns?: number;
		disabled?: boolean;
		rowActions?: import('svelte').Snippet<[{ row: T }]>;
		onselect?: (row: T, selected: boolean) => void;
		onswipe?: (row: T, direction: 'left' | 'right') => void;
		onclick?: (row: T) => void;
	}

	let {
		row,
		columns,
		rowKey,
		isSelectable = false,
		cardClass = '',
		className = '',
		maxVisibleColumns = undefined,
		disabled = false,
		rowActions,
		onselect,
		onswipe,
		onclick
	}: Props = $props();

	const stores = getContext<TableStores>(TABLE_CONTEXT_KEY);
	const selectedIds = stores.selectedIds;

	let isSelected = $derived($selectedIds.has(row[rowKey as keyof T]));
	let columnsData = $derived.by(() => {
		const visibleColumns = columns.filter((col) => !col.hidden);

		// New logic: columns without cardPriority are prioritized
		const columnsWithoutPriority = visibleColumns.filter(
			(col) => col.cardOverflowPriority === undefined
		);
		const columnsWithPriority = visibleColumns
			.filter((col) => col.cardOverflowPriority !== undefined)
			.sort((a, b) => (a.cardOverflowPriority ?? Infinity) - (b.cardOverflowPriority ?? Infinity));

		let initiallyVisible: ColumnDef<T>[] = [];
		let remainingColumns: ColumnDef<T>[] = [];

		if (maxVisibleColumns !== undefined && maxVisibleColumns >= 0) {
			initiallyVisible = columnsWithoutPriority.slice(0, maxVisibleColumns);
			remainingColumns = [
				...columnsWithoutPriority.slice(maxVisibleColumns),
				...columnsWithPriority
			];
		} else {
			initiallyVisible = columnsWithoutPriority;
			remainingColumns = columnsWithPriority;
		}

		return { prioritizedColumns: initiallyVisible, otherColumns: remainingColumns };
	});

	let prioritizedColumns = $derived(columnsData.prioritizedColumns);
	let otherColumns = $derived(columnsData.otherColumns);

	let showAllFields = $state(false);

	function handleLongPress(event: Event) {
		if (disabled) return;
		event.preventDefault();
		if (isSelectable) {
			onselect?.(row, !isSelected);
		}
	}

	function isSvelteComponent<T>(formatter: Formatter<T>): formatter is FormatterComponent {
		return typeof formatter !== 'function';
	}
</script>

<div
	role="button"
	tabindex="0"
	class="card {cardClass} {className} {isSelected ? 'ring-2 ring-primary' : ''} {disabled
		? 'disabled cursor-not-allowed opacity-50'
		: ''} {onclick && !disabled ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}"
	use:swipe
	use:longPress
	onlongpress={handleLongPress}
	onclick={(e) => {
		// Ignore if click came from checkbox or button inside the card
		const target = e.target as HTMLElement;
		if (target.closest('input, button, a')) return;
		if (!disabled) onclick?.(row);
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!disabled) onclick?.(row);
		}
	}}
>
	<!-- on:swipe={handleSwipe} -->
	<div class="card-body">
		{#if isSelectable}
			<div class="absolute right-2 top-2 rtl:left-2 rtl:right-auto">
				<input
					type="checkbox"
					class="checkbox"
					checked={isSelected}
					aria-checked={isSelected}
					onchange={() => {
						if (!disabled) {
							onselect?.(row, !isSelected);
						}
					}}
					{disabled}
				/>
			</div>
		{/if}

		{#each prioritizedColumns as column, i}
			{@const value = row[String(column.key)]}
			<div
				class="{i === 0 ? 'card-title' : ''} {column.cellClass || ''} {typeof column.cellClass ===
				'function'
					? column.cellClass(value, row)
					: ''}"
			>
				<span class="text-sm opacity-70">{column.label}:</span>
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
			</div>
		{/each}

		{#if otherColumns.length > 0}
			<div class="divider my-2"></div>

			<button class="btn btn-ghost btn-sm w-full" onclick={() => (showAllFields = !showAllFields)}>
				{showAllFields ? 'Show Less' : 'Show More'}
			</button>

			{#if showAllFields}
				{#each otherColumns as column}
					{@const value = row[String(column.key)]}
					<div
						class="mt-2 {column.cellClass || ''} {typeof column.cellClass === 'function'
							? column.cellClass(value, row)
							: ''}"
					>
						<span class="text-sm opacity-70">{column.label}:</span>
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
					</div>
				{/each}
			{/if}
		{/if}

		<div class="card-actions justify-end rtl:justify-start">
			{#if rowActions}
				{@render rowActions({ row })}
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">/*$$__STYLE_CONTENT__$$*/</style>
