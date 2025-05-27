<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Import Lucide icons
	import { Home, Settings, Users, Menu as MenuIcon, LogOut } from 'lucide-svelte';
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

	onMount(() => {
		if (typeof window !== 'undefined') {
			currentPath = window.location.pathname;
			// Check initial theme preference
			isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
		}
	});

	const menuItems = [
		{ href: '/', label: 'Dashboard', icon: Home },
		{ href: '/member/users', label: 'Users', icon: Users },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];

	function isActive(href: String) {
		// For SvelteKit, use: $page.url.pathname === href
		return currentPath === href || (href === '/' && currentPath.startsWith('/#'));
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
	let saveTheme = true; // State for saving theme preference
	let themeDropdownButton: HTMLDivElement; // Reference to the dropdown button

	function toggleTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
		isDarkMode = theme === 'dark';
		currentTheme = theme;
		if (saveTheme) localStorage.setItem(`${$page.data.user?.id || 'default'}-theme`, theme);
	}

	function previewTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
		// Optional: Persist theme choice in localStorage
		// localStorage.setItem('theme', newTheme);
	}

	// If using SvelteKit's theme controller script, this function might not be needed,
	// but this is a simple JS-only way.
	onMount(() => {
		// saveTheme = localStorage.getItem(`${$page.data.user?.id || 'default'}-theme`) === 'true';
		const savedTheme = localStorage.getItem(`${$page.data.user?.id || 'default'}-theme`);
		currentTheme = savedTheme || currentTheme;
		if (savedTheme) {
			// document.documentElement.setAttribute('data-theme', savedTheme);
			isDarkMode = savedTheme === 'dark';
		}
		//   else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		//     document.documentElement.setAttribute('data-theme', 'dark');
		//     isDarkMode = true;
		//   }
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
			<!-- Optional: Theme toggle in mobile navbar -->
			<!-- <div class="flex-none">
				<button class="btn btn-square btn-ghost" on:click={toggleTheme} aria-label="Toggle theme">
					{#if isDarkMode}
						<Sun size={20} />
					{:else}
						<Moon size={20} />
					{/if}
				</button>
			</div> -->
		</div>

		<!-- Main content area -->
		<main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
			<slot name="main-content">
				<h1 class="text-2xl font-bold">Welcome!</h1>
				<p>This is the main content area.</p>
			</slot>
		</main>

		<!-- Optional Footer -->
		<footer class="footer footer-center bg-base-300 p-4 text-base-content">
			<aside>
				<p>Copyright © {new Date().getFullYear()} - All right reserved by MyApp Industries Ltd</p>
			</aside>
		</footer>
	</div>

	<!-- Sidebar -->
	<aside class="drawer-side z-40">
		<label for="sidebar-drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="menu flex min-h-full w-64 flex-col bg-base-200 p-4 text-base-content md:w-72">
			<!-- Sidebar header/logo -->
			<div class="mb-6 mt-2">
				<a href="/" class="btn btn-ghost flex items-center text-2xl font-semibold normal-case">
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
						><path
							d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
						/><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line
							x1="12"
							y1="22.08"
							x2="12"
							y2="12"
						/></svg
					>
					MyApp
				</a>
			</div>

			<!-- Navigation Menu -->
			<ul class="flex-grow space-y-1">
				{#each menuItems as item}
					<li>
						<a
							href={item.href}
							class:active={isActive(item.href)}
							on:click={() => (isSidebarOpen = false)}
							class="flex items-center justify-start"
						>
							<svelte:component this={item.icon} size={20} class="opacity-75" />
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>

			<!-- Sidebar footer/actions -->
			<div class="mt-auto pt-4">
				<!-- Theme Toggle Example -->
				<div class="form-control -mb-2 flex flex-row items-center">
					Theme
					<div class="dropdown dropdown-top">
						<div tabindex="0" role="button" class="btn m-1" bind:this={themeDropdownButton}>
							{currentTheme}
						</div>
						<ul
							class="menu dropdown-content z-[1] h-96 w-52 overflow-y-auto rounded-box bg-base-100 p-2 shadow"
						>
							{#each themes as theme}
								<li>
									<button
										class:active={currentTheme === theme}
										on:click|preventDefault={() => {
											toggleTheme(theme);
											// Close the dropdown by blurring the button
											themeDropdownButton.blur();
										}}
										on:mouseover|preventDefault={() => previewTheme(theme)}
										on:focus|preventDefault={() => previewTheme(theme)}
										on:mouseleave|preventDefault={() => toggleTheme(currentTheme)}
										on:blur|preventDefault={() => toggleTheme(currentTheme)}
									>
										{theme}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<!-- <label class="label m-0 flex cursor-pointer justify-start">
					<input
						id="save-theme"
						type="checkbox"
						bind:checked={saveTheme}
						on:click={() =>
							setTimeout(
								() => localStorage.setItem('save-theme', saveTheme ? 'true' : 'false'),
								100
							)}
						class="checkbox checkbox-xs"
					/>
					<span class="label-text px-1 text-xs">Save Theme</span>
				</label> -->
				<div class="divider my-1"></div>
				<ul>
					<li>
						<a
							href="/logout"
							on:click|preventDefault={() => {
								logout();
								isSidebarOpen = false;
							}}
							class="flex items-center space-x-3"
						>
							<LogOut size={20} class="opacity-75" />
							<span>Logout</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</aside>
</div>

<style>
	/* DaisyUI's .active class on menu items is usually sufficient */
	/* .menu li > a.active { */
	/* background-color: hsl(var(--p) / 0.1); /* Subtle primary background */
	/* color: hsl(var(--p)); /* Primary color text */
	/* font-weight: 600; */
	/* } */
	.menu li > a.active :global(svg) {
		opacity: 1;
		/* color: hsl(var(--p)); If you want icon color to also be primary */
	}

	/* Ensure icons align nicely with text */
	/* .menu li > a :global(svg), */
	/* .sidebar-footer-actions :global(svg) { */
	/* Lucide icons are already well-aligned, but you can add margin if needed */
	/* margin-right: 0.75rem; */
	/* } */

	/* Ensure enough space for icons */
	/* .menu li > a span {
		flex-grow: 1;
	} */

	/* For the simple theme toggle, let's ensure the HTML data-theme is set.
       If you install `theme-change` from DaisyUI, it handles this more robustly. */
	/* :global(html[data-theme="light"]) { */
	/* --your-light-theme-vars-- */
	/* } */
	/* :global(html[data-theme="dark"]) { */
	/* --your-dark-theme-vars-- */
	/* } */
</style>
