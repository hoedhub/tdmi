<script lang="ts">
	import { Users, UserPlus, AlertTriangle, Activity, MapPin, Camera, UserCheck, BarChart3 } from 'lucide-svelte';

	interface MuridRecent {
		id: number;
		nama: string;
		gender: boolean;
		marhalah: number;
		aktif: boolean;
		updatedAt: string;
	}

	interface DashboardData {
		muridTotal: number;
		muridActive: number;
		muridInactive: number;
		muridNewThisWeek: number;
		muridNoFoto: number;
		muridNoWilayah: number;
		genderDist: Record<string, number>;
		marhalahDist: Record<string, number>;
		userTotal: number;
		userActive: number;
		nasyathTotal: number;
		nasyathThisMonth: number;
		errorUnresolved: number;
		recentMurid: MuridRecent[];
	}

	interface Props {
		data: DashboardData;
	}

	let { data }: Props = $props();

	let laki = $derived(data.genderDist['laki'] || 0);
	let perempuan = $derived(data.genderDist['perempuan'] || 0);
	let totalGender = $derived(laki + perempuan);
	let m1 = $derived(data.marhalahDist['1'] || 0);
	let m2 = $derived(data.marhalahDist['2'] || 0);
	let m3 = $derived(data.marhalahDist['3'] || 0);
	let totalMarhalah = $derived(m1 + m2 + m3);

	function percentage(part: number, total: number): string {
		return total > 0 ? ((part / total) * 100).toFixed(1) : '0';
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold">Dashboard Admin</h1>
			<p class="text-sm text-base-content/60">Ringkasan data sistem TDMI</p>
		</div>
		<div class="flex gap-2">
			<a href="/admin/users" class="btn btn-outline btn-sm">Kelola Pengguna</a>
			<a href="/admin/error-logs" class="btn btn-outline btn-sm">Error Logs</a>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		<div class="stat rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<div class="stat-figure text-primary"><Users class="h-6 w-6" /></div>
			<div class="stat-title text-xs">Total Murid</div>
			<div class="stat-value text-2xl text-primary">{data.muridTotal}</div>
			<div class="stat-desc text-xs">
				{data.muridActive} aktif · {data.muridInactive} non-aktif
			</div>
		</div>

		<div class="stat rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<div class="stat-figure text-success"><UserPlus class="h-6 w-6" /></div>
			<div class="stat-title text-xs">Murid Baru (Minggu Ini)</div>
			<div class="stat-value text-2xl text-success">{data.muridNewThisWeek}</div>
			<div class="stat-desc text-xs">
				{percentage(data.muridNewThisWeek, data.muridTotal)}% dari total
			</div>
		</div>

		<div class="stat rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<div class="stat-figure text-info"><UserCheck class="h-6 w-6" /></div>
			<div class="stat-title text-xs">Total Pengguna</div>
			<div class="stat-value text-2xl text-info">{data.userTotal}</div>
			<div class="stat-desc text-xs">{data.userActive} aktif</div>
		</div>

		<div class="stat rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
			<div class="stat-figure text-warning"><AlertTriangle class="h-6 w-6" /></div>
			<div class="stat-title text-xs">Error Belum Terselesaikan</div>
			<div class="stat-value text-2xl text-warning">{data.errorUnresolved}</div>
			<div class="stat-desc text-xs">
				<a href="/admin/error-logs" class="link link-hover">Lihat detail</a>
			</div>
		</div>
	</div>

	<!-- Two-column middle section -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Gender Distribution -->
		<div class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body p-5">
				<h2 class="card-title text-sm"><BarChart3 class="h-4 w-4" /> Murid per Gender</h2>
				<div class="mt-2 space-y-3">
					<div>
						<div class="mb-1 flex justify-between text-sm">
							<span>Laki-laki</span>
							<span class="font-semibold">{laki}</span>
						</div>
						<progress
							class="progress progress-primary w-full"
							value={totalGender > 0 ? laki : 0}
							max={totalGender || 1}
						></progress>
					</div>
					<div>
						<div class="mb-1 flex justify-between text-sm">
							<span>Perempuan</span>
							<span class="font-semibold">{perempuan}</span>
						</div>
						<progress
							class="progress progress-secondary w-full"
							value={totalGender > 0 ? perempuan : 0}
							max={totalGender || 1}
						></progress>
					</div>
				</div>
			</div>
		</div>

		<!-- Marhalah Distribution -->
		<div class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body p-5">
				<h2 class="card-title text-sm"><Activity class="h-4 w-4" /> Murid per Marhalah</h2>
				<div class="mt-2 space-y-3">
					{#each [
						{ label: 'Marhalah 1', value: m1, color: 'progress-primary' },
						{ label: 'Marhalah 2', value: m2, color: 'progress-info' },
						{ label: 'Marhalah 3', value: m3, color: 'progress-accent' }
					] as item}
						<div>
							<div class="mb-1 flex justify-between text-sm">
								<span>{item.label}</span>
								<span class="font-semibold">{item.value}</span>
							</div>
							<progress
								class="progress {item.color} w-full"
								value={totalMarhalah > 0 ? item.value : 0}
								max={totalMarhalah || 1}
							></progress>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Data Quality & Activity -->
		<div class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body p-5">
				<h2 class="card-title text-sm"><AlertTriangle class="h-4 w-4" /> Kualitas Data</h2>
				<div class="mt-2 space-y-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Camera class="h-4 w-4 text-base-content/60" />
							<span class="text-sm">Tanpa Foto</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-semibold text-warning">{data.muridNoFoto}</span>
							<span class="text-xs text-base-content/50">({percentage(data.muridNoFoto, data.muridTotal)}%)</span>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<MapPin class="h-4 w-4 text-base-content/60" />
							<span class="text-sm">Tanpa Wilayah</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-semibold text-warning">{data.muridNoWilayah}</span>
							<span class="text-xs text-base-content/50">({percentage(data.muridNoWilayah, data.muridTotal)}%)</span>
						</div>
					</div>
					<div class="divider my-2"></div>
					<h3 class="text-sm font-medium">Aktivitas</h3>
					<div class="flex items-center justify-between">
						<span class="text-sm">Total Kegiatan (Nasyath)</span>
						<span class="font-semibold">{data.nasyathTotal}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm">Kegiatan Bulan Ini</span>
						<span class="font-semibold text-success">{data.nasyathThisMonth}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Murid -->
	<div class="card border border-base-300 bg-base-100 shadow-sm">
		<div class="card-body p-5">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="card-title text-sm"><Users class="h-4 w-4" /> Murid Terbaru</h2>
				<a href="/member/pendataan" class="link link-hover text-xs">Lihat semua</a>
			</div>
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th>Nama</th>
							<th>Gender</th>
							<th>Marhalah</th>
							<th>Status</th>
							<th>Terakhir Diperbarui</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentMurid as murid}
							<tr class="hover">
								<td class="font-medium">{murid.nama}</td>
								<td>{murid.gender ? 'L' : 'P'}</td>
								<td>{murid.marhalah}</td>
								<td>
									<span class="badge badge-sm {murid.aktif ? 'badge-success' : 'badge-ghost'}">
										{murid.aktif ? 'Aktif' : 'Non-aktif'}
									</span>
								</td>
								<td class="text-xs text-base-content/60">{new Date(murid.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
								<td>
									<a href="/member/pendataan/{murid.id}" class="link link-hover text-xs">Detail</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if data.recentMurid.length === 0}
					<p class="py-4 text-center text-sm text-base-content/50">Belum ada data murid.</p>
				{/if}
			</div>
		</div>
	</div>
</div>
