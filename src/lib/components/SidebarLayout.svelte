<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ChartNoAxesGantt, User, ChevronsLeft } from 'lucide-svelte'; // Import User icon
	import logo from '$lib/assets/TDMI-Logo-0002.jpg'; // Import your logo if needed

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
	let isSidebarCollapsed = false; // For desktop collapsed state
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
		{ href: '/member/pendataan', label: 'Pendataan', icon: Users },
		{ href: '/member/nasyath_mun', label: 'Nasyath MUN', icon: ChartNoAxesGantt },
		// { href: '/member/profile', label: 'Edit Profile', icon: UserPen },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];

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
				<a href="/" class="btn btn-ghost text-xl normal-case">TDMI</a>
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
	<aside
		class="drawer-side z-40 transition-all duration-300"
		class:collapsed={isSidebarCollapsed}
	>
		<label for="sidebar-drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>

		<!-- Responsive Sidebar Structure -->
		<div
			class="relative flex h-full flex-col bg-base-200 text-base-content transition-all duration-300 w-64"
			class:md:w-14={isSidebarCollapsed}
			class:md:w-72={!isSidebarCollapsed}
		>
			<!-- Toggle Button (Desktop Only) -->
			<button
				on:click={() => (isSidebarCollapsed = !isSidebarCollapsed)}
				class="btn btn-circle btn-ghost absolute -right-4 top-8 z-50 hidden md:flex"
				aria-label="Toggle sidebar"
			>
				<ChevronsLeft
					class="transform transition-transform duration-300 {isSidebarCollapsed ? 'rotate-180' : ''}"
				/>
			</button>

			<!-- Logo/Header -->
			<div class="mb-4 mt-2 flex items-center justify-center p-2">
				<a
					href="/"
					class="block transition-transform duration-300"
					class:md:hover:scale-125={!isSidebarCollapsed}
				>
					<img
						alt="The project logo"
						class="rounded-full border-2 border-white transition-all duration-300 h-20 w-20"
						class:md:h-10={isSidebarCollapsed}
						class:md:w-10={isSidebarCollapsed}
						src={logo}
					/>
				</a>
			</div>
			<div class="divider my-0"></div>

			<!-- Main Navigation Menu -->
			<ul class="menu flex-grow flex-col space-y-1 overflow-y-auto px-4">
				{#each menuItems as item}
					<li>
						<a
							href={item.href}
							class="flex"
							class:md:justify-center={isSidebarCollapsed}
							class:active={item.href === '/'
								? $page.url.pathname === '/'
								: $page.url.pathname.startsWith(item.href)}
							on:click={() => (isSidebarOpen = false)}
							title={item.label}
						>
							<svelte:component this={item.icon} size={20} class="opacity-75" />
							<span class:md:hidden={isSidebarCollapsed}>{item.label}</span>
						</a>
					</li>
				{/each}

				<!-- Admin Link -->
				{#if $page.data.canAccessAdmin}
					<div class="divider my-1 text-xs">Admin Area</div>
					<li>
						<a
							href={'/admin'}
							class="flex"
							class:md:justify-center={isSidebarCollapsed}
							class:active={$page.url.pathname.startsWith('/admin')}
							on:click={() => (isSidebarOpen = false)}
							title="Admin"
						>
							<ChartNoAxesGantt size={20} class="opacity-75" />
							<span class:md:hidden={isSidebarCollapsed}>{'Admin'}</span>
						</a>
					</li>
				{/if}
			</ul>

			<!-- Bottom User/Session Actions -->
			<div
				class="mt-auto flex flex-col space-y-2 p-4 pt-4"
				class:md:items-center={isSidebarCollapsed}
				class:md:overflow-hidden={isSidebarCollapsed}
				class:md:h-0={isSidebarCollapsed}
			>
				<!-- Theme Picker -->
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

				<!-- User Profile Dropdown -->
				{#if $page.data.user}
					<div class="dropdown dropdown-top w-full">
						<button
							tabindex="0"
							class="btn btn-ghost w-full"
							class:md:justify-center={isSidebarCollapsed}
							class:md:px-0={isSidebarCollapsed}
						>
							<UserCircle size={24} />
							<span class:md:hidden={isSidebarCollapsed} class="truncate"
								>Halo, {$page.data.user.username}</span
							>
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
	.menu li > a.active {
		font-weight: 600;
	}

	/* Desktop-only styles for the collapsed sidebar */
	@media (min-width: 768px) {
		:global(.drawer-side.collapsed .menu li a) {
			width: 2.5rem; /* 40px */
			height: 2.5rem; /* 40px */
			padding: 0;
			align-items: center;
		}

		:global(.drawer-side.collapsed .menu) {
			padding-inline: 0.5rem; /* 8px */
		}

		/* Hide text span inside links when collapsed */
		:global(.drawer-side.collapsed .menu li a span) {
			display: none;
		}
	}
</style>