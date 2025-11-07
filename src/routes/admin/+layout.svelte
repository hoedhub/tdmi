<script lang="ts">
	import AdminLayout from '$lib/components/layout/AdminLayout.svelte';

	interface Props {
		children?: any; // Temporarily set to any for Svelte 5 migration
	}

	let { children }: Props = $props();
</script>

<AdminLayout>
	{@render children?.()}
</AdminLayout>