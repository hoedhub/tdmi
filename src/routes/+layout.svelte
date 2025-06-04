<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ToastContainer } from '$lib/components/toast'; // Import ToastContainer
	// Theme loading logic moved to app.html via +layout.server.ts handle function
	// onMount(() => (mounted = true)); // No longer needed if theme is set in app.html
</script>

<slot></slot>

<ToastContainer position="bottom-center" />
