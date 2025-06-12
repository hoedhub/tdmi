<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<h1>Halaman Nasyath</h1>
<p>{data.message}</p>

<!-- Tampilkan konten halaman nasyath di sini -->
<p>
	Halaman ini hanya bisa diakses oleh pengguna dengan peran Nasyath atau peran di atasnya (Admin,
	Naib, dll).
</p>
