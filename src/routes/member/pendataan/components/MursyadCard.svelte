<script lang="ts">
	import { Phone, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-svelte';

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

	interface Props {
		mursyad: MursyadGroup;
		isExpanded: boolean;
		ontoggle: () => void;
	}

	let { mursyad, isExpanded, ontoggle }: Props = $props();

	// Local sort state — isolated per table instance
	let sortColumn = $state<string>('nama');
	let sortDir = $state<'asc' | 'desc'>('asc');

	// Local pagination state — client-side
	let currentPage = $state(1);
	let pageSize = $state(5);

	function toggleSort(column: string) {
		if (sortColumn === column) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDir = 'asc';
		}
		// Reset to page 1 on sort change
		currentPage = 1;
	}

	// Sort all data, then paginate — sort applies to entire dataset
	let sorted = $derived.by(() => {
		const data = mursyad.mustarsyad;
		return [...data].sort((a, b) => {
			let vA: any, vB: any;
			switch (sortColumn) {
				case 'nama': vA = a.nama.toLowerCase(); vB = b.nama.toLowerCase(); break;
				case 'nomorTelepon': vA = a.nomorTelepon ?? ''; vB = b.nomorTelepon ?? ''; break;
				case 'alamatLengkap': vA = (a.alamatLengkap ?? '').toLowerCase(); vB = (b.alamatLengkap ?? '').toLowerCase(); break;
				case 'umur': vA = a.umur ?? -1; vB = b.umur ?? -1; break;
				case 'qari': vA = a.qari ? 1 : 0; vB = b.qari ? 1 : 0; break;
				case 'marhalah': vA = a.marhalah; vB = b.marhalah; break;
				case 'hasMustarsyad': vA = a.hasMustarsyad; vB = b.hasMustarsyad; break;
				case 'aktif': vA = a.aktif ? 1 : 0; vB = b.aktif ? 1 : 0; break;
				case 'partisipasi': vA = a.partisipasi ? 1 : 0; vB = b.partisipasi ? 1 : 0; break;
				default: return 0;
			}
			if (vA < vB) return sortDir === 'asc' ? -1 : 1;
			if (vA > vB) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
	});

	// Paginate sorted data
	let totalPages = $derived(Math.max(1, Math.ceil(sorted.length / pageSize)));
	let pageData = $derived(sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	function getIndicator(column: string): string {
		if (sortColumn !== column) return '';
		return sortDir === 'asc' ? ' ▲' : ' ▼';
	}

	function formatPhone(phone: string | null): string {
		return phone || '-';
	}

	let isMarhalahWarning = $derived(mursyad.marhalah < 3);

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

	function generatePageNumbers(current: number, total: number, max: number = 3): (number | '...')[] {
		if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
		const pages: (number | '...')[] = [1];
		const side = Math.floor((max - 2) / 2);
		let s = Math.max(2, current - side);
		let e = Math.min(total - 1, current + side);
		if (current - side <= 2) e = max - 1;
		if (current + side >= total - 1) s = total - max + 2;
		if (s > 2) pages.push('...');
		for (let i = s; i <= e; i++) pages.push(i);
		if (e < total - 1) pages.push('...');
		if (total > 1) pages.push(total);
		return pages;
	}
</script>

<div class="card border border-base-300 bg-base-100 shadow-sm overflow-hidden">
	<!-- Header -->
	<button
		class="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-base-200/50"
		onclick={ontoggle}
	>
		<div class="flex-1 min-w-0">
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

	{#if isExpanded}
		<div class="border-t border-base-300">
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead class="bg-base-200/50">
						<tr>
							<th class="w-10 text-center">No.</th>
							{#each sortableColumns as col (col.key)}
								<th class="cursor-pointer select-none whitespace-nowrap {col.key === 'nama' ? '' : 'text-center'}" onclick={() => toggleSort(col.key)}>
									{col.label}{getIndicator(col.key)}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each pageData as murid, i (murid.id)}
							<tr class="hover:bg-base-200/30">
								<td class="text-center text-base-content/40">{(currentPage - 1) * pageSize + i + 1}</td>
								<td>
									<a href="/member/pendataan/{murid.id}" class="font-medium text-primary hover:underline">{murid.nama}</a>
								</td>
								<td class="whitespace-nowrap text-xs">{formatPhone(murid.nomorTelepon)}</td>
								<td class="max-w-[200px] truncate text-xs" title={murid.alamatLengkap}>{murid.alamatLengkap || '-'}</td>
								<td class="text-center text-sm">{murid.umur !== null ? `${murid.umur}` : '-'}</td>
								<td class="text-center">
									<span class="badge badge-xs {murid.qari ? 'badge-success' : 'badge-ghost'}">{murid.qari ? 'Ya' : 'Tidak'}</span>
								</td>
								<td class="text-center">
									<span class="badge badge-xs badge-outline">M{murid.marhalah}</span>
								</td>
								<td class="text-center">
									<span class="badge badge-xs {murid.hasMustarsyad > 0 ? 'badge-info' : 'badge-ghost'}">{murid.hasMustarsyad > 0 ? 'Ya' : 'Tidak'}</span>
								</td>
								<td class="text-center">
									<span class="badge badge-xs {murid.aktif ? 'badge-success' : 'badge-error'}">{murid.aktif ? 'Aktif' : 'Tidak'}</span>
								</td>
								<td class="text-center">
									<span class="badge badge-xs {murid.partisipasi ? 'badge-success' : 'badge-ghost'}">{murid.partisipasi ? 'Ya' : 'Tidak'}</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if totalPages > 1}
				<div class="flex flex-col items-center gap-3 border-t border-base-200 px-3 py-2 sm:flex-row sm:justify-between">
					<div class="text-xs text-base-content/50">
						Hal. {currentPage}/{totalPages} &middot; {mursyad.mustarsyadCount} mustarsyad
					</div>
					<div class="flex items-center gap-2">
						<div class="join" role="group">
							<button type="button" class="btn join-item btn-xs" disabled={currentPage <= 1} onclick={() => currentPage--}>&#9664;</button>
							{#each generatePageNumbers(currentPage, totalPages, 3) as pageNum}
								{#if pageNum === '...'}
									<button type="button" class="btn btn-disabled join-item btn-xs">...</button>
								{:else}
									<button type="button" class="btn join-item btn-xs {pageNum === currentPage ? 'btn-active' : ''}" onclick={() => currentPage = pageNum}>{pageNum}</button>
								{/if}
							{/each}
							<button type="button" class="btn join-item btn-xs" disabled={currentPage >= totalPages} onclick={() => currentPage++}>&#9654;</button>
						</div>
						<select class="select select-bordered select-xs" value={pageSize} onchange={(e) => { pageSize = parseInt(e.currentTarget.value); currentPage = 1; }}>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={25}>25</option>
						</select>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
