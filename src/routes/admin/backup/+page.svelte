<script lang="ts">
	import { page } from '$app/stores';
	import { loading, update, success, error } from '$lib/components/toast';
	import { Download, Loader2 } from 'lucide-svelte';

	let isLoading = false;

	// Ambil data dari load function di +page.server.ts
	$: canCreateBackup = $page.data.canCreateBackup;

	async function handleBackup() {
		if (!canCreateBackup || isLoading) return;

		isLoading = true;
		const toastId = loading('Membuat backup database...');

		try {
			const response = await fetch('/api/backup', {
				method: 'POST'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Gagal membuat backup.');
			}

			// Dapatkan nama file dari header Content-Disposition
			const disposition = response.headers.get('content-disposition');
			let filename = 'backup.sql'; // Default filename
			if (disposition && disposition.indexOf('attachment') !== -1) {
				const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
				const matches = filenameRegex.exec(disposition);
				if (matches != null && matches[1]) {
					filename = matches[1].replace(/['"]/g, '');
				}
			}

			// Buat blob dari response dan picu unduhan
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);

			update(toastId, {
				type: 'success',
				title: 'Backup Berhasil',
				message: `File ${filename} telah diunduh.`
			});
		} catch (err: any) {
			update(toastId, {
				type: 'error',
				title: 'Backup Gagal',
				message: err.message || 'Terjadi kesalahan yang tidak diketahui.'
			});
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-4 p-6">
	<h1 class="text-2xl font-bold">Manajemen Backup Database</h1>
	<p class="text-gray-600">
		Buat dan unduh salinan lengkap dari database aplikasi. File backup akan berformat SQL dan dapat
		digunakan untuk memulihkan data jika terjadi masalah.
	</p>

	<div class="pt-4">
		<button
			type="button"
			on:click={handleBackup}
			disabled={!canCreateBackup || isLoading}
			class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
		>
			{#if isLoading}
				<Loader2 class="mr-2 h-5 w-5 animate-spin" />
				<span>Memproses...</span>
			{:else}
				<Download class="mr-2 h-5 w-5" />
				<span>Buat & Unduh Backup</span>
			{/if}
		</button>
	</div>

	{#if !canCreateBackup}
		<p class="text-sm text-red-600">
			Anda tidak memiliki izin untuk membuat backup. Silakan hubungi administrator.
		</p>
	{/if}
</div>
