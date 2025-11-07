import { s as sanitize_props, a as spread_props, b as slot, f as attr_class, d as attr } from "../../../../chunks/index4.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from "chart.js";
import { t as toHindi } from "../../../../chunks/toHindi.js";
import { S as SuperTable, C as Chevron_right, a as Chevron_left } from "../../../../chunks/SuperTable.js";
import "../../../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import "../../../../chunks/api.js";
import "../../../../chunks/absoluteDropdown.js";
import { I as Icon } from "../../../../chunks/Icon.js";
import { D as Download } from "../../../../chunks/download.js";
import { C as Circle_plus } from "../../../../chunks/circle-plus.js";
import { S as Square_pen } from "../../../../chunks/square-pen.js";
import { T as Trash_2 } from "../../../../chunks/trash-2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function Layout_dashboard($$renderer, $$props) {
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
      "rect",
      { "width": "7", "height": "9", "x": "3", "y": "3", "rx": "1" }
    ],
    [
      "rect",
      { "width": "7", "height": "5", "x": "14", "y": "3", "rx": "1" }
    ],
    [
      "rect",
      { "width": "7", "height": "9", "x": "14", "y": "12", "rx": "1" }
    ],
    [
      "rect",
      { "width": "7", "height": "5", "x": "3", "y": "16", "rx": "1" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "layout-dashboard" },
    $$sanitized_props,
    {
      /**
       * @component @name LayoutDashboard
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI5IiB4PSIzIiB5PSIzIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIxNCIgeT0iMyIgcng9IjEiIC8+CiAgPHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iOSIgeD0iMTQiIHk9IjEyIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIzIiB5PSIxNiIgcng9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/layout-dashboard
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
function Table($$renderer, $$props) {
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
    ["path", { "d": "M12 3v18" }],
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
    ],
    ["path", { "d": "M3 9h18" }],
    ["path", { "d": "M3 15h18" }]
  ];
  Icon($$renderer, spread_props([
    { name: "table" },
    $$sanitized_props,
    {
      /**
       * @component @name Table
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgM3YxOCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDloMTgiIC8+CiAgPHBhdGggZD0iTTMgMTVoMTgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/table
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
var internal = {};
var hasRequiredInternal;
function requireInternal() {
  if (hasRequiredInternal) return internal;
  hasRequiredInternal = 1;
  throw new Error(
    `Your application, or one of its dependencies, imported from 'svelte/internal', which was a private module used by Svelte 4 components that no longer exists in Svelte 5. It is not intended to be public API. If you're a library author and you used 'svelte/internal' deliberately, please raise an issue on https://github.com/sveltejs/svelte/issues detailing your use case.`
  );
}
requireInternal();
const eventPrefix = /^on/;
const events = [];
Object.keys(globalThis).forEach((key) => {
  if (eventPrefix.test(key)) {
    events.push(key.replace(eventPrefix, ""));
  }
});
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentView = "table";
    Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);
    let nasyathData = [];
    let totalItems = 0;
    let loading = true;
    let pageSize = 10;
    let currentSort = [
      { key: "murid.nama", direction: "asc" },
      { key: "tanggalMulai", direction: "asc" }
    ];
    let { data } = $$props;
    let selectedDate = /* @__PURE__ */ new Date();
    const monthNames = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر"
    ];
    let periodType = "bulan";
    ({
      labels: data.charts.activitiesPerMonth.map((item) => {
        const [year, month] = item.month.split("-");
        return new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short", year: "2-digit" });
      }),
      datasets: [
        {
          label: "Jumlah Kegiatan",
          data: data.charts.activitiesPerMonth.map((item) => item.count),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        }
      ]
    });
    ({
      labels: data.charts.mostActiveMembers.map((item) => item.murid?.nama || "بدون اسم"),
      datasets: [
        {
          data: data.charts.mostActiveMembers.map((item) => item.activityCount),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#C7C7C7"
          ],
          borderColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#C7C7C7"
          ],
          borderWidth: 1
        }
      ]
    });
    let columns = (() => {
      const baseColumns = [
        {
          key: "kegiatan",
          label: "النشاط",
          sortable: true,
          filterable: "text"
        },
        {
          key: "tanggalMulai",
          label: "تاريخ البدء",
          sortable: true,
          formatter: (value) => value ? toHindi(new Date(value).toLocaleDateString("ar-EG-u-nu-arab")) : "-"
        },
        {
          key: "tanggalSelesai",
          label: "تاريخ الانتهاء",
          sortable: true,
          formatter: (value) => value ? toHindi(new Date(value).toLocaleDateString("ar-EG-u-nu-arab")) : "-"
        },
        {
          key: "durasi",
          label: "المدة",
          sortable: true,
          filterable: "text",
          formatter: (value) => toHindi(value)
        },
        {
          key: "tempat",
          label: "المكان",
          sortable: true,
          filterable: "text"
        }
      ];
      if (data && data.canReadAll) {
        return [
          {
            key: "murid.nama",
            label: "الاسم",
            sortable: true,
            filterable: "text",
            formatter: (value, row) => row.murid?.nama || "N/A"
          },
          ...baseColumns
        ];
      }
      return baseColumns;
    })();
    let monthYearDisplay = `${monthNames[selectedDate.getMonth()]} ${toHindi(selectedDate.getFullYear())}`;
    $$renderer2.push(`<div class="container mx-auto p-4" dir="rtl"><div class="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row"><h1 class="text-2xl font-bold">${escape_html("قائمة نشاط الأعضاء")}</h1> <div class="btn-group"><button${attr_class("btn btn-sm", void 0, { "btn-active": currentView === "dashboard" })}>`);
    Layout_dashboard($$renderer2, { class: "h-4 w-4" });
    $$renderer2.push(`<!----> Dashboard</button> <button${attr_class("btn btn-sm", void 0, { "btn-active": currentView === "table" })}>`);
    Table($$renderer2, { class: "h-4 w-4" });
    $$renderer2.push(`<!----> Tabel</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="space-y-4"><div class="flex items-center justify-end gap-2"><button class="btn btn-secondary btn-sm"${attr("disabled", nasyathData.length === 0 || loading, true)}${attr("title", nasyathData.length === 0 ? "Tidak ada data untuk diekspor" : "Ekspor data")}>`);
        Download($$renderer2, { class: "h-4 w-4" });
        $$renderer2.push(`<!----> `);
        {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`Export ke XLSX`);
        }
        $$renderer2.push(`<!--]--></button> <a href="/member/nasyath_mun/new" class="btn btn-primary btn-sm">`);
        Circle_plus($$renderer2, { class: "h-4 w-4" });
        $$renderer2.push(`<!----> Tambah Baru</a></div> `);
        SuperTable($$renderer2, {
          data: nasyathData,
          columns,
          rowKey: "id",
          serverSide: true,
          isSelectable: true,
          isLoadingProp: loading,
          itemsPerPageProp: pageSize,
          totalItemsProp: totalItems,
          sort: currentSort,
          $$slots: {
            "custom-filters": ($$renderer3) => {
              {
                $$renderer3.push(`<div class="flex flex-col flex-wrap items-start gap-4 pt-2 md:flex-row md:items-end"><div class="form-control"><label class="label pb-1" for="period-type-select"><span class="label-text">تحديد الفترة</span></label> `);
                $$renderer3.select(
                  {
                    id: "period-type-select",
                    class: "select select-bordered select-sm",
                    value: periodType
                  },
                  ($$renderer4) => {
                    $$renderer4.option({ value: "bulan" }, ($$renderer5) => {
                      $$renderer5.push(`شهري`);
                    });
                    $$renderer4.option({ value: "rentang" }, ($$renderer5) => {
                      $$renderer5.push(`نطاق تاريخ`);
                    });
                  }
                );
                $$renderer3.push(`</div> `);
                {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.push(`<div class="form-control"><label class="label pb-1" for="month-select"><span class="label-text">تحديد الشهر</span></label> <div class="join"><button class="btn join-item btn-sm">`);
                  Chevron_right($$renderer3, { class: "h-4 w-4" });
                  $$renderer3.push(`<!----></button> <button class="btn join-item btn-sm w-36 font-normal">${escape_html(monthYearDisplay)}</button> <button class="btn join-item btn-sm">`);
                  Chevron_left($$renderer3, { class: "h-4 w-4" });
                  $$renderer3.push(`<!----></button></div></div>`);
                }
                $$renderer3.push(`<!--]--> <div class="flex items-center gap-1"><button class="btn btn-primary btn-sm">تصفية</button><button class="btn btn-ghost btn-sm">إعادة تعيين</button></div></div>`);
              }
            },
            "row-actions": ($$renderer3, { row }) => {
              $$renderer3.push(`<div slot="row-actions" class="flex items-center gap-1"><button class="btn btn-ghost btn-xs" aria-label="Edit item">`);
              Square_pen($$renderer3, { class: "h-4 w-4" });
              $$renderer3.push(`<!----></button> <form method="POST"${attr("action", `/member/nasyath_mun/${row.id}/delete`)}><button type="submit" class="btn btn-ghost btn-xs text-error" aria-label="Delete item">`);
              Trash_2($$renderer3, { class: "h-4 w-4" });
              $$renderer3.push(`<!----></button></form></div>`);
            }
          }
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
