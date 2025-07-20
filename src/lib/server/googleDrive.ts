
import { google } from 'googleapis';
import { GOOGLE_DRIVE_CREDENTIALS, GOOGLE_DRIVE_FOLDER_ID } from '$env/static/private';
import stream from 'stream';

if (!GOOGLE_DRIVE_CREDENTIALS) {
	throw new Error('The GOOGLE_DRIVE_CREDENTIALS environment variable is not set.');
}
if (!GOOGLE_DRIVE_FOLDER_ID) {
	throw new Error('The GOOGLE_DRIVE_FOLDER_ID environment variable is not set.');
}

const rawCreds = GOOGLE_DRIVE_CREDENTIALS;
let credentials;
try {
	const parsed = JSON.parse(rawCreds);
	// If the parsed value is a string, it means it was double-stringified.
	// We need to parse it again.
	credentials = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
} catch (e) {
	throw new Error(
		'Failed to parse GOOGLE_DRIVE_CREDENTIALS. Ensure it is a valid, single-quoted JSON string in your .env file.',
		{ cause: e }
	);
}

const auth = new google.auth.GoogleAuth({
	credentials,
	scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({
	version: 'v3',
	auth
});

/**
 * Uploads a file to Google Drive.
 * @param fileBuffer The buffer of the file to upload.
 * @param mimetype The mimetype of the file.
 * @param originalFilename The original name of the file.
 * @returns The ID of the uploaded file.
 */
export async function uploadFile(fileBuffer: Buffer, mimetype: string, originalFilename: string): Promise<string> {
	const bufferStream = new stream.PassThrough();
	bufferStream.end(fileBuffer);

	try {
		const response = await drive.files.create({
			requestBody: {
				name: `${new Date().toISOString()}-${originalFilename}`,
				parents: [GOOGLE_DRIVE_FOLDER_ID],
				mimeType: mimetype
			},
			media: {
				mimeType: mimetype,
				body: bufferStream
			},
			fields: 'id'
		});

		const fileId = response.data.id;
		if (!fileId) {
			throw new Error('File ID not found in Google Drive API response.');
		}

        // Make the file publicly readable
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

		return fileId;
	} catch (error) {
		console.error('Error uploading to Google Drive:', error);
		throw new Error('Failed to upload file to Google Drive.');
	}
}

/**
 * Deletes a file from Google Drive.
 * @param fileId The ID of the file to delete.
 */
export async function deleteFile(fileId: string): Promise<void> {
	try {
		await drive.files.delete({
			fileId: fileId
		});
	} catch (error) {
        // It's possible the file doesn't exist, so we can log and ignore
		console.error(`Failed to delete file ${fileId} from Google Drive:`, error);
	}
}

/**
 * Gets a direct web content link for a file in Google Drive.
 * Note: The file must be public for this link to work.
 * @param fileId The ID of the file.
 * @returns The web content link.
 */
export function getPublicFileUrl(fileId: string): string {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
}

