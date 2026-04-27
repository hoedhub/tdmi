<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { 
		User, 
		MapPin, 
		Mail, 
		Users, 
		MessageSquare, 
		Send, 
		CheckCircle2, 
		AlertCircle 
	} from 'lucide-svelte';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';

	let { form } = $props<{ form: ActionData }>();

	let isLoading = $state(false);

	const handleSubmit = () => {
		isLoading = true;
		return async ({ result, update }: { result: any, update: any }) => {
			isLoading = false;
			if (result.type === 'success') {
				toastSuccess('Pertanyaan Anda telah kami catat. Terimakasih.');
			} else if (result.type === 'failure') {
				toastError(result.data?.msg || 'Terjadi kesalahan. Silakan coba lagi.');
			}
			await update();
		};
	};
</script>

<svelte:head>
	<title>Pertanyaan Ahbab-Sayidat | TDMI</title>
	<meta name="description" content="Formulir Pertanyaan Ahbab-Sayidat TDMI untuk Maulana Syeikh ra." />
</svelte:head>

<div class="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4 py-12 bg-gradient-to-br from-base-300 via-base-200 to-primary/5">
	<div class="w-full max-w-2xl">
		<!-- Header -->
		<div class="text-center mb-10">
			<h1 class="text-4xl font-extrabold text-primary mb-3">Formulir Pertanyaan</h1>
			<h2 class="text-xl font-medium text-base-content/80">Ahbab & Sayidat TDMI</h2>
			<div class="divider divider-primary w-24 mx-auto"></div>
			<p class="text-base-content/70 max-w-lg mx-auto">
				Dipersilakan untuk segenap Ahbab dan Sayidat TDMI untuk menghaturkan pertanyaan kepada Maulana Syeikh ra.
			</p>
		</div>

		{#if form?.success}
			<div class="card bg-base-100 shadow-2xl border border-success/20 overflow-hidden animate-in fade-in zoom-in duration-500">
				<div class="card-body items-center text-center py-16">
					<div class="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
						<CheckCircle2 size={48} class="text-success" />
					</div>
					<h2 class="card-title text-3xl mb-2">Terimakasih!</h2>
					<p class="text-lg text-base-content/70">Pertanyaan Anda sudah kami catat.</p>
					{#if form?.ticketId}
						<div class="mt-4 px-6 py-3 bg-primary/10 rounded-xl border border-primary/20">
							<p class="text-sm text-base-content/60 mb-1">Nomor Tiket Anda</p>
							<p class="text-2xl font-mono font-bold text-primary tracking-widest">#{ String(form.ticketId).padStart(5, '0') }</p>
							<p class="text-xs text-base-content/50 mt-1">Simpan nomor ini untuk melacak pertanyaan Anda</p>
						</div>
					{/if}
					<div class="card-actions mt-10">
						<button 
							class="btn btn-primary btn-wide" 
							onclick={() => window.location.reload()}
						>
							Kirim Pertanyaan Lain
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="card bg-base-100 shadow-2xl border border-base-300/50">
				<div class="card-body p-8">
					<form action="?/default" method="post" use:enhance={handleSubmit} class="space-y-6">
						<!-- Honeypot -->
						<div class="hidden">
							<label for="website">Website</label>
							<input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Nama -->
							<div class="form-control">
								<label class="label" for="nama">
									<span class="label-text font-semibold flex items-center gap-2">
										<User size={16} class="text-primary" /> Nama Lengkap
										<span class="text-error">*</span>
									</span>
								</label>
								<input 
									type="text" 
									id="nama" 
									name="nama" 
									placeholder="Masukkan nama lengkap Anda" 
									class="input input-bordered focus:input-primary transition-all" 
									required
									disabled={isLoading}
								/>
							</div>

							<!-- Email -->
							<div class="form-control">
								<label class="label" for="email">
									<span class="label-text font-semibold flex items-center gap-2">
										<Mail size={16} class="text-primary" /> Email Aktif
										<span class="text-error">*</span>
									</span>
								</label>
								<input 
									type="email" 
									id="email" 
									name="email" 
									placeholder="nama@contoh.com" 
									class="input input-bordered focus:input-primary transition-all" 
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						<!-- Alamat -->
						<div class="form-control">
							<label class="label" for="alamat">
								<span class="label-text font-semibold flex items-center gap-2">
									<MapPin size={16} class="text-primary" /> Alamat Domisili
									<span class="text-error">*</span>
								</span>
								<span class="label-text-alt text-base-content/50">Desa - Kec - Kab - Prov</span>
							</label>
							<input 
								type="text" 
								id="alamat" 
								name="alamat" 
								placeholder="Contoh: Desa Suka Maju - Kec. Berkah - Kab. Damai - Jawa Barat" 
								class="input input-bordered focus:input-primary transition-all" 
								required
								disabled={isLoading}
							/>
						</div>

						<!-- Nama Mursyid -->
						<div class="form-control">
							<label class="label" for="namaMursyid">
								<span class="label-text font-semibold flex items-center gap-2">
									<Users size={16} class="text-primary" /> Nama Mursyid
									<span class="text-error">*</span>
								</span>
							</label>
							<input 
								type="text" 
								id="namaMursyid" 
								name="namaMursyid" 
								placeholder="Masukkan nama Mursyid Anda" 
								class="input input-bordered focus:input-primary transition-all" 
								required
								disabled={isLoading}
							/>
						</div>

						<!-- Pertanyaan -->
						<div class="form-control">
							<label class="label" for="pertanyaan">
								<span class="label-text font-semibold flex items-center gap-2">
									<MessageSquare size={16} class="text-primary" /> Pertanyaan
									<span class="text-error">*</span>
								</span>
							</label>
							<textarea 
								id="pertanyaan" 
								name="pertanyaan" 
								rows="5"
								placeholder="Tuliskan pertanyaan Anda di sini..." 
								class="textarea textarea-bordered focus:textarea-primary transition-all text-base" 
								required
								disabled={isLoading}
							></textarea>
						</div>

						{#if form?.msg}
							<div class="alert alert-error shadow-sm py-3">
								<AlertCircle size={20} />
								<span>{form.msg}</span>
							</div>
						{/if}

						<div class="pt-4">
							<button 
								type="submit" 
								class="btn btn-primary btn-block text-lg h-14" 
								disabled={isLoading}
							>
								{#if isLoading}
									<span class="loading loading-spinner"></span>
									Mengirim...
								{:else}
									<Send size={20} class="mr-2" /> Kirim Pertanyaan
								{/if}
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<footer class="mt-12 text-center text-sm text-base-content/50">
			<p>© {new Date().getFullYear()} TDMI. Konten ini bersifat internal.</p>
			<p class="mt-1">Tanda <span class="text-error font-bold">*</span> menunjukkan field wajib diisi.</p>
		</footer>
	</div>
</div>

<style>
	:global(body) {
		scroll-behavior: smooth;
	}
</style>
