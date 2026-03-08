// src/lib/utils/api.ts

/**
 * A custom fetch wrapper that uses the native `fetch` from the environment.
 * We no longer use 'fetch-retry' here because it causes "TypeError: unusable"
 * on Node.js 18+ (especially Node 22) during server-side operations due to
 * incompatible Request cloning with undici.
 *
 * @param url The URL to fetch.
 * @param options The request options.
 * @returns A Promise that resolves to the Response object.
 */
export async function api(
	url: RequestInfo | URL,
	options: RequestInit & {
		// Retained for backward compatibility in types, but currently ignored
		// to prevent cloning issues on Node 22.
		retries?: number;
		retryDelay?: number | ((attempt: number, error: Error | null, response: Response | null) => number);
		retryOn?: number[] | ((attempt: number, error: Error | null, response: Response | null) => boolean);
	} = {}
): Promise<Response> {
	// Extract options to avoid passing non-native fetch options to global.fetch
	const { retries, retryDelay, retryOn, ...fetchOptions } = options;

	return fetch(url, fetchOptions);
}
