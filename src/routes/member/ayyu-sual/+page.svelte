<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		BookOpen,
		Calendar,
		Filter,
		CheckCircle2,
		Clock,
		AlertTriangle,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		MessageSquare,
		User,
		MapPin,
		Users,
		X,
		Tag
	} from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import type { PertanyaanStatus } from '$lib/drizzle/schema';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Modal state
	let modalOpen = $state(false);
	let expandedId = $state<number | null>(null);
	let selectedPertanyaan = $state<(typeof data.pertanyaan)[0] | null>(null);
	let selectedStatus = $state<PertanyaanStatus | ''>('');
	let catatanValue = $state('');
	let isSubmitting = $state(false);

	function openModal(p: (typeof data.pertanyaan)[0]) {
		selectedPertanyaan = p;
		selectedStatus = (p.status as PertanyaanStatus) ?? '';
		catatanValue = p.statusCatatan ?? '';
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		selectedPertanyaan = null;
	}

	// Month navigation
	const MONTHS = [
		'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
		'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
	];

	function navigateMonth(delta: number) {
		let m = data.filterMonth + delta;
		let y = data.filterYear;
		if (m > 12) { m = 1; y++; }
		if (m < 1)  { m = 12; y--; }
		goto(`?year=${y}&month=${m}&status=${data.filterStatus}`, { invalidateAll: true });
	}

	function setStatus(s: string) {
		goto(`?year=${data.filterYear}&month=${data.filterMonth}&status=${s}`, { invalidateAll: true });
	}

	// Status config
	const statusConfig = {
		hijau:  { label: 'Dihaturkan kepada Syekh',           badge: 'badge-success',   bg: 'bg-success/10 border-success/30',   icon: '🟢' },
		kuning: { label: 'Diperbaiki, lalu diajukan',         badge: 'badge-warning',   bg: 'bg-warning/10 border-warning/30',   icon: '🟡' },
		merah:  { label: 'Dikembalikan kepada Mursyid',       badge: 'badge-error',     bg: 'bg-error/10 border-error/30',       icon: '🔴' }
	} as const;

	function fmtTicket(id: number) {
		return `#${String(id).padStart(5, '0')}`;
	}

	function fmtDate(d: string | null) {
		if (!d) return '-';
		return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	// Stats
	const stats = $derived({
		total:  data.pertanyaan.length,
		hijau:  data.pertanyaan.filter(p => p.status === 'hijau').length,
		kuning: data.pertanyaan.filter(p => p.status === 'kuning').length,
		merah:  data.pertanyaan.filter(p => p.status === 'merah').length,
		belum:  data.pertanyaan.filter(p => !p.status).length
	});

	const deadlineUrgency = $derived(
		data.daysUntilDeadline !== null
			? data.daysUntilDeadline <= 0   ? 'overdue'
			: data.daysUntilDeadline <= 3   ? 'critical'
			: data.daysUntilDeadline <= 7   ? 'warning'
			: null
			: null
	);
</script>

<svelte:head>
	<title>Ayyu Su'aal | TDMI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<div class="flex items-center gap-3 mb-1">
				<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<BookOpen size={20} class="text-primary" />
				</div>
				<div>
					<h1 class="text-2xl font-bold">Ayyu Su'aal</h1>
					<p class="text-sm text-base-content/60">Lajnah Ilqo' Ad Durus</p>
				</div>
			</div>
		</div>

		<!-- Deadline Badge -->
		{#if data.isCurrentMonth && data.daysUntilDeadline !== null}
			<div class="flex items-center gap-2 px-4 py-2 rounded-xl border
				{deadlineUrgency === 'overdue'  ? 'bg-error/10 border-error/40 text-error' :
				 deadlineUrgency === 'critical' ? 'bg-error/10 border-error/40 text-error' :
				 deadlineUrgency === 'warning'  ? 'bg-warning/10 border-warning/40 text-warning' :
				 'bg-base-200 border-base-300 text-base-content/70'}">
				<AlertTriangle size={16} />
				<span class="text-sm font-medium">
					{#if deadlineUrgency === 'overdue'}
						Deadline tgl 28 sudah lewat!
					{:else if data.daysUntilDeadline === 0}
						Deadline HARI INI (tgl 28)!
					{:else}
						Deadline tgl 28 — {data.daysUntilDeadline} hari lagi
					{/if}
				</span>
			</div>
		{/if}
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		{#each [
			{ label: 'Total',   value: stats.total,  cls: 'bg-base-100',         icon: MessageSquare },
			{ label: 'Belum',   value: stats.belum,  cls: 'bg-base-200',         icon: Clock },
			{ label: 'Proses',  value: stats.kuning, cls: 'bg-warning/10 border border-warning/30', icon: Tag },
			{ label: 'Selesai', value: stats.hijau + stats.merah, cls: 'bg-success/10 border border-success/30', icon: CheckCircle2 }
		] as s}
			<div class="card {s.cls} shadow-sm">
				<div class="card-body p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm text-base-content/60">{s.label}</span>
						<s.icon size={16} class="text-base-content/40" />
					</div>
					<p class="text-3xl font-bold mt-1">{s.value}</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- Filter Bar -->
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body p-4 flex flex-wrap items-center gap-4">
			<!-- Month Navigator -->
			<div class="flex items-center gap-2">
				<button
					onclick={() => navigateMonth(-1)}
					class="btn btn-ghost btn-sm btn-circle"
					aria-label="Bulan sebelumnya"
				>
					<ChevronLeft size={16} />
				</button>
				<div class="flex items-center gap-2 min-w-36 justify-center">
					<Calendar size={16} class="text-primary" />
					<span class="font-semibold text-sm">
						{MONTHS[data.filterMonth - 1]} {data.filterYear}
					</span>
				</div>
				<button
					onclick={() => navigateMonth(1)}
					class="btn btn-ghost btn-sm btn-circle"
					aria-label="Bulan berikutnya"
				>
					<ChevronRight size={16} />
				</button>
			</div>

			<div class="divider divider-horizontal mx-0 hidden sm:flex"></div>

			<!-- Status Filter -->
			<div class="flex items-center gap-2 flex-wrap">
				<Filter size={14} class="text-base-content/50" />
				{#each [
					{ val: 'semua', label: 'Semua' },
					{ val: 'belum', label: '⬜ Belum' },
					{ val: 'hijau', label: '🟢 Dihaturkan' },
					{ val: 'kuning', label: '🟡 Diperbaiki' },
					{ val: 'merah', label: '🔴 Dikembalikan' }
				] as f}
					<button
						onclick={() => setStatus(f.val)}
						class="btn btn-xs {data.filterStatus === f.val ? 'btn-primary' : 'btn-ghost'}"
					>
						{f.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Table / List -->
	{#if data.pertanyaan.length === 0}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body items-center text-center py-16">
				<MessageSquare size={48} class="text-base-content/20 mb-4" />
				<p class="text-lg font-medium text-base-content/50">Tidak ada pertanyaan</p>
				<p class="text-sm text-base-content/40">
					Belum ada pertanyaan masuk di bulan {MONTHS[data.filterMonth - 1]} {data.filterYear}
				</p>
			</div>
		</div>
	{:else}
		<!-- Desktop Table -->
		<div class="card bg-base-100 shadow-sm overflow-hidden hidden md:block">
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead class="bg-base-200">
						<tr>
							<th class="w-24">No. Tiket</th>
							<th class="w-28">Tanggal</th>
							<th>Nama</th>
							<th>Mursyid</th>
							<th>Pertanyaan</th>
							<th class="w-36">Status</th>
							<th class="w-20">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each data.pertanyaan as p (p.id)}
							<tr class="hover:bg-base-50 transition-colors">
								<td class="font-mono text-xs font-bold text-primary">{fmtTicket(p.id)}</td>
								<td class="text-xs text-base-content/60">{fmtDate(p.createdAt)}</td>
								<td>
									<div class="font-medium text-sm">{p.nama}</div>
									<div class="text-xs text-base-content/50 truncate max-w-36">{p.alamat}</div>
								</td>
								<td class="text-sm">{p.namaMursyid}</td>
								<td>
									<div class="text-sm max-w-xs">
										{#if expandedId === p.id}
											<p class="whitespace-pre-wrap">{p.pertanyaan}</p>
											<button
												onclick={() => expandedId = null}
												class="text-xs text-primary hover:underline mt-1"
											>Sembunyikan</button>
										{:else}
											<p class="line-clamp-2">{p.pertanyaan}</p>
											{#if p.pertanyaan.length > 80}
												<button
													onclick={() => expandedId = p.id}
													class="text-xs text-primary hover:underline mt-1"
												>Baca selengkapnya</button>
											{/if}
										{/if}
									</div>
								</td>
								<td>
									{#if p.status}
										<span class="badge badge-sm {statusConfig[p.status].badge} gap-1">
											{statusConfig[p.status].icon} {p.status === 'hijau' ? 'Dihaturkan' : p.status === 'kuning' ? 'Diperbaiki' : 'Dikembalikan'}
										</span>
									{:else}
										<span class="badge badge-sm badge-ghost">⬜ Belum</span>
									{/if}
								</td>
								<td>
									<button
										onclick={() => openModal(p)}
										class="btn btn-xs btn-primary btn-outline"
									>Label</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Mobile Cards -->
		<div class="space-y-3 md:hidden">
			{#each data.pertanyaan as p (p.id)}
				<div class="card bg-base-100 shadow-sm border border-base-200
					{p.status ? statusConfig[p.status].bg : 'border-base-200'}">
					<div class="card-body p-4 gap-3">
						<div class="flex items-start justify-between gap-2">
							<div>
								<span class="font-mono text-sm font-bold text-primary">{fmtTicket(p.id)}</span>
								<span class="text-xs text-base-content/50 ml-2">{fmtDate(p.createdAt)}</span>
							</div>
							{#if p.status}
								<span class="badge badge-sm {statusConfig[p.status].badge}">
									{statusConfig[p.status].icon}
								</span>
							{:else}
								<span class="badge badge-sm badge-ghost">⬜</span>
							{/if}
						</div>
						<div class="grid grid-cols-2 gap-2 text-sm">
							<div>
								<p class="text-xs text-base-content/50 flex items-center gap-1"><User size={10}/> Nama</p>
								<p class="font-medium">{p.nama}</p>
							</div>
							<div>
								<p class="text-xs text-base-content/50 flex items-center gap-1"><Users size={10}/> Mursyid</p>
								<p class="font-medium">{p.namaMursyid}</p>
							</div>
						</div>
						<div>
							<p class="text-xs text-base-content/50 flex items-center gap-1 mb-1"><MessageSquare size={10}/> Pertanyaan</p>
							{#if expandedId === p.id}
								<p class="text-sm whitespace-pre-wrap">{p.pertanyaan}</p>
								<button onclick={() => expandedId = null} class="text-xs text-primary hover:underline mt-1">Sembunyikan</button>
							{:else}
								<p class="text-sm line-clamp-3">{p.pertanyaan}</p>
								{#if p.pertanyaan.length > 100}
									<button onclick={() => expandedId = p.id} class="text-xs text-primary hover:underline mt-1">Selengkapnya</button>
								{/if}
							{/if}
						</div>
						{#if p.statusCatatan}
							<div class="text-xs bg-base-200 rounded-lg p-2 italic text-base-content/60">
								📝 {p.statusCatatan}
							</div>
						{/if}
						<button onclick={() => openModal(p)} class="btn btn-sm btn-primary btn-outline w-full">
							<Tag size={14} /> Beri Label
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Label Modal -->
{#if modalOpen && selectedPertanyaan}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-label="Beri label pertanyaan"
	>
		<div class="card bg-base-100 w-full max-w-lg shadow-2xl">
			<div class="card-body gap-4">
				<!-- Modal Header -->
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-lg font-bold">Beri Label Pertanyaan</h3>
						<p class="text-sm text-base-content/60 font-mono">{fmtTicket(selectedPertanyaan.id)}</p>
					</div>
					<button onclick={closeModal} class="btn btn-ghost btn-sm btn-circle" aria-label="Tutup">
						<X size={18} />
					</button>
				</div>

				<!-- Pertanyaan Preview -->
				<div class="bg-base-200 rounded-xl p-4">
					<div class="grid grid-cols-2 gap-2 text-sm mb-3">
						<div>
							<span class="text-xs text-base-content/50">Nama:</span>
							<p class="font-medium">{selectedPertanyaan.nama}</p>
						</div>
						<div>
							<span class="text-xs text-base-content/50">Mursyid:</span>
							<p class="font-medium">{selectedPertanyaan.namaMursyid}</p>
						</div>
					</div>
					<span class="text-xs text-base-content/50">Pertanyaan:</span>
					<p class="text-sm mt-1 leading-relaxed italic">"{selectedPertanyaan.pertanyaan}"</p>
				</div>

				<!-- Status Selector -->
				<form
					method="POST"
					action="?/updateStatus"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							await update();
							if (result.type === 'success') closeModal();
						};
					}}
					class="space-y-4"
				>
					<input type="hidden" name="id" value={selectedPertanyaan.id} />

					<div>
						<p class="text-sm font-semibold mb-3">Pilih Label:</p>
						<div class="grid grid-cols-1 gap-2">
							<!-- Belum / Clear -->
							<label class="cursor-pointer">
								<input
									type="radio"
									name="status"
									value=""
									bind:group={selectedStatus}
									class="sr-only"
								/>
								<div class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all
									{selectedStatus === '' ? 'border-base-content/40 bg-base-200' : 'border-base-200 hover:border-base-300'}">
									<span class="text-xl">⬜</span>
									<div>
										<p class="font-medium text-sm">Belum Diproses</p>
										<p class="text-xs text-base-content/50">Hapus label / tandai belum diproses</p>
									</div>
								</div>
							</label>

							<!-- Hijau -->
							<label class="cursor-pointer">
								<input
									type="radio"
									name="status"
									value="hijau"
									bind:group={selectedStatus}
									class="sr-only"
								/>
								<div class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all
									{selectedStatus === 'hijau' ? 'border-success bg-success/10' : 'border-base-200 hover:border-success/40'}">
									<span class="text-xl">🟢</span>
									<div>
										<p class="font-medium text-sm">Dihaturkan kepada Syekh</p>
										<p class="text-xs text-base-content/50">Pertanyaan layak disampaikan langsung</p>
									</div>
								</div>
							</label>

							<!-- Kuning -->
							<label class="cursor-pointer">
								<input
									type="radio"
									name="status"
									value="kuning"
									bind:group={selectedStatus}
									class="sr-only"
								/>
								<div class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all
									{selectedStatus === 'kuning' ? 'border-warning bg-warning/10' : 'border-base-200 hover:border-warning/40'}">
									<span class="text-xl">🟡</span>
									<div>
										<p class="font-medium text-sm">Diperbaiki Redaksinya</p>
										<p class="text-xs text-base-content/50">Perlu penyesuaian, lalu diajukan</p>
									</div>
								</div>
							</label>

							<!-- Merah -->
							<label class="cursor-pointer">
								<input
									type="radio"
									name="status"
									value="merah"
									bind:group={selectedStatus}
									class="sr-only"
								/>
								<div class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all
									{selectedStatus === 'merah' ? 'border-error bg-error/10' : 'border-base-200 hover:border-error/40'}">
									<span class="text-xl">🔴</span>
									<div>
										<p class="font-medium text-sm">Dikembalikan kepada Mursyid</p>
										<p class="text-xs text-base-content/50">Pertanyaan dikembalikan untuk ditangani mursyid</p>
									</div>
								</div>
							</label>
						</div>
					</div>

					<!-- Catatan -->
					<div class="form-control">
						<label class="label py-1" for="catatan">
							<span class="label-text text-sm font-medium">Catatan <span class="text-base-content/40 font-normal">(opsional)</span></span>
						</label>
						<textarea
							id="catatan"
							name="catatan"
							bind:value={catatanValue}
							rows="2"
							placeholder="Misal: redaksi perlu diperjelas..."
							class="textarea textarea-bordered text-sm"
						></textarea>
					</div>

					<div class="flex gap-2 pt-2">
						<button type="button" onclick={closeModal} class="btn btn-ghost flex-1">Batal</button>
						<button type="submit" class="btn btn-primary flex-1" disabled={isSubmitting}>
							{#if isSubmitting}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Simpan Label
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
