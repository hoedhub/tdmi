import { w as writable } from "./index3.js";
function createTooltipStore() {
  const { subscribe, set } = writable({
    isVisible: false,
    content: "",
    position: { top: 0, left: 0 }
  });
  return {
    subscribe,
    show: (content, rect) => {
      set({
        isVisible: true,
        content,
        position: {
          top: rect.top + rect.height / 2,
          left: rect.right + 8
          // Position to the right of the element with a small gap
        }
      });
    },
    hide: () => {
      set({
        isVisible: false,
        content: "",
        position: { top: 0, left: 0 }
      });
    }
  };
}
const tooltipStore = createTooltipStore();
export {
  tooltipStore as t
};
