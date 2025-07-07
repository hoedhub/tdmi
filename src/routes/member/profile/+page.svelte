<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance, applyAction } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { success, error } from '$lib/components/toast';
	import { Save, RefreshCw, Eye, EyeOff } from 'lucide-svelte';

	export let form: ActionData;
	export let data: PageData;
	let isLoading: boolean = false;

	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	let showCurrentPassword = false;
	let showNewPassword = false;
	let showConfirmPassword = false;

	async function handleSubmit() {
		if (isLoading) return;
		isLoading = true;

		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'error') {
				isLoading = false;
				error(result.error?.message || 'An unknown error occurred.', { duration: 5000 });
				return;
			}

			if (result.type === 'success') {
				success(result.data?.message || 'Password updated successfully!');
				// Clear password fields on success
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			}

			isLoading = false;
			await applyAction(result);
		};
	}
</script>

<div class="flex justify-center">
	<div class="card w-full max-w-lg bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title mb-6 text-2xl">
				Edit Profile: <span class="text-primary">{data.userToEdit.username}</span>
			</h1>

			{#if form?.message}
				<div
					class="alert {form.message.toLowerCase().includes('fail') ||
					form.message.toLowerCase().includes('invalid') ||
					form.message.toLowerCase().includes('must be') ||
					form.message.toLowerCase().includes('match')
						? 'alert-error'
						: 'alert-success'} mb-4 shadow-lg"
				>
					<div>
						{#if form.message.toLowerCase().includes('fail') || form.message
								.toLowerCase()
								.includes('invalid') || form.message
								.toLowerCase()
								.includes('must be') || form.message.toLowerCase().includes('match')}
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
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 shrink-0 stroke-current"
								fill="none"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
						{/if}
						<span>{form.message}</span>
					</div>
				</div>
			{/if}

			<form method="POST" class="space-y-4" use:enhance={handleSubmit}>
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input
						type="text"
						id="username"
						name="username"
						readOnly={true}
						class="input input-bordered w-full"
						value={data.userToEdit.username}
					/>
				</div>

				<h2 class="mb-6 text-xl font-semibold">Change Password</h2>

				<div class="form-control">
					<label for="current-password" class="label">
						<span class="label-text">Current Password</span>
					</label>
					<div class="relative">
						{#if showCurrentPassword}
							<input
								type="text"
								id="current-password"
								name="currentPassword"
								class="input input-bordered w-full pr-10"
								required
								bind:value={currentPassword}
							/>
						{:else}
							<input
								type="password"
								id="current-password"
								name="currentPassword"
								class="input input-bordered w-full pr-10"
								required
								bind:value={currentPassword}
							/>
						{/if}
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3"
							on:click={() => (showCurrentPassword = !showCurrentPassword)}
						>
							{#if showCurrentPassword}
								<EyeOff class="h-5 w-5 text-gray-500" />
							{:else}
								<Eye class="h-5 w-5 text-gray-500" />
							{/if}
						</button>
					</div>
				</div>

				<div class="form-control">
					<label for="new-password" class="label">
						<span class="label-text">New Password</span>
					</label>
					<div class="relative">
						{#if showNewPassword}
							<input
								type="text"
								id="new-password"
								name="newPassword"
								class="input input-bordered w-full pr-10"
								required
								bind:value={newPassword}
							/>
						{:else}
							<input
								type="password"
								id="new-password"
								name="newPassword"
								class="input input-bordered w-full pr-10"
								required
								bind:value={newPassword}
							/>
						{/if}
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3"
							on:click={() => (showNewPassword = !showNewPassword)}
						>
							{#if showNewPassword}
								<EyeOff class="h-5 w-5 text-gray-500" />
							{:else}
								<Eye class="h-5 w-5 text-gray-500" />
							{/if}
						</button>
					</div>
				</div>

				<div class="form-control">
					<label for="confirm-password" class="label">
						<span class="label-text">Confirm New Password</span>
					</label>
					<div class="relative">
						{#if showConfirmPassword}
							<input
								type="text"
								id="confirm-password"
								name="confirmPassword"
								class="input input-bordered w-full pr-10"
								required
								bind:value={confirmPassword}
							/>
						{:else}
							<input
								type="password"
								id="confirm-password"
								name="confirmPassword"
								class="input input-bordered w-full pr-10"
								required
								bind:value={confirmPassword}
							/>
						{/if}
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3"
							on:click={() => (showConfirmPassword = !showConfirmPassword)}
						>
							{#if showConfirmPassword}
								<EyeOff class="h-5 w-5 text-gray-500" />
							{:else}
								<Eye class="h-5 w-5 text-gray-500" />
							{/if}
						</button>
					</div>
				</div>

				<div class="card-actions justify-end pt-4">
					<button type="submit" class="btn btn-primary">
						{#if isLoading}
							<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
						{:else}
							<Save class="mr-2 h-5 w-5" />
						{/if}
						Change Password
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
