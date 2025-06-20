<script lang="ts">
	import { onDestroy } from 'svelte';
	import { scale } from 'svelte/transition';
	import type { MuridFormData } from '$lib/stores/muridForm';
	import Compressor from 'compressorjs';

	// Props
	export let formData: MuridFormData['formData'];
	export let handleInput: () => void;
	export let handleArabicInput: (event: Event) => void;

	// State
	let compressedFile: File | null = null;
	let previewUrl = '';
	let compressionError = '';

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
						compressionError = 'Image still too large. Please try a smaller image.';
						resolve(null);
						return;
					}

					compressedFile = finalFile;
					previewUrl = URL.createObjectURL(finalFile);
					resolve(finalFile);
				},
				error(err) {
					console.error('Compression error:', err);
					compressionError = 'There was an error compressing the image.';
					resolve(null);
				}
			});
		});
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

	<!-- Refactored Radio Group using daisyUI -->
	<div class="form-control">
		<label class="label">
			<span class="label-text">Jenis Kelamin:</span>
		</label>
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
		<div transition:scale={{ duration: 300 }}>
			<label for="foto" class="label">
				<span class="label-text">Foto:</span>
			</label>
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
			{#if compressionError}
				<div class="label-text-alt pt-2 text-error">{compressionError}</div>
			{/if}

			{#if previewUrl}
				<img
					src={previewUrl}
					alt="Preview"
					class="m-1 mt-2 block h-32 w-32 rounded-lg object-cover shadow-sm"
					on:error={() => (previewUrl = '')}
				/>
			{/if}
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
