import { api } from '$lib/utils/api';

interface ClientReportParams {
	level?: 'error' | 'warning' | 'info';
	message: string;
	stack?: string;
	url?: string;
	metadata?: Record<string, unknown>;
}

export async function reportClientError(params: ClientReportParams): Promise<void> {
	try {
		await api('/api/error-log', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				level: params.level ?? 'error',
				message: params.message,
				stack: params.stack,
				url: params.url ?? window.location.href,
				userAgent: navigator.userAgent,
				metadata: params.metadata
			})
		});
	} catch {
		// Silently fail — the error reporter itself must never throw
	}
}

export function initGlobalErrorHandler(): void {
	window.addEventListener('error', (event) => {
		reportClientError({
			level: 'error',
			message: event.message,
			stack: event.error?.stack,
			url: window.location.href,
			metadata: {
				type: 'uncaught-error',
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno
			}
		});
	});

	window.addEventListener('unhandledrejection', (event) => {
		const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
		reportClientError({
			level: 'error',
			message: `Unhandled Promise rejection: ${err.message}`,
			stack: err.stack,
			url: window.location.href,
			metadata: { type: 'unhandled-rejection' }
		});
	});
}
