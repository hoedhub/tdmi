// src/lib/server/auth.ts
import { Lucia } from "lucia";
import { dev } from "$app/environment";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { usersTable, sessionTable } from "../drizzle/schema";
import { db } from "$lib/drizzle"; // <-- IMPORT the existing, correct db instance

// The adapter now uses the centralized db instance, ensuring one correct connection.
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
            id: attributes.id,
            username: attributes.username,
            active: attributes.active,
            muridId: attributes.muridId
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
        DatabaseUserAttributes: DatabaseUserAttributes;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
    }
}

// Define and export DatabaseUserAttributes
export interface DatabaseUserAttributes {
    id: string;
    username: string;
    active: boolean | null;
    muridId: number | null;
}

// Your existing sessionTable schema matches Lucia's requirements closely.
// If you had custom columns in sessionTable you want to type, add them here.
interface DatabaseSessionAttributes {
    // e.g. ip_address: string;
}
