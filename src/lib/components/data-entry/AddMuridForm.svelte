<script lang="ts">
	import { scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { muridFormStore, type FormData } from '$lib/stores/muridForm';
	import type { propTable, kokabTable, kecamatanTable } from '$lib/drizzle/schema';
	import { type InferSelectModel } from 'drizzle-orm';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
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
	// Menerima data awal dari parent untuk mode "Edit". Opsional.
	export let formData: FormData | undefined = undefined;
	export let onUpdated = async () => {};

	// --- STATE ---
	let countryId: string;
	let countryCode: string;
	let phoneNumber: string;

	// 'defaultFormData' adalah kerangka kosong untuk reset atau mode 'Tambah'
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

	// 'internalFormData' adalah state AKTIF dari form ini.
	// Kita inisialisasi dengan kerangka default, akan di-update di onMount.
	let internalFormData: FormData = { ...defaultFormData };

	let selectedPropinsi: Propinsi | null = null;
	let selectedKokab: Kokab | null = null;
	let selectedKecamatan: Kecamatan | null = null;
	let isFormModified = false;
	let isSubmitting = false;
	let mounted = false;

	// --- SIKLUS HIDUP (LIFECYCLE) ---
	onMount(() => {
		// INI BAGIAN UTAMA PERBAIKAN
		if (formData) {
			// **MODE EDIT**: Jika 'formData' (prop) ada, gunakan itu sebagai data awal.
			internalFormData = { ...formData };
			// Catatan: Jika Anda perlu memuat 'selectedPropinsi' dll. berdasarkan 'deskelId',
			// logikanya harus ditambahkan di sini.
		} else {
			// **MODE TAMBAH BARU**: Jika tidak ada prop, gunakan data dari store (jika ada)
			// untuk mempertahankan state saat navigasi, atau gunakan default.
			internalFormData = $muridFormStore.isModified
				? $muridFormStore.formData
				: { ...defaultFormData };
			selectedPropinsi = $muridFormStore.selectedPropinsi;
			selectedKokab = $muridFormStore.selectedKokab;
			selectedKecamatan = $muridFormStore.selectedKecamatan;
		}
		mounted = true;
		handleInput(); // Cek status 'modified' di awal
	});

	// --- FUNGSI-FUNGSI ---
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
			internalFormData.namaArab = newValue; // Perbaiki: Gunakan internalFormData
			handleInput();
		}
	}

	function handleInput() {
		// Bandingkan dengan 'defaultFormData' BUKAN 'formData' prop
		const formChanged = Object.keys(internalFormData).some((key) => {
			const formKey = key as keyof FormData;
			return JSON.stringify(internalFormData[formKey]) !== JSON.stringify(defaultFormData[formKey]);
		});
		const wilayahChanged =
			selectedPropinsi !== null || selectedKokab !== null || selectedKecamatan !== null;
		isFormModified = formChanged || wilayahChanged;
		if (mounted) {
			$muridFormStore.isModified = isFormModified;
		}
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
		internalFormData.deskelId = deskelId; // Perbaiki: Gunakan internalFormData
		internalFormData.alamat = alamat; // Perbaiki: Gunakan internalFormData
		handleInput();
	}

	function resetForm(doConfirm = true) {
		if (doConfirm && !confirm('Are you sure you want to reset the form? All changes will be lost.'))
			return;

		internalFormData = { ...defaultFormData }; // Perbaiki: Gunakan internalFormData
		selectedPropinsi = null;
		selectedKokab = null;
		selectedKecamatan = null;
		countryId = 'id';
		countryCode = '+62';
		phoneNumber = '';
		isFormModified = false;
		muridFormStore.reset();
		setTimeout(() => {
			handleInput();
		}, 100);
	}

	function handleEnhanceSubmit() {
		isSubmitting = true;
		return async ({ result }: { result: ActionResult }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				success('Data murid berhasil disimpan');
				await onUpdated();
				resetForm(false);
			} else if (result.type === 'failure') {
				error(
					result.data?.message
						? `${result.data.message}: ${result.data.error}`
						: 'Gagal menyimpan data murid'
				);
			}
		};
	}

	// --- BLOK REAKTIF ---
	// Sinkronkan state internal ke store untuk persistensi antar navigasi
	$: if (mounted) {
		$muridFormStore.formData = internalFormData;
		$muridFormStore.selectedPropinsi = selectedPropinsi;
		$muridFormStore.selectedKokab = selectedKokab;
		$muridFormStore.selectedKecamatan = selectedKecamatan;
	}

	// Untuk debugging, opsional
	$: console.log('add murid internalFormData', internalFormData);
</script>

<!--
  Ganti semua referensi ke 'formData' dengan 'internalFormData' di template.
  Ini memastikan template selalu menggunakan state internal yang aktif dari komponen ini.
-->
<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance={handleEnhanceSubmit}
	class="space-y-6"
>
	<PersonalInfoForm formData={internalFormData} {handleInput} {handleArabicInput} />

	<ContactForm
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

	<IrsyadiyahForm formData={internalFormData} {handleInput} />
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
			type="submit"
			disabled={isSubmitting}
			class="btn btn-primary grow rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
		>
			{isSubmitting ? 'Menyimpan...' : 'Simpan'}
		</button>
	</div>
</form>
