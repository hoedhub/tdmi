<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

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

		<form method="POST" use:enhance>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<!-- Nama -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Nama Lengkap <span class="text-error">*</span></span>
					</div>
					<input
						type="text"
						placeholder="Nama Lengkap"
						class="input input-bordered w-full"
						name="nama"
						bind:value={nama}
						required
					/>
				</label>

				<!-- Nama Arab -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Nama Arab</span>
					</div>
					<input
						type="text"
						placeholder="Nama Arab"
						class="input input-bordered w-full"
						name="namaArab"
						bind:value={namaArab}
					/>
				</label>

				<!-- Gender -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Gender</span>
					</div>
					<select class="select select-bordered w-full" name="gender" bind:value={gender}>
						<option value={true}>Pria</option>
						<option value={false}>Wanita</option>
					</select>
				</label>

				<!-- Tanggal Lahir -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Tanggal Lahir</span>
					</div>
					<input
						type="date"
						class="input input-bordered w-full"
						name="tglLahir"
						bind:value={tglLahir}
					/>
				</label>

				<!-- Nomor Telepon -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Nomor Telepon</span>
					</div>
					<input
						type="text"
						placeholder="e.g., 081234567890"
						class="input input-bordered w-full"
						name="nomorTelepon"
						bind:value={nomorTelepon}
					/>
				</label>

				<!-- NIK -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">NIK (Nomor Induk Kependudukan)</span>
					</div>
					<input
						type="text"
						placeholder="16 digit NIK"
						class="input input-bordered w-full"
						name="nik"
						bind:value={nik}
						maxlength="16"
					/>
					{#if form?.nik && form?.message?.includes('NIK sudah terdaftar')}
						<div class="label">
							<span class="label-text-alt text-error">{form.message}</span>
						</div>
					{/if}
				</label>

				<!-- Propinsi -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Propinsi <span class="text-error">*</span></span>
					</div>
					<select
						class="select select-bordered w-full"
						bind:value={selectedPropinsiId}
						on:change={() => {
							selectedKokabId = null;
							selectedKecamatanId = null;
							selectedDeskelId = null;
						}}
						required
					>
						<option value={null} disabled>Pilih Propinsi</option>
						{#each data.propinsiList as prop}
							<option value={prop.id}>{prop.propinsi}</option>
						{/each}
					</select>
				</label>

				<!-- Kokab -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Kota/Kabupaten <span class="text-error">*</span></span>
					</div>
					<select
						class="select select-bordered w-full"
						bind:value={selectedKokabId}
						on:change={() => {
							selectedKecamatanId = null;
							selectedDeskelId = null;
						}}
						disabled={!selectedPropinsiId}
						required
					>
						<option value={null} disabled>Pilih Kota/Kabupaten</option>
						{#each filteredKokab as kokab}
							<option value={kokab.id}>{kokab.kokab}</option>
						{/each}
					</select>
				</label>

				<!-- Kecamatan -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Kecamatan <span class="text-error">*</span></span>
					</div>
					<select
						class="select select-bordered w-full"
						bind:value={selectedKecamatanId}
						on:change={() => {
							selectedDeskelId = null;
						}}
						disabled={!selectedKokabId}
						required
					>
						<option value={null} disabled>Pilih Kecamatan</option>
						{#each filteredKecamatan as kecamatan}
							<option value={kecamatan.id}>{kecamatan.kecamatan}</option>
						{/each}
					</select>
				</label>

				<!-- Desa/Kelurahan -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Desa/Kelurahan <span class="text-error">*</span></span>
					</div>
					<select
						class="select select-bordered w-full"
						name="deskelId"
						bind:value={selectedDeskelId}
						disabled={!selectedKecamatanId}
						required
					>
						<option value={null} disabled>Pilih Desa/Kelurahan</option>
						{#each filteredDeskel as deskel}
							<option value={deskel.id}>{deskel.deskel}</option>
						{/each}
					</select>
				</label>

				<!-- Alamat -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Alamat Lengkap</span>
					</div>
					<textarea
						class="textarea textarea-bordered h-24"
						placeholder="Alamat Lengkap"
						name="alamat"
						bind:value={alamat}
					></textarea>
				</label>

				<!-- Marhalah -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Marhalah</span>
					</div>
					<select class="select select-bordered w-full" name="marhalah" bind:value={marhalah}>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
					</select>
				</label>

				<!-- Qari -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Qari</span>
					</div>
					<select class="select select-bordered w-full" name="qari" bind:value={qari}>
						<option value={true}>Ya</option>
						<option value={false}>Tidak</option>
					</select>
				</label>

				<!-- Aktif -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Status Aktif</span>
					</div>
					<select class="select select-bordered w-full" name="aktif" bind:value={aktif}>
						<option value={true}>Aktif</option>
						<option value={false}>Tidak Aktif</option>
					</select>
				</label>

				<!-- Partisipasi -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Status Partisipasi</span>
					</div>
					<select class="select select-bordered w-full" name="partisipasi" bind:value={partisipasi}>
						<option value={true}>Berpartisipasi</option>
						<option value={false}>Tidak Berpartisipasi</option>
					</select>
				</label>

				<!-- Muhrim ID -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Muhrim ID</span>
					</div>
					<input
						type="number"
						placeholder="ID Murid Muhrim"
						class="input input-bordered w-full"
						name="muhrimId"
						bind:value={muhrimId}
					/>
				</label>

				<!-- Mursyid ID -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Mursyid ID</span>
					</div>
					<input
						type="number"
						placeholder="ID Murid Mursyid"
						class="input input-bordered w-full"
						name="mursyidId"
						bind:value={mursyidId}
					/>
				</label>

				<!-- Baiat ID -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Baiat ID</span>
					</div>
					<input
						type="number"
						placeholder="ID Murid Baiat"
						class="input input-bordered w-full"
						name="baiatId"
						bind:value={baiatId}
					/>
				</label>

				<!-- Wirid ID -->
				<label class="form-control w-full">
					<div class="label">
						<span class="label-text">Wirid ID</span>
					</div>
					<input
						type="number"
						placeholder="ID Murid Wirid"
						class="input input-bordered w-full"
						name="wiridId"
						bind:value={wiridId}
					/>
				</label>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button type="button" class="btn btn-ghost" on:click={() => goto('/member/pendataan')}
					>Batal</button
				>
				<button type="submit" class="btn btn-primary">Simpan Murid</button>
			</div>
		</form>
	</div>
</div>
