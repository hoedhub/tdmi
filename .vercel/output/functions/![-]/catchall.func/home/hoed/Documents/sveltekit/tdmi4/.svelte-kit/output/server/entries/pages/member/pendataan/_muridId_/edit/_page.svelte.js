import { e as escape_html } from "../../../../../../chunks/escaping.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
import "../../../../../../chunks/muridModalStore.js";
import "../../../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import "compressorjs";
import "../../../../../../chunks/TableRowMobileCard.svelte_svelte_type_style_lang.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="card bg-base-100 shadow-xl"><div class="card-body"><h1 class="card-title text-2xl">Edit Data Murid: ${escape_html(data.murid?.nama ?? "Memuat...")}</h1> `);
    if (data.canWriteMurid) {
      $$renderer2.push("<!--[-->");
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="flex items-center justify-center p-8"><span class="loading loading-spinner loading-lg"></span> <p class="ml-4">Mempersiapkan form...</p></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-warning">Anda tidak memiliki izin untuk mengubah data murid ini.</p>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
