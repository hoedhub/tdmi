import { d as derived, w as writable } from "./index3.js";
const filterState = writable({
  global: "",
  columns: {}
});
const selectedIds = writable(/* @__PURE__ */ new Set());
const currentPage = writable(1);
const itemsPerPage = writable(10);
const isLoading = writable(false);
derived([itemsPerPage], ([$itemsPerPage], set) => {
  set(1);
});
export {
  isLoading as a,
  currentPage as c,
  filterState as f,
  itemsPerPage as i,
  selectedIds as s
};
