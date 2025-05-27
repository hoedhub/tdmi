<!-- TableRowMobileCard.svelte -->
<script lang="ts">
    import { SvelteComponent } from 'svelte';
    import type { ColumnDef, SwipeEvent, LongPressEvent, FormatterComponent, FormatterFunction, Formatter } from '../types';
    import { createEventDispatcher } from 'svelte';
    import { swipe } from '../actions/swipeAction';
    import { longPress } from '../actions/longPressAction';
    import { selectedIds } from '../stores';

    export let row: Record<string, any>;
    export let columns: ColumnDef<typeof row>[];
    export let rowKey: string;
    export let isSelectable = false;
    export let cardClass = '';
    export let className = '';

    const dispatch = createEventDispatcher<{
        swipe: { row: Record<string, any>; direction: 'left' | 'right' };
        select: { row: Record<string, any>; selected: boolean };
    }>();
    
    $: isSelected = $selectedIds.has(row[rowKey]);
    let prioritizedColumns: ColumnDef<typeof row>[] = [];
    let otherColumns: ColumnDef<typeof row>[] = [];

    $: {
        const visibleColumns = columns.filter(col => !col.hidden);
        prioritizedColumns = visibleColumns
            .filter(col => col.cardPriority !== undefined)
            .sort((a, b) => (a.cardPriority ?? Infinity) - (b.cardPriority ?? Infinity));
        otherColumns = visibleColumns.filter(col => col.cardPriority === undefined);
    }
    
    let showAllFields = false;
    
    function handleSwipe(event: SwipeEvent) {
        event.preventDefault();
        dispatch('swipe', { row, direction: event.detail.direction });
    }

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
    on:swipe={handleSwipe}
    on:longpress={handleLongPress}
>
    <div class="card-body">
        {#if isSelectable}
            <div class="absolute top-2 right-2">
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
            <div class="{i === 0 ? 'card-title' : ''} {column.cellClass || ''} {typeof column.cellClass === 'function' ? column.cellClass(value, row) : ''}">
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
            
            <button 
                class="btn btn-sm btn-ghost w-full"
                on:click={() => showAllFields = !showAllFields}
            >
                {showAllFields ? 'Show Less' : 'Show More'}
            </button>

            {#if showAllFields}
                {#each otherColumns as column}
                    {@const value = row[String(column.key)]}
                    <div class="mt-2 {column.cellClass || ''} {typeof column.cellClass === 'function' ? column.cellClass(value, row) : ''}">
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
