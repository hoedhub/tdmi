import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				// THE DEFINITIVE FIX:
				// 1. Start with our desired Latin font ('Inter').
				// 2. Immediately provide our custom Arabic font ('Noto Naskh Arabic').
				// 3. Then, spread the rest of the default system fonts as the final fallback.
				sans: ['Inter', 'Noto Naskh Arabic', ...defaultTheme.fontFamily.sans]
			},
			boxShadow: {
				sidebar: '0 15px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.15)'
			}
		}
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
					neutral: '#4A154B',
					'neutral-content': '#FFFFFF',
					'base-100': '#FFFFFF',
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
					neutral: '#19171D',
					'neutral-content': '#D1D2D3',
					'base-100': '#1A1D21',
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
