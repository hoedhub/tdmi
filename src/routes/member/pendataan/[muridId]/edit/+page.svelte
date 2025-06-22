<script lang="ts">
	import type { PageData, ActionData } from './$types';
	// import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AddMuridForm from '$lib/components/data-entry/AddMuridForm.svelte';
	import { type FormData as MuridFormDataType } from '$lib/stores/muridForm';

	// Define ActionData explicitly to include all possible fields returned on failure
	interface ActionData extends FormData {
		success?: boolean;
		message?: string;
	}

	export let data: PageData;
	// export let form: ActionData;
	// 'form' adalah untuk hasil dari form action, biarkan saja.
	// Anda tidak perlu lagi mereplikasi semua state dari form di sini,
	// karena AddMuridForm akan mengelolanya secara internal.
	// export let form: any; // Anda bisa memberi tipe ActionData jika diperlukan.

	// 2. Buat state untuk menampung data yang sudah ditransformasi untuk form.
	//    Inisialisasi sebagai undefined agar kita bisa menunggunya di-render.
	let initialFormData: MuridFormDataType | undefined = undefined;

	// onUpdated akan dipanggil oleh AddMuridForm setelah sukses menyimpan data,
	// misalnya untuk navigasi atau menampilkan pesan.
	async function handleFormUpdate() {
		// console.log('Form berhasil di-update dari child component!');
		// Di sini Anda bisa menambahkan logika seperti navigasi
		await goto('/member/pendataan');
	}

	onMount(() => {
		// 3. Lakukan transformasi saat komponen dimuat dan data dari server tersedia.
		if (data.murid) {
			// console.log('Data dari server (sebelum transformasi):', data.murid);

			// Transformasikan objek `data.murid` ke bentuk `MuridFormDataType`.
			// Ini adalah langkah kunci untuk memperbaiki error.
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

				// --- Transformasi properti yang menyebabkan error ---
				// Konversi 'string | null' menjadi 'string | undefined'
				namaArab: data.murid.namaArab ?? undefined,
				alamat: data.murid.alamat ?? undefined,
				nomorTelepon: data.murid.nomorTelepon ?? undefined,
				nik: data.murid.nik ?? undefined,
				tglLahir: data.murid.tglLahir ?? '', // Pastikan string tidak null, beri default string kosong jika perlu

				// Handle 'foto'. Asumsikan AddMuridForm menerima string (URL) atau undefined.
				// Tipe 'unknown' dari server perlu di-cast atau diperiksa.
				// Jika foto adalah URL, ini cara yang aman:
				foto: typeof data.murid.foto === 'string' ? data.murid.foto : undefined,

				// Properti opsional lain yang mungkin tidak ada di `data.murid`
				// tapi ada di `MuridFormDataType`.
				muhrimData: undefined,
				mursyidData: undefined,
				baiatData: undefined,
				wiridData: undefined,
				previewFoto:
					typeof data.murid.foto === 'string' && data.murid.foto ? data.murid.foto : undefined
			};

			// console.log('Data untuk form (setelah transformasi):', initialFormData);
		}
	});
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<!-- Tampilkan nama dari data server yang asli -->
		<h1 class="card-title text-2xl">Edit Data Murid: {data.murid?.nama ?? 'Memuat...'}</h1>

		{#if data.canWriteMurid}
			<!-- 4. Render AddMuridForm hanya jika `initialFormData` sudah siap. -->
			{#if initialFormData}
				<!--
          Catatan:
          - Komponen 'AddMuridForm' sekarang akan menerima data dengan tipe yang benar.
          - Komponen ini juga akan mengelola state-nya sendiri, menyederhanakan halaman ini.
          - Kita teruskan `onUpdated` sebagai cara bagi child untuk berkomunikasi kembali.
        -->
				<AddMuridForm onUpdated={handleFormUpdate} formData={initialFormData} />
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
