<script lang="ts">
	import AdminHeader from '$lib/components/layout/AdminHeader.svelte';
	import SidebarNav from '$lib/components/navigation/SidebarNav.svelte';
</script>

<div class="drawer lg:drawer-open">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Page content here -->
		<AdminHeader />
		<main class="flex-grow p-4">
			<slot />
		</main>
	</div>
	<div class="drawer-side">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
		<SidebarNav />
	</div>
</div>
