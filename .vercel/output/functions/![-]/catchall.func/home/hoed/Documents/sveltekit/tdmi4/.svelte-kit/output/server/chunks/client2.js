import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import { w as writable } from "./index3.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
function create_updated_store() {
  const { set, subscribe } = writable(false);
  {
    return {
      subscribe,
      // eslint-disable-next-line @typescript-eslint/require-await
      check: async () => false
    };
  }
}
const stores = {
  updated: /* @__PURE__ */ create_updated_store()
};
function invalidateAll() {
  {
    throw new Error("Cannot call invalidateAll() on the server");
  }
}
export {
  invalidateAll as i,
  stores as s
};
