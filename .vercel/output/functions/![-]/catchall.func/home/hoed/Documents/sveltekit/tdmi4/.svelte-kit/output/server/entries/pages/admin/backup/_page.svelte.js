import { c as store_get, d as attr, u as unsubscribe_stores } from "../../../../chunks/index4.js";
import { p as page } from "../../../../chunks/stores.js";
import "../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { D as Download } from "../../../../chunks/download.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isLoading = false;
    let canCreateBackup = store_get($$store_subs ??= {}, "$page", page).data.canCreateBackup;
    $$renderer2.push(`<div class="space-y-4 p-6"><h1 class="text-2xl font-bold">Manajemen Backup Database</h1> <p class="text-gray-600">Buat dan unduh salinan lengkap dari database aplikasi. File backup akan berformat SQL dan dapat
		digunakan untuk memulihkan data jika terjadi masalah.</p> <div class="pt-4"><button type="button"${attr("disabled", !canCreateBackup || isLoading, true)} class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400">`);
    {
      $$renderer2.push("<!--[!-->");
      Download($$renderer2, { class: "mr-2 h-5 w-5" });
      $$renderer2.push(`<!----> <span>Buat &amp; Unduh Backup</span>`);
    }
    $$renderer2.push(`<!--]--></button></div> `);
    if (!canCreateBackup) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-sm text-red-600">Anda tidak memiliki izin untuk membuat backup. Silakan hubungi administrator.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
