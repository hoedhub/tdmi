import type { ColumnDef } from '$lib/components/SuperTable';
import { calculateAge, renderReferencedMurid, formatMuridGender, formatMuridBoolean } from '$lib/utils/formatMurid';
import { formatDateShort } from '$lib/utils/date';

export interface Murid {
	id: number;
	updatedAt: string;
	updaterId: string;
	nama: string;
	namaArab: string | null;
	gender: boolean;
	deskelId: number | null;
	alamat: string | null;
	nomorTelepon: string | null;
	muhrimId: number | null;
	mursyidId: number | null;
	baiatId: number | null;
	wiridId: number | null;
	qari: boolean;
	marhalah: 1 | 2 | 3;
	tglLahir: string | null;
	aktif: boolean;
	partisipasi: boolean;
	nik: string | null;
	deskelName: string | null;
	kecamatanName: string | null;
	kokabName: string | null;
	propinsiName: string | null;
	mursyidName: string | null;
	baiatName: string | null;
	wiridName: string | null;
	mursyidMarhalah: number | null;
	baiatMarhalah: number | null;
	wiridMarhalah: number | null;
	mursyidQari: boolean | null;
	baiatQari: boolean | null;
	wiridQari: boolean | null;
}

export const MURID_COLUMNS: ColumnDef<Murid>[] = [
	{ key: 'nama', label: 'Nama', sortable: true, filterable: 'text' },
	{ key: 'namaArab', label: 'Nama Arab', sortable: true, filterable: 'text', hidden: true },
	{
		key: 'gender',
		label: 'Gender',
		sortable: true,
		filterable: 'select',
		filterOptions: ['Pria', 'Wanita'],
		formatter: (value: boolean) => formatMuridGender(value)
	},
	{
		key: 'tglLahir',
		label: 'Umur',
		sortable: true,
		formatter: (value) => {
			const age = calculateAge(value);
			return age !== null ? `${age} tahun` : '-';
		}
	},
	{
		key: 'marhalah',
		label: 'Marhalah',
		sortable: true,
		filterable: 'select',
		filterOptions: ['1', '2', '3'],
		formatter: (value: 1 | 2 | 3) => value.toString()
	},
	{
		key: 'mursyidName',
		label: 'Mursyid',
		sortable: true,
		filterable: 'text',
		formatter: (v, row) => renderReferencedMurid(v, row.mursyidMarhalah, row.mursyidQari)
	},
	{
		key: 'baiatName',
		label: 'Baiat',
		sortable: true,
		filterable: 'text',
		formatter: (v, row) => renderReferencedMurid(v, row.baiatMarhalah, row.baiatQari),
		hidden: true
	},
	{
		key: 'wiridName',
		label: 'Wirid',
		sortable: true,
		filterable: 'text',
		formatter: (v, row) => renderReferencedMurid(v, row.wiridMarhalah, row.wiridQari),
		hidden: true
	},
	{ key: 'nomorTelepon', label: 'Telepon', sortable: true, filterable: 'text' },
	{
		key: 'alamat',
		label: 'Alamat',
		sortable: true,
		filterable: 'text',
		formatter: (value, row) => {
			return [value, row.deskelName, row.kecamatanName, row.kokabName, row.propinsiName]
				.filter(Boolean)
				.join(', ');
		}
	},
	{
		key: 'aktif',
		label: 'Aktif',
		sortable: true,
		filterable: 'select',
		filterOptions: ['Aktif', 'Tidak Aktif'],
		formatter: (value: boolean) => (value ? 'Aktif' : 'Tidak Aktif'),
		cellClass: (value: boolean) => (value ? 'text-success' : 'text-error')
	},
	{
		key: 'partisipasi',
		label: 'Partisipasi',
		sortable: true,
		filterable: 'select',
		filterOptions: ['Ya', 'Tidak'],
		formatter: (value: boolean) => formatMuridBoolean(value),
		cellClass: (value: boolean) => (value ? 'text-success' : 'text-error')
	},
	{
		key: 'qari',
		label: 'Qari',
		sortable: true,
		filterable: 'select',
		filterOptions: ['Ya', 'Tidak'],
		formatter: (value: boolean) => formatMuridBoolean(value),
		cellClass: (value: boolean) => (value ? 'text-success' : 'text-error')
	},
	{
		key: 'updatedAt',
		label: 'Terakhir Diperbarui',
		sortable: true,
		formatter: (value: string) => formatDateShort(value),
		hidden: true
	}
];
