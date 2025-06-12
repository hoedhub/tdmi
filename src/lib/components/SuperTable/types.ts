// Types for SuperTable component
import type { ComponentType, SvelteComponentTyped } from 'svelte';
import { SvelteComponent } from 'svelte';

// Basic types
export type SortDirection = 'asc' | 'desc';
export type FilterType = 'text' | 'select' | 'date';
export type MobileViewType = 'cards' | 'table';
export type ResponsiveShow = 'always' | 'md' | 'lg';

// Sort configuration
export interface SortConfig {
    key: string;
    direction: SortDirection;
}

// Custom event types
export interface SwipeEvent extends CustomEvent<{ direction: 'left' | 'right' }> { }
export interface LongPressEvent extends CustomEvent<void> { }

export interface TableRowEvents {
    'on:swipe': SwipeEvent;
    'on:longpress': LongPressEvent;
}

// Extend Svelte HTML attributes
declare module 'svelte/elements' {
    interface HTMLAttributes<T> {
        'on:swipe'?: (e: SwipeEvent) => void;
        'on:longpress'?: (e: LongPressEvent) => void;
    }
}

// Formatting types
export type FormatterFunction<T = any> = (value: any, row: T, column: ColumnDef<T>) => string;

export interface FormatterComponentProps<T = any> {
    value: any;
    row: T;
    column: ColumnDef<T>;
}

export interface FormatterEvents { }
export interface FormatterSlots { }

export type FormatterComponent = ComponentType<SvelteComponentTyped<
    FormatterComponentProps,
    FormatterEvents,
    FormatterSlots
>>;

export type Formatter<T = any> = FormatterFunction<T> | FormatterComponent;

// Filtering types
export type FilterableType = FilterType | boolean | undefined;

export type FilterOption = string | { value: string; label: string };

export interface FilterConfig {
    type: FilterType;
    options?: FilterOption[];
}

export interface FilterState {
    global?: string;
    columns: Record<string, any>;
}

// Column definition
export interface ColumnDef<T = any> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    filterable?: FilterableType;
    filterConfig?: FilterConfig;
    hidden?: boolean;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    cellClass?: string | ((value: any, row: T) => string);
    headerClass?: string;
    formatter?: Formatter<T>;
    cardOverflowPriority?: number; // New name: defines priority for columns that go into the "Show More" section
    responsiveShow?: ResponsiveShow;
    filterOptions?: FilterOption[];
}

// Props & Events
export interface SuperTableProps<T = any> {
    data: T[];
    columns: ColumnDef<T>[];
    rowKey: keyof T;
    mobileView?: MobileViewType;
    initialSort?: SortConfig;
    itemsPerPage?: number;
    totalItems?: number;
    isLoading?: boolean;
    tableClass?: string;
    cardClass?: string;
    rowClass?: string | ((row: T) => string);
    serverSide?: boolean;  // Whether filtering/sorting/pagination is handled by the server
    maxVisibleColumns?: number; // Max columns to show initially in mobile card view
}

export interface SuperTableEvents<T = any> {
    sort: CustomEvent<SortConfig | null>;
    filter: CustomEvent<FilterState>;
    selectionChange: CustomEvent<Array<T[keyof T]>>;
    pageChange: CustomEvent<number>;
}

// This class defines the component's public contract for TypeScript.
export class SuperTableComponent<T extends Record<string, any>> extends SvelteComponent<
    SuperTableProps<T>,
    { [key: string]: any },
    { 'row-actions': { row: T } } // Align this with the slot name you are using!
> { }