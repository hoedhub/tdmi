<script lang="ts">
	import { RefreshCw, Database } from 'lucide-svelte';
	import { manualSyncMurid } from '$lib/utils/db';
	import { success, error, info } from '$lib/components/toast';
	import { scale, fade } from 'svelte/transition';
	import { page } from '$app/stores';

	let { children } = $props();

	let isSyncing = $state(false);

	async function handleSync() {
		if (isSyncing) return;
		
		isSyncing = true;
		info('Sinkronisasi data murid dimulai...');
		
		const result = await manualSyncMurid();
		isSyncing = false;
		
		if (result.success) {
			success(`Data murid berhasil diperbarui! (${result.count} record)`);
		} else {
			error(`Gagal memperbarui cache: ${result.message}`);
		}
	}
</script>

<!-- Slot for children (the actual pages) -->
{@render children()}

<!-- Floating Sync Button -->
<div class="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-2 pointer-events-none">
	<div class="pointer-events-auto">
		<div class="tooltip tooltip-left lg:tooltip-top" data-tip="Perbarui Cache Murid">
			<button
				onclick={handleSync}
				disabled={isSyncing}
				class="group relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-content shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-70 disabled:grayscale overflow-hidden"
				aria-label="Update Cache"
			>
				<!-- Background pulse effect when syncing -->
				{#if isSyncing}
					<div class="absolute inset-0 animate-ping bg-primary opacity-20"></div>
				{/if}
				
				<div class="relative z-10">
					{#if isSyncing}
						<RefreshCw class="h-6 w-6 animate-spin" />
					{:else}
						<Database class="h-6 w-6 transition-transform group-hover:rotate-12" />
					{/if}
				</div>
			</button>
		</div>
	</div>
</div>

<style>
	/* Tambahkan sedikit glassmorphism pada shadow jika perlu */
	button {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.1);
	}
</style>
