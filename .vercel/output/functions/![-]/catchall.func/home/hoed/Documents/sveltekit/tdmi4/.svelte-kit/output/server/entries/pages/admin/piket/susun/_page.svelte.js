import { h as head, d as attr, f as attr_class, e as ensure_array_like } from "../../../../../chunks/index4.js";
import { r as run } from "../../../../../chunks/legacy-server.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import "../../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { e as escape_html } from "../../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let selectedUserIds = /* @__PURE__ */ new Set();
    let periodCount = 12;
    let periodDuration = 1;
    let periodUnit = "months";
    let startDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let generatedSchedules = (
      // Properti baru untuk fitur kunci
      []
    );
    let currentStep = 1;
    let feedbackMessage = "";
    let isPristine = true;
    run(() => {
      const isStateDefault = selectedUserIds.size === 0 && periodCount === 12 && periodDuration === 1 && periodUnit === "months" && startDate === (/* @__PURE__ */ new Date()).toISOString().split("T")[0] && currentStep === 1;
      isPristine = isStateDefault;
    });
    run(() => {
      const numUsers = selectedUserIds.size;
      const numPeriods = periodCount;
      if (numUsers > 0 && numPeriods > 0) {
        if (numUsers < numPeriods) {
          feedbackMessage = `Informasi: ${numUsers} peserta akan didistribusikan ke ${numPeriods} periode. Beberapa peserta akan mendapat lebih dari satu giliran.`;
        } else if (numUsers > numPeriods) {
          feedbackMessage = `Informasi: ${numUsers} peserta akan didistribusikan ke ${numPeriods} periode. Beberapa periode akan memiliki lebih dari satu peserta.`;
        } else {
          feedbackMessage = "";
        }
      } else {
        feedbackMessage = "";
      }
    });
    generatedSchedules.every((s) => s.isLocked);
    generatedSchedules.filter((s) => !s.isLocked).every((s) => s.userIds.length === 0);
    run(() => {
    });
    run(() => {
    });
    head("145sj9j", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Susun Jadwal Piket</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen bg-base-200 p-4"><div class="container mx-auto"><div class="mb-6 flex flex-wrap items-center justify-between gap-4"><h1 class="text-3xl font-bold text-base-content">Susun Jadwal Piket Satu Putaran</h1> <button class="btn btn-outline gap-2"${attr("disabled", isPristine, true)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v-2.257a2.25 2.25 0 00-2.25-2.25H10.5a2.25 2.25 0 00-2.25 2.25v2.257m1.5-10.125a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-1.5h-2.25a.75.75 0 01-.75-.75v-1.5zm-2.25 9.75a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-1.5h-2.25a.75.75 0 01-.75-.75v-1.5z"></path></svg> Mulai Ulang</button></div> <div class="card bg-base-100 shadow-xl"><div class="card-body p-6"><ul class="steps mb-6"><li${attr_class("step", void 0, { "step-primary": currentStep >= 1 })}>Pengaturan</li> <li${attr_class("step", void 0, { "step-primary": currentStep >= 2 })}>Penyusunan</li> <li class="step">Simpan</li></ul> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-6"><div><h3 class="mb-3 font-semibold text-base-content">Pilih Pengguna untuk Putaran Ini <span class="ml-4 text-sm font-normal text-gray-500">(${escape_html(selectedUserIds.size)} member terpilih)</span></h3> <div class="rounded-lg border border-base-300 bg-base-200/30 p-4"><div class="mb-4 flex items-center"><input type="checkbox" id="selectAll" class="checkbox-primary checkbox"/> <label for="selectAll" class="ml-3 font-medium">Pilih Semua</label></div> <div class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"><!--[-->`);
      const each_array = ensure_array_like(data.users);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let user = each_array[$$index];
        $$renderer2.push(`<div><label class="flex cursor-pointer items-center"><input type="checkbox" class="checkbox"${attr("checked", selectedUserIds.has(user.id), true)}/> <span class="ml-3 text-base-content">${escape_html(user.username)}</span></label></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div> `);
      if (feedbackMessage) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex items-center gap-3 rounded-lg bg-base-200/60 p-3 text-sm text-base-content/80"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"></path></svg> <span>${escape_html(feedbackMessage)}</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="grid grid-cols-1 gap-6 md:grid-cols-3"><div class="form-control"><label for="periodCount" class="label"><span class="label-text">Jumlah Periode</span></label> <input type="number" id="periodCount" class="input input-bordered w-full"${attr("value", periodCount)} min="1"/></div> <div class="form-control"><label for="periodDuration" class="label"><span class="label-text">Durasi per Periode</span></label> <div class="join w-full"><input type="number" id="periodDuration" class="input join-item input-bordered w-1/3"${attr("value", periodDuration)} min="1"/> `);
      $$renderer2.select(
        {
          value: periodUnit,
          class: "join-item select select-bordered flex-1"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "days" }, ($$renderer4) => {
            $$renderer4.push(`Hari`);
          });
          $$renderer3.option({ value: "weeks" }, ($$renderer4) => {
            $$renderer4.push(`Minggu`);
          });
          $$renderer3.option({ value: "months" }, ($$renderer4) => {
            $$renderer4.push(`Bulan`);
          });
        }
      );
      $$renderer2.push(`</div></div> <div class="form-control"><label for="startDate" class="label"><span class="label-text">Tanggal Mulai Putaran</span></label> <input type="date" id="startDate" class="input input-bordered w-full"${attr("value", startDate)}/></div></div> <div class="card-actions mt-4 justify-end"><button class="btn btn-primary">Lanjut: Susun Jadwal</button></div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
