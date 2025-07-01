<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance, applyAction } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { success, error } from '$lib/components/toast';
	import { Save, RefreshCw } from 'lucide-svelte';

	export let form: ActionData;
	let isLoading: boolean = false;

	async function handleSubmit() {
		if (isLoading) return;
		isLoading = true;

		return async ({ result }: { result: ActionResult }) => {
			// Matikan loading state setelah aksi selesai, apa pun hasilnya
			isLoading = false;

			if (result.type === 'error') {
				// Tampilkan pesan error dari server menggunakan toast
				error(result.error?.message || 'Terjadi kesalahan yang tidak diketahui.', {
					duration: 5000
				});
				// Jangan panggil applyAction agar pengguna bisa memperbaiki input
				return;
			}

			if (result.type === 'fail') {
				// Pesan kegagalan validasi akan ditampilkan oleh 'form' di atas.
				// Toast tidak diperlukan di sini agar tidak duplikat.
				return;
			}

			// Tampilkan toast sukses sebelum redirect
			if (result.type === 'redirect') {
				success('Data nasyath berhasil disimpan!');
			}

			// Biarkan SvelteKit menangani redirect atau update lainnya
			await applyAction(result);
		};
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="text-2xl font-bold mb-6">Tambah Kegiatan Nasyath Baru</h1>

	{#if form?.message && !isLoading}
		<div class="alert alert-error mb-4">
			<span>{form.message}</span>
		</div>
	{/if}

	<form method="POST" class="space-y-4" use:enhance={handleSubmit}>
		<!-- Baris 1: Kegiatan -->
		<div class="form-control">
			<label for="kegiatan" class="label">
				<span class="label-text">Nama Kegiatan</span>
			</label>
			<input
				type="text"
				id="kegiatan"
				name="kegiatan"
				class="input input-bordered w-full"
				required
				value={form?.kegiatan || ''}
			/>
		</div>

		<!-- Baris 2: Tanggal Mulai & Selesai -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="tanggalMulai" class="label">
					<span class="label-text">Tanggal Mulai</span>
				</label>
				<input
					type="date"
					id="tanggalMulai"
					name="tanggalMulai"
					class="input input-bordered w-full"
					value={form?.tanggalMulai || ''}
				/>
			</div>
			<div class="form-control">
				<label for="tanggalSelesai" class="label">
					<span class="label-text">Tanggal Selesai</span>
				</label>
				<input
					type="date"
					id="tanggalSelesai"
					name="tanggalSelesai"
					class="input input-bordered w-full"
					value={form?.tanggalSelesai || ''}
				/>
			</div>
		</div>

		<!-- Baris 3: Durasi & Jarak -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="durasi" class="label">
					<span class="label-text">Durasi (e.g., 3 jam, 2 hari)</span>
				</label>
				<input
					type="text"
					id="durasi"
					name="durasi"
					class="input input-bordered w-full"
					placeholder="Contoh: 3 jam"
					value={form?.durasi || ''}
				/>
			</div>
			<div class="form-control">
				<label for="jarak" class="label">
					<span class="label-text">Jarak (e.g., 10 km)</span>
				</label>
				<input
					type="text"
					id="jarak"
					name="jarak"
					class="input input-bordered w-full"
					placeholder="Contoh: 10 km"
					value={form?.jarak || ''}
				/>
			</div>
		</div>

		<!-- Baris 4: Tempat -->
		<div class="form-control">
			<label for="tempat" class="label">
				<span class="label-text">Tempat Pelaksanaan</span>
			</label>
			<input
				type="text"
				id="tempat"
				name="tempat"
				class="input input-bordered w-full"
				value={form?.tempat || ''}
			/>
		</div>

		<!-- Baris 5: Kontak Person -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="namaKontak" class="label">
					<span class="label-text">Nama Kontak Person</span>
				</label>
				<input
					type="text"
					id="namaKontak"
					name="namaKontak"
					class="input input-bordered w-full"
					value={form?.namaKontak || ''}
				/>
			</div>
			<div class="form-control">
				<label for="teleponKontak" class="label">
					<span class="label-text">Telepon Kontak Person</span>
				</label>
				<input
					type="tel"
					id="teleponKontak"
					name="teleponKontak"
					class="input input-bordered w-full"
					value={form?.teleponKontak || ''}
				/>
			</div>
		</div>

		<!-- Baris 6: Keterangan -->
		<div class="form-control">
			<label for="keterangan" class="label">
				<span class="label-text">Keterangan Tambahan</span>
			</label>
			<textarea
				id="keterangan"
				name="keterangan"
				class="textarea textarea-bordered w-full"
				rows="3"
			>{form?.keterangan || ''}</textarea>
		</div>

		<div class="flex justify-end space-x-2 pt-4">
			<a href="/member/nasyath_mun" class="btn btn-ghost">Batal</a>
			<button type="submit" class="btn btn-primary" disabled={isLoading}>
				{#if isLoading}
					<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
					Menyimpan...
				{:else}
					<Save class="mr-2 h-5 w-5" />
					Simpan
				{/if}
			</button>
		</div>
	</form>
</div>
