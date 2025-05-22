/**
 * Utility functions for the AdvancedTable component.
 */

/**
 * Debounces a function, ensuring it's only called after a certain delay
 * since the last time it was invoked.
 *
 * @template T - The type of the function to debounce.
 * @param {T} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} - The debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return ((...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null; // Clear timeoutId after execution
        }, delay);
    }) as T;
}

/**
 * Safely retrieves a potentially nested property from an object using a dot-notation string key.
 * Example: getProperty(row, 'user.address.city')
 *
 * @template T - The type of the object.
 * @param {T} obj - The object to retrieve the property from.
 * @param {string} path - The dot-notation path string (e.g., 'a.b.c').
 * @param {any} [defaultValue=undefined] - The value to return if the path is not found.
 * @returns {any} - The value at the specified path or the defaultValue.
 */
export function getProperty<T extends Record<string, any>>(
    obj: T | null | undefined,
    path: string,
    defaultValue: any = undefined
): any {
    if (!obj || !path) {
        return defaultValue;
    }

    // Split path by dots, but handle escaped dots if needed (e.g., 'a\.b.c')
    // Simple split for now:
    const keys = path.split('.');
    let result: any = obj;

    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        // Check if key exists directly or handle potential array access like 'list[0]' later if needed
        result = result[key];
    }

    return result === undefined ? defaultValue : result;
}


/**
 * Placeholder for a more advanced sorting comparator function.
 * This could handle different data types (numbers, strings case-insensitive, dates),
 * null/undefined values, and potentially locale-specific string comparison.
 *
 * @template T - Row data type
 * @param {keyof T | string} sortKey - The key to sort by.
 * @param {'asc' | 'desc'} sortDirection - The direction.
 * @returns {(a: T, b: T) => number} - A comparison function for Array.sort().
 */
export function createAdvancedSorter<T extends Record<string, any>>(
    sortKey: keyof T | string,
    sortDirection: 'asc' | 'desc'
): (a: T, b: T) => number {
    const dir = sortDirection === 'asc' ? 1 : -1;

    return (a: T, b: T): number => {
        // Use getProperty for potentially nested keys
        const valA = getProperty(a, String(sortKey));
        const valB = getProperty(b, String(sortKey));

        // Basic type handling example (expand significantly)
        const typeA = typeof valA;
        const typeB = typeof valB;

        // Handle null/undefined (e.g., push them to the end)
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1 * dir; // a is null/undefined, put it after b
        if (valB == null) return -1 * dir; // b is null/undefined, put it after a

        if (typeA === 'string' && typeB === 'string') {
            return valA.localeCompare(valB) * dir;
        }

        if (typeA === 'number' && typeB === 'number') {
            return (valA - valB) * dir;
        }

        if (typeA === 'boolean' && typeB === 'boolean') {
            return (Number(valA) - Number(valB)) * dir;
        }

        // Add Date handling, potentially more complex comparisons

        // Fallback basic comparison
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
    };
}


// --- Other potential utilities ---
// - Formatting helpers (currency, dates) if not done via column.formatter
// - Client-side filtering logic if it becomes complex
// - etc.