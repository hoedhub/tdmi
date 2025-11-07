import { s as sanitize_props, a as spread_props, b as slot, f as attr_class, g as stringify, d as attr } from "../../../../chunks/index4.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { I as Icon } from "../../../../chunks/Icon.js";
import { S as Save } from "../../../../chunks/save.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function Eye($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.544.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "eye" },
    $$sanitized_props,
    {
      /**
       * @component @name Eye
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi4wNjIgMTIuMzQ4YTEgMSAwIDAgMSAwLS42OTYgMTAuNzUgMTAuNzUgMCAwIDEgMTkuODc2IDAgMSAxIDAgMCAxIDAgLjY5NiAxMC43NSAxMC43NSAwIDAgMS0xOS44NzYgMCIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/eye
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { form, data } = $$props;
    let currentPassword = "";
    let newPassword = "";
    let confirmPassword = "";
    $$renderer2.push(`<div class="flex justify-center"><div class="card w-full max-w-lg bg-base-100 shadow-xl"><div class="card-body"><h1 class="card-title mb-6 text-2xl">Edit Profile: <span class="text-primary">${escape_html(data.userToEdit.username)}</span></h1> `);
    if (form?.message) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`alert ${stringify(form.message.toLowerCase().includes("fail") || form.message.toLowerCase().includes("invalid") || form.message.toLowerCase().includes("must be") || form.message.toLowerCase().includes("match") ? "alert-error" : "alert-success")} mb-4 shadow-lg`)}><div>`);
      if (form.message.toLowerCase().includes("fail") || form.message.toLowerCase().includes("invalid") || form.message.toLowerCase().includes("must be") || form.message.toLowerCase().includes("match")) {
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
    $$renderer2.push(`<!--]--> <form method="POST" class="space-y-4"><div class="form-control"><label class="label" for="username"><span class="label-text">Username</span></label> <input type="text" id="username" name="username"${attr("readonly", true, true)} class="input input-bordered w-full"${attr("value", data.userToEdit.username)}/></div> <h2 class="mb-6 text-xl font-semibold">Change Password</h2> <div class="form-control"><label for="current-password" class="label"><span class="label-text">Current Password</span></label> <div class="relative">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<input type="password" id="current-password" name="currentPassword" class="input input-bordered w-full pr-10" required${attr("value", currentPassword)}/>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3">`);
    {
      $$renderer2.push("<!--[!-->");
      Eye($$renderer2, { class: "h-5 w-5 text-gray-500" });
    }
    $$renderer2.push(`<!--]--></button></div></div> <div class="form-control"><label for="new-password" class="label"><span class="label-text">New Password</span></label> <div class="relative">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<input type="password" id="new-password" name="newPassword" class="input input-bordered w-full pr-10" required${attr("value", newPassword)}/>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3">`);
    {
      $$renderer2.push("<!--[!-->");
      Eye($$renderer2, { class: "h-5 w-5 text-gray-500" });
    }
    $$renderer2.push(`<!--]--></button></div></div> <div class="form-control"><label for="confirm-password" class="label"><span class="label-text">Confirm New Password</span></label> <div class="relative">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<input type="password" id="confirm-password" name="confirmPassword" class="input input-bordered w-full pr-10" required${attr("value", confirmPassword)}/>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3">`);
    {
      $$renderer2.push("<!--[!-->");
      Eye($$renderer2, { class: "h-5 w-5 text-gray-500" });
    }
    $$renderer2.push(`<!--]--></button></div></div> <div class="card-actions justify-end pt-4"><button type="submit" class="btn btn-primary">`);
    {
      $$renderer2.push("<!--[!-->");
      Save($$renderer2, { class: "mr-2 h-5 w-5" });
    }
    $$renderer2.push(`<!--]--> Change Password</button></div></form></div></div></div>`);
  });
}
export {
  _page as default
};
