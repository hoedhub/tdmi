<script lang="ts">
	import SidebarLayout from '$lib/components/SidebarLayout.svelte';
	import { page } from '$app/stores';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<SidebarLayout>
	{#key $page.url.pathname}
		{@render children?.()}
	{/key}
</SidebarLayout>
