import { w as writable, g as get } from "./index3.js";
const initialState = {
  formData: {
    nama: "",
    gender: true,
    qari: true,
    marhalah: 1,
    tglLahir: "",
    aktif: true,
    partisipasi: true,
    alamat: ""
  },
  propinsiList: [],
  kokabList: [],
  kecamatanList: [],
  deskelList: [],
  selectedPropinsi: null,
  selectedKokab: null,
  selectedKecamatan: null,
  isModified: false
};
function createMuridFormStore() {
  const { subscribe, set, update } = writable(initialState);
  return {
    subscribe,
    set,
    update,
    updateLists: (lists) => {
      update((store) => ({ ...store, ...lists }));
    },
    updateSelections: (selections) => {
      update((store) => ({ ...store, ...selections }));
    },
    updateFormData: (formData) => {
      update((store) => ({
        ...store,
        formData: { ...store.formData, ...formData },
        isModified: true
      }));
    },
    reset: () => set(initialState)
  };
}
createMuridFormStore();
function createMuridModalStore() {
  const { subscribe, set, update } = writable({
    muridData: [],
    totalItems: 0,
    loading: false,
    hasDbError: false,
    dataLoaded: false
  });
  async function fetchTableData(sort, filters, page = 1, pageSize = 5, excludeId) {
    const store = get({ subscribe });
    if (store.loading) return;
    update((state) => ({ ...state, loading: true, hasDbError: false }));
    try {
      const response = await fetch("/member/pendataan/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort, filters, page, pageSize, excludeId })
      });
      if (!response.ok) throw new Error("Failed to fetch murid data");
      const result = await response.json();
      update((state) => ({
        ...state,
        muridData: result.murid,
        totalItems: result.totalItems,
        dataLoaded: true
      }));
    } catch (error) {
      console.error("Error fetching table data:", error);
      update((state) => ({ ...state, hasDbError: true }));
    } finally {
      update((state) => ({ ...state, loading: false }));
    }
  }
  async function loadDataIfNeeded(sort, filters, page = 1, pageSize = 5, excludeId) {
    const store = get({ subscribe });
    if (!store.dataLoaded) {
      await fetchTableData(sort, filters, page, pageSize, excludeId);
    }
  }
  async function updateData(sort, filters, page = 1, pageSize = 5, excludeId) {
    await fetchTableData(sort, filters, page, pageSize, excludeId);
  }
  return {
    subscribe,
    loadDataIfNeeded,
    updateData
  };
}
const muridModalStore = createMuridModalStore();
export {
  muridModalStore as m
};
