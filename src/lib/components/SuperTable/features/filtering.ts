import type { FilterState, ColumnDef, FilterType } from '../types';

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
    });

    return filtered;
}
