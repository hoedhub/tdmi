import { sql, and, or, eq, ne, like, notLike, gt, gte, lt, lte, isNull, isNotNull, between } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { AdvancedFilterState, AdvancedFilterCondition } from '../components/SuperTable/types';

export interface ColumnMappingItem {
	column: any;
	transform?: (value: string) => any;
}

export type ColumnMapping = Record<string, any | any[] | ColumnMappingItem | ColumnMappingItem[]>;

function getColumnAndTransform(item: any): ColumnMappingItem {
	if (item && typeof item === 'object' && 'column' in item) {
		return item;
	}
	return { column: item };
}

export function buildAdvancedFilterCondition(
	condition: AdvancedFilterCondition,
	columnMapping: ColumnMapping
): SQL | undefined {
	const { columnKey, operator, value, value2 } = condition;
	let mapping = columnMapping[columnKey];

	if (!mapping) return undefined;

	const items = Array.isArray(mapping) 
		? mapping.map(getColumnAndTransform) 
		: [getColumnAndTransform(mapping)];

	const val = value?.trim();
	const val2 = value2?.trim();

	const buildSqlForColumn = (item: ColumnMappingItem, op: string, v: string, v2?: string): SQL | undefined => {
		const { column, transform } = item;
		const transformedVal = transform ? transform(v) : v;
		const transformedVal2 = v2 && transform ? transform(v2) : v2;

		switch (op) {
			case 'contains':
				return like(column, `%${v}%`);
			case 'not_contains':
				return notLike(column, `%${v}%`);
			case 'equals':
				return eq(column, transformedVal);
			case 'not_equals':
				return ne(column, transformedVal);
			case 'starts_with':
				return like(column, `${v}%`);
			case 'ends_with':
				return like(column, `%${v}`);
			case 'is_empty':
				return or(isNull(column), eq(column, ''));
			case 'is_not_empty':
				return and(isNotNull(column), ne(column, ''));
			case 'date_before':
				return lt(column, v);
			case 'date_after':
				return gt(column, v);
			case 'date_equals':
				return eq(column, v);
			case 'date_between':
				return between(column, v, v2!);
			case 'num_equals':
				return eq(column, Number(v));
			case 'num_not_equals':
				return ne(column, Number(v));
			case 'num_gt':
				return gt(column, Number(v));
			case 'num_gte':
				return gte(column, Number(v));
			case 'num_lt':
				return lt(column, Number(v));
			case 'num_lte':
				return lte(column, Number(v));
			default:
				return undefined;
		}
	};

	const conditions = items
		.map((item) => buildSqlForColumn(item, operator, val, val2))
		.filter((c): c is SQL => c !== undefined);

	if (conditions.length === 0) return undefined;

	// For multiple columns (like 'alamat' mapping to multiple fields):
	// 'contains' should be OR
	// 'not_contains' should be AND
	// 'is_empty' should be AND
	// 'is_not_empty' should be OR
	
	if (operator === 'not_contains' || operator === 'is_empty' || operator === 'not_equals') {
		return and(...conditions);
	}
	
	return or(...conditions);
}

export function buildAdvancedFilter(
	state: AdvancedFilterState | undefined,
	columnMapping: ColumnMapping
): SQL | undefined {
	if (!state || !state.conditions) return undefined;
	
	const { conditions, logic } = state;
	
	const noValueOperators = new Set(['is_empty', 'is_not_empty']);
	const activeConditions = conditions.filter(
		(c) => noValueOperators.has(c.operator) || (c.value ?? '').trim() !== ''
	);

	if (activeConditions.length === 0) return undefined;

	const sqlConditions = activeConditions
		.map((c) => buildAdvancedFilterCondition(c, columnMapping))
		.filter((c): c is SQL => c !== undefined);

	if (sqlConditions.length === 0) return undefined;

	return logic === 'OR' ? or(...sqlConditions) : and(...sqlConditions);
}
