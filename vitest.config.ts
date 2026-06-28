/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.local', override: true });

const viteConfig = {
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['svelte-chartjs', 'svelte-turnstile']
	},
	ssr: {
		noExternal: ['svelte-chartjs', 'svelte-turnstile']
	}
};

export default defineConfig({
	...viteConfig,
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts,tsx,svelte}']
	}
});
