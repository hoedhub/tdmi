import { SvelteComponent } from 'svelte';
import type { SortConfig, ColumnDef, FormatterFunction } from '../types';

function isFormatterFunction<T>(formatter: unknown): formatter is FormatterFunction<T> {
    return typeof formatter === 'function' && !(formatter.prototype instanceof SvelteComponent);
}

function getValue(obj: any, key: string): any {
    return obj[key];
}

function compareValues(a: any, b: any, direction: 'asc' | 'desc'): number {
    if (a === null || a === undefined) return direction === 'asc' ? -1 : 1;
    if (b === null || b === undefined) return direction === 'asc' ? 1 : -1;

    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();

    if (aStr < bStr) return direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return direction === 'asc' ? 1 : -1;
    return 0;
}

export function sortData<T>(data: T[], sortConfig: SortConfig | null, columns: ColumnDef<T>[]): T[] {
    if (!sortConfig) return [...data];

    const column = columns.find(col => col.key === sortConfig.key);
    if (!column) return [...data];

    return [...data].sort((a, b) => {
        const aVal = getValue(a, sortConfig.key);
        const bVal = getValue(b, sortConfig.key);

        // Use formatter if available and it's a function
        if (column.formatter && isFormatterFunction<T>(column.formatter)) {
            const aFormatted = column.formatter(aVal, a, column);
            const bFormatted = column.formatter(bVal, b, column);
            return compareValues(aFormatted, bFormatted, sortConfig.direction);
        }

        return compareValues(aVal, bVal, sortConfig.direction);
    });
}
