<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/components/toast';
	import AbsoluteDropdown from '$lib/components/AbsoluteDropdown.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { themeStore } from '$lib/stores/themeStore';
	import { tablePersistence } from '$lib/stores/tablePersistence.svelte';
	import { db, CACHE_VERSION, clearWilayahCache } from '$lib/utils/db';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Check for wilayah cache version and clear if necessary
	$effect(() => {
		if (browser) {
			const checkCacheVersion = async () => {
				try {
					const meta = await db.metadata.get('wilayah_version');
					if (!meta || meta.value !== CACHE_VERSION) {
						console.log('Cache wilayah kadaluarsa, membersihkan...');
						await clearWilayahCache();
						await db.metadata.put({ id: 'wilayah_version', value: CACHE_VERSION });
					}
				} catch (e) {
					console.error('Gagal memeriksa versi cache wilayah:', e);
				}
			};
			checkCacheVersion();
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