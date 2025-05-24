<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ToastContainer } from '$lib/components/toast'; // Import ToastContainer
	let mounted = false;
	let loaded = false;
	$: if (mounted && !loaded) {
		console.log('User:', $page.data.user?.id);
		const savedTheme = localStorage.getItem(`${$page.data.user?.id || 'default'}-theme`);
		if (savedTheme) {
			document.documentElement.setAttribute('data-theme', savedTheme);
		}
		loaded = true;
	}
	onMount(() => (mounted = true));
</script>

<slot></slot>

<ToastContainer position="bottom-center" />
