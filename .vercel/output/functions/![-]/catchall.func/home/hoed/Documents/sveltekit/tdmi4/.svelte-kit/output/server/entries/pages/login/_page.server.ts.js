import { l as lucia } from "../../../chunks/auth.js";
import { redirect, fail } from "@sveltejs/kit";
import { d as db, u as usersTable } from "../../../chunks/index.js";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
const load = async ({ locals }) => {
  if (locals.session) {
    console.log("[LOGIN LOAD] User already has session, redirecting to /member");
    redirect(303, "/member");
  }
  console.log("[LOGIN LOAD] No session, showing login page.");
  return {};
};
const actions = {
  default: async (event) => {
    console.log("[LOGIN ACTION] Action started.");
    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");
    if (!username || !password) {
      console.log("[LOGIN ACTION] Username or password missing.");
      return fail(400, { msg: "Username and password are required.", username });
    }
    try {
      console.log(`[LOGIN ACTION] Attempting to find user: ${username}`);
      const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
      if (!user) {
        console.log("[LOGIN ACTION] User not found.");
        return fail(400, { msg: "Invalid username or password.", username });
      }
      console.log("[LOGIN ACTION] User found.");
      if (!user.passwordHash) {
        console.error(`[LOGIN ACTION] User ${username} does not have a password hash.`);
        return fail(500, { msg: "Login configuration error." });
      }
      console.log("[LOGIN ACTION] Verifying password.");
      const validPassword = await new Argon2id().verify(user.passwordHash, password);
      if (!validPassword) {
        console.log("[LOGIN ACTION] Invalid password.");
        return fail(400, { msg: "Invalid username or password.", username });
      }
      console.log("[LOGIN ACTION] Password valid.");
      console.log("[LOGIN ACTION] Creating session.");
      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });
      console.log("[LOGIN ACTION] Session cookie set.");
    } catch (error) {
      console.error("[LOGIN ACTION] UNEXPECTED ERROR in try block:", error);
      return fail(500, { msg: "An internal server error occurred during login." });
    }
    try {
      console.log("[LOGIN ACTION] !!! ATTEMPTING REDIRECT TO /member !!!");
      const redirObject = redirect(303, "/member");
      console.log("[LOGIN ACTION] Created redirect object, now throwing it.", redirObject);
      throw redirObject;
    } catch (e) {
      console.log("[LOGIN ACTION] !!! REDIRECT THREW AN ERROR (this is expected) !!!", e);
      if (e && typeof e.status === "number" && e.status >= 300 && e.status <= 399 && typeof e.location === "string") {
        console.log("[LOGIN ACTION] Redirect error looks like a SvelteKit redirect. Re-throwing.");
        throw e;
      } else {
        console.error("[LOGIN ACTION] Redirect threw an unexpected error type:", e);
        throw e;
      }
    }
  }
};
export {
  actions,
  load
};
