import { writable, get } from 'svelte/store';
import type { SortConfig, FilterState } from '$lib/components/SuperTable';

// --- Type Definitions ---
interface Murid {
	id: number;
	nama: string;
	namaArab: string | null;
	gender: boolean;
	deskelName: string | null;
	kecamatanName: string | null;
	kokabName: string | null;
	propinsiName: string | null;
	aktif: boolean;
}

interface MuridModalState {
	muridData: Murid[];
	totalItems: number;
	loading: boolean;
	hasDbError: boolean;
	dataLoaded: boolean;
}

function createMuridModalStore() {
	const { subscribe, set, update } = writable<MuridModalState>({
		muridData: [],
		totalItems: 0,
		loading: false,
		hasDbError: false,
		dataLoaded: false
	});

	async function fetchTableData(
		sort?: SortConfig[] | null,
		filters?: FilterState,
		page: number = 1,
		pageSize: number = 5,
		excludeId?: number
	) {
		const store = get({ subscribe });

		// Only fetch if data hasn't been loaded yet, or if filters/sorting/pagination changes
		// For simplicity in this context, we'll refetch on any parameter change.
		// The main goal is to avoid refetching when just opening/closing the modal.
		if (store.loading) return;

		update((state) => ({ ...state, loading: true, hasDbError: false }));

		try {
			const response = await fetch('/member/pendataan/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters, page, pageSize, excludeId })
			});

			if (!response.ok) throw new Error('Failed to fetch murid data');

			const result = await response.json();
			update((state) => ({
				...state,
				muridData: result.murid,
				totalItems: result.totalItems,
				dataLoaded: true
			}));
		} catch (error) {
			console.error('Error fetching table data:', error);
			update((state) => ({ ...state, hasDbError: true }));
		} finally {
			update((state) => ({ ...state, loading: false }));
		}
	}

	// This function will be called from the component to decide whether to fetch
	async function loadDataIfNeeded(
		sort?: SortConfig[] | null,
		filters?: FilterState,
		page: number = 1,
		pageSize: number = 5,
		excludeId?: number
	) {
		const store = get({ subscribe });
		// Fetch only if data has never been loaded.
		if (!store.dataLoaded) {
			await fetchTableData(sort, filters, page, pageSize, excludeId);
		}
	}

	// Function to update data for pagination, sorting, filtering
	async function updateData(
		sort?: SortConfig[] | null,
		filters?: FilterState,
		page: number = 1,
		pageSize: number = 5,
		excludeId?: number
	) {
		await fetchTableData(sort, filters, page, pageSize, excludeId);
	}

	return {
		subscribe,
		loadDataIfNeeded,
		updateData
	};
}

export const muridModalStore = createMuridModalStore();
