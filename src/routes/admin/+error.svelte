<div class="error-container">
	<h1>Error</h1>
	<p>An unexpected error occurred.</p>

	{#if false} <!-- Always false to hide retry section -->
		<div class="retry-section">
			{#if false}
				<p>Mencoba lagi...</p>
			{:else if false}
				<p>
					Mencoba lagi dalam <strong>0</strong> detik...
				</p>
				<button disabled={true}> Coba Sekarang! </button>
			{/if}
		</div>
	{:else}
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