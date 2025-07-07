<!-- TableRowMobileCard.svelte -->
<script lang="ts" generics="T extends Record<string, any>">
	import { SvelteComponent } from 'svelte';
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

	export let row: T;
	export let columns: ColumnDef<T>[];
	export let rowKey: keyof T;
	export let isSelectable = false;
	export let cardClass = '';
	export let className = '';
	export let maxVisibleColumns: number | undefined = undefined;

	const dispatch = createEventDispatcher<{
		swipe: { row: T; direction: 'left' | 'right' };
		select: { row: T; selected: boolean };
	}>();

	$: isSelected = $selectedIds.has(row[rowKey]);
	let prioritizedColumns: ColumnDef<T>[] = [];
	let otherColumns: ColumnDef<T>[] = [];

	$: {
		const visibleColumns = columns.filter((col) => !col.hidden);

		// New logic: columns without cardPriority are prioritized
		const columnsWithoutPriority = visibleColumns.filter(
			(col) => col.cardOverflowPriority === undefined
		);
		const columnsWithPriority = visibleColumns
			.filter((col) => col.cardOverflowPriority !== undefined)
			.sort((a, b) => (a.cardOverflowPriority ?? Infinity) - (b.cardOverflowPriority ?? Infinity)); // Still sort these for consistent "other" section

		let initiallyVisible: ColumnDef<typeof row>[] = [];
		let remainingColumns: ColumnDef<typeof row>[] = [];

		if (maxVisibleColumns !== undefined && maxVisibleColumns >= 0) {
			// If maxVisibleColumns is defined, take that many from columnsWithoutPriority
			initiallyVisible = columnsWithoutPriority.slice(0, maxVisibleColumns);
			// Remaining columns are the rest of columnsWithoutPriority + all columnsWithPriority
			remainingColumns = [
				...columnsWithoutPriority.slice(maxVisibleColumns),
				...columnsWithPriority
			];
		} else {
			// If maxVisibleColumns is not defined, all columns without priority are initially visible
			initiallyVisible = columnsWithoutPriority;
			// Other columns are all columns with priority
			remainingColumns = columnsWithPriority;
		}

		prioritizedColumns = initiallyVisible;
		otherColumns = remainingColumns;
	}

	let showAllFields = false;

	// function handleSwipe(event: SwipeEvent) {
	// 	event.preventDefault();
	// 	dispatch('swipe', { row, direction: event.detail.direction });
	// }

	function handleLongPress(event: Event) {
		event.preventDefault();
		if (isSelectable) {
			dispatch('select', { row, selected: !isSelected });
		}
	}

	function isSvelteComponent<T>(formatter: Formatter<T>): formatter is FormatterComponent {
		return typeof formatter !== 'function' || formatter.prototype instanceof SvelteComponent;
	}
</script>

<div
	class="card {cardClass} {className} {isSelected ? 'ring-2 ring-primary' : ''}"
	use:swipe
	use:longPress
	on:longpress={handleLongPress}
>
	<!-- on:swipe={handleSwipe} -->
	<div class="card-body">
		{#if isSelectable}
			<div class="absolute right-2 top-2">
				<input
					type="checkbox"
					class="checkbox"
					checked={isSelected}
					aria-checked={isSelected}
					on:change={() => dispatch('select', { row, selected: !isSelected })}
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
						<svelte:component this={column.formatter} {value} {row} {column} />
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

			<button class="btn btn-ghost btn-sm w-full" on:click={() => (showAllFields = !showAllFields)}>
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
								<svelte:component this={column.formatter} {value} {row} {column} />
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

		<div class="card-actions justify-end">
			<slot name="row-actions" {row} />
		</div>
	</div>
</div>

<style lang="postcss">
	.card {
		@apply bg-base-100 shadow-lg;
		transition: transform 0.2s ease-out;
	}

	.divider {
		@apply h-px bg-base-300;
	}
</style>
