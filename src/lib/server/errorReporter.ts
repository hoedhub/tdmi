import { db } from '$lib/drizzle';
import { errorLogTable, type ErrorLevel, type ErrorSource } from '$lib/drizzle/schema';
import { nanoid } from 'nanoid';

interface ReportErrorParams {
	level?: ErrorLevel;
	message: string;
	stack?: string | null;
	url?: string;
	userId?: string | null;
	metadata?: Record<string, unknown>;
}

export async function reportError(params: ReportErrorParams): Promise<string> {
	const id = nanoid(16);
	await db.insert(errorLogTable).values({
		id,
		level: params.level ?? 'error',
		source: 'server',
		message: params.message,
		stack: params.stack ?? null,
		url: params.url ?? null,
		userId: params.userId ?? null,
		metadata: params.metadata ? JSON.stringify(params.metadata) : null
	});
	return id;
}

export async function reportServerError(
	error: unknown,
	context?: { url?: string; userId?: string | null; metadata?: Record<string, unknown> }
): Promise<string> {
	const err = error instanceof Error ? error : new Error(String(error));
	return reportError({
		level: 'error',
		message: err.message,
		stack: err.stack,
		url: context?.url,
		userId: context?.userId,
		metadata: context?.metadata
	});
}
