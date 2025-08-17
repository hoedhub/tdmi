// src/lib/server/db-dump.ts
import { db, client } from '$lib/drizzle';
import { sql } from 'drizzle-orm';

/**
 * Escapes a value for use in a SQL literal.
 * @param val The value to escape.
 * @returns The escaped value.
 */
function escapeSqlValue(val: any): string {
	if (val === null || val === undefined) {
		return 'NULL';
	}
	if (typeof val === 'number') {
		return val.toString();
	}
	if (typeof val === 'string') {
		// Escape single quotes by doubling them up
		return "'" + val.replace(/'/g, "''") + "'";
	}
	if (val instanceof Uint8Array) {
		// Convert blob to hex literal X'...'
		return "X'" + Buffer.from(val).toString('hex') + "'";
	}
	// Fallback for other types (like boolean, which will be converted to 0 or 1 by SQLite driver)
	return "'" + String(val) + "'";
}

/**
 * Programmatically creates a SQL dump of the entire database.
 * @returns A ReadableStream that yields the SQL dump content as a string.
 */
export function createDatabaseDump(): ReadableStream<string> {
	const stream = new ReadableStream({
		async start(controller) {
			try {
				controller.enqueue('PRAGMA foreign_keys=OFF;\n');
				controller.enqueue('BEGIN TRANSACTION;\n');

				// 1. Get all table schemas
				const schemas = await db
					.select({
						name: sql<string>`name`,
						sql: sql<string>`sql`
					})
					.from(sql`sqlite_schema`)
					.where(
						sql`type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' AND name NOT LIKE '__drizzle_%'`
					);

				for (const table of schemas) {
					// 2. Enqueue CREATE TABLE statement
					controller.enqueue(`${table.sql};\n`);

					// 3. Get all data from the current table
					const rows = await client.execute({
						sql: `SELECT * FROM "${table.name}"`,
						args: []
					});

					// 4. Enqueue INSERT statements for each row
					if (rows.rows.length > 0) {
						for (const row of rows.rows) {
							const values = Object.values(row).map(escapeSqlValue).join(',');
							controller.enqueue(`INSERT INTO "${table.name}" VALUES(${values});\n`);
						}
					}
				}

				// 5. Get indexes and other schema elements
				const otherSchemas = await db
					.select({
						name: sql<string>`name`,
						sql: sql<string>`sql`
					})
					.from(sql`sqlite_schema`)
					.where(sql`type IN ('index', 'trigger', 'view') AND sql IS NOT NULL`);

				for (const schema of otherSchemas) {
					controller.enqueue(`${schema.sql};\n`);
				}

				controller.enqueue('COMMIT;\n');
				controller.close();
			} catch (err: any) {
				console.error('Error during database dump:', err);
				controller.error(new Error(`Failed to generate database dump: ${err.message}`));
			}
		}
	});

	return stream;
}
