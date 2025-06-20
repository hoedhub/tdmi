import { json } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { propTable } from '$lib/drizzle/schema';

export async function GET() {
	const propinsi = await db.select().from(propTable);
	return json(propinsi);
}
