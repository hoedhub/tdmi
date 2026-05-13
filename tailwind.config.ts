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
				'tdmi-aurora': {
					primary: '#4f46e5',
					'primary-content': '#ffffff',
					secondary: '#ec4899',
					accent: '#8b5cf6',
					neutral: '#334155',
					'neutral-content': '#f8fafc',
					'base-100': '#ffffff',
					'base-200': '#f1f5f9',
					'base-300': '#e2e8f0',
					info: '#0ea5e9',
					success: '#10b981',
					warning: '#f59e0b',
					error: '#ef4444',
					'--rounded-box': '1rem',
					'--rounded-btn': '0.5rem',
					'--rounded-badge': '1.9rem',
					'--animation-btn': '0.25s',
					'--animation-input': '0.2s',
					'--btn-focus-scale': '0.95',
					'--border-btn': '1px',
					'--tab-border': '1px',
					'--tab-radius': '0.5rem'
				}
			},
			{
				'tdmi-night-glow': {
					primary: '#6366f1',
					'primary-content': '#ffffff',
					secondary: '#d946ef',
					accent: '#2dd4bf',
					neutral: '#1e293b',
					'neutral-content': '#f8fafc',
					'base-100': '#0f172a',
					'base-200': '#020617',
					'base-300': '#1e293b',
					info: '#38bdf8',
					success: '#22c55e',
					warning: '#facc15',
					error: '#f43f5e',
					'--rounded-box': '1rem',
					'--rounded-btn': '0.5rem',
					'--rounded-badge': '1.9rem',
					'--animation-btn': '0.25s',
					'--animation-input': '0.2s',
					'--btn-focus-scale': '0.95',
					'--border-btn': '1px',
					'--tab-border': '1px',
					'--tab-radius': '0.5rem'
				}
			},
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
