<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleNavigation() {
		dispatch('navigate');
	}
</script>

<ul class="menu min-h-full w-80 bg-base-200 p-4 text-base-content">
	<!-- Sidebar content here -->
	<li>
		<a
			href="/admin"
			class={$page.url.pathname === '/admin' ? 'active' : ''}
			on:click={handleNavigation}>Dashboard Overview</a
		>
	</li>
	<li>
		<a
			href="/admin/users"
			class={$page.url.pathname.startsWith('/admin/users') ? 'active' : ''}
			on:click={handleNavigation}>User Management</a
		>
	</li>
	<li>
		<a
			href="/admin/rbac"
			class={$page.url.pathname.startsWith('/admin/rbac') ? 'active' : ''}
			on:click={handleNavigation}>RBAC Management</a
		>
	</li>
	<li>
		<a href="/" on:click={handleNavigation}>Exit</a>
	</li>
</ul>
