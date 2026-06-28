<script lang="ts">
	import { page } from '$app/stores';
	import { Home, ArrowLeft, AlertTriangle } from 'lucide-svelte';

	let status = $derived($page.status);
	let message = $derived($page.error?.message || 'Terjadi kesalahan yang tidak terduga.');

	let title = $derived(
		status === 404
			? 'Halaman Tidak Ditemukan'
			: status === 403
				? 'Akses Ditolak'
				: status === 401
					? 'Tidak Terautentikasi'
					: status === 500
						? 'Kesalahan Server'
						: 'Terjadi Kesalahan'
	);
</script>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	<div class="text-center">
		<div class="mb-4 flex justify-center">
			<div class="rounded-full bg-error/10 p-6">
				<AlertTriangle class="h-12 w-12 text-error" />
			</div>
		</div>

		<h1 class="mb-2 text-6xl font-bold text-base-content/30">{status}</h1>
		<h2 class="mb-3 text-xl font-semibold text-base-content">{title}</h2>
		<p class="mb-6 max-w-md text-base-content/60">{message}</p>

		<div class="flex items-center justify-center gap-3">
			<a href="/" class="btn btn-primary btn-sm">
				<Home class="h-4 w-4" />
				Beranda
			</a>
			<button class="btn btn-ghost btn-sm" onclick={() => history.back()}>
				<ArrowLeft class="h-4 w-4" />
				Kembali
			</button>
		</div>

		{#if status === 500}
			<p class="mt-6 text-xs text-base-content/40">
				Jika masalah berlanjut, hubungi administrator.
			</p>
		{/if}
	</div>
</div>
