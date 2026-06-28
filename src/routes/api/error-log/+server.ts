import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { errorLogTable } from '$lib/drizzle/schema';
import { nanoid } from 'nanoid';
import { desc, eq, like, and, sql } from 'drizzle-orm';
import { clientErrorLogSchema } from '$lib/schemas/api';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const rawBody = await request.json();
		const parsed = clientErrorLogSchema.safeParse(rawBody);
		if (!parsed.success) {
			return json({ ok: false, errors: parsed.error.issues }, { status: 400 });
		}
		const body = parsed.data;
		const id = nanoid(16);
		await db.insert(errorLogTable).values({
			id,
			level: body.level,
			source: 'client',
			message: body.message,
			stack: body.stack ?? null,
			url: body.url ?? null,
			userAgent: body.userAgent ?? null,
			metadata: body.metadata ? JSON.stringify(body.metadata) : null
		});
		return json({ ok: true, id });
	} catch (err) {
		console.error('Failed to store error log:', err);
		return json({ ok: false }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const page = parseInt(url.searchParams.get('page') ?? '1');
	const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20');
	const level = url.searchParams.get('level');
	const source = url.searchParams.get('source');
	const resolved = url.searchParams.get('resolved');
	const search = url.searchParams.get('search');

	const conditions = [];
	if (level) conditions.push(eq(errorLogTable.level, level as any));
	if (source) conditions.push(eq(errorLogTable.source, source as any));
	if (resolved === 'true') conditions.push(eq(errorLogTable.resolved, true));
	if (resolved === 'false') conditions.push(eq(errorLogTable.resolved, false));
	if (search) conditions.push(like(errorLogTable.message, `%${search}%`));

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(errorLogTable)
		.where(where);
	const total = Number(totalResult?.count ?? 0);

	const rows = await db
		.select()
		.from(errorLogTable)
		.where(where)
		.orderBy(desc(errorLogTable.createdAt))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	return json({ rows, total, page, pageSize });
};
