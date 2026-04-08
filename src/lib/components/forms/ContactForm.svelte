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

	interface Props {
		formData: MuridFormData['formData'];
		selectedPropinsi: Propinsi | null;
		selectedKokab: Kokab | null;
		selectedKecamatan: Kecamatan | null;
		handleInput: () => void;
		handleWilayahChange: (event: CustomEvent) => void;
		countryId: string | undefined;
		countryCode: string | undefined;
		phoneNumber: string | undefined;
		propinsiList?: Propinsi[];
	}

	let {
		formData = $bindable(),
		selectedPropinsi = $bindable(),
		selectedKokab = $bindable(),
		selectedKecamatan = $bindable(),
		handleInput,
		handleWilayahChange,
		countryId = $bindable('id'),
		countryCode = $bindable('+62'),
		phoneNumber = $bindable(''),
		propinsiList = []
	}: Props = $props();

	let wilayahComponent: Wilayah | undefined = $state();

	export function reset() {
		if (wilayahComponent) {
			wilayahComponent.reset();
		}
	}
</script>

<fieldset class="space-y-4 rounded-lg border border-base-300 p-4">
	<legend class="px-2 font-semibold">Kontak dan Alamat</legend>
	<Wilayah
		bind:this={wilayahComponent}
		bind:propinsiList
		bind:selectedPropinsi
		bind:selectedKokab
		bind:selectedKecamatan
		bind:deskelId={formData.deskelId}
		bind:alamat={formData.alamat}
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
