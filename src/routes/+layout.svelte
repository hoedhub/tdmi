<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	onMount(() => {
		const savedTheme = localStorage.getItem(`${$page.data.user?.id || 'default'}-theme`);
		if (savedTheme) {
			document.documentElement.setAttribute('data-theme', savedTheme);
		}
	});
</script>

<slot></slot>
