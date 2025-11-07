import { e as escape_html } from "../../../chunks/escaping.js";
import { p as page } from "../../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="p-4"><h1 class="text-2xl font-bold">Selamat datang, ${escape_html(page.data.user.username)}!</h1> <p>Silakan pilih halaman dari sidebar untuk memulai.</p></div>`);
  });
}
export {
  _page as default
};
