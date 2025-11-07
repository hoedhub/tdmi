import { d as attr } from "../../../../../../chunks/index4.js";
import { e as escape_html } from "../../../../../../chunks/escaping.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
import "../../../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { S as Save } from "../../../../../../chunks/save.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, form } = $$props;
    let isLoading = false;
    function formatDateForInput(dateString) {
      if (!dateString) return "";
      return dateString.split("T")[0];
    }
    let kegiatan = form?.data?.kegiatan ?? data.nasyath.kegiatan;
    let tanggalMulai = formatDateForInput(form?.data?.tanggalMulai ?? data.nasyath.tanggalMulai);
    let tanggalSelesai = formatDateForInput(form?.data?.tanggalSelesai ?? data.nasyath.tanggalSelesai);
    let durasi = form?.data?.durasi ?? data.nasyath.durasi;
    let jarak = form?.data?.jarak ?? data.nasyath.jarak;
    let tempat = form?.data?.tempat ?? data.nasyath.tempat;
    let namaKontak = form?.data?.namaKontak ?? data.nasyath.namaKontak;
    let teleponKontak = form?.data?.teleponKontak ?? data.nasyath.teleponKontak;
    let keterangan = form?.data?.keterangan ?? data.nasyath.keterangan;
    $$renderer2.push(`<div class="container mx-auto max-w-2xl p-4" dir="rtl"><h1 class="mb-6 text-2xl font-bold">تحرير نشاط اﻷعضاء</h1> `);
    if (form?.message && !isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="alert alert-error mb-4"><span>${escape_html(form.message)}</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <form method="POST" class="space-y-4"><div class="form-control"><label for="kegiatan" class="label"><span class="label-text">اسم النشاط</span></label> <input type="text" id="kegiatan" name="kegiatan" class="input input-bordered w-full" required${attr("value", kegiatan)}/></div> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div class="form-control"><label for="tanggalMulai" class="label"><span class="label-text">تاريخ البدء</span></label> <input type="date" id="tanggalMulai" name="tanggalMulai" class="input input-bordered w-full"${attr("value", tanggalMulai)}/></div> <div class="form-control"><label for="tanggalSelesai" class="label"><span class="label-text">تاريخ الانتهاء</span></label> <input type="date" id="tanggalSelesai" name="tanggalSelesai" class="input input-bordered w-full"${attr("value", tanggalSelesai)}/></div></div> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div class="form-control"><label for="durasi" class="label"><span class="label-text">المدة</span></label> <input type="text" id="durasi" name="durasi" class="input input-bordered w-full" placeholder="Contoh: 3 jam"${attr("value", durasi)}/></div> <div class="form-control"><label for="jarak" class="label"><span class="label-text">المسافة</span></label> <input type="text" id="jarak" name="jarak" class="input input-bordered w-full" placeholder="Contoh: 10 km"${attr("value", jarak)}/></div></div> <div class="form-control"><label for="tempat" class="label"><span class="label-text">مكان التنفيذ</span></label> <input type="text" id="tempat" name="tempat" class="input input-bordered w-full"${attr("value", tempat)}/></div> <div class="grid grid-cols-1 gap-4 md:grid-cols-2"><div class="form-control"><label for="namaKontak" class="label"><span class="label-text">اسم جهة الاتصال</span></label> <input type="text" id="namaKontak" name="namaKontak" class="input input-bordered w-full"${attr("value", namaKontak)}/></div> <div class="form-control"><label for="teleponKontak" class="label"><span class="label-text">هاتف جهة الاتصال</span></label> <input type="tel" id="teleponKontak" name="teleponKontak" class="input input-bordered w-full"${attr("value", teleponKontak)}/></div></div> <div class="form-control"><label for="keterangan" class="label"><span class="label-text">ملاحظات</span></label> <textarea id="keterangan" name="keterangan" class="textarea textarea-bordered w-full" rows="3">`);
    const $$body = escape_html(keterangan);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div class="flex justify-end space-x-2 pt-4"><a href="/member/nasyath_mun" class="btn btn-ghost">Batal</a> <button type="submit" class="btn btn-primary"${attr("disabled", isLoading, true)}>`);
    {
      $$renderer2.push("<!--[!-->");
      Save($$renderer2, { class: "mr-2 h-5 w-5" });
      $$renderer2.push(`<!----> Simpan Perubahan`);
    }
    $$renderer2.push(`<!--]--></button></div></form></div>`);
  });
}
export {
  _page as default
};
