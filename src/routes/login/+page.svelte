<script lang="ts">
	import { onMount } from 'svelte';
	import { applyAction, enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { Eye, EyeOff, CheckCircle2 } from 'lucide-svelte'; // Using lucide-svelte for icons
	import { error, success } from '$lib/components/toast'; // Import toast functions

	let rememberMe = false;
	let showPassword = false;
	let isLoading = false;

	async function handleSubmit() {
		if (isLoading) return;
		isLoading = true;

		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'error') {
				isLoading = false;
				// Display error toast
				error(result.error?.msg || 'An unknown error occurred during login.', { duration: 5000 });
				return;
			}

			// Show success toast before redirecting
			if (result.type === 'redirect') {
				console.log('Login successful:', result);
				success('Login successful!', {
					duration: 3000,
					icon: CheckCircle2
				});
			}

			// If result.type is 'success' or 'redirect', applyAction will handle it
			await applyAction(result);
		};
	}
	onMount(() => {
		document.documentElement.setAttribute('data-theme', 'dark');
	});
</script>

<svelte:head>
	<title>Login | MyApp</title>
	<meta name="description" content="Login to your MyApp account" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4">
	<div class="w-full max-w-md">
		<!-- Optional: Logo or App Name -->
		<!-- <div class="mb-8 text-center">
			<h1 class="text-4xl font-bold text-primary">MyApp</h1>
			<p class="text-base-content/70">Welcome back! Please login to your account.</p>
		</div> -->

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title mb-6 justify-center text-2xl">Login</h2>

				<!-- Removed the old errorMessage display block -->
				<!-- {#if errorMessage}
					<div role="alert" class="alert alert-error mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						<span>{errorMessage}</span>
					</div>
				{/if} -->

				<form use:enhance={handleSubmit} action="./login" method="post">
					<div class="form-control">
						<label class="label" for="username">
							<span class="label-text">Username</span>
						</label>
						<input
							type="text"
							id="username"
							name="username"
							placeholder="username"
							class="input input-bordered w-full"
							required
							disabled={isLoading}
						/>
					</div>

					<div class="form-control mt-4">
						<label class="label" for="password-input">
							<!-- Changed ID for the label to be more generic -->
							<span class="label-text">Password</span>
						</label>
						<div class="join w-full">
							{#if showPassword}
								<input
									type="text"
									id="password-input"
									name="password"
									placeholder="••••••••"
									class="input join-item input-bordered w-full"
									required
									minlength="6"
									disabled={isLoading}
								/>
							{:else}
								<input
									type="password"
									id="password-input"
									name="password"
									placeholder="••••••••"
									class="input join-item input-bordered w-full"
									required
									minlength="6"
									disabled={isLoading}
								/>
							{/if}
							<button
								type="button"
								class="btn btn-ghost join-item"
								on:click={() => (showPassword = !showPassword)}
								title={showPassword ? 'Hide password' : 'Show password'}
								disabled={isLoading}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{#if showPassword}
									<EyeOff size={20} />
								{:else}
									<Eye size={20} />
								{/if}
							</button>
						</div>
					</div>

					<div class="mt-4 flex items-center justify-between text-sm">
						<div class="form-control">
							<label class="label cursor-pointer gap-2">
								<input
									type="checkbox"
									bind:checked={rememberMe}
									class="checkbox-primary checkbox"
									disabled={isLoading}
								/>
								<span class="label-text">Remember me</span>
							</label>
						</div>
						<a href="/forgot-password" class="link-hover link link-primary">Forgot password?</a>
					</div>

					<div class="form-control mt-8">
						<button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
							{#if isLoading}
								<span class="loading loading-spinner"></span>
								Processing...
							{:else}
								Login
							{/if}
						</button>
					</div>
				</form>

				<!-- <p class="mt-6 text-center text-sm">
					Don't have an account?
					<a href="/register" class="link-hover link link-primary font-semibold">Sign up</a>
				</p> -->
			</div>
		</div>

		<!-- Optional: Footer links or theme switcher -->
		<div class="mt-8 text-center text-sm text-base-content/60">
			<p>© {new Date().getFullYear()} TDMI. All rights reserved.</p>
			<!-- Example Theme Switcher (very basic) -->
			<div class="mt-2">
				<label class="label inline-flex cursor-pointer gap-2">
					<span class="label-text">Toggle Dark Mode</span>
					<input
						type="checkbox"
						class="toggle toggle-primary"
						checked={true}
						on:change={(e) => {
							document.documentElement.setAttribute(
								'data-theme',
								e.currentTarget.checked ? 'dark' : 'light'
							);
						}}
					/>
				</label>
			</div>
		</div>
	</div>
</div>
