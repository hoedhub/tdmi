<script lang="ts">
	import '../../app.css';
	import SidebarLayout from '$lib/components/SidebarLayout.svelte';
	// For non-SvelteKit, adjust path: import SidebarLayout from './components/SidebarLayout.svelte';
</script>

<SidebarLayout>
	<div slot="main-content">
		<slot></slot>
	</div>
</SidebarLayout>
