import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';
import { config } from 'dotenv';

config({ path: '.env' });

// The SDK automatically configures itself from the CLOUDINARY_URL env var.
// No manual .config() calls are needed.

/**
 * Uploads a file to Cloudinary with a standardized Public ID.
 * @param fileBuffer The file content as a Buffer.
 * @param muridId The unique ID of the murid, used to create the Public ID.
 * @returns The Cloudinary Public ID (e.g., "murid_photos/123").
 */
export async function uploadFile(fileBuffer: Buffer, muridId: number): Promise<string> {
	if (!process.env.CLOUDINARY_URL) {
		throw new Error('CLOUDINARY_URL is not configured in the environment.');
	}
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
	if (!publicId) return '';

	// If CLOUDINARY_URL is missing, return a placeholder or empty string instead of crashing.
	// The SDK's auto-config might fail if it's not in process.env at the right time.
	try {
		// Use explicit config if needed, or just let it try.
		return cloudinary.url(publicId, { secure: true });
	} catch (error) {
		console.error('Cloudinary URL generation failed. Is CLOUDINARY_URL set?', error);
		return '';
	}
}
