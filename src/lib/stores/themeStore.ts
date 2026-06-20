import { writable } from 'svelte/store';

function getInitialTheme(): string {
	if (typeof window === 'undefined') return 'tdmi-aurora';
	try {
		const lastActiveUser = localStorage.getItem('lastActiveUser');
		if (lastActiveUser) {
			const savedTheme = localStorage.getItem(`${lastActiveUser}-theme`);
			if (savedTheme) {
				return JSON.parse(savedTheme);
			}
		}
		const dataTheme = document.documentElement.getAttribute('data-theme');
		if (dataTheme) return dataTheme;
	} catch {
		// localStorage disabled or corrupt data
	}
	return 'tdmi-aurora';
}

export const themeStore = writable<string>(getInitialTheme());
