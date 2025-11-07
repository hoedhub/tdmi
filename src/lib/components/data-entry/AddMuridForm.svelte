<script lang="ts">
	import { run } from 'svelte/legacy';

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
	import SimilarMuridsAlert from './SimilarMuridsAlert.svelte';

	type Propinsi = InferSelectModel<typeof propTable>;
	type Kokab = InferSelectModel<typeof kokabTable>;
	type Kecamatan = InferSelectModel<typeof kecamatanTable>;

	// --- PROPS ---
	interface Props {
		formData?: FormData | undefined;
		propinsiList?: Propinsi[];
		editedMuridId?: number | undefined;
	}

	let { formData = undefined, propinsiList = [], editedMuridId = undefined }: Props = $props();

	// --- STATE ---
	let countryId: string | undefined = $state();
	let countryCode: string | undefined = $state();
	let phoneNumber: string | undefined = $state();

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

	let originalFormData: FormData;
	let originalSelectedPropinsi: Propinsi | null = null;
	let originalSelectedKokab: Kokab | null = null;
	let originalSelectedKecamatan: Kecamatan | null = null;

	let internalFormData: FormData = $state({ ...defaultFormData });
	let selectedPropinsi: Propinsi | null = $state(null);
	let selectedKokab: Kokab | null = $state(null);
	let selectedKecamatan: Kecamatan | null = $state(null);

	let isFormModified = $state(false);
	let isSubmitting = $state(false);
	let mounted = $state(false);

	let personalInfoFormComponent: PersonalInfoForm | undefined = $state();

	// --- State untuk Similar Murids Alert ---
	let similarMurids: any[] = $state([]);
	let searchTimeout: NodeJS.Timeout;

	// --- SIKLUS HIDUP (LIFECYCLE) ---
	onMount(() => {
		if (formData) {
			internalFormData = { ...formData };
			originalFormData = { ...formData };
		} else {
			internalFormData = $muridFormStore.isModified
				? $muridFormStore.formData
				: { ...defaultFormData };
			originalFormData = { ...defaultFormData };
			selectedPropinsi = $muridFormStore.selectedPropinsi;
			selectedKokab = $muridFormStore.selectedKokab;
			selectedKecamatan = $muridFormStore.selectedKecamatan;
		}

		originalSelectedPropinsi = selectedPropinsi;
		originalSelectedKokab = selectedKokab;
		originalSelectedKecamatan = selectedKecamatan;

		mounted = true;
		handleInput();
	});

	// --- FUNGSI-FUNGSI ---

	// --- Fungsi untuk cek nama serupa (dengan debounce) ---
	function checkSimilarNames(nama: string) {
		clearTimeout(searchTimeout);

		// Hanya cari jika nama lebih dari 3 karakter dan dalam mode tambah baru
		if (!formData && nama.trim().length >= 3) {
			console.log(`[Form] Scheduling search for: "${nama}"`);
			searchTimeout = setTimeout(async () => {
				console.log(`[Form] Executing search for: "${nama}"`);
				try {
					const response = await fetch(
						`/api/murid/similar?nama=${encodeURIComponent(nama.trim())}`
					);
					if (response.ok) {
						const data = await response.json();
						console.log('[Form] Received data from API:', data);
						similarMurids = data;
					} else {
						console.error('[Form] API request failed:', response.statusText);
						similarMurids = [];
					}
				} catch (e) {
					console.error('[Form] Failed to fetch similar murids:', e);
					similarMurids = [];
				}
			}, 500); // debounce 500ms
		} else {
			// Kosongkan jika nama pendek atau dalam mode edit
			if (similarMurids.length > 0) {
				console.log('[Form] Clearing similar murids.');
				similarMurids = [];
			}
		}
	}

	function handleInput() {
		setTimeout(() => {
			if (!mounted) return;
			const formChanged = Object.keys(internalFormData).some((key) => {
				const formKey = key as keyof FormData;
				return (
					JSON.stringify(internalFormData[formKey]) !== JSON.stringify(originalFormData[formKey])
				);
			});

			const wilayahChanged =
				selectedPropinsi?.id !== originalSelectedPropinsi?.id ||
				selectedKokab?.id !== originalSelectedKokab?.id ||
				selectedKecamatan?.id !== originalSelectedKecamatan?.id;

			isFormModified = formChanged || wilayahChanged;
			$muridFormStore.isModified = isFormModified;

			// Panggil pengecekan nama serupa
			checkSimilarNames(internalFormData.nama);
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

		if (originalSelectedPropinsi === null && newPropinsi !== null) {
			originalSelectedPropinsi = newPropinsi;
			originalSelectedKokab = newKokab;
			originalSelectedKecamatan = newKecamatan;
		}
		handleInput();
	}

	function resetForm(doConfirm = true) {
		if (doConfirm && !confirm('Are you sure you want to reset the form? All changes will be lost.'))
			return;

		internalFormData = { ...originalFormData };

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

		countryId = 'id';
		countryCode = '+62';
		phoneNumber = '';

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
				resetForm(false);

				if (result.data?.redirect) {
					goto(result.data.redirect);
				} else {
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
	run(() => {
		if (mounted) {
			$muridFormStore.formData = internalFormData;
			$muridFormStore.selectedPropinsi = selectedPropinsi;
			$muridFormStore.selectedKokab = selectedKokab;
			$muridFormStore.selectedKecamatan = selectedKecamatan;
		}
	});
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
		{similarMurids}
		onclose={() => (similarMurids = [])}
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
				onclick={() => resetForm()}
				class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
			>
				Reset
			</button>
		{/if}
		<button
			type="button"
			disabled={isSubmitting}
			onclick={handleBatal}
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
