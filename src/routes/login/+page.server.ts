// routes/login/+page.server.ts
import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
// import { verify } from "@node-rs/argon2";
import type { PageServerLoad } from './$types';
// import { z } from 'zod';
// import { userSchema } from "$lib/zod/schema";
import { db } from '$lib/drizzle'
import { usersTable } from "$lib/drizzle/schema";
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import type { Actions } from "./$types";

export const load = (async ({ locals }) => {
    // let's get the session from the locals
    if (!locals.session) {
        return {};
    }

    redirect(303, '/');
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        try {
            const formData = await event.request.formData();
            const rawData = {
                username: formData.get("username") as string,
                password: formData.get("password") as string
            }

            // const validated = userSchema.parse(rawData)

            // 1. get the user from the database
            console.log('get the user from the database')
            const [user] = await db.select().from(usersTable).where(eq(usersTable.username, rawData.username));

            // 2. check if the user exists
            console.log('check if the user exists')
            if (!user) {
                console.log('user not found')
                return fail(400, {
                    msg: 'Invalid username or password'
                });
            }

            // 3. check if the password is correct
            console.log('check if the password is correct')
            const validPassword = await new Argon2id().verify(user.passwordHash!, rawData.password);
            if (!validPassword) {
                return fail(400, {
                    msg: 'Invalid username or password'
                });
            }

            // 4. create a session
            console.log('create a session')
            const session = await lucia.createSession(user.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes
            });
        } catch (error) {
            console.error(error);
            return fail(400);
        }
        redirect(302, "/");
    }
};