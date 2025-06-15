<script lang="ts">
	import type { PageData as SvelteKitPageData, ActionData } from './$types';
	import { enhance, applyAction } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { success, error } from '$lib/components/toast';
	import { Save, RefreshCw } from 'lucide-svelte';

	type FormActionData = {
		username?: string;
		selectedRoles?: string[];
		active?: boolean;
		muridIdStr?: string;
		message?: string;
		userId?: string;
	} | null; // Izinkan 'null' untuk state awal

	interface RoleHierarchyLink {
		parentRoleId: string;
		childRoleId: string;
	}
	interface RoleOption {
		id: string;
		name: string;
		description: string | null;
	}
	interface MuridOption {
		id: number;
		nama: string;
	}

	// Tipe PageData lengkap yang cocok dengan return dari server
	interface PageData extends SvelteKitPageData {
		allAvailableRoles: RoleOption[];
		allMurids: MuridOption[];
		roleHierarchy: RoleHierarchyLink[]; // <-- TAMBAHKAN INI
	}

	export let data: PageData;
	export let form: FormActionData;
	let isLoading: boolean = false;

	let username: string = form?.username || '';
	let selectedRoles: string[] = form?.selectedRoles || [];
	let isActive: boolean | null = form?.active ?? true; // Defaultnya aktif
	let muridId: string = form?.muridIdStr || '';
	let password: string = '123456'; // Password field

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
				console.log('User creation successful:', result);
				success('User created successfully!');
			}

			// If result.type is 'success' or 'redirect', applyAction will handle it
			await applyAction(result);
		};
	}
	// Reactive assignments for form data on submission failure
	$: if (form && 'userId' in form) {
		// Check for a property that exists on the successful form data
		if (form.username !== undefined) username = form.username;
		if (form.selectedRoles !== undefined) selectedRoles = form.selectedRoles;
		if (form.active !== undefined) isActive = form.active;
		if (form.muridIdStr !== undefined) muridId = form.muridIdStr;
	}
	// Buat daftar nama peran yang dipilih saat ini (akan berubah-ubah)
	let currentSelectedRoleNames: string[] = [];
	$: currentSelectedRoleNames = selectedRoles
		.map((roleId) => data.allAvailableRoles.find((r) => r.id === roleId)?.name)
		.filter(Boolean) as string[];

	$: roleHierarchy = data.roleHierarchy || [];

	function getDirectChildren(parentRoleId: string): string[] {
		return roleHierarchy
			.filter((link) => link.parentRoleId === parentRoleId)
			.map((link) => link.childRoleId);
	}

	function getDirectParent(childRoleId: string): string | undefined {
		const parentLink = roleHierarchy.find((link) => link.childRoleId === childRoleId);
		return parentLink?.parentRoleId;
	}

	function handleRoleSelection(roleId: string, isChecked: boolean) {
		if (isChecked) {
			selectedRoles = [...selectedRoles, roleId];
			const children = getDirectChildren(roleId);
			if (children.length > 0) {
				selectedRoles = selectedRoles.filter((id) => !children.includes(id));
			}
			const parent = getDirectParent(roleId);
			if (parent && selectedRoles.includes(parent)) {
				selectedRoles = selectedRoles.filter((id) => id !== parent);
			}
		} else {
			selectedRoles = selectedRoles.filter((id) => id !== roleId);
		}
	}

	$: isRoleDisabled = (currentRoleId: string): boolean => {
		if (selectedRoles.includes(currentRoleId)) {
			return false;
		}
		const parent = getDirectParent(currentRoleId);
		if (parent && selectedRoles.includes(parent)) {
			return true;
		}
		const children = getDirectChildren(currentRoleId);
		for (const childId of children) {
			if (selectedRoles.includes(childId)) {
				return true;
			}
		}
		return false;
	};

	let isRoleModalOpen = false;
	function openRoleManagement() {
		isRoleModalOpen = true;
	}
	function closeRoleManagement() {
		isRoleModalOpen = false;
	}
</script>

<div class="flex justify-center">
	<div class="card w-full max-w-lg bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title mb-6 text-2xl">Create New User</h1>

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
				<!-- Username & Password Reset tidak perlu diubah -->
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						class="input input-bordered w-full"
						bind:value={username}
					/>
				</div>
				<div class="form-control">
					<label class="label" for="password"><span class="label-text">Password</span></label>
					<input
						type="password"
						id="password"
						name="password"
						readonly
						required
						minlength="6"
						class="input input-bordered w-full"
						bind:value={password}
					/>
				</div>

				<div class="form-control">
					<div class="label">
						<span class="label-text">Roles</span>
					</div>

					<!-- Tampilkan peran yang dipilih saat ini sebagai badge -->
					<div class="flex min-h-12 flex-wrap items-center gap-2 rounded-lg bg-base-200 p-2">
						{#if currentSelectedRoleNames.length > 0}
							{#each currentSelectedRoleNames as roleName}
								<div class="badge badge-primary">{roleName}</div>
							{/each}
						{:else}
							<span class="px-2 text-sm text-base-content/60">Tidak ada peran dipilih</span>
						{/if}
					</div>

					<!-- Tombol untuk membuka modal -->
					<button type="button" class="btn btn-outline btn-sm mt-2" on:click={openRoleManagement}>
						Manage Roles
					</button>

					<!-- PENTING: Input tersembunyi untuk mengirim data peran -->
					{#each selectedRoles as roleId (roleId)}
						<input type="hidden" name="roles" value={roleId} />
					{/each}
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

				<!-- Tombol-tombol tidak perlu diubah -->
				<div class="card-actions justify-end pt-4">
					<a href="/admin/users" class="btn btn-ghost">Cancel</a>
					<button type="submit" class="btn btn-primary" disabled={isLoading}>
						{#if isLoading}
							<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
						{:else}
							<Save class="mr-2 h-5 w-5" />
						{/if}
						Create User
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
{#if isRoleModalOpen}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-lg">
			<h3 class="text-lg font-bold">Manage Roles for {username}</h3>
			<p class="py-4">Pilih peran untuk pengguna ini.</p>

			<!-- Tidak ada <form> di sini, karena kita hanya memodifikasi state -->
			<div class="form-control max-h-60 overflow-y-auto rounded-lg border bg-base-200 p-4">
				{#each data.allAvailableRoles as role (role.id)}
					<label class="label cursor-pointer justify-start gap-4">
						<input
							type="checkbox"
							name="modal_roles"
							value={role.id}
							class="checkbox-primary checkbox"
							checked={selectedRoles.includes(role.id)}
							disabled={isRoleDisabled(role.id)}
							on:change={(e) => handleRoleSelection(role.id, e.currentTarget.checked)}
						/>
						<span class="label-text">{role.name}</span>
					</label>
				{/each}
			</div>

			<div class="modal-action">
				<button type="button" class="btn" on:click={closeRoleManagement}>Done</button>
			</div>
		</div>
	</div>
{/if}
