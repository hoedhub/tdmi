<script lang="ts">
	import { page } from '$app/stores';
	import { Home, ArrowLeft, ShieldX, AlertTriangle } from 'lucide-svelte';

	let status = $derived($page.status);
	let message = $derived($page.error?.message || 'Terjadi kesalahan yang tidak terduga.');

	let title = $derived(
		status === 404
			? 'Halaman Tidak Ditemukan'
			: status === 403
				? 'Akses Ditolak'
				: status === 401
					? 'Silakan Login Terlebih Dahulu'
					: status === 500
						? 'Kesalahan Server'
						: 'Terjadi Kesalahan'
	);

	let icon = $derived(status === 403 ? ShieldX : AlertTriangle);
</script>

<div class="flex min-h-[60vh] items-center justify-center px-4">
	<div class="text-center">
		<div class="mb-4 flex justify-center">
			<div class="rounded-full bg-error/10 p-6">
				{#if status === 403}
					<ShieldX class="h-12 w-12 text-error" />
				{:else}
					<AlertTriangle class="h-12 w-12 text-error" />
				{/if}
			</div>
		</div>

		<h1 class="mb-2 text-6xl font-bold text-base-content/30">{status}</h1>
		<h2 class="mb-3 text-xl font-semibold text-base-content">{title}</h2>
		<p class="mb-6 max-w-md text-base-content/60">{message}</p>

		{#if status === 403}
			<p class="mb-4 text-sm text-base-content/50">
				Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika ini merupakan kesalahan.
			</p>
		{/if}

		{#if status === 401}
			<a href="/login" class="btn btn-primary btn-sm">Login</a>
		{:else}
			<div class="flex items-center justify-center gap-3">
				<a href="/member" class="btn btn-primary btn-sm">
					<Home class="h-4 w-4" />
					Dashboard
				</a>
				<button class="btn btn-ghost btn-sm" onclick={() => history.back()}>
					<ArrowLeft class="h-4 w-4" />
					Kembali
				</button>
			</div>
		{/if}

		{#if status === 500}
			<p class="mt-6 text-xs text-base-content/40">
				Jika masalah berlanjut, hubungi administrator.
			</p>
		{/if}
	</div>
</div>
