import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';

// The SDK automatically configures itself from the CLOUDINARY_URL env var.
// No manual .config() calls are needed.

/**
 * Uploads a file to Cloudinary with a standardized Public ID.
 * @param fileBuffer The file content as a Buffer.
 * @param muridId The unique ID of the murid, used to create the Public ID.
 * @returns The Cloudinary Public ID (e.g., "murid_photos/123").
 */
export async function uploadFile(fileBuffer: Buffer, muridId: number): Promise<string> {
	return new Promise((resolve, reject) => {
		// Standardized Public ID format: "murid_photos/[murid_id]"
		const public_id = `murid_photos/${muridId}`;

		const uploadStream = cloudinary.uploader.upload_stream(
			{
				public_id: public_id,
				overwrite: true, // Overwrite the file if it already exists for this ID
				invalidate: true // Invalidate the CDN cache to show the new image immediately
			},
			(error, result) => {
				if (error) {
					return reject(error);
				}
				if (!result) {
					return reject(new Error('Cloudinary upload result is undefined.'));
				}
				// Resolve with the exact public_id used.
				resolve(result.public_id);
			}
		);

		const bufferStream = new stream.PassThrough();
		bufferStream.end(fileBuffer);
		bufferStream.pipe(uploadStream);
	});
}

export async function deleteFile(publicId: string): Promise<void> {
	try {
		// The `destroy` method works perfectly with the new publicId format.
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error(`Failed to delete file ${publicId} from Cloudinary:`, error);
	}
}

export function getPublicFileUrl(publicId: string): string {
	// The official SDK method will generate the correct, fully-qualified URL.
	return cloudinary.url(publicId, { secure: true });
}
