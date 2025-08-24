import { browser } from '$app/environment';
import type { App } from '$lib/types'; // Assuming you might have a type for User

// This service centralizes all user preference interactions with localStorage.

/**
 * Sets a preference for the given user and updates the last active user hint.
 * @param user The user object, must contain an `id`.
 * @param key The name of the preference (e.g., 'theme', 'sidebar-collapsed').
 * @param value The value to store.
 */
export function setPreference(user: App.User | null | undefined, key: string, value: any) {
	if (!browser || !user) return;

	try {
		const userKey = `${user.id}-${key}`;
		localStorage.setItem(userKey, JSON.stringify(value));
		localStorage.setItem('lastActiveUser', user.id); // Update the hint for the inline script
	} catch (e) {
		console.error(`Failed to set preference '${key}' in localStorage`, e);
	}
}

// The getPreferenceForUser function is fine as it is, since it doesn't use any stores.
// It's designed for the early script.