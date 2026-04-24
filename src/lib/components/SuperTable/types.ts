// Types for SuperTable component
import type { ComponentType, SvelteComponentTyped } from 'svelte';
import { SvelteComponent } from 'svelte';

// Basic types
export type SortDirection = 'asc' | 'desc';
export type FilterType = 'text' | 'select' | 'date' | 'number';

// Advanced filter operators
export type FilterOperator =
	| 'contains'
	| 'not_contains'
	| 'equals'
	| 'not_equals'
	| 'starts_with'
	| 'ends_with'
	| 'is_empty'
	| 'is_not_empty'
	| 'date_before'
	| 'date_after'
	| 'date_between'
	| 'date_equals'
	| 'num_equals'
	| 'num_not_equals'
	| 'num_gt'
	| 'num_gte'
	| 'num_lt'
	| 'num_lte';

export interface AdvancedFilterCondition {
	id: number;
	columnKey: string;
	operator: FilterOperator;
	value: string;
	value2?: string; // for 'date_between'
}

export interface AdvancedFilterState {
	conditions: AdvancedFilterCondition[];
	logic: 'AND' | 'OR';
}
export type MobileViewType = 'cards' | 'table';
export type ResponsiveShow = 'always' | 'md' | 'lg';

// Sort configuration
export interface SortConfig {
	key: string;
	direction: SortDirection;
}

// Custom event types
export interface SwipeEvent extends CustomEvent<{ direction: 'left' | 'right' }> {}
export interface LongPressEvent extends CustomEvent<void> {}

export interface TableRowEvents {
	'on:swipe': SwipeEvent;
	'on:longpress': LongPressEvent;
}

// Extend Svelte HTML attributes
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		'on:swipe'?: (e: SwipeEvent) => void;
		'on:longpress'?: (e: LongPressEvent) => void;
		onswipe?: (e: SwipeEvent) => void;
		onlongpress?: (e: LongPressEvent) => void;
	}
}

// Formatting types
export type FormatterFunction<T = any> = (value: any, row: T, column: ColumnDef<T>) => string;

export interface FormatterComponentProps<T = any> {
	value: any;
	row: T;
	column: ColumnDef<T>;
}

export interface FormatterEvents {}
export interface FormatterSlots {}

export type FormatterComponent = ComponentType<
	SvelteComponentTyped<FormatterComponentProps, FormatterEvents, FormatterSlots>
>;

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
	advanced?: AdvancedFilterState;
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

export type SelectionMode = 'single' | 'multiple';

// Props & Events
export interface SuperTableProps<T = any> {
	data: T[];
	columns: ColumnDef<T>[];
	rowKey: keyof T | string | number | symbol;
	mobileView?: MobileViewType;
	sort?: SortConfig[];
	itemsPerPageProp?: number;
	currentPageProp?: number;
	totalItemsProp?: number;
	isLoadingProp?: boolean;
	tableClass?: string;
	cardClass?: string;
	rowClass?: string | ((row: T) => string);
	isSelectable?: boolean;
	serverSide?: boolean; // Whether filtering/sorting/pagination is handled by the server
	maxVisibleColumns?: number; // Max columns to show initially in mobile card view
	dbError?: boolean; // Flag to indicate if there was a DB error
	selectionMode?: SelectionMode;
	disabledRowKeys?: (string | number)[];
	containerHeight?: string;
	persistenceId?: string;
	filterStateProp?: FilterState;
}

export interface SuperTableEvents<T = any> {
	sort: CustomEvent<SortConfig[] | null>;
	filter: CustomEvent<FilterState>;
	selectionChange: CustomEvent<Array<T[keyof T]>>;
	pageChange: CustomEvent<number>;
}

// This class defines the component's public contract for TypeScript.
export class SuperTableComponent<T extends Record<string, any>> extends SvelteComponent<
	SuperTableProps<T>,
	{ [key: string]: any }, // Events (bisa dispesifikkan jika perlu)
	{
		// Slot definitions:
		'row-actions': { row: T };
		'error-state': Record<string, never>; // Slot ada, tanpa props
		'loading-state': Record<string, never>; // Slot ada, tanpa props
		'empty-state': Record<string, never>; // Slot ada, tanpa props
		'bulk-actions': { selectedIds: Array<T[keyof T]> };
		'global-filter': {
			searchTerm: string | undefined;
			updateSearchTerm: (value: string) => void;
		};
	}
> {}
