import { s as sanitize_props, a as spread_props, b as slot, d as attr, e as ensure_array_like, f as attr_class, g as stringify, j as clsx, c as store_get, u as unsubscribe_stores, l as bind_props, p as store_set, q as store_mutate } from "./index4.js";
import { f as fallback } from "./utils2.js";
import { s as selectedIds, i as itemsPerPage, c as currentPage, f as filterState, a as isLoading } from "./TableRowMobileCard.svelte_svelte_type_style_lang.js";
import { I as Icon } from "./Icon.js";
import { C as Chevrons_up_down, T as Trash_2 } from "./trash-2.js";
import { e as escape_html } from "./escaping.js";
import { h as html, c as createEventDispatcher, X, o as onDestroy } from "./x.js";
import { r as run } from "./legacy-server.js";
import { C as Circle_x } from "./ToastContainer.svelte_svelte_type_style_lang.js";
function Arrow_down($$renderer, $$props) {
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
    ["path", { "d": "M12 5v14" }],
    ["path", { "d": "m19 12-7 7-7-7" }]
  ];
  Icon($$renderer, spread_props([
    { name: "arrow-down" },
    $$sanitized_props,
    {
      /**
       * @component @name ArrowDown
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgNXYxNCIgLz4KICA8cGF0aCBkPSJtMTkgMTItNyA3LTctNyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/arrow-down
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
function Arrow_up_down($$renderer, $$props) {
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
    ["path", { "d": "m21 16-4 4-4-4" }],
    ["path", { "d": "M17 20V4" }],
    ["path", { "d": "m3 8 4-4 4 4" }],
    ["path", { "d": "M7 4v16" }]
  ];
  Icon($$renderer, spread_props([
    { name: "arrow-up-down" },
    $$sanitized_props,
    {
      /**
       * @component @name ArrowUpDown
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEgMTYtNCA0LTQtNCIgLz4KICA8cGF0aCBkPSJNMTcgMjBWNCIgLz4KICA8cGF0aCBkPSJtMyA4IDQtNCA0IDQiIC8+CiAgPHBhdGggZD0iTTcgNHYxNiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/arrow-up-down
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
function Arrow_up($$renderer, $$props) {
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
    ["path", { "d": "m5 12 7-7 7 7" }],
    ["path", { "d": "M12 19V5" }]
  ];
  Icon($$renderer, spread_props([
    { name: "arrow-up" },
    $$sanitized_props,
    {
      /**
       * @component @name ArrowUp
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNSAxMiA3LTcgNyA3IiAvPgogIDxwYXRoIGQ9Ik0xMiAxOVY1IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/arrow-up
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
function Chevron_down($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "m6 9 6 6 6-6" }]];
  Icon($$renderer, spread_props([
    { name: "chevron-down" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronDown
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNiA5IDYgNiA2LTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/chevron-down
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
function Chevron_left($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "m15 18-6-6 6-6" }]];
  Icon($$renderer, spread_props([
    { name: "chevron-left" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronLeft
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTUgMTgtNi02IDYtNiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/chevron-left
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
function Chevron_right($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
  Icon($$renderer, spread_props([
    { name: "chevron-right" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronRight
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtOSAxOCA2LTYtNi02IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/chevron-right
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
function Chevron_up($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "m18 15-6-6-6 6" }]];
  Icon($$renderer, spread_props([
    { name: "chevron-up" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronUp
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTggMTUtNi02LTYgNiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/chevron-up
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
function Columns_2($$renderer, $$props) {
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
      { "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
    ],
    ["path", { "d": "M12 3v18" }]
  ];
  Icon($$renderer, spread_props([
    { name: "columns-2" },
    $$sanitized_props,
    {
      /**
       * @component @name Columns2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0xMiAzdjE4IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/columns-2
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
function Grip_vertical($$renderer, $$props) {
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
    ["circle", { "cx": "9", "cy": "12", "r": "1" }],
    ["circle", { "cx": "9", "cy": "5", "r": "1" }],
    ["circle", { "cx": "9", "cy": "19", "r": "1" }],
    ["circle", { "cx": "15", "cy": "12", "r": "1" }],
    ["circle", { "cx": "15", "cy": "5", "r": "1" }],
    ["circle", { "cx": "15", "cy": "19", "r": "1" }]
  ];
  Icon($$renderer, spread_props([
    { name: "grip-vertical" },
    $$sanitized_props,
    {
      /**
       * @component @name GripVertical
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSI5IiBjeT0iMTIiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iOSIgY3k9IjUiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iOSIgY3k9IjE5IiByPSIxIiAvPgogIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTIiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iMTUiIGN5PSI1IiByPSIxIiAvPgogIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTkiIHI9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/grip-vertical
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
function Search($$renderer, $$props) {
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
    ["path", { "d": "m21 21-4.34-4.34" }],
    ["circle", { "cx": "11", "cy": "11", "r": "8" }]
  ];
  Icon($$renderer, spread_props([
    { name: "search" },
    $$sanitized_props,
    {
      /**
       * @component @name Search
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEgMjEtNC4zNC00LjM0IiAvPgogIDxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/search
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
function isFormatterFunction(formatter) {
  return typeof formatter === "function";
}
function getValue$1(obj, key) {
  return obj[key];
}
function compareValues(a, b, direction) {
  if (a === null || a === void 0) return direction === "asc" ? -1 : 1;
  if (b === null || b === void 0) return direction === "asc" ? 1 : -1;
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();
  if (aStr < bStr) return direction === "asc" ? -1 : 1;
  if (aStr > bStr) return direction === "asc" ? 1 : -1;
  return 0;
}
function sortData(data, sortConfigs, columns) {
  if (!sortConfigs || sortConfigs.length === 0) return [...data];
  return [...data].sort((a, b) => {
    for (const sortConfig of sortConfigs) {
      const column = columns.find((col) => col.key === sortConfig.key);
      if (!column) continue;
      const aVal = getValue$1(a, sortConfig.key);
      const bVal = getValue$1(b, sortConfig.key);
      let aFormatted = aVal;
      let bFormatted = bVal;
      if (column.formatter && isFormatterFunction(column.formatter)) {
        aFormatted = column.formatter(aVal, a, column);
        bFormatted = column.formatter(bVal, b, column);
      }
      const comparison = compareValues(aFormatted, bFormatted, sortConfig.direction);
      if (comparison !== 0) return comparison;
    }
    return 0;
  });
}
function isFilterType(value) {
  return typeof value === "string" && ["text", "select", "date"].includes(value);
}
function getValue(obj, key) {
  const value = obj[key];
  if (value === null || value === void 0) return "";
  return String(value);
}
function includesIgnoreCase(value, searchTerm) {
  if (value === null || value === void 0) return false;
  return String(value).toLowerCase().includes(searchTerm.toLowerCase());
}
function filterData(data, filterState2, columns) {
  console.log("[Client Filtering] Starting filtering with:", {
    globalFilter: filterState2.global,
    columnFilters: filterState2.columns,
    dataLength: data.length
  });
  let filtered = [...data];
  if (filterState2.global) {
    const searchableColumns = columns.filter((col) => !col.hidden);
    filtered = filtered.filter((row) => {
      return searchableColumns.some((col) => {
        const value = getValue(row, col.key);
        return includesIgnoreCase(value, filterState2.global);
      });
    });
  }
  Object.entries(filterState2.columns).forEach(([key, filterValue]) => {
    if (!filterValue) return;
    const column = columns.find((col) => col.key === key);
    if (!column || !column.filterable) return;
    console.log("[Client Filtering] Applying column filter:", {
      column: key,
      filterValue,
      filterType: column.filterable
    });
    filtered = filtered.filter((row) => {
      const cellValue = getValue(row, key);
      const filterType = isFilterType(column.filterable) ? column.filterable : column.filterConfig?.type || "text";
      switch (filterType) {
        case "select":
          return String(cellValue) === String(filterValue);
        case "date":
          if (Array.isArray(filterValue) && filterValue.length === 2) {
            const [start, end] = filterValue;
            const date = new Date(cellValue);
            return date >= new Date(start) && date <= new Date(end);
          }
          return includesIgnoreCase(cellValue, String(filterValue));
        case "text":
        default:
          return includesIgnoreCase(cellValue, String(filterValue));
      }
    });
    console.log("[Client Filtering] After column filter:", {
      column: key,
      resultCount: filtered.length
    });
  });
  console.log("[Client Filtering] Final filtered results:", {
    data: filtered,
    initialCount: data.length,
    finalCount: filtered.length,
    filtersApplied: {
      global: !!filterState2.global,
      columns: Object.keys(filterState2.columns).filter((k) => filterState2.columns[k])
    }
  });
  return filtered;
}
function paginateData(data, currentPage2, itemsPerPage2) {
  const startIndex = (currentPage2 - 1) * itemsPerPage2;
  const endIndex = startIndex + itemsPerPage2;
  return data.slice(startIndex, endIndex);
}
function calculateTotalPages(totalItems, itemsPerPage2) {
  return Math.ceil(totalItems / itemsPerPage2);
}
function generatePageNumbers(currentPage2, totalPages, maxVisiblePages = 5) {
  const pages = [];
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  pages.push(1);
  const sidePages = Math.floor((maxVisiblePages - 2) / 2);
  let startPage = Math.max(2, currentPage2 - sidePages);
  let endPage = Math.min(totalPages - 1, currentPage2 + sidePages);
  if (currentPage2 - sidePages <= 2) {
    endPage = maxVisiblePages - 1;
  }
  if (currentPage2 + sidePages >= totalPages - 1) {
    startPage = totalPages - maxVisiblePages + 2;
  }
  if (startPage > 2) {
    pages.push("...");
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  if (endPage < totalPages - 1) {
    pages.push("...");
  }
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  return pages;
}
function TableHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      columns,
      currentSort,
      isSelectable = false,
      allSelected = false,
      someSelected = false,
      filterValues = {}
    } = $$props;
    function handleFilterChange(columnKey, value) {
    }
    function getSortForColumn(key) {
      return currentSort?.find((s) => s.key === key);
    }
    function getSortIndex(key) {
      if (!currentSort) return -1;
      return currentSort.findIndex((s) => s.key === key);
    }
    $$renderer2.push(`<thead class="svelte-1kkoo7a"><tr class="bg-base-200 bg-opacity-50 svelte-1kkoo7a">`);
    if (isSelectable) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<th class="w-1 py-2 svelte-1kkoo7a"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", allSelected, true)}${attr("indeterminate", someSelected && !allSelected, true)} aria-label="Select all rows"/></th>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    const each_array = ensure_array_like(columns.filter((col) => !col.hidden));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let column = each_array[$$index];
      const sortConfig = getSortForColumn(String(column.key));
      const sortIndex = getSortIndex(String(column.key));
      $$renderer2.push(`<th${attr_class(`py-2 hover:bg-base-200 ${stringify(column.headerClass || "")} ${stringify(column.sortable ? "cursor-pointer select-none" : "")} ${stringify(sortConfig ? "text-primary" : "")}`, "svelte-1kkoo7a")}${attr("aria-sort", sortConfig ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none")} role="columnheader"${attr("aria-label", `${column.label}${column.sortable ? ". Click to sort" : ""}`)}><div class="flex items-center justify-between gap-2"><span>${escape_html(column.label)}</span> `);
      if (column.sortable) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="relative opacity-50">`);
        if (sortConfig) {
          $$renderer2.push("<!--[-->");
          if (sortConfig.direction === "asc") {
            $$renderer2.push("<!--[-->");
            Chevron_up($$renderer2, { size: 16 });
          } else {
            $$renderer2.push("<!--[!-->");
            Chevron_down($$renderer2, { size: 16 });
          }
          $$renderer2.push(`<!--]--> `);
          if (sortIndex !== -1 && (currentSort?.length || 0) > 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<span class="absolute -bottom-1 -right-1 text-xs">${escape_html(sortIndex + 1)}</span>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          Chevrons_up_down($$renderer2, { size: 16 });
        }
        $$renderer2.push(`<!--]--></span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></th>`);
    }
    $$renderer2.push(`<!--]--><th class="w-auto svelte-1kkoo7a"></th></tr><tr class="border-t border-base-300 bg-base-200 bg-opacity-50 svelte-1kkoo7a">`);
    if (isSelectable) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<th class="w-1 svelte-1kkoo7a"></th>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    const each_array_1 = ensure_array_like(columns.filter((col) => !col.hidden));
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let column = each_array_1[$$index_2];
      $$renderer2.push(`<th${attr_class(clsx(column.headerClass || ""), "svelte-1kkoo7a")}>`);
      if (column.filterable) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-1">`);
        if (column.filterOptions) {
          $$renderer2.push("<!--[-->");
          $$renderer2.select(
            {
              class: "select select-bordered select-xs w-full max-w-xs",
              value: filterValues[String(column.key)] || "",
              onchange: (e) => handleFilterChange(String(column.key), e.currentTarget.value),
              "aria-label": `Filter ${column.label}`
            },
            ($$renderer3) => {
              $$renderer3.option({ value: "" }, ($$renderer4) => {
                $$renderer4.push(`All`);
              });
              $$renderer3.push(`<!--[-->`);
              const each_array_2 = ensure_array_like(column.filterOptions);
              for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                let option = each_array_2[$$index_1];
                if (typeof option === "string") {
                  $$renderer3.push("<!--[-->");
                  $$renderer3.option({ value: option }, ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option)}`);
                  });
                } else {
                  $$renderer3.push("<!--[!-->");
                  $$renderer3.option({ value: option.value }, ($$renderer4) => {
                    $$renderer4.push(`${escape_html(option.label)}`);
                  });
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]-->`);
            }
          );
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<input type="search" class="input input-xs input-bordered w-full max-w-xs"${attr("value", filterValues[String(column.key)] || "")}${attr("placeholder", `Filter ${column.label.toLowerCase()}...`)}${attr("aria-label", `Filter ${column.label}`)}/>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></th>`);
    }
    $$renderer2.push(`<!--]--><th class="w-auto px-2 align-bottom svelte-1kkoo7a">`);
    if (Object.values(filterValues).some((v) => v && v !== "All")) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="btn btn-ghost btn-xs -mb-1 text-error">Reset</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></th></tr></thead>`);
  });
}
function TableRowDesktop($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isSelected;
    let row = $$props["row"];
    let columns = $$props["columns"];
    let rowKey = $$props["rowKey"];
    let isSelectable = fallback($$props["isSelectable"], false);
    let className = fallback($$props["className"], "");
    let disabled = fallback($$props["disabled"], false);
    function isSvelteComponent(formatter) {
      return typeof formatter !== "function";
    }
    isSelected = store_get($$store_subs ??= {}, "$selectedIds", selectedIds).has(row[rowKey]);
    $$renderer2.push(`<tr${attr_class(`group relative cursor-pointer hover:bg-base-200 [&_tbody_tr:nth-child(even)]:bg-base-200/50 ${stringify(className)} ${stringify(isSelected ? "bg-base-200" : "")} ${stringify(disabled ? "disabled cursor-not-allowed opacity-50" : "")}`, "svelte-7hjv0h")}>`);
    if (isSelectable) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<td class="w-4 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", isSelected, true)}${attr("aria-checked", isSelected)}${attr("disabled", disabled, true)}/></td>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    const each_array = ensure_array_like(columns.filter((col) => !col.hidden));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let column = each_array[$$index];
      const value = row[String(column.key)];
      $$renderer2.push(`<td${attr_class(`py-1 ${column.cellClass || ""} ${typeof column.cellClass === "function" ? column.cellClass(value, row) : ""}`)}>`);
      if (column.formatter) {
        $$renderer2.push("<!--[-->");
        if (isSvelteComponent(column.formatter)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<!---->`);
          column.formatter?.($$renderer2, { value, row, column });
          $$renderer2.push(`<!---->`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${html(column.formatter(value, row, column))}`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`${escape_html(value)}`);
      }
      $$renderer2.push(`<!--]--></td>`);
    }
    $$renderer2.push(`<!--]--><td class="py-1"><!--[-->`);
    slot($$renderer2, $$props, "row-actions", { row }, null);
    $$renderer2.push(`<!--]--></td></tr>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { row, columns, rowKey, isSelectable, className, disabled });
  });
}
function PaginationControls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentPage: currentPage2, totalPages, itemsPerPage: itemsPerPage2, totalItems } = $$props;
    const dispatch = createEventDispatcher();
    let isRtl = false;
    let pages = generatePageNumbers(currentPage2, totalPages);
    let startItem = (currentPage2 - 1) * itemsPerPage2 + 1;
    let endItem = Math.min(currentPage2 * itemsPerPage2, totalItems);
    $$renderer2.push(`<div${attr_class("flex flex-col items-center gap-4 sm:flex-row sm:justify-between", void 0, { "rtl": isRtl })} role="navigation" aria-label="Pagination"><div class="text-sm text-base-content/70" aria-live="polite">Showing `);
    if (totalItems >= 1) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<b>${escape_html(startItem)}-${escape_html(endItem)}</b> of`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><b>${escape_html(totalItems)}</b> items</div> <div class="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto sm:justify-end"><div class="join" role="group" aria-label="Pagination controls"><button${attr_class(`btn join-item btn-sm ${stringify(currentPage2 === 1 ? "btn-disabled" : "")}`)}${attr("disabled", currentPage2 === 1, true)} aria-label="Previous page">`);
    Chevron_left($$renderer2, {
      size: 16,
      class: `transform ${stringify("")}`
    });
    $$renderer2.push(`<!----></button> <!--[-->`);
    const each_array = ensure_array_like(pages);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let page = each_array[$$index];
      if (page === "...") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="btn btn-disabled join-item btn-sm">...</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<button${attr_class(`btn join-item btn-sm ${stringify(page === currentPage2 ? "btn-active" : "")}`)}${attr("aria-label", `Page ${page}`)}${attr("aria-current", page === currentPage2 ? "page" : void 0)}>${escape_html(page)}</button>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <button${attr_class(`btn join-item btn-sm ${stringify(currentPage2 === totalPages ? "btn-disabled" : "")}`)}${attr("disabled", currentPage2 === totalPages, true)} aria-label="Next page">`);
    Chevron_right($$renderer2, {
      size: 16,
      class: `transform ${stringify("")}`
    });
    $$renderer2.push(`<!----></button></div> <div class="flex items-center gap-2"><span class="text-sm text-base-content/70">Items per page:</span> `);
    $$renderer2.select(
      {
        class: "select select-bordered select-sm",
        value: itemsPerPage2,
        "aria-label": "Items per page",
        onchange: (e) => dispatch("itemsPerPageChange", parseInt(e.currentTarget.value))
      },
      ($$renderer3) => {
        $$renderer3.option({ value: 5 }, ($$renderer4) => {
          $$renderer4.push(`5`);
        });
        $$renderer3.option({ value: 10 }, ($$renderer4) => {
          $$renderer4.push(`10`);
        });
        $$renderer3.option({ value: 25 }, ($$renderer4) => {
          $$renderer4.push(`25`);
        });
        $$renderer3.option({ value: 50 }, ($$renderer4) => {
          $$renderer4.push(`50`);
        });
        $$renderer3.option({ value: 100 }, ($$renderer4) => {
          $$renderer4.push(`100`);
        });
      }
    );
    $$renderer2.push(`</div></div></div>`);
  });
}
function FilterInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = "",
      placeholder = "Search...",
      id = "filter-input",
      label = "Search"
    } = $$props;
    $$renderer2.push(`<div class="relative"><span class="absolute inset-y-0 left-0 flex items-center pl-2 opacity-50">`);
    Search($$renderer2, { size: 16 });
    $$renderer2.push(`<!----></span> <input${attr("id", id)} type="text" class="input input-sm input-bordered w-full pl-8 pr-8"${attr("placeholder", placeholder)}${attr("value", value)}${attr("aria-label", label)} role="searchbox"/> `);
    if (value) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button type="button" class="absolute inset-y-0 right-0 flex items-center px-2 opacity-50 hover:opacity-100" aria-label="Clear search">`);
      X($$renderer2, { size: 16 });
      $$renderer2.push(`<!----></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
function SortModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { columns } = $$props;
    let internalSorts = [];
    onDestroy(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
      }
    });
    function handleKeydown(event) {
    }
    run(() => {
    });
    $$renderer2.push(`<dialog class="modal"><div class="modal-box" role="document"><h3 class="text-lg font-bold" id="sort-modal-title">Manage Sorting</h3> <form method="dialog"><button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">×</button></form> <div class="divider my-2"></div> <div class="space-y-3 py-4" role="list">`);
    if (internalSorts.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-center text-base-content/70">No sort conditions applied.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(internalSorts);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let sort = each_array[index];
      $$renderer2.push(`<div class="flex items-center gap-2 rounded-lg border border-base-300 p-2" role="listitem" draggable="true"><button class="btn btn-ghost btn-sm cursor-move px-1">`);
      Grip_vertical($$renderer2, { class: "h-5 w-5 text-base-content/50" });
      $$renderer2.push(`<!----></button> `);
      $$renderer2.select(
        {
          class: "select select-bordered select-sm w-full flex-grow",
          value: sort.key
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(columns.filter((c) => c.sortable));
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let col = each_array_1[$$index];
            $$renderer3.option(
              {
                value: col.key,
                disabled: internalSorts.some((s, i) => i !== index && s.key === col.key)
              },
              ($$renderer4) => {
                $$renderer4.push(`${escape_html(col.label)}`);
              }
            );
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(` <button class="btn btn-circle btn-ghost btn-sm" aria-label="Toggle sort direction">`);
      if (sort.direction === "asc") {
        $$renderer2.push("<!--[-->");
        Arrow_up($$renderer2, { class: "h-5 w-5" });
      } else {
        $$renderer2.push("<!--[!-->");
        Arrow_down($$renderer2, { class: "h-5 w-5" });
      }
      $$renderer2.push(`<!--]--></button> <button class="btn btn-ghost btn-sm text-error">`);
      Trash_2($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----></button></div>`);
    }
    $$renderer2.push(`<!--]--></div> <button class="btn btn-primary btn-sm w-full">+ Add Sort Level</button> <div class="modal-action"><form method="dialog"><button class="btn">Cancel</button></form> <button class="btn btn-primary">Apply</button></div></div></dialog>`);
  });
}
function SuperTable($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let sortedData, totalItems, totalPageCount, displayData, allSelected, someSelected;
    let data = fallback($$props["data"], () => [], true);
    let columns = fallback($$props["columns"], () => [], true);
    let rowKey = $$props["rowKey"];
    let mobileView = fallback($$props["mobileView"], "cards");
    let sort = fallback($$props["sort"], () => [], true);
    let itemsPerPageProp = fallback($$props["itemsPerPageProp"], 10);
    let totalItemsProp = fallback($$props["totalItemsProp"], void 0);
    let isLoadingProp = fallback($$props["isLoadingProp"], false);
    let tableClass = fallback($$props["tableClass"], "");
    let cardClass = fallback($$props["cardClass"], "");
    let rowClass = fallback($$props["rowClass"], "");
    const isSelectable = true;
    let serverSide = fallback($$props["serverSide"], false);
    let dbError = fallback($$props["dbError"], false);
    let maxVisibleColumns = fallback($$props["maxVisibleColumns"], 5);
    let selectionMode = fallback($$props["selectionMode"], "multiple");
    let disabledRowKeys = fallback($$props["disabledRowKeys"], () => [], true);
    let internalColumns = [];
    let filteredData = [];
    let filterTimeout;
    const FILTER_DEBOUNCE_MS = 300;
    function debouncedDispatchFilter(state) {
      if (filterTimeout) clearTimeout(filterTimeout);
      if (!serverSide) {
        filteredData = filterData(data, state, internalColumns);
      }
      filterTimeout = setTimeout(
        () => {
          if (serverSide) store_set(isLoading, true);
        },
        FILTER_DEBOUNCE_MS
      );
    }
    function handleGlobalFilter(value) {
      store_mutate($$store_subs ??= {}, "$filterState", filterState, store_get($$store_subs ??= {}, "$filterState", filterState).global = value);
      debouncedDispatchFilter(store_get($$store_subs ??= {}, "$filterState", filterState));
    }
    function clearSelection() {
      store_set(selectedIds, /* @__PURE__ */ new Set());
    }
    store_set(isLoading, Boolean(isLoadingProp));
    internalColumns = columns.map((col) => ({ ...col }));
    if (serverSide) {
      filteredData = data;
    }
    sortedData = sortData(filteredData, sort ?? null, internalColumns);
    totalItems = serverSide ? totalItemsProp ?? 0 : sortedData.length;
    totalPageCount = calculateTotalPages(totalItems, store_get($$store_subs ??= {}, "$itemsPerPage", itemsPerPage));
    displayData = serverSide ? sortedData : paginateData(sortedData, store_get($$store_subs ??= {}, "$currentPage", currentPage), store_get($$store_subs ??= {}, "$itemsPerPage", itemsPerPage));
    allSelected = displayData.length > 0 && displayData.every((row) => store_get($$store_subs ??= {}, "$selectedIds", selectedIds).has(row[rowKey]));
    someSelected = displayData.some((row) => store_get($$store_subs ??= {}, "$selectedIds", selectedIds).has(row[rowKey]));
    SortModal($$renderer2, {
      columns: internalColumns
    });
    $$renderer2.push(`<!----> <div class="w-full space-y-1"><div class="card mb-4 bg-base-100 shadow"><div class="card-body p-4"><div class="flex flex-col gap-4"><div class="w-full"><!--[-->`);
    slot(
      $$renderer2,
      $$props,
      "global-filter",
      {
        searchTerm: store_get($$store_subs ??= {}, "$filterState", filterState).global,
        updateSearchTerm: handleGlobalFilter
      },
      () => {
        FilterInput($$renderer2, {
          value: store_get($$store_subs ??= {}, "$filterState", filterState).global || ""
        });
      }
    );
    $$renderer2.push(`<!--]--> <!--[-->`);
    slot($$renderer2, $$props, "custom-filters", {}, null);
    $$renderer2.push(`<!--]--></div> <div class="flex flex-wrap items-center gap-x-4 gap-y-2"><div class="dropdown"><div tabindex="0" role="button" class="btn btn-sm">`);
    Columns_2($$renderer2, { class: "h-4 w-4" });
    $$renderer2.push(`<!----> Columns <svg width="12px" height="12px" class="inline-block h-2 w-2 fill-current opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l-839 839-839-839-128 128 967 967 967-967z"></path></svg></div> <ul role="menu" tabindex="0" class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"><!--[-->`);
    const each_array = ensure_array_like(internalColumns);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let column = each_array[$$index];
      $$renderer2.push(`<li><label class="label cursor-pointer"><span class="label-text">${escape_html(column.label)}</span> <input type="checkbox" class="checkbox checkbox-sm"${attr("checked", !column.hidden, true)}/></label></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div> <div class="tooltip tooltip-bottom" data-tip="Manage sort"><button class="btn btn-circle btn-ghost btn-sm">`);
    Arrow_up_down($$renderer2, { class: "h-4 w-4" });
    $$renderer2.push(`<!----></button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (selectionMode === "multiple" && store_get($$store_subs ??= {}, "$selectedIds", selectedIds).size > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-grow flex-wrap items-center justify-end gap-x-4 gap-y-2 rtl:justify-start"><div class="flex items-center gap-1"><span class="text-sm text-base-content/70">${escape_html(store_get($$store_subs ??= {}, "$selectedIds", selectedIds).size)} selected</span> <div class="tooltip tooltip-bottom" data-tip="Clear selection"><button class="btn btn-circle btn-ghost btn-sm" aria-label="Clear selection">`);
      Circle_x($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----></button></div></div> `);
      if (someSelected && !allSelected) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="btn btn-link btn-sm">Select all (${escape_html(displayData.length)})</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (allSelected) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<button class="btn btn-link btn-sm">Deselect all</button>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> <button class="btn btn-error btn-sm">`);
      Trash_2($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----> Delete Selected</button> <!--[-->`);
      slot(
        $$renderer2,
        $$props,
        "bulk-actions",
        {
          selectedIds: Array.from(store_get($$store_subs ??= {}, "$selectedIds", selectedIds))
        },
        null
      );
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></div> <div class="card bg-base-100 shadow"><div class="card-body px-0 py-0">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="overflow-x-auto"><table${attr_class(`table table-sm w-full ${stringify(tableClass)}`)}>`);
      TableHeader($$renderer2, {
        columns: internalColumns,
        currentSort: sort ?? null,
        filterValues: store_get($$store_subs ??= {}, "$filterState", filterState).columns,
        isSelectable: true,
        allSelected,
        someSelected
      });
      $$renderer2.push(`<!----><tbody>`);
      if (dbError) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<tr><td${attr("colspan", internalColumns.filter((c) => !c.hidden).length + 2)} class="p-8 text-center text-error"><!--[-->`);
        slot($$renderer2, $$props, "error-state", {}, () => {
          $$renderer2.push(`Gagal memuat data. Silakan coba lagi.`);
        });
        $$renderer2.push(`<!--]--></td></tr>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$isLoading", isLoading)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<tr><td${attr("colspan", internalColumns.filter((c) => !c.hidden).length + 2)} class="p-8 text-center"><!--[-->`);
          slot($$renderer2, $$props, "loading-state", {}, () => {
            $$renderer2.push(`<span class="loading loading-spinner"></span>`);
          });
          $$renderer2.push(`<!--]--></td></tr>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (data.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<tr><td${attr("colspan", internalColumns.filter((c) => !c.hidden).length + 2)} class="p-8 text-center text-base-content/70"><!--[-->`);
            slot($$renderer2, $$props, "empty-state", {}, () => {
              $$renderer2.push(`No data available`);
            });
            $$renderer2.push(`<!--]--></td></tr>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<!--[-->`);
            const each_array_2 = ensure_array_like(displayData);
            for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
              let row = each_array_2[$$index_2];
              TableRowDesktop($$renderer2, {
                row,
                columns: internalColumns,
                rowKey: String(rowKey),
                isSelectable: true,
                className: typeof rowClass === "function" ? rowClass(row) : rowClass,
                disabled: (disabledRowKeys || []).includes(row[rowKey]),
                $$slots: {
                  "row-actions": ($$renderer3, { row: row2 }) => {
                    {
                      $$renderer3.push(`<!--[-->`);
                      slot($$renderer3, $$props, "row-actions", { row: row2 }, null);
                      $$renderer3.push(`<!--]-->`);
                    }
                  }
                }
              });
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="borer card mx-0 bg-base-100 shadow"><div class="card-body px-4 py-2">`);
    if (!store_get($$store_subs ??= {}, "$isLoading", isLoading) && totalItems > 0) {
      $$renderer2.push("<!--[-->");
      PaginationControls($$renderer2, {
        currentPage: store_get($$store_subs ??= {}, "$currentPage", currentPage),
        totalPages: totalPageCount,
        itemsPerPage: store_get($$store_subs ??= {}, "$itemsPerPage", itemsPerPage),
        totalItems
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      data,
      columns,
      rowKey,
      mobileView,
      sort,
      itemsPerPageProp,
      totalItemsProp,
      isLoadingProp,
      tableClass,
      cardClass,
      rowClass,
      serverSide,
      dbError,
      maxVisibleColumns,
      selectionMode,
      disabledRowKeys,
      isSelectable,
      clearSelection
    });
  });
}
export {
  Chevron_right as C,
  SuperTable as S,
  Chevron_left as a
};
