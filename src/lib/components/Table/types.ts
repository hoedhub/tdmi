import type { Snippet, Component, ComponentProps } from 'svelte'; // Use Component, remove ComponentType/SvelteComponent if no longer needed elsewhere

// --- Core Row Data Constraint ---
export type TableRowData = Record<string, any> & { id?: string | number };


// --- Column Definition ---
export interface ColumnDefinition<T extends TableRowData> {
    /** Unique key identifying the data property for this column in a row object (e.g., 'userName', 'order.date').
     * Can use dot notation for nested properties (needs helper function for access in TableCell if used). */
    key: keyof T | string; // Allow string for nested keys, requires helper

    /** The text label displayed in the table header (<th>). */
    label: string;

    /** If true, the column header will be clickable to sort the table by this column. (Phase 3) */
    sortable?: boolean;

    /** If true (or specific type), enables filtering on this column. (Phase 4/7)
     * Currently simple boolean, could expand to FilterType enum/object later. */
    filterable?: boolean; // | FilterType;

    /** Optional function to format the raw cell value before display. (Phase 7)
     * Receives the cell value and the full row data object.
     * Return value can be string, number, or potentially safe HTML (use with caution). */
    formatter?: (value: any, row: T) => string | number | undefined | null;

    /** Optional Svelte component to use for rendering the cell content instead of default text/formatter. (Phase 7)
     * The component will receive props: `value`, `rowData`, `column`. */
    // **FIX:** Use Component<Props> for Svelte 5 component typing
    component?: Component<{ value: any; rowData: T; column: ColumnDefinition<T> }>;

    /** Custom CSS classes to apply to the header cell (<th>). */
    headerClass?: string;

    /** Custom CSS classes to apply to data cells (<td>) in this column. */
    cellClass?: string;

    /** If true, the column will be hidden by default. (Phase 1 / Phase 7 for toggling) */
    hidden?: boolean;

    // Add other potential config options as needed:
    align?: 'left' | 'center' | 'right';
    width?: string; // e.g., '150px'
}

// --- Action Definition ---
// Defines a single action available for a row (typically in an ActionMenu). (Phase 5)
export interface ActionDefinition<T extends TableRowData> {
    /** Text label for the action button/menu item. */
    label: string;

    /** Function to execute when the action is triggered. Receives the row data. */
    handler: (row: T) => void;

    /** Optional icon component or class name to display next to the label. */
    // **FIX:** Also update icon type if using components there
    icon?: string | Component; // Class name or Svelte component

    /** Optional CSS classes to apply to the action button/menu item. */
    class?: string;

    /** Optional function to determine if the action should be disabled for a specific row. */
    disabled?: (row: T) => boolean;

    /** Optional function to determine if the action should be hidden for a specific row. */
    hidden?: (row: T) => boolean;
}

// --- Server-Side Fetching Parameters --- (Phase 7)
// Object passed to the `fetchData` function when using server-side mode.
export interface FetchParams<T extends TableRowData> {
    /** Requested page number (1-based). */
    page: number;

    /** Number of items requested per page. */
    pageSize: number;

    /** The key of the column to sort by (null if no sort). */
    sortKey: keyof T | string | null;

    /** Sort direction ('asc' or 'desc'). */
    sortDirection: 'asc' | 'desc';

    /** Object containing current filter values.
     * Structure depends on how filters are implemented (e.g., { global: 'search', status: 'active' }). */
    filters: Record<string, any>;
}

// --- Server-Side Fetching Result --- (Phase 7)
// Expected shape of the object returned by the `fetchData` function.
export interface FetchResult<T extends TableRowData> {
    /** Array of data items for the current page. */
    data: T[];

    /** Total number of items matching the query (across all pages). */
    totalItems: number;
}