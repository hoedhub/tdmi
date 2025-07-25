
import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';
import path from 'path';

// The SDK automatically configures itself from the CLOUDINARY_URL env var.
// No manual .config() calls are needed.

export async function uploadFile(
	fileBuffer: Buffer,
	mimetype: string,
	originalFilename: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		// Get the filename without the extension.
		const extension = path.extname(originalFilename);
		const filenameWithoutExt = path.basename(originalFilename, extension);

		// Sanitize the base filename.
		const sanitizedFilename = filenameWithoutExt.replace(/\s+/g, '_').replace(/[^\w-]/g, '');

		// Create the public_id using the sanitized base filename.
		// Cloudinary will handle the format/extension automatically.
		const public_id = `tdmi/${new Date().toISOString()}-${sanitizedFilename}`;

		const uploadStream = cloudinary.uploader.upload_stream(
			{
				public_id: public_id,
				use_filename: false,
				unique_filename: false,
				overwrite: true
			},
			(error, result) => {
				if (error) {
					return reject(error);
				}
				if (!result) {
					return reject(new Error('Cloudinary upload result is undefined.'));
				}
				// Resolve with the exact public_id Cloudinary used.
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
		// The `destroy` method works with the base publicId.
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error(`Failed to delete file ${publicId} from Cloudinary:`, error);
	}
}

export function getPublicFileUrl(publicId: string): string {
	// Reverting to the official SDK method.
	// This will generate the full, correct, versioned URL, including the
	// appropriate file extension for delivery.
	return cloudinary.url(publicId, { secure: true });
}
