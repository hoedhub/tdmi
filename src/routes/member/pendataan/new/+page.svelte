<script lang="ts">
	import type { PageData } from './$types';
	import { error } from '$lib/components/toast';
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

	// Handle form submission success/error
	$: if (form?.message && !form?.success) {
		error(form.message);
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h1 class="card-title text-2xl">Tambah Murid Baru</h1>

		<AddMuridForm propinsiList={data.propinsiList} />
	</div>
</div>
