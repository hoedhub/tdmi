import { d as attr } from "../../../../chunks/index4.js";
import { r as run } from "../../../../chunks/legacy-server.js";
import { i as invalidateAll } from "../../../../chunks/client2.js";
import { S as SuperTable } from "../../../../chunks/SuperTable.js";
import "../../../../chunks/api.js";
import "../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { P as Pen, T as Trash } from "../../../../chunks/trash.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, form } = $$props;
    let users = data.users;
    let allRoles = data.allRoles;
    let totalItems = data.totalItems;
    let loading = true;
    let pageSize = 10;
    let currentSort = void 0;
    let columns = [];
    run(() => {
      if (allRoles.length > 0) {
        columns = [
          {
            key: "username",
            label: "Username",
            sortable: true,
            filterable: "text"
          },
          {
            key: "assignedRoles",
            label: "Roles",
            sortable: false,
            filterable: "select",
            filterOptions: allRoles.map((role) => role.name),
            formatter: (value) => value.map((roleId) => allRoles.find((r) => r.id === roleId)?.name || roleId).join(", ") || "No Roles"
          },
          {
            key: "active",
            label: "Status",
            sortable: true,
            filterable: "select",
            filterOptions: ["Active", "Inactive"],
            formatter: (value) => value ? "Active" : "Inactive",
            cellClass: (value) => value ? "text-success" : "text-error"
          },
          {
            key: "muridId",
            label: "Murid ID",
            sortable: true,
            formatter: (value) => value === null || value === 0 ? "N/A" : value.toString()
          },
          {
            key: "createdAt",
            label: "Created At",
            sortable: true,
            formatter: (value) => new Date(value).toLocaleDateString()
          }
        ];
      }
    });
    run(() => {
      if (form?.success) {
        alert(form.message);
        invalidateAll();
      } else if (form?.message && !form?.success) {
        alert(form.message);
      }
    });
    $$renderer2.push(`<div class="mb-6 flex flex-wrap items-center justify-between space-y-2"><h1 class="card-title text-2xl">User Management</h1> <a href="/admin/users/new" class="btn btn-primary btn-sm">Create New User</a></div> <!---->`);
    {
      SuperTable($$renderer2, {
        data: users,
        columns,
        rowKey: "id",
        itemsPerPageProp: pageSize,
        totalItemsProp: totalItems,
        isLoadingProp: loading,
        sort: currentSort,
        serverSide: true,
        $$slots: {
          "loading-state": ($$renderer3) => {
            {
              $$renderer3.push(`<div class="p-8 text-center"><span class="loading loading-spinner mb-4"></span> <p class="text-lg font-semibold">Memuat data...</p> <p class="text-sm text-base-content/70">Harap tunggu sebentar.</p></div>`);
            }
          },
          "row-actions": ($$renderer3, { row }) => {
            {
              $$renderer3.push(`<div class="flex gap-2"><a${attr("href", `/admin/users/${row.id}/edit`)} class="btn btn-ghost btn-sm">`);
              Pen($$renderer3, { class: "h-4 w-4" });
              $$renderer3.push(`<!----></a> `);
              if (row.id !== data.user?.id) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<button class="btn btn-ghost btn-sm text-error">`);
                Trash($$renderer3, { class: "h-4 w-4" });
                $$renderer3.push(`<!----></button>`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<button class="btn btn-disabled btn-sm">`);
                Trash($$renderer3, { class: "h-4 w-4" });
                $$renderer3.push(`<!----></button>`);
              }
              $$renderer3.push(`<!--]--></div>`);
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
