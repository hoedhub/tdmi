<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ChartNoAxesGantt } from 'lucide-svelte';

	// Import Lucide icons
	import {
		Home,
		Settings,
		UserPen,
		Users,
		Menu as MenuIcon,
		LogOut,
		UserCircle
	} from 'lucide-svelte';
	// For SvelteKit, you might use: import { page } from '$app/stores';

	let isSidebarOpen = false; // For mobile drawer state
	let currentPath = '';
	let isDarkMode = false; // Simple state for theme toggle example

	async function logout() {
		if (!confirm("You're about to logout... Are you sure?")) return;
		const response = await fetch('/api/logout', { method: 'POST' });
		if (response.ok) {
			// Redirect or update UI as needed
			goto('/login'); // or wherever you want to redirect after logout
		} else {
			// Handle error
			console.error('Logout failed');
		}
	}

	const menuItems = [
		{ href: '/', label: 'Dashboard', icon: Home },
		{ href: '/member/users', label: 'Users', icon: Users },
		// { href: '/member/profile', label: 'Edit Profile', icon: UserPen },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];

	function isActive(href: String) {
		// For SvelteKit, use: $page.url.pathname === href
		// return currentPath === href || (href === '/' && currentPath.startsWith('/#'));
		return $page.url.pathname === href; // Gunakan $page store untuk
	}
	const themes = [
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
	let currentTheme = 'cupcake'; // Default theme

	function toggleTheme(theme: string) {
		if (currentTheme === theme) return;
		document.documentElement.setAttribute('data-theme', theme);
		currentTheme = theme;
		localStorage.setItem(`${$page.data.user?.id || 'default'}-theme`, theme);
	}

	function previewTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem(`${$page.data.user?.id || 'default'}-theme`);
			if (savedTheme && currentTheme !== savedTheme) {
				currentTheme = savedTheme;
			}
		}
	});
</script>

<div class="drawer md:drawer-open">
	<input
		id="sidebar-drawer-toggle"
		type="checkbox"
		class="drawer-toggle"
		bind:checked={isSidebarOpen}
	/>

	<!-- Page Content -->
	<div class="drawer-content flex flex-col bg-base-100">
		<!-- Navbar for Mobile -->
		<div class="navbar sticky top-0 z-30 bg-base-200 shadow md:hidden">
			<div class="flex-none">
				<label
					for="sidebar-drawer-toggle"
					aria-label="open sidebar"
					class="btn btn-square btn-ghost"
				>
					<MenuIcon size={24} />
				</label>
			</div>
			<div class="flex-1">
				<a href="/" class="btn btn-ghost text-xl normal-case">MyApp</a>
			</div>
		</div>

		<!-- Main content area -->
		<main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
			<slot name="main-content" />
		</main>

		<!-- Footer -->
		<footer class="footer footer-center bg-base-300 p-4 text-base-content">
			<aside>
				<p>Copyright © {new Date().getFullYear()} - TDMI. All right reserved</p>
			</aside>
		</footer>
	</div>

	<!-- Sidebar -->
	<aside class="drawer-side z-40">
		<label for="sidebar-drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>

		<!-- STRUKTUR UTAMA SIDEBAR YANG DIROMBAK -->
		<div class="flex h-full w-64 flex-col bg-base-200 p-4 text-base-content md:w-72">
			<!-- 1. Logo/Header -->
			<div class="mb-4 mt-2 flex items-center justify-center">
				<a href="/" class="btn btn-ghost text-2xl font-semibold normal-case">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-box mr-2 text-primary"
					>
						<path
							d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
						/>
						<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
						<line x1="12" y1="22.08" x2="12" y2="12" />
					</svg>
					MyApp
				</a>
			</div>
			<div class="divider my-0"></div>

			<!-- 2. Menu Navigasi Utama (Scrollable) -->
			<ul class="menu flex-grow space-y-1 overflow-y-auto">
				{#each menuItems as item}
					<li>
						<a
							href={item.href}
							class:active={isActive(item.href)}
							on:click={() => (isSidebarOpen = false)}
						>
							<svelte:component this={item.icon} size={20} class="opacity-75" />
							<span>{item.label}</span>
						</a>
					</li>
				{/each}

				<!-- Tautan Admin (Bagian dari Navigasi Utama) -->
				{#if $page.data.canAccessAdmin}
					<div class="divider my-1 text-xs">Admin Area</div>
					<li>
						<a
							href={'/admin'}
							class:active={$page.url.pathname.startsWith('/admin')}
							on:click={() => (isSidebarOpen = false)}
						>
							<ChartNoAxesGantt size={20} class="opacity-75" />
							<span>{'Admin'}</span>
						</a>
					</li>
				{/if}
			</ul>

			<!-- 3. Bagian Bawah (Fixed): Aksi Pengguna & Sesi -->
			<div class="mt-auto flex flex-col space-y-2 pt-4">
				<!-- Pemilih Tema yang Lebih Baik -->
				<label class="form-control flex w-full flex-row items-center">
					<div class="label pt-[0.75rem]">
						<span class="label-text">Theme</span>
					</div>
					<div class="dropdown dropdown-top">
						<button tabindex="0" class="btn btn-xs" on:click|preventDefault={() => null}>
							{currentTheme}
						</button>
						<ul
							class="menu dropdown-content z-[1] h-96 w-52 overflow-y-auto rounded-box bg-base-100 p-2 shadow"
						>
							{#each themes as theme}
								<li>
									<button
										class:active={currentTheme === theme}
										on:click|preventDefault={() => {
											toggleTheme(theme);
										}}
										on:mouseover|preventDefault={() => previewTheme(theme)}
										on:focus|preventDefault={() => previewTheme(theme)}
										on:mouseleave|preventDefault={() => previewTheme(currentTheme)}
										on:blur|preventDefault={() => previewTheme(currentTheme)}
									>
										{theme}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</label>

				<!-- Dropdown Profil Pengguna -->
				{#if $page.data.user}
					<div class="dropdown dropdown-top w-full">
						<button tabindex="0" class="btn btn-ghost w-full justify-start">
							<UserCircle size={24} />
							<span class="truncate">Halo, {$page.data.user.username}</span>
						</button>
						<ul
							tabindex="0"
							role="menu"
							class="menu dropdown-content z-[1] w-full rounded-box bg-base-300 p-2 shadow"
						>
							<li class="menu-title text-xs">Signed in as {$page.data.user.username}</li>
							<div class="divider my-0"></div>
							<li>
								<a href="/member/profile" on:click={() => (isSidebarOpen = false)}>
									<UserPen size={16} /> Edit Profile
								</a>
							</li>
							<li>
								<a href="/logout" on:click|preventDefault={logout}>
									<LogOut size={16} /> Logout
								</a>
							</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</aside>
</div>

<style>
	/* Anda mungkin tidak perlu style tambahan karena DaisyUI sudah menanganinya */
	.menu li > a.active {
		font-weight: 600;
	}
</style>
