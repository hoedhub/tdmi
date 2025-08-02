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
	export let className = '';
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		swipe: { row: T; direction: 'left' | 'right' };
		select: { row: T; selected: boolean };
	}>();

	$: isSelected = $selectedIds.has(row[rowKey]);

	function handleSwipe(event: SwipeEvent) {
		if (disabled) return;
		event.preventDefault();
		dispatch('swipe', { row, direction: event.detail.direction });
	}

	function handleLongPress(event: Event) {
		if (disabled) return;
		event.preventDefault();
		if (isSelectable) {
			dispatch('select', { row, selected: !isSelected });
		}
	}

	function handleCheckboxChange(event: Event) {
		if (disabled) return;
		const target = event.target as HTMLInputElement;
		dispatch('select', { row, selected: target.checked });
	}

	function isSvelteComponent<T>(formatter: Formatter<T>): formatter is FormatterComponent {
		return typeof formatter !== 'function' || formatter.prototype instanceof SvelteComponent;
	}
</script>

<tr
	class="group relative cursor-pointer hover:bg-base-200 [&_tbody_tr:nth-child(even)]:bg-base-200/50 {className} {isSelected
		? 'bg-base-200'
		: ''} {disabled ? 'disabled cursor-not-allowed opacity-50' : ''}"
	use:swipe
	use:longPress
	on:swipe={handleSwipe}
	on:longpress={handleLongPress}
	on:click={() => {
		if (isSelectable && !disabled) {
			dispatch('select', { row, selected: !isSelected });
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
				on:change={handleCheckboxChange}
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
					<svelte:component this={column.formatter} {value} {row} {column} />
				{:else}
					{@html column.formatter(value, row, column)}
				{/if}
			{:else}
				{value}
			{/if}
		</td>
	{/each}

	<td class="py-1">
		<slot name="row-actions" {row} />
	</td>
</tr>

<style>
	tr {
		transition: transform 0.2s ease-out;
	}
</style>
