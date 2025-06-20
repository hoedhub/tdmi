<script lang="ts">
	import RelatedMurid from '../data-entry/RelatedMurid.svelte';
	import type { MuridFormData } from '$lib/stores/muridForm';

	export let formData: MuridFormData['formData'];
	export let handleInput: () => void;
</script>

<fieldset class="space-y-4 rounded-lg border border-base-300 p-4">
	<legend class="px-2 font-semibold">Irsyadiyah</legend>
	{#if formData.gender === false}
		<div>
			<label for="muhrim">Muhrim</label>
			<RelatedMurid
				placeholder="Pilih murid terkait"
				initialData={formData.muhrimData}
				on:change={({ detail }) => {
					formData.muhrimId = detail.newMuridData.id;
					formData.muhrimData = {
						id: detail.newMuridData.id,
						nama: detail.newMuridData.nama,
						nomorTelepon: detail.newMuridData.nomorTelepon
					};
					handleInput();
				}}
				on:clear={() => {
					formData.muhrimId = undefined;
					formData.muhrimData = undefined;
					handleInput();
				}}
			/>
		</div>
	{/if}
	<div>
		<label for="mursyid">Mursyid{formData.gender ? '' : 'ah'}</label>
		<RelatedMurid
			placeholder="Pilih murid terkait"
			initialData={formData.mursyidData}
			on:change={({ detail }) => {
				formData.mursyidId = detail.newMuridData.id;
				formData.mursyidData = {
					id: detail.newMuridData.id,
					nama: detail.newMuridData.nama,
					nomorTelepon: detail.newMuridData.nomorTelepon
				};
				handleInput();
			}}
			on:clear={() => {
				formData.mursyidId = undefined;
				formData.mursyidData = undefined;
				handleInput();
			}}
		/>
	</div>
	<div>
		<label for="baiat">Baiat</label>
		<RelatedMurid
			placeholder="Pilih murid terkait"
			initialData={formData.baiatData}
			on:change={({ detail }) => {
				formData.baiatId = detail.newMuridData.id;
				formData.baiatData = {
					id: detail.newMuridData.id,
					nama: detail.newMuridData.nama,
					nomorTelepon: detail.newMuridData.nomorTelepon
				};
				handleInput();
			}}
			on:clear={() => {
				formData.baiatId = undefined;
				formData.baiatData = undefined;
				handleInput();
			}}
		/>
	</div>
	<div>
		<label for="wirid">Wirid</label>
		<RelatedMurid
			placeholder="Pilih murid terkait"
			initialData={formData.wiridData}
			on:change={({ detail }) => {
				formData.wiridId = detail.newMuridData.id;
				formData.wiridData = {
					id: detail.newMuridData.id,
					nama: detail.newMuridData.nama,
					nomorTelepon: detail.newMuridData.nomorTelepon
				};
				handleInput();
			}}
			on:clear={() => {
				formData.wiridId = undefined;
				formData.wiridData = undefined;
				handleInput();
			}}
		/>
	</div>
	<input type="hidden" name="muhrimId" value={formData.muhrimId || ''} />
	<input type="hidden" name="mursyidId" value={formData.mursyidId || ''} />
	<input type="hidden" name="baiatId" value={formData.baiatId || ''} />
	<input type="hidden" name="wiridId" value={formData.wiridId || ''} />
</fieldset>
