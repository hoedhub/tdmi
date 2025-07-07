import { error } from '@sveltejs/kit';
import { fetchAllNasyathData } from '$lib/server/nasyath-data'; // Gunakan fungsi yang sama
import type { nasyathTable } from '$lib/drizzle/schema';
import type { InferSelectModel } from 'drizzle-orm';

// Definisikan tipe untuk baris data
type NasyathRow = InferSelectModel<typeof nasyathTable>;

/**
 * Mengubah satu field menjadi format CSV yang aman.
 * - Mengapit dengan tanda kutip jika mengandung koma.
 * - Menggandakan tanda kutip jika sudah ada di dalam field.
 * @param field - Nilai field
 * @returns - String yang aman untuk CSV
 */
function sanitizeCsvField(field: any): string {
    const value = String(field ?? ''); // Ubah null/undefined menjadi string kosong
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        const escapedValue = value.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }
    return value;
}

export async function GET({ url, locals }) {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    try {
        // 1. Ambil Data (menggunakan logika yang sama persis dengan PDF)
        const sortParam = url.searchParams.get('sort');
        const filtersParam = url.searchParams.get('filters');
        const sort = sortParam ? JSON.parse(sortParam) : { key: 'tanggalMulai', direction: 'desc' };
        const filters = filtersParam ? JSON.parse(filtersParam) : {};
        const data = await fetchAllNasyathData(locals.user.id, filters, sort);

        // 2. Buat Konten CSV
        const headers = ['Kegiatan', 'Tanggal Mulai', 'Tanggal Selesai', 'Durasi', 'Tempat', 'Keterangan'];
        const keys: (keyof NasyathRow)[] = ['kegiatan', 'tanggalMulai', 'tanggalSelesai', 'durasi', 'tempat', 'keterangan'];

        const csvRows = data.map((row: NasyathRow) => {
            return keys.map(key => {
                const value = row[key];

                // PERBAIKAN: Periksa null terlebih dahulu, lalu format tanggalnya
                if ((key === 'tanggalMulai' || key === 'tanggalSelesai') && value) {
                    // Kita bisa asumsikan ini adalah tanggal jika kolomnya benar dan nilainya ada
                    return new Date(value).toLocaleDateString('id-ID');
                }

                return sanitizeCsvField(value);
            }).join(',');
        });

        // Gabungkan header dan baris data
        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // 3. Buat dan Kirim Response
        // Tambahkan BOM (Byte Order Mark) agar Excel dapat membuka file UTF-8 dengan benar
        const bom = '\uFEFF';
        const responseBody = bom + csvContent;

        return new Response(responseBody, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="laporan-nasyath.csv"`
            }
        });

    } catch (e) {
        console.error('Gagal membuat CSV:', e);
        throw error(500, 'Gagal membuat laporan CSV.');
    }
}