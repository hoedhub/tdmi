import { db } from '$lib/drizzle';
import { pertanyaanAhbabTable } from '$lib/drizzle/schema';
import { fail } from '@sveltejs/kit';
import { sendTicketConfirmationEmail } from '$lib/server/email';
import type { Actions } from './$types';
import { TURNSTILE_SECRET_KEY } from '$env/static/private';

async function validateTurnstileToken(token: string) {
	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}`
	});

	const data = await response.json();
	return data.success;
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const turnstileToken = formData.get('cf-turnstile-response') as string;

		// Turnstile verification
		if (!turnstileToken) {
			return fail(400, { msg: 'Silakan selesaikan tantangan keamanan (CAPTCHA).' });
		}

		const isHuman = await validateTurnstileToken(turnstileToken);
		if (!isHuman) {
			console.warn('Turnstile verification failed');
			return fail(400, { msg: 'Verifikasi keamanan gagal. Silakan coba lagi.' });
		}

		const nama = formData.get('nama') as string;
		const alamat = formData.get('alamat') as string;
		const email = formData.get('email') as string;
		const namaMursyid = formData.get('namaMursyid') as string;
		const pertanyaan = formData.get('pertanyaan') as string;
		const honeypot = formData.get('website') as string;

		// Honeypot check
		if (honeypot) {
			console.warn('Spam submission detected via honeypot');
			return fail(400, { msg: 'Spam detected.' });
		}

		// Validation
		if (!nama || !alamat || !email || !namaMursyid || !pertanyaan) {
			return fail(400, { msg: 'Semua field harus diisi.' });
		}

		try {
			const now = new Date();
			let pMonth = now.getMonth() + 1;
			let pYear = now.getFullYear();

			// Jika melebihi tanggal 28, masuk ke periode bulan selanjutnya
			if (now.getDate() > 28) {
				pMonth++;
				if (pMonth > 12) {
					pMonth = 1;
					pYear++;
				}
			}

			const result = await db
				.insert(pertanyaanAhbabTable)
				.values({ 
					nama, 
					alamat, 
					email, 
					namaMursyid, 
					pertanyaan,
					periodeMonth: pMonth,
					periodeYear: pYear 
				})
				.returning({ id: pertanyaanAhbabTable.id, createdAt: pertanyaanAhbabTable.createdAt });

			const inserted = result[0];
			const ticketId = inserted.id;

			// Kirim email konfirmasi tiket (non-blocking: gagal tidak hentikan proses)
			sendTicketConfirmationEmail({
				to: email,
				nama,
				ticketId,
				pertanyaan,
				createdAt: inserted.createdAt ?? new Date().toISOString()
			}).catch((err) => console.error('Email sending failed silently:', err));

			return { success: true, ticketId };
		} catch (error) {
			console.error('Error saving pertanyaan:', error);
			return fail(500, { msg: 'Gagal menyimpan pertanyaan. Silakan coba lagi nanti.' });
		}
	}
};
