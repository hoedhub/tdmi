import { toHindi } from '$lib/utils/toHindi';
import type { ColumnDef } from '$lib/components/SuperTable/types';

export interface NasyathRow {
	id: number;
	kegiatan: string;
	tanggalMulai: string | Date;
	tanggalSelesai: string | Date | null;
	durasi: string | null;
	tempat: string | null;
	murid?: { nama: string | null };
}

export function buildColumns(canReadAll: boolean): ColumnDef<NasyathRow>[] {
	const baseColumns: ColumnDef<NasyathRow>[] = [
		{ key: 'kegiatan', label: 'النشاط', sortable: true, filterable: 'text' },
		{
			key: 'tanggalMulai',
			label: 'تاريخ البدء',
			sortable: true,
			formatter: (value: any) =>
				value ? toHindi(new Date(value).toLocaleDateString('ar-EG-u-nu-arab')) : '-'
		},
		{
			key: 'tanggalSelesai',
			label: 'تاريخ الانتهاء',
			sortable: true,
			formatter: (value: any) =>
				value ? toHindi(new Date(value).toLocaleDateString('ar-EG-u-nu-arab')) : '-'
		},
		{
			key: 'durasi',
			label: 'المدة',
			sortable: true,
			filterable: 'text',
			formatter: (value: any) => toHindi(value)
		},
		{ key: 'tempat', label: 'المكان', sortable: true, filterable: 'text' }
	];

	if (canReadAll) {
		return [
			{
				key: 'murid.nama',
				label: 'الاسم',
				sortable: true,
				filterable: 'text',
				formatter: (_: any, row: NasyathRow) => row.murid?.nama || 'N/A'
			} as ColumnDef<NasyathRow>,
			...baseColumns
		];
	}

	return baseColumns;
}
