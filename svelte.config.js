import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: undefined,

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/integrations#preprocessors
		// for more information about adapters.
		adapter: adapter()
	}
};

export default config;
