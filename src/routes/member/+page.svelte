<script lang="ts">
	import { 
		Users, 
		Activity, 
		Clock, 
		ArrowRight, 
		PlusCircle, 
		TrendingUp, 
		UserPlus, 
		Calendar,
		ChevronRight,
		RefreshCw,
		ShieldCheck,
		GraduationCap,
		Award
	} from 'lucide-svelte';
	import { formatDateShort } from '$lib/utils/date';
	import type { PageData } from './$types';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Computed stats
	const getMarhalahCount = (m: number) => data.stats.marhalah.find(item => item.marhalah === m)?.count || 0;
	const priaCount = data.stats.gender.find(item => item.gender === true)?.count || 0;
	const wanitaCount = data.stats.gender.find(item => item.gender === false)?.count || 0;
</script>

<svelte:head>
	<title>Dashboard | Sistem Manajemen TDMI</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Welcome Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4" in:fade={{ duration: 500 }}>
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight">Selamat Datang, {data.user.username}!</h1>
			<p class="text-base-content/60 flex items-center gap-2 mt-1">
				<Calendar class="h-4 w-4" />
				{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
			</p>
		</div>
		<div class="flex gap-2">
			<a href="/member/pendataan/new" class="btn btn-primary shadow-lg shadow-primary/20">
				<PlusCircle class="h-4 w-4" /> Tambah Murid
			</a>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" in:fly={{ y: 20, duration: 600, delay: 100 }}>
		<div class="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group hover:border-primary/30 transition-all">
			<div class="card-body p-5">
				<div class="flex justify-between items-start">
					<div>
						<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Total Murid</p>
						<h2 class="text-3xl font-black mt-1">{data.stats.totalMurid}</h2>
					</div>
					<div class="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content transition-colors">
						<Users class="h-6 w-6" />
					</div>
				</div>
				<div class="mt-4 flex items-center text-xs text-success font-medium">
					<TrendingUp class="h-3 w-3 mr-1" /> Terus Berkembang
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group hover:border-info/30 transition-all">
			<div class="card-body p-5">
				<div class="flex justify-between items-start">
					<div>
						<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Marhalah 1</p>
						<h2 class="text-3xl font-black mt-1">{getMarhalahCount(1)}</h2>
					</div>
					<div class="p-3 rounded-2xl bg-info/10 text-info group-hover:bg-info group-hover:text-info-content transition-colors">
						<GraduationCap class="h-6 w-6" />
					</div>
				</div>
				<div class="mt-4 w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
					<div class="bg-info h-full transition-all" style="width: {(getMarhalahCount(1) / (data.stats.totalMurid || 1)) * 100}%"></div>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group hover:border-warning/30 transition-all">
			<div class="card-body p-5">
				<div class="flex justify-between items-start">
					<div>
						<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Marhalah 2</p>
						<h2 class="text-3xl font-black mt-1">{getMarhalahCount(2)}</h2>
					</div>
					<div class="p-3 rounded-2xl bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-content transition-colors">
						<ShieldCheck class="h-6 w-6" />
					</div>
				</div>
				<div class="mt-4 w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
					<div class="bg-warning h-full transition-all" style="width: {(getMarhalahCount(2) / (data.stats.totalMurid || 1)) * 100}%"></div>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group hover:border-secondary/30 transition-all">
			<div class="card-body p-5">
				<div class="flex justify-between items-start">
					<div>
						<p class="text-xs font-bold uppercase tracking-widest text-base-content/50">Marhalah 3</p>
						<h2 class="text-3xl font-black mt-1">{getMarhalahCount(3)}</h2>
					</div>
					<div class="p-3 rounded-2xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-content transition-colors">
						<Award class="h-6 w-6" />
					</div>
				</div>
				<div class="mt-4 w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
					<div class="bg-secondary h-full transition-all" style="width: {(getMarhalahCount(3) / (data.stats.totalMurid || 1)) * 100}%"></div>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Main Activity Section -->
		<div class="lg:col-span-2 space-y-6" in:fly={{ x: -20, duration: 600, delay: 200 }}>
			<div class="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
				<div class="card-body p-0">
					<div class="p-6 border-b border-base-200 flex items-center justify-between bg-base-200/20">
						<h3 class="font-bold flex items-center gap-2">
							<Activity class="h-5 w-5 text-primary" />
							Aktivitas Terbaru
						</h3>
						<a href="/member/pendataan" class="btn btn-ghost btn-xs">Lihat Semua</a>
					</div>
					
					<div class="tabs tabs-bordered w-full">
						<input type="radio" name="recent_tabs" class="tab" aria-label="Baru Ditambahkan" checked />
						<div class="tab-content bg-base-100 p-0">
							<div class="divide-y divide-base-100">
								{#each data.recentlyAdded as m}
									<div class="p-4 hover:bg-base-200/30 transition-colors flex items-center justify-between group">
										<div class="flex items-center gap-3">
											<div class="avatar placeholder">
												<div class="bg-primary/10 text-primary rounded-full w-10 h-10 ring ring-primary/5">
													<span class="text-sm font-bold">{m.nama.substring(0, 2).toUpperCase()}</span>
												</div>
											</div>
											<div>
												<h4 class="font-bold text-sm group-hover:text-primary transition-colors">{m.nama}</h4>
												<p class="text-[10px] text-base-content/50 flex items-center gap-1 mt-0.5">
													<Clock class="h-3 w-3" />
													Daftar: {formatDateShort(m.updatedAt)}
												</p>
											</div>
										</div>
										<a href="/member/pendataan/{m.id}" class="btn btn-circle btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-all">
											<ArrowRight class="h-4 w-4" />
										</a>
									</div>
								{:else}
									<div class="p-10 text-center opacity-50">Belum ada data murid baru</div>
								{/each}
							</div>
						</div>

						<input type="radio" name="recent_tabs" class="tab" aria-label="Terakhir Diperbarui" />
						<div class="tab-content bg-base-100 p-0">
							<div class="divide-y divide-base-100">
								{#each data.recentlyUpdated as m}
									<div class="p-4 hover:bg-base-200/30 transition-colors flex items-center justify-between group">
										<div class="flex items-center gap-3">
											<div class="avatar placeholder">
												<div class="bg-secondary/10 text-secondary rounded-full w-10 h-10 ring ring-secondary/5">
													<span class="text-sm font-bold">{m.nama.substring(0, 2).toUpperCase()}</span>
												</div>
											</div>
											<div>
												<h4 class="font-bold text-sm group-hover:text-secondary transition-colors">{m.nama}</h4>
												<p class="text-[10px] text-base-content/50 flex items-center gap-1 mt-0.5">
													<RefreshCw class="h-3 w-3" />
													Update: {formatDateShort(m.updatedAt)}
												</p>
											</div>
										</div>
										<a href="/member/pendataan/{m.id}" class="btn btn-circle btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-all">
											<ArrowRight class="h-4 w-4" />
										</a>
									</div>
								{:else}
									<div class="p-10 text-center opacity-50">Belum ada pembaruan data</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Side Widgets Section -->
		<div class="space-y-6" in:fly={{ x: 20, duration: 600, delay: 300 }}>
			<!-- Quick Actions -->
			<div class="card bg-primary text-primary-content shadow-xl overflow-hidden">
				<div class="card-body">
					<h3 class="font-bold flex items-center gap-2 mb-2">
						<PlusCircle class="h-5 w-5" />
						Aksi Cepat
					</h3>
					<div class="grid grid-cols-1 gap-2">
						<a href="/member/pendataan/new" class="btn btn-sm btn-white/20 hover:bg-white/30 text-white border-none justify-start gap-3 h-12">
							<div class="bg-white/20 p-1.5 rounded-lg">
								<UserPlus class="h-4 w-4" />
							</div>
							Daftarkan Murid Baru
						</a>
						<a href="/member/pendataan" class="btn btn-sm btn-white/20 hover:bg-white/30 text-white border-none justify-start gap-3 h-12">
							<div class="bg-white/20 p-1.5 rounded-lg">
								<Activity class="h-4 w-4" />
							</div>
							Kelola Pendataan
						</a>
					</div>
				</div>
			</div>

			<!-- Demographic Card -->
			<div class="card bg-base-100 shadow-xl border border-base-200">
				<div class="card-body">
					<h3 class="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-4">Demografi Gender</h3>
					
					<div class="space-y-4">
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span class="flex items-center gap-1.5 font-medium"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Pria</span>
								<span class="opacity-70">{priaCount}</span>
							</div>
							<div class="w-full bg-base-200 rounded-full h-2">
								<div class="bg-blue-500 h-full rounded-full transition-all" style="width: {(priaCount / (data.stats.totalMurid || 1)) * 100}%"></div>
							</div>
						</div>
						
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span class="flex items-center gap-1.5 font-medium"><span class="w-2 h-2 rounded-full bg-pink-500"></span> Wanita</span>
								<span class="opacity-70">{wanitaCount}</span>
							</div>
							<div class="w-full bg-base-200 rounded-full h-2">
								<div class="bg-pink-500 h-full rounded-full transition-all" style="width: {(wanitaCount / (data.stats.totalMurid || 1)) * 100}%"></div>
							</div>
						</div>
					</div>
					
					<div class="mt-6 p-4 rounded-xl bg-base-200/50 text-[11px] leading-relaxed italic">
						"Data demografi ini membantu dalam perencanaan kegiatan (Nasyath) yang lebih tepat sasaran."
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom styles for dashboard */
	:global(.tab-content) {
		@apply border-base-200;
	}
	
	.btn-white\/20 {
		background-color: rgba(255, 255, 255, 0.1);
	}
	
	.btn-white\/30 {
		background-color: rgba(255, 255, 255, 0.2);
	}
</style>
