<script lang="ts">
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';

	interface SimilarMurid {
		id: number;
		nama: string;
		rating: number;
	}

	export let similarMurids: SimilarMurid[] = [];
	export let onclose: () => void;

	let isCollapsed = false;
	const dispatch = createEventDispatcher<{ nameSelect: string }>();

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
				on:click={onclose}>✕</button
			>

			<div
				class="flex cursor-pointer items-center"
				on:click={toggleCollapse}
				on:keypress={toggleCollapse}
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
								<li class="flex items-center justify-between px-2 py-1.5 text-sm">
									<button
										type="button"
										class="text-left font-medium transition-colors hover:text-primary"
										on:click={() => selectName(murid.nama)}
									>
										{murid.nama}
									</button>
									<button
										type="button"
										class="btn btn-outline btn-primary btn-xs"
										on:click={() => handleEditMurid(murid.id)}
									>
										Lihat & Edit
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
