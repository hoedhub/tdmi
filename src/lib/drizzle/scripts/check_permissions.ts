import { db } from '../index';
import { permissionsTable } from '../schema';

async function check() {
    const data = await db.select().from(permissionsTable);
    console.log(JSON.stringify(data, null, 2));
}

check().catch(console.error);
