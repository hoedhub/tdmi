import { f as attr_class, d as attr, g as stringify, a as spread_props, e as ensure_array_like, m as attr_style, c as store_get, k as element, u as unsubscribe_stores } from "../../chunks/index4.js";
import { r as run } from "../../chunks/legacy-server.js";
import { o as onDestroy, h as html, X } from "../../chunks/x.js";
import { d as dismiss, t as toastStore, _ as _setMaxToasts } from "../../chunks/ToastContainer.svelte_svelte_type_style_lang.js";
import { e as escape_html } from "../../chunks/escaping.js";
import { a as absoluteDropdownStore } from "../../chunks/absoluteDropdown.js";
import { t as tooltipStore } from "../../chunks/tooltipStore.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
function Toast($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      id,
      type,
      title = void 0,
      message,
      icon = void 0,
      iconProps = { size: 24 },
      duration,
      showCloseButton,
      progress,
      pauseOnHover,
      actions = [],
      customClass = "",
      allowHtml = false,
      onDismiss = void 0,
      createdAt
    } = $$props;
    run(() => {
    });
    let timerId = void 0;
    let remainingDuration = duration;
    let isPaused = false;
    let alertClass = {
      info: "alert-info",
      success: "alert-success",
      warning: "alert-warning",
      error: "alert-error",
      loading: "alert-info",
      // Or a specific loading style
      custom: ""
      // Custom type relies on customClass
    }[type];
    let progressColorClass = {
      info: "bg-info-content",
      // Or 'bg-info' for DaisyUI v3, check v4 variables
      success: "bg-success-content",
      warning: "bg-warning-content",
      error: "bg-error-content",
      loading: "bg-info-content",
      custom: "bg-neutral-content"
      // A sensible default for custom
    }[type];
    function startTimer() {
      if (duration === Infinity || duration <= 0) return;
      isPaused = false;
      clearTimeout(timerId);
      timerId = window.setTimeout(
        () => {
          dismiss(id);
        },
        remainingDuration
      );
    }
    onDestroy(() => {
      clearTimeout(timerId);
    });
    run(() => {
      if (duration && id) {
        remainingDuration = duration;
        if (duration > 0 && duration !== Infinity) {
          startTimer();
        } else {
          clearTimeout(timerId);
        }
      }
    });
    $$renderer2.push(`<div${attr_class(`alert w-full shadow-lg ${stringify(alertClass)} ${stringify(customClass)}`, "svelte-gsmliz")} role="alert"${attr("aria-live", type === "error" || type === "warning" ? "assertive" : "polite")}>`);
    if (icon) {
      $$renderer2.push("<!--[-->");
      const SvelteComponent = icon;
      $$renderer2.push(`<div class="flex-shrink-0"><!---->`);
      SvelteComponent($$renderer2, spread_props([iconProps]));
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex-grow">`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<h3 class="text-lg font-bold">${escape_html(title)}</h3>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (allowHtml) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-sm">${html(message)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="text-sm">${escape_html(message)}</div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (actions && actions.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`flex flex-shrink-0 flex-col gap-2 sm:flex-row ${stringify(title || message ? "sm:ml-auto" : "")} items-center`)}><!--[-->`);
      const each_array = ensure_array_like(actions);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let action = each_array[$$index];
        $$renderer2.push(`<button${attr_class(`btn btn-sm ${stringify(action.class || (type === "custom" ? "btn-outline" : `btn-outline btn-${type}`))}`, "svelte-gsmliz")}>`);
        if (action.icon) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<!---->`);
          action.icon($$renderer2, spread_props([action.iconProps || { size: 16, class: "mr-1" }]));
          $$renderer2.push(`<!---->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> ${escape_html(action.label)}</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showCloseButton) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex-shrink-0"><button class="btn btn-circle btn-ghost btn-sm" aria-label="Close notification">`);
      X($$renderer2, { size: 20 });
      $$renderer2.push(`<!----></button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (progress && duration > 0 && duration !== Infinity) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`absolute bottom-0 left-0 right-0 h-1 opacity-70 ${stringify(progressColorClass)}`, "svelte-gsmliz")}${attr_style("", {
        animation: `toast-progress ${stringify(duration)}ms linear forwards`,
        "animation-play-state": isPaused ? "paused" : "running"
      })}></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function ToastContainer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let {
      position = "top-right",
      maxToasts = 5,
      spacing = "gap-2",
      containerElementTag = "div",
      customClass = ""
    } = $$props;
    run(() => {
      _setMaxToasts(maxToasts);
    });
    const toasts = toastStore;
    let positionClasses = "";
    run(() => {
      let basePositioning = "fixed z-[9999] p-4 flex";
      switch (position) {
        case "top-left":
          positionClasses = `${basePositioning} top-0 left-0 flex-col items-start`;
          break;
        case "top-center":
          positionClasses = `${basePositioning} top-0 left-1/2 -translate-x-1/2 flex-col items-center`;
          break;
        case "top-right":
          positionClasses = `${basePositioning} top-0 right-0 flex-col items-end`;
          break;
        case "bottom-left":
          positionClasses = `${basePositioning} bottom-0 left-0 flex-col-reverse items-start`;
          break;
        case "bottom-center":
          positionClasses = `${basePositioning} bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center`;
          break;
        case "bottom-right":
          positionClasses = `${basePositioning} bottom-0 right-0 flex-col-reverse items-end`;
          break;
        default:
          positionClasses = `${basePositioning} top-0 right-0 flex-col items-end`;
      }
    });
    run(() => {
      if (position.startsWith("bottom-")) ;
      else if (position.includes("-left")) ;
      else if (position.includes("-right")) ;
      else ;
    });
    if (store_get($$store_subs ??= {}, "$toasts", toasts) && store_get($$store_subs ??= {}, "$toasts", toasts).length > 0) {
      $$renderer2.push("<!--[-->");
      element(
        $$renderer2,
        containerElementTag,
        () => {
          $$renderer2.push(`${attr_class(`${stringify(positionClasses)} ${stringify(spacing)} ${stringify(customClass)}`)} role="region" aria-live="polite" aria-label="Notifications"`);
        },
        () => {
          $$renderer2.push(`<!--[-->`);
          const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$toasts", toasts));
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let toast = each_array[$$index];
            $$renderer2.push(`<div class="toast-item w-full max-w-md">`);
            Toast($$renderer2, spread_props([toast]));
            $$renderer2.push(`<!----></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
      );
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function AbsoluteDropdown($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let menuStyle = "";
    absoluteDropdownStore.subscribe(($store) => {
      if ($store.isOpen && $store.position) {
        const { position, direction } = $store;
        const horizontalPosition = window.innerWidth - position.right > 208 ? (
          // w-52 approx
          `left: ${position.left}px;`
        ) : `right: ${window.innerWidth - position.right}px;`;
        const verticalPosition = direction === "up" ? `bottom: ${window.innerHeight - position.top + 4}px;` : `top: ${position.bottom + 4}px;`;
        menuStyle = verticalPosition + " " + horizontalPosition;
      }
    });
    if (store_get($$store_subs ??= {}, "$absoluteDropdownStore", absoluteDropdownStore).isOpen && store_get($$store_subs ??= {}, "$absoluteDropdownStore", absoluteDropdownStore).component) {
      $$renderer2.push("<!--[-->");
      const SvelteComponent = store_get($$store_subs ??= {}, "$absoluteDropdownStore", absoluteDropdownStore).component;
      $$renderer2.push(`<div class="fixed inset-0 z-40" aria-hidden="true"></div> <div${attr_style(menuStyle)} class="fixed z-50 rounded-box bg-base-300 shadow-lg"><!---->`);
      SvelteComponent($$renderer2, spread_props([
        store_get($$store_subs ??= {}, "$absoluteDropdownStore", absoluteDropdownStore).data
      ]));
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Tooltip($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let style = "";
    tooltipStore.subscribe(($store) => {
      if ($store.isVisible) {
        style = `top: ${$store.position.top}px; left: ${$store.position.left}px; transform: translateY(-50%);`;
      }
    });
    if (store_get($$store_subs ??= {}, "$tooltipStore", tooltipStore).isVisible) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_style(style)} class="pointer-events-none fixed z-[99] rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg" role="tooltip">${escape_html(store_get($$store_subs ??= {}, "$tooltipStore", tooltipStore).content)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    AbsoluteDropdown($$renderer2);
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2);
    $$renderer2.push(`<!----> `);
    children?.($$renderer2);
    $$renderer2.push(`<!----> `);
    ToastContainer($$renderer2, { position: "bottom-center" });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _layout as default
};
