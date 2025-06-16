<script lang="ts">
	import type { ColumnDef } from '../types';
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	export let columns: ColumnDef[];
	export let filterValues: Record<string, any> = {};
	export let isOpen: boolean = false;

	let previousIsOpen = isOpen;

	// --- DIUBAH: Logika inisialisasi yang lebih baik ---
	// Gunakan afterUpdate untuk mendeteksi saat 'isOpen' berubah dari false ke true
	afterUpdate(() => {
		if (isOpen && !previousIsOpen) {
			// Drawer baru saja dibuka, salin filter dari parent
			localFilterValues = { ...filterValues };
		}
		previousIsOpen = isOpen;
	});

	const dispatch = createEventDispatcher();

	let localFilterValues: Record<string, any> = {};
	let hidden = true;
	$: if (hidden && isOpen) {
		localFilterValues = { ...filterValues };
		hidden = false;
	}

	function applyAndClose() {
		// Kirim semua filter yang sudah diubah ke parent
		dispatch('applyFilters', localFilterValues);
		// Tutup drawer
		dispatch('close');
		hidden = true;
	}

	function resetAndApply() {
		// Kosongkan filter lokal
		localFilterValues = {};
		// Kirim state kosong ke parent dan tutup
		dispatch('applyFilters', {});
		dispatch('close');
		hidden = true;
	}

	$: hasChanges = JSON.stringify(localFilterValues) !== JSON.stringify(filterValues);
</script>

{#if isOpen}
	<div class="relative z-50" aria-labelledby="drawer-title" role="dialog" aria-modal="true">
		<!-- 1. Backdrop / Overlay -->
		<button
			class="fixed inset-0 bg-gray-500/75"
			transition:fly={{ duration: 300, opacity: 0 }}
			on:click={() => dispatch('close')}
		/>

		<!-- 2. Kontainer Panel Drawer -->
		<div class="fixed inset-0 overflow-hidden">
			<div class="absolute inset-0 overflow-hidden">
				<div
					class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
					transition:fly={{ duration: 500, x: '100%' }}
				>
					<div class="pointer-events-auto relative w-screen max-w-md">
						<!-- Tombol Close -->
						<div class="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
							<button
								type="button"
								class="relative rounded-md text-gray-300 hover:text-white"
								on:click={() => dispatch('close')}
							>
								<span class="sr-only">Close panel</span>
								<svg
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M6 18 18 6M6 6l12 12"
									/></svg
								>
							</button>
						</div>

						<!-- Konten Internal Drawer -->
						<div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
							<div class="px-4 sm:px-6">
								<h2 class="text-base font-semibold leading-6 text-gray-900" id="drawer-title">
									Filters
								</h2>
							</div>
							<div class="relative mt-6 flex-1 px-4 sm:px-6">
								<!-- Konten filter Anda (sudah benar) -->
								<ul class="space-y-4">
									{#each columns.filter((col) => col.filterable) as column (String(column.key))}
										<li>
											<label class="form-control w-full">
												<div class="label">
													<span class="label-text">{column.label}</span>
												</div>
												{#if column.filterOptions}
													<select
														class="select select-bordered"
														bind:value={localFilterValues[String(column.key)]}
													>
														<option value="">All</option>
														{#each column.filterOptions as option}
															{#if typeof option === 'string'}
																<option value={option}>{option}</option>
															{:else}
																<option value={option.value}>{option.label}</option>
															{/if}
														{/each}
													</select>
												{:else}
													<input
														type="search"
														class="input input-bordered"
														bind:value={localFilterValues[String(column.key)]}
														placeholder={`Filter ${column.label.toLowerCase()}...`}
													/>
												{/if}
											</label>
										</li>
									{/each}
								</ul>
								<div class="mt-4">
									<button
										disabled={!hasChanges}
										class="btn btn-primary mt-4 w-full"
										on:click={applyAndClose}
									>
										Apply
									</button>
									<!-- Tombol Reset hanya muncul jika ada filter aktif -->
									{#if Object.values(localFilterValues).some((v) => v && v !== 'All')}
										<button class="btn btn-ghost mt-4 w-full text-error" on:click={resetAndApply}>
											Reset
										</button>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
