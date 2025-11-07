<script lang="ts">
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';

	interface SimilarMurid {
		id: number;
		nama: string;
		rating: number;
		alamatLengkap: string | null;
	}

	interface Props {
		similarMurids?: SimilarMurid[];
		onclose: () => void;
	}

	let { similarMurids = [], onclose }: Props = $props();

	let isCollapsed = $state(false);
	const dispatch = createEventDispatcher<{
		nameSelect: string;
		nameHoverStart: string;
		nameHoverEnd: void;
	}>();

	function handleEditMurid(muridId: number) {
		goto(`/member/pendataan/${muridId}/edit`);
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function selectName(name: string) {
		dispatch('nameSelect', name);
	}
</script>

{#if similarMurids.length > 0}
	<div
		class="card relative mb-4 border border-base-300/50 bg-base-200 shadow-sm"
		transition:slide={{ duration: 200 }}
	>
		<div class="card-body p-4">
			<button
				type="button"
				class="btn btn-ghost btn-xs absolute right-2 top-2 z-10"
				onclick={onclose}>✕</button
			>

			<div
				class="flex cursor-pointer items-center"
				onclick={toggleCollapse}
				onkeypress={toggleCollapse}
				role="button"
				tabindex="0"
			>
				<h3 class="flex items-center gap-2 text-base font-semibold">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="transition-transform duration-200 {isCollapsed ? '-rotate-90' : 'rotate-0'}"
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
					Nama Serupa Ditemukan
				</h3>
			</div>

			{#if !isCollapsed}
				<div transition:slide={{ duration: 200 }}>
					<p class="mb-3 mt-2 text-sm text-base-content/80">
						Ada {similarMurids.length} nama yang mirip di database. Mungkin salah satunya adalah orang
						yang Anda cari?
					</p>
					<div class="max-h-40 overflow-y-auto rounded-lg border border-base-300/50 bg-base-100/60">
						<ul class="divide-y divide-base-300/50">
							{#each similarMurids as murid (murid.id)}
								<li
									class="flex items-center justify-between px-2 py-1.5 text-sm"
									onmouseenter={() => dispatch('nameHoverStart', murid.nama)}
									onmouseleave={() => dispatch('nameHoverEnd')}
								>
									<div>
										<button
											type="button"
											class="text-left font-medium transition-colors hover:text-primary"
											onclick={() => selectName(murid.nama)}
										>
											{murid.nama}
										</button>
										{#if murid.alamatLengkap}
											<p class="mt-0.5 text-xs text-base-content/70">
												📍 {murid.alamatLengkap}
											</p>
										{/if}
									</div>
									<button
										type="button"
										class="btn btn-outline btn-primary btn-xs ml-2 self-start"
										onclick={() => handleEditMurid(murid.id)}
									>
										Edit
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
