import { writable } from 'svelte/store';

// Create a writable store with a default value.
// This store will hold the current theme name.
export const themeStore = writable<string>('slack-pro-light');
