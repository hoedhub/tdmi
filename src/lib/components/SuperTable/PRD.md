# PRD: Advanced Responsive Table Component (SuperTable)

**Version:** 1.0
**Date:** October 26, 2023
**Author:** AI Assistant (via User Prompt)
**Status:** Proposed

## 1. Introduction

This document outlines the requirements for an "Advanced Responsive Table" Svelte component, tentatively named `SuperTable.svelte`. This component aims to provide a highly configurable, feature-rich, and mobile-first data table solution for SvelteKit (v4) applications, leveraging DaisyUI (v4) for styling and Lucide-Svelte for iconography. It will address common pain points with displaying complex datasets, especially on smaller screens, by offering adaptive UIs and intuitive interactions.

## 2. Goals

*   **Enhanced User Experience (UX):** Provide a smooth, intuitive, and responsive experience for end-users interacting with tabular data across various devices.
*   **Improved Developer Experience (DX):** Offer a simple yet powerful API for developers to integrate and customize the table with minimal boilerplate.
*   **Mobile-First Responsiveness:** Prioritize optimal display and interaction on mobile devices, offering choices between card-based layouts or scrollable tables.
*   **Feature Richness:** Include common advanced table functionalities like sorting, filtering, selection, bulk actions, and row-specific actions.
*   **Accessibility:** Adhere to web accessibility standards (WCAG) to ensure the component is usable by people with disabilities.
*   **Themability:** Seamlessly integrate with DaisyUI's theming capabilities.

## 3. Target Audience

*   **Primary:** SvelteKit developers building web applications that need to display and manage collections of data.
*   **Secondary:** End-users of these web applications who will interact with the table to view, sort, filter, and act upon data.

## 4. Scope

### 4.1. In Scope (Features for v1.0)

*   **Data Rendering:** Displaying an array of data objects.
*   **Column Definition:** Configurable columns with custom labels, data keys, formatters, and visibility.
*   **Responsive Display Modes:**
    *   Standard table view on desktop.
    *   Choice between:
        *   **Card View (Default on Mobile):** Each row transforms into a card, prioritizing key information.
        *   **Responsive Table View (Optional on Mobile):** Horizontally scrollable table.
*   **Sorting:**
    *   Client-side sorting by clicking column headers.
    *   Ascending, descending, and unsorted states.
    *   Visual indicators (Lucide icons).
    *   Initial sort configuration.
*   **Filtering:**
    *   **Global Search:** Single input to filter across all relevant columns.
    *   **Per-Column Filtering:** Inputs (text, select, date range - TBD) in column headers or a dedicated filter row.
    *   Client-side filtering logic.
*   **Row Selection:**
    *   Checkboxes in a dedicated column (desktop/table view).
    *   "Select All" checkbox in the header.
    *   Long-press on rows/cards for selection on touch devices.
    *   Visual indication for selected rows/cards.
*   **Bulk Actions:**
    *   A dedicated slot for action buttons that become active when one or more rows are selected (e.g., "Delete Selected").
*   **Row-Specific Actions:**
    *   Buttons per row/card (e.g., "Edit", "View", "Delete").
    *   **Swipe Actions (Mobile):** On cards or table rows, swipe left/right to reveal contextual actions.
*   **Pagination:**
    *   Client-side pagination controls.
    *   Configurable items per page.
*   **Customization & Slots:**
    *   Slots for empty state, loading state, global filter, bulk actions, row actions, header/cell customization.
*   **Styling:**
    *   Leverage DaisyUI classes extensively for styling and theming.
    *   Props for custom CSS classes on main elements.
*   **Iconography:** Use Lucide-Svelte icons for actions, sorting indicators, etc.
*   **Accessibility:** Basic ARIA attributes for table structure, sorting, and selection. Keyboard navigation for essential functions.

### 4.2. Out of Scope (for v1.0)

*   Server-side data fetching, sorting, filtering, and pagination logic (component will emit events for these, but not implement the server interaction itself).
*   Virtual scrolling / Windowing (for extremely large datasets).
*   Resizable columns.
*   Draggable columns for reordering.
*   Draggable rows for reordering.
*   Inline cell editing.
*   Complex nested tables or expandable rows (beyond simple display).
*   Advanced filter types like multi-select with checkboxes, sliders, etc. (basic text, select are in scope).
*   Saving table state (column order, filter values, sort order) to local storage or backend.

## 5. Detailed Feature Requirements

### 5.1. Core Table Structure & Data

*   **FR1.1 (Data Input):** The component MUST accept an array of JavaScript objects (`data: T[]`) as its primary data source.
*   **FR1.2 (Column Definitions):** The component MUST accept an array of column definition objects (`columns: ColumnDef<T>[]`).
    *   `key: keyof T | string`: Identifier for the data property or a custom key.
    *   `label: string`: Display text for the column header.
    *   `sortable?: boolean`: If true, the column can be sorted (default: `false`).
    *   `filterable?: boolean | 'text' | 'select' | 'date'`: If true/string, enables filtering for this column. String specifies filter input type (default: `false`).
    *   `filterOptions?: string[] | { label: string; value: any }[]`: Options for `select` type filter.
    *   `formatter?: (value: any, row: T, column: ColumnDef<T>) => string | ComponentType`: Function to customize cell content rendering. Can return HTML string or a Svelte component.
    *   `headerClass?: string`: Custom CSS classes for the `<th>` element.
    *   `cellClass?: string | ((value: any, row: T) => string)`: Custom CSS classes for `<td>` elements.
    *   `responsiveShow?: 'always' | 'md' | 'lg'`: Controls column visibility based on screen size (Tailwind breakpoints) primarily for the table view. (Default: `always`).
    *   `cardPriority?: number`: In card view, determines which fields are shown and their order (lower number = higher priority). Undefined means not shown by default in compact card view.
    *   `hidden?: boolean`: Programmatically hide/show a column.
*   **FR1.3 (Row Key):** The component MUST accept a `rowKey: keyof T` prop specifying a unique identifier property within each data object for selection and reactivity.

### 5.2. Responsive Display

*   **FR2.1 (Mobile View Prop):** A prop `mobileView: 'cards' | 'table' (default: 'cards')` SHALL determine the layout on mobile screens (e.g., `< 768px`).
*   **FR2.2 (Card View - Mobile):**
    *   When `mobileView` is `'cards'`, each data row MUST be rendered as a DaisyUI `card` component.
    *   Card content SHOULD be structured based on `column.cardPriority`. For example:
        *   A title (e.g., `cardPriority: 1`).
        *   A subtitle or key details (e.g., `cardPriority: 2`).
        *   Other relevant info (e.g., `cardPriority: 3`).
    *   Cards SHOULD be stacked vertically or in a responsive grid (e.g., 2 columns on slightly larger mobile screens).
*   **FR2.3 (Table View - Mobile):**
    *   When `mobileView` is `'table'`, the component MUST render a standard HTML table.
    *   The table wrapper MUST have `overflow-x-auto` to allow horizontal scrolling.
    *   Consider using DaisyUI `table-xs` or `table-sm` for compactness.
    *   Consider `table-pin-rows` and `table-pin-cols` for fixed header/first column if feasible and not overly complex.
*   **FR2.4 (Desktop View):** On larger screens (e.g., `>= 768px`), the component MUST display as a standard DaisyUI table (`<table class="table table-zebra ...">`).

### 5.3. Sorting

*   **FR3.1 (Clickable Headers):** Column headers for `sortable: true` columns MUST be clickable to trigger sorting.
*   **FR3.2 (Sort Cycle):** Clicking a sortable header SHOULD cycle through: `ascending` -> `descending` -> `unsorted` (or `ascending` -> `descending` if already sorted by another column).
*   **FR3.3 (Visual Indicators):**
    *   Lucide `ChevronsUpDown` icon for sortable but currently unsorted columns.
    *   Lucide `ChevronUp` icon for ascending sort.
    *   Lucide `ChevronDown` icon for descending sort.
*   **FR3.4 (Initial Sort):** A prop `initialSort?: { key: string; direction: 'asc' | 'desc' }` SHALL allow setting an initial sort state.
*   **FR3.5 (Sort Event):** An event `onSort: (sort: { key: string; direction: 'asc' | 'desc' } | null) => void` MUST be emitted when the sort state changes.
*   **FR3.6 (Client-Side Logic):** The component MUST implement client-side sorting of the `data` prop based on the current sort configuration.

### 5.4. Filtering

*   **FR4.1 (Global Filter Slot):** A slot `slot="global-filter" let:searchTerm let:updateSearchTerm` MUST be provided.
    *   The consumer can place an input field here.
    *   The component provides `searchTerm` (reactive store value) and `updateSearchTerm` (function to update the store).
    *   Filtering SHOULD be case-insensitive and match any part of the string in designated searchable columns.
*   **FR4.2 (Per-Column Filtering UI):**
    *   If `column.filterable` is set, appropriate filter input(s) MUST be rendered, typically within the `<thead>` below the column label or in a dedicated filter row.
    *   `'text'`: DaisyUI `input input-bordered input-sm`.
    *   `'select'`: DaisyUI `select select-bordered select-sm` populated by `column.filterOptions`.
    *   `'date'`: (Stretch for v1) DaisyUI `input type="date"` or a simple date range.
*   **FR4.3 (Filter Event):** An event `onFilter: (filters: { global?: string; columns?: Record<string, any> }) => void` MUST be emitted when filter values change.
*   **FR4.4 (Client-Side Logic):** The component MUST implement client-side filtering based on global and column-specific filter values. Text input changes should be debounced.

### 5.5. Row Selection

*   **FR5.1 (Checkbox Column - Table View):** If row selection is enabled, the table view MUST display a leading column with DaisyUI `checkbox` inputs for each row.
*   **FR5.2 (Select All - Table View):** A "Select All" DaisyUI `checkbox` MUST be present in the header of the checkbox column to select/deselect all visible (and filtered) rows. Its state should reflect partial/full selection.
*   **FR5.3 (Long Press Selection - Mobile):**
    *   On touch devices, a long-press (e.g., >500ms) on a row (in table view) or a card (in card view) MUST toggle its selection state.
    *   A Svelte action should be used for long-press detection.
*   **FR5.4 (Visual Indication):** Selected rows/cards MUST have a distinct visual style (e.g., DaisyUI `active` class, different background color, or border/ring).
*   **FR5.5 (Selection State):** The component MUST maintain an internal state of selected row IDs (`Set<typeof row[rowKey]>`).
*   **FR5.6 (Selection Change Event):** An event `onSelectionChange: (selectedIds: Array<typeof row[rowKey]>) => void` MUST be emitted whenever the set of selected rows changes.

### 5.6. Bulk Actions

*   **FR6.1 (Bulk Actions Slot):** A slot `slot="bulk-actions" let:selectedIds` MUST be provided.
    *   This slot is intended for buttons that operate on selected rows (e.g., "Delete Selected", "Export Selected").
    *   `selectedIds` (an array of unique row keys) MUST be passed to the slot.
*   **FR6.2 (Visibility):** The content of the `bulk-actions` slot SHOULD ideally only be visible or enabled when `selectedIds.length > 0`. This can be managed by the component consumer within the slot.

### 5.7. Row-Specific Actions

*   **FR7.1 (Actions Column/Area):** A dedicated column (table view) or area (card view) MUST be available for row-specific action buttons.
*   **FR7.2 (Row Actions Slot):** A slot `slot="row-actions" let:row` MUST be provided within each row/card to allow consumers to define custom action buttons (e.g., Edit, View, Delete with Lucide icons).
*   **FR7.3 (Swipe Actions - Mobile):**
    *   On touch devices, swiping left or right on a card (card view) or a row (mobile table view) MUST reveal a set of predefined contextual action buttons (e.g., "Delete" on swipe left, "Archive" on swipe right).
    *   A Svelte action should be used for swipe detection and animation.
    *   The actions revealed by swipe SHOULD be configurable, perhaps via `ColumnDef` or specific props.
    *   The UI MUST provide clear visual cues that actions are available via swipe and when they are revealed.
    *   A tap on a revealed action button MUST trigger the corresponding action. A tap outside or a swipe back MUST hide the actions.

### 5.8. Pagination

*   **FR8.1 (Pagination Controls):** The component MUST render pagination controls (e.g., page numbers, next/previous buttons) using DaisyUI `join` or `btn-group`.
*   **FR8.2 (Items Per Page):** A prop `itemsPerPage: number (default: 10)` SHALL control how many items are displayed per page. An option to change this via UI (e.g., a select dropdown) is desirable.
*   **FR8.3 (Pagination State):** The component MUST manage `currentPage` state.
*   **FR8.4 (Page Change Event):** An event `onPageChange: (page: number) => void` MUST be emitted when the user navigates to a different page.
*   **FR8.5 (Total Items):** A prop `totalItems?: number` can be provided for server-side pagination scenarios. If not provided, it's calculated from `data.length`.
*   **FR8.6 (Client-Side Logic):** The component MUST implement client-side pagination.

### 5.9. Customization and Slots

*   **FR9.1 (Empty State Slot):** A slot `slot="empty-state"` MUST allow customization of the content displayed when `data` is empty or filtering results in no matches. Default content should be "No data available."
*   **FR9.2 (Loading State Slot):** A slot `slot="loading-state"` MUST allow customization of the loading indicator. Default should be a DaisyUI spinner.
*   **FR9.3 (Loading Prop):** A prop `isLoading: boolean (default: false)` MUST control the visibility of the loading state.
*   **FR9.4 (Header Cell Slot):** A slot `slot="header-cell" let:column` MAY be provided to customize individual header cell rendering beyond `column.label`.
*   **FR9.5 (Data Cell Slot):** A slot `slot="cell" let:value let:row let:column` MAY be provided as an alternative to `column.formatter` for deeply custom cell rendering.
*   **FR9.6 (Table Styling Props):** Props like `tableClass: string`, `cardClass: string`, `rowClass: string | ((row: T) => string)` SHALL allow consumers to add custom CSS classes.

### 5.10. Accessibility (A11y)

*   **FR10.1 (Table Semantics):** Use `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` correctly. `role="grid"` MAY be used if advanced keyboard navigation is implemented.
*   **FR10.2 (Header Scope):** `<th>` elements MUST have appropriate `scope` attributes (`col` or `row`).
*   **FR10.3 (Sortable Headers):** Sortable headers MUST have `aria-sort` attribute (`ascending`, `descending`, `none`).
*   **FR10.4 (Interactive Elements):** All interactive elements (buttons, checkboxes, links) MUST be keyboard accessible and have clear focus indicators.
*   **FR10.5 (ARIA Live Regions):** Consider `aria-live` regions for announcing changes like sort updates or filter results count, if not overly verbose.
*   **FR10.6 (Selection State):** Checkboxes for selection MUST have `aria-checked` and selected rows/cards should convey their selected state via `aria-selected="true"`.

## 6. Design and UX Considerations

*   **Mobile-First:** Design decisions should prioritize the mobile experience.
*   **DaisyUI Consistency:** Adhere to DaisyUI's design language and component styling for a cohesive look and feel.
*   **Clear Visual Feedback:** Provide immediate visual feedback for actions like sorting, selection, hover states, and swipe interactions.
*   **Intuitive Interactions:** Ensure all interactions (clicks, long-press, swipe) feel natural and predictable.
*   **Performance:**
    *   Client-side operations (sorting, filtering) should be performant for moderately sized datasets (e.g., up to a few thousand rows).
    *   Debounce text-based filter inputs to avoid excessive re-renders.
*   **Iconography:** Use Lucide-Svelte icons consistently and appropriately to enhance clarity.
*   **Touch Target Size:** Ensure touch targets (buttons, checkboxes, swipeable areas) are adequately sized for mobile.

## 7. Technical Considerations

*   **Framework/Libraries:** Svelte v4, SvelteKit, DaisyUI v4, Lucide-Svelte, Tailwind CSS.
*   **Language:** TypeScript for component logic, props, and event typings.
*   **State Management:** Utilize Svelte stores (`writable`, `derived`) for managing internal state (sort order, filters, selection, current page).
*   **Svelte Actions:** Implement custom Svelte actions for complex DOM interactions like swipe-to-reveal and long-press.
*   **Modularity:** Keep the component's internal logic organized and potentially break down sub-components if complexity grows (e.g., `PaginationControls`, `FilterInput`).
*   **Testing:** Plan for unit tests (e.g., with Vitest/Testing Library) for individual functions/logic and integration tests for component behavior.
*   **Bundle Size:** Be mindful of the component's contribution to the overall application bundle size.

## 8. Success Metrics

*   **Adoption:** Number of projects/developers using the component.
*   **Feature Completion:** All "In Scope" features implemented and working as specified.
*   **User Feedback:** Positive feedback from developers regarding ease of use and from end-users regarding UX.
*   **Performance:** Table interactions remain smooth with datasets up to 1000-2000 rows (client-side).
*   **Low Bug Rate:** Minimal critical or major bugs reported post-release.
*   **Documentation:** Clear and comprehensive documentation available.

## 9. Future Considerations (Post v1.0)

*   Virtual scrolling for handling very large datasets.
*   Column resizing and reordering (drag-and-drop).
*   Inline cell editing capabilities.
*   More advanced filter UIs (multi-select, range sliders).
*   Saving and restoring table state (filters, sort, column order).
*   Built-in support or helper utilities for common server-side data patterns.
*   Export to CSV/Excel functionality.
*   Row grouping.

## 10. Open Questions & Risks

*   **Complexity of Swipe/Long-Press:** Implementing robust and intuitive swipe and long-press actions across different devices and browsers can be challenging.
*   **Performance at Scale:** While client-side operations are targeted for moderate datasets, performance might degrade with very large, unfiltered datasets before virtualization is implemented.
*   **API Design Balance:** Striking the right balance between a highly configurable API and ease of use.
*   **Cross-Browser/Device Touch Consistency:** Ensuring touch interactions behave consistently.
*   **Accessibility Depth:** Achieving full WCAG compliance for a complex component like this requires careful attention to detail and testing.