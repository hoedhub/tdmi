import type { HandleClientError } from '@sveltejs/kit';
import { initGlobalErrorHandler } from '$lib/utils/errorReporter';

initGlobalErrorHandler();

export const handleError: HandleClientError = ({ error }) => {
	console.error('An unexpected client-side error occurred:', error);
	const typedError = error as App.Error;
	return {
		message: typedError.message ?? 'An unexpected error occurred on the client.'
	};
};
