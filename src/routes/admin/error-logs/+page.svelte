<script lang="ts">
	import { page } from '$app/state';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';
	import { Search, X, Check, Trash2, RefreshCw, Bug, Loader2 } from 'lucide-svelte';

	let logs = $state<any[]>([]);
	let total = $state(0);
	let currentPage = $state(1);
	let pageSize = $state(20);
	let loading = $state(false);
	let filterLevel = $state('');
	let filterSource = $state('');
	let filterResolved = $state('');
	let searchQuery = $state('');
	let selectedLog = $state<any | null>(null);

	async function fetchLogs() {
		loading = true;
		try {
			const params = new URLSearchParams({
				page: String(currentPage),
				pageSize: String(pageSize)
			});
			if (filterLevel) params.set('level', filterLevel);
			if (filterSource) params.set('source', filterSource);
			if (filterResolved) params.set('resolved', filterResolved);
			if (searchQuery) params.set('search', searchQuery);

			const res = await fetch(`/api/error-log?${params}`);
			if (!res.ok) throw new Error('Gagal memuat error logs');
			const data = await res.json();
			logs = data.rows;
			total = data.total;
		} catch (err: any) {
			toastError(err.message || 'Gagal memuat data.');
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		fetchLogs();
	}

	function handleFilterChange() {
		currentPage = 1;
		fetchLogs();
	}

	async function handleResolve(id: string) {
		try {
			const res = await fetch(`/api/error-log/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ resolved: true })
			});
			if (!res.ok) throw new Error('Gagal memperbarui.');
			toastSuccess('Error ditandai sebagai resolved.');
			fetchLogs();
		} catch (err: any) {
			toastError(err.message);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Hapus error log ini?')) return;
		try {
			const res = await fetch(`/api/error-log/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Gagal menghapus.');
			toastSuccess('Error log dihapus.');
			if (selectedLog?.id === id) selectedLog = null;
			fetchLogs();
		} catch (err: any) {
			toastError(err.message);
		}
	}

	function levelBadge(level: string) {
		if (level === 'error') return 'badge-error';
		if (level === 'warning') return 'badge-warning';
		return 'badge-info';
	}

	function sourceBadge(source: string) {
		return source === 'client' ? 'badge-outline badge-info' : 'badge-outline badge-secondary';
	}

	function totalPages() {
		return Math.ceil(total / pageSize);
	}

	$effect(() => {
		fetchLogs();
	});
</script>

<div class="space-y-4 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold flex items-center gap-2">
			<Bug class="h-6 w-6" />
			Error Logs
		</h1>
		<button class="btn btn-ghost btn-sm" onclick={fetchLogs} disabled={loading} aria-label="Refresh">
			<RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
		</button>
	</div>

	<div class="flex flex-wrap gap-2 items-end">
		<div class="form-control">
			<label class="label py-1" for="filter-level"><span class="label-text text-xs">Level</span></label>
			<select id="filter-level" class="select select-bordered select-sm" bind:value={filterLevel} onchange={handleFilterChange}>
				<option value="">Semua Level</option>
				<option value="error">Error</option>
				<option value="warning">Warning</option>
				<option value="info">Info</option>
			</select>
		</div>
		<div class="form-control">
			<label class="label py-1" for="filter-source"><span class="label-text text-xs">Source</span></label>
			<select id="filter-source" class="select select-bordered select-sm" bind:value={filterSource} onchange={handleFilterChange}>
				<option value="">Semua Source</option>
				<option value="server">Server</option>
				<option value="client">Client</option>
			</select>
		</div>
		<div class="form-control">
			<label class="label py-1" for="filter-status"><span class="label-text text-xs">Status</span></label>
			<select id="filter-status" class="select select-bordered select-sm" bind:value={filterResolved} onchange={handleFilterChange}>
				<option value="">Semua Status</option>
				<option value="false">Unresolved</option>
				<option value="true">Resolved</option>
			</select>
		</div>
		<div class="form-control">
			<label class="label py-1" for="filter-search"><span class="label-text text-xs">Cari</span></label>
			<div class="join">
				<input
					id="filter-search"
					class="input input-bordered input-sm join-item"
					placeholder="Cari pesan error..."
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<button class="btn btn-sm join-item" onclick={handleSearch}>
					<Search class="h-4 w-4" />
				</button>
			</div>
		</div>
		<div class="text-xs opacity-50 pb-1">
			{total} error{total !== 1 ? 's' : ''}
		</div>
	</div>

	<div class="overflow-x-auto">
		<table class="table table-zebra table-sm">
			<thead>
				<tr>
					<th>Level</th>
					<th>Source</th>
					<th class="max-w-md">Message</th>
					<th class="hidden lg:table-cell">URL</th>
					<th>Status</th>
					<th class="hidden md:table-cell">Waktu</th>
					<th>Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#if loading}
					<tr>
						<td colspan="7" class="text-center py-8">
							<Loader2 class="h-5 w-5 animate-spin inline-block" />
						</td>
					</tr>
				{:else if logs.length === 0}
					<tr>
						<td colspan="7" class="text-center py-8 text-sm opacity-50 italic">Tidak ada error log.</td>
					</tr>
				{:else}
					{#each logs as log}
						<tr
							class="hover cursor-pointer {!log.resolved ? 'bg-red-50/30' : ''}"
							onclick={() => (selectedLog = selectedLog?.id === log.id ? null : log)}
						>
							<td>
								<span class="badge {levelBadge(log.level)} badge-sm">{log.level}</span>
							</td>
							<td>
								<span class="badge {sourceBadge(log.source)} badge-sm">{log.source}</span>
							</td>
							<td class="max-w-md truncate font-mono text-xs">{log.message}</td>
							<td class="hidden lg:table-cell max-w-xs truncate text-xs opacity-60">{log.url ?? '-'}</td>
							<td>
								{#if log.resolved}
									<span class="badge badge-success badge-sm">Resolved</span>
								{:else}
									<span class="badge badge-ghost badge-sm">Open</span>
								{/if}
							</td>
							<td class="hidden md:table-cell text-xs opacity-60">{log.createdAt}</td>
							<td onclick={(e) => e.stopPropagation()}>
								<div class="flex gap-1">
									{#if !log.resolved}
										<button class="btn btn-ghost btn-sm" onclick={() => handleResolve(log.id)} aria-label="Tandai resolved">
											<Check class="h-4 w-4 text-success" />
										</button>
									{/if}
									<button class="btn btn-ghost btn-sm" onclick={() => handleDelete(log.id)} aria-label="Hapus error">
										<Trash2 class="h-4 w-4 text-error" />
									</button>
								</div>
							</td>
						</tr>
						{#if selectedLog?.id === log.id}
							<tr>
								<td colspan="7" class="bg-base-200 p-4">
									<div class="space-y-2 text-xs font-mono">
										{#if selectedLog.stack}
											<div>
												<span class="font-bold opacity-50">Stack Trace:</span>
												<pre class="mt-1 whitespace-pre-wrap max-h-48 overflow-y-auto bg-base-300 p-2 rounded">{selectedLog.stack}</pre>
											</div>
										{/if}
										{#if selectedLog.metadata}
											<div>
												<span class="font-bold opacity-50">Metadata:</span>
												<pre class="mt-1 whitespace-pre-wrap bg-base-300 p-2 rounded">{JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}</pre>
											</div>
										{/if}
										{#if selectedLog.userAgent}
											<div><span class="font-bold opacity-50">User Agent:</span> {selectedLog.userAgent}</div>
										{/if}
										{#if selectedLog.userId}
											<div><span class="font-bold opacity-50">User ID:</span> {selectedLog.userId}</div>
										{/if}
										{#if selectedLog.resolvedBy}
											<div><span class="font-bold opacity-50">Resolved By:</span> {selectedLog.resolvedBy} at {selectedLog.resolvedAt}</div>
										{/if}
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if totalPages() > 1}
		<div class="flex justify-center gap-2 mt-4">
			<button
				class="btn btn-ghost btn-sm"
				disabled={currentPage <= 1}
				onclick={() => { currentPage--; fetchLogs(); }}
			>
				Sebelumnya
			</button>
			<span class="text-sm self-center opacity-50">
				Halaman {currentPage} dari {totalPages()}
			</span>
			<button
				class="btn btn-ghost btn-sm"
				disabled={currentPage >= totalPages()}
				onclick={() => { currentPage++; fetchLogs(); }}
			>
				Selanjutnya
			</button>
		</div>
	{/if}
</div>
