import { w as writable } from "./index3.js";
function createAbsoluteDropdownStore() {
  const { subscribe, set, update } = writable({
    isOpen: false,
    position: null,
    // Initialize with null
    direction: "down",
    component: null,
    data: null
  });
  return {
    subscribe,
    toggle: (position, component, direction = "down", data = null) => {
      update((state) => {
        if (state.isOpen && state.component === component) {
          return { ...state, isOpen: false };
        }
        return { isOpen: true, position, component, direction, data };
      });
    },
    close: () => set({
      isOpen: false,
      position: null,
      component: null,
      direction: "down",
      data: null
    })
  };
}
const absoluteDropdownStore = createAbsoluteDropdownStore();
export {
  absoluteDropdownStore as a
};
