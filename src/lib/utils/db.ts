import Dexie, { type Table } from 'dexie';
import { browser } from '$app/environment';

/**
 * Versi Cache. 
 * Ubah angka ini jika ada perubahan struktur data di server
 * untuk memaksa klien memperbarui cache mereka.
 */
export const CACHE_VERSION = 3; 

// State global untuk memantau proses sinkronisasi
export let isSyncingMurid = false;

export interface WilayahCache {
	key: string;
	data: any;
	updatedAt: number;
}

export interface MuridCompact {
	id: number;
	nama: string;
	alamat?: string | null;
}

export interface Metadata {
	id: string;
	value: any;
}

export class TDMIDatabase extends Dexie {
	wilayahCache!: Table<WilayahCache>;
	muridCompact!: Table<MuridCompact>;
	metadata!: Table<Metadata>;

	constructor() {
		super('TDMIDatabase');
		this.version(1).stores({
			wilayahCache: 'key',
			metadata: 'id'
		});
		
		this.version(2).stores({
			wilayahCache: 'key',
			muridCompact: 'id, nama',
			metadata: 'id'
		});

		this.version(3).stores({
			wilayahCache: 'key',
			muridCompact: 'id, nama, alamat',
			metadata: 'id'
		});
	}
}

// Inisialisasi hanya jika di browser untuk mencegah error SSR
export const db = browser ? new TDMIDatabase() : (undefined as unknown as TDMIDatabase);

/**
 * Mendapatkan data wilayah dari cache IndexedDB
 */
export async function getWilayahCache(key: string) {
	if (!browser || !db) return null;
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
	if (!browser || !db) return;
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
 * Mendapatkan semua data murid compact (ID & Nama)
 */
export async function getAllMuridCompact() {
	if (!browser || !db) return [];
	try {
		return await db.muridCompact.toArray();
	} catch (error) {
		console.error('Error reading murids from IndexedDB:', error);
		return [];
	}
}

/**
 * Mencari murid berdasarkan nama di cache lokal (Case Insensitive & Contains)
 */
export async function searchMuridCompact(query: string) {
	if (!browser || !db) return [];
	try {
		if (!query || query.length < 2) {
			return await db.muridCompact.limit(10).toArray();
		}
		
		const lowerQuery = query.toLowerCase();
		return await db.muridCompact
			.filter(m => m.nama.toLowerCase().includes(lowerQuery))
			.limit(15)
			.toArray();
	} catch (error) {
		console.error('Error searching murids in IndexedDB:', error);
		return [];
	}
}

/**
 * Bulk update data murid compact menggunakan transaksi untuk stabilitas
 */
export async function syncMuridCompact(data: MuridCompact[]) {
	if (!browser || !db) return;
	isSyncingMurid = true;
	try {
		if (!db.isOpen()) await db.open();
		
		await db.transaction('rw', db.muridCompact, db.metadata, async () => {
			await db.muridCompact.clear();
			if (data.length > 0) {
				await db.muridCompact.bulkAdd(data);
			}
			await db.metadata.put({ id: 'murid_last_sync', value: Date.now() });
		});
	} catch (error) {
		console.error('Error syncing murids to IndexedDB:', error);
		throw error;
	} finally {
		isSyncingMurid = false;
	}
}

/**
 * Memicu sinkronisasi manual dari API ke IndexedDB menggunakan transaksi
 */
export async function manualSyncMurid() {
	if (!browser || !db) return { success: false, message: 'Browser only' };
	
	isSyncingMurid = true;
	try {
		if (!db.isOpen()) await db.open();

		const response = await fetch(`/api/murid/compact?v=${CACHE_VERSION}`);
		if (!response.ok) throw new Error('Gagal mengambil data dari server');
		
		const data = await response.json();
		const murids = data.murids || [];
		
		await db.transaction('rw', db.muridCompact, db.metadata, async () => {
			await db.muridCompact.clear();
			if (murids.length > 0) {
				await db.muridCompact.bulkAdd(murids);
			}
			await db.metadata.put({ id: 'murid_last_sync', value: Date.now() });
		});
		
		return { success: true, count: murids.length };
	} catch (error: any) {
		console.error('Manual sync failed:', error);
		return { success: false, message: error.message };
	} finally {
		isSyncingMurid = false;
	}
}

/**
 * Membersihkan semua cache
 */
export async function clearAllCache() {
	if (!browser || !db) return;
	try {
		if (!db.isOpen()) await db.open();
		await db.wilayahCache.clear();
		await db.muridCompact.clear();
		await db.metadata.clear();
	} catch (error) {
		console.error('Error clearing IndexedDB:', error);
	}
}

export async function clearWilayahCache() {
	if (!browser || !db) return;
	try {
		if (!db.isOpen()) await db.open();
		await db.wilayahCache.clear();
	} catch (error) {
		console.error('Error clearing IndexedDB:', error);
	}
}
