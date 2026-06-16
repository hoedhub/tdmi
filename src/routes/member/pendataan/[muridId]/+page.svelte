<script lang="ts">
	import type { PageData } from './$types';
	import {
		User,
		Users,
		MapPin,
		Phone,
		Calendar,
		Shield,
		Activity,
		Share2,
		Pen,
		Trash,
		ArrowLeft,
		Network,
		TriangleAlert,
		Clock
	} from 'lucide-svelte';
	import { formatDateShort } from '$lib/utils/date';
	import { calculateAge } from '$lib/utils/formatMurid';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let detail = $derived(data.detail);
	let murid = $derived(detail.murid);
	let recentNasyath = $derived(data.recentNasyath);
	let mustarsyadList = $derived(data.mustarsyadList);
	let mustarsyadPria = $derived(mustarsyadList.filter((m: any) => m.gender === true));
	let mustarsyadWanita = $derived(mustarsyadList.filter((m: any) => m.gender === false));
	let hasMultipleGenders = $derived(mustarsyadPria.length > 0 && mustarsyadWanita.length > 0);

	let fullAddress = $derived(
		[murid.alamat, detail.deskelName, detail.kecamatanName, detail.kokabName, detail.propinsiName]
			.filter(Boolean)
			.join(', ')
	);

	function getIrsyadLabel(hasMustarsyad: number, gender: boolean): string {
		if (hasMustarsyad > 0) {
			return gender ? 'Mursyid' : 'Mursyidah';
		}
		return gender ? 'Murid' : 'Muridah';
	}
</script>

{#snippet marhalahWarning(name: string | null, marhalah: number | null, qari: boolean | null, colorClass: string = 'text-primary')}
	<div class="flex items-center gap-2">
		<User class="h-4 w-4 {colorClass}" />
		<span class="font-medium text-lg">{name || '-'}</span>
		{#if name}
			{@const isLowMarhalah = marhalah !== null && marhalah < 3}
			{@const isGhoiruQari = qari === false}
			{#if isLowMarhalah || isGhoiruQari}
				<div class="tooltip tooltip-warning" data-tip={"Peringatan:" + (isLowMarhalah ? " Belum Marhalah 3." : "") + (isGhoiruQari ? " Ghoiru Qari." : "")}>
					<span class="text-warning font-medium">
						<TriangleAlert size={18} />
					</span>
				</div>
			{/if}
		{/if}
	</div>
{/snippet}

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
				<div class="avatar {data.detail.fotoUrl ? '' : 'placeholder'}">
					<div class="bg-neutral text-neutral-content rounded-full w-24 h-24 ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
						{#if data.detail.fotoUrl}
							<img src={data.detail.fotoUrl} alt={murid.nama} class="object-cover w-full h-full" />
						{:else}
							<span class="text-3xl">{murid.nama.substring(0, 2).toUpperCase()}</span>
						{/if}
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
		<div class="bg-base-200/30 px-6 py-2 border-t border-base-200 flex justify-end">
			<div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-base-content/50 font-bold">
				<Clock class="h-3 w-3" />
				Terakhir diperbarui: {formatDateShort(murid.updatedAt)}
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
								{formatDateShort(murid.tglLahir)} 
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
					<h2 class="card-title text-lg border-b pb-2 mb-2"><Shield class="h-5 w-5" /> Irsyadiyah</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Mursyid</span>
							{@render marhalahWarning(detail.mursyidName, detail.mursyidMarhalah, detail.mursyidQari, 'text-primary')}
						</div>
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Muhrim</span>
							{@render marhalahWarning(detail.muhrimName, detail.muhrimMarhalah, detail.muhrimQari, 'text-secondary')}
						</div>
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Baiat</span>
							{@render marhalahWarning(detail.baiatName, detail.baiatMarhalah, detail.baiatQari, 'text-accent')}
						</div>
						<div class="bg-base-200/50 p-4 rounded-lg border border-base-200">
							<span class="text-base-content/60 block text-xs uppercase tracking-wider font-semibold mb-1">Wirid</span>
							{@render marhalahWarning(detail.wiridName, detail.wiridMarhalah, detail.wiridQari, 'text-info')}
						</div>
					</div>
				</div>
			</div>

			<!-- Mustarsyad -->
			<div class="card bg-base-100 shadow-xl border border-base-200">
				<div class="card-body">
					<h2 class="card-title text-lg border-b pb-2 mb-3">
						<Users class="h-5 w-5" /> Mustarsyad
						<span class="badge badge-neutral ml-1">{mustarsyadList.length}</span>
					</h2>

					{#snippet mustarsyadTable(list: typeof mustarsyadList)}
						<div class="overflow-x-auto">
							<table class="table table-sm w-full">
								<thead>
									<tr>
										<th>Nama</th>
										<th>No. Telp</th>
										<th class="text-center">Umur</th>
										<th class="text-center">Baca Arab</th>
										<th class="text-center">Marhalah</th>
										<th class="text-center">Irsyad</th>
										<th class="text-center">Aktif</th>
										<th class="text-center">Partisipasi</th>
									</tr>
								</thead>
								<tbody>
									{#each list as m}
										<tr class="hover">
											<td>
												<a
													href={`/member/pendataan/${m.id}`}
													class="font-medium link link-hover text-primary flex items-center gap-1"
												>
													{m.nama}
													{#if m.gender}
														<span class="text-blue-400 text-xs" title="Pria">♂</span>
													{:else}
														<span class="text-pink-400 text-xs" title="Wanita">♀</span>
													{/if}
												</a>
											</td>
											<td class="text-sm">{m.nomorTelepon || '-'}</td>
											<td class="text-center text-sm">
												{#if m.tglLahir}
													{calculateAge(m.tglLahir)} thn
												{:else}
													-
												{/if}
											</td>
											<td class="text-center">
												<span class={`badge badge-sm ${m.qari ? 'badge-success' : 'badge-ghost'}`}>
													{m.qari ? 'Ya' : 'Tidak'}
												</span>
											</td>
											<td class="text-center">
												<span class="badge badge-sm badge-primary badge-outline">M{m.marhalah}</span>
											</td>
											<td class="text-center">
												<span class={`badge badge-sm ${m.hasMustarsyad > 0 ? 'badge-info' : 'badge-ghost'}`}>
													{getIrsyadLabel(m.hasMustarsyad, m.gender)}
												</span>
											</td>
											<td class="text-center">
												<span class={`badge badge-sm ${m.aktif ? 'badge-success' : 'badge-error'}`}>
													{m.aktif ? 'Aktif' : 'Tidak'}
												</span>
											</td>
											<td class="text-center">
												<span class={`badge badge-sm ${m.partisipasi ? 'badge-info' : 'badge-ghost'}`}>
													{m.partisipasi ? 'Ya' : 'Tidak'}
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/snippet}

					{#if mustarsyadList.length > 0}
						{#if hasMultipleGenders}
							<div class="space-y-5">
								<div>
									<p class="text-sm font-semibold text-base-content/60 mb-2 flex items-center gap-1">
										<span class="text-blue-500">♂</span> Laki-laki
										<span class="badge badge-xs badge-ghost">{mustarsyadPria.length}</span>
									</p>
									{@render mustarsyadTable(mustarsyadPria)}
								</div>
								<div>
									<p class="text-sm font-semibold text-base-content/60 mb-2 flex items-center gap-1">
										<span class="text-pink-500">♀</span> Perempuan
										<span class="badge badge-xs badge-ghost">{mustarsyadWanita.length}</span>
									</p>
									{@render mustarsyadTable(mustarsyadWanita)}
								</div>
							</div>
						{:else}
							{@render mustarsyadTable(mustarsyadList)}
						{/if}
					{:else}
						<div class="text-center p-6 text-base-content/60">
							<Users class="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p>Belum ada mustarsyad untuk murid ini.</p>
						</div>
					{/if}
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
											<td class="whitespace-nowrap">{formatDateShort(nasyath.tanggalMulai)}</td>
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
