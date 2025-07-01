<script lang="ts">
	import { fade } from 'svelte/transition';
	import PhoneInput from '../data-entry/PhoneInput.svelte';
	import Wilayah from '../data-entry/Wilayah.svelte';
	import type { MuridFormData } from '$lib/stores/muridForm';
	import type { propTable, kokabTable, kecamatanTable } from '$lib/drizzle/schema';
	import { type InferSelectModel } from 'drizzle-orm';

	type Propinsi = InferSelectModel<typeof propTable>;
	type Kokab = InferSelectModel<typeof kokabTable>;
	type Kecamatan = InferSelectModel<typeof kecamatanTable>;

	export let formData: MuridFormData['formData'];
	export let selectedPropinsi: Propinsi | null;
	export let selectedKokab: Kokab | null;
	export let selectedKecamatan: Kecamatan | null;
	export let handleInput: () => void;
	export let handleWilayahChange: (event: CustomEvent) => void;
	export let countryId: string;
	export let countryCode: string;
	export let phoneNumber: string;
	export let propinsiList: Propinsi[] = [];
</script>

<fieldset class="space-y-4 rounded-lg border border-base-300 p-4">
	<legend class="px-2 font-semibold">Kontak dan Alamat</legend>
	<Wilayah
		{propinsiList}
		{selectedPropinsi}
		{selectedKokab}
		{selectedKecamatan}
		deskelId={formData.deskelId}
		alamat={formData.alamat}
		on:change={handleWilayahChange}
	/>
	<input type="hidden" name="deskelId" bind:value={formData.deskelId} />
	<input type="hidden" name="alamat" bind:value={formData.alamat} />
	{#if formData.gender}
		<div in:fade>
			<label for="nomor-telepon">Nomor Telepon</label>
			<PhoneInput
				bind:countryId
				bind:countryCode
				bind:phoneNumber
				bind:value={formData.nomorTelepon}
				placeholder="Nomor Telepon"
				on:change={handleInput}
			/>
		</div>
		<input type="hidden" name="nomorTelepon" bind:value={formData.nomorTelepon} />
	{/if}
</fieldset>
