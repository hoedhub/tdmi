<script lang="ts">
	import { page } from '$app/state';
	import { createEventDispatcher } from 'svelte';
	import { BadgeCheck, ShieldAlert, UsersRound, DatabaseBackup } from 'lucide-svelte'; // <-- Import ikon

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
			class={page.url.pathname === '/admin' ? 'active' : ''}
			onclick={handleNavigation}>Dashboard Overview</a
		>
	</li>
	<li>
		<a
			href="/admin/users"
			class={page.url.pathname.startsWith('/admin/users') ? 'active' : ''}
			onclick={handleNavigation}
		>
			<UsersRound class="h-5 w-5" />
			User Management</a
		>
	</li>
	<li>
		<a
			href="/admin/rbac"
			class={page.url.pathname.startsWith('/admin/rbac') ? 'active' : ''}
			onclick={handleNavigation}
		>
			<ShieldAlert class="h-5 w-5" />
			RBAC Management</a
		>
	</li>
	<!-- Link baru untuk Manajemen Piket -->
	{#if page.data.canManagePiket}
		<li>
			<a
				href="/admin/piket"
				class={page.url.pathname.startsWith('/admin/piket') ? 'active' : ''}
				onclick={handleNavigation}
			>
				<BadgeCheck class="h-5 w-5" />
				Manajemen Ruasa'
			</a>
		</li>
	{/if}
	<!-- Link baru untuk Backup -->
	{#if page.data.canCreateBackup}
		<li>
			<a
				href="/admin/backup"
				class={page.url.pathname.startsWith('/admin/backup') ? 'active' : ''}
				onclick={handleNavigation}
			>
				<DatabaseBackup class="h-5 w-5" />
				Backup
			</a>
		</li>
	{/if}
	<li>
		<a href="/" onclick={handleNavigation}>Exit</a>
	</li>
</ul>
