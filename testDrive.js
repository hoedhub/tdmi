import { google } from 'googleapis';
import { config } from 'dotenv';
import stream from 'stream';

// Load environment variables from .env file
config({ path: '.env' });

const GOOGLE_DRIVE_CREDENTIALS = process.env.GOOGLE_DRIVE_CREDENTIALS;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

function getDriveClient() {
	if (!GOOGLE_DRIVE_CREDENTIALS || !GOOGLE_DRIVE_FOLDER_ID) {
		throw new Error('Pastikan GOOGLE_DRIVE_CREDENTIALS dan GOOGLE_DRIVE_FOLDER_ID ada di .env');
	}
	const credsString = GOOGLE_DRIVE_CREDENTIALS.trim();
	let credentials;
	try {
		credentials = JSON.parse(credsString);
	} catch (e) {
		try {
			const decoded = Buffer.from(credsString, 'base64').toString('utf-8');
			credentials = JSON.parse(decoded);
		} catch (err) {
			throw new Error('Gagal mem-parse kredensial. Bukan JSON atau Base64 yang valid.');
		}
	}
	const auth = new google.auth.GoogleAuth({
		credentials,
		scopes: ['https://www.googleapis.com/auth/drive']
	});
	return google.drive({ version: 'v3', auth });
}

async function testUpload() {
	console.log('Mencoba mengunggah file tes...');
	try {
		const drive = getDriveClient();
		const fileContent = 'Ini adalah file tes.';
		const bufferStream = new stream.PassThrough();
		bufferStream.end(Buffer.from(fileContent));

		const response = await drive.files.create({
			requestBody: {
				name: 'test-upload.txt',
				parents: [GOOGLE_DRIVE_FOLDER_ID],
				mimeType: 'text/plain'
			},
			media: {
				mimeType: 'text/plain',
				body: bufferStream
			},
			fields: 'id, name, webViewLink',
			supportsAllDrives: true // Required for Shared Drives
		});

		console.log('\n\x1b[32m%s\x1b[0m', '>>> SUKSES! <<<'); // Pesan sukses dalam warna hijau
		console.log('File berhasil dibuat:');
		console.log(`  - Nama: ${response.data.name}`);
		console.log(`  - ID: ${response.data.id}`);
		console.log(`  - Link: ${response.data.webViewLink}`);
	} catch (error) {
		console.error('\n\x1b[31m%s\x1b[0m', '>>> GAGAL! <<<'); // Pesan gagal dalam warna merah
		console.error('Terjadi error saat mencoba mengunggah:');
		// Cetak error yang lebih detail dari 'cause' jika ada
		if (error.cause && error.cause.errors) {
			console.error(JSON.stringify(error.cause.errors, null, 2));
		} else {
			console.error(error);
		}
	}
}

testUpload();
