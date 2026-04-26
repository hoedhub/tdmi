<script lang="ts">
	import { onDestroy } from 'svelte';
	import { scale } from 'svelte/transition';
	import type { FormData } from '$lib/stores/muridForm';
	import Compressor from 'compressorjs';
	import { UserCircle, Calendar as CalendarIcon } from 'lucide-svelte';
	import SimilarMuridsAlert from '../data-entry/SimilarMuridsAlert.svelte';
	import { toTitleCase } from '$lib/utils/string';
	import { formatDateShort } from '$lib/utils/date';

	// Props
	interface Props {
		formData: FormData;
		handleInput: () => void;
		handleArabicInput: (event: Event) => void;
		similarMurids?: any[];
		onclose: () => void;
	}

	let {
		formData = $bindable(),
		handleInput,
		handleArabicInput,
		similarMurids = [],
		onclose
	}: Props = $props();

	// State
	let compressedFile: File | null = null;
	let previewUrl = $state('');
	let compressionError = $state('');
	let photoRemoved = $state(false);
	let hoveredName: string | null = $state(null); // State untuk visual hover
	let dateInput: HTMLInputElement | undefined = $state();
	let displayDate = $state('');

	function formatToDisplay(date: string | null | undefined): string {
		if (!date) return '';
		const parts = date.split('-');
		if (parts.length !== 3) return '';
		const [y, m, d] = parts;
		return `${d}/${m}/${y}`;
	}

	function handleDateTextInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		let val = input.value.replace(/\D/g, '');
		if (val.length > 8) val = val.slice(0, 8);

		let formatted = '';
		if (val.length > 0) {
			formatted += val.slice(0, 2);
			if (val.length > 2) {
				formatted += '/' + val.slice(2, 4);
				if (val.length > 4) {
					formatted += '/' + val.slice(4, 8);
				}
			}
		}

		displayDate = formatted;
		input.value = formatted;

		if (val.length === 8) {
			const d = val.slice(0, 2);
			const m = val.slice(2, 4);
			const y = val.slice(4, 8);
			
			// Simple validation
			const dayNum = parseInt(d);
			const monthNum = parseInt(m);
			const yearNum = parseInt(y);
			
			if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31 && yearNum > 1900) {
				formData.tglLahir = `${y}-${m}-${d}`;
				handleInput();
			}
		} else if (val.length === 0) {
			formData.tglLahir = '';
			handleInput();
		}
	}

	$effect(() => {
		// Sync display date when formData.tglLahir changes from outside (e.g. reset)
		displayDate = formatToDisplay(formData.tglLahir);
	});

	let displayUrl = $derived(previewUrl || (formData.fotoUrl && !photoRemoved ? formData.fotoUrl : null));

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
					if (previewUrl) URL.revokeObjectURL(previewUrl);
					previewUrl = URL.createObjectURL(finalFile);
					photoRemoved = false;
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
		<div class="relative">
			<input
				id="nama"
				name="nama"
				type="text"
				bind:value={formData.nama}
				oninput={(e) => {
					formData.nama = toTitleCase(e.currentTarget.value);
					handleInput();
				}}
				class="input input-bordered w-full {hoveredName ? 'text-transparent' : ''}"
				required
			/>
			{#if hoveredName}
				<div
					class="input input-bordered pointer-events-none absolute left-0 top-0 flex w-full items-center bg-base-200/50"
				>
					{hoveredName}
				</div>
			{/if}
		</div>
		<div class="mt-2">
			<SimilarMuridsAlert
				{similarMurids}
				{onclose}
				on:nameSelect={(e) => {
					formData.nama = e.detail;
					handleInput();
				}}
				on:nameHoverStart={(e) => (hoveredName = e.detail)}
				on:nameHoverEnd={() => (hoveredName = null)}
			/>
		</div>
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
			oninput={(event) => {
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
					onchange={handleInput}
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
					onchange={handleInput}
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
			oninput={handleInput}
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
						<UserCircle class="h-16 w-16 text-base-content/30" />
					{/if}
				</div>

				<div class="flex w-full flex-col gap-2 sm:grow">
					<input
						id="foto"
						name="foto"
						type="file"
						accept="image/*"
						class="file-input file-input-bordered w-full"
						onchange={async (e) => {
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
							onclick={handleRemovePhoto}
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

			<input type="hidden" name="removeFoto" value={photoRemoved} />
		</div>
	{/if}

	<div>
		<label for="tglLahir" class="label">
			<span class="label-text">Tanggal Lahir (dd/mm/yyyy):</span>
		</label>
		<div class="relative">
			<input
				id="tglLahirDisplay"
				type="text"
				placeholder="dd/mm/yyyy"
				value={displayDate}
				oninput={handleDateTextInput}
				class="input input-bordered w-full pr-10"
				required
			/>
			<button
				type="button"
				class="absolute right-0 top-0 h-full px-3 text-base-content/50 hover:text-primary"
				onclick={() => dateInput?.showPicker()}
				title="Pilih Tanggal"
			>
				<CalendarIcon class="h-5 w-5" />
			</button>
			<input
				bind:this={dateInput}
				id="tglLahir"
				name="tglLahir"
				type="date"
				bind:value={formData.tglLahir}
				oninput={handleInput}
				class="pointer-events-none absolute inset-0 opacity-0"
				tabindex="-1"
			/>
		</div>
	</div>
</fieldset>
