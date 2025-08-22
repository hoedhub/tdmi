// src/lib/utils/api.ts
import _fetch from 'fetch-retry';

const fetchWithRetry = _fetch(fetch);

/**
 * A custom fetch wrapper that implements a retry mechanism for network resilience.
 * All client-side API calls should use this helper instead of the native `fetch`.
 *
 * @param url The URL to fetch.
 * @param options The request options, including custom retry settings.
 * @returns A Promise that resolves to the Response object.
 */
export function api(
	url: RequestInfo | URL,
	options: RequestInit & {
		retries?: number;
		retryDelay?: number | ((attempt: number, error: Error | null, response: Response | null) => number);
		retryOn?: number[] | ((attempt: number, error: Error | null, response: Response | null) => boolean);
	}
): Promise<Response> {
	const { retries = 2, retryDelay = 1000, retryOn = [502, 503, 504], ...fetchOptions } = options;

	return fetchWithRetry(url, {
		...fetchOptions,
		retries,
		retryDelay,
		retryOn
	});
}
