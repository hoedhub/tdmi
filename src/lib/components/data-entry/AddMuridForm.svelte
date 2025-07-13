<script lang="ts">
	import { scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { muridFormStore, type FormData } from '$lib/stores/muridForm';
	import type { propTable, kokabTable, kecamatanTable } from '$lib/drizzle/schema';
	import { type InferSelectModel } from 'drizzle-orm';
	import { success, error } from '$lib/components/toast';

	// Form Components
	import PersonalInfoForm from '../forms/PersonalInfoForm.svelte';
	import ContactForm from '../forms/ContactForm.svelte';
	import IrsyadiyahForm from '../forms/IrsyadiyahForm.svelte';
	import StatusForm from '../forms/StatusForm.svelte';

	type Propinsi = InferSelectModel<typeof propTable>;
	type Kokab = InferSelectModel<typeof kokabTable>;
	type Kecamatan = InferSelectModel<typeof kecamatanTable>;

	// --- PROPS ---
	export let formData: FormData | undefined = undefined;
	export let propinsiList: Propinsi[] = [];
	export let editedMuridId: number | undefined = undefined;

	// --- STATE ---
	let countryId: string;
	let countryCode: string;
	let phoneNumber: string;

	const defaultFormData: FormData = {
		nama: '',
		namaArab: '',
		gender: true,
		deskelId: undefined,
		alamat: '',
		nomorTelepon: '',
		muhrimId: undefined,
		mursyidId: undefined,
		baiatId: undefined,
		wiridId: undefined,
		muhrimData: undefined,
		mursyidData: undefined,
		baiatData: undefined,
		wiridData: undefined,
		qari: true,
		marhalah: 1,
		tglLahir: '',
		aktif: true,
		partisipasi: true,
		nik: '',
		foto: undefined
	};

	// --- Buat state untuk menyimpan data asli ---
	// 'originalFormData' akan menyimpan snapshot data saat pertama kali dimuat.
	let originalFormData: FormData;
	// Snapshot terpisah untuk state wilayah
	let originalSelectedPropinsi: Propinsi | null = null;
	let originalSelectedKokab: Kokab | null = null;
	let originalSelectedKecamatan: Kecamatan | null = null;

	// State aktif form
	let internalFormData: FormData = { ...defaultFormData };
	let selectedPropinsi: Propinsi | null = null;
	let selectedKokab: Kokab | null = null;
	let selectedKecamatan: Kecamatan | null = null;

	let isFormModified = false;
	let isSubmitting = false;
	let mounted = false;

	let personalInfoFormComponent: PersonalInfoForm;

	// --- SIKLUS HIDUP (LIFECYCLE) ---
	onMount(() => {
		if (formData) {
			// **MODE EDIT**:
			// Simpan data dari prop ke state internal dan juga ke snapshot data asli.
			internalFormData = { ...formData };
			originalFormData = { ...formData }; // Simpan snapshot
		} else {
			// **MODE TAMBAH BARU**:
			// Gunakan data dari store atau default. Data aslinya adalah form kosong.
			internalFormData = $muridFormStore.isModified
				? $muridFormStore.formData
				: { ...defaultFormData };
			originalFormData = { ...defaultFormData }; // Snapshotnya adalah form kosong

			// Inisialisasi state wilayah dari store juga
			selectedPropinsi = $muridFormStore.selectedPropinsi;
			selectedKokab = $muridFormStore.selectedKokab;
			selectedKecamatan = $muridFormStore.selectedKecamatan;
		}

		// Simpan snapshot untuk state wilayah setelah inisialisasi
		originalSelectedPropinsi = selectedPropinsi;
		originalSelectedKokab = selectedKokab;
		originalSelectedKecamatan = selectedKecamatan;

		mounted = true;
		// Panggil handleInput di akhir untuk set isFormModified ke false pada awalnya.
		handleInput();
	});

	// --- FUNGSI-FUNGSI ---
	function handleInput() {
		setTimeout(() => {
			// 1. Bandingkan data form
			if (!mounted) return; // Pastikan ini hanya berjalan setelah komponen dimount
			const formChanged = Object.keys(internalFormData).some((key) => {
				const formKey = key as keyof FormData;

				const internalValue = JSON.stringify(internalFormData[formKey]);
				const originalValue = JSON.stringify(originalFormData[formKey]);

				// LOGGING: Cek nilai spesifik yang berubah
				// console.log(`  - Internal: ${internalValue}`);
				// console.log(`  - Original: ${originalValue}`);
				// if (internalValue !== originalValue) {
				// 	console.log(`CHANGE DETECTED in key '${formKey}':`);
				// }
				return (
					JSON.stringify(internalFormData[formKey]) !== JSON.stringify(originalFormData[formKey])
				);
			});

			// 2. Bandingkan data wilayah secara terpisah
			const wilayahChanged =
				selectedPropinsi?.id !== originalSelectedPropinsi?.id ||
				selectedKokab?.id !== originalSelectedKokab?.id ||
				selectedKecamatan?.id !== originalSelectedKecamatan?.id;

			isFormModified = formChanged || wilayahChanged;

			$muridFormStore.isModified = isFormModified;
		}, 0);
	}

	function handleWilayahChange(
		event: CustomEvent<{
			selectedPropinsi: Propinsi | null;
			selectedKokab: Kokab | null;
			selectedKecamatan: Kecamatan | null;
			deskelId: number | undefined;
			alamat: string;
		}>
	) {
		const {
			selectedPropinsi: newPropinsi,
			selectedKokab: newKokab,
			selectedKecamatan: newKecamatan,
			deskelId,
			alamat
		} = event.detail;
		selectedPropinsi = newPropinsi;
		selectedKokab = newKokab;
		selectedKecamatan = newKecamatan;
		internalFormData.deskelId = deskelId;
		internalFormData.alamat = alamat;

		// Jika snapshot wilayah masih kosong, berarti ini adalah bagian dari
		// inisialisasi awal di mode EDIT. Jadi, kita update snapshot juga!
		if (originalSelectedPropinsi === null && newPropinsi !== null) {
			// console.log('SNAPSHOT WILAYAH DIUPDATE! Ini adalah inisialisasi mode edit.');
			originalSelectedPropinsi = newPropinsi;
			originalSelectedKokab = newKokab;
			originalSelectedKecamatan = newKecamatan;
		}
		handleInput();
	}

	function resetForm(doConfirm = true) {
		if (doConfirm && !confirm('Are you sure you want to reset the form? All changes will be lost.'))
			return;

		// Saat reset, kembalikan ke data asli yang disimpan di snapshot
		internalFormData = { ...originalFormData };

		// Jika dalam mode 'Tambah Baru' (prop formData tidak ada), selalu reset wilayah ke null.
		// Ini memastikan 'Simpan & Tambah Lagi' dan tombol 'Reset' membersihkan form sepenuhnya.
		// Jika dalam mode 'Edit', reset ke snapshot wilayah asli yang diambil saat mount.
		if (!formData) {
			selectedPropinsi = null;
			selectedKokab = null;
			selectedKecamatan = null;
		} else {
			selectedPropinsi = originalSelectedPropinsi;
			selectedKokab = originalSelectedKokab;
			selectedKecamatan = originalSelectedKecamatan;
		}

		if (personalInfoFormComponent) {
			personalInfoFormComponent.reset();
		}

		// Reset state lain yang tidak di-snapshot jika perlu
		countryId = 'id';
		countryCode = '+62';
		phoneNumber = '';

		// Panggil handleInput untuk mengkalkulasi ulang isFormModified (akan jadi false)
		setTimeout(() => {
			handleInput();
			isFormModified = false;
		}, 100);
	}

	function handleBatal() {
		if (isFormModified && !confirm('Ada perubahan yang belum disimpan. Yakin ingin batal?')) {
			return;
		}
		resetForm(false);
		goto('/member/pendataan');
	}

	function handleEnhanceSubmit() {
		isSubmitting = true;
		return async ({ result }: { result: ActionResult }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				const successMessage = result.data?.message || 'Data berhasil disimpan.';
				success(successMessage);
				resetForm(false); // Reset form tanpa konfirmasi

				if (result.data?.redirect) {
					goto(result.data.redirect);
				} else {
					// Setelah sukses, update snapshot ke data yang baru saja disimpan
					if (result.data?.murid) {
						originalFormData = { ...result.data.murid };
					}
				}
			} else if (result.type === 'failure') {
				error(result.data?.message ? `${result.data.message}` : 'Gagal menyimpan data murid');
			}
		};
	}

	function handleArabicInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const arabicPattern =
			/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9 .,!?»«()]+$/;

		if (!arabicPattern.test(input.value)) {
			const newValue = input.value.replace(
				/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9 .,!?»«()]/g,
				''
			);
			input.value = newValue;
			internalFormData.namaArab = newValue;
			handleInput();
		}
	}

	// --- BLOK REAKTIF ---
	$: if (mounted) {
		$muridFormStore.formData = internalFormData;
		$muridFormStore.selectedPropinsi = selectedPropinsi;
		$muridFormStore.selectedKokab = selectedKokab;
		$muridFormStore.selectedKecamatan = selectedKecamatan;
	}

	// Untuk debugging, opsional
	// $: console.log('add murid internalFormData', internalFormData);
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance={handleEnhanceSubmit}
	class="space-y-6"
>
	<PersonalInfoForm
		bind:this={personalInfoFormComponent}
		formData={internalFormData}
		{handleInput}
		{handleArabicInput}
	/>

	<ContactForm
		{propinsiList}
		formData={internalFormData}
		{selectedPropinsi}
		{selectedKokab}
		{selectedKecamatan}
		{handleInput}
		{handleWilayahChange}
		{countryId}
		{countryCode}
		{phoneNumber}
	/>

	<IrsyadiyahForm formData={internalFormData} {handleInput} {editedMuridId} />
	{#if internalFormData.muhrimData}
		<input type="hidden" name="muhrimData" value={JSON.stringify(internalFormData.muhrimData)} />
	{/if}
	{#if internalFormData.mursyidData}
		<input type="hidden" name="mursyidData" value={JSON.stringify(internalFormData.mursyidData)} />
	{/if}
	{#if internalFormData.baiatData}
		<input type="hidden" name="baiatData" value={JSON.stringify(internalFormData.baiatData)} />
	{/if}
	{#if internalFormData.wiridData}
		<input type="hidden" name="wiridData" value={JSON.stringify(internalFormData.wiridData)} />
	{/if}
	<StatusForm formData={internalFormData} {handleInput} />

	<div
		class="sticky bottom-0 flex w-full space-x-2 bg-white/20 p-2 backdrop-blur-xl backdrop-saturate-150 dark:bg-gray-800/20 dark:backdrop-brightness-125"
	>
		{#if isFormModified}
			<button
				transition:scale={{ duration: 300 }}
				type="button"
				on:click={() => resetForm()}
				class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
			>
				Reset
			</button>
		{/if}
		<button
			type="button"
			disabled={isSubmitting}
			on:click={handleBatal}
			class="btn btn-warning grow rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
		>
			Batal
		</button>
		<button
			type="submit"
			name="action"
			value="save-and-close"
			disabled={isSubmitting}
			class="btn btn-primary grow rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
		>
			{isSubmitting ? 'Menyimpan...' : 'Simpan & Tutup'}
		</button>
		<button
			type="submit"
			name="action"
			value="save-and-add"
			disabled={isSubmitting}
			class="btn btn-secondary grow rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
		>
			{isSubmitting ? 'Menyimpan...' : 'Simpan & Tambah Lagi'}
		</button>
	</div>
</form>
