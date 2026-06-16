<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { PageData } from './$types';
	import { error } from '$lib/components/toast';
	import { afterNavigate } from '$app/navigation';
	import AddMuridForm from '$lib/components/data-entry/AddMuridForm.svelte';

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
	}

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	let formKey = $state(0);

	afterNavigate(({ from }) => {
		if (from) formKey++;
	});

	run(() => {
		if (form?.message && !form?.success) {
			error(form.message);
		}
	});

	run(() => {
		if (form?.success && form?.message) {
		}
	});
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-4 sm:p-8">
		<h1 class="card-title text-2xl">Tambah Murid Baru</h1>

		{#key formKey}
			<AddMuridForm propinsiList={data.propinsiList} />
		{/key}
	</div>
</div>
