# TODO: SuperTable Component Development

## Phase 0: Project Setup & Initial Files (Pre-computation)

- [ ] **Verify Environment:** Confirm SvelteKit, DaisyUI, Lucide-Svelte, TailwindCSS, and testing libraries are correctly installed and configured.
- [ ] **Create Directory Structure:**
  - [ ] `src/lib/components/SuperTable/`
  - [ ] `src/lib/components/SuperTable/actions/`
  - [ ] `src/lib/components/SuperTable/features/`
  - [ ] `src/lib/components/SuperTable/subcomponents/` (can be populated as needed)
  - [ ] `src/lib/components/SuperTable/tests/`
  - [ ] `src/lib/components/SuperTable/tests/actions/`
  - [ ] `src/lib/components/SuperTable/tests/features/`

## Phase 1: Foundations - Types, Stores, Basic Component Shell

1.  **`SuperTable/types.ts` - Define Core Data Structures:**
    - [ ] Define `RowData<T = any>` generic type.
    - [ ] Define `ColumnDef<T = any>` interface:
      - [ ] `key: keyof T | string`
      - [ ] `label: string`
      - [ ] `sortable?: boolean`
      - [ ] `filterable?: boolean | 'text' | 'select' | 'date'` (initially `boolean | 'text' | 'select'`)
      - [ ] `filterOptions?: string[] | { label: string; value: any }[]`
      - [ ] `formatter?: (value: any, row: T, column: ColumnDef<T>) => string | ComponentType`
      - [ ] `headerClass?: string`
      - [ ] `cellClass?: string | ((value: any, row: T) => string)`
      - [ ] `responsiveShow?: 'always' | 'md' | 'lg'`
      - [ ] `cardPriority?: number`
      - [ ] `hidden?: boolean`
    - [ ] Define `SortDirection` type: `'asc' | 'desc'`.
    - [ ] Define `SortConfig` type: `{ key: string; direction: SortDirection } | null`.
    - [ ] Define `ColumnFilterValue` type (e.g., `string | number | null`).
    - [ ] Define `ColumnFiltersState` type: `Record<string, ColumnFilterValue>`.
    - [ ] Define `MobileViewType` type: `'cards' | 'table'`.
    - [ ] Define `SuperTableProps<T = any>` interface for main component props.

2.  **`SuperTable/stores.ts` - Establish Reactive State:**
    - [ ] `data: Writable<RowData<any>[]>` (initialized with `[]`)
    - [ ] `columns: Writable<ColumnDef<any>[]>` (initialized with `[]`)
    - [ ] `rowKeyStore: Writable<string | null>` (to hold `rowKey` prop)
    - [ ] `isLoading: Writable<boolean>` (initialized with `false`)
    - [ ] `itemsPerPage: Writable<number>` (initialized with `10`)
    - [ ] `mobileViewSetting: Writable<MobileViewType>` (initialized with `'cards'`)
    - [ ] `currentSort: Writable<SortConfig>` (initialized with `null`)
    - [ ] `globalSearchTerm: Writable<string>` (initialized with `''`)
    - [ ] `columnFilters: Writable<ColumnFiltersState>` (initialized with `{}`)
    - [ ] `selectedRowIds: Writable<Set<any>>` (initialized with `new Set()`)
    - [ ] `currentPage: Writable<number>` (initialized with `1`)
    - [ ] `clientWidth: Writable<number>` (for responsive logic, potentially from `bind:clientWidth` on a wrapper)
    - [ ] `isMobileView: Readable<boolean>` (derived from `clientWidth` and a breakpoint, e.g., 768px)
    - [ ] `filteredData: Readable<RowData<any>[]>` (derived from `data`, `globalSearchTerm`, `columnFilters` - initial simple pass-through)
    - [ ] `sortedData: Readable<RowData<any>[]>` (derived from `filteredData`, `currentSort` - initial simple pass-through)
    - [ ] `paginatedData: Readable<RowData<any>[]>` (derived from `sortedData`, `currentPage`, `itemsPerPage`)
    - [ ] `totalPages: Readable<number>` (derived from `sortedData.length`, `itemsPerPage`)
    - [ ] `isAllSelected: Readable<boolean>` (derived from `selectedRowIds` and `paginatedData` or `processedData` length)
    - [ ] `isIndeterminate: Readable<boolean>` (derived for "select all" checkbox state)

3.  **`SuperTable/index.ts` - Component Export Point:**
    - [ ] `export { default as SuperTable } from './SuperTable.svelte';`
    - [ ] `export * from './types';` (or specific types as needed for external use)

4.  **`SuperTable/SuperTable.svelte` - Initial Skeleton & Prop Handling:**
    - [ ] Import types and stores.
    - [ ] Define props: `data`, `columns`, `rowKey` (required), `isLoading`, `itemsPerPage`, `mobileView`, `initialSort`, etc.
    - [ ] Synchronize props with their respective stores (e.g., `$: dataStore.set(data)`).
    - [ ] Implement `bind:clientWidth` on a wrapper div.
    - [ ] Basic markup:
      - [ ] Main wrapper div.
      - [ ] Loading state slot: `{#if $isLoading} <slot name="loading-state">...</slot> {/if}` (default DaisyUI spinner).
      - [ ] Empty state slot: `{#if !$isLoading && $data.length === 0} <slot name="empty-state">...</slot> {/if}` (default "No data").
      - [ ] Conditional rendering for main content: `{#if !$isLoading && $data.length > 0}`.
    - [ ] `onMount` / `onDestroy` for any setup/teardown if needed.

5.  **`SuperTable/tests/SuperTable.spec.ts` - Basic Render Tests:**
    - [ ] Test component mounts without errors.
    - [ ] Test `loading-state` displays when `isLoading` is true.
    - [ ] Test `empty-state` displays when `data` is empty and not loading.
    - [ ] Test basic data prop passing (e.g., check if a simple render of `$paginatedData` shows item count).

## Phase 2: Desktop Table View - Structure & Static Display

6.  **`SuperTable/subcomponents/TableHeader.svelte` - Static Header:**
    - [ ] Props: `columns: ColumnDef[]`, `showSelectionCheckbox: boolean`, `isAllSelected: boolean`, `isIndeterminate: boolean`.
    - [ ] Markup: `<thead><tr> ... </tr></thead>`.
    - [ ] Render "Select All" checkbox (DaisyUI `checkbox`) if `showSelectionCheckbox` is true. Bind its `checked` and `indeterminate` state.
    - [ ] Loop `$columns` (`{#each $columns as column}`):
      - [ ] Render `<th>` for each visible column (`!column.hidden`).
      - [ ] Apply `column.headerClass`.
      - [ ] Display `column.label`.
    - [ ] Add `<th>` for actions column if planned.

7.  **`SuperTable/subcomponents/TableRowDesktop.svelte` - Static Row:**
    - [ ] Props: `row: RowData`, `columns: ColumnDef[]`, `rowKey: string`, `isSelected: boolean`, `showSelectionCheckbox: boolean`.
    - [ ] Markup: `<tr> ... </tr>`. Apply `class:active={$isSelected}`.
    - [ ] Render selection checkbox (DaisyUI `checkbox`) if `showSelectionCheckbox`. Bind `checked` to `$isSelected`.
    - [ ] Loop `$columns`:
      - [ ] Render `<td>` for each visible column.
      - [ ] Apply `column.cellClass` (handle function or string).
      - [ ] Display cell content:
        - [ ] If `column.formatter`, use `{@html column.formatter(row[column.key], row, column)}` or `<svelte:component this={...} />`.
        - [ ] Else, display `row[column.key]`.
    - [ ] Add `<td>` for row actions slot placeholder: `<slot name="row-actions" {row}></slot>`.

8.  **Update `SuperTable/SuperTable.svelte` - Integrate Table View:**
    - [ ] Inside the main content conditional block:
      - [ ] Add responsive logic: `{#if !$isMobileView || ($isMobileView && $mobileViewSetting === 'table')}`.
      - [ ] Render `<div class="overflow-x-auto"> <table class="table table-zebra w-full"> ... </table> </div>`.
      - [ ] Integrate `<TableHeader ... />`, passing props.
      - [ ] `<tbody> {#each $paginatedData as row (row[$rowKeyStore])} <TableRowDesktop ... /> {/each} </tbody>`.
      - [ ] Ensure correct props are passed to `TableHeader` and `TableRowDesktop` (e.g., `$selectedRowIds.has(row[$rowKeyStore])` for `isSelected`).

9.  **`SuperTable/tests/SuperTable.spec.ts` & New Subcomponent Tests:**
    - [ ] Create `TableHeader.spec.ts`: Test rendering of labels, select-all checkbox.
    - [ ] Create `TableRowDesktop.spec.ts`: Test rendering of cell data, formatter usage, selection checkbox.
    - [ ] Update `SuperTable.spec.ts`: Test full table rendering with headers and rows for desktop view.

## Phase 3: Sorting Functionality

10. **`SuperTable/features/sorting.ts` - Sorting Logic:**
    - [ ] Create `applySort(data: RowData[], sortConfig: SortConfig): RowData[]` function.
    - [ ] Implement sorting logic (handle different data types if necessary).
11. **`SuperTable/tests/features/sorting.spec.ts` - Unit Test Sorting Logic:**
    - [ ] Test sorting various data types (strings, numbers, dates - if applicable).
    - [ ] Test ascending and descending order.
    - [ ] Test with `null` `sortConfig`.
12. **Update `SuperTable/stores.ts` - Integrate Sorting:**
    - [ ] Modify `sortedData` derived store: `derived([filteredData, currentSort], ([$filteredData, $currentSort]) => applySort($filteredData, $currentSort))`.
13. **Update `SuperTable/subcomponents/TableHeader.svelte` - Sorting UI & Events:**
    - [ ] Import Lucide icons: `ChevronUp`, `ChevronDown`, `ChevronsUpDown`.
    - [ ] For each sortable column (`column.sortable`):
      - [ ] Make `<th>` clickable: `on:click={() => dispatch('sort', column.key)}`.
      - [ ] Display appropriate sort icon based on `$currentSort` and `column.key`.
    - [ ] `createEventDispatcher` to dispatch `sort` event with `column.key`.
14. **Update `SuperTable/SuperTable.svelte` - Handle Sort Events:**
    - [ ] Add `handleSort(columnKey: string)` method:
      - [ ] Logic to update `$currentSort` store (toggle direction, change key).
    - [ ] Listen to `sort` event from `<TableHeader on:sort={(e) => handleSort(e.detail)} />`.
    - [ ] Pass `$currentSort` to `TableHeader`.
    - [ ] Handle `initialSort` prop to set `$currentSort` on mount.
15. **Update Tests for Sorting:**
    - [ ] `TableHeader.spec.ts`: Test click emits sort event, icon changes.
    - [ ] `SuperTable.spec.ts`: Test end-to-end sorting: click header, data reorders.

## Phase 4: Filtering Functionality (Global & Per-Column)

16. **`SuperTable/features/filtering.ts` - Filtering Logic:**
    - [ ] Create `applyFilters(data: RowData[], globalSearch: string, columnFilters: ColumnFiltersState, columns: ColumnDef[]): RowData[]` function.
    - [ ] Implement global search logic (search across specified/all string columns).
    - [ ] Implement per-column filtering logic (handle different filter types if specified in `column.filterable`).
17. **`SuperTable/tests/features/filtering.spec.ts` - Unit Test Filtering Logic:**
    - [ ] Test global filter.
    - [ ] Test per-column text filter.
    - [ ] Test per-column select filter.
    - [ ] Test combination of filters.
18. **Update `SuperTable/stores.ts` - Integrate Filtering:**
    - [ ] Modify `filteredData` derived store: `derived([data, globalSearchTerm, columnFilters, columns], ([$data, $globalSearch, $colFilters, $cols]) => applyFilters($data, $globalSearch, $colFilters, $cols))`.
19. **`SuperTable/subcomponents/FilterInput.svelte` (If creating a dedicated one):**
    - [ ] Props: `column: ColumnDef`, `value: ColumnFilterValue`.
    - [ ] Render text input or select (DaisyUI `input`/`select`) based on `column.filterable` type and `column.filterOptions`.
    - [ ] `bind:value` and dispatch `filterChange` event with `{ key: column.key, value: newValue }`. Debounce text input.
20. **Update `SuperTable/subcomponents/TableHeader.svelte` - Filter UI & Events:**
    - [ ] If using a filter row, add it below headers.
    - [ ] For each filterable column (`column.filterable`):
      - [ ] Render filter input (direct or via `<FilterInput />`).
      - [ ] Connect input changes to update the `$columnFilters` store (e.g., dispatch event to `SuperTable`).
21. **Update `SuperTable/SuperTable.svelte` - Global Filter & Handle Column Filter Events:**
    - [ ] Implement `slot="global-filter" let:searchTerm let:updateSearchTerm`. Connect to `$globalSearchTerm`.
    - [ ] If `TableHeader` dispatches column filter events, handle them to update `$columnFilters`.
22. **Update Tests for Filtering:**
    - [ ] `FilterInput.spec.ts` (if created).
    - [ ] `TableHeader.spec.ts`: Test filter input rendering and events.
    - [ ] `SuperTable.spec.ts`: Test global filter updates data; test per-column filter updates data.

## Phase 5: Row Selection & Bulk Actions

23. **Update `SuperTable/SuperTable.svelte` (or stores.ts) - Selection Logic:**
    - [ ] `toggleSelectRow(rowId: any)` function: updates `$selectedRowIds` set.
    - [ ] `toggleSelectAll()` function:
      - [ ] If all selected, deselect all (from current `$paginatedData` or `$sortedData` based on UX decision).
      - [ ] Else, select all visible/filterable items.
24. **Update `SuperTable/subcomponents/TableHeader.svelte` - Select All Checkbox:**
    - [ ] `on:change` on "Select All" checkbox calls `dispatch('selectAllToggle')`.
    - [ ] Pass `$isAllSelected` and `$isIndeterminate` to the checkbox.
25. **Update `SuperTable/subcomponents/TableRowDesktop.svelte` - Row Selection Checkbox:**
    - [ ] `on:change` on row checkbox calls `dispatch('rowSelectToggle', row[rowKey])`.
26. **Update `SuperTable/SuperTable.svelte` - Handle Selection Events & Bulk Actions Slot:**
    - [ ] Listen to `selectAllToggle` from `TableHeader` and call `toggleSelectAll`.
    - [ ] Listen to `rowSelectToggle` from `TableRowDesktop` and call `toggleSelectRow`.
    - [ ] Implement `slot="bulk-actions" let:selectedIds`. Pass `Array.from($selectedRowIds)`.
27. **Update Tests for Selection:**
    - [ ] `SuperTable.spec.ts`:
      - [ ] Test selecting/deselecting single row.
      - [ ] Test select all/deselect all.
      - [ ] Test "Select All" checkbox indeterminate state.
      - [ ] Test `bulk-actions` slot receives correct `selectedIds`.

## Phase 6: Pagination

28. **`SuperTable/features/pagination.ts` - Pagination Logic (can be simple slice):**
    - [ ] `getPaginatedItems(data: RowData[], page: number, itemsPerPage: number): RowData[]`.
    - [ ] `calculateTotalPages(totalItems: number, itemsPerPage: number): number`.
29. **`SuperTable/tests/features/pagination.spec.ts` - Unit Test Pagination Logic.**
30. **Update `SuperTable/stores.ts` - Integrate Pagination:**
    - [ ] Update `paginatedData`: `derived([sortedData, currentPage, itemsPerPage], ([$sData, $cPage, $iPerPage]) => getPaginatedItems($sData, $cPage, $iPerPage))`.
    - [ ] Update `totalPages`: `derived([sortedData, itemsPerPage], ([$sData, $iPerPage]) => calculateTotalPages($sData.length, $iPerPage))`.
31. **`SuperTable/subcomponents/PaginationControls.svelte` - Pagination UI:**
    - [ ] Props: `currentPage: number`, `totalPages: number`, `itemsPerPageOptions?: number[]`, `currentItemPerPage: number`.
    - [ ] Render page number buttons (DaisyUI `join`). `class:btn-active` for current page.
    - [ ] Render Prev/Next buttons.
    - [ ] `on:click` on buttons dispatches `pageChange` event with new page number.
    - [ ] (Optional) DaisyUI `select` for `itemsPerPage`, dispatching `itemsPerPageChange`.
32. **Update `SuperTable/SuperTable.svelte` - Integrate PaginationControls:**
    - [ ] Render `<PaginationControls ... />` below the table/cards.
    - [ ] Pass props: `$currentPage`, `$totalPages`, `$itemsPerPage`.
    - [ ] Handle `pageChange` event to update `$currentPage`.
    - [ ] Handle `itemsPerPageChange` event to update `$itemsPerPage`.
33. **Update Tests for Pagination:**
    - [ ] `PaginationControls.spec.ts`: Test button rendering, active state, event emissions.
    - [ ] `SuperTable.spec.ts`: Test page navigation updates data, items per page change updates data.

## Phase 7: Mobile Card View & Mobile Interactions

34. **`SuperTable/actions/longPressAction.ts` - Long Press Action:**
    - [ ] Implement Svelte action for long-press detection (mousedown/touchstart, timer, mouseup/touchend).
    - [ ] Dispatch `longpress` custom event.
35. **`SuperTable/tests/actions/longPressAction.spec.ts` - Test Long Press Action.**
36. **`SuperTable/subcomponents/TableRowMobileCard.svelte` - Card View Row:**
    - [ ] Props: `row: RowData`, `columns: ColumnDef[]`, `rowKey: string`, `isSelected: boolean`.
    - [ ] Markup: DaisyUI `card`. Apply `class:ring` or similar for selection.
    - [ ] Logic to render card content based on `column.cardPriority` (e.g., title, subtitle, details). Use `column.formatter` if available.
    - [ ] Attach `use:longPressAction` to the card. `on:longpress={() => dispatch('selectToggle', row[rowKey])}`.
    - [ ] Placeholder for card actions slot/swipe actions.
37. **Update `SuperTable/SuperTable.svelte` - Integrate Card View:**
    - [ ] In main content block, add responsive logic: `{#if $isMobileView && $mobileViewSetting === 'cards'}`.
    - [ ] Render a div wrapper for cards (e.g., `grid grid-cols-1 md:grid-cols-2 gap-4`).
    - [ ] Loop `$paginatedData`: `{#each $paginatedData as row (row[$rowKeyStore])} <TableRowMobileCard ... /> {/each}`.
    - [ ] Handle `selectToggle` event from `TableRowMobileCard` to call `toggleSelectRow`.
38. **`SuperTable/actions/swipeAction.ts` - Swipe Action:**
    - [ ] Implement Svelte action for swipe detection (touchstart, touchmove, touchend).
    - [ ] Track swipe distance, direction.
    - [ ] Dispatch `swipeleft` / `swiperight` custom events, or manage revealed state internally via props/callbacks.
    - [ ] Handle translation of the swiped element.
39. **`SuperTable/tests/actions/swipeAction.spec.ts` - Test Swipe Action.**
40. **Update `SuperTable/subcomponents/TableRowMobileCard.svelte` (and `TableRowDesktop.svelte` if swipe on mobile table):**
    - [ ] Add hidden containers for left/right swipe actions.
    - [ ] Apply `use:swipeAction` to the main card content wrapper.
    - [ ] Props/logic in `swipeAction` to control reveal percentage or state.
    - [ ] Style revealed actions (position absolute, etc.).
    - [ ] Slot for `swipe-actions-left` / `swipe-actions-right`.
41. **Update Tests for Mobile View:**
    - [ ] `TableRowMobileCard.spec.ts`: Test card content rendering, long-press selection, swipe action reveal (mock swipe if possible).
    - [ ] `SuperTable.spec.ts`: Test switching between table and card view based on `mobileView` prop and screen size.

## Phase 8: Row-Specific Actions & Remaining Slots

42. **Update `SuperTable/subcomponents/TableRowDesktop.svelte`:**
    - [ ] Implement `<slot name="row-actions" {row}></slot>` in the actions `<td>`.
43. **Update `SuperTable/subcomponents/TableRowMobileCard.svelte`:**
    - [ ] Implement `<slot name="card-actions" {row}></slot>` (if not using swipe for all actions). Or ensure swipe slots are correctly implemented.
44. **Update `SuperTable/SuperTable.svelte` - Other Slots:**
    - [ ] Implement `slot="header-cell" let:column` (inside `TableHeader`'s loop if needed).
    - [ ] Implement `slot="cell" let:value let:row let:column` (as alternative to formatter in `TableRowDesktop`/`MobileCard`).
    - [ ] Implement `slot="footer"` if desired.
45. **Update Tests for Row Actions & Slots:**
    - [ ] `SuperTable.spec.ts`: Test that content passed into these slots is rendered correctly.

## Phase 9: Accessibility, Styling Refinements, Documentation

46. **Accessibility Review (All Svelte files):**
    - [ ] Add `aria-sort` to sortable `<th>` in `TableHeader`.
    - [ ] Add `aria-selected` to selected rows/cards.
    - [ ] Add `aria-live` regions for announcements (e.g., filter results count, sort update) if not disruptive.
    - [ ] Ensure all interactive elements are keyboard navigable and have focus states.
    - [ ] Use semantic HTML (`<table>`, `<th>`, `<td>`, `button`). Check roles if deviating.
    - [ ] Test with screen readers if possible.
47. **Styling and Responsiveness Polish (All Svelte files):**
    - [ ] Final review of DaisyUI/Tailwind class usage.
    - [ ] Add any necessary scoped `<style>` overrides carefully.
    - [ ] Test thoroughly on different screen sizes, ensuring layouts adapt correctly.
    - [ ] Check for visual consistency and DaisyUI theme compatibility.
48. **`SuperTable/README.md` - Comprehensive Documentation:**
    - [ ] Document all Props: name, type, default value, description.
    - [ ] Document all Slots: name, scoped props available.
    - [ ] Document all Events: name, event detail payload.
    - [ ] Provide clear usage examples for common scenarios (basic table, sorting, filtering, card view, actions).
    - [ ] Notes on responsive behavior and customization.

## Phase 10: Final Review & Cleanup

- [ ] **Code Review:** If working in a team, get a thorough code review.
- [ ] **Linting & Formatting:** Ensure code adheres to project standards.
- [ ] **Test Coverage Check:** Aim for high test coverage.
- [ ] **Performance Check:** For moderately sized datasets, ensure interactions are smooth.
- [ ] **Bundle Size Consideration:** Be mindful of the component's impact if it's part of a larger library.
