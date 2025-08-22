// src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit';

/**
 * This hook intercepts unexpected client-side errors.
 * It's a good place for logging errors to an external service.
 */
export const handleError: HandleClientError = ({ error }) => {
	// Log the error for debugging purposes
	console.error('An unexpected client-side error occurred:', error);

	// Return a user-friendly message for the default error page.
	const typedError = error as App.Error;
	return {
		message: typedError.message ?? 'An unexpected error occurred on the client.'
	};
};
