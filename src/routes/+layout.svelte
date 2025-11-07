<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/components/toast';
	import AbsoluteDropdown from '$lib/components/AbsoluteDropdown.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { themeStore } from '$lib/stores/themeStore';

	interface Props {
		children?: any; // Temporarily set to any for Svelte 5 migration
	}

	let { children }: Props = $props();

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
</script>

<AbsoluteDropdown />
<Tooltip />
{@render children?.()}

<ToastContainer position="bottom-center" />