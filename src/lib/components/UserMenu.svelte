<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { UserPen, LogOut } from 'lucide-svelte';
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	export let data: any; // Accept the data prop to conform to the dropdown's interface

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

{#if $page.data.user}
	<ul class="menu w-52 p-2">
		<li class="menu-title text-xs">Signed in as {$page.data.user.username}</li>
		<div class="divider my-0"></div>
		<li>
			<a href="/member/profile" on:click={absoluteDropdownStore.close}>
				<UserPen size={16} /> Edit Profile
			</a>
		</li>
		<li>
			<a href="/logout" on:click|preventDefault={logout}> <LogOut size={16} /> Logout </a>
		</li>
	</ul>
{/if}
