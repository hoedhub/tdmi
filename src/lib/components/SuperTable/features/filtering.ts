import type { FilterState, FilterType, ColumnDef, AdvancedFilterCondition, AdvancedFilterState } from '../types';

function isFilterType(value: any): value is FilterType {
	return typeof value === 'string' && ['text', 'select', 'date', 'number'].includes(value);
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

// --- Advanced filter condition evaluator ---

function evaluateCondition(cellValue: string, condition: AdvancedFilterCondition): boolean {
	const { operator, value, value2 } = condition;
	const cell = cellValue.trim();
	const val = (value ?? '').trim();

	switch (operator) {
		case 'contains':
			return includesIgnoreCase(cell, val);
		case 'not_contains':
			return !includesIgnoreCase(cell, val);
		case 'equals':
			return cell.toLowerCase() === val.toLowerCase();
		case 'not_equals':
			return cell.toLowerCase() !== val.toLowerCase();
		case 'starts_with':
			return cell.toLowerCase().startsWith(val.toLowerCase());
		case 'ends_with':
			return cell.toLowerCase().endsWith(val.toLowerCase());
		case 'is_empty':
			return cell === '' || cell === null || cell === undefined;
		case 'is_not_empty':
			return cell !== '' && cell !== null && cell !== undefined;
		case 'date_before': {
			if (!val) return true;
			return new Date(cell) < new Date(val);
		}
		case 'date_after': {
			if (!val) return true;
			return new Date(cell) > new Date(val);
		}
		case 'date_equals': {
			if (!val) return true;
			return new Date(cell).toDateString() === new Date(val).toDateString();
		}
		case 'date_between': {
			if (!val || !value2) return true;
			const d = new Date(cell);
			return d >= new Date(val) && d <= new Date(value2);
		}
		case 'num_equals':
			return Number(cell) === Number(val);
		case 'num_not_equals':
			return Number(cell) !== Number(val);
		case 'num_gt':
			return Number(cell) > Number(val);
		case 'num_gte':
			return Number(cell) >= Number(val);
		case 'num_lt':
			return Number(cell) < Number(val);
		case 'num_lte':
			return Number(cell) <= Number(val);
		default:
			return true;
	}
}

function applyAdvancedFilter<T>(data: T[], advanced: AdvancedFilterState): T[] {
	const { conditions, logic } = advanced;

	// Skip conditions without a value unless the operator doesn't need one
	const noValueOperators = new Set(['is_empty', 'is_not_empty']);
	const activeConditions = conditions.filter(
		(c) => noValueOperators.has(c.operator) || (c.value ?? '').trim() !== ''
	);

	if (activeConditions.length === 0) return data;

	return data.filter((row) => {
		if (logic === 'OR') {
			return activeConditions.some((condition) => {
				const cellValue = getValue(row, condition.columnKey);
				return evaluateCondition(cellValue, condition);
			});
		} else {
			// AND (default)
			return activeConditions.every((condition) => {
				const cellValue = getValue(row, condition.columnKey);
				return evaluateCondition(cellValue, condition);
			});
		}
	});
}

export function filterData<T>(data: T[], filterState: FilterState, columns: ColumnDef<T>[]): T[] {
	let filtered = [...data];

	// Apply global filter if present
	if (filterState.global) {
		const searchableColumns = columns.filter((col) => !col.hidden);
		filtered = filtered.filter((row) => {
			return searchableColumns.some((col) => {
				const value = getValue(row, col.key);
				return includesIgnoreCase(value, filterState.global!);
			});
		});
	}

	// Apply column-specific filters
	Object.entries(filterState.columns).forEach(([key, filterValue]) => {
		if (!filterValue) return;

		const column = columns.find((col) => col.key === key);
		if (!column || !column.filterable) return;

		filtered = filtered.filter((row) => {
			const cellValue = getValue(row, key);
			const filterType = isFilterType(column.filterable)
				? column.filterable
				: column.filterConfig?.type || 'text';

			switch (filterType) {
				case 'select':
					return String(cellValue) === String(filterValue);

				case 'date':
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

	// Apply advanced (rule-based) filters
	if (filterState.advanced && filterState.advanced.conditions.length > 0) {
		filtered = applyAdvancedFilter(filtered, filterState.advanced);
	}

	return filtered;
}
