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
		paths?: PathData[];
	}

	let { data, onProvinceClick, paths: externalPaths }: Props = $props();

	let internalPaths: PathData[] = $state([]);
	let loaded = $state(false);

	onMount(async () => {
		if (externalPaths && externalPaths.length > 0) {
			internalPaths = externalPaths;
			loaded = true;
			return;
		}

		try {
			const response = await fetch('/indonesia-paths.json');
			const allPaths = await response.json();
			// Filter to ensure only Indonesian provinces are shown (already cleaned, but safety check)
			internalPaths = allPaths;
		} catch (e) {
			console.error('Failed to load map paths:', e);
		} finally {
			loaded = true;
		}
	});

	// Use external paths if provided, otherwise internal
	let activePaths = $derived(externalPaths && externalPaths.length > 0 ? externalPaths : internalPaths);

	const maxCount = $derived(Math.max(...data.map((p) => p.count), 1));
	
	function getProvinceColor(count: number) {
		if (count === 0) return 'var(--map-land-empty)';
		
		const ratio = count / maxCount;
		// 5-level scale using CSS variables for theme safety
		if (ratio < 0.15) return 'var(--map-p-1)';
		if (ratio < 0.4) return 'var(--map-p-2)';
		if (ratio < 0.7) return 'var(--map-p-3)';
		if (ratio < 0.9) return 'var(--map-p-4)';
		return 'oklch(var(--p))';
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

	function handleKeydown(event: KeyboardEvent, id: number, name: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onProvinceClick?.(id, name);
		}
	}
</script>

<div class="relative w-full bg-base-100 rounded-3xl border border-base-200 overflow-hidden shadow-sm map-container aspect-[850/380] sm:min-h-[400px]">
	{#if !loaded}
		<div class="flex flex-col items-center justify-center h-full gap-2">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<span class="text-xs font-bold opacity-40 uppercase tracking-widest">Memuat Peta...</span>
		</div>
	{:else}
		<svg 
			viewBox="0 0 850 380" 
			class="w-full h-full p-2 sm:p-6"
			xmlns="http://www.w3.org/2000/svg"
		>
			<!-- SEA LAYER -->
			<rect width="850" height="380" fill="var(--map-sea)" rx="24" />
			
			<g class="provinces" transform="translate(30, 20)">
				{#each activePaths as p}
					{@const count = getCount(p.name)}
					{@const id = getId(p.name)}
					<path
						d={p.d}
						role="button"
						tabindex="0"
						aria-label="{p.name}: {count} murid"
						class="province-path transition-all duration-300 cursor-pointer"
						style="fill: {getProvinceColor(count)}; stroke: var(--map-border); stroke-width: 0.6px;"
						onmousemove={(e) => handleMouseMove(e, p.name, count)}
						onmouseleave={handleMouseLeave}
						onclick={() => id && onProvinceClick?.(id, p.name)}
						onkeydown={(e) => id && handleKeydown(e, id, p.name)}
					/>
				{/each}
			</g>
		</svg>
	{/if}

	{#if hoveredProvince}
		<div 
			transition:fade={{ duration: 100 }}
			class="fixed z-[100] pointer-events-none bg-base-100 text-base-content p-4 rounded-2xl shadow-2xl border border-base-300 flex flex-col gap-1 min-w-[180px]"
			style="left: {hoveredProvince.x + 20}px; top: {hoveredProvince.y + 20}px;"
		>
			<div class="text-[10px] font-bold opacity-40 uppercase tracking-widest">Wilayah</div>
			<div class="font-black text-lg leading-tight">{hoveredProvince.name}</div>
			<div class="divider my-1 opacity-10"></div>
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium opacity-60">Terdaftar</span>
				<span class="badge badge-primary font-mono font-black">{hoveredProvince.count}</span>
			</div>
		</div>
	{/if}

	<!-- LEGEND -->
	<div class="absolute bottom-2 left-2 sm:bottom-12 sm:left-12 flex flex-row sm:flex-col items-center sm:items-stretch gap-2 sm:gap-3 p-1.5 sm:p-4 bg-base-100/70 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-base-200 shadow-xl origin-bottom-left transition-all">
		<div class="text-[8px] sm:text-[10px] font-black uppercase opacity-40 tracking-widest text-center">Kepadatan</div>
		<div class="flex items-center gap-2 sm:gap-3">
			<div class="flex flex-col items-center gap-0.5 sm:gap-1">
				<div class="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded shadow-inner border border-base-content/10" style="background-color: var(--map-land-empty)"></div>
				<span class="text-[7px] sm:text-[9px] font-bold opacity-50">0</span>
			</div>
			<div class="flex gap-0.5 items-end h-5 sm:h-12">
				<div class="w-1.5 sm:w-3 h-1/4 rounded-t-[1px] sm:rounded-t" style="background-color: var(--map-p-1)"></div>
				<div class="w-1.5 sm:w-3 h-2/4 rounded-t-[1px] sm:rounded-t" style="background-color: var(--map-p-2)"></div>
				<div class="w-1.5 sm:w-3 h-3/4 rounded-t-[1px] sm:rounded-t" style="background-color: var(--map-p-3)"></div>
				<div class="w-1.5 sm:w-3 h-full rounded-t-[1px] sm:rounded-t bg-primary"></div>
			</div>
			<div class="flex flex-col items-center gap-0.5 sm:gap-1">
				<div class="w-2.5 h-2.5 sm:w-4 sm:h-4"></div>
				<span class="text-[7px] sm:text-[9px] font-bold">{maxCount}</span>
			</div>
		</div>
	</div>
</div>

<style>
	.map-container {
		/* 
           UNIVERSAL THEME ADAPTER
           We use oklch() wrapper for all variables to ensure DaisyUI 4 compatibility.
           We use color-mix to derive shades relative to the active theme.
        */
        
        /* 1. The Sea: A mix of neutral and base background. */
		--map-sea: color-mix(in oklch, oklch(var(--n)) 15%, oklch(var(--b1)));
        
        /* 2. Empty Land: Slightly lighter/darker than sea to remain distinct. */
		--map-land-empty: color-mix(in oklch, oklch(var(--bc)) 8%, oklch(var(--b1)));
        
        /* 3. The Border: ALWAYS derived from Base Content (Text Color) for guaranteed contrast. */
        --map-border: oklch(var(--bc) / 0.25);
		
		/* 4. Density Scale: Explicitly mixing Primary with the base background. */
		--map-p-1: color-mix(in oklch, oklch(var(--p)) 20%, var(--map-land-empty));
		--map-p-2: color-mix(in oklch, oklch(var(--p)) 40%, var(--map-land-empty));
		--map-p-3: color-mix(in oklch, oklch(var(--p)) 60%, var(--map-land-empty));
		--map-p-4: color-mix(in oklch, oklch(var(--p)) 80%, var(--map-land-empty));
	}

	.province-path {
		vector-effect: non-scaling-stroke;
		outline: none;
	}
	
	.province-path:focus-visible {
		stroke: oklch(var(--p)) !important;
		stroke-width: 3px !important;
		filter: brightness(1.2);
	}

	.province-path:hover {
		filter: brightness(1.1);
		transform: translateY(-1px);
        stroke: oklch(var(--bc) / 0.5) !important;
        stroke-width: 1.5px !important;
	}

    /* SPECIFIC FIX FOR EXTREME THEMES (High/Low Lightness) */
    /* Light themes like Lofi, Pastel, Wireframe */
    :global([data-theme='lofi']), :global([data-theme='wireframe']), :global([data-theme='pastel']) {
        .map-container {
            --map-sea: #f0f4f8;
            --map-land-empty: #ffffff;
            --map-border: rgba(0,0,0,0.1);
        }
    }

    /* Dark themes like Black, Luxury, Night-Glow */
    :global([data-theme='black']), :global([data-theme='luxury']), :global([data-theme='tdmi-night-glow']) {
        .map-container {
            --map-sea: #000000;
            --map-land-empty: #1a1a1a;
            --map-border: rgba(255,255,255,0.15);
        }
    }
</style>
