<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AddMuridForm from '$lib/components/data-entry/AddMuridForm.svelte';

	// Define ActionData explicitly to include all possible fields returned on failure
	interface ActionData {
		success?: boolean;
		message?: string;
		nama?: string;
		namaArab?: string | null;
		gender?: boolean;
		deskelId?: number | null;
		alamat?: string | null;
		nomorTelepon?: string | null;
		muhrimId?: number | null;
		mursyidId?: number | null;
		baiatId?: number | null;
		wiridId?: number | null;
		qari?: boolean;
		marhalah?: 1 | 2 | 3;
		tglLahir?: string | null;
		aktif?: boolean;
		partisipasi?: boolean;
		nik?: string | null;
		// foto?: Uint8Array | null; // Add if foto is ever returned
	}

	export let data: PageData;
	export let form: ActionData; // Use the custom ActionData

	let nama: string = '';
	let namaArab: string = '';
	let gender: boolean = true; // true for Pria, false for Wanita
	let selectedPropinsiId: number | null = null;
	let selectedKokabId: number | null = null;
	let selectedKecamatanId: number | null = null;
	let selectedDeskelId: number | null = null;
	let alamat: string = '';
	let nomorTelepon: string = '';
	let muhrimId: number | null = null;
	let mursyidId: number | null = null;
	let baiatId: number | null = null;
	let wiridId: number | null = null;
	let qari: boolean = true;
	let marhalah: 1 | 2 | 3 = 1;
	let tglLahir: string = '';
	let aktif: boolean = true;
	let partisipasi: boolean = true;
	let nik: string = '';
	// let foto: File | null = null; // For file upload, more complex

	// onUpdated akan dipanggil oleh AddMuridForm setelah sukses menyimpan data.
	async function handleFormUpdate() {
		await goto('/member/pendataan');
	}

	$: filteredKokab = data.kokabList.filter((k) => k.idProp === selectedPropinsiId);
	$: filteredKecamatan = data.kecamatanList.filter((k) => k.idKokab === selectedKokabId);
	$: filteredDeskel = data.deskelList.filter((d) => d.idKecamatan === selectedKecamatanId);

	// Reset dependent dropdowns when parent changes
	$: {
		if (selectedPropinsiId === null) {
			selectedKokabId = null;
			selectedKecamatanId = null;
			selectedDeskelId = null;
		}
	}
	$: {
		if (selectedKokabId === null) {
			selectedKecamatanId = null;
			selectedDeskelId = null;
		}
	}
	$: {
		if (selectedKecamatanId === null) {
			selectedDeskelId = null;
		}
	}

	// Handle form submission success/error
	$: if (form?.success) {
		alert(form.message);
		// Optionally reset form or redirect
		goto('/member/pendataan');
	} else if (form?.message && !form?.success) {
		alert(form.message);
		// Re-populate form fields if there's an error and data is returned
		nama = form.nama ?? nama;
		// ... other fields if needed
		nik = form.nik ?? nik;
	}

	onMount(() => {
		// Set initial values if coming from a failed submission
		if (form) {
			nama = form.nama ?? '';
			namaArab = form.namaArab ?? '';
			gender = form.gender ?? true;
			selectedDeskelId = form.deskelId ?? null;
			alamat = form.alamat ?? '';
			nomorTelepon = form.nomorTelepon ?? '';
			muhrimId = form.muhrimId ?? null;
			mursyidId = form.mursyidId ?? null;
			baiatId = form.baiatId ?? null;
			wiridId = form.wiridId ?? null;
			qari = form.qari ?? true;
			marhalah = form.marhalah ?? 1;
			tglLahir = form.tglLahir ?? '';
			aktif = form.aktif ?? true;
			partisipasi = form.partisipasi ?? true;
			nik = form.nik ?? '';

			// Re-select dropdowns based on deskelId if available
			if (selectedDeskelId) {
				const deskel = data.deskelList.find((d) => d.id === selectedDeskelId);
				if (deskel) {
					selectedKecamatanId = deskel.idKecamatan;
					const kecamatan = data.kecamatanList.find((k) => k.id === selectedKecamatanId);
					if (kecamatan) {
						selectedKokabId = kecamatan.idKokab;
						const kokab = data.kokabList.find((ko) => ko.id === selectedKokabId);
						if (kokab) {
							selectedPropinsiId = kokab.idProp;
						}
					}
				}
			}
		}
	});
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h1 class="card-title text-2xl">Tambah Murid Baru</h1>

		<AddMuridForm onUpdated={handleFormUpdate} />
	</div>
</div>
