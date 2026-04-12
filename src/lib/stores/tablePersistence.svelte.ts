import { browser } from '$app/environment';
import type { SortConfig, FilterState } from '$lib/components/SuperTable/types';

export interface TableState {
	currentPage: number;
	itemsPerPage: number;
	filterState: FilterState;
	sort: SortConfig[] | undefined;
	baseArea: string; // The base path this state belongs to (e.g. /member/pendataan)
}

class TablePersistence {
	private states = $state<Record<string, TableState>>({});

	getState(key: string): TableState | undefined {
		return this.states[key];
	}

	saveState(key: string, state: TableState) {
		this.states[key] = state;
	}

	clearAllStates() {
		this.states = {};
	}

	/**
	 * Detect if we have moved away from major areas and clear table states accordingly.
	 * @param currentPath The current URL pathname
	 */
	checkAreaChange(currentPath: string) {
		if (!browser) return;
		
		const keys = Object.keys(this.states);
		if (keys.length === 0) return;

		for (const key of keys) {
			const savedState = this.states[key];
			// If current path does not start with the base area of the saved state,
			// it means we've moved away from that section.
			if (!currentPath.startsWith(savedState.baseArea)) {
				delete this.states[key];
			}
		}
	}
}

export const tablePersistence = new TablePersistence();
