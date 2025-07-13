<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AddMuridForm from '$lib/components/data-entry/AddMuridForm.svelte';
	import { type FormData as MuridFormDataType } from '$lib/stores/muridForm';

	export let data: PageData;

	// State untuk menampung data yang sudah ditransformasi untuk form.
	let initialFormData: MuridFormDataType | undefined = undefined;

	// onUpdated akan dipanggil oleh AddMuridForm setelah sukses menyimpan data.
	async function handleFormUpdate() {
		await goto('/member/pendataan');
	}

	onMount(() => {
		// Lakukan transformasi saat komponen dimuat dan data dari server tersedia.
		if (data.murid) {
			// Transformasikan objek `data.murid` dari server ke bentuk `MuridFormDataType`
			// yang diharapkan oleh komponen AddMuridForm.
			initialFormData = {
				// Properti yang tipenya sudah cocok bisa langsung disalin.
				nama: data.murid.nama,
				gender: data.murid.gender,
				qari: data.murid.qari,
				marhalah: data.murid.marhalah,
				aktif: data.murid.aktif,
				partisipasi: data.murid.partisipasi,
				muhrimId: data.murid.muhrimId ?? undefined,
				mursyidId: data.murid.mursyidId ?? undefined,
				baiatId: data.murid.baiatId ?? undefined,
				wiridId: data.murid.wiridId ?? undefined,
				deskelId: data.murid.deskelId ?? undefined,

				// Konversi 'string | null' dari server menjadi 'string | undefined' atau ''
				namaArab: data.murid.namaArab ?? undefined,
				alamat: data.murid.alamat ?? undefined,
				nomorTelepon: data.murid.nomorTelepon ?? undefined,
				nik: data.murid.nik ?? undefined,
				tglLahir: data.murid.tglLahir ?? '',

				// --- PERBAIKAN UTAMA DI SINI ---
				// `foto` harus `undefined` pada awalnya karena belum ada file baru yang dipilih.
				// Tipe `File` hanya digunakan untuk file yang diunggah dari <input type="file">.
				foto: undefined,

				// `fotoUrl` adalah tempat untuk menyimpan URL (string Base64) dari gambar yang ada.
				// Ini akan digunakan oleh AddMuridForm untuk menampilkan gambar yang sudah ada.
				fotoUrl: data.murid.fotoUrl,

				// Properti lain yang tidak diinisialisasi dari data server.
				muhrimData: undefined,
				mursyidData: undefined,
				baiatData: undefined,
				wiridData: undefined

				// Properti `previewFoto` tidak lagi diperlukan karena logikanya sudah
				// ditangani di dalam AddMuridForm dengan `displayUrl`.
			};
		}
	});
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h1 class="card-title text-2xl">Edit Data Murid: {data.murid?.nama ?? 'Memuat...'}</h1>

		{#if data.canWriteMurid}
			<!-- Render AddMuridForm hanya jika `initialFormData` sudah siap. -->
			{#if initialFormData}
				<!--
          Sekarang `initialFormData` memiliki tipe yang benar:
          - `foto` bertipe `undefined`
          - `fotoUrl` berisi string URL gambar (atau null)
          Ini akan cocok dengan prop yang diharapkan oleh AddMuridForm.
        -->
				<AddMuridForm formData={initialFormData} editedMuridId={data.murid.id} />
			{:else}
				<div class="flex items-center justify-center p-8">
					<span class="loading loading-spinner loading-lg"></span>
					<p class="ml-4">Mempersiapkan form...</p>
				</div>
			{/if}
		{:else}
			<p class="text-warning">Anda tidak memiliki izin untuk mengubah data murid ini.</p>
		{/if}
	</div>
</div>
