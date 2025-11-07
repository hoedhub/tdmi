import { d as attr, e as ensure_array_like } from "../../../../chunks/index4.js";
import "../../../../chunks/api.js";
import "../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let schedules = [];
    function formatDate(dateString) {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
    }
    $$renderer2.push(`<div class="container mx-auto p-4"><div class="mb-4 flex items-center justify-between"><h1 class="text-2xl font-bold">Manajemen Jadwal Ruasa'</h1> `);
    if (data.permissions.canWrite) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex gap-2"><a href="/admin/piket/susun" class="btn btn-secondary">Susun Jadwal Putaran</a> <button class="btn btn-primary">+ Tambah Jadwal</button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="overflow-x-auto rounded-lg bg-base-100 shadow"><table class="table w-full"><thead><tr><th>Pengguna</th><th>Grup</th><th>Mulai</th><th>Selesai</th><th>Keterangan</th>`);
    if (data.permissions.canWrite) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<th>Aksi</th>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></tr></thead><tbody>`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<tr><td${attr("colspan", data.permissions.canWrite ? 6 : 5)} class="text-center">Memuat data...</td></tr>`);
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    const each_array = ensure_array_like(schedules);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let schedule = each_array[$$index];
      $$renderer2.push(`<tr><td>${escape_html(schedule.username || "N/A")}</td><td>${escape_html(schedule.groupId || "-")}</td><td>${escape_html(formatDate(schedule.startDate))}</td><td>${escape_html(formatDate(schedule.endDate))}</td><td>${escape_html(schedule.description || "-")}</td>`);
      if (data.permissions.canWrite) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<td class="flex gap-2"><button class="btn btn-warning btn-sm">Edit</button> <button class="btn btn-error btn-sm">Hapus</button></td>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
