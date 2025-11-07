import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<h1>Halaman Nasyath</h1> <p>${escape_html(data.message)}</p> <p>Halaman ini hanya bisa diakses oleh pengguna dengan peran Nasyath atau peran di atasnya (Admin,
	Naib, dll).</p>`);
  });
}
export {
  _page as default
};
