<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { retryCount } from '$lib/stores';

	let countdown = 0;
	let timerId: ReturnType<typeof window.setInterval> | undefined;
	let isRetrying = false;

	// Fungsi untuk memulai percobaan ulang
	async function handleRetry() {
		clearInterval(timerId); // Hentikan countdown yang ada
		isRetrying = true;

		// Tingkatkan jumlah percobaan di store
		retryCount.update((n) => n + 1);

		// invalidateAll() adalah fungsi SvelteKit untuk menjalankan ulang semua
		// fungsi `load` yang aktif. Ini akan memicu ulang fetch di server.
		await invalidateAll();

		// Jika fetch berhasil, SvelteKit akan menavigasi ke halaman yang benar.
		// Jika gagal lagi, halaman error ini akan dirender ulang, dan
		// logika di bawah akan berjalan kembali dengan $retryCount yang baru.
		isRetrying = false;
	}

	// Fungsi untuk memulai countdown
	function startCountdown() {
		// Exponential backoff: 2^1=2s, 2^2=4s, 2^3=8s, dst.
		// Kita batasi maksimal 30 detik agar tidak terlalu lama.
		const delay = Math.min(Math.pow(2, $retryCount + 1), 30);
		countdown = delay;

		timerId = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				clearInterval(timerId);
				handleRetry(); // Otomatis coba lagi saat countdown habis
			}
		}, 1000);
	}

	// Gunakan reactive statement untuk merespons perubahan pada $page.error
	$: {
		if ($page.error?.code === 'ETIMEDOUT') {
			// Hentikan timer lama jika ada
			clearInterval(timerId);
			// Mulai countdown baru setiap kali error timeout terdeteksi
			startCountdown();
		}
	}

	// Pastikan untuk membersihkan interval saat komponen dihancurkan
	// untuk mencegah memory leak
	onDestroy(() => {
		clearInterval(timerId);
	});
</script>

<div class="error-container">
	<h1>{$page.status}</h1>
	<p>{$page.error?.message}</p>

	{#if $page.error?.code === 'ETIMEDOUT'}
		<div class="retry-section">
			{#if isRetrying}
				<p>Mencoba lagi...</p>
			{:else if countdown > 0}
				<p>
					Mencoba lagi dalam <strong>{countdown}</strong> detik...
				</p>
				<button on:click={handleRetry} disabled={isRetrying}> Coba Sekarang! </button>
			{/if}
		</div>
	{:else}
		<!-- Tombol kembali ke beranda untuk error lainnya -->
		<a href="/">Kembali ke Beranda</a>
	{/if}
</div> 

<style>
	.error-container {
		text-align: center;
		padding: 2rem;
		margin-top: 5vh;
		font-family: sans-serif;
	}
	h1 {
		font-size: 4rem;
		color: #ff3e00;
		margin: 0;
	}
	p {
		font-size: 1.2rem;
		margin: 0.5rem 0;
	}
	.retry-section {
		margin-top: 2rem;
		padding: 1rem;
		background-color: #f0f0f0;
		border-radius: 8px;
		display: inline-block;
	}
	button {
		font-size: 1rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>

