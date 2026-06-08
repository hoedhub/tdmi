<script lang="ts">
	import { 
		Users, 
		Activity, 
		Clock, 
		PlusCircle, 
		UserPlus, 
		Calendar,
		ShieldCheck,
		GraduationCap,
		Award,
		AlertTriangle,
		Settings
	} from 'lucide-svelte';
	import { formatDateShort } from '$lib/utils/date';
	import type { PageData } from './$types';
	import { fly, fade } from 'svelte/transition';
	import BaseChart from '$lib/components/charts/BaseChart.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Computed stats
	const getMarhalahCount = (m: number) => data.stats.marhalah.find(item => item.marhalah === m)?.count || 0;
	
	// Chart Data
	let genderData = $derived({
		labels: ['Pria', 'Wanita'],
		datasets: [{
			data: [
				data.stats.gender.find(item => item.gender === true)?.count || 0,
				data.stats.gender.find(item => item.gender === false)?.count || 0
			],
			backgroundColor: ['#3b82f6', '#ec4899']
		}]
	});
</script>

<svelte:head>
	<title>Dashboard | Sistem Manajemen TDMI</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Welcome Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6" in:fade={{ duration: 500 }}>
		<div>
			<h1 class="text-4xl md:text-5xl font-black tracking-tight mb-2">
				Selamat Datang, <span class="text-primary">{data.user.username}</span>
			</h1>
			<p class="text-base-content/60 flex items-center gap-2 mt-1 font-medium">
				<Calendar class="h-5 w-5 text-primary" />
				{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
			</p>
		</div>
		<div class="flex gap-3">
			<a href="/member/pendataan/new" class="btn btn-primary btn-lg shadow-xl shadow-primary/30 group px-8">
				<PlusCircle class="h-5 w-5" /> Tambah Murid
			</a>
		</div>
	</div>

	<!-- Admin Alerts -->
	{#if data.isAdmin && data.dataIntegrityIssues > 0}
		<div class="alert alert-warning shadow-lg" in:fly={{ y: -10 }}>
			<AlertTriangle class="h-6 w-6" />
			<div>
				<h3 class="font-bold">Perhatian Data!</h3>
				<div class="text-sm">Terdapat {data.dataIntegrityIssues} murid dengan data kontak/alamat yang tidak lengkap.</div>
			</div>
			<div class="flex-none">
				<a href="/member/pendataan" class="btn btn-sm btn-outline">Periksa Sekarang</a>
			</div>
		</div>
	{/if}

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="card bg-base-100 shadow-md border border-base-200 p-6">
			<div class="flex justify-between items-start">
				<div>
					<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Total Murid</p>
					<h2 class="text-3xl font-black mt-1">{data.stats.totalMurid}</h2>
				</div>
				<div class="p-3 rounded-2xl bg-primary/10 text-primary">
					<Users class="h-6 w-6" />
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-md border border-base-200 p-6">
			<div class="flex justify-between items-start">
				<div>
					<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Marhalah 1</p>
					<h2 class="text-3xl font-black mt-1">{getMarhalahCount(1)}</h2>
				</div>
				<div class="p-3 rounded-2xl bg-info/10 text-info">
					<GraduationCap class="h-6 w-6" />
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-md border border-base-200 p-6">
			<div class="flex justify-between items-start">
				<div>
					<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Marhalah 2</p>
					<h2 class="text-3xl font-black mt-1">{getMarhalahCount(2)}</h2>
				</div>
				<div class="p-3 rounded-2xl bg-warning/10 text-warning">
					<ShieldCheck class="h-6 w-6" />
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-md border border-base-200 p-6">
			<div class="flex justify-between items-start">
				<div>
					<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Marhalah 3</p>
					<h2 class="text-3xl font-black mt-1">{getMarhalahCount(3)}</h2>
				</div>
				<div class="p-3 rounded-2xl bg-secondary/10 text-secondary">
					<Award class="h-6 w-6" />
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 space-y-6">
			<!-- Recent Activities -->
			<div class="card bg-base-100 shadow-md border border-base-200">
				<div class="card-body p-6">
					<h3 class="font-bold flex items-center gap-2 mb-4">
						<Activity class="h-5 w-5 text-primary" /> Aktivitas Terakhir Anda
					</h3>
					<div class="space-y-2">
						{#each data.recentActivities as act}
							<div class="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
								<span class="font-medium">{act.kegiatan}</span>
								<span class="text-xs text-base-content/60">{formatDateShort(act.tanggalMulai || '')}</span>
							</div>
						{:else}
							<p class="text-sm opacity-50 italic">Anda belum mencatat aktivitas apa pun.</p>
						{/each}
					</div>
				</div>
			</div>

            <!-- Active Piket -->
			{#if data.activePiket.length > 0}
			<div class="card bg-warning/10 border border-warning/20 shadow-none">
				<div class="card-body">
					<h3 class="font-bold text-warning flex items-center gap-2">
						<ShieldCheck class="h-5 w-5" /> Piket Aktif Anda
					</h3>
					{#each data.activePiket as piket}
						<div class="flex justify-between items-center bg-white/50 p-3 rounded-lg">
							<span>{piket.description || 'Tugas Piket'}</span>
							<span class="font-bold">{formatDateShort(piket.startDate)} - {formatDateShort(piket.endDate)}</span>
						</div>
					{/each}
				</div>
			</div>
			{/if}
		</div>

		<div class="space-y-6">
			<!-- Demographic Chart -->
			<div class="card bg-base-100 shadow-md border border-base-200 p-6">
				<h3 class="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-4">Demografi Murid</h3>
				<div class="h-48">
					<BaseChart type="doughnut" data={genderData} options={{ responsive: true, maintainAspectRatio: false }} />
				</div>
			</div>

			<!-- Admin Quick Links -->
			{#if data.isAdmin}
				<div class="card bg-base-200 shadow-md border border-base-200">
					<div class="card-body p-6">
						<h3 class="font-bold flex items-center gap-2 mb-2">
							<Settings class="h-5 w-5" /> Panel Admin
						</h3>
						<a href="/admin/users" class="btn btn-sm btn-ghost justify-start">Kelola Pengguna</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
