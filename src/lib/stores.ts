import { writable } from 'svelte/store';

// Store ini akan menyimpan berapa kali percobaan ulang telah dilakukan.
export const retryCount = writable(0);
