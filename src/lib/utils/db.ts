import Dexie, { type Table } from 'dexie';

/**
 * Versi Cache Wilayah.
 * Ubah angka ini jika ada perubahan struktur data wilayah di server
 * untuk memaksa klien memperbarui cache mereka.
 */
export const CACHE_VERSION = 1;

export interface WilayahCache {
	key: string;
	data: any;
	updatedAt: number;
}

export interface Metadata {
	id: string;
	value: any;
}

export class TDMIDatabase extends Dexie {
	wilayahCache!: Table<WilayahCache>;
	metadata!: Table<Metadata>;

	constructor() {
		super('TDMIDatabase');
		this.version(1).stores({
			wilayahCache: 'key',
			metadata: 'id'
		});
	}
}

export const db = new TDMIDatabase();

/**
 * Mendapatkan data wilayah dari cache IndexedDB
 */
export async function getWilayahCache(key: string) {
	try {
		const item = await db.wilayahCache.get(key);
		return item?.data;
	} catch (error) {
		console.error('Error reading from IndexedDB:', error);
		return null;
	}
}

/**
 * Menyimpan data wilayah ke cache IndexedDB
 */
export async function setWilayahCache(key: string, data: any) {
	try {
		await db.wilayahCache.put({
			key,
			data,
			updatedAt: Date.now()
		});
	} catch (error) {
		console.error('Error writing to IndexedDB:', error);
	}
}

/**
 * Membersihkan semua cache wilayah
 */
export async function clearWilayahCache() {
	try {
		await db.wilayahCache.clear();
	} catch (error) {
		console.error('Error clearing IndexedDB:', error);
	}
}
