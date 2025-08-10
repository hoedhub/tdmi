
<script lang="ts">
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';

	interface SimilarMurid {
		id: number;
		nama: string;
		rating: number;
	}

	export let similarMurids: SimilarMurid[] = [];
	export let onclose: () => void;

	let isCollapsed = false;

	function handleEditMurid(muridId: number) {
		goto(`/member/pendataan/${muridId}/edit`);
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

{#if similarMurids.length > 0}
	<div
		class="card bg-base-200 border border-base-300/50 shadow-sm mb-4 relative"
		transition:slide={{ duration: 200 }}
	>
		<div class="card-body p-4">
			<button type="button" class="btn btn-xs btn-ghost absolute top-2 right-2 z-10" on:click={onclose}>✕</button>

			<div
				class="flex items-center cursor-pointer"
				on:click={toggleCollapse}
				on:keypress={toggleCollapse}
				role="button"
				tabindex="0"
			>
				<h3 class="font-semibold text-base flex items-center gap-2">
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
					<p class="text-sm text-base-content/80 mt-2 mb-3">
						Ada {similarMurids.length} nama yang mirip di database. Mungkin salah satunya adalah
						orang yang Anda cari?
					</p>
					<div class="max-h-40 overflow-y-auto rounded-lg bg-base-100/60 border border-base-300/50">
						<ul class="divide-y divide-base-300/50">
							{#each similarMurids as murid (murid.id)}
								<li class="flex items-center justify-between px-2 py-1.5 text-sm">
									<span class="font-medium">{murid.nama}</span>
									<button
										type="button"
										class="btn btn-xs btn-outline btn-primary"
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
