import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { sql } from 'drizzle-orm';
import type { RequestEvent } from './$types';
import { inArray } from 'drizzle-orm';
import { fetchMuridData } from '$lib/server/murid';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const queryParams = url.searchParams;
		const pageSize = Number(queryParams.get('pageSize')) || 50;
		const page = Number(queryParams.get('page')) || 1;

		// Parse filterBy and sortBy if they exist
		const filterBy = queryParams.get('filterBy') ? JSON.parse(queryParams.get('filterBy') || '[]') : undefined;
		const sortBy = queryParams.get('sortBy') ? JSON.parse(queryParams.get('sortBy') || '[]') : undefined;

		const result = await fetchMuridData({
			page,
			pageSize,
			filterBy,
			sortBy,
		});

		return json({
			murid: result.murids,
			filteredTotalCount: result.filteredTotal,
			totalCount: result.total,
			pageSize,
			currentPage: page
		});
	} catch (err) {
		console.error('Error in GET function:', err);
		console.error('Error details:', err instanceof Error ? err.stack : String(err));
		return json(
			{
				error: `An error occurred while fetching data: ${err instanceof Error ? err.message : String(err)}`
			},
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const muridData = await request.json();

		// Get the current user ID from the session
		const userId = locals.user?.id;

		if (!userId) {
			return json({ error: 'User not authenticated' }, { status: 401 });
		}

		// Add updatedAt and updaterId to the murid data
		const enrichedMuridData = {
			...muridData,
			updatedAt: new Date().toISOString(),
			updaterId: userId
		};

		const result = await db.insert(muridTable).values(enrichedMuridData).returning();
		return json(result[0]);
	} catch (err) {
		console.error('Error in POST function:', err);
		console.error('Error details:', err instanceof Error ? err.stack : String(err));
		return json(
			{
				error: `An error occurred while adding new murid: ${err instanceof Error ? err.message : String(err)}`
			},
			{ status: 500 }
		);
	}
};

export async function DELETE({ request }: RequestEvent) {
	try {
		const { ids } = await request.json();

		if (!Array.isArray(ids) || ids.length === 0) {
			return json({ success: false, error: 'Invalid or empty ids array' }, { status: 400 });
		}

		await db.delete(muridTable).where(inArray(muridTable.id, ids));

		return json({ success: true, deletedCount: ids.length });
	} catch (error) {
		console.error('Error deleting records:', error);
		return json({ success: false, error: 'Failed to delete records' }, { status: 500 });
	}
}
