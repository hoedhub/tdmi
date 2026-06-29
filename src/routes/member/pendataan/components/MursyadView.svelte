<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { Users, Loader2, AlertCircle } from 'lucide-svelte';
	import MursyadCard from './MursyadCard.svelte';

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

	interface Props {
		genderFilter?: 'all' | 'pria' | 'wanita';
		searchQuery?: string;
	}

	let { genderFilter = 'all', searchQuery = '' }: Props = $props();

	let mursyadGroups = $state<MursyadGroup[]>([]);
	let outerPagination = $state<PaginationInfo>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
	let loading = $state(true);
	let error_msg = $state<string | null>(null);
	let expandedIds = $state<Record<number, boolean>>({});

	onMount(() => fetchData(1));

	let prevGender = genderFilter;
	let prevSearch = searchQuery;
	$effect(() => {
		if (genderFilter !== prevGender || searchQuery !== prevSearch) {
			prevGender = genderFilter;
			prevSearch = searchQuery;
			expandedIds = {};
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
			const newExpanded: Record<number, boolean> = {};
			for (const m of mursyadGroups) newExpanded[m.id] = true;
			expandedIds = newExpanded;
		} catch (e: any) {
			error_msg = e.message || 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}

	function toggleExpand(id: number) {
		if (expandedIds[id]) {
			delete expandedIds[id];
		} else {
			expandedIds[id] = true;
		}
		// Trigger reactivity — Svelte 5 needs reassignment for object key changes
		expandedIds = { ...expandedIds };
	}

	let totalMustarsyad = $derived(mursyadGroups.reduce((sum, m) => sum + m.mustarsyadCount, 0));

	function handleOuterPageChange(page: number) {
		fetchData(page);
	}

	function handleOuterPageSizeChange(newSize: number) {
		outerPagination.pageSize = newSize;
		fetchData(1);
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
</script>

<div class="space-y-4">
	<div class="flex items-center gap-2 text-sm text-base-content/60">
		<Users class="h-4 w-4" />
		<span>{outerPagination.totalItems} mursyid</span>
		<span class="opacity-40">&middot;</span>
		<span>{totalMustarsyad} mustarsyad (halaman ini)</span>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 class="h-8 w-8 animate-spin text-primary" />
		</div>
	{:else if error_msg}
		<div class="alert alert-error">
			<AlertCircle class="h-5 w-5" />
			<span>{error_msg}</span>
			<button class="btn btn-sm btn-ghost" onclick={() => fetchData()}>Coba Lagi</button>
		</div>
	{:else if mursyadGroups.length === 0}
		<div class="py-20 text-center">
			<Users class="mx-auto h-12 w-12 text-base-content/20" />
			<p class="mt-3 text-base-content/50">Tidak ada data mustarsyad{genderFilter !== 'all' ? ` untuk ${genderFilter}` : ''}{searchQuery ? ` dengan kata kunci "${searchQuery}"` : ''}.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each mursyadGroups as mursyad (mursyad.id)}
				<MursyadCard
					{mursyad}
					isExpanded={!!expandedIds[mursyad.id]}
					ontoggle={() => toggleExpand(mursyad.id)}
				/>
			{/each}
		</div>

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
						<button type="button" class="btn join-item btn-sm" disabled={outerPagination.page <= 1} onclick={() => handleOuterPageChange(outerPagination.page - 1)}>&#9664;</button>
						{#each generatePageNumbers(outerPagination.page, outerPagination.totalPages) as pageNum}
							{#if pageNum === '...'}
								<button type="button" class="btn btn-disabled join-item btn-sm">...</button>
							{:else}
								<button type="button" class="btn join-item btn-sm {pageNum === outerPagination.page ? 'btn-active' : ''}" onclick={() => handleOuterPageChange(pageNum)}>{pageNum}</button>
							{/if}
						{/each}
						<button type="button" class="btn join-item btn-sm" disabled={outerPagination.page >= outerPagination.totalPages} onclick={() => handleOuterPageChange(outerPagination.page + 1)}>&#9654;</button>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm text-base-content/70">Per hal:</span>
						<select class="select select-bordered select-sm" value={outerPagination.pageSize} onchange={(e) => handleOuterPageSizeChange(parseInt(e.currentTarget.value))}>
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
