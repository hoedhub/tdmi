import { h as head, d as attr } from "../../../chunks/index4.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("1x05zx6", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Login | TDMI</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Login to your TDMI account"/>`);
    });
    $$renderer2.push(`<div class="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4"><div class="w-full max-w-md"><div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title mb-6 justify-center text-2xl">Login</h2></div></div> <div class="mt-8 text-center text-sm text-base-content/60"><p>© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} TDMI. All rights reserved.</p> <div class="mt-2"><label class="label inline-flex cursor-pointer gap-2"><span class="label-text">Toggle Dark Mode</span> <input type="checkbox" class="toggle toggle-primary"${attr("checked", true, true)}/></label></div></div></div></div>`);
  });
}
export {
  _page as default
};
