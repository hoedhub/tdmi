<script lang="ts">

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { UserPen, LogOut } from 'lucide-svelte';
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	async function logout(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		// Tutup dropdown terlebih dahulu sebelum dialog muncul
		absoluteDropdownStore.close();

		if (!confirm("You're about to logout... Are you sure?")) return;

		const response = await fetch('/api/logout', { method: 'POST' });
		if (response.ok) {
			localStorage.removeItem('lastActiveUser');
			goto('/login');
		} else {
			console.error('Logout failed');
		}
	}
</script>

{#if $page.data.user}
	<ul class="menu w-52 p-2">
		<li class="menu-title text-xs">Signed in as {$page.data.user.username}</li>
		<div class="divider my-0"></div>
		<li>
			<a href="/member/profile" onclick={(e) => { e.stopPropagation(); absoluteDropdownStore.close(); }}>
				<UserPen size={16} /> Edit Profile
			</a>
		</li>
		<li>
			<button type="button" class="flex w-full items-center gap-2" onclick={logout}> 
				<LogOut size={16} /> Logout 
			</button>
		</li>
	</ul>
{/if}
