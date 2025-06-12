import Component from './SuperTable.svelte';
import type { SuperTableComponent } from './types';

// This is the magic line.
// We are exporting the raw Svelte component, but we are telling TypeScript
// that its type is our fully-featured SuperTableComponent class.
export const SuperTable = Component as typeof SuperTableComponent;

// Main component
// export { default as SuperTable } from './SuperTable.svelte';

// Types
export type {
    SortDirection,
    FilterType,
    MobileViewType,
    ResponsiveShow,
    SortConfig,
    FilterState,
    ColumnDef,
    SuperTableProps,
    SuperTableEvents
} from './types';

// Utility functions
export { sortData } from './features/sorting';
export { filterData } from './features/filtering';
export { paginateData, calculateTotalPages, generatePageNumbers } from './features/pagination';

// Actions
export { longPress } from './actions/longPressAction';
export { swipe } from './actions/swipeAction';
