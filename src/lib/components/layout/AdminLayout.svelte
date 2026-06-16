<script lang="ts">
	import AdminHeader from '$lib/components/layout/AdminHeader.svelte';
	import SidebarNav from '$lib/components/navigation/SidebarNav.svelte';
	import Breadcrumb from '$lib/components/navigation/Breadcrumb.svelte';
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
		<!-- Skip to content link -->
		<a href="#admin-main-content" class="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:p-2 focus:bg-primary focus:text-primary-content">
			Lompat ke konten utama
		</a>
		<!-- Page content here -->
		<AdminHeader />
		<div class="px-4 pt-3">
			<Breadcrumb />
		</div>
		<main id="admin-main-content" class="flex-grow p-4">
			{@render children?.()}
		</main>
	</div>
	<div class="drawer-side">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
		<SidebarNav onnavigate={closeDrawer} />
	</div>
</div>
