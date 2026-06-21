<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { ArrowLeft, Maximize, ZoomIn, ZoomOut, RefreshCw, Download, ListTree, GitMerge, Play, Pause, ArrowUpToLine, ArrowDownToLine, ChevronUp, ChevronDown, Filter, Crosshair, RotateCcw } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let murid = $derived(data.murid);

	let networkContainer: HTMLDivElement;
	let tooltipEl: HTMLDivElement;
	let cy: any = null;
	let cytoscapeModule: any = null;

	let depth = $state(2);
	let isLoading = $state(true);
	let originalGraphData: any = $state(null);

	let isHierarchical = $state(true);
	let layoutDirection = $state<'TB' | 'BT'>('BT');
	let isPhysicsEnabled = $state(true);
	let showEdgeLabels = $state(false);
	let isFilterOpen = $state(true);
	let edgeFilters = $state({
		Mursyid: true,
		Muhrim: true,
		Baiat: true,
		Wirid: true
	});

	let collapsedNodes = $state(new Set<string>());
	let currentRootId = $state('');
	let originalRootId = $state('');
	let contextMenu = $state<{ x: number; y: number; nodeId: string } | null>(null);

	function findDescendantIds(rootId: string, edata: any): string[] {
		const result = new Set<string>();
		const queue = [rootId];
		while (queue.length > 0) {
			const current = queue.shift()!;
			for (const edge of edata) {
				if (String(edge.to) === current) {
					const child = String(edge.from);
					if (!result.has(child) && child !== rootId) {
						result.add(child);
						queue.push(child);
					}
				}
			}
		}
		return Array.from(result);
	}

	function toCyElements(edata: any) {
		const excludedIds = new Set<string>();
		for (const collapsedId of collapsedNodes) {
			for (const id of findDescendantIds(collapsedId, edata.edges)) {
				excludedIds.add(id);
			}
		}
		excludedIds.delete(originalRootId);
		for (const id of findDescendantIds(originalRootId, edata.edges)) {
			excludedIds.delete(id);
		}

		const nodeMap = new Map<string, any>();
		for (const n of edata.nodes) nodeMap.set(String(n.id), n);

		const nodes = edata.nodes
			.filter((n: any) => !excludedIds.has(String(n.id)))
			.map((n: any) => {
				const id = String(n.id);
				const hasChildren = edata.edges.some((e: any) => String(e.to) === id);
				const isCollapsed = collapsedNodes.has(id);
				const title = isCollapsed
					? `Klik untuk kembangkan`
					: hasChildren
						? `Klik untuk ciutkan — ${n.title}`
						: n.title;
				return {
					group: 'nodes',
					data: { id, label: n.label, title },
					classes: [
						n.group === 'root' ? 'root' : '',
						hasChildren ? 'collapsible' : '',
						isCollapsed ? 'collapsed' : ''
					].filter(Boolean).join(' ')
				};
			});

		const edges = edata.edges
			.filter((e: any) => !excludedIds.has(String(e.from)) && !excludedIds.has(String(e.to)))
			.map((e: any) => {
				const d: any = {
					id: `${e.from}-${e.to}-${e.label}`,
					source: String(e.from),
					target: String(e.to),
					type: e.label,
					label: e.label
				};
				return { group: 'edges', data: d, classes: e.label };
			});

		return nodes.concat(edges);
	}

	function getStyles() {
		return [
			{
				selector: 'node',
				style: {
					'background-color': '#f3f4f6',
					'border-color': '#9ca3af',
					'border-width': 2,
					width: 16,
					height: 16,
					label: 'data(label)',
					'font-size': '13px',
					'font-family': 'Inter, sans-serif',
					color: '#1f2937',
					'text-outline-color': 'rgba(255,255,255,0.85)',
					'text-outline-width': 3,
					'text-halign': 'center',
					'text-valign': 'bottom',
					'text-margin-y': 4,
					shape: 'ellipse',
					'min-zoomed-font-size': 6
				}
			},
			{
				selector: 'node.root',
				style: {
					'background-color': '#f59e0b',
					'border-color': '#b45309',
					width: 24,
					height: 24,
					'font-size': '16px',
					'font-weight': 'bold'
				}
			},
			{
				selector: 'node.collapsible',
				style: {
					'border-color': '#818cf8',
					'border-width': 2,
					'border-opacity': 0.5
				}
			},
			{
				selector: 'node.collapsed',
				style: {
					'border-color': '#6366f1',
					'border-width': 3,
					'border-opacity': 0.8,
					'background-color': '#eef2ff'
				}
			},
			{
				selector: 'edge',
				style: {
					width: 2,
					'curve-style': 'bezier',
					'target-arrow-shape': 'triangle',
					'arrow-scale': 1.2,
					'line-color': '#9ca3af',
					'target-arrow-color': '#9ca3af',
					'font-size': '12px',
					'font-family': 'Inter, sans-serif',
					color: '#1f2937',
					'text-outline-color': 'rgba(255,255,255,0.85)',
					'text-outline-width': 3,
					'text-halign': 'center',
					'text-valign': 'center'
				}
			},
			{
				selector: 'edge.Mursyid',
				style: { 'line-color': '#e11d48', 'target-arrow-color': '#e11d48' }
			},
			{
				selector: 'edge.Muhrim',
				style: { 'line-color': '#2563eb', 'target-arrow-color': '#2563eb' }
			},
			{
				selector: 'edge.Baiat',
				style: { 'line-color': '#059669', 'target-arrow-color': '#059669' }
			},
			{
				selector: 'edge.Wirid',
				style: { 'line-color': '#0284c7', 'target-arrow-color': '#0284c7' }
			}
		];
	}

	function getLayoutOptions(fit = true) {
		const animate = isPhysicsEnabled;
		if (isHierarchical) {
			return {
				name: 'dagre',
				rankDir: layoutDirection,
				nodeSep: 150,
				rankSep: 150,
				edgeSep: 42,
				animate,
				animationDuration: animate ? 500 : 0,
				fit,
				padding: fit ? 40 : 30
			};
		}
		return {
			name: 'cose',
			animate,
			animationDuration: animate ? 500 : 0,
			fit,
			padding: fit ? 40 : 30,
			nodeRepulsion: 8000,
			idealEdgeLength: 100,
			gravity: 0.1,
			numIter: 1000,
			initialTemp: 200,
			coolingFactor: 0.95
		};
	}

	let clickTimer: any;

	function wireEvents() {
		cy.on('mouseover', 'node', (evt: any) => {
			const node = evt.target;
			const title = node.data('title');
			if (title && tooltipEl) {
				tooltipEl.textContent = title;
				tooltipEl.style.display = 'block';
			}
		});
		cy.on('mousemove', 'node', (evt: any) => {
			if (tooltipEl && tooltipEl.style.display !== 'none') {
				const rect = networkContainer.getBoundingClientRect();
				tooltipEl.style.left = (evt.originalEvent.clientX + 12) + 'px';
				tooltipEl.style.top = (evt.originalEvent.clientY + 12) + 'px';
			}
		});
		cy.on('mouseout', 'node', () => {
			if (tooltipEl) tooltipEl.style.display = 'none';
		});

		cy.on('click', 'node', (evt: any) => {
			clearTimeout(clickTimer);
			clickTimer = setTimeout(() => {
				const node = evt.target;
				const nodeId = node.id();
				const classes = node.classes();
				if (classes.includes('collapsible')) {
					toggleCollapse(nodeId);
				}
			}, 250);
		});

		cy.on('dblclick', 'node', (evt: any) => {
			clearTimeout(clickTimer);
			goto(`/member/pendataan/${evt.target.id()}`);
		});

		cy.on('cxttap', 'node', (evt: any) => {
			evt.originalEvent?.preventDefault?.();
			const node = evt.target;
			const nodeId = node.id();
			const rect = networkContainer.getBoundingClientRect();
			const rp = evt.renderedPosition || evt.position;
			contextMenu = {
				x: rect.left + (rp?.x ?? 0),
				y: rect.top + (rp?.y ?? 0),
				nodeId
			};
		});

		cy.on('tap', () => {
			if (contextMenu) contextMenu = null;
		});
	}

	function createCytoscape(elements: any[], fit = true) {
		if (cy) { cy.destroy(); cy = null; }

		cy = cytoscapeModule({
			container: networkContainer,
			elements,
			style: getStyles(),
			layout: getLayoutOptions(fit)
		});

		wireEvents();

		if (fit) {
			cy.one('layoutstop', () => {
				if (!cy) return;
				const root = cy.getElementById(originalRootId);
				if (root.length > 0) cy.fit(root, 120);
			});
		}
	}

	function getParentId(nodeId: string): string | null {
		if (!originalGraphData) return null;
		for (const edge of originalGraphData.edges) {
			if (String(edge.from) === nodeId) return String(edge.to);
		}
		return null;
	}

	function focusParent() {
		const parentId = getParentId(currentRootId);
		if (parentId) focusNode(parentId);
	}

	function applyFilters() {
		if (!cy) return;

		cy.edges().forEach((edge: any) => {
			const type = edge.data('type') as string;
			edge.style('display', type && edgeFilters[type as keyof typeof edgeFilters] ? 'element' : 'none');
			if (showEdgeLabels) {
				edge.data('label', edge.data('type'));
			} else {
				edge.removeData('label');
			}
		});
	}

	function rebuildGraph(fit = true) {
		if (!originalGraphData || !cytoscapeModule) return;
		const elements = toCyElements(originalGraphData);

		if (cy && !fit) {
			const zoom = cy.zoom();
			const pan = cy.pan();
			cy.destroy();
			cy = null;
			createCytoscape(elements, false);
			applyFilters();
			requestAnimationFrame(() => {
				if (cy) { cy.zoom(zoom); cy.pan(pan); }
			});
		} else {
			createCytoscape(elements, fit);
			applyFilters();
		}
	}

	async function loadGraphData() {
		isLoading = true;
		try {
			const rootId = currentRootId || murid.id;
			const res = await fetch(`/api/murid-network?rootId=${rootId}&depth=${depth}`);
			if (!res.ok) throw new Error('Gagal memuat data jaringan');
			originalGraphData = await res.json();
		} catch (e) {
			console.error(e);
			originalGraphData = { nodes: [], edges: [] };
		} finally {
			isLoading = false;
		}
	}

	async function fetchAndDraw() {
		if (!networkContainer || !cytoscapeModule) return;

		await loadGraphData();
		collapsedNodes = new Set();
		rebuildGraph();
	}

	function toggleCollapse(nodeId: string) {
		const next = new Set(collapsedNodes);
		if (next.has(nodeId)) {
			next.delete(nodeId);
		} else {
			next.add(nodeId);
		}
		collapsedNodes = next;
	}

	function focusNode(nodeId: string) {
		contextMenu = null;
		currentRootId = nodeId;
		collapsedNodes = new Set();
		fetchAndDraw();
	}

	function resetFocus() {
		contextMenu = null;
		currentRootId = originalRootId;
		collapsedNodes = new Set();
		fetchAndDraw();
	}

	function toggleLayout() {
		isHierarchical = !isHierarchical;
		if (cy) {
			cy.layout(getLayoutOptions()).run();
		}
	}

	function toggleDirection() {
		layoutDirection = layoutDirection === 'TB' ? 'BT' : 'TB';
		if (isHierarchical && cy) {
			cy.layout(getLayoutOptions()).run();
		}
	}

	function togglePhysics() {
		isPhysicsEnabled = !isPhysicsEnabled;
		if (!cy) return;
		if (isPhysicsEnabled) {
			cy.nodes().unlock();
			cy.layout(getLayoutOptions()).run();
		} else {
			cy.stop();
			cy.nodes().lock();
		}
	}

	function exportPNG() {
		if (!cy) return;
		const url = cy.png({ full: true, scale: 2 });
		const a = document.createElement('a');
		a.href = url;
		a.download = `Jaringan_Relasi_${murid.nama.replace(/\s+/g, '_')}.png`;
		a.click();
	}

	function expandAll() {
		if (collapsedNodes.size === 0) return;
		collapsedNodes = new Set();
	}

	function collapseAll() {
		if (!originalGraphData) return;
		const collapsibleIds = new Set<string>();
		for (const edge of originalGraphData.edges) {
			const parentId = String(edge.to);
			if (!collapsibleIds.has(parentId)) {
				const descendants = findDescendantIds(parentId, originalGraphData.edges);
				if (descendants.length > 0) collapsibleIds.add(parentId);
			}
		}
		collapsedNodes = collapsibleIds;
	}

	let depthTimer: NodeJS.Timeout;
	$effect(() => {
		const currentDepth = depth;
		clearTimeout(depthTimer);
		depthTimer = setTimeout(() => {
			if (typeof window !== 'undefined' && cytoscapeModule) {
				fetchAndDraw();
			}
		}, 300);
	});

	$effect(() => {
		const { Mursyid, Muhrim, Baiat, Wirid } = edgeFilters;
		const _labels = showEdgeLabels;
		if (typeof window !== 'undefined' && cy) {
			applyFilters();
		}
	});

	$effect(() => {
		const _ = Array.from(collapsedNodes);
		if (typeof window !== 'undefined' && cy) {
			rebuildGraph(false);
		}
	});

	onMount(async () => {
		const cytoscape = (await import('cytoscape')).default;
		const dagre = (await import('cytoscape-dagre')).default;
		cytoscape.use(dagre);
		cytoscapeModule = cytoscape;
		originalRootId = String(murid.id);
		currentRootId = String(murid.id);
		fetchAndDraw();
	});

	onDestroy(() => {
		if (cy) cy.destroy();
	});

	function zoomIn() { if (cy) cy.zoom(cy.zoom() * 1.2); }
	function zoomOut() { if (cy) cy.zoom(cy.zoom() / 1.2); }
	function fitGraph() { if (cy) cy.fit(undefined, 30); }
	function centerRoot() {
		if (!cy) return;
		const el = cy.getElementById(originalRootId);
		if (el && el.length > 0) {
			cy.animate({ center: { eles: el }, duration: 300 });
		}
	}

	function ctxFocus() { if (contextMenu) focusNode(contextMenu.nodeId); }
	function ctxCenter() {
		if (!contextMenu) return;
		if (!cy) return;
		const el = cy.getElementById(contextMenu.nodeId);
		if (el && el.length > 0) cy.fit(el, 60);
		contextMenu = null;
	}
	function ctxToggleCollapse() {
		if (!contextMenu) return;
		toggleCollapse(contextMenu.nodeId);
		contextMenu = null;
	}
</script>

<svelte:head>
	<title>Jaringan Relasi: {murid.nama} - TDMI</title>
</svelte:head>

<div bind:this={tooltipEl} class="fixed z-50 px-2 py-1 text-xs rounded shadow-lg bg-gray-900 text-white pointer-events-none hidden leading-tight"></div>

{#if contextMenu}
	<div class="fixed z-50 bg-base-100 shadow-xl border border-base-200 rounded-xl py-1 min-w-[180px] text-sm" style="left: {contextMenu.x}px; top: {contextMenu.y}px;">
		<button class="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2" onclick={ctxFocus}>
			<Crosshair class="h-3.5 w-3.5 text-primary" /> Jadikan Node Pusat
		</button>
		<button class="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2 border-b border-base-200" onclick={ctxCenter}>
			<Maximize class="h-3.5 w-3.5" /> Pusatkan ke Node Ini
		</button>
		<button class="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2" onclick={ctxToggleCollapse}>
			{#if collapsedNodes.has(contextMenu.nodeId)}
				<ListTree class="h-3.5 w-3.5 text-accent" /> Kembangkan Cabang
			{:else}
				<ListTree class="h-3.5 w-3.5 text-secondary" /> Ciutkan Cabang
			{/if}
		</button>
	</div>
{/if}

<div class="flex flex-col h-[calc(100vh-100px)] space-y-4">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-base-200">
		<div class="flex items-center gap-4">
			<a href={`/member/pendataan/${murid.id}`} class="btn btn-ghost btn-sm btn-circle">
				<ArrowLeft class="h-5 w-5" />
			</a>
			<div>
				<h1 class="text-xl font-bold">Jaringan Relasi</h1>
				<p class="text-sm text-base-content/60">
					Node pusat:
					<span class="font-semibold">
						{#if currentRootId !== originalRootId}
							<button class="link link-primary no-underline" onclick={resetFocus}>{data.murid.nama}</button>
							<span class="text-base-content/40"> → </span>
							{originalGraphData?.nodes?.find((n: any) => String(n.id) === currentRootId)?.label ?? currentRootId}
						{:else}
							{data.murid.nama}
						{/if}
					</span>
				</p>
			</div>
		</div>

		<div class="flex items-center gap-6">
			<div class="flex items-center gap-1">
				<button class="btn btn-xs btn-ghost" onclick={expandAll} disabled={collapsedNodes.size === 0} title="Kembangkan Semua">
					<ListTree class="h-3 w-3" /> Semua
				</button>
				<button class="btn btn-xs btn-ghost" onclick={collapseAll} disabled={!originalGraphData} title="Ciutkan Semua">
					<ListTree class="h-3 w-3" /> Ciutkan
				</button>
			</div>

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
				<div class="tooltip tooltip-bottom" data-tip={isHierarchical ? "Beralih ke Tampilan Jaring" : "Beralih ke Tampilan Silsilah"}>
					<button class="btn btn-square btn-sm btn-outline {isHierarchical ? 'btn-active' : ''}" onclick={toggleLayout} aria-label={isHierarchical ? "Beralih ke Tampilan Jaring" : "Beralih ke Tampilan Silsilah"}>
						{#if isHierarchical}
							<ListTree class="h-4 w-4" />
						{:else}
							<GitMerge class="h-4 w-4" />
						{/if}
					</button>
				</div>
				{#if isHierarchical}
				<div class="tooltip tooltip-bottom" data-tip={layoutDirection === 'TB' ? "Ubah ke Bawah-Atas" : "Ubah ke Atas-Bawah"}>
					<button class="btn btn-square btn-sm btn-outline" onclick={toggleDirection} aria-label={layoutDirection === 'TB' ? "Ubah ke Atas-Bawah" : "Ubah ke Bawah-Atas"}>
						{#if layoutDirection === 'TB'}
							<ArrowUpToLine class="h-4 w-4" />
						{:else}
							<ArrowDownToLine class="h-4 w-4" />
						{/if}
					</button>
				</div>
				{/if}
				<div class="tooltip tooltip-bottom" data-tip={isPhysicsEnabled ? "Bekukan Animasi" : "Jalankan Animasi"}>
					<button class="btn btn-square btn-sm btn-outline {isPhysicsEnabled ? 'btn-active' : ''}" onclick={togglePhysics} aria-label={isPhysicsEnabled ? "Bekukan Animasi" : "Jalankan Animasi"}>
						{#if isPhysicsEnabled}
							<Pause class="h-4 w-4" />
						{:else}
							<Play class="h-4 w-4" />
						{/if}
					</button>
				</div>
				<div class="tooltip tooltip-bottom" data-tip="Simpan sebagai Gambar (PNG)">
					<button class="btn btn-square btn-sm btn-outline" onclick={exportPNG} aria-label="Simpan sebagai Gambar (PNG)">
						<Download class="h-4 w-4" />
					</button>
				</div>
			</div>

			<div class="flex gap-2 border-l pl-6 border-base-300">
				<div class="tooltip tooltip-bottom" data-tip="Pusatkan ke Node Utama">
					<button class="btn btn-square btn-sm btn-outline" onclick={centerRoot} aria-label="Pusatkan ke Node Utama">
						<Crosshair class="h-4 w-4" />
					</button>
				</div>
				{#if currentRootId !== originalRootId}
				<div class="tooltip tooltip-bottom" data-tip="Naik ke Parent">
					<button class="btn btn-square btn-sm btn-outline" onclick={focusParent} aria-label="Naik ke Parent">
						<ArrowUpToLine class="h-4 w-4" />
					</button>
				</div>
				{/if}
				<button class="btn btn-square btn-sm btn-outline" onclick={zoomIn} aria-label="Zoom In"><ZoomIn class="h-4 w-4" /></button>
				<button class="btn btn-square btn-sm btn-outline" onclick={zoomOut} aria-label="Zoom Out"><ZoomOut class="h-4 w-4" /></button>
				<div class="tooltip tooltip-bottom" data-tip="Sesuaikan Tampilan">
					<button class="btn btn-square btn-sm btn-outline" onclick={fitGraph} aria-label="Sesuaikan Tampilan"><Maximize class="h-4 w-4" /></button>
				</div>
				<button class="btn btn-square btn-sm btn-primary" onclick={fetchAndDraw} aria-label="Refresh"><RefreshCw class="h-4 w-4 {isLoading ? 'animate-spin' : ''}" /></button>
			</div>
		</div>
	</div>

	<!-- Canvas Area -->
	<div class="flex-1 relative bg-base-100 rounded-xl shadow-inner border border-base-200 overflow-hidden">
		<!-- Legend & Filters -->
		<div class="absolute top-4 left-4 z-10 bg-base-100/90 backdrop-blur-sm rounded-xl shadow-lg border border-base-200 text-sm pointer-events-auto overflow-hidden transition-all duration-300 whitespace-nowrap {isFilterOpen ? 'w-56' : 'w-[46px]'}">
			<button class="w-full flex items-center justify-between p-3 font-bold bg-base-200/50 hover:bg-base-200 cursor-pointer {isFilterOpen ? 'border-b border-base-300' : ''}" onclick={() => isFilterOpen = !isFilterOpen} aria-label={isFilterOpen ? "Tutup filter relasi" : "Buka filter relasi"}>
				<div class="flex items-center gap-2">
					<Filter class="h-4 w-4" />
					{#if isFilterOpen}<span>Filter Relasi</span>{/if}
				</div>
				{#if isFilterOpen}
					<ChevronUp class="h-4 w-4 text-base-content/50" />
				{/if}
			</button>

			{#if isFilterOpen}
			<div class="p-4 space-y-2">
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

				<div class="mt-3 pt-3 border-t border-base-300">
					<label class="flex items-center justify-between cursor-pointer hover:bg-base-200 p-1 rounded-md transition-colors">
						<span class="font-medium text-xs">Tampilkan Label Garis</span>
						<input type="checkbox" bind:checked={showEdgeLabels} class="toggle toggle-xs toggle-primary" />
					</label>
				</div>

				<div class="mt-3 pt-3 border-t border-base-300 flex items-center gap-3">
					<div class="w-3 h-3 bg-amber-500 rounded-full border border-amber-700 ml-1"></div> <span class="font-medium text-xs">Node Pusat</span>
				</div>
				<div class="flex items-center gap-3 mt-1">
					<div class="w-3 h-3 bg-gray-100 rounded-full border border-gray-400 ml-1"></div> <span class="font-medium text-xs">Node Murid</span>
				</div>
				<div class="flex items-center gap-3 mt-1">
					<div class="w-3 h-3 bg-white rounded-full border-2 border-indigo-500 ml-1"></div> <span class="font-medium text-xs">Dapat diciutkan</span>
				</div>
				<div class="flex items-center gap-3 mt-1">
					<div class="w-3 h-3 bg-white rounded-full border-2 border-indigo-500 ml-1 opacity-70"></div> <span class="font-medium text-xs">Sudah diciutkan</span>
				</div>
				<div class="mt-2 pt-2 text-[10px] text-base-content/50 border-t border-base-300 whitespace-normal">
					* Klik node untuk ciutkan/kembangkan
				</div>
				<div class="text-[10px] text-base-content/50 whitespace-normal">
					* Klik kanan node → Jadikan Pusat
				</div>
			</div>
			{/if}
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
