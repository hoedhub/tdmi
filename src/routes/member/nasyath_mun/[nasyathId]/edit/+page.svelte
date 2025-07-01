<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance, applyAction } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { success, error } from '$lib/components/toast';
	import { Save, RefreshCw } from 'lucide-svelte';

	export let data: PageData;
	export let form: ActionData;
	let isLoading: boolean = false;

	// Helper untuk memformat tanggal YYYY-MM-DD yang diterima dari server
	function formatDateForInput(dateString: string | null | undefined): string {
		if (!dateString) return '';
		// Pastikan kita hanya mengambil bagian tanggal, abaikan waktu
		return dateString.split('T')[0];
	}

	// Inisialisasi nilai form dari `data` (saat load) atau `form` (saat gagal submit)
	$: kegiatan = form?.kegiatan ?? data.nasyath.kegiatan;
	$: tanggalMulai = formatDateForInput(form?.tanggalMulai ?? data.nasyath.tanggalMulai);
	$: tanggalSelesai = formatDateForInput(form?.tanggalSelesai ?? data.nasyath.tanggalSelesai);
	$: durasi = form?.durasi ?? data.nasyath.durasi;
	$: jarak = form?.jarak ?? data.nasyath.jarak;
	$: tempat = form?.tempat ?? data.nasyath.tempat;
	$: namaKontak = form?.namaKontak ?? data.nasyath.namaKontak;
	$: teleponKontak = form?.teleponKontak ?? data.nasyath.teleponKontak;
	$: keterangan = form?.keterangan ?? data.nasyath.keterangan;

	async function handleSubmit() {
		if (isLoading) return;
		isLoading = true;

		return async ({ result }: { result: ActionResult }) => {
			isLoading = false;

			if (result.type === 'error') {
				error(result.error?.message || 'Terjadi kesalahan yang tidak diketahui.', {
					duration: 5000
				});
				return;
			}

			if (result.type === 'fail') {
				// Biarkan pesan validasi ditampilkan di atas form
				return;
			}

			if (result.type === 'redirect') {
				success('Data nasyath berhasil diperbarui!');
			}

			await applyAction(result);
		};
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="text-2xl font-bold mb-6">Edit Kegiatan Nasyath</h1>

	{#if form?.message && !isLoading}
		<div class="alert alert-error mb-4">
			<span>{form.message}</span>
		</div>
	{/if}

	<form method="POST" class="space-y-4" use:enhance={handleSubmit}>
		<div class="form-control">
			<label for="kegiatan" class="label"><span class="label-text">Nama Kegiatan</span></label>
			<input type="text" id="kegiatan" name="kegiatan" class="input input-bordered w-full" required bind:value={kegiatan} />
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="tanggalMulai" class="label"><span class="label-text">Tanggal Mulai</span></label>
				<input type="date" id="tanggalMulai" name="tanggalMulai" class="input input-bordered w-full" bind:value={tanggalMulai} />
			</div>
			<div class="form-control">
				<label for="tanggalSelesai" class="label"><span class="label-text">Tanggal Selesai</span></label>
				<input type="date" id="tanggalSelesai" name="tanggalSelesai" class="input input-bordered w-full" bind:value={tanggalSelesai} />
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="durasi" class="label"><span class="label-text">Durasi</span></label>
				<input type="text" id="durasi" name="durasi" class="input input-bordered w-full" placeholder="Contoh: 3 jam" bind:value={durasi} />
			</div>
			<div class="form-control">
				<label for="jarak" class="label"><span class="label-text">Jarak</span></label>
				<input type="text" id="jarak" name="jarak" class="input input-bordered w-full" placeholder="Contoh: 10 km" bind:value={jarak} />
			</div>
		</div>

		<div class="form-control">
			<label for="tempat" class="label"><span class="label-text">Tempat Pelaksanaan</span></label>
			<input type="text" id="tempat" name="tempat" class="input input-bordered w-full" bind:value={tempat} />
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="namaKontak" class="label"><span class="label-text">Nama Kontak</span></label>
				<input type="text" id="namaKontak" name="namaKontak" class="input input-bordered w-full" bind:value={namaKontak} />
			</div>
			<div class="form-control">
				<label for="teleponKontak" class="label"><span class="label-text">Telepon Kontak</span></label>
				<input type="tel" id="teleponKontak" name="teleponKontak" class="input input-bordered w-full" bind:value={teleponKontak} />
			</div>
		</div>

		<div class="form-control">
			<label for="keterangan" class="label"><span class="label-text">Keterangan</span></label>
			<textarea id="keterangan" name="keterangan" class="textarea textarea-bordered w-full" rows="3" bind:value={keterangan}></textarea>
		</div>

		<div class="flex justify-end space-x-2 pt-4">
			<a href="/member/nasyath_mun" class="btn btn-ghost">Batal</a>
			<button type="submit" class="btn btn-primary" disabled={isLoading}>
				{#if isLoading}
					<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
					Memperbarui...
				{:else}
					<Save class="mr-2 h-5 w-5" />
					Simpan Perubahan
				{/if}
			</button>
		</div>
	</form>
</div>
