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
				initialData={formData.muhrimData ? { id: formData.muhrimId, nama: formData.muhrimData.nama } : undefined}
				on:change={({ detail }) => {
					formData.muhrimId = detail.selectedId;
					formData.muhrimData = {
						id: detail.selectedId,
						nama: detail.selectedName,
						nomorTelepon: '' // nomorTelepon is not available in the new setup
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
			initialData={formData.mursyidData ? { id: formData.mursyidId, nama: formData.mursyidData.nama } : undefined}
			on:change={({ detail }) => {
				formData.mursyidId = detail.selectedId;
				formData.mursyidData = {
					id: detail.selectedId,
					nama: detail.selectedName,
					nomorTelepon: ''
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
			initialData={formData.baiatData ? { id: formData.baiatId, nama: formData.baiatData.nama } : undefined}
			on:change={({ detail }) => {
				formData.baiatId = detail.selectedId;
				formData.baiatData = {
					id: detail.selectedId,
					nama: detail.selectedName,
					nomorTelepon: ''
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
			initialData={formData.wiridData ? { id: formData.wiridId, nama: formData.wiridData.nama } : undefined}
			on:change={({ detail }) => {
				formData.wiridId = detail.selectedId;
				formData.wiridData = {
					id: detail.selectedId,
					nama: detail.selectedName,
					nomorTelepon: ''
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
