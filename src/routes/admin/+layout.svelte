<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { retryCount } from '$lib/stores';
	import AdminLayout from '$lib/components/layout/AdminLayout.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	afterNavigate(({ from, to }) => {
		if (to?.route.id !== from?.route.id) {
			retryCount.set(0);
		}
	});
</script>

<AdminLayout>
	{@render children?.()}
</AdminLayout>