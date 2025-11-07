import { l as lucia } from "../../../../chunks/auth.js";
import { error, json } from "@sveltejs/kit";
const POST = async ({ locals, cookies }) => {
  if (!locals.session) {
    throw error(401, "Unauthorized");
  }
  try {
    await lucia.invalidateSession(locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    return json({ success: true });
  } catch (e) {
    console.error("Gagal melakukan logout:", e);
    throw error(500, "Terjadi kesalahan saat mencoba logout. Silakan coba lagi.");
  }
};
export {
  POST
};
