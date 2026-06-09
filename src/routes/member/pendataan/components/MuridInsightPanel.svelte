<script lang="ts">
	import DistributionBar from '$lib/components/charts/DistributionBar.svelte';

	interface Props {
		nationalStats: any;
		topProvinces: any[];
		modeTotal: number;
		othersCount: number;
		mapViewMode: string;
		mapLabels: Record<string, string>;
		topColors: string[];
		onProvinceClick: (id: number, name: string) => void;
		onDownloadPDF: () => void;
		isGeneratingPDF: boolean;
	}

	let {
		nationalStats,
		topProvinces,
		modeTotal,
		othersCount,
		mapViewMode,
		mapLabels,
		topColors,
		onProvinceClick,
		onDownloadPDF,
		isGeneratingPDF
	}: Props = $props();

	let marhalahSegments = $derived([
		{ value: nationalStats.m1, color: 'oklch(var(--in))' },
		{ value: nationalStats.m2, color: 'oklch(var(--wa))' },
		{ value: nationalStats.m3, color: 'oklch(var(--su))' }
	]);

	let topSegments = $derived([
		...topProvinces.map((p, i) => ({
			value: p[mapViewMode],
			color: topColors[i],
			tooltip: `${p.propinsi}: ${((p[mapViewMode] / modeTotal) * 100).toFixed(1)}%`
		})),
		...(othersCount > 0
			? [
					{
						value: othersCount,
						color: topColors[5],
						tooltip: `Lainnya: ${((othersCount / modeTotal) * 100).toFixed(1)}%`
					}
			  ]
			: [])
	]);
</script>

<div class="space-y-3">
	<!-- National Summary (Compact) -->
	<div class="card border border-base-300 bg-base-200 shadow-sm">
		<div class="card-body p-3">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-[10px] font-black uppercase tracking-widest opacity-40">Nasional</span>
				<div class="badge badge-neutral badge-xs font-mono">{nationalStats.total} Murid</div>
			</div>
			<div class="flex items-center justify-between text-xs">
				<div class="flex flex-col">
					<span class="text-[9px] font-bold uppercase opacity-50">Rasio Gender</span>
					<span class="font-black text-primary">
						{nationalStats.pria} <span class="mx-0.5 opacity-30">/</span>
						{nationalStats.wanita}
						<span class="ml-1 text-[10px] font-medium opacity-60"
							>({(nationalStats.pria / (nationalStats.wanita || 1)).toFixed(1)})</span
						>
					</span>
				</div>
				<div class="flex h-4 w-12 overflow-hidden rounded-sm bg-base-300 gap-0.5">
					<div
						class="bg-blue-500"
						style="width: {(nationalStats.pria / (nationalStats.total || 1)) * 100}%"
					></div>
					<div
						class="bg-pink-500"
						style="width: {(nationalStats.wanita / (nationalStats.total || 1)) * 100}%"
					></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Marhalah Distribution -->
	<div class="card border border-base-200 bg-base-100 shadow-sm">
		<div class="card-body p-3">
			<h3 class="card-title mb-1 text-[10px] font-black uppercase tracking-widest opacity-40">
				Distribusi Marhalah
			</h3>
			<DistributionBar segments={marhalahSegments} height="h-1.5" className="my-1.5" />
			<div class="grid grid-cols-3 gap-1 text-center">
				<div class="flex flex-col">
					<span class="text-[8px] font-bold opacity-50">M1</span>
					<span class="text-[10px] font-black"
						>{((nationalStats.m1 / (nationalStats.total || 1)) * 100).toFixed(0)}%</span
					>
				</div>
				<div class="flex flex-col border-x border-base-content/10">
					<span class="text-[8px] font-bold opacity-50">M2</span>
					<span class="text-[10px] font-black"
						>{((nationalStats.m2 / (nationalStats.total || 1)) * 100).toFixed(0)}%</span
					>
				</div>
				<div class="flex flex-col">
					<span class="text-[8px] font-bold opacity-50">M3</span>
					<span class="text-[10px] font-black"
						>{((nationalStats.m3 / (nationalStats.total || 1)) * 100).toFixed(0)}%</span
					>
				</div>
			</div>
		</div>
	</div>

	<!-- Top Regions -->
	<div class="card border border-base-200 bg-base-100 shadow-md">
		<div class="card-body p-3">
			<h3 class="card-title mb-1 text-[10px] font-black uppercase tracking-tighter">
				Top 5 Wilayah
			</h3>

			<DistributionBar segments={topSegments} height="h-2" rounded="rounded-sm" className="mb-3" />

			<div class="flex flex-col gap-1.5">
				{#if topProvinces.length === 0}
					<p class="py-2 text-center text-[10px] italic opacity-50">Tidak ada data.</p>
				{:else}
					{#each topProvinces as p, i}
						{@const pct = ((p[mapViewMode] / (modeTotal || 1)) * 100).toFixed(1)}
						<button
							class="tooltip tooltip-left group flex w-full items-center justify-between rounded border-l-4 bg-base-200/50 p-1.5 text-left transition-all hover:bg-primary hover:text-primary-content"
							style="border-left-color: {topColors[i]}"
							data-tip="Porsi: {pct}% dari total"
							onclick={() => onProvinceClick(p.id, p.propinsi)}
						>
							<div class="flex items-center gap-2 overflow-hidden pl-1">
								<span class="truncate text-xs font-bold">{p.propinsi}</span>
							</div>
							<span class="font-mono text-[10px] font-black">{p[mapViewMode]}</span>
						</button>
					{/each}
					{#if othersCount > 0}
						<div
							class="flex items-center justify-between rounded border-l-4 border-base-content/20 bg-base-200/30 p-1.5 text-left opacity-40"
						>
							<span class="pl-1 text-[9px] font-bold uppercase">Lainnya</span>
							<span class="font-mono text-[10px]">{othersCount}</span>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>

	<!-- Action -->
	<button
		class="btn btn-primary btn-sm w-full no-animation gap-2 border-none shadow-lg shadow-primary/20 hover:brightness-110"
		onclick={onDownloadPDF}
		disabled={isGeneratingPDF}
	>
		{#if isGeneratingPDF}
			<span class="loading loading-spinner loading-xs"></span>
			<span class="text-[10px] font-black uppercase tracking-tighter">Menyiapkan PDF...</span>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line
					x1="12"
					y1="15"
					x2="12"
					y2="3"
				/></svg
			>
			<span class="text-[10px] font-black uppercase tracking-tighter">Cetak Laporan PDF</span>
		{/if}
	</button>
</div>
