<script lang="ts">
	import { onDestroy } from 'svelte';
	import { scale } from 'svelte/transition';
	import type { FormData } from '$lib/stores/muridForm';
	import Compressor from 'compressorjs';
	import { UserCircle } from 'lucide-svelte';

	// Props
	export let formData: FormData;
	export let handleInput: () => void;
	export let handleArabicInput: (event: Event) => void;

	// State
	let compressedFile: File | null = null;
	let previewUrl = ''; // Untuk pratinjau file baru yang dipilih
	let compressionError = '';
	let photoRemoved = false; // Flag untuk menandai foto dihapus

	// Variabel reaktif untuk menentukan URL gambar yang akan ditampilkan
	// Prioritas: Pratinjau baru > Foto yang ada > Fallback (null)
	$: displayUrl = previewUrl || (formData.fotoUrl && !photoRemoved ? formData.fotoUrl : null);

	async function handleFileUpload(originalFile: File) {
		return new Promise<File | null>((resolve) => {
			new Compressor(originalFile, {
				quality: 0.6,
				maxWidth: 1920,
				maxHeight: 1080,
				convertSize: 200000,
				success(result) {
					compressionError = '';
					const finalFile =
						result instanceof Blob
							? new File([result], originalFile.name, {
									type: result.type || 'image/jpeg',
									lastModified: originalFile.lastModified
								})
							: result;

					if (finalFile.size > 200000) {
						compressionError = 'Ukuran gambar masih terlalu besar. Coba gambar yang lebih kecil.';
						resolve(null);
						return;
					}

					compressedFile = finalFile;
					// Buat URL Object untuk pratinjau
					if (previewUrl) URL.revokeObjectURL(previewUrl); // Hapus pratinjau lama
					previewUrl = URL.createObjectURL(finalFile);
					photoRemoved = false; // Jika user memilih file baru, batalkan status 'dihapus'
					resolve(finalFile);
				},
				error(err) {
					console.error('Compression error:', err);
					compressionError = 'Terjadi kesalahan saat mengompres gambar.';
					resolve(null);
				}
			});
		});
	}

	export function reset() {
		// Reset state internal komponen ini ke kondisi awal
		photoRemoved = false;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = '';
		}
		compressionError = '';
	}

	function handleRemovePhoto() {
		photoRemoved = true;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = '';
		}
		formData.foto = undefined;
		formData.fotoUrl = null;
		handleInput();
	}

	onDestroy(() => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
	});
</script>

<fieldset class="space-y-4 rounded-lg border border-base-300 p-4">
	<legend class="px-2 text-lg font-semibold">Informasi Pribadi</legend>
	<div>
		<label for="nama" class="label">
			<span class="label-text">Nama Lengkap (sesuai KTP, jangan disingkat dan tanpa gelar):</span>
		</label>
		<input
			id="nama"
			name="nama"
			type="text"
			bind:value={formData.nama}
			on:input={handleInput}
			class="input input-bordered w-full"
			required
		/>
	</div>
	<div>
		<label for="namaArab" class="label">
			<span class="label-text">Nama Arab:</span>
		</label>
		<input
			id="namaArab"
			name="namaArab"
			type="text"
			bind:value={formData.namaArab}
			on:input={(event) => {
				handleArabicInput(event);
				handleInput();
			}}
			class="input input-bordered w-full"
			dir="rtl"
			placeholder="أدخل الاسم بالعربية"
		/>
	</div>

	<div class="form-control">
		<div class="label">
			<span class="label-text">Jenis Kelamin:</span>
		</div>
		<div class="flex items-center gap-6 pt-1">
			<div class="flex items-center gap-2">
				<input
					type="radio"
					id="pria"
					name="gender"
					bind:group={formData.gender}
					value={true}
					on:change={handleInput}
					class="radio"
				/>
				<label for="pria" class="label-text cursor-pointer">Pria</label>
			</div>
			<div class="flex items-center gap-2">
				<input
					type="radio"
					id="wanita"
					name="gender"
					bind:group={formData.gender}
					value={false}
					on:change={handleInput}
					class="radio"
				/>
				<label for="wanita" class="label-text cursor-pointer">Wanita</label>
			</div>
		</div>
	</div>

	<div>
		<label for="nik" class="label">
			<span class="label-text">NIK:</span>
		</label>
		<input
			id="nik"
			type="text"
			name="nik"
			placeholder="16 Digit Nomor Induk Kependudukan (NIK)"
			bind:value={formData.nik}
			on:input={handleInput}
			maxlength={16}
			class="input input-bordered w-full"
		/>
	</div>

	{#if formData.gender === true}
		<div transition:scale={{ duration: 300 }} class="space-y-2">
			<div class="label">
				<span class="label-text">Foto:</span>
			</div>

			<div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
				<!-- 
                    Tampilan Foto / Fallback 
                    - Tambahkan `flex-shrink-0` agar gambar tidak gepeng saat ruang terbatas.
                -->
				<div
					class="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-base-200 shadow-sm"
				>
					{#if displayUrl}
						<img
							src={displayUrl}
							alt="Pratinjau Foto Murid"
							class="h-full w-full rounded-lg object-cover"
							crossorigin="anonymous"
						/>
					{:else}
						<!-- Fallback Icon -->
						<UserCircle class="h-16 w-16 text-base-content/30" />
					{/if}
				</div>

				<!-- 
                    Kontainer Tombol 
                    - `w-full`: Ambil lebar penuh di layout mobile (kolom).
                    - `sm:grow`: Biarkan ia 'tumbuh' mengisi sisa ruang di layout desktop (baris).
                -->
				<div class="flex w-full flex-col gap-2 sm:grow">
					<input
						id="foto"
						name="foto"
						type="file"
						accept="image/*"
						class="file-input file-input-bordered w-full"
						on:change={async (e) => {
							const file = e.currentTarget.files?.[0];
							if (!file) return;
							const result = await handleFileUpload(file);
							if (result) {
								formData.foto = result;
								handleInput();
							}
						}}
					/>
					{#if displayUrl}
						<button
							type="button"
							on:click={handleRemovePhoto}
							class="btn btn-outline btn-error btn-sm"
						>
							Hapus Foto
						</button>
					{/if}
				</div>
			</div>

			{#if compressionError}
				<div class="label-text-alt pt-2 text-error">{compressionError}</div>
			{/if}

			<!-- Hidden input untuk memberi tahu server jika foto dihapus -->
			<input type="hidden" name="removeFoto" value={photoRemoved} />
		</div>
	{/if}

	<div>
		<label for="tglLahir" class="label">
			<span class="label-text">Tanggal Lahir:</span>
		</label>
		<input
			id="tglLahir"
			name="tglLahir"
			type="date"
			bind:value={formData.tglLahir}
			on:input={handleInput}
			class="input input-bordered w-full"
			required
		/>
	</div>
</fieldset>
