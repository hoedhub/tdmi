import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { inArray, or } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	// Verify user is logged in
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const rootIdStr = url.searchParams.get('rootId');
	const depthStr = url.searchParams.get('depth');

	if (!rootIdStr) {
		throw error(400, 'Missing rootId parameter');
	}

	const rootId = parseInt(rootIdStr, 10);
	const maxDepth = parseInt(depthStr || '2', 10);

	if (isNaN(rootId)) {
		throw error(400, 'Invalid rootId parameter');
	}

	const visitedNodes = new Set<number>();
	const nodesMap = new Map<number, any>();
	const edgesMap = new Map<string, any>();

	let currentLayer = [rootId];

	for (let depth = 0; depth <= maxDepth; depth++) {
		if (currentLayer.length === 0) break;

		// Query 1: Get the nodes themselves
		const selfResults = await db
			.select({
				id: muridTable.id,
				nama: muridTable.nama,
				mursyidId: muridTable.mursyidId,
				muhrimId: muridTable.muhrimId,
				baiatId: muridTable.baiatId,
				wiridId: muridTable.wiridId
			})
			.from(muridTable)
			.where(inArray(muridTable.id, currentLayer));

		// Query 2: Get nodes that point to these nodes (children)
		// Only query children if we are going to expand edges from them
		let childrenResults: any[] = [];
		if (depth < maxDepth) {
			childrenResults = await db
				.select({
					id: muridTable.id,
					nama: muridTable.nama,
					mursyidId: muridTable.mursyidId,
					muhrimId: muridTable.muhrimId,
					baiatId: muridTable.baiatId,
					wiridId: muridTable.wiridId
				})
				.from(muridTable)
				.where(
					or(
						inArray(muridTable.mursyidId, currentLayer),
						inArray(muridTable.muhrimId, currentLayer),
						inArray(muridTable.baiatId, currentLayer),
						inArray(muridTable.wiridId, currentLayer)
					)
				);
		}

		const nextLayer = new Set<number>();

		const processRow = (row: any) => {
			if (!nodesMap.has(row.id)) {
				nodesMap.set(row.id, {
					id: row.id,
					label: row.nama,
					group: row.id === rootId ? 'root' : 'murid',
					title: `ID: ${row.id}` // Tooltip
				});
			}

			// Do not add edges that originate from nodes at the maxDepth boundary
			// because those edges would point to nodes (depth+1) that we won't fetch.
			if (depth >= maxDepth) return;

			const addEdge = (fromId: number, toId: number, type: string, color: string) => {
				if (!fromId || !toId) return;
				const edgeKey = `${fromId}-${toId}-${type}`;
				if (!edgesMap.has(edgeKey)) {
					edgesMap.set(edgeKey, {
						from: fromId,
						to: toId,
						label: type,
						color: { color, highlight: color },
						arrows: 'to',
						font: { size: 10, align: 'middle' }
					});
				}
				if (!visitedNodes.has(toId) && depth < maxDepth) nextLayer.add(toId);
				if (!visitedNodes.has(fromId) && depth < maxDepth) nextLayer.add(fromId);
			};

			if (row.mursyidId) addEdge(row.id, row.mursyidId, 'Mursyid', '#e11d48'); // rose-600
			if (row.muhrimId) addEdge(row.id, row.muhrimId, 'Muhrim', '#2563eb'); // blue-600
			if (row.baiatId) addEdge(row.id, row.baiatId, 'Baiat', '#059669'); // emerald-600
			if (row.wiridId) addEdge(row.id, row.wiridId, 'Wirid', '#0284c7'); // sky-600
		};

		selfResults.forEach(processRow);
		childrenResults.forEach(processRow);

		// Mark current layer as visited
		currentLayer.forEach((id) => visitedNodes.add(id));

		// Next layer is the discovered nodes that haven't been visited yet
		currentLayer = Array.from(nextLayer).filter((id) => !visitedNodes.has(id));
	}

	return json({
		nodes: Array.from(nodesMap.values()),
		edges: Array.from(edgesMap.values())
	});
};
