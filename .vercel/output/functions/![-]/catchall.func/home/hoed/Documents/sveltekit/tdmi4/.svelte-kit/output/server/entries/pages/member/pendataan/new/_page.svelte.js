import { r as run } from "../../../../../chunks/legacy-server.js";
import { e as error } from "../../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { f as attr_class, e as ensure_array_like, g as stringify, d as attr, l as bind_props, c as store_get, u as unsubscribe_stores } from "../../../../../chunks/index4.js";
import { e as escape_html } from "../../../../../chunks/escaping.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { m as muridModalStore } from "../../../../../chunks/muridModalStore.js";
import { o as onDestroy, t as tick } from "../../../../../chunks/x.js";
import "compressorjs";
import { C as Circle_user } from "../../../../../chunks/circle-user.js";
import { S as SuperTable } from "../../../../../chunks/SuperTable.js";
function SimilarMuridsAlert($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { similarMurids = [] } = $$props;
    if (similarMurids.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="card relative mb-4 border border-base-300/50 bg-base-200 shadow-sm"><div class="card-body p-4"><button type="button" class="btn btn-ghost btn-xs absolute right-2 top-2 z-10">✕</button> <div class="flex cursor-pointer items-center" role="button" tabindex="0"><h3 class="flex items-center gap-2 text-base font-semibold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${attr_class(`transition-transform duration-200 ${stringify("rotate-0")}`)}><polyline points="6 9 12 15 18 9"></polyline></svg> Nama Serupa Ditemukan</h3></div> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><p class="mb-3 mt-2 text-sm text-base-content/80">Ada ${escape_html(similarMurids.length)} nama yang mirip di database. Mungkin salah satunya adalah orang
						yang Anda cari?</p> <div class="max-h-40 overflow-y-auto rounded-lg border border-base-300/50 bg-base-100/60"><ul class="divide-y divide-base-300/50"><!--[-->`);
        const each_array = ensure_array_like(similarMurids);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let murid = each_array[$$index];
          $$renderer2.push(`<li class="flex items-center justify-between px-2 py-1.5 text-sm"><div><button type="button" class="text-left font-medium transition-colors hover:text-primary">${escape_html(murid.nama)}</button> `);
          if (murid.alamatLengkap) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<p class="mt-0.5 text-xs text-base-content/70">📍 ${escape_html(murid.alamatLengkap)}</p>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div> <button type="button" class="btn btn-outline btn-primary btn-xs ml-2 self-start">Edit</button></li>`);
        }
        $$renderer2.push(`<!--]--></ul></div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function PersonalInfoForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      formData = void 0,
      handleInput,
      handleArabicInput,
      similarMurids = [],
      onclose
    } = $$props;
    let compressionError = "";
    let photoRemoved = false;
    let displayUrl = formData.fotoUrl && !photoRemoved ? formData.fotoUrl : null;
    function reset() {
      photoRemoved = false;
      compressionError = "";
    }
    onDestroy(() => {
    });
    $$renderer2.push(`<fieldset class="space-y-4 rounded-lg border border-base-300 p-4"><legend class="px-2 text-lg font-semibold">Informasi Pribadi</legend> <div><label for="nama" class="label"><span class="label-text">Nama Lengkap (sesuai KTP, jangan disingkat dan tanpa gelar):</span></label> <div class="relative"><input id="nama" name="nama" type="text"${attr("value", formData.nama)}${attr_class(`input input-bordered w-full ${stringify("")}`)} required/> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-2">`);
    SimilarMuridsAlert($$renderer2, { similarMurids });
    $$renderer2.push(`<!----></div></div> <div><label for="namaArab" class="label"><span class="label-text">Nama Arab:</span></label> <input id="namaArab" name="namaArab" type="text"${attr("value", formData.namaArab)} class="input input-bordered w-full" dir="rtl" placeholder="أدخل الاسم بالعربية"/></div> <div class="form-control"><div class="label"><span class="label-text">Jenis Kelamin:</span></div> <div class="flex items-center gap-6 pt-1"><div class="flex items-center gap-2"><input type="radio" id="pria" name="gender"${attr("checked", formData.gender === true, true)}${attr("value", true)} class="radio"/> <label for="pria" class="label-text cursor-pointer">Pria</label></div> <div class="flex items-center gap-2"><input type="radio" id="wanita" name="gender"${attr("checked", formData.gender === false, true)}${attr("value", false)} class="radio"/> <label for="wanita" class="label-text cursor-pointer">Wanita</label></div></div></div> <div><label for="nik" class="label"><span class="label-text">NIK:</span></label> <input id="nik" type="text" name="nik" placeholder="16 Digit Nomor Induk Kependudukan (NIK)"${attr("value", formData.nik)}${attr("maxlength", 16)} class="input input-bordered w-full"/></div> `);
    if (formData.gender === true) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-2"><div class="label"><span class="label-text">Foto:</span></div> <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"><div class="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-base-200 shadow-sm">`);
      if (displayUrl) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<img${attr("src", displayUrl)} alt="Pratinjau Foto Murid" class="h-full w-full rounded-lg object-cover" crossorigin="anonymous"/>`);
      } else {
        $$renderer2.push("<!--[!-->");
        Circle_user($$renderer2, { class: "h-16 w-16 text-base-content/30" });
      }
      $$renderer2.push(`<!--]--></div> <div class="flex w-full flex-col gap-2 sm:grow"><input id="foto" name="foto" type="file" accept="image/*" class="file-input file-input-bordered w-full"/> `);
      if (displayUrl) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button type="button" class="btn btn-outline btn-error btn-sm">Hapus Foto</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div> `);
      if (compressionError) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="label-text-alt pt-2 text-error">${escape_html(compressionError)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <input type="hidden" name="removeFoto"${attr("value", photoRemoved)}/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div><label for="tglLahir" class="label"><span class="label-text">Tanggal Lahir:</span></label> <input id="tglLahir" name="tglLahir" type="date"${attr("value", formData.tglLahir)} class="input input-bordered w-full" required/></div></fieldset>`);
    bind_props($$props, { formData, reset });
  });
}
function PhoneInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = "",
      countryId = "",
      countryCode = "",
      phoneNumber = "",
      className = "",
      placeholder = "Enter phone number",
      disabled = false
    } = $$props;
    let countryCodes = [];
    let searchTerm = "";
    let filteredCountryCodes = [];
    async function resetCountryCode() {
      if (!countryCode) {
        countryId = "id";
        countryCode = "+62";
      }
    }
    run(() => {
      if (value === "") {
        phoneNumber = "";
        resetCountryCode();
      }
    });
    let selectedCountry = countryCodes.find((c) => c.id === countryId);
    run(() => {
      {
        filteredCountryCodes = countryCodes;
      }
    });
    $$renderer2.push(`<div${attr_class(`flex flex-wrap items-center gap-2 ${stringify(className)}`)}><div class="dropdown"><div class="tooltip"${attr("data-tip", selectedCountry?.country || "Select country code")}><button type="button" tabindex="0" class="select select-bordered w-[7rem] justify-between py-2 font-normal"><span>${escape_html(countryId.toUpperCase())}</span> <span>${escape_html(countryCode)}</span></button></div> <div role="menu" tabindex="0" class="dropdown-content z-[1] mt-2 w-64 rounded-box bg-base-100 p-2 shadow"><input type="text"${attr("value", searchTerm)} placeholder="Search country or code..." class="input input-sm input-bordered sticky top-0 w-full"/> <ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">`);
    if (filteredCountryCodes.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="menu-title px-4">No country found.</li>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(filteredCountryCodes);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let country = each_array[$$index];
      $$renderer2.push(`<li><button type="button"${attr_class("relative flex justify-between", void 0, { "font-bold": country.id === countryId })}><span class="flex-1 text-left">${escape_html(country.country)}</span> <span class="w-[4rem] text-right">${escape_html(country.code)}</span> `);
      if (country.id === countryId) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" class="h-4 w-4"><path fill="currentColor" d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"></path></svg>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div> <input type="tel"${attr("value", phoneNumber)}${attr("disabled", disabled, true)}${attr("placeholder", placeholder)} inputmode="numeric" class="input input-bordered w-48 min-w-full max-w-full flex-1 md:min-w-12"/></div>`);
    bind_props($$props, { value, countryId, countryCode, phoneNumber });
  });
}
function Wilayah($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      selectedPropinsi = null,
      selectedKokab = null,
      selectedKecamatan = null,
      deskelId = void 0,
      alamat = "",
      propinsiList = []
    } = $$props;
    let kokabList = [];
    let kecamatanList = [];
    let deskelList = [];
    let initialLoading = false;
    let propinsiSearchTerm = "";
    let kokabSearchTerm = "";
    let kecamatanSearchTerm = "";
    let deskelSearchTerm = "";
    let filteredPropinsiList = propinsiList;
    let filteredKokabList = kokabList;
    let filteredKecamatanList = kecamatanList;
    let filteredDeskelList = deskelList;
    $$renderer2.push(`<div class="space-y-4"><div><label for="propinsi" class="mb-1 block text-sm font-medium">Propinsi:</label> <div class="dropdown w-full"><button type="button" tabindex="0"${attr_class(`select select-bordered w-full justify-between py-2 font-normal normal-case ${stringify(!selectedPropinsi ? "text-base-content/60" : "")}`)}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(selectedPropinsi?.propinsi || "Pilih propinsi...")}`);
    }
    $$renderer2.push(`<!--]--></button> <div role="menu" tabindex="0" class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"><input type="text" placeholder="Cari propinsi..."${attr("value", propinsiSearchTerm)} class="input input-sm input-bordered sticky top-0 w-full"/> <ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        if (filteredPropinsiList.length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<li class="menu-title">Tidak ditemukan.</li>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(filteredPropinsiList);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let propinsi = each_array[$$index];
      $$renderer2.push(`<li><button type="button">${escape_html(propinsi.propinsi)} <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"${attr_class("ml-auto h-4 w-4 shrink-0", void 0, { "text-transparent": selectedPropinsi?.id !== propinsi.id })}><path fill="currentColor" d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"></path></svg></button></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div></div> <div><label for="kokab" class="mb-1 block text-sm font-medium">Kota/Kabupaten:</label> <div class="dropdown w-full"><button type="button" tabindex="0"${attr("disabled", !selectedPropinsi || initialLoading, true)}${attr_class(`select select-bordered w-full justify-between py-2 font-normal normal-case ${stringify(!selectedKokab ? "text-base-content/60" : "")}`)}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(selectedKokab?.kokab || "Pilih kota/kabupaten...")}`);
    }
    $$renderer2.push(`<!--]--></button> <div role="menu" tabindex="0" class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"><input type="text" placeholder="Cari kota/kabupaten..."${attr("value", kokabSearchTerm)} class="input input-sm input-bordered sticky top-0 w-full"/> <ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        if (!selectedPropinsi) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<li class="menu-title">Pilih propinsi dahulu.</li>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (filteredKokabList.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<li class="menu-title">Tidak ditemukan.</li>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array_1 = ensure_array_like(filteredKokabList);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let kokab = each_array_1[$$index_1];
      $$renderer2.push(`<li><button type="button">${escape_html(kokab.kokab)} <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"${attr_class("ml-auto h-4 w-4 shrink-0", void 0, { "text-transparent": selectedKokab?.id !== kokab.id })}><path fill="currentColor" d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"></path></svg></button></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div></div> <div><label for="kecamatan" class="mb-1 block text-sm font-medium">Kecamatan:</label> <div class="dropdown w-full"><button type="button" tabindex="0"${attr("disabled", !selectedKokab || initialLoading, true)}${attr_class(`select select-bordered w-full justify-between py-2 font-normal normal-case ${stringify(!selectedKecamatan ? "text-base-content/60" : "")}`)}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(selectedKecamatan?.kecamatan || "Pilih kecamatan...")}`);
    }
    $$renderer2.push(`<!--]--></button> <div role="menu" tabindex="0" class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"><input type="text" placeholder="Cari kecamatan..."${attr("value", kecamatanSearchTerm)} class="input input-sm input-bordered sticky top-0 w-full"/> <ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        if (!selectedKokab) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<li class="menu-title">Pilih kota/kabupaten dahulu.</li>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (filteredKecamatanList.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<li class="menu-title">Tidak ditemukan.</li>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array_2 = ensure_array_like(filteredKecamatanList);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let kecamatan = each_array_2[$$index_2];
      $$renderer2.push(`<li><button type="button">${escape_html(kecamatan.kecamatan)} <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"${attr_class("ml-auto h-4 w-4 shrink-0", void 0, { "text-transparent": selectedKecamatan?.id !== kecamatan.id })}><path fill="currentColor" d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"></path></svg></button></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div></div> <div><label for="deskel" class="mb-1 block text-sm font-medium">Desa/Kelurahan:</label> <div class="dropdown w-full"><button type="button" tabindex="0"${attr("disabled", !selectedKecamatan || initialLoading, true)}${attr_class(`select select-bordered w-full justify-between py-2 font-normal normal-case ${stringify(!deskelId ? "text-base-content/60" : "")}`)}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(deskelList.find((d) => d.id === deskelId)?.deskel || "Pilih desa/kelurahan...")}`);
    }
    $$renderer2.push(`<!--]--></button> <div role="menu" tabindex="0" class="dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow"><input type="text" placeholder="Cari desa/kelurahan..."${attr("value", deskelSearchTerm)} class="input input-sm input-bordered sticky top-0 w-full"/> <ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        if (!selectedKecamatan) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<li class="menu-title">Pilih kecamatan dahulu.</li>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (filteredDeskelList.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<li class="menu-title">Tidak ditemukan.</li>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array_3 = ensure_array_like(filteredDeskelList);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let deskel = each_array_3[$$index_3];
      $$renderer2.push(`<li><button type="button">${escape_html(deskel.deskel)} <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"${attr_class("ml-auto h-4 w-4 shrink-0", void 0, { "text-transparent": deskelId !== deskel.id })}><path fill="currentColor" d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"></path></svg></button></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div></div> <div><label for="alamat" class="mb-1 block text-sm font-medium">Alamat:</label> <textarea id="alamat" class="textarea textarea-bordered w-full" placeholder="Dusun, nama jalan, RT/RW, dll." rows="2">`);
    const $$body = escape_html(alamat);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div></div>`);
    bind_props($$props, {
      selectedPropinsi,
      selectedKokab,
      selectedKecamatan,
      deskelId,
      alamat,
      propinsiList
    });
  });
}
function ContactForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      formData = void 0,
      selectedPropinsi,
      selectedKokab,
      selectedKecamatan,
      handleInput,
      handleWilayahChange,
      countryId = void 0,
      countryCode = void 0,
      phoneNumber = void 0,
      propinsiList = []
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<fieldset class="space-y-4 rounded-lg border border-base-300 p-4"><legend class="px-2 font-semibold">Kontak dan Alamat</legend> `);
      Wilayah($$renderer3, {
        propinsiList,
        selectedPropinsi,
        selectedKokab,
        selectedKecamatan,
        deskelId: formData.deskelId,
        alamat: formData.alamat
      });
      $$renderer3.push(`<!----> <input type="hidden" name="deskelId"${attr("value", formData.deskelId)}/> <input type="hidden" name="alamat"${attr("value", formData.alamat)}/> `);
      if (formData.gender) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div><label for="nomor-telepon">Nomor Telepon</label> `);
        PhoneInput($$renderer3, {
          placeholder: "Nomor Telepon",
          get countryId() {
            return countryId;
          },
          set countryId($$value) {
            countryId = $$value;
            $$settled = false;
          },
          get countryCode() {
            return countryCode;
          },
          set countryCode($$value) {
            countryCode = $$value;
            $$settled = false;
          },
          get phoneNumber() {
            return phoneNumber;
          },
          set phoneNumber($$value) {
            phoneNumber = $$value;
            $$settled = false;
          },
          get value() {
            return formData.nomorTelepon;
          },
          set value($$value) {
            formData.nomorTelepon = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div> <input type="hidden" name="nomorTelepon"${attr("value", formData.nomorTelepon)}/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></fieldset>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { formData, countryId, countryCode, phoneNumber });
  });
}
function MuridModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { showModal = false, editedMuridId = void 0 } = $$props;
    let pageSize = 5;
    let currentPage = 1;
    let currentSort = void 0;
    let currentFilters = { columns: {} };
    const columns = [
      {
        key: "nama",
        label: "Nama",
        sortable: true,
        filterable: "text"
      },
      {
        key: "gender",
        label: "Gender",
        sortable: true,
        filterable: "select",
        filterOptions: ["Pria", "Wanita"],
        formatter: (v) => v ? "Pria" : "Wanita"
      },
      {
        key: "deskelName",
        label: "Desa/Kelurahan",
        sortable: true,
        filterable: "text"
      },
      {
        key: "kecamatanName",
        label: "Kecamatan",
        sortable: true,
        filterable: "text"
      }
    ];
    let prevShowModal = showModal;
    run(() => {
      if (showModal && !prevShowModal) {
        muridModalStore.loadDataIfNeeded(currentSort, currentFilters, currentPage, pageSize, editedMuridId);
        tick().then(() => {
        });
      }
      prevShowModal = showModal;
    });
    if (showModal) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal modal-open"><div class="modal-box w-11/12 max-w-5xl"><h3 class="text-lg font-bold">Pilih Murid</h3> <div class="py-4">`);
      SuperTable($$renderer2, {
        columns,
        data: store_get($$store_subs ??= {}, "$muridModalStore", muridModalStore).muridData,
        rowKey: "id",
        itemsPerPageProp: pageSize,
        totalItemsProp: store_get($$store_subs ??= {}, "$muridModalStore", muridModalStore).totalItems,
        isLoadingProp: store_get($$store_subs ??= {}, "$muridModalStore", muridModalStore).loading,
        sort: currentSort,
        serverSide: true,
        selectionMode: "single",
        dbError: store_get($$store_subs ??= {}, "$muridModalStore", muridModalStore).hasDbError,
        disabledRowKeys: editedMuridId ? [editedMuridId] : [],
        $$slots: {
          "error-state": ($$renderer3) => {
            {
              $$renderer3.push(`<div class="p-8 text-center text-error"><p>Tidak dapat memuat data.</p> <button class="btn btn-outline btn-sm mt-4">Coba Lagi</button></div>`);
            }
          },
          "bulk-actions": ($$renderer3) => {
            $$renderer3.push(`<div slot="bulk-actions"></div>`);
          }
        }
      });
      $$renderer2.push(`<!----></div> <div class="modal-action"><button class="btn">Tutup</button></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function RelatedMurid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      className = "",
      placeholder = "Pilih murid",
      disabled = false,
      initialData = null,
      editedMuridId = void 0
    } = $$props;
    let showModal = false;
    let selectedMurid = null;
    run(() => {
      selectedMurid = initialData || null;
    });
    $$renderer2.push(`<div${attr_class(`flex items-center gap-2 ${stringify(className)}`)}><div class="w-full"><button type="button" class="btn btn-outline w-full justify-start"${attr("disabled", disabled, true)}>`);
    if (selectedMurid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="truncate">${escape_html(selectedMurid.nama)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(placeholder)}`);
    }
    $$renderer2.push(`<!--]--></button></div> `);
    if (selectedMurid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button type="button" class="btn btn-circle btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span class="sr-only">Clear selection</span></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    MuridModal($$renderer2, { showModal, editedMuridId });
    $$renderer2.push(`<!---->`);
  });
}
function IrsyadiyahForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { formData = void 0, handleInput, editedMuridId = void 0 } = $$props;
    $$renderer2.push(`<fieldset class="space-y-4 rounded-lg border border-base-300 p-4"><legend class="px-2 font-semibold">Irsyadiyah</legend> `);
    if (formData.gender === false) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div><label for="muhrim">Muhrim</label> `);
      RelatedMurid($$renderer2, {
        placeholder: "Pilih murid terkait",
        initialData: formData.muhrimId && formData.muhrimData ? { id: formData.muhrimId, nama: formData.muhrimData.nama } : void 0,
        editedMuridId
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div><label for="mursyid">Mursyid${escape_html(formData.gender ? "" : "ah")}</label> `);
    RelatedMurid($$renderer2, {
      placeholder: "Pilih murid terkait",
      initialData: formData.mursyidId && formData.mursyidData ? { id: formData.mursyidId, nama: formData.mursyidData.nama } : void 0,
      editedMuridId
    });
    $$renderer2.push(`<!----></div> <div><label for="baiat">Baiat</label> `);
    RelatedMurid($$renderer2, {
      placeholder: "Pilih murid terkait",
      initialData: formData.baiatId && formData.baiatData ? { id: formData.baiatId, nama: formData.baiatData.nama } : void 0,
      editedMuridId
    });
    $$renderer2.push(`<!----></div> <div><label for="wirid">Wirid</label> `);
    RelatedMurid($$renderer2, {
      placeholder: "Pilih murid terkait",
      initialData: formData.wiridId && formData.wiridData ? { id: formData.wiridId, nama: formData.wiridData.nama } : void 0,
      editedMuridId
    });
    $$renderer2.push(`<!----></div> <input type="hidden" name="muhrimId"${attr("value", formData.muhrimId || "")}/> <input type="hidden" name="mursyidId"${attr("value", formData.mursyidId || "")}/> <input type="hidden" name="baiatId"${attr("value", formData.baiatId || "")}/> <input type="hidden" name="wiridId"${attr("value", formData.wiridId || "")}/></fieldset>`);
    bind_props($$props, { formData });
  });
}
function StatusForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { formData = void 0, handleInput } = $$props;
    $$renderer2.push(`<fieldset class="space-y-4 rounded-lg border border-base-300 p-4"><legend class="px-2 text-lg font-semibold">Status Murid</legend> <div class="form-control"><div class="label"><span class="label-text">Status Baca al-Qur'an:</span></div> <div class="flex items-center gap-6 pt-1"><div class="tooltip" data-tip="Bisa baca al-Qur'an"><div class="flex items-center gap-2"><input type="radio" id="qari" name="qari"${attr("checked", formData.qari === true, true)}${attr("value", true)} class="radio"/> <label for="qari" class="label-text cursor-pointer">Qāri'${escape_html(formData.gender ? "" : "ah")}</label></div></div> <div class="tooltip" data-tip="Tidak bisa baca al-Qur'an"><div class="flex items-center gap-2"><input type="radio" id="ghairu-qari" name="qari"${attr("checked", formData.qari === false, true)}${attr("value", false)} class="radio"/> <label for="ghairu-qari" class="label-text cursor-pointer">Ghairu Qāri'${escape_html(formData.gender ? "" : "ah")}</label></div></div></div></div> <div><label for="marhalah" class="label"><span class="label-text">Marhalah</span></label> `);
    $$renderer2.select(
      {
        id: "marhalah",
        name: "marhalah",
        oninput: handleInput,
        value: formData.marhalah,
        class: "select select-bordered w-full",
        required: true
      },
      ($$renderer3) => {
        $$renderer3.option({ value: 1 }, ($$renderer4) => {
          $$renderer4.push(`1`);
        });
        $$renderer3.option({ value: 2 }, ($$renderer4) => {
          $$renderer4.push(`2`);
        });
        $$renderer3.option({ value: 3 }, ($$renderer4) => {
          $$renderer4.push(`3`);
        });
      }
    );
    $$renderer2.push(`</div> <div class="form-control"><label class="label w-fit cursor-pointer gap-2" for="aktif"><input type="checkbox" id="aktif" name="aktif"${attr("checked", formData.aktif, true)} class="checkbox"/> <span class="label-text">Aktif</span></label></div> <div class="form-control"><label class="label w-fit cursor-pointer gap-2" for="partisipasi"><div class="tooltip" data-tip="Partisipasi dalam khidmah/nafhah"><input type="checkbox" id="partisipasi" name="partisipasi"${attr("checked", formData.partisipasi, true)} class="checkbox"/> <span class="label-text">Partisipasi</span></div></label></div></fieldset>`);
    bind_props($$props, { formData });
  });
}
function AddMuridForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      propinsiList = [],
      editedMuridId = void 0
    } = $$props;
    let countryId = void 0;
    let countryCode = void 0;
    let phoneNumber = void 0;
    const defaultFormData = {
      nama: "",
      namaArab: "",
      gender: true,
      deskelId: void 0,
      alamat: "",
      nomorTelepon: "",
      muhrimId: void 0,
      mursyidId: void 0,
      baiatId: void 0,
      wiridId: void 0,
      muhrimData: void 0,
      mursyidData: void 0,
      baiatData: void 0,
      wiridData: void 0,
      qari: true,
      marhalah: 1,
      tglLahir: "",
      aktif: true,
      partisipasi: true,
      nik: "",
      foto: void 0
    };
    let internalFormData = { ...defaultFormData };
    let selectedPropinsi = null;
    let selectedKokab = null;
    let selectedKecamatan = null;
    let isSubmitting = false;
    let similarMurids = [];
    function handleInput() {
      setTimeout(
        () => {
          return;
        },
        0
      );
    }
    function handleWilayahChange(event) {
      const {
        selectedPropinsi: newPropinsi,
        selectedKokab: newKokab,
        selectedKecamatan: newKecamatan,
        deskelId,
        alamat
      } = event.detail;
      selectedPropinsi = newPropinsi;
      selectedKokab = newKokab;
      selectedKecamatan = newKecamatan;
      internalFormData.deskelId = deskelId;
      internalFormData.alamat = alamat;
      handleInput();
    }
    function handleArabicInput(event) {
      const input = event.target;
      const arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9 .,!?»«()]+$/;
      if (!arabicPattern.test(input.value)) {
        const newValue = input.value.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9 .,!?»«()]/g, "");
        input.value = newValue;
        internalFormData.namaArab = newValue;
        handleInput();
      }
    }
    run(() => {
    });
    $$renderer2.push(`<form method="POST" enctype="multipart/form-data" class="space-y-6">`);
    PersonalInfoForm($$renderer2, {
      formData: internalFormData,
      handleInput,
      handleArabicInput,
      similarMurids,
      onclose: () => similarMurids = []
    });
    $$renderer2.push(`<!----> `);
    ContactForm($$renderer2, {
      propinsiList,
      formData: internalFormData,
      selectedPropinsi,
      selectedKokab,
      selectedKecamatan,
      handleInput,
      handleWilayahChange,
      countryId,
      countryCode,
      phoneNumber
    });
    $$renderer2.push(`<!----> `);
    IrsyadiyahForm($$renderer2, { formData: internalFormData, handleInput, editedMuridId });
    $$renderer2.push(`<!----> `);
    if (internalFormData.muhrimData) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<input type="hidden" name="muhrimData"${attr("value", JSON.stringify(internalFormData.muhrimData))}/>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (internalFormData.mursyidData) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<input type="hidden" name="mursyidData"${attr("value", JSON.stringify(internalFormData.mursyidData))}/>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (internalFormData.baiatData) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<input type="hidden" name="baiatData"${attr("value", JSON.stringify(internalFormData.baiatData))}/>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (internalFormData.wiridData) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<input type="hidden" name="wiridData"${attr("value", JSON.stringify(internalFormData.wiridData))}/>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    StatusForm($$renderer2, { formData: internalFormData, handleInput });
    $$renderer2.push(`<!----> <div class="sticky bottom-0 flex w-full space-x-2 bg-white/20 p-2 backdrop-blur-xl backdrop-saturate-150 dark:bg-gray-800/20 dark:backdrop-brightness-125">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <button type="button"${attr("disabled", isSubmitting, true)} class="btn btn-warning grow rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">Batal</button> <button type="submit" name="action" value="save-and-close"${attr("disabled", isSubmitting, true)} class="btn btn-primary grow rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">${escape_html("Simpan & Tutup")}</button> <button type="submit" name="action" value="save-and-add"${attr("disabled", isSubmitting, true)} class="btn btn-secondary grow rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">${escape_html("Simpan & Tambah Lagi")}</button></div></form>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, form } = $$props;
    run(() => {
      if (form?.message && !form?.success) {
        error(form.message);
      }
    });
    run(() => {
      if (form?.success && form?.message) ;
    });
    $$renderer2.push(`<div class="card bg-base-100 shadow-xl"><div class="card-body"><h1 class="card-title text-2xl">Tambah Murid Baru</h1> `);
    AddMuridForm($$renderer2, { propinsiList: data.propinsiList });
    $$renderer2.push(`<!----></div></div>`);
  });
}
export {
  _page as default
};
