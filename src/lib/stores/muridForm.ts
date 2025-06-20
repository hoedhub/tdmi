import { writable } from 'svelte/store';
import type { propTable, kokabTable, kecamatanTable, deskelTable } from '$lib/drizzle/schema';
import type { InferSelectModel } from 'drizzle-orm';
import type { Interface } from 'node:readline';

type Propinsi = InferSelectModel<typeof propTable>;
type Kokab = InferSelectModel<typeof kokabTable>;
type Kecamatan = InferSelectModel<typeof kecamatanTable>;
type Deskel = InferSelectModel<typeof deskelTable>;
export type RelatedMuridData = {
	id: number;
	nama: string;
	nomorTelepon: string | null;
}
export interface FormData {
	nama: string;
	namaArab?: string;
	gender: boolean;
	deskelId?: number;
	alamat?: string;
	nomorTelepon?: string;
	muhrimId?: number;
	mursyidId?: number;
	baiatId?: number;
	wiridId?: number;
	muhrimData?: RelatedMuridData | undefined;
	mursyidData?: RelatedMuridData | undefined;
	baiatData?: RelatedMuridData | undefined;
	wiridData?: RelatedMuridData | undefined;
	qari: boolean;
	marhalah: number;
	tglLahir: string;
	aktif: boolean;
	partisipasi: boolean;
	nik?: string;
	foto?: string | File | null;
	previewFoto?: string;
}
export type MuridFormData = {
	formData: FormData;
	propinsiList: Propinsi[];
	kokabList: Kokab[];
	kecamatanList: Kecamatan[];
	deskelList: Deskel[];
	selectedPropinsi: Propinsi | null;
	selectedKokab: Kokab | null;
	selectedKecamatan: Kecamatan | null;
	isModified: boolean;
};

const initialState: MuridFormData = {
	formData: {
		nama: '',
		gender: true,
		qari: true,
		marhalah: 1,
		tglLahir: '',
		aktif: true,
		partisipasi: true,
		alamat: ''
	},
	propinsiList: [],
	kokabList: [],
	kecamatanList: [],
	deskelList: [],
	selectedPropinsi: null,
	selectedKokab: null,
	selectedKecamatan: null,
	isModified: false
};

function createMuridFormStore() {
	const { subscribe, set, update } = writable<MuridFormData>(initialState);

	return {
		subscribe,
		set,
		update,
		updateLists: (
			lists: Partial<
				Pick<MuridFormData, 'propinsiList' | 'kokabList' | 'kecamatanList' | 'deskelList'>
			>
		) => {
			update((store) => ({ ...store, ...lists }));
		},
		updateSelections: (
			selections: Partial<
				Pick<MuridFormData, 'selectedPropinsi' | 'selectedKokab' | 'selectedKecamatan'>
			>
		) => {
			update((store) => ({ ...store, ...selections }));
		},
		updateFormData: (formData: Partial<MuridFormData['formData']>) => {
			update((store) => ({
				...store,
				formData: { ...store.formData, ...formData },
				isModified: true
			}));
		},
		reset: () => set(initialState)
	};
}

export const muridFormStore = createMuridFormStore();
