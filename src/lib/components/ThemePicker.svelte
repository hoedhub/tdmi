<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { page } from '$app/state';
	import { themeStore } from '$lib/stores/themeStore';
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';
	import { setPreference } from '$lib/stores/preferenceService';

	const themes = [
		'tdmi-aurora',
		'tdmi-night-glow',
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
		themeStore.set(theme);
		setPreference(page.data.user, 'theme', theme);
		absoluteDropdownStore.close();
	}

	function previewTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
	}
</script>

<ul class="menu flex-nowrap h-96 w-56 overflow-y-auto p-2">
	{#each themes as theme}
		<li>
			<button
				class:active={$themeStore === theme}
				onclick={preventDefault(() => toggleTheme(theme))}
				onmouseover={preventDefault(() => previewTheme(theme))}
				onfocus={preventDefault(() => previewTheme(theme))}
				onmouseleave={preventDefault(() => previewTheme($themeStore))}
				onblur={preventDefault(() => previewTheme($themeStore))}
			>
				{theme}
			</button>
		</li>
	{/each}
</ul>