<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { BadgeCheck, ShieldAlert, UsersRound } from 'lucide-svelte'; // <-- Import ikon

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
			on:click={handleNavigation}
		>
			<UsersRound class="h-5 w-5" />
			User Management</a
		>
	</li>
	<li>
		<a
			href="/admin/rbac"
			class={$page.url.pathname.startsWith('/admin/rbac') ? 'active' : ''}
			on:click={handleNavigation}
		>
			<ShieldAlert class="h-5 w-5" />
			RBAC Management</a
		>
	</li>
	<!-- Link baru untuk Manajemen Piket -->
	{#if $page.data.canManagePiket}
		<li>
			<a
				href="/admin/piket"
				class={$page.url.pathname.startsWith('/admin/piket') ? 'active' : ''}
				on:click={handleNavigation}
			>
				<BadgeCheck class="h-5 w-5" />
				Manajemen Ruasa'
			</a>
		</li>
	{/if}
	<li>
		<a href="/" on:click={handleNavigation}>Exit</a>
	</li>
</ul>
