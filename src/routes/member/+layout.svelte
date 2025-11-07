<script lang="ts">
	import SidebarLayout from '$lib/components/SidebarLayout.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	// For non-SvelteKit, adjust path: import SidebarLayout from './components/SidebarLayout.svelte';
</script>

<SidebarLayout>
	<!-- @migration-task: migrate this slot by hand, `main-content` is an invalid identifier -->
	<!-- @migration-task: migrate this slot by hand, `main-content` is an invalid identifier -->
	<div slot="main-content">
		{@render children?.()}
	</div>
</SidebarLayout>
