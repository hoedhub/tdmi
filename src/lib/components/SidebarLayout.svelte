<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ChartNoAxesGantt, User, ChevronsLeft } from 'lucide-svelte'; // Import User icon
	import logo from '$lib/assets/TDMI-Logo-0002.jpg'; // Import your logo if needed
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';
	import { tooltipStore } from '$lib/stores/tooltipStore';

	// Import Lucide icons
	import {
		Home,
		Settings,
		UserPen,
		Users,
		Menu as MenuIcon,
		LogOut,
		UserCircle,
		Palette
	} from 'lucide-svelte';
	// For SvelteKit, you might use: import { page } from '$app/stores';

	let isSidebarOpen = false; // For mobile drawer state
	let isSidebarCollapsed = false; // For desktop collapsed state
	let currentPath = '';
	let isDarkMode = false; // Simple state for theme toggle example
	let userButtonEl: HTMLButtonElement;
	let themeButtonEl: HTMLButtonElement;

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

	function handleUserMenuClick() {
		const rect = userButtonEl.getBoundingClientRect();
		absoluteDropdownStore.toggle(rect, 'user', 'up');
	}

	function handleThemeMenuClick() {
		const rect = themeButtonEl.getBoundingClientRect();
		absoluteDropdownStore.toggle(rect, 'theme', 'up');
	}

	function showTooltip(event: MouseEvent, content: string) {
		if (isSidebarCollapsed) {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			tooltipStore.show(content, rect);
		}
	}

	function hideTooltip() {
		tooltipStore.hide();
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem(`${$page.data.user?.id || 'default'}-theme`);
			if (savedTheme && currentTheme !== savedTheme) {
				currentTheme = savedTheme;
				document.documentElement.setAttribute('data-theme', savedTheme);
			}
		}
	});
</script>

<div class="drawer md:drawer-open relative">
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
		class="drawer-side z-30 transition-all duration-300"
		class:collapsed={isSidebarCollapsed}
	>
		<label for="sidebar-drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>

		<!-- Responsive Sidebar Structure -->
		<div
			class="h-full bg-base-200 text-base-content transition-all duration-300 w-64"
			class:md:w-14={isSidebarCollapsed}
			class:md:w-72={!isSidebarCollapsed}
		>
			<!-- Sidebar Content -->
			<div class="flex h-full flex-col">
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
				<ul
					class="menu flex-grow flex-col space-y-1 px-4"
					class:overflow-y-auto={!isSidebarCollapsed}
					class:overflow-visible={isSidebarCollapsed}
				>
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
								on:mouseenter={(e) => showTooltip(e, item.label)}
								on:mouseleave={hideTooltip}
								title={item.label}
							>
								<svelte:component this={item.icon} size={20} class="opacity-75" />
								<span class:md:hidden={isSidebarCollapsed}>{item.label}</span>
							</a>
						</li>
					{/each}

					<!-- Admin Link -->
					{#if $page.data.canAccessAdmin}
						<div class="divider my-1 text-xs">{isSidebarCollapsed ? '' : 'Admin Area'}</div>
						<li>
							<a
								href={'/admin'}
								class="flex"
								class:md:justify-center={isSidebarCollapsed}
								class:active={$page.url.pathname.startsWith('/admin')}
								on:click={() => (isSidebarOpen = false)}
								on:mouseenter={(e) => showTooltip(e, 'Admin')}
								on:mouseleave={hideTooltip}
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
				>
					<!-- Theme Picker -->
					<button
						bind:this={themeButtonEl}
						on:click={handleThemeMenuClick}
						class="btn btn-ghost"
						class:w-full={!isSidebarCollapsed}
						class:justify-start={!isSidebarCollapsed}
						class:md:justify-center={isSidebarCollapsed}
						class:md:px-0={isSidebarCollapsed}
						class:md:btn-circle={isSidebarCollapsed}
						on:mouseenter={(e) => showTooltip(e, 'Change Theme')}
						on:mouseleave={hideTooltip}
					>
						<Palette size={24} />
						<span class:md:hidden={isSidebarCollapsed} class="truncate">Theme: {currentTheme}</span>
					</button>

					<!-- User Profile Dropdown -->
					{#if $page.data.user}
						<button
							bind:this={userButtonEl}
							on:click={handleUserMenuClick}
							class="btn btn-ghost"
							class:w-full={!isSidebarCollapsed}
							class:justify-start={!isSidebarCollapsed}
							class:md:justify-center={isSidebarCollapsed}
							class:md:px-0={isSidebarCollapsed}
							class:md:btn-circle={isSidebarCollapsed}
							on:mouseenter={(e) => showTooltip(e, 'User Options')}
							on:mouseleave={hideTooltip}
						>
							<UserCircle size={24} />
							<span class:md:hidden={isSidebarCollapsed} class="truncate"
								>Halo, {$page.data.user.username}</span
							>
						</button>
					{/if}
				</div>
			</div>
		</div>
	</aside>

	<!-- Toggle Button (Desktop Only) -->
	<button
		on:click={() => (isSidebarCollapsed = !isSidebarCollapsed)}
		class="btn btn-circle btn-ghost absolute z-40 hidden md:flex transition-all duration-300"
		style="top: {isSidebarCollapsed ? '2.25rem' : '3.5rem'}; transform: translateY(-50%);"
		class:left-14={isSidebarCollapsed}
		class:left-72={!isSidebarCollapsed}
		aria-label="Toggle sidebar"
	>
		<ChevronsLeft
			class="transform transition-transform duration-300 {isSidebarCollapsed ? 'rotate-180' : ''}"
		/>
	</button>
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

