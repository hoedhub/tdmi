<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { Users, Phone, ChevronDown, ChevronUp, Loader2, AlertCircle, AlertTriangle } from 'lucide-svelte';

	interface MustarsyadRow {
		id: number;
		nama: string;
		nomorTelepon: string | null;
		gender: boolean;
		tglLahir: string | null;
		qari: boolean;
		marhalah: 1 | 2 | 3;
		aktif: boolean;
		partisipasi: boolean;
		umur: number | null;
		alamatLengkap: string;
		hasMustarsyad: number;
		mursyidId: number | null;
	}

	interface MursyadGroup {
		id: number;
		nama: string;
		nomorTelepon: string | null;
		gender: boolean;
		marhalah: 1 | 2 | 3;
		alamat: string | null;
		mursyidId: number | null;
		mursyidNama: string | null;
		mursyidTelepon: string | null;
		mursyidMarhalah: 1 | 2 | 3 | null;
		mursyidAlamatLengkap: string;
		mustarsyadCount: number;
		mustarsyad: MustarsyadRow[];
	}

	interface PaginationInfo {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	}

	interface SortConfig {
		column: string;
		dir: 'asc' | 'desc';
	}

	// Props from parent (global filters)
	interface Props {
		genderFilter?: 'all' | 'pria' | 'wanita';
		searchQuery?: string;
	}

	let { genderFilter = 'all', searchQuery = '' }: Props = $props();

	// Outer pagination (mursyad groups)
	let mursyadGroups = $state<MursyadGroup[]>([]);
	let outerPagination = $state<PaginationInfo>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });

	// Inner pagination per mursyad (mustarsyad table pages)
	let innerPages = $state<Map<number, number>>(new Map());
	let innerPageSize = $state(5);
	let innerSort = $state<SortConfig>({ column: 'nama', dir: 'asc' });

	let loading = $state(true);
	let error_msg = $state<string | null>(null);
	let expandedIds = $state<Set<number>>(new Set());

	onMount(() => fetchData(1));

	// React to prop changes from parent
	let prevGender = genderFilter;
	let prevSearch = searchQuery;
	$effect(() => {
		if (genderFilter !== prevGender || searchQuery !== prevSearch) {
			prevGender = genderFilter;
			prevSearch = searchQuery;
			expandedIds = new Set();
			innerPages = new Map();
			fetchData(1);
		}
	});

	async function fetchData(page: number = outerPagination.page) {
		loading = true;
		error_msg = null;
		try {
			const params = new URLSearchParams();
			if (genderFilter !== 'all') params.set('gender', genderFilter);
			if (searchQuery) params.set('search', searchQuery);
			params.set('page', String(page));
			params.set('pageSize', String(outerPagination.pageSize));

			const res = await api(`/member/pendataan/mustarsyad?${params.toString()}`);
			if (!res.ok) throw new Error('Gagal memuat data mustarsyad');
			const result = await res.json();
			mursyadGroups = result.data;
			outerPagination = result.pagination;

			// Default: expand semua
			const newExpanded = new Set<number>();
			for (const m of mursyadGroups) {
				newExpanded.add(m.id);
			}
			expandedIds = newExpanded;
			innerPages = new Map();
		} catch (e: any) {
			error_msg = e.message || 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}

	async function fetchMustarsyadPage(mursyadId: number, page: number) {
		try {
			const params = new URLSearchParams();
			if (genderFilter !== 'all') params.set('gender', genderFilter);
			if (searchQuery) params.set('search', searchQuery);
			params.set('page', String(outerPagination.page));
			params.set('pageSize', String(outerPagination.pageSize));
			params.set('mustarsyadPage', String(page));
			params.set('mustarsyadPageSize', String(innerPageSize));
			params.set('mustarsyadSort', `${innerSort.column}:${innerSort.dir}`);

			const res = await api(`/member/pendataan/mustarsyad?${params.toString()}`);
			if (!res.ok) throw new Error('Gagal memuat data mustarsyad');
			const result = await res.json();

			const updatedGroup = result.data.find((g: MursyadGroup) => g.id === mursyadId);
			if (updatedGroup) {
				mursyadGroups = mursyadGroups.map(g =>
					g.id === mursyadId ? { ...g, mustarsyad: updatedGroup.mustarsyad } : g
				);
			}

			const next = new Map(innerPages);
			next.set(mursyadId, page);
			innerPages = next;
		} catch (e: any) {
			error_msg = e.message || 'Terjadi kesalahan';
		}
	}

	function toggleExpand(id: number) {
		const next = new Set(expandedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedIds = next;
	}

	function formatPhone(phone: string | null): string {
		if (!phone) return '-';
		return phone;
	}

	function handleOuterPageChange(page: number) {
		fetchData(page);
	}

	function handleOuterPageSizeChange(newSize: number) {
		outerPagination.pageSize = newSize;
		fetchData(1);
	}

	function handleInnerSort(column: string) {
		if (innerSort.column === column) {
			innerSort = { column, dir: innerSort.dir === 'asc' ? 'desc' : 'asc' };
		} else {
			innerSort = { column, dir: 'asc' };
		}
		for (const mursyadId of expandedIds) {
			fetchMustarsyadPage(mursyadId, 1);
		}
		const next = new Map<number, number>();
		for (const mursyadId of expandedIds) {
			next.set(mursyadId, 1);
		}
		innerPages = next;
	}

	let totalMustarsyad = $derived(mursyadGroups.reduce((sum, m) => sum + m.mustarsyadCount, 0));

	function getSortIndicator(column: string): string {
		if (innerSort.column !== column) return '';
		return innerSort.dir === 'asc' ? ' ▲' : ' ▼';
	}

	function generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): (number | '...')[] {
		if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
		const pages: (number | '...')[] = [1];
		const sidePages = Math.floor((maxVisible - 2) / 2);
		let startPage = Math.max(2, currentPage - sidePages);
		let endPage = Math.min(totalPages - 1, currentPage + sidePages);
		if (currentPage - sidePages <= 2) endPage = maxVisible - 1;
		if (currentPage + sidePages >= totalPages - 1) startPage = totalPages - maxVisible + 2;
		if (startPage > 2) pages.push('...');
		for (let i = startPage; i <= endPage; i++) pages.push(i);
		if (endPage < totalPages - 1) pages.push('...');
		if (totalPages > 1) pages.push(totalPages);
		return pages;
	}

	const sortableColumns = [
		{ key: 'nama', label: 'Nama Murid' },
		{ key: 'nomorTelepon', label: 'No. Telepon' },
		{ key: 'alamatLengkap', label: 'Alamat' },
		{ key: 'umur', label: 'Umur' },
		{ key: 'qari', label: "Qari'" },
		{ key: 'marhalah', label: 'Marhalah' },
		{ key: 'hasMustarsyad', label: 'Irsyad' },
		{ key: 'aktif', label: 'Aktif' },
		{ key: 'partisipasi', label: 'Partisipasi' }
	];
</script>

<div class="space-y-4">
	<!-- Toolbar: only stats (filters are handled by parent) -->
	<div class="flex items-center gap-2 text-sm text-base-content/60">
		<Users class="h-4 w-4" />
		<span>{outerPagination.totalItems} mursyid</span>
		<span class="opacity-40">&middot;</span>
		<span>{totalMustarsyad} mustarsyad (halaman ini)</span>
	</div>

	<!-- Loading -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 class="h-8 w-8 animate-spin text-primary" />
		</div>
	<!-- Error -->
	{:else if error_msg}
		<div class="alert alert-error">
			<AlertCircle class="h-5 w-5" />
			<span>{error_msg}</span>
			<button class="btn btn-sm btn-ghost" onclick={() => fetchData()}>Coba Lagi</button>
		</div>
	<!-- Empty -->
	{:else if mursyadGroups.length === 0}
		<div class="py-20 text-center">
			<Users class="mx-auto h-12 w-12 text-base-content/20" />
			<p class="mt-3 text-base-content/50">Tidak ada data mustarsyad{genderFilter !== 'all' ? ` untuk ${genderFilter}` : ''}{searchQuery ? ` dengan kata kunci "${searchQuery}"` : ''}.</p>
		</div>
	<!-- Data -->
	{:else}
		<div class="space-y-3">
			{#each mursyadGroups as mursyad (mursyad.id)}
				{@const isExpanded = expandedIds.has(mursyad.id)}
				{@const currentInnerPage = innerPages.get(mursyad.id) ?? 1}
				{@const innerTotalPages = Math.ceil(mursyad.mustarsyadCount / innerPageSize)}
				{@const isMarhalahWarning = mursyad.marhalah < 3}
				<div class="card border border-base-300 bg-base-100 shadow-sm overflow-hidden">
					<!-- Header: Mursyid info -->
					<button
						class="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-base-200/50"
						onclick={() => toggleExpand(mursyad.id)}
					>
						<div class="flex-1 min-w-0">
							<!-- Baris 1: Nama + marhalah badge + mustarsyad count -->
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-bold text-base-content truncate">{mursyad.nama}</span>
								<span class="badge badge-outline badge-xs">M{mursyad.marhalah}</span>
								<span class="badge badge-primary badge-sm">{mursyad.mustarsyadCount} mustarsyad</span>
								{#if isMarhalahWarning}
									<span class="badge badge-warning badge-sm gap-1">
										<AlertTriangle class="h-3 w-3" />
										Belum M3
									</span>
								{/if}
							</div>

							<!-- Baris 2: Telepon + Alamat -->
							{#if mursyad.nomorTelepon || mursyad.mursyidAlamatLengkap}
								<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-base-content/50">
									{#if mursyad.nomorTelepon}
										<span class="flex items-center gap-1">
											<Phone class="h-3 w-3" />
											{formatPhone(mursyad.nomorTelepon)}
										</span>
									{/if}
									{#if mursyad.mursyidAlamatLengkap}
										<span class="truncate max-w-[280px]" title={mursyad.mursyidAlamatLengkap}>
											{mursyad.mursyidAlamatLengkap}
										</span>
									{/if}
								</div>
							{/if}

							<!-- Baris 3: Mursyid dari mursyid -->
							<div class="mt-1.5 flex items-center gap-1 text-xs text-base-content/40">
								<span>Mursyid:</span>
								{#if mursyad.mursyidNama}
									<span class="font-medium text-base-content/60">{mursyad.mursyidNama}</span>
									{#if mursyad.mursyidTelepon}
										<span class="opacity-40">&middot;</span>
										<span>{formatPhone(mursyad.mursyidTelepon)}</span>
									{/if}
								{:else}
									<span class="italic text-base-content/30">N/A</span>
								{/if}
							</div>
						</div>

						<div class="flex-shrink-0 text-base-content/30">
							{#if isExpanded}
								<ChevronUp class="h-5 w-5" />
							{:else}
								<ChevronDown class="h-5 w-5" />
							{/if}
						</div>
					</button>

					<!-- Expanded: Tabel mustarsyad -->
					{#if isExpanded}
						<div class="border-t border-base-300">
							<div class="overflow-x-auto">
								<table class="table table-sm">
									<thead class="bg-base-200/50">
										<tr>
											<th class="w-10 text-center">No.</th>
											{#each sortableColumns as col (col.key)}
												<th class="cursor-pointer select-none whitespace-nowrap {col.key === 'nama' ? '' : 'text-center'}" onclick={() => handleInnerSort(col.key)}>
													{col.label}{getSortIndicator(col.key)}
												</th>
											{/each}
										</tr>
									</thead>
									<tbody>
										{#each mursyad.mustarsyad as murid, i (murid.id)}
											<tr class="hover:bg-base-200/30">
												<td class="text-center text-base-content/40">{(currentInnerPage - 1) * innerPageSize + i + 1}</td>
												<td>
													<a
														href="/member/pendataan/{murid.id}"
														class="font-medium text-primary hover:underline"
													>
														{murid.nama}
													</a>
												</td>
												<td class="whitespace-nowrap text-xs">{formatPhone(murid.nomorTelepon)}</td>
												<td class="max-w-[200px] truncate text-xs" title={murid.alamatLengkap}>
													{murid.alamatLengkap || '-'}
												</td>
												<td class="text-center text-sm">
													{murid.umur !== null ? `${murid.umur}` : '-'}
												</td>
												<td class="text-center">
													<span class="badge badge-xs {murid.qari ? 'badge-success' : 'badge-ghost'}">
														{murid.qari ? 'Ya' : 'Tidak'}
													</span>
												</td>
												<td class="text-center">
													<span class="badge badge-xs badge-outline">
														M{murid.marhalah}
													</span>
												</td>
												<td class="text-center">
													<span class="badge badge-xs {murid.hasMustarsyad > 0 ? 'badge-info' : 'badge-ghost'}">
														{murid.hasMustarsyad > 0 ? 'Ya' : 'Tidak'}
													</span>
												</td>
												<td class="text-center">
													<span class="badge badge-xs {murid.aktif ? 'badge-success' : 'badge-error'}">
														{murid.aktif ? 'Aktif' : 'Tidak'}
													</span>
												</td>
												<td class="text-center">
													<span class="badge badge-xs {murid.partisipasi ? 'badge-success' : 'badge-ghost'}">
														{murid.partisipasi ? 'Ya' : 'Tidak'}
													</span>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>

							<!-- Inner pagination -->
							{#if innerTotalPages > 1}
								<div class="flex flex-col items-center gap-3 border-t border-base-200 px-3 py-2 sm:flex-row sm:justify-between">
									<div class="text-xs text-base-content/50">
										Hal. {currentInnerPage}/{innerTotalPages} &middot; {mursyad.mustarsyadCount} mustarsyad
									</div>
									<div class="join" role="group">
										<button
											type="button"
											class="btn join-item btn-xs"
											disabled={currentInnerPage <= 1}
											onclick={() => fetchMustarsyadPage(mursyad.id, currentInnerPage - 1)}
										>
											&#9664;
										</button>
										{#each generatePageNumbers(currentInnerPage, innerTotalPages, 3) as pageNum}
											{#if pageNum === '...'}
												<button type="button" class="btn btn-disabled join-item btn-xs">...</button>
											{:else}
												<button
													type="button"
													class="btn join-item btn-xs {pageNum === currentInnerPage ? 'btn-active' : ''}"
													onclick={() => fetchMustarsyadPage(mursyad.id, pageNum)}
												>
													{pageNum}
												</button>
											{/if}
										{/each}
										<button
											type="button"
											class="btn join-item btn-xs"
											disabled={currentInnerPage >= innerTotalPages}
											onclick={() => fetchMustarsyadPage(mursyad.id, currentInnerPage + 1)}
										>
											&#9654;
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Outer pagination (mursyad groups) -->
		{#if outerPagination.totalPages > 1}
			<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between pt-2">
				<div class="text-sm text-base-content/70">
					{#if outerPagination.totalItems >= 1}
						<b>{(outerPagination.page - 1) * outerPagination.pageSize + 1}-{Math.min(outerPagination.page * outerPagination.pageSize, outerPagination.totalItems)}</b> dari
					{/if}
					<b>&nbsp;{outerPagination.totalItems}</b> mursyid
				</div>

				<div class="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto sm:justify-end">
					<div class="join" role="group">
						<button
							type="button"
							class="btn join-item btn-sm"
							disabled={outerPagination.page <= 1}
							onclick={() => handleOuterPageChange(outerPagination.page - 1)}
						>
							&#9664;
						</button>
						{#each generatePageNumbers(outerPagination.page, outerPagination.totalPages) as pageNum}
							{#if pageNum === '...'}
								<button type="button" class="btn btn-disabled join-item btn-sm">...</button>
							{:else}
								<button
									type="button"
									class="btn join-item btn-sm {pageNum === outerPagination.page ? 'btn-active' : ''}"
									onclick={() => handleOuterPageChange(pageNum)}
								>
									{pageNum}
								</button>
							{/if}
						{/each}
						<button
							type="button"
							class="btn join-item btn-sm"
							disabled={outerPagination.page >= outerPagination.totalPages}
							onclick={() => handleOuterPageChange(outerPagination.page + 1)}
						>
							&#9654;
						</button>
					</div>

					<div class="flex items-center gap-2">
						<span class="text-sm text-base-content/70">Per hal:</span>
						<select
							class="select select-bordered select-sm"
							value={outerPagination.pageSize}
							onchange={(e) => handleOuterPageSizeChange(parseInt(e.currentTarget.value))}
						>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
						</select>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
