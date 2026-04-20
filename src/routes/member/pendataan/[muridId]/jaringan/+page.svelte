<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { ArrowLeft, Maximize, ZoomIn, ZoomOut, RefreshCw, Download, ListTree, GitMerge, Play, Pause, ArrowUpToLine, ArrowDownToLine } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let murid = $derived(data.murid);

	let networkContainer: HTMLDivElement;
	let network: any = null; // vis.Network instance
	let NetworkConstructor: any = null;
    
	let depth = $state(2);
	let isLoading = $state(true);
	let originalGraphData: any = null;

	// Fitur Lanjutan
	let isHierarchical = $state(true);
	let layoutDirection = $state<'DU' | 'UD'>('DU');
	let isPhysicsEnabled = $state(true);
	let edgeFilters = $state({
		Mursyid: true,
		Muhrim: true,
		Baiat: true,
		Wirid: true
	});

	async function initNetwork() {
		const { Network } = await import('vis-network');
		return Network;
	}

	async function loadGraphData() {
		isLoading = true;
		try {
			const res = await fetch(`/api/murid-network?rootId=${murid.id}&depth=${depth}`);
			if (!res.ok) throw new Error('Gagal memuat data jaringan');
			originalGraphData = await res.json();
		} catch (e) {
			console.error(e);
			originalGraphData = { nodes: [], edges: [] };
		} finally {
			isLoading = false;
		}
	}

	function getFilteredEdges() {
		if (!originalGraphData) return [];
		return originalGraphData.edges.filter((edge: any) => {
			if (edge.label === 'Mursyid') return edgeFilters.Mursyid;
			if (edge.label === 'Muhrim') return edgeFilters.Muhrim;
			if (edge.label === 'Baiat') return edgeFilters.Baiat;
			if (edge.label === 'Wirid') return edgeFilters.Wirid;
			return true;
		}).map((edge: any) => {
			let roundness = 0.0;
			// Berikan roundness yang berbeda untuk setiap jenis relasi 
			// agar tidak tumpang tindih baik di mode hierarki maupun jaring
			if (edge.label === 'Mursyid') roundness = 0.15;
			else if (edge.label === 'Wirid') roundness = -0.15;
			else if (edge.label === 'Baiat') roundness = 0.3;
			else if (edge.label === 'Muhrim') roundness = -0.3;
			
			return {
				...edge,
				smooth: {
					enabled: true,
					type: 'curvedCW',
					roundness: roundness
				}
			};
		});
	}

	function getOptions() {
		return {
			layout: {
				hierarchical: isHierarchical ? {
					direction: layoutDirection,
					sortMethod: 'directed',
					shakeTowards: 'leaves',
					levelSeparation: 150,
					nodeSpacing: 150
				} : false
			},
			nodes: {
				shape: 'dot',
				size: 16,
				font: { size: 14, face: 'Inter, sans-serif' },
				borderWidth: 2,
				shadow: true
			},
			edges: {
				width: 2,
				shadow: true,
				smooth: { type: 'dynamic' }
			},
			groups: {
				root: { color: { background: '#f59e0b', border: '#b45309', highlight: '#fcd34d' }, size: 24, font: { size: 16, bold: true } },
				murid: { color: { background: '#f3f4f6', border: '#9ca3af', highlight: '#e5e7eb' } }
			},
			physics: {
				enabled: isPhysicsEnabled,
				hierarchicalRepulsion: { nodeDistance: 150, avoidOverlap: 1 },
				forceAtlas2Based: { gravitationalConstant: -50, centralGravity: 0.01, springLength: 100, springConstant: 0.08 },
				maxVelocity: 50,
				solver: isHierarchical ? 'hierarchicalRepulsion' : 'forceAtlas2Based',
				timestep: 0.35,
				stabilization: { iterations: 150 }
			},
			interaction: {
				hover: true,
				hoverConnectedEdges: true,
				selectConnectedEdges: true,
				tooltipDelay: 200,
				zoomView: true,
				dragView: true
			}
		};
	}

	async function fetchAndDraw() {
		if (!networkContainer || !NetworkConstructor) return;
		
		await loadGraphData();
		
		if (network) {
			network.destroy();
		}

		const filteredData = {
			nodes: originalGraphData.nodes,
			edges: getFilteredEdges()
		};

		network = new NetworkConstructor(networkContainer, filteredData, getOptions());

		network.on('doubleClick', (params: any) => {
			if (params.nodes.length > 0) {
				goto(`/member/pendataan/${params.nodes[0]}`);
			}
		});
	}

	function applyFilters() {
		if (!network || !originalGraphData) return;
		network.setData({
			nodes: originalGraphData.nodes,
			edges: getFilteredEdges()
		});
	}

	function toggleLayout() {
		isHierarchical = !isHierarchical;
		// Recreate network completely to prevent physics explosion when switching modes
		if (network) {
			network.destroy();
			network = null;
		}
		const filteredData = {
			nodes: originalGraphData.nodes,
			edges: getFilteredEdges()
		};
		network = new NetworkConstructor(networkContainer, filteredData, getOptions());
		network.on('doubleClick', (params: any) => {
			if (params.nodes.length > 0) goto(`/member/pendataan/${params.nodes[0]}`);
		});
	}

	function toggleDirection() {
		layoutDirection = layoutDirection === 'DU' ? 'UD' : 'DU';
		if (isHierarchical && network) {
			network.destroy();
			const filteredData = { nodes: originalGraphData.nodes, edges: getFilteredEdges() };
			network = new NetworkConstructor(networkContainer, filteredData, getOptions());
			network.on('doubleClick', (params: any) => {
				if (params.nodes.length > 0) goto(`/member/pendataan/${params.nodes[0]}`);
			});
		}
	}

	function togglePhysics() {
		isPhysicsEnabled = !isPhysicsEnabled;
		if (network) {
			network.setOptions({ physics: { enabled: isPhysicsEnabled } });
		}
	}

	function exportPNG() {
		if (!networkContainer) return;
		const canvas = networkContainer.querySelector('canvas');
		if (!canvas) return;
		const url = canvas.toDataURL('image/png');
		const a = document.createElement('a');
		a.href = url;
		a.download = `Jaringan_Relasi_${murid.nama.replace(/\s+/g, '_')}.png`;
		a.click();
	}

	let depthTimer: NodeJS.Timeout;
	$effect(() => {
		// Watch depth changes
		const currentDepth = depth;
		clearTimeout(depthTimer);
		depthTimer = setTimeout(() => {
			if (typeof window !== 'undefined' && NetworkConstructor) {
				fetchAndDraw();
			}
		}, 300);
	});

	$effect(() => {
		// Watch filter changes
		// Destructure to trigger reactivity
		const { Mursyid, Muhrim, Baiat, Wirid } = edgeFilters;
		if (typeof window !== 'undefined' && network) {
			applyFilters();
		}
	});

	onMount(async () => {
		NetworkConstructor = await initNetwork();
		fetchAndDraw();
	});

	onDestroy(() => {
		if (network) {
			network.destroy();
		}
	});

	function zoomIn() { if (network) network.moveTo({ scale: network.getScale() * 1.2 }); }
	function zoomOut() { if (network) network.moveTo({ scale: network.getScale() / 1.2 }); }
	function fitGraph() { if (network) network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } }); }
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
				<input id="depth-slider" type="range" min="1" max="5" bind:value={depth} class="range range-xs range-primary" />
				<div class="w-full flex justify-between text-[10px] px-1 opacity-50">
					<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
				</div>
			</div>
			
			<div class="flex gap-2 border-l pl-6 border-base-300">
				<!-- Advanced Toggles -->
				<div class="tooltip tooltip-bottom" data-tip={isHierarchical ? "Beralih ke Tampilan Jaring" : "Beralih ke Tampilan Silsilah"}>
					<button class="btn btn-square btn-sm btn-outline {isHierarchical ? 'btn-active' : ''}" onclick={toggleLayout}>
						{#if isHierarchical}
							<ListTree class="h-4 w-4" />
						{:else}
							<GitMerge class="h-4 w-4" />
						{/if}
					</button>
				</div>
				{#if isHierarchical}
				<div class="tooltip tooltip-bottom" data-tip={layoutDirection === 'DU' ? "Ubah ke Atas-Bawah" : "Ubah ke Bawah-Atas"}>
					<button class="btn btn-square btn-sm btn-outline" onclick={toggleDirection}>
						{#if layoutDirection === 'DU'}
							<ArrowUpToLine class="h-4 w-4" />
						{:else}
							<ArrowDownToLine class="h-4 w-4" />
						{/if}
					</button>
				</div>
				{/if}
				<div class="tooltip tooltip-bottom" data-tip={isPhysicsEnabled ? "Bekukan Animasi" : "Jalankan Animasi"}>
					<button class="btn btn-square btn-sm btn-outline {isPhysicsEnabled ? 'btn-active' : ''}" onclick={togglePhysics}>
						{#if isPhysicsEnabled}
							<Pause class="h-4 w-4" />
						{:else}
							<Play class="h-4 w-4" />
						{/if}
					</button>
				</div>
				<div class="tooltip tooltip-bottom" data-tip="Simpan sebagai Gambar (PNG)">
					<button class="btn btn-square btn-sm btn-outline" onclick={exportPNG}>
						<Download class="h-4 w-4" />
					</button>
				</div>
			</div>

			<div class="flex gap-2 border-l pl-6 border-base-300">
				<button class="btn btn-square btn-sm btn-outline" onclick={zoomIn} title="Zoom In"><ZoomIn class="h-4 w-4" /></button>
				<button class="btn btn-square btn-sm btn-outline" onclick={zoomOut} title="Zoom Out"><ZoomOut class="h-4 w-4" /></button>
				<button class="btn btn-square btn-sm btn-outline" onclick={fitGraph} title="Fit to Screen"><Maximize class="h-4 w-4" /></button>
				<button class="btn btn-square btn-sm btn-primary" onclick={fetchAndDraw} title="Refresh"><RefreshCw class="h-4 w-4 {isLoading ? 'animate-spin' : ''}" /></button>
			</div>
		</div>
	</div>

	<!-- Canvas Area -->
	<div class="flex-1 relative bg-base-100 rounded-xl shadow-inner border border-base-200 overflow-hidden">
		<!-- Legend & Filters -->
		<div class="absolute top-4 left-4 z-10 bg-base-100/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-base-200 text-sm pointer-events-auto">
			<h3 class="font-bold mb-3 border-b border-base-300 pb-2">Filter Relasi</h3>
			<div class="space-y-2">
				<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-1 rounded-md transition-colors">
					<input type="checkbox" bind:checked={edgeFilters.Mursyid} class="checkbox checkbox-xs border-rose-600 checked:bg-rose-600" />
					<div class="w-4 h-1 bg-rose-600 rounded"></div> <span class="font-medium text-xs">Mursyid</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-1 rounded-md transition-colors">
					<input type="checkbox" bind:checked={edgeFilters.Muhrim} class="checkbox checkbox-xs border-blue-600 checked:bg-blue-600" />
					<div class="w-4 h-1 bg-blue-600 rounded"></div> <span class="font-medium text-xs">Muhrim</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-1 rounded-md transition-colors">
					<input type="checkbox" bind:checked={edgeFilters.Baiat} class="checkbox checkbox-xs border-emerald-600 checked:bg-emerald-600" />
					<div class="w-4 h-1 bg-emerald-600 rounded"></div> <span class="font-medium text-xs">Baiat</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-1 rounded-md transition-colors">
					<input type="checkbox" bind:checked={edgeFilters.Wirid} class="checkbox checkbox-xs border-sky-600 checked:bg-sky-600" />
					<div class="w-4 h-1 bg-sky-600 rounded"></div> <span class="font-medium text-xs">Wirid</span>
				</label>
				<div class="mt-3 pt-3 border-t border-base-300 flex items-center gap-3">
					<div class="w-3 h-3 bg-amber-500 rounded-full border border-amber-700 ml-1"></div> <span class="font-medium text-xs">Node Pusat</span>
				</div>
				<div class="flex items-center gap-3 mt-1">
					<div class="w-3 h-3 bg-gray-100 rounded-full border border-gray-400 ml-1"></div> <span class="font-medium text-xs">Node Murid</span>
				</div>
			</div>
			<div class="mt-3 pt-2 text-[10px] text-base-content/50 border-t border-base-300">
				* Klik ganda node untuk profil
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
		<div bind:this={networkContainer} class="w-full h-full cursor-grab active:cursor-grabbing outline-none bg-base-50"></div>
	</div>
</div>
