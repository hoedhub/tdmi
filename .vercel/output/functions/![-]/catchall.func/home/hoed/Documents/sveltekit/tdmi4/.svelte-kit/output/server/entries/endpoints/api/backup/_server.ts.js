import { d as db, f as client } from "../../../../chunks/index.js";
import { sql } from "drizzle-orm";
import { u as userHasPermission } from "../../../../chunks/accessControl.js";
import { error } from "@sveltejs/kit";
function escapeSqlValue(val) {
  if (val === null || val === void 0) {
    return "NULL";
  }
  if (typeof val === "number") {
    return val.toString();
  }
  if (typeof val === "string") {
    return "'" + val.replace(/'/g, "''") + "'";
  }
  if (val instanceof Uint8Array) {
    return "X'" + Buffer.from(val).toString("hex") + "'";
  }
  return "'" + String(val) + "'";
}
function createDatabaseDump() {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue("PRAGMA foreign_keys=OFF;\n");
        controller.enqueue("BEGIN TRANSACTION;\n");
        const schemas = await db.select({
          name: sql`name`,
          sql: sql`sql`
        }).from(sql`sqlite_schema`).where(
          sql`type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' AND name NOT LIKE '__drizzle_%'`
        );
        for (const table of schemas) {
          controller.enqueue(`${table.sql};
`);
          const rows = await client.execute({
            sql: `SELECT * FROM "${table.name}"`,
            args: []
          });
          if (rows.rows.length > 0) {
            for (const row of rows.rows) {
              const values = Object.values(row).map(escapeSqlValue).join(",");
              controller.enqueue(`INSERT INTO "${table.name}" VALUES(${values});
`);
            }
          }
        }
        const otherSchemas = await db.select({
          name: sql`name`,
          sql: sql`sql`
        }).from(sql`sqlite_schema`).where(sql`type IN ('index', 'trigger', 'view') AND sql IS NOT NULL`);
        for (const schema of otherSchemas) {
          controller.enqueue(`${schema.sql};
`);
        }
        controller.enqueue("COMMIT;\n");
        controller.close();
      } catch (err) {
        console.error("Error during database dump:", err);
        controller.error(new Error(`Failed to generate database dump: ${err.message}`));
      }
    }
  });
  return stream;
}
const POST = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }
  const canCreateBackup = await userHasPermission(locals.user.id, "perm-backup-create");
  if (!canCreateBackup) {
    throw error(403, "Forbidden: You do not have permission to create backups.");
  }
  try {
    const dumpStream = createDatabaseDump();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sql`;
    return new Response(dumpStream, {
      status: 200,
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (e) {
    console.error("Backup failed:", e);
    throw error(500, `Backup failed: ${e.message}`);
  }
};
export {
  POST
};
