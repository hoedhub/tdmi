import { f as attr_class, g as stringify, d as attr, e as ensure_array_like } from "../../../../../chunks/index4.js";
import { r as run } from "../../../../../chunks/legacy-server.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import "../../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { S as Save } from "../../../../../chunks/save.js";
import { e as escape_html } from "../../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, form } = $$props;
    let isLoading = false;
    let username = form?.username || "";
    let selectedRoles = form?.selectedRoles || [];
    let isActive = form?.active ?? true;
    let muridId = form?.muridIdStr || "";
    let password = "123456";
    run(() => {
      if (form && "userId" in form) {
        if (form.username !== void 0) username = form.username;
        if (form.selectedRoles !== void 0) selectedRoles = form.selectedRoles;
        if (form.active !== void 0) isActive = form.active;
        if (form.muridIdStr !== void 0) muridId = form.muridIdStr;
      }
    });
    let currentSelectedRoleNames = [];
    run(() => {
      currentSelectedRoleNames = selectedRoles.map((roleId) => data.allAvailableRoles.find((r) => r.id === roleId)?.name).filter(Boolean);
    });
    data.roleHierarchy || [];
    $$renderer2.push(`<div class="flex justify-center"><div class="card w-full max-w-lg bg-base-100 shadow-xl"><div class="card-body"><h1 class="card-title mb-6 text-2xl">Create New User</h1> `);
    if (form?.message) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`alert ${stringify(form.message.toLowerCase().includes("fail") || form.message.toLowerCase().includes("invalid") || form.message.toLowerCase().includes("must be") || form.message.toLowerCase().includes("taken") ? "alert-error" : "alert-success")} mb-4 shadow-lg`)}><div>`);
      if (form.message.toLowerCase().includes("fail") || form.message.toLowerCase().includes("invalid") || form.message.toLowerCase().includes("must be") || form.message.toLowerCase().includes("taken")) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`);
      }
      $$renderer2.push(`<!--]--> <span>${escape_html(form.message)}</span></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <form method="POST" class="space-y-4"><div class="form-control"><label class="label" for="username"><span class="label-text">Username</span></label> <input type="text" id="username" name="username" required class="input input-bordered w-full"${attr("value", username)}/></div> <div class="form-control"><label class="label" for="password"><span class="label-text">Password</span></label> <input type="password" id="password" name="password" readonly required minlength="6" class="input input-bordered w-full"${attr("value", password)}/></div> <div class="form-control"><div class="label"><span class="label-text">Roles</span></div> <div class="flex min-h-12 flex-wrap items-center gap-2 rounded-lg bg-base-200 p-2">`);
    if (currentSelectedRoleNames.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(currentSelectedRoleNames);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let roleName = each_array[$$index];
        $$renderer2.push(`<div class="badge badge-primary">${escape_html(roleName)}</div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="px-2 text-sm text-base-content/60">Tidak ada peran dipilih</span>`);
    }
    $$renderer2.push(`<!--]--></div> <button type="button" class="btn btn-outline btn-sm mt-2">Manage Roles</button> <!--[-->`);
    const each_array_1 = ensure_array_like(selectedRoles);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let roleId = each_array_1[$$index_1];
      $$renderer2.push(`<input type="hidden" name="roles"${attr("value", roleId)}/>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="form-control"><label class="label" for="muridId"><span class="label-text">Murid (optional)</span></label> `);
    $$renderer2.select(
      {
        id: "muridId",
        name: "muridId",
        class: "select select-bordered w-full",
        value: muridId
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Select Murid`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(data.allMurids);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let muridOption = each_array_2[$$index_2];
          $$renderer3.option({ value: muridOption.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(muridOption.nama)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="form-control"><label class="label cursor-pointer justify-start gap-2"><input type="checkbox" id="active" name="active" class="checkbox-primary checkbox"${attr("checked", isActive, true)}/> <span class="label-text">Active</span></label></div> <div class="card-actions justify-end pt-4"><a href="/admin/users" class="btn btn-ghost">Cancel</a> <button type="submit" class="btn btn-primary"${attr("disabled", isLoading, true)}>`);
    {
      $$renderer2.push("<!--[!-->");
      Save($$renderer2, { class: "mr-2 h-5 w-5" });
    }
    $$renderer2.push(`<!--]--> Create User</button></div></form></div></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
