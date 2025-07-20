import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { sql, eq, inArray } from 'drizzle-orm';
import { deleteFile, getPublicFileUrl, uploadFile } from '$lib/server/googleDrive';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { ids } = await request.json();

		if (!Array.isArray(ids) || ids.length === 0) {
			return json({});
		}

		const fotos = await db
			.select({
				id: muridTable.id,
				fotoDriveId: muridTable.fotoDriveId
			})
			.from(muridTable)
			.where(inArray(muridTable.id, ids));

		// Convert to object with id as key and a public URL for the image
		const fotosMap = fotos.reduce(
			(acc, { id, fotoDriveId }) => {
				if (fotoDriveId) {
					acc[id] = getPublicFileUrl(fotoDriveId);
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

		// 1. Get the old file ID before updating
		const existingMurid = await db
			.select({ fotoDriveId: muridTable.fotoDriveId })
			.from(muridTable)
			.where(eq(muridTable.id, muridId))
			.get();

		const oldFileId = existingMurid?.fotoDriveId;

		// 2. Upload the new file
		const fotoBuffer = Buffer.from(await foto.arrayBuffer());
		const newFileId = await uploadFile(fotoBuffer, foto.type, foto.name);

		// 3. Update the database with the new file ID
		await db.update(muridTable).set({ fotoDriveId: newFileId }).where(eq(muridTable.id, muridId));

		// 4. If an old file existed, delete it from Google Drive
		if (oldFileId) {
			await deleteFile(oldFileId);
		}

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