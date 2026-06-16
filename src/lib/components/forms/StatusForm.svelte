<script lang="ts">
	import type { FormData } from '$lib/stores/muridForm';

	interface Props {
		formData: FormData;
		handleInput: () => void;
		errors?: Record<string, string[]>;
	}

	let { formData = $bindable(), handleInput, errors = {} }: Props = $props();

	let marhalahError = $derived(errors.marhalah?.[0]);
</script>

<fieldset class="space-y-4 rounded-lg border border-base-300 p-4">
	<legend class="px-2 text-lg font-semibold">Status Murid</legend>

	<!-- Refactored Radio Group -->
	<div class="form-control">
		<div class="label">
			<span class="label-text">Status Baca al-Qur'an:</span>
		</div>
		<div class="flex items-center gap-6 pt-1">
			<!-- Qari Option with Tooltip -->
			<div class="tooltip" data-tip="Bisa baca al-Qur'an">
				<div class="flex items-center gap-2">
					<input
						type="radio"
						id="qari"
						name="qari"
						bind:group={formData.qari}
						value={true}
						onchange={handleInput}
						class="radio"
					/>
					<label for="qari" class="label-text cursor-pointer">
						Qāri'{formData.gender ? '' : 'ah'}
					</label>
				</div>
			</div>
			<!-- Ghairu Qari Option with Tooltip -->
			<div class="tooltip" data-tip="Tidak bisa baca al-Qur'an">
				<div class="flex items-center gap-2">
					<input
						type="radio"
						id="ghairu-qari"
						name="qari"
						bind:group={formData.qari}
						value={false}
						onchange={handleInput}
						class="radio"
					/>
					<label for="ghairu-qari" class="label-text cursor-pointer">
						Ghairu Qāri'{formData.gender ? '' : 'ah'}
					</label>
				</div>
			</div>
		</div>
	</div>

	<!-- Refactored Select -->
	<div>
		<label for="marhalah" class="label">
			<span class="label-text">Marhalah</span>
		</label>
		<select
			id="marhalah"
			name="marhalah"
			oninput={handleInput}
			bind:value={formData.marhalah}
			class="select select-bordered w-full {marhalahError ? 'select-error' : ''}"
			required
			aria-invalid={marhalahError ? 'true' : undefined}
			aria-describedby={marhalahError ? 'marhalah-error' : undefined}
		>
			<option value={1}>1</option>
			<option value={2}>2</option>
			<option value={3}>3</option>
		</select>
		{#if marhalahError}
			<div id="marhalah-error" class="mt-1 text-xs text-error">{marhalahError}</div>
		{/if}
	</div>

	<div class="form-control">
		<label class="label w-fit cursor-pointer gap-2" for="aktif">
			<input
				type="checkbox"
				id="aktif"
				name="aktif"
				onchange={handleInput}
				bind:checked={formData.aktif}
				class="checkbox"
			/>
			<span class="label-text">Aktif</span>
		</label>
	</div>

	<div class="form-control">
		<label class="label w-fit cursor-pointer gap-2" for="partisipasi">
			<div class="tooltip" data-tip="Partisipasi dalam khidmah/nafhah">
				<input
					type="checkbox"
					id="partisipasi"
					name="partisipasi"
					onchange={handleInput}
					bind:checked={formData.partisipasi}
					class="checkbox"
				/>
				<span class="label-text">Partisipasi</span>
			</div>
		</label>
	</div>
</fieldset>
