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
	let kegiatan = (form as any)?.data?.kegiatan ?? data.nasyath.kegiatan;
	let tanggalMulai = formatDateForInput(
		(form as any)?.data?.tanggalMulai ?? data.nasyath.tanggalMulai
	);
	let tanggalSelesai = formatDateForInput(
		(form as any)?.data?.tanggalSelesai ?? data.nasyath.tanggalSelesai
	);
	let durasi = (form as any)?.data?.durasi ?? data.nasyath.durasi;
	let jarak = (form as any)?.data?.jarak ?? data.nasyath.jarak;
	let tempat = (form as any)?.data?.tempat ?? data.nasyath.tempat;
	let namaKontak = (form as any)?.data?.namaKontak ?? data.nasyath.namaKontak;
	let teleponKontak = (form as any)?.data?.teleponKontak ?? data.nasyath.teleponKontak;
	let keterangan = (form as any)?.data?.keterangan ?? data.nasyath.keterangan;

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

			if (result.type === 'failure') {
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

<div class="container mx-auto max-w-2xl p-4" dir="rtl">
	<h1 class="mb-6 text-2xl font-bold">تحرير نشاط اﻷعضاء</h1>

	{#if form?.message && !isLoading}
		<div class="alert alert-error mb-4">
			<span>{form.message}</span>
		</div>
	{/if}

	<form method="POST" class="space-y-4" use:enhance={handleSubmit}>
		<div class="form-control">
			<label for="kegiatan" class="label"><span class="label-text">اسم النشاط</span></label>
			<input
				type="text"
				id="kegiatan"
				name="kegiatan"
				class="input input-bordered w-full"
				required
				bind:value={kegiatan}
			/>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="form-control">
				<label for="tanggalMulai" class="label"><span class="label-text">تاريخ البدء</span></label>
				<input
					type="date"
					id="tanggalMulai"
					name="tanggalMulai"
					class="input input-bordered w-full"
					bind:value={tanggalMulai}
				/>
			</div>
			<div class="form-control">
				<label for="tanggalSelesai" class="label"
					><span class="label-text">تاريخ الانتهاء</span></label
				>
				<input
					type="date"
					id="tanggalSelesai"
					name="tanggalSelesai"
					class="input input-bordered w-full"
					bind:value={tanggalSelesai}
				/>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="form-control">
				<label for="durasi" class="label"><span class="label-text">المدة</span></label>
				<input
					type="text"
					id="durasi"
					name="durasi"
					class="input input-bordered w-full"
					placeholder="Contoh: 3 jam"
					bind:value={durasi}
				/>
			</div>
			<div class="form-control">
				<label for="jarak" class="label"><span class="label-text">المسافة</span></label>
				<input
					type="text"
					id="jarak"
					name="jarak"
					class="input input-bordered w-full"
					placeholder="Contoh: 10 km"
					bind:value={jarak}
				/>
			</div>
		</div>

		<div class="form-control">
			<label for="tempat" class="label"><span class="label-text">مكان التنفيذ</span></label>
			<input
				type="text"
				id="tempat"
				name="tempat"
				class="input input-bordered w-full"
				bind:value={tempat}
			/>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="form-control">
				<label for="namaKontak" class="label"><span class="label-text">اسم جهة الاتصال</span></label
				>
				<input
					type="text"
					id="namaKontak"
					name="namaKontak"
					class="input input-bordered w-full"
					bind:value={namaKontak}
				/>
			</div>
			<div class="form-control">
				<label for="teleponKontak" class="label"
					><span class="label-text">هاتف جهة الاتصال</span></label
				>
				<input
					type="tel"
					id="teleponKontak"
					name="teleponKontak"
					class="input input-bordered w-full"
					bind:value={teleponKontak}
				/>
			</div>
		</div>

		<div class="form-control">
			<label for="keterangan" class="label"><span class="label-text">ملاحظات</span></label>
			<textarea
				id="keterangan"
				name="keterangan"
				class="textarea textarea-bordered w-full"
				rows="3"
				bind:value={keterangan}
			></textarea>
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
