<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { ArrowLeft, Maximize, ZoomIn, ZoomOut, RefreshCw } from 'lucide-svelte';
	import { page } from '$app/stores';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let murid = $derived(data.murid);

	let networkContainer: HTMLDivElement;
	let network: any = null; // vis.Network instance
	let depth = $state(2);
	let isLoading = $state(true);

	// Dynamically import Network to avoid SSR issues
	async function initNetwork() {
		const { Network } = await import('vis-network');
		return Network;
	}

	async function loadGraphData() {
		isLoading = true;
		try {
			const res = await fetch(`/api/murid-network?rootId=${murid.id}&depth=${depth}`);
			if (!res.ok) throw new Error('Gagal memuat data jaringan');
			const graphData = await res.json();
			return graphData;
		} catch (e) {
			console.error(e);
			return { nodes: [], edges: [] };
		} finally {
			isLoading = false;
		}
	}

	async function drawGraph() {
		if (!networkContainer) return;
		
		const graphData = await loadGraphData();
		const NetworkConstructor = await initNetwork();

		const options = {
			nodes: {
				shape: 'dot',
				size: 16,
				font: {
					size: 14,
					face: 'Inter, sans-serif'
				},
				borderWidth: 2,
				shadow: true
			},
			edges: {
				width: 2,
				shadow: true,
				smooth: {
					type: 'continuous'
				}
			},
			groups: {
				root: {
					color: { background: '#f59e0b', border: '#b45309', highlight: '#fcd34d' },
					size: 24,
					font: { size: 16, bold: true }
				},
				murid: {
					color: { background: '#f3f4f6', border: '#9ca3af', highlight: '#e5e7eb' }
				}
			},
			physics: {
				forceAtlas2Based: {
					gravitationalConstant: -50,
					centralGravity: 0.01,
					springLength: 100,
					springConstant: 0.08
				},
				maxVelocity: 50,
				solver: 'forceAtlas2Based',
				timestep: 0.35,
				stabilization: { iterations: 150 }
			},
			interaction: {
				hover: true,
				tooltipDelay: 200,
				zoomView: true,
				dragView: true
			}
		};

		if (network) {
			network.destroy();
		}

		network = new NetworkConstructor(networkContainer, graphData, options);
	}

	$effect(() => {
		// Re-draw graph when depth changes
		// Wrap in a setTimeout to avoid running too often if slider is dragged quickly
		const timer = setTimeout(() => {
			if (typeof window !== 'undefined') {
				drawGraph();
			}
		}, 300);
		return () => clearTimeout(timer);
	});

	onMount(() => {
		// Initial draw is handled by the effect above since depth is initialized
	});

	onDestroy(() => {
		if (network) {
			network.destroy();
		}
	});

	function zoomIn() {
		if (network) network.moveTo({ scale: network.getScale() * 1.2 });
	}

	function zoomOut() {
		if (network) network.moveTo({ scale: network.getScale() / 1.2 });
	}

	function fitGraph() {
		if (network) network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
	}
</script>

<svelte:head>
	<title>Jaringan Relasi: {murid.nama} - TDMI</title>
</svelte:head>

<div class="flex flex-col h-[calc(100vh-100px)] space-y-4">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-base-200">
		<div class="flex items-center gap-4">
			<a href={`/member/pendataan/${murid.id}`} class="btn btn-ghost btn-sm btn-circle">
				<ArrowLeft class="h-5 w-5" />
			</a>
			<div>
				<h1 class="text-xl font-bold">Jaringan Relasi</h1>
				<p class="text-sm text-base-content/60">Node pusat: <span class="font-semibold text-base-content">{murid.nama}</span></p>
			</div>
		</div>

		<!-- Controls -->
		<div class="flex items-center gap-6">
			<div class="flex flex-col gap-1 w-48">
				<label for="depth-slider" class="text-xs font-semibold flex justify-between">
					<span>Kedalaman (Level)</span>
					<span class="badge badge-sm badge-primary">{depth}</span>
				</label>
				<input 
					id="depth-slider"
					type="range" 
					min="1" 
					max="5" 
					bind:value={depth} 
					class="range range-xs range-primary" 
				/>
				<div class="w-full flex justify-between text-[10px] px-1 opacity-50">
					<span>1</span>
					<span>2</span>
					<span>3</span>
					<span>4</span>
					<span>5</span>
				</div>
			</div>
			
			<div class="flex gap-2">
				<button class="btn btn-square btn-sm btn-outline" onclick={zoomIn} title="Zoom In">
					<ZoomIn class="h-4 w-4" />
				</button>
				<button class="btn btn-square btn-sm btn-outline" onclick={zoomOut} title="Zoom Out">
					<ZoomOut class="h-4 w-4" />
				</button>
				<button class="btn btn-square btn-sm btn-outline" onclick={fitGraph} title="Fit to Screen">
					<Maximize class="h-4 w-4" />
				</button>
				<button class="btn btn-square btn-sm btn-primary" onclick={drawGraph} title="Refresh">
					<RefreshCw class="h-4 w-4 {isLoading ? 'animate-spin' : ''}" />
				</button>
			</div>
		</div>
	</div>

	<!-- Canvas Area -->
	<div class="flex-1 relative bg-base-100 rounded-xl shadow-inner border border-base-200 overflow-hidden">
		<!-- Legend -->
		<div class="absolute top-4 left-4 z-10 bg-base-100/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-base-200 text-xs pointer-events-none">
			<h3 class="font-bold mb-2">Legenda Relasi</h3>
			<div class="space-y-1">
				<div class="flex items-center gap-2"><div class="w-4 h-1 bg-rose-600 rounded"></div> Mursyid</div>
				<div class="flex items-center gap-2"><div class="w-4 h-1 bg-blue-600 rounded"></div> Muhrim</div>
				<div class="flex items-center gap-2"><div class="w-4 h-1 bg-emerald-600 rounded"></div> Baiat</div>
				<div class="flex items-center gap-2"><div class="w-4 h-1 bg-sky-600 rounded"></div> Wirid</div>
				<div class="mt-2 pt-2 border-t border-base-300 flex items-center gap-2">
					<div class="w-3 h-3 bg-amber-500 rounded-full border border-amber-700"></div> Pusat
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-gray-100 rounded-full border border-gray-400"></div> Murid
				</div>
			</div>
		</div>

		<!-- Loading Overlay -->
		{#if isLoading}
			<div class="absolute inset-0 z-20 flex items-center justify-center bg-base-100/50 backdrop-blur-sm">
				<div class="flex flex-col items-center gap-3 bg-base-100 p-6 rounded-xl shadow-xl">
					<span class="loading loading-spinner loading-lg text-primary"></span>
					<p class="font-medium text-base-content/70">Memuat grafik jaringan...</p>
				</div>
			</div>
		{/if}

		<!-- Network Container -->
		<div bind:this={networkContainer} class="w-full h-full cursor-grab active:cursor-grabbing outline-none"></div>
	</div>
</div>
