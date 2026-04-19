<script lang="ts">
	import type { PageData } from './$types';
	import {
		User,
		MapPin,
		Phone,
		Calendar,
		Shield,
		Activity,
		Share2,
		Pen,
		Trash,
		ArrowLeft,
		Network
	} from 'lucide-svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let detail = $derived(data.detail);
	let murid = $derived(detail.murid);
	let recentNasyath = $derived(data.recentNasyath);

	function calculateAge(tglLahir: string | null): number | null {
		if (!tglLahir) return null;
		const birthDate = new Date(tglLahir);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return '-';
		try {
			return new Intl.DateTimeFormat('id-ID', {
				day: '2-digit',
				month: 'long',
				year: 'numeric'
			}).format(new Date(dateString));
		} catch (e) {
			return dateString;
		}
	}

	let fullAddress = $derived(
		[murid.alamat, detail.deskelName, detail.kecamatanName, detail.kokabName, detail.propinsiName]
			.filter(Boolean)
			.join(', ')
	);
</script>

<svelte:head>
	<title>Detail Murid: {murid.nama} - TDMI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Top Navigation & Actions -->
	<div class="flex flex-wrap items-center justify-between gap-4">
		<a href="/member/pendataan" class="btn btn-ghost btn-sm">
			<ArrowLeft class="h-4 w-4" />
			Kembali ke Daftar
		</a>
		<div class="flex gap-2">
			<a href={`/member/pendataan/${murid.id}/jaringan`} class="btn btn-info btn-sm text-white">
				<Network class="h-4 w-4" />
				Jaringan Relasi
			</a>
			<a href={`/member/pendataan/${murid.id}/edit`} class="btn btn-secondary btn-sm">
				<Pen class="h-4 w-4" />
				Edit Data
			</a>
		</div>
	</div>

	<!-- Hero Profile Section -->
	<div class="card bg-base-100 shadow-xl border border-base-200">
		<div class="card-body">
			<div class="flex flex-col md:flex-row gap-6 items-start">
				<div class="avatar placeholder">
					<div class="bg-neutral text-neutral-content rounded-full w-24 h-24 ring ring-primary ring-offset-base-100 ring-offset-2">
						<span class="text-3xl">{murid.nama.substring(0, 2).toUpperCase()}</span>
					</div>
				</div>
				<div class="flex-1 space-y-2">
					<h1 class="text-3xl font-bold flex items-center gap-2">
						{murid.nama}
						{#if murid.gender}
							<span class="text-blue-500" title="Pria">♂</span>
						{:else}
							<span class="text-pink-500" title="Wanita">♀</span>
						{/if}
					</h1>
					{#if murid.namaArab}
						<p class="text-xl font-arabic text-base-content/70" dir="rtl">{murid.namaArab}</p>
					{/if}
					
					<div class="flex flex-wrap gap-2 mt-2">
						<div class={`badge ${murid.aktif ? 'badge-success' : 'badge-error'}`}>
							{murid.aktif ? 'Aktif' : 'Tidak Aktif'}
						</div>
						<div class={`badge ${murid.partisipasi ? 'badge-info' : 'badge-ghost'}`}>
							Partisipasi: {murid.partisipasi ? 'Ya' : 'Tidak'}
						</div>
						{#if murid.qari}
							<div class="badge badge-warning">Qari</div>
						{/if}
						<div class="badge badge-primary badge-outline">Marhalah {murid.marhalah}</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left Column: Personal Info & Contact -->
		<div class="space-y-6 lg:col-span-1">
			<!-- Personal Info -->
			<div class="card bg-base-100 shadow-xl border border-base-200">
				<div class="card-body">
					<h2 class="card-title text-lg border-b pb-2 mb-2"><User class="h-5 w-5" /> Info Personal</h2>
					
					<div class="space-y-3 text-sm">
						<div>
							<span class="text-base-content/60 block text-xs">NIK</span>
							<span class="font-medium">{murid.nik || '-'}</span>
						</div>
						<div>
							<span class="text-base-content/60 block text-xs">Tanggal Lahir & Umur</span>
							<span class="font-medium">
								{formatDate(murid.tglLahir)} 
								{#if murid.tglLahir}
									<span class="text-base-content/60">({calculateAge(murid.tglLahir)} thn)</span>
								{/if}
							</span>
						</div>
						<div>
							<span class="text-base-content/60 block text-xs">Jenis Kelamin</span>
							<span class="font-medium">{murid.gender ? 'Pria' : 'Wanita'}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Contact Info -->
			<div class="card bg-base-100 shadow-xl border border-base-200">
				<div class="card-body">
					<h2 class="card-title text-lg border-b pb-2 mb-2"><MapPin class="h-5 w-5" /> Kontak & Alamat</h2>
					
					<div class="space-y-3 text-sm">
						<div class="flex items-start gap-3">
							<Phone class="h-4 w-4 mt-1 text-base-content/60" />
							<div>
								<span class="text-base-content/60 block text-xs">Nomor Telepon</span>
								<span class="font-medium">{murid.nomorTelepon || '-'}</span>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<MapPin class="h-4 w-4 mt-1 text-base-content/60" />
							<div>
								<span class="text-base-content/60 block text-xs">Alamat Lengkap</span>
								<span class="font-medium leading-tight block mt-1">{fullAddress || '-'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Middle/Right Column: Relations & Activities -->
		<div class="space-y-6 lg:col-span-2">
			
			<!-- Spiritual Relations -->
			<div class="card bg-base-100 shadow-xl border border-base-200">
				<div class="card-body">
					<h2 class="card-title text-lg border-b pb-2 mb-2"><Shield class="h-5 w-5" /> Hubungan Pembinaan</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Mursyid</span>
							<div class="flex items-center gap-2">
								<User class="h-4 w-4 text-primary" />
								<span class="font-medium text-lg">{detail.mursyidName || '-'}</span>
							</div>
						</div>
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Muhrim</span>
							<div class="flex items-center gap-2">
								<User class="h-4 w-4 text-secondary" />
								<span class="font-medium text-lg">{detail.muhrimName || '-'}</span>
							</div>
						</div>
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Baiat</span>
							<div class="flex items-center gap-2">
								<User class="h-4 w-4 text-accent" />
								<span class="font-medium text-lg">{detail.baiatName || '-'}</span>
							</div>
						</div>
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Wirid</span>
							<div class="flex items-center gap-2">
								<User class="h-4 w-4 text-info" />
								<span class="font-medium text-lg">{detail.wiridName || '-'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Recent Activities -->
			<div class="card bg-base-100 shadow-xl border border-base-200">
				<div class="card-body">
					<h2 class="card-title text-lg border-b pb-2 mb-2"><Activity class="h-5 w-5" /> Nasyath (Kegiatan) Terbaru</h2>
					
					{#if recentNasyath.length > 0}
						<div class="overflow-x-auto">
							<table class="table table-sm w-full">
								<thead>
									<tr>
										<th>Tanggal</th>
										<th>Kegiatan</th>
										<th>Tempat</th>
									</tr>
								</thead>
								<tbody>
									{#each recentNasyath as nasyath}
										<tr class="hover">
											<td class="whitespace-nowrap">{formatDate(nasyath.tanggalMulai)}</td>
											<td class="font-medium">{nasyath.kegiatan}</td>
											<td>{nasyath.tempat || '-'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<div class="mt-4 text-center">
							<a href={`/member/nasyath_mun?muridId=${murid.id}`} class="btn btn-sm btn-ghost">Lihat Semua Kegiatan</a>
						</div>
					{:else}
						<div class="text-center p-6 text-base-content/60">
							<Calendar class="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p>Belum ada data kegiatan untuk murid ini.</p>
						</div>
					{/if}
				</div>
			</div>

		</div>
	</div>
</div>
