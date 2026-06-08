<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface ProvinceData {
		id: number;
		propinsi: string;
		count: number;
	}

	interface PathData {
		iso: string;
		name: string;
		d: string;
	}

	interface Props {
		data: ProvinceData[];
		onProvinceClick?: (id: number, name: string) => void;
	}

	let { data, onProvinceClick }: Props = $props();

	let paths: PathData[] = $state([]);
	let loaded = $state(false);

	onMount(async () => {
		const response = await fetch('/indonesia-paths.json');
		paths = await response.json();
		loaded = true;
	});

	// Color scale logic
	const maxCount = $derived(Math.max(...data.map((p) => p.count), 1));
	
	function getProvinceColor(count: number) {
		if (count === 0) return 'fill-base-300';
		// Intensity from 0 to 8
		const intensity = Math.min(Math.round((count / maxCount) * 8), 8);
		const colors = [
			'fill-primary/20', 'fill-primary/30', 'fill-primary/40', 'fill-primary/50', 'fill-primary/60',
			'fill-primary/70', 'fill-primary/80', 'fill-primary/90', 'fill-primary'
		];
		return colors[intensity];
	}

	let hoveredProvince = $state<{ name: string; count: number; x: number; y: number } | null>(null);

	function handleMouseMove(event: MouseEvent, name: string, count: number) {
		hoveredProvince = { name, count, x: event.clientX, y: event.clientY };
	}

	function handleMouseLeave() {
		hoveredProvince = null;
	}
	
	function getCount(name: string) {
		return data.find(p => p.propinsi.toUpperCase() === name.toUpperCase())?.count || 0;
	}

	function getId(name: string) {
		return data.find(p => p.propinsi.toUpperCase() === name.toUpperCase())?.id;
	}
</script>

<div class="relative w-full h-full min-h-[450px] flex items-center justify-center bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
	{#if !loaded}
		<span class="loading loading-spinner text-primary"></span>
	{:else}
		<svg 
			viewBox="0 0 1000 450" 
			class="w-full h-auto max-h-[600px] p-8"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g class="provinces">
				{#each paths as p}
					{@const count = getCount(p.name)}
					{@const id = getId(p.name)}
					<path
						d={p.d}
						class="transition-all duration-300 cursor-pointer stroke-base-100 hover:stroke-primary hover:filter hover:brightness-105 {getProvinceColor(count)}"
						stroke-width="0.5"
						onmousemove={(e) => handleMouseMove(e, p.name, count)}
						onmouseleave={handleMouseLeave}
						onclick={() => id && onProvinceClick?.(id, p.name)}
					/>
				{/each}
			</g>
		</svg>
	{/if}

	{#if hoveredProvince}
		<div 
			transition:fade={{ duration: 150 }}
			class="fixed z-[100] pointer-events-none bg-base-100/95 backdrop-blur-md text-base-content p-4 rounded-xl shadow-2xl border border-base-200 flex flex-col gap-1 min-w-[180px]"
			style="left: {hoveredProvince.x + 20}px; top: {hoveredProvince.y + 20}px;"
		>
			<div class="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Wilayah</div>
			<div class="font-extrabold text-lg leading-tight">{hoveredProvince.name}</div>
			<div class="divider my-1 opacity-10"></div>
			<div class="flex items-center justify-between mt-1">
				<span class="text-sm opacity-70">Murid Terdaftar</span>
				<span class="badge badge-primary badge-lg font-mono font-bold">{hoveredProvince.count}</span>
			</div>
		</div>
	{/if}

	<!-- Legend -->
	<div class="absolute bottom-6 left-6 flex flex-col gap-3 p-4 bg-base-100/90 backdrop-blur rounded-2xl border border-base-200 shadow-lg">
		<div class="text-[10px] font-black uppercase opacity-40 tracking-widest">Densitas Murid</div>
		<div class="flex items-center gap-3">
			<div class="flex flex-col items-center gap-1">
				<div class="w-4 h-4 bg-base-300 rounded-md"></div>
				<span class="text-[9px] font-bold">0</span>
			</div>
			<div class="flex gap-1 items-end">
				<div class="w-4 h-4 bg-primary/20 rounded-md"></div>
				<div class="w-4 h-6 bg-primary/40 rounded-md"></div>
				<div class="w-4 h-8 bg-primary/60 rounded-md"></div>
				<div class="w-4 h-10 bg-primary/80 rounded-md"></div>
				<div class="w-4 h-12 bg-primary rounded-md"></div>
			</div>
			<div class="flex flex-col items-center gap-1">
				<div class="w-4 h-4 bg-primary rounded-md opacity-0"></div>
				<span class="text-[9px] font-bold">{maxCount}</span>
			</div>
		</div>
	</div>
</div>

<style>
	path {
		vector-effect: non-scaling-stroke;
		filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
	}
	path:hover {
		filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
		transform: translateY(-1px);
	}
</style>
