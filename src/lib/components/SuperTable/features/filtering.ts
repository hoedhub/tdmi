import type { FilterState, FilterType, ColumnDef } from '../types';

function isFilterType(value: any): value is FilterType {
    return typeof value === 'string' && ['text', 'select', 'date'].includes(value);
}

function getValue(obj: any, key: string | number | symbol): string {
    const value = obj[key];
    if (value === null || value === undefined) return '';
    return String(value);
}

function includesIgnoreCase(value: any, searchTerm: string): boolean {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
}

export function filterData<T>(
    data: T[],
    filterState: FilterState,
    columns: ColumnDef<T>[]
): T[] {
    console.log('[Client Filtering] Starting filtering with:', {
        globalFilter: filterState.global,
        columnFilters: filterState.columns,
        dataLength: data.length
    });

    let filtered = [...data];

    // Apply global filter if present
    if (filterState.global) {
        const searchableColumns = columns.filter(col => !col.hidden);
        filtered = filtered.filter(row => {
            return searchableColumns.some(col => {
                const value = getValue(row, col.key);
                return includesIgnoreCase(value, filterState.global!);
            });
        });
    }

    // Apply column-specific filters
    Object.entries(filterState.columns).forEach(([key, filterValue]) => {
        if (!filterValue) return;

        const column = columns.find(col => col.key === key);
        if (!column || !column.filterable) return;

        console.log('[Client Filtering] Applying column filter:', {
            column: key,
            filterValue,
            filterType: column.filterable
        });

        filtered = filtered.filter(row => {
            const cellValue = getValue(row, key);
            const filterType = isFilterType(column.filterable) ? column.filterable :
                column.filterConfig?.type || 'text';

            switch (filterType) {
                case 'select':
                    return String(cellValue) === String(filterValue);

                case 'date':
                    // Handle date range filtering
                    if (Array.isArray(filterValue) && filterValue.length === 2) {
                        const [start, end] = filterValue;
                        const date = new Date(cellValue);
                        return date >= new Date(start) && date <= new Date(end);
                    }
                    return includesIgnoreCase(cellValue, String(filterValue));

                case 'text':
                default:
                    return includesIgnoreCase(cellValue, String(filterValue));
            }
        });

        console.log('[Client Filtering] After column filter:', {
            column: key,
            resultCount: filtered.length
        });
    });

    console.log('[Client Filtering] Final filtered results:', {
        data: filtered,
        initialCount: data.length,
        finalCount: filtered.length,
        filtersApplied: {
            global: !!filterState.global,
            columns: Object.keys(filterState.columns).filter(k => filterState.columns[k])
        }
    });

    return filtered;
}
