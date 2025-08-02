import { writable, derived } from 'svelte/store';
import type { SortConfig, FilterState } from './types';

// Filter state store
export const filterState = writable<FilterState>({
	global: '',
	columns: {}
});

// Selection state store (Set of selected row keys)
export const selectedIds = writable<Set<any>>(new Set());

// Current page store
export const currentPage = writable(1);

// Items per page store
export const itemsPerPage = writable(10);

// Loading state store
export const isLoading = writable(false);

// Create derived store for total pages
export const totalPages = derived([itemsPerPage], ([$itemsPerPage], set) => {
	// This will be updated by the component when data changes
	set(1);
});

export const dbError = writable(false);
