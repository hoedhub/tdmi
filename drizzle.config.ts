import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
	schema: './src/lib/drizzle/schema.ts',
	out: './src/lib/drizzle/migrations',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!
	}
});
