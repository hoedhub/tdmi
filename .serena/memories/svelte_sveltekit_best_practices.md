**Basis Pengetahuan Svelte & SvelteKit**

Ini adalah kumpulan aturan sintaks, praktik terbaik, dan pola umum untuk pengembangan Svelte dan SvelteKit.

---

### Sintaks Svelte

1.  **Penempatan `{@const}`**:
    *   Tag `{@const}` harus menjadi *anak langsung* dari blok logika (`{#if}`, `{#each}`, `{:then}`, dll.) atau komponen. Ia tidak boleh berada di dalam elemen HTML biasa seperti `<div>`.
    *   **Salah:** `{#if condition}<div>{@const myVar = ...}</div>{/if}`
    *   **Benar:** `{#if condition}{@const myVar = ...}<div>...</div>{/if}`
