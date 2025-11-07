import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { d as db, s as sessionTable, u as usersTable } from "./index.js";
const adapter = new DrizzleSQLiteAdapter(db, sessionTable, usersTable);
const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: true
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
    return {};
  }
});
export {
  lucia as l
};
