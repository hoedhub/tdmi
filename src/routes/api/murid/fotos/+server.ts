import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { sql, eq, inArray } from 'drizzle-orm';
import { deleteFile, getPublicFileUrl, uploadFile } from '$lib/server/cloudinary';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { ids } = await request.json();

		if (!Array.isArray(ids) || ids.length === 0) {
			return json({});
		}

		const fotos = await db
			.select({
				id: muridTable.id,
				fotoPublicId: muridTable.fotoPublicId
			})
			.from(muridTable)
			.where(inArray(muridTable.id, ids));

		// Convert to object with id as key and a public URL for the image
		const fotosMap = fotos.reduce(
			(acc, { id, fotoPublicId }) => {
				if (fotoPublicId) {
					acc[id] = getPublicFileUrl(fotoPublicId);
				} else {
					acc[id] = null;
				}
				return acc;
			},
			{} as Record<number, string | null>
		);

		return json(fotosMap);
	} catch (error) {
		console.error('Error fetching fotos:', error);
		return json({}, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const id = formData.get('id');
		const foto = formData.get('foto') as File | null;

		if (!id || !foto) {
			return json({ message: 'ID and foto are required' }, { status: 400 });
		}

		const muridId = Number(id);

		// Upload the new file using the muridId.
		// This will automatically overwrite the old file in Cloudinary.
		const fotoBuffer = Buffer.from(await foto.arrayBuffer());
		const newFileId = await uploadFile(fotoBuffer, muridId);

		// Update the database with the new file ID
		await db.update(muridTable).set({ fotoPublicId: newFileId }).where(eq(muridTable.id, muridId));

		return json({
			message: 'Foto updated successfully',
			fileId: newFileId,
			url: getPublicFileUrl(newFileId)
		});
	} catch (error) {
		console.error('Error updating foto:', error);
		return json({ message: 'Error updating foto' }, { status: 500 });
	}
};
