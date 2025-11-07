<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { UserPen, LogOut } from 'lucide-svelte';
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	async function logout() {
		if (!confirm("You're about to logout... Are you sure?")) return;
		const response = await fetch('/api/logout', { method: 'POST' });
		if (response.ok) {
			// THE FIX: Clear the hint before redirecting
			localStorage.removeItem('lastActiveUser');
			goto('/login');
		} else {
			console.error('Logout failed');
		}
		absoluteDropdownStore.close();
	}
</script>

{#if page.data.user}
	<ul class="menu w-52 p-2">
		<li class="menu-title text-xs">Signed in as {page.data.user.username}</li>
		<div class="divider my-0"></div>
		<li>
			<a href="/member/profile" onclick={absoluteDropdownStore.close}>
				<UserPen size={16} /> Edit Profile
			</a>
		</li>
		<li>
			<a href="/logout" onclick={preventDefault(logout)}> <LogOut size={16} /> Logout </a>
		</li>
	</ul>
{/if}
