import { writable, derived, type Writable } from 'svelte/store';
import type { SortConfig, FilterState } from './types';

// Context key for per-instance stores
export const TABLE_CONTEXT_KEY = Symbol('SUPER_TABLE_CONTEXT');

export interface TableStores {
	filterState: Writable<FilterState>;
	selectedIds: Writable<Set<any>>;
	currentPage: Writable<number>;
	itemsPerPage: Writable<number>;
	isLoading: Writable<boolean>;
	dbError: Writable<boolean>;
}

export function createTableStores(): TableStores {
	return {
		filterState: writable<FilterState>({
			global: '',
			columns: {}
		}),
		selectedIds: writable<Set<any>>(new Set()),
		currentPage: writable(1),
		itemsPerPage: writable(10),
		isLoading: writable(false),
		dbError: writable(false)
	};
}

// Deprecated global stores - these cause interference between instances
// Keeping them for now to avoid breaking existing imports until refactored
/** @deprecated Use context-based stores instead */
export const filterState = writable<FilterState>({
	global: '',
	columns: {}
});

/** @deprecated Use context-based stores instead */
export const selectedIds = writable<Set<any>>(new Set());

/** @deprecated Use context-based stores instead */
export const currentPage = writable(1);

/** @deprecated Use context-based stores instead */
export const itemsPerPage = writable(10);

/** @deprecated Use context-based stores instead */
export const isLoading = writable(false);

// Create derived store for total pages
export const totalPages = derived([itemsPerPage], ([$itemsPerPage], set) => {
	// This will be updated by the component when data changes
	set(1);
});

/** @deprecated Use context-based stores instead */
export const dbError = writable(false);
