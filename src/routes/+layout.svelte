<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/components/toast';
	import AbsoluteDropdown from '$lib/components/AbsoluteDropdown.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { themeStore } from '$lib/stores/themeStore';
	import { tablePersistence } from '$lib/stores/tablePersistence.svelte';
	import { db, CACHE_VERSION, clearAllCache, syncMuridCompact } from '$lib/utils/db';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Check for cache version and sync data
	$effect(() => {
		if (browser) {
			const initializeCache = async () => {
				try {
					// 1. Check Version
					const meta = await db.metadata.get('wilayah_version');
					if (!meta || meta.value !== CACHE_VERSION) {
						console.log(`[Cache] Versi baru terdeteksi (${CACHE_VERSION}), membersihkan cache lama...`);
						await clearAllCache();
						await db.metadata.put({ id: 'wilayah_version', value: CACHE_VERSION });
					}

					// 2. Sync Murid Compact (Background)
					// Cek apakah data sudah ada
					const muridCount = await db.muridCompact.count();
					const lastSyncMeta = await db.metadata.get('murid_last_sync');
					
					// Jika data kosong atau sudah lebih dari 30 menit, lakukan sinkronisasi
					const shouldSync = muridCount === 0 || !lastSyncMeta || (Date.now() - lastSyncMeta.value) > (30 * 60 * 1000);
					
					if (shouldSync) {
						console.log('[Cache] Sinkronisasi data murid compact...');
						// Gunakan query param untuk bypass cache browser/CDN
						const response = await fetch(`/api/murid/compact?v=${CACHE_VERSION}`, { 
							cache: 'no-store' 
						});
						
						if (response.ok) {
							const { murids } = await response.json();
							await syncMuridCompact(murids);
							console.log(`[Cache] Berhasil sinkronisasi ${murids.length} murid.`);
						}
					}
				} catch (e) {
					console.error('[Cache] Gagal inisialisasi:', e);
				}
			};
			initializeCache();
		}
	});

	// This reactive statement will re-run whenever the user logs in or out.
	$effect(() => {
		if (browser && $page.data.user) {
			const user = $page.data.user;
			const userKey = `${user.id}-theme`;
			const savedTheme = localStorage.getItem(userKey);
			if (savedTheme) {
				try {
					const newTheme = JSON.parse(savedTheme);
					themeStore.set(newTheme);
				} catch (e) {
					// ignore corrupt data
				}
			}
		}
	});

	// Reset table persistence when moving away from a major functional area
	$effect(() => {
		tablePersistence.checkAreaChange($page.url.pathname);
	});
</script>

<AbsoluteDropdown />
<Tooltip />
{@render children?.()}

<ToastContainer position="bottom-center" />