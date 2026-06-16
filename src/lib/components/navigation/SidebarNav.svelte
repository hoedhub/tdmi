<script lang="ts">
	import { page } from '$app/state';
	import { createEventDispatcher } from 'svelte';
	import { BadgeCheck, ShieldAlert, UsersRound, DatabaseBackup, Bug } from 'lucide-svelte'; // <-- Import ikon

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
		<a
			href="/admin/error-logs"
			class={page.url.pathname.startsWith('/admin/error-logs') ? 'active' : ''}
			onclick={handleNavigation}
		>
			<Bug class="h-5 w-5" />
			Error Logs
		</a>
	</li>
	<li>
		<a href="/" onclick={handleNavigation}>Exit</a>
	</li>
</ul>

<style>
	.menu li > a {
		padding-left: 1.5rem;
		border-radius: 0 8px 8px 0;
		margin-right: 0.5rem;
	}

	.menu li > a.active {
		background-color: var(--fallback-p, oklch(var(--p) / 0.15));
		border-left: 4px solid var(--fallback-p, oklch(var(--p)));
		padding-left: calc(1.5rem - 4px);
		font-weight: 600;
		color: var(--fallback-p, oklch(var(--p)));
	}

	.menu li > a.active:hover {
		background-color: var(--fallback-p, oklch(var(--p) / 0.2));
	}
</style>
