<script lang="ts">
	import { Clock, RefreshCw, ChevronRight } from 'lucide-svelte';
	import { formatDateShort } from '$lib/utils/date';

	interface Props {
		recentlyAdded: any[];
		recentlyUpdated: any[];
	}

	let { recentlyAdded, recentlyUpdated }: Props = $props();
</script>

<div class="mb-6 mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
		<div class="card-body p-4">
			<h3 class="card-title flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
				<Clock class="h-3.5 w-3.5" /> Murid Baru
			</h3>
			<div class="mt-2 flex flex-col divide-y divide-base-200">
				{#each recentlyAdded || [] as m}
					<a
						href="/member/pendataan/{m.id}"
						class="flex items-center justify-between py-2 transition-colors hover:text-primary"
					>
						<span class="truncate text-sm font-semibold">{m.nama}</span>
						<ChevronRight class="h-4 w-4 opacity-20" />
					</a>
				{:else}
					<p class="py-4 text-center text-sm opacity-50">Belum ada murid baru.</p>
				{/each}
			</div>
		</div>
	</div>

	<div class="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
		<div class="card-body p-4">
			<h3 class="card-title flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
				<RefreshCw class="h-3.5 w-3.5" /> Baru Diperbarui
			</h3>
			<div class="mt-2 flex flex-col divide-y divide-base-200">
				{#each recentlyUpdated || [] as m}
					<a
						href="/member/pendataan/{m.id}"
						class="flex items-center justify-between py-2 transition-colors hover:text-primary"
					>
						<div class="flex min-w-0 flex-col">
							<span class="truncate text-sm font-semibold">{m.nama}</span>
							<span class="text-[10px] opacity-50">{formatDateShort(m.updatedAt)}</span>
						</div>
						<ChevronRight class="h-4 w-4 opacity-20" />
					</a>
				{:else}
					<p class="py-4 text-center text-sm opacity-50">Belum ada data terbarui.</p>
				{/each}
			</div>
		</div>
	</div>
</div>
