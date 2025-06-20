import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return json({});
        }

        const fotos = await db
            .select({
                id: muridTable.id,
                foto: muridTable.foto
            })
            .from(muridTable)
            .where(sql`${muridTable.id} IN ${ids}`);

        // Convert to object with id as key
        const fotosMap = fotos.reduce((acc, { id, foto }) => {
            if (foto instanceof Buffer) {
                acc[id] = foto.toString('base64');
            } else if (foto === null) {
                acc[id] = null;
            } else {
                acc[id] = String(foto); // Convert any other type to string
            }
            return acc;
        }, {} as Record<number, string | null>);

        return json(fotosMap);
    } catch (error) {
        console.error('Error fetching fotos:', error);
        return json({}, { status: 500 });
    }
};
