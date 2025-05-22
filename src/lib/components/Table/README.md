# Advanced Svelte 5 Table Component

A feature-rich, responsive, and customizable table component built with Svelte 5 Runes and styled with DaisyUI 5 / Tailwind CSS.

[![Made with Svelte](https://img.shields.io/badge/Svelte-5(Runes)-FF3E00.svg?style=flat-square)](https://svelte.dev/)
[![Styled with DaisyUI](https://img.shields.io/badge/DaisyUI-5-1ad1a5.svg?style=flat-square)](https://daisyui.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg?style=flat-square)](https://tailwindcss.com/)

## Features

*   **Client-Side & Server-Side Data:** Handles both static data arrays and asynchronous data fetching.
*   **Sorting:** Clickable column headers for client-side or server-side sorting.
*   **Filtering:** Basic global search filter across columns. (Extensible for per-column filtering).
*   **Pagination:** Client-side or server-side pagination controls with page size options.
*   **Row Selection:** Checkbox-based single or multi-row selection with "Select All".
*   **Row Actions:** Customizable actions per row via a clean dropdown menu.
*   **Custom Cell Rendering:** Use formatters or custom Svelte components for cell content.
*   **Loading, Empty, Error States:** Built-in handling and display for various data states.
*   **Responsive:** Basic horizontal scroll on overflow. Includes `data-label` attributes for potential CSS stacking implementations.
*   **DaisyUI Theming:** Leverages DaisyUI components and themes for styling.
*   **Customization:** Configurable via props and Svelte 5 Snippets.
*   **Svelte 5 Runes:** Built using reactive `$state`, `$derived`, and `$effect`.

## Installation / Setup

1.  **Ensure Svelte 5:** Your project must be using Svelte 5 or later.
2.  **Install Dependencies:** Make sure you have `tailwindcss`, `autoprefixer`, `postcss`, and `daisyui` installed and configured in your project.
    ```bash
    npm install -D tailwindcss postcss autoprefixer daisyui
    # or yarn add -D ... or pnpm add -D ...
    ```
3.  **Configure Tailwind/DaisyUI:** Follow the official guides to set up `tailwind.config.js`, `postcss.config.js`, and include DaisyUI in your Tailwind plugins. Ensure your base CSS file imports Tailwind layers.
4.  **Copy Component Files:** Place the following files into your Svelte project, typically within `$lib/components/Table` (or adjust paths as needed):
    *   `AdvancedTable.svelte`
    *   `TableRow.svelte`
    *   `TableCell.svelte`
    *   `TableHeaderCell.svelte`
    *   `Pagination.svelte`
    *   `ActionMenu.svelte` (Optional, for row actions)
    *   `FilterBar.svelte` (Optional, example - filtering is currently basic inline in `AdvancedTable`)
    *   `types.ts` (Contains type definitions)
    *   `utils.ts` (Contains helper functions like `getProperty`)

## Basic Usage

```svelte
<script lang="ts">
  import AdvancedTable from '$lib/components/Table/AdvancedTable.svelte';
  import type { ColumnDefinition } from '$lib/components/Table/types';

  // Sample Data (ensure objects have a unique property matching `rowKey`)
  const myData = [
    { id: 1, name: 'Alice', email: 'alice@example.com', status: 'Active' },
    { id: 2, name: 'Bob', email: 'bob@example.com', status: 'Inactive' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', status: 'Pending' },
    // ... more data
  ];

  // Column Definitions
  const myColumns: ColumnDefinition<typeof myData[0]>[] = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'email', label: 'Email Address' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      // Example formatter for a badge
      formatter: (value) => {
        const color = value === 'Active' ? 'badge-success' : value === 'Inactive' ? 'badge-error' : 'badge-warning';
        return `<span class="badge ${color} badge-sm">${value}</span>`;
      }
    }
  ];

</script>

<div class="p-4">
  <AdvancedTable
    data={myData}
    columns={myColumns}
    rowKey="id"
    allowSelection={true}
    pagination={true}
    defaultPageSize={5}
  />
</div>
```

## Props API (`AdvancedTable.svelte`)

| Prop                  | Type                                                             | Required | Default                            | Description                                                                                                                               |
| :-------------------- | :--------------------------------------------------------------- | :------- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                | `T[]`                                                            | No       | `[]`                               | The array of data objects to display (for client-side mode). Use `$bindable()` if needed.                                                   |
| `columns`             | `ColumnDefinition<T>[]`                                          | Yes      | -                                  | Array defining the table columns. See [Column Definition](#column-definition) below.                                                         |
| `rowKey`              | `keyof T`                                                        | Yes      | -                                  | The property name in your data objects that holds a unique identifier for each row (e.g., `'id'`). Essential for reactivity and selection. |
| `fetchData`           | `(params: FetchParams<T>) => Promise<FetchResult<T>>`            | No       | `undefined`                        | An async function to fetch data from a server. Providing this enables server-side mode for pagination, sorting, and filtering.           |
| `actions`             | `ActionDefinition<T>[]`                                          | No       | `[]`                               | Array defining actions available for each row. See [Action Definition](#action-definition) below. Renders the `ActionMenu` component.     |
| `tableId`             | `string`                                                         | No       | `undefined`                        | Sets the `id` attribute on the `<table>` element for accessibility or testing.                                                            |
| `loading`             | `boolean`                                                        | No       | `false`                            | Externally control the loading state overlay. Ignored if `fetchData` is provided (internal loading state is used).                      |
| `error`               | `string \| null`                                                 | No       | `null`                             | Externally control the error state display. Ignored if `fetchData` is provided (internal error state is used).                          |
| `pagination`          | `boolean`                                                        | No       | `true`                             | Show or hide the pagination controls footer.                                                                                              |
| `defaultPageSize`     | `number`                                                         | No       | `10`                               | Initial number of items to show per page.                                                                                                 |
| `defaultSortKey`      | `keyof T \| string \| null`                                      | No       | `null`                             | The `key` of the column to sort by initially.                                                                                             |
| `defaultSortDirection`| `'asc' \| 'desc'`                                                | No       | `'asc'`                            | The initial sort direction.                                                                                                               |
| `allowSelection`      | `boolean`                                                        | No       | `true`                             | Show or hide the row selection checkboxes.                                                                                                |
| `tableClass`          | `string`                                                         | No       | `'table-zebra w-full'`             | Additional CSS classes to apply directly to the `<table>` element (appended to `table`). Useful for DaisyUI modifiers (`table-sm`, etc.). |
| `emptyState`          | `Snippet`                                                        | No       | `undefined`                        | A Svelte Snippet to render custom content when the table has no data (or no filter results).                                              |
| `loadingState`        | `Snippet`                                                        | No       | `undefined`                        | A Svelte Snippet to render custom content while data is loading.                                                                          |
| `filterRenderer`      | `Snippet<[FilterRendererParams]>`                               | No       | `undefined`                        | A Svelte Snippet to render custom filter controls. Receives `{ updateFilter: (key, value) => void }`. See [Snippets](#slots--snippets).      |
| `bulkActionsRenderer` | `Snippet<[BulkActionsRendererParams<T>]>`                       | No       | `undefined`                        | A Svelte Snippet to render custom bulk actions UI when rows are selected. Receives `{ selectedItems: T[] }`. See [Snippets](#slots--snippets). |

*   **`T`**: Represents the generic type of your data objects in the `data` array (e.g., `User`, `Order`). It extends `Record<string, any> & { id?: string | number }`.

## Column Definition (`ColumnDefinition<T>`)

This is an object configuring a single table column, passed in the `columns` prop array.

| Property      | Type                                                        | Description                                                                                                                                                              |
| :------------ | :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`         | `keyof T \| string`                                         | **Required.** The key in the data object (`T`) for this column's value. Can use dot notation (e.g., `'user.address.city'`) - uses `getProperty` utility internally.    |
| `label`       | `string`                                                    | **Required.** The display text for the column header (`<th>`).                                                                                                             |
| `sortable`    | `boolean`                                                   | If `true`, makes the header clickable for sorting. Defaults to `false`.                                                                                                   |
| `filterable`  | `boolean`                                                   | If `false`, prevents this column from being included in the global text filter. Defaults to `true`. (Future: Could be extended for specific filter types).             |
| `formatter`   | `(value: any, row: T) => string \| number \| undefined \| null` | An optional function to format the cell value before display. Receives the raw cell value and the full row data. **Warning:** If returning HTML, ensure it's sanitized! |
| `component`   | `typeof SvelteComponent`                                    | An optional Svelte component to render the cell content. It receives props: `value` (raw cell value), `rowData` (full row), and `column` (this definition object).     |
| `headerClass` | `string`                                                    | Optional CSS classes to add to the header cell (`<th>`).                                                                                                                  |
| `cellClass`   | `string`                                                    | Optional CSS classes to add to data cells (`<td>`) in this column.                                                                                                      |
| `hidden`      | `boolean`                                                   | If `true`, hides the column by default. (Future: Could be used with a visibility toggle). Defaults to `false`.                                                          |

## Action Definition (`ActionDefinition<T>`)

This is an object configuring a single row action, passed in the `actions` prop array. Rendered by `ActionMenu.svelte`.

| Property   | Type                                     | Description                                                                                   |
| :--------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `label`    | `string`                                 | **Required.** The text label for the action button/menu item.                                 |
| `handler`  | `(row: T) => void`                       | **Required.** Function executed when the action is clicked. Receives the row data object (`T`). |
| `icon`     | `string \| typeof SvelteComponent`       | Optional CSS class name or Svelte component reference for an icon. (Not rendered by default). |
| `class`    | `string`                                 | Optional CSS classes to add to the action button/menu item element.                           |
| `disabled` | `(row: T) => boolean`                    | Optional function to determine if the action should be disabled for a specific row.         |
| `hidden`   | `(row: T) => boolean`                    | Optional function to determine if the action should be hidden for a specific row.           |

## Slots / Snippets

The component utilizes Svelte 5 Snippets passed via props for customization:

*   **`loadingState`**: Render custom loading UI.
    ```svelte
    <AdvancedTable {...props}>
      {#snippet loadingState()}
        <div class="my-custom-spinner">Please wait...</div>
      {/snippet}
    </AdvancedTable>
    ```
*   **`emptyState`**: Render custom UI when no data is available.
    ```svelte
    <AdvancedTable {...props}>
      {#snippet emptyState()}
        <div class="text-center p-10">
          <img src="/images/no-data.svg" alt="" />
          <p>Nothing found here!</p>
        </div>
      {/snippet}
    </AdvancedTable>
    ```
*   **`filterRenderer`**: Render custom filter controls area (above the table).
    ```svelte
    <script>
      // ...
      function handleCustomFilter(key, value) {
        // ... update your filter state ...
      }
    </script>
    <AdvancedTable {...props}>
      {#snippet filterRenderer(params)}
        <!-- params = { updateFilter: (key, value) => void } -->
        <select class="select select-sm" onchange={(e) => params.updateFilter('status', e.currentTarget.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
        </select>
      {/snippet}
    </AdvancedTable>
    ```
*   **`bulkActionsRenderer`**: Render custom controls that appear when rows are selected.
    ```svelte
    <script>
        function handleBulkExport(selectedItems) {
            console.log('Exporting:', selectedItems);
        }
    </script>
    <AdvancedTable {...props}>
      {#snippet bulkActionsRenderer(params)}
        <!-- params = { selectedItems: T[] } -->
        <span>{params.selectedItems.length} selected</span>
        <button class="btn btn-sm" onclick={() => handleBulkExport(params.selectedItems)}>
          Export Selected
        </button>
      {/snippet}
    </AdvancedTable>
    ```

## Server-Side Data Handling

To enable server-side operations:

1.  **Omit the `data` prop.**
2.  **Provide the `fetchData` prop.** This function will be called whenever pagination, sorting, or filtering parameters change.
3.  **`fetchData` Function Signature:**
    ```typescript
    async function fetchData(params: FetchParams<T>): Promise<FetchResult<T>> {
      // params contains: { page, pageSize, sortKey, sortDirection, filters }
      // Example: Make an API call
      const query = new URLSearchParams();
      query.set('page', String(params.page));
      query.set('limit', String(params.pageSize));
      if (params.sortKey) {
        query.set('sortBy', String(params.sortKey));
        query.set('order', params.sortDirection);
      }
      if (params.filters.global) {
        query.set('search', params.filters.global);
      }
      // Add other filters...

      const response = await fetch(`/api/data?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const result = await response.json(); // Assuming API returns { data: T[], totalItems: number }

      return {
        data: result.data,
        totalItems: result.totalItems,
      };
    }
    ```
4.  The component will automatically manage `isLoading` and `internalError` states based on the `fetchData` promise. Client-side sorting, filtering, and pagination will be disabled.

## Styling

*   The component relies heavily on **DaisyUI** classes (`table`, `table-zebra`, `btn`, `checkbox`, `input`, `dropdown`, `menu`, etc.) and **Tailwind CSS** utilities.
*   Ensure your DaisyUI theme is configured correctly in `tailwind.config.js`.
*   Use the `tableClass` prop to add DaisyUI size/style modifiers (e.g., `tableClass="table-sm table-pin-rows"`).
*   Custom cell/header styling can be done via the `cellClass` and `headerClass` properties in the `ColumnDefinition`.

## Responsiveness

*   By default, the table is wrapped in `<div class="overflow-x-auto">`, allowing horizontal scrolling on smaller screens.
*   The `TableCell` component includes a `data-label` attribute containing the column header text. This can be used with custom CSS (outside the component, e.g., in global styles) to implement responsive card/stacking layouts using pseudo-elements (`td::before { content: attr(data-label); ... }`). See commented-out CSS in `TableCell.svelte` for an example starting point.

## Future Enhancements / TODO

*   Implement advanced per-column filtering UI (selects, ranges).
*   Add a column visibility toggle dropdown.
*   Implement optional row expansion for showing details.
*   Provide more sophisticated sorting/filtering utility functions (e.g., `createAdvancedSorter` in `utils.ts`).
*   Consider virtual scrolling for extremely large datasets.
*   Add explicit event emissions (e.g., `on:selectionChange`).

## License

[MIT](LICENSE) (or your chosen license)