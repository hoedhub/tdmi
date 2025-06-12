// src/lib/server/auth.ts
import { Lucia } from "lucia";
import { dev } from "$app/environment";
import { config } from 'dotenv';
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client"; // Or your Turso client setup
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { usersTable, sessionTable, type userRoles } from "../drizzle/schema"; // Adjust path to your schema file
import * as schema from '../drizzle/schema';

config({ path: '.env' });

// Initialize your Turso client
const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client, { schema });

// Pass your Drizzle instance and table definitions to the adapter
const adapter = new DrizzleSQLiteAdapter(db, sessionTable, usersTable);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: !dev
        }
    },
    getUserAttributes: (attributes) => {
        return {
            // attributes has the type of DatabaseUserAttributes
            // Add any user attributes you want to access in session.user
            // e.g., 
            id: attributes.id, // Lucia usually handles id, but good to be explicit if needed
            username: attributes.username,
            role: attributes.role,
            active: attributes.active,
            muridId: attributes.muridId
            // email: attributes.email
        };
    },
    getSessionAttributes: (attributes) => {
        return {}; // Add any session attributes if needed
    }
});

// IMPORTANT! Declare your Lucia instance type
declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes; // Define below
        DatabaseSessionAttributes: DatabaseSessionAttributes; // Define below
    }
}

// Assuming your usersTable has at least an 'id' column (string)
// and any other attributes you need.
interface DatabaseUserAttributes {
    id: string; // Already defined by Lucia if it's named 'id'
    // Add other user attributes from your usersTable schema that you want typed
    // e.g., 
    username: string;
    role: (typeof userRoles)[number]; // Use the type from your schema
    active: boolean | null; // Or boolean if not nullable. Based on your schema: integer('active', { mode: 'boolean' }) can be true, false, or null if not .notNull()
    muridId: number;
    // email: string;
}

// Your existing sessionTable schema matches Lucia's requirements closely.
// If you had custom columns in sessionTable you want to type, add them here.
interface DatabaseSessionAttributes {
    // e.g. ip_address: string;
}