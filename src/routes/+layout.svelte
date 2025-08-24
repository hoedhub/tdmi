<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/components/toast';
	import AbsoluteDropdown from '$lib/components/AbsoluteDropdown.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { themeStore } from '$lib/stores/themeStore';

	// This reactive statement will re-run whenever the user logs in or out.
	$: if (browser && $page.data.user) {
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
</script>

<AbsoluteDropdown />
<Tooltip />
<slot></slot>

<ToastContainer position="bottom-center" />