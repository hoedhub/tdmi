<script lang="ts">
	import AdminHeader from '$lib/components/layout/AdminHeader.svelte';
	import SidebarNav from '$lib/components/navigation/SidebarNav.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let drawerToggle: HTMLInputElement | undefined = $state();

	function closeDrawer() {
		if (drawerToggle) {
			drawerToggle.checked = false;
		}
	}
</script>

<div class="drawer lg:drawer-open">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" bind:this={drawerToggle} />
	<div class="drawer-content flex flex-col">
		<!-- Page content here -->
		<AdminHeader />
		<main class="flex-grow p-4">
			{@render children?.()}
		</main>
	</div>
	<div class="drawer-side">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
		<SidebarNav onnavigate={closeDrawer} />
	</div>
</div>
