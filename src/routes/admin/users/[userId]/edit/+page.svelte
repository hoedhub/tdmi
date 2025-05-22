<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;
	export let data: PageData & { allMurids: { id: number; nama: string }[] };

	let username: string | undefined;
	let selectedRole: string | undefined;
	let isActive: boolean | null;
	let muridId: string | undefined;

	$: username = form?.username ?? data.userToEdit.username;
	$: selectedRole = form?.role ?? data.userToEdit.role;
	$: isActive = form?.active ?? data.userToEdit.active;
	$: muridId =
		form?.muridIdStr ??
		(data.userToEdit.muridId === null || data.userToEdit.muridId === 0
			? ''
			: String(data.userToEdit.muridId));
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

			<form method="POST" class="space-y-4">
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						minlength="3"
						maxlength="16"
						class="input input-bordered w-full"
						bind:value={username}
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">New Password (leave blank to keep current)</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						minlength="6"
						class="input input-bordered w-full"
					/>
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
						<!-- <IconSave class="w-5 h-5 mr-2" /> -->
						Update User
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
