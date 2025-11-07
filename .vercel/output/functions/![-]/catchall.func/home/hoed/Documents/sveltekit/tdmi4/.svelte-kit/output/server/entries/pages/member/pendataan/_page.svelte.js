import { d as attr } from "../../../../chunks/index4.js";
import { r as run } from "../../../../chunks/legacy-server.js";
import { i as invalidateAll } from "../../../../chunks/client2.js";
import { S as SuperTable } from "../../../../chunks/SuperTable.js";
import "../../../../chunks/api.js";
import "../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { C as Circle_plus } from "../../../../chunks/circle-plus.js";
import { P as Pen, T as Trash } from "../../../../chunks/trash.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, form } = $$props;
    let muridData = [];
    let totalItems = data.totalItems;
    let loading = false;
    let pageSize = 10;
    let currentSort = void 0;
    data.canReadMurid;
    let canWriteMurid = data.canWriteMurid;
    function calculateAge(tglLahir) {
      if (!tglLahir) return null;
      const birthDate = new Date(tglLahir);
      const today = /* @__PURE__ */ new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) {
        age--;
      }
      return age;
    }
    let columns = [
      {
        key: "nama",
        label: "Nama",
        sortable: true,
        filterable: "text"
      },
      {
        key: "namaArab",
        label: "Nama Arab",
        sortable: true,
        filterable: "text"
      },
      {
        key: "gender",
        label: "Gender",
        sortable: true,
        filterable: "select",
        filterOptions: ["Pria", "Wanita"],
        formatter: (value) => value ? "Pria" : "Wanita"
      },
      {
        key: "tglLahir",
        label: "Umur",
        sortable: true,
        formatter: (value) => {
          const age = calculateAge(value);
          return age !== null ? `${age} tahun` : "-";
        }
      },
      {
        key: "marhalah",
        label: "Marhalah",
        sortable: true,
        filterable: "select",
        filterOptions: ["1", "2", "3"],
        formatter: (value) => value.toString()
      },
      {
        key: "nomorTelepon",
        label: "Telepon",
        sortable: true,
        filterable: "text"
      },
      {
        key: "alamat",
        label: "Alamat",
        sortable: true,
        filterable: "text",
        formatter: (value, row) => {
          return [
            value,
            row.deskelName,
            row.kecamatanName,
            row.kokabName,
            row.propinsiName
          ].filter(Boolean).join(", ");
        }
      },
      {
        key: "aktif",
        label: "Aktif",
        sortable: true,
        filterable: "select",
        filterOptions: ["Aktif", "Tidak Aktif"],
        formatter: (value) => value ? "Aktif" : "Tidak Aktif",
        cellClass: (value) => value ? "text-success" : "text-error"
      },
      {
        key: "partisipasi",
        label: "Partisipasi",
        sortable: true,
        filterable: "select",
        filterOptions: ["Ya", "Tidak"],
        formatter: (value) => value ? "Ya" : "Tidak",
        cellClass: (value) => value ? "text-success" : "text-error"
      },
      {
        key: "qari",
        label: "Qari",
        sortable: true,
        filterable: "select",
        filterOptions: ["Ya", "Tidak"],
        formatter: (value) => value ? "Ya" : "Tidak",
        cellClass: (value) => value ? "text-success" : "text-error"
      },
      {
        key: "updatedAt",
        label: "Terakhir Diperbarui",
        sortable: true,
        formatter: (value) => new Date(value).toLocaleDateString()
      }
    ];
    run(() => {
      if (form?.success) {
        alert(form.message);
        invalidateAll();
      } else if (form?.message && !form?.success) {
        alert(form.message);
      }
    });
    $$renderer2.push(`<div class="mb-6 flex flex-wrap items-center justify-between space-y-2"><h1 class="card-title text-2xl">Manajemen Data Murid</h1> `);
    if (canWriteMurid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a href="/member/pendataan/new" class="btn btn-primary btn-sm">`);
      Circle_plus($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----> Tambah Murid Baru</a>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <!---->`);
    {
      SuperTable($$renderer2, {
        data: muridData,
        columns,
        rowKey: "id",
        itemsPerPageProp: pageSize,
        totalItemsProp: totalItems,
        isLoadingProp: loading,
        sort: currentSort,
        serverSide: true,
        $$slots: {
          "bulk-actions": ($$renderer3, { selectedIds }) => {
            {
              if (canWriteMurid && selectedIds.length === 1) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<button class="btn btn-secondary btn-sm">`);
                Pen($$renderer3, { class: "h-4 w-4" });
                $$renderer3.push(`<!----> Edit Selected</button>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]-->`);
            }
          },
          "loading-state": ($$renderer3) => {
            {
              $$renderer3.push(`<div class="p-8 text-center"><span class="loading loading-spinner mb-4"></span> <p class="text-lg font-semibold">Memuat data...</p> <p class="text-sm text-base-content/70">Harap tunggu sebentar.</p></div>`);
            }
          },
          "row-actions": ($$renderer3, { row }) => {
            {
              if (canWriteMurid) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div class="flex gap-2"><a${attr("href", `/member/pendataan/${row.id}/edit`)} class="btn btn-ghost btn-sm">`);
                Pen($$renderer3, { class: "h-4 w-4" });
                $$renderer3.push(`<!----></a> <button class="btn btn-ghost btn-sm text-error">`);
                Trash($$renderer3, { class: "h-4 w-4" });
                $$renderer3.push(`<!----></button></div>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]-->`);
            }
          }
        }
      });
    }
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
