<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance, applyAction } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { success, error } from '$lib/components/toast';
	import { Save, RefreshCw } from 'lucide-svelte';

	export let form: ActionData;
	export let data: PageData & { allMurids: { id: number; nama: string }[] };
	let isLoading: boolean = false;
	let username: string = data.userToEdit.username;
	let selectedRole: string = data.userToEdit.role;
	let isActive: boolean | null = data.userToEdit.active;
	let muridId: string =
		data.userToEdit.muridId === null || data.userToEdit.muridId === 0
			? ''
			: String(data.userToEdit.muridId);
	let newPassword: string = '';

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
				success('User updated successfully!');
			}

			// If result.type is 'success' or 'redirect', applyAction will handle it
			await applyAction(result);
		};
	}
	// Reactive assignments for form data on submission failure
	$: if (form && 'userId' in form) {
		// Check for a property that exists on the successful form data
		if (form.role !== undefined) selectedRole = form.role;
		if (form.active !== undefined) isActive = form.active;
		if (form.muridIdStr !== undefined) muridId = form.muridIdStr;
	}
</script>

<div class="flex justify-center">
	<div class="card w-full max-w-lg bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title mb-6 text-2xl">
				Edit User: <span class="text-primary">{data.userToEdit.username}</span>
			</h1>

			{#if form?.message}
				<div
					class="alert {form.message.toLowerCase().includes('fail') ||
					form.message.toLowerCase().includes('invalid') ||
					form.message.toLowerCase().includes('must be') ||
					form.message.toLowerCase().includes('taken')
						? 'alert-error'
						: 'alert-success'} mb-4 shadow-lg"
				>
					<div>
						{#if form.message.toLowerCase().includes('fail') || form.message
								.toLowerCase()
								.includes('invalid') || form.message
								.toLowerCase()
								.includes('must be') || form.message.toLowerCase().includes('taken')}
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
						required
						minlength="3"
						maxlength="16"
						class="input input-bordered w-full"
						bind:value={username}
					/>
				</div>

				<div class="form-control">
					{#if newPassword}
						<input
							type="hidden"
							id="password"
							name="password"
							minlength="6"
							class="input input-bordered w-full"
							bind:value={newPassword}
						/>
					{/if}
					<!-- Button to reset password -->
					<button
						type="button"
						class="btn btn-secondary btn-sm mb-2"
						on:click={() => {
							if (!confirm('Are you sure you want to reset the password?')) return;
							newPassword = '123456';
							success('Password has been reset successfully.');
						}}
					>
						Reset Password
					</button>
				</div>

				<div class="form-control">
					<label class="label" for="role">
						<span class="label-text">Role</span>
					</label>
					<select
						id="role"
						name="role"
						required
						class="select select-bordered w-full"
						bind:value={selectedRole}
					>
						{#each data.availableRoles as roleOption}
							<option value={roleOption}>{roleOption}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label" for="muridId">
						<span class="label-text">Murid (optional)</span>
					</label>
					<select
						id="muridId"
						name="muridId"
						class="select select-bordered w-full"
						bind:value={muridId}
					>
						<option value="">Select Murid</option>
						{#each data.allMurids as muridOption}
							<option value={muridOption.id}>{muridOption.nama}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-2">
						<input
							type="checkbox"
							id="active"
							name="active"
							class="checkbox-primary checkbox"
							bind:checked={isActive}
						/>
						<span class="label-text">Active</span>
					</label>
				</div>

				<div class="card-actions justify-end pt-4">
					<a href="/admin/users" class="btn btn-ghost">
						<!-- <IconCancel class="w-5 h-5 mr-2" /> -->
						Cancel
					</a>
					<button type="submit" class="btn btn-primary">
						{#if isLoading}
							<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
						{:else}
							<Save class="mr-2 h-5 w-5" />
						{/if}
						Update User
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
