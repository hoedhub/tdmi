import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import _fetch from 'fetch-retry';
import type { RequestInfo, RequestInit, Response } from 'node-fetch';


config({ path: '.env' }); // or .env.local

// Configure fetch to retry on failure
const fetchWithRetry = _fetch(global.fetch as any, {
    retries: 3, // Retry 3 times
    retryDelay: function(attempt) {
        // Use exponential backoff for delay
        return Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
    },
    retryOn: [500, 503, 504] // Retry on server errors and timeouts
}) as (url: RequestInfo, init?: RequestInit) => Promise<Response>;


const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
    fetch: fetchWithRetry
});

// Create the database instance
export const db = drizzle(client, { schema });
