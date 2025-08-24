import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [require('@tailwindcss/typography'), require('daisyui')],

	daisyui: {
		themes: [
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
			'sunset',
			{
				'slack-pro-light': {
					primary: '#611f69',
					secondary: '#4A154B',
					accent: '#2EB67D',
					
					// THE KEY CHANGE: Redefine neutral colors for this theme
					neutral: '#4A154B', // Slack Aubergine for the sidebar
					'neutral-content': '#FFFFFF', // White text on the purple sidebar
					
					'base-100': '#FFFFFF', // White main content area
					
					info: '#36C5F0',
					success: '#2EB67D',
					warning: '#ECB22E',
					error: '#E01E5A',
					'--rounded-box': '0.5rem',
					'--rounded-btn': '0.5rem'
				}
			},
			{
				'slack-pro-dark': {
					primary: '#8E458E',
					secondary: '#36C5F0',
					accent: '#2EB67D',

					// THE KEY CHANGE: Redefine neutral colors for this theme
					neutral: '#19171D', // Dark purple/black for sidebar
					'neutral-content': '#D1D2D3', // Light gray text
					
					'base-100': '#1A1D21', // Dark main content area

					info: '#36C5F0',
					success: '#2EB67D',
					warning: '#ECB22E',
					error: '#E01E5A',
					'--rounded-box': '0.5rem',
					'--rounded-btn': '0.5rem'
				}
			}
		],
		darkTheme: 'slack-pro-dark',
		base: true,
		styled: true,
		utils: true,
		prefix: '',
		logs: true,
		themeRoot: ':root'
	}
} as Config;
