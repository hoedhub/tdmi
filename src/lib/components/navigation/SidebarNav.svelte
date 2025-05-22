<script lang="ts">
	import { page } from '$app/stores';
</script>

<ul class="menu min-h-full w-80 bg-base-200 p-4 text-base-content">
	<!-- Sidebar content here -->
	<li>
		<a href="/admin" class={$page.url.pathname === '/admin' ? 'active' : ''}>Dashboard Overview</a>
	</li>
	<li>
		<a href="/admin/users" class={$page.url.pathname.startsWith('/admin/users') ? 'active' : ''}
			>User Management</a
		>
	</li>
</ul>
