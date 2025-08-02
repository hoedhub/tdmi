import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from 'fontkit';
import { processArabic } from '$lib/utils/arabic-shaper.js';
import { readFileSync } from 'fs';
import path from 'path';
import { error } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { nasyathTable, usersTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { and, like, sql, asc, desc, eq } from 'drizzle-orm';
import { fetchAllNasyathData } from '$lib/server/nasyath-data';

// Definisikan tipe untuk baris data Nasyath
type NasyathRow = typeof nasyathTable.$inferSelect;

export async function GET({ url, locals }) {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// --- 1. Fetch Data ---
		const sortParam = url.searchParams.get('sort');
		const filtersParam = url.searchParams.get('filters');
		let sort = sortParam ? JSON.parse(sortParam) : { key: 'tanggalMulai', direction: 'desc' };
		let filters = filtersParam ? JSON.parse(filtersParam) : {};
		const data = await fetchAllNasyathData(locals.user.id, filters, sort);

		// --- 2. Create PDF ---
		const pdfDoc = await PDFDocument.create();

		// PERBAIKAN untuk Error 3: Gunakan type assertion 'as any'
		pdfDoc.registerFontkit(fontkit as any);

		let page = pdfDoc.addPage([841.89, 595.28]);
		const { width, height } = page.getSize();

		// --- 3. Load and Embed Font ---
		const fontBytes = readFileSync(path.resolve('./src/lib/fonts/NotoSansArabic-Regular.ttf'));
		const customFont = await pdfDoc.embedFont(fontBytes);

		// --- 4. Draw Content ---
		const processArabicText = (text: string) => {
			if (!/[\u0600-\u06FF]/.test(text)) return text;
			return processArabic(text);
		};

		const title = processArabicText('تقرير الأنشطة الدعوية');
		const titleFontSize = 24;
		const titleWidth = customFont.widthOfTextAtSize(title, titleFontSize);
		page.drawText(title, {
			x: (width - titleWidth) / 2,
			y: height - 60,
			size: titleFontSize,
			font: customFont,
			color: rgb(0, 0, 0)
		});

		const tableTopY = height - 100;
		const rowHeight = 20;
		const tableLeftX = 40;
		const tableRightX = width - 40;

		const headers = ['المكان', 'المدة', 'تاريخ الانتهاء', 'تاريخ البدء', 'النشاط'].map(
			processArabicText
		);
		const colKeys = ['tempat', 'durasi', 'tanggalSelesai', 'tanggalMulai', 'kegiatan'] as const;
		const colWidths = [150, 80, 100, 100, width - 2 * tableLeftX - 430];

		let currentX = tableRightX;
		headers.forEach((header, i) => {
			const colWidth = colWidths[i];
			const textWidth = customFont.widthOfTextAtSize(header, 12);
			page.drawText(header, {
				x: currentX - textWidth - 10,
				y: tableTopY - 15,
				font: customFont,
				size: 12,
				color: rgb(0, 0, 0)
			});
			currentX -= colWidth;
		});

		page.drawLine({
			start: { x: tableLeftX, y: tableTopY - rowHeight },
			end: { x: tableRightX, y: tableTopY - rowHeight },
			thickness: 1,
			color: rgb(0.7, 0.7, 0.7)
		});

		let currentY = tableTopY - rowHeight;

		// PERBAIKAN untuk Error 4: Beri tipe pada 'row'
		data.forEach((row: NasyathRow) => {
			currentY -= rowHeight;
			if (currentY < 50) {
				page = pdfDoc.addPage([841.89, 595.28]);
				currentY = page.getSize().height - 70;
			}

			const rowData = colKeys.map((key) => {
				const value = row[key];

				// PERBAIKAN: Periksa null terlebih dahulu, lalu format tanggalnya
				if ((key === 'tanggalMulai' || key === 'tanggalSelesai') && value) {
					return new Date(value).toLocaleDateString('id-ID');
				}

				const stringValue = String(value || '-');
				return /[\u0600-\u06FF]/.test(stringValue) ? processArabicText(stringValue) : stringValue;
			});

			let cellX = tableRightX;
			rowData.forEach((cell, i) => {
				const colWidth = colWidths[i];
				const cellText = String(cell);
				const textWidth = customFont.widthOfTextAtSize(cellText, 10);
				page.drawText(cellText, {
					x: cellX - textWidth - 10,
					y: currentY - 15,
					font: customFont,
					size: 10,
					color: rgb(0.1, 0.1, 0.1)
				});
				cellX -= colWidth;
			});
		});

		// --- 5. Save and Return PDF ---
		const pdfBytes = await pdfDoc.save();
		return new Response(pdfBytes, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="laporan-nasyath.pdf"`
			}
		});
	} catch (e) {
		console.error('Failed to generate PDF:', e);
		throw error(500, 'Gagal membuat laporan PDF.');
	}
}
