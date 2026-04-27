<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
<script lang="ts">
	// This component is now fully theme-agnostic and uses standard DaisyUI classes.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ChartNoAxesGantt, User, ChevronsLeft } from 'lucide-svelte';
	import logo from '$lib/assets/TDMI-Logo-0002.jpg';
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';
	import { tooltipStore } from '$lib/stores/tooltipStore';
	import { themeStore } from '$lib/stores/themeStore';
	import { setPreference } from '$lib/stores/preferenceService';

	// Import content components for the dropdown
	import ThemePicker from './ThemePicker.svelte';
	import UserMenu from './UserMenu.svelte';

	import {
		Home,
		Settings,
		Users,
		Menu as MenuIcon,
		UserCircle,
		Palette,
		CalendarRange
	} from 'lucide-svelte';

	// Initialize state from the class set by the inline script to prevent flash
	let isSidebarCollapsed = $state(
		typeof document !== 'undefined' && document.documentElement.classList.contains('sidebar-collapsed')
	);
	let isSidebarOpen = $state(false); // For mobile drawer state
	let userButtonEl: HTMLButtonElement | undefined = $state();
	let themeButtonEl: HTMLButtonElement | undefined = $state();

	const menuItems = [
		{ href: '/member', label: 'Dashboard', icon: Home },
		{ href: '/member/pendataan', label: 'Pendataan', icon: Users },
		{ href: '/member/nasyath_mun', label: 'Nasyath MUN', icon: CalendarRange },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];

	function handleUserMenuClick() {
		if (!userButtonEl) return;
		const rect = userButtonEl.getBoundingClientRect();
		absoluteDropdownStore.toggle(rect, UserMenu, 'up');
	}

	function handleThemeMenuClick() {
		if (!themeButtonEl) return;
		const rect = themeButtonEl.getBoundingClientRect();
		absoluteDropdownStore.toggle(rect, ThemePicker, 'up');
	}

	function toggleSidebar() {
		isSidebarCollapsed = !isSidebarCollapsed;
		// Update the global class and use the centralized service to save the preference
		document.documentElement.classList.toggle('sidebar-collapsed', isSidebarCollapsed);
		setPreference($page.data.user, 'sidebar-collapsed', isSidebarCollapsed);
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
		// Ensure the component's reactive state is correct on mount, reading from the DOM
		// which was set by the early script.
		isSidebarCollapsed = document.documentElement.classList.contains('sidebar-collapsed');
	});

	// When the store changes, update the data-theme attribute
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', $themeStore);
		}
	});

	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<div class="drawer relative md:drawer-open">
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
			{@render children?.()}
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
		class="drawer-side z-30 transition-all duration-300 shadow-sidebar"
		class:collapsed={isSidebarCollapsed}
	>
		<label for="sidebar-drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>

		<!-- Responsive Sidebar Structure -->
		<div
			class="h-full w-64 bg-neutral text-neutral-content transition-all duration-300 sidebar-inner-container"
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
							class="h-20 w-20 rounded-full border-2 border-white transition-all duration-300 sidebar-logo"
							class:md:h-10={isSidebarCollapsed}
							class:md:w-10={isSidebarCollapsed}
							src={logo}
						/>
					</a>
				</div>
				<div class="divider my-0"></div>

				<!-- Main Navigation Menu -->
				<ul
					class="menu sidebar-menu flex-grow flex-col space-y-1 px-0"
					class:overflow-y-auto={!isSidebarCollapsed}
					class:overflow-visible={isSidebarCollapsed}
				>
					{#each menuItems as item}
						<li>
							<a
								href={item.href}
								class="flex"
								class:md:justify-center={isSidebarCollapsed}
								class:active={item.href === '/member'
									? $page.url.pathname === '/member'
									: item.href === '/'
										? $page.url.pathname === '/' || $page.url.pathname === ''
										: $page.url.pathname.startsWith(item.href)}
								onclick={() => (isSidebarOpen = false)}
								onmouseenter={(e) => showTooltip(e, item.label)}
								onmouseleave={hideTooltip}
							>
								<item.icon size={20} class="opacity-75" />
								<span class:md:hidden={isSidebarCollapsed} class="sidebar-label">{item.label}</span>
							</a>
						</li>
					{/each}

					<!-- Admin Link -->
					{#if $page.data.canAccessAdmin}
						<div class="divider my-1 text-xs">
							<span class:md:hidden={isSidebarCollapsed} class="sidebar-label">Admin Area</span>
						</div>
						<li>
							<a
								href={'/admin'}
								class="flex"
								class:md:justify-center={isSidebarCollapsed}
								class:active={$page.url.pathname.startsWith('/admin')}
								onclick={() => (isSidebarOpen = false)}
								onmouseenter={(e) => showTooltip(e, 'Admin')}
								onmouseleave={hideTooltip}
							>
								<ChartNoAxesGantt size={20} class="opacity-75" />
								<span class:md:hidden={isSidebarCollapsed} class="sidebar-label">{'Admin'}</span>
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
						onclick={handleThemeMenuClick}
						class="btn btn-ghost"
						class:w-full={!isSidebarCollapsed}
						class:justify-start={!isSidebarCollapsed}
						class:md:justify-center={isSidebarCollapsed}
						class:md:px-0={isSidebarCollapsed}
						class:md:btn-circle={isSidebarCollapsed}
						onmouseenter={(e) => showTooltip(e, 'Change Theme')}
						onmouseleave={hideTooltip}
					>
						<Palette size={24} />
						<span class:md:hidden={isSidebarCollapsed} class="truncate sidebar-label">Theme: {$themeStore}</span>
					</button>

					<!-- User Profile Dropdown -->
					{#if $page.data.user}
						<button
							bind:this={userButtonEl}
							onclick={handleUserMenuClick}
							class="btn btn-ghost"
							class:w-full={!isSidebarCollapsed}
							class:justify-start={!isSidebarCollapsed}
							class:md:justify-center={isSidebarCollapsed}
							class:md:px-0={isSidebarCollapsed}
							class:md:btn-circle={isSidebarCollapsed}
							onmouseenter={(e) => showTooltip(e, 'User Options')}
							onmouseleave={hideTooltip}
						>
							<UserCircle size={24} />
							<span class:md:hidden={isSidebarCollapsed} class="truncate sidebar-label"
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
		onclick={toggleSidebar}
		class="fixed z-40 hidden top-1/2 -translate-y-1/2 transition-all duration-300 md:flex items-center justify-center bg-neutral text-neutral-content hover:brightness-110 rounded-r-md shadow-lg sidebar-toggle-btn w-5 h-12"
		class:left-14={isSidebarCollapsed}
		class:left-72={!isSidebarCollapsed}
		aria-label="Toggle sidebar"
	>
		<ChevronsLeft
			size={16}
			class="transform transition-transform duration-300 {isSidebarCollapsed ? 'rotate-180' : ''}"
		/>
	</button>
</div>

<style>
	.menu li > a {
		padding-left: 1.5rem;
		border-radius: 0 8px 8px 0;
		margin-right: 0.5rem;
	}

	.menu li > a.active {
		background-color: var(--fallback-p, oklch(var(--p) / 0.25));
		border-left: 4px solid var(--fallback-p, oklch(var(--p)));
		padding-left: calc(1.5rem - 4px);
		font-weight: 700;
		color: var(--fallback-pc, oklch(var(--pc)));
		box-shadow: inset 0 0 10px oklch(var(--p) / 0.1);
	}

	.menu li > a.active :global(svg) {
		color: inherit;
		opacity: 1;
		filter: drop-shadow(0 0 2px oklch(var(--pc) / 0.3));
	}

	.menu li > a.active:hover {
		background-color: var(--fallback-p, oklch(var(--p) / 0.25));
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
		:global(.drawer-side.collapsed .menu li a span) {
			display: none;
		}

		/* SSR/Hydration Flash Fix: Apply collapsed styles when html has .sidebar-collapsed */
		:global(html.sidebar-collapsed .sidebar-inner-container) {
			width: 3.5rem !important; /* md:w-14 */
		}
		:global(html.sidebar-collapsed .sidebar-logo) {
			height: 2.5rem !important; /* md:h-10 */
			width: 2.5rem !important; /* md:w-10 */
		}
		:global(html.sidebar-collapsed .sidebar-label) {
			display: none !important;
		}
		:global(html.sidebar-collapsed .sidebar-menu) {
			padding-inline: 0.5rem !important;
		}
		:global(html.sidebar-collapsed .sidebar-menu li a) {
			width: 2.5rem !important;
			height: 2.5rem !important;
			padding: 0 !important;
			align-items: center !important;
			justify-content: center !important;
		}
		:global(html.sidebar-collapsed .sidebar-toggle-btn) {
			top: 50% !important;
			left: 3.5rem !important; /* left-14 */
		}
		:global(html.sidebar-collapsed .sidebar-toggle-btn svg) {
			transform: rotate(180deg) !important;
		}
	}
</style>
