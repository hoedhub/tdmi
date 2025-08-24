<script lang="ts">
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { UserPen, LogOut } from 'lucide-svelte';
	import MonthPickerDropdown from './MonthPickerDropdown.svelte';
	import { themeStore } from '$lib/stores/themeStore';

	let menuElement: HTMLUListElement;
	let menuStyle = '';

	const themes = [
		'slack-pro-light',
		'slack-pro-dark',
		'light',
		'dark',
		'cupcake',
		'bumblebee',
		'emerald',
		'corporate',
		'synthwave',
		'retro',
		'cyberpunk',
		'valentine',
		'halloween',
		'garden',
		'forest',
		'aqua',
		'lofi',
		'pastel',
		'fantasy',
		'wireframe',
		'black',
		'luxury',
		'dracula',
		'cmyk',
		'autumn',
		'business',
		'acid',
		'lemonade',
		'night',
		'coffee',
		'winter',
		'dim',
		'nord',
		'sunset'
	];

	function toggleTheme(theme: string) {
		if ($themeStore === theme) return;
		document.documentElement.setAttribute('data-theme', theme);
		themeStore.set(theme); // Update the store
		localStorage.setItem(`${$page.data.user?.id || 'default'}-theme`, theme);
		absoluteDropdownStore.close();
	}

	function previewTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
	}

	async function logout() {
		if (!confirm("You're about to logout... Are you sure?")) return;
		const response = await fetch('/api/logout', { method: 'POST' });
		if (response.ok) {
			goto('/login');
		} else {
			console.error('Logout failed');
		}
		absoluteDropdownStore.close();
	}

	absoluteDropdownStore.subscribe(($store) => {
		if ($store.isOpen) {
			const { position, direction } = $store;
			const horizontalPosition =
				window.innerWidth - position.right > 208 // w-52
					? `left: ${position.left}px;`
					: `right: ${window.innerWidth - position.right}px;`;

			const verticalPosition =
				direction === 'up'
					? `bottom: ${window.innerHeight - position.top + 4}px;`
					: `top: ${position.bottom + 4}px;`;

			menuStyle = verticalPosition + ' ' + horizontalPosition;
		}
	});

	function handleClickOutside(event: MouseEvent) {
		if (menuElement && !menuElement.contains(event.target as Node)) {
			absoluteDropdownStore.close();
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem(`${$page.data.user?.id || 'default'}-theme`);
			if (savedTheme) {
				themeStore.set(savedTheme); // Initialize store on mount
			}
		}
	});
</script>

{#if $absoluteDropdownStore.isOpen}
	<div
		class="fixed inset-0 z-40"
		aria-hidden="true"
		on:click|self={absoluteDropdownStore.close}
	></div>
	<ul
		bind:this={menuElement}
		style={menuStyle}
		class="menu fixed z-50 rounded-box bg-base-300 p-2 shadow-lg"
		class:w-52={$absoluteDropdownStore.content === 'user' ||
			$absoluteDropdownStore.content === 'theme'}
		class:h-96={$absoluteDropdownStore.content === 'theme'}
		class:overflow-y-auto={$absoluteDropdownStore.content === 'theme'}
	>
		{#if $absoluteDropdownStore.content === 'user' && $page.data.user}
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
		{:else if $absoluteDropdownStore.content === 'theme'}
			{#each themes as theme}
				<li>
					<button
						class:active={$themeStore === theme}
						on:click|preventDefault={() => toggleTheme(theme)}
						on:mouseover|preventDefault={() => previewTheme(theme)}
						on:focus|preventDefault={() => previewTheme(theme)}
						on:mouseleave|preventDefault={() => previewTheme($themeStore)}
						on:blur|preventDefault={() => previewTheme($themeStore)}
					>
						{theme}
					</button>
				</li>
			{/each}
		{:else if $absoluteDropdownStore.content === 'monthPicker'}
			<li>
				<MonthPickerDropdown
					initialDate={$absoluteDropdownStore.data.initialDate}
					onChange={$absoluteDropdownStore.data.onChange}
				/>
			</li>
		{/if}
	</ul>
{/if}
