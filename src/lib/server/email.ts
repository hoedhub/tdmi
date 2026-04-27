import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

let resend: Resend | null = null;

function getResend(): Resend {
	if (!resend) {
		resend = new Resend(RESEND_API_KEY);
	}
	return resend;
}

export interface TicketEmailData {
	to: string;
	nama: string;
	ticketId: number;
	pertanyaan: string;
	createdAt: string;
}

/**
 * Mengirim email konfirmasi tiket kepada penanya.
 */
export async function sendTicketConfirmationEmail(data: TicketEmailData): Promise<boolean> {
	try {
		const ticketCode = `#${String(data.ticketId).padStart(5, '0')}`;
		const pertanyaanRingkas =
			data.pertanyaan.length > 80
				? data.pertanyaan.substring(0, 80) + '...'
				: data.pertanyaan;

		const { error } = await getResend().emails.send({
			from: 'TDMI <noreply@tdmi.id>',
			to: data.to,
			subject: `[TDMI] Konfirmasi Pertanyaan ${ticketCode}`,
			html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pertanyaan</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">TDMI</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Thariqah Qadiriyah Naqsyabandiyah</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
              <p style="margin:0 0 24px;color:#111827;font-size:16px;">Yth. <strong>${data.nama}</strong>,</p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Pertanyaan Anda kepada Maulana Syeikh telah kami terima. Berikut adalah nomor tiket Anda:
              </p>

              <!-- Ticket Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:10px;padding:24px;text-align:center;">
                    <p style="margin:0 0 6px;color:#3b82f6;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Nomor Tiket Anda</p>
                    <p style="margin:0;color:#1d4ed8;font-size:32px;font-weight:800;font-family:monospace;letter-spacing:4px;">${ticketCode}</p>
                    <p style="margin:8px 0 0;color:#6b7280;font-size:12px;">Simpan nomor ini untuk melacak pertanyaan Anda</p>
                  </td>
                </tr>
              </table>

              <!-- Question Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f9fafb;border-radius:8px;border-left:4px solid #6366f1;padding:16px 20px;">
                    <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Pertanyaan Anda</p>
                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;font-style:italic;">"${pertanyaanRingkas}"</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">
                📅 Pertanyaan dikelola oleh Lajnah Ilqo' Ad Durus setiap bulan, paling lambat tanggal <strong>28</strong>.
              </p>
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                Tanggal Diterima: <strong>${new Date(data.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Email ini dikirim secara otomatis oleh sistem TDMI. Mohon tidak membalas email ini.
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} TDMI. Konten bersifat internal.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
		});

		if (error) {
			console.error('Resend error:', error);
			return false;
		}

		return true;
	} catch (err) {
		console.error('Failed to send ticket email:', err);
		return false;
	}
}
