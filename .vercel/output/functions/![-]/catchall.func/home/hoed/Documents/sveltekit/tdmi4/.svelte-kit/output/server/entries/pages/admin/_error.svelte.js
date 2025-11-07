function _error($$renderer) {
  $$renderer.push(`<div class="error-container svelte-17nr8gh"><h1 class="svelte-17nr8gh">Error</h1> <p class="svelte-17nr8gh">An unexpected error occurred.</p> `);
  {
    $$renderer.push("<!--[!-->");
    $$renderer.push(`<a href="/">Kembali ke Beranda</a>`);
  }
  $$renderer.push(`<!--]--></div>`);
}
export {
  _error as default
};
