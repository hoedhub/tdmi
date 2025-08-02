<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { success, error } from '$lib/components/toast';
	import {
		Save,
		RefreshCw,
		Plus,
		Trash2,
		Edit,
		X,
		Users,
		ShieldCheck,
		Key,
		ChevronsUpDown,
		RotateCcw
	} from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;

	// --- State ---
	let isLoading: { [key: string]: boolean } = {};
	let showRoleModal = false;
	let showRoleSelectorModal = false;
	let formRole = { id: '', name: '', description: '' };
	let selectedRoleId: string | null = null;
	let activeTab: 'permissions' | 'users' = 'permissions';

	// State untuk manajemen checkbox
	let initialPermissions: string[] = [];
	let currentPermissions: string[] = [];
	let initialUsers: string[] = [];
	let currentUsers: string[] = [];

	// State reaktif untuk mendeteksi perubahan
	let permissionsChanged = false;
	let usersChanged = false;

	// --- Reactive Computations ---
	$: formErrors = form?.errors as Record<string, unknown> | undefined;
	$: selectedRole = data.roles.find((r) => r.id === selectedRoleId);

	// Helper untuk membandingkan array (mengabaikan urutan)
	const areArraysEqual = (a: string[], b: string[]) => {
		if (a.length !== b.length) return false;
		const setA = new Set(a);
		for (const item of b) {
			if (!setA.has(item)) return false;
		}
		return true;
	};

	// Inisialisasi ulang dan deteksi perubahan saat peran atau data berubah
	$: {
		if (selectedRole) {
			// Inisialisasi untuk tab Izin
			initialPermissions = data.rolePermissionMap
				.filter((rpm) => rpm.roleId === selectedRole.id)
				.map((rpm) => rpm.permissionId);
			currentPermissions = [...initialPermissions];

			// Inisialisasi untuk tab Pengguna
			initialUsers = data.userRoleMap
				.filter((ur) => ur.roleId === selectedRole.id)
				.map((ur) => ur.userId);
			currentUsers = [...initialUsers];
		} else {
			// Jika tidak ada peran yang dipilih (misalnya setelah penghapusan), kosongkan state
			initialPermissions = [];
			currentPermissions = [];
			initialUsers = [];
			currentUsers = [];
		}
	}

	// Deteksi perubahan secara reaktif
	$: permissionsChanged = !areArraysEqual(initialPermissions, currentPermissions);
	$: usersChanged = !areArraysEqual(initialUsers, currentUsers);

	// --- Lifecycle ---
	onMount(() => {
		if (!selectedRoleId && data.roles.length > 0) {
			selectedRoleId = data.roles[0].id;
		}
	});

	// --- Functions ---
	function getFirstError(error: unknown): string {
		if (Array.isArray(error) && error.length > 0) {
			return error[0];
		}
		return String(error ?? '');
	}

	function openNewRoleModal() {
		formRole = { id: '', name: '', description: '' };
		form = null;
		showRoleSelectorModal = false;
		showRoleModal = true;
	}

	function openEditRoleModal(role: (typeof data.roles)[0]) {
		formRole = { ...role, description: role.description ?? '' };
		form = null;
		showRoleModal = true;
	}

	function closeModal() {
		showRoleModal = false;
	}

	function selectRole(roleId: string) {
		selectedRoleId = roleId;
		showRoleSelectorModal = false;
	}

	// --- Checkbox Management Functions ---
	const resetPermissions = () => (currentPermissions = [...initialPermissions]);
	const toggleAllPermissions = (e: Event & { currentTarget: HTMLInputElement }) =>
		(currentPermissions = e.currentTarget.checked ? data.permissions.map((p) => p.id) : []);
	const resetUsers = () => (currentUsers = [...initialUsers]);
	const toggleAllUsers = (e: Event & { currentTarget: HTMLInputElement }) =>
		(currentUsers = e.currentTarget.checked ? data.users.map((u) => u.id) : []);

	// --- Form Handling ---
	const enhanceForm = (loadingKey: string, dataType?: 'permissions' | 'users') => {
		return ({
			form,
			data: formData,
			cancel
		}: {
			form: HTMLFormElement;
			data: FormData;
			cancel: () => void;
		}) => {
			isLoading[loadingKey] = true;
			isLoading = { ...isLoading };

			// Intercept form data untuk memastikan data dari state yang dikirim
			if (dataType === 'permissions') {
				formData.delete('permissions');
				currentPermissions.forEach((id) => formData.append('permissions', id));
			} else if (dataType === 'users') {
				formData.delete('userIds');
				currentUsers.forEach((id) => formData.append('userIds', id));
			}

			return async ({
				result,
				update
			}: {
				result: any;
				update: (options?: { reset: boolean }) => Promise<void>;
			}) => {
				isLoading[loadingKey] = false;
				isLoading = { ...isLoading };

				if (result.type === 'success') {
					success(result.data?.message || 'Aksi berhasil.');
					if (result.data?.action === 'deleteRole') {
						selectedRoleId =
							data.roles.length > 1
								? (data.roles.find((r) => r.id !== selectedRoleId)?.id ?? null)
								: null;
					}
					await invalidateAll(); // Selalu muat ulang data untuk konsistensi
					closeModal();
				} else if (result.type === 'fail') {
					form = result.data;
				} else if (result.type === 'error') {
					error(result.error?.message ?? 'Terjadi kesalahan server.');
				}
				update({ reset: false });
			};
		};
	};
</script>

<div class="h-full p-4 md:p-6">
	<div class="flex flex-col gap-6 md:flex-row md:gap-8" style="height: calc(100vh - 8rem);">
		<!-- Panel Kiri (Desktop-only): Daftar Peran -->
		<aside class="card hidden w-full flex-col bg-base-200 shadow-lg md:flex md:w-1/3 lg:w-1/4">
			<div class="border-b border-base-300 p-4">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-lg">Peran</h2>
					<button
						class="btn btn-square btn-primary btn-sm"
						on:click={openNewRoleModal}
						aria-label="Buat Peran Baru"
					>
						<Plus class="h-4 w-4" />
					</button>
				</div>
			</div>
			<div class="flex-grow overflow-y-auto">
				<ul class="menu p-4">
					{#each data.roles as role (role.id)}
						<li>
							<a
								href={'#'}
								class:active={selectedRoleId === role.id}
								on:click|preventDefault={() => selectRole(role.id)}
							>
								<ShieldCheck class="h-4 w-4" />
								{role.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</aside>

		<!-- Panel Kanan: Detail Peran -->
		<main class="card flex w-full flex-col bg-base-100 shadow-lg">
			<!-- Header (Mobile-only): Role Selector -->
			<div class="border-b border-base-300 p-4 md:hidden">
				<button
					class="btn btn-outline w-full justify-between"
					on:click={() => (showRoleSelectorModal = true)}
				>
					<span>{selectedRole?.name ?? 'Pilih Peran'}</span>
					<ChevronsUpDown class="h-4 w-4" />
				</button>
			</div>

			{#if selectedRole}
				<div class="card-body overflow-y-auto" transition:slide|local>
					<!-- Header Detail Peran -->
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h1 class="text-3xl font-bold">{selectedRole.name}</h1>
							<p class="mt-1 text-sm opacity-60">{selectedRole.description}</p>
						</div>
						<div class="flex flex-shrink-0 gap-2">
							<button
								class="btn btn-square btn-ghost btn-sm"
								on:click={() => openEditRoleModal(selectedRole)}
								aria-label="Edit Peran"
							>
								<Edit class="h-4 w-4" />
							</button>
							<form
								method="POST"
								action="?/deleteRole"
								use:enhance={enhanceForm(`delete-${selectedRole.id}`)}
								on:submit|preventDefault={(e) => {
									if (!confirm(`Yakin ingin menghapus peran "${selectedRole.name}"?`))
										e.preventDefault();
								}}
							>
								<input type="hidden" name="id" value={selectedRole.id} />
								<button
									type="submit"
									class="btn btn-square btn-ghost btn-sm text-error"
									disabled={isLoading[`delete-${selectedRole.id}`]}
									aria-label="Hapus Peran"
								>
									<Trash2 class="h-4 w-4" />
								</button>
							</form>
						</div>
					</div>

					<!-- Navigasi Tab -->
					<div role="tablist" class="tabs tabs-bordered">
						<button
							role="tab"
							class="tab"
							class:tab-active={activeTab === 'permissions'}
							on:click={() => (activeTab = 'permissions')}
						>
							<Key class="mr-2 h-4 w-4" />
							Izin
							<div class="badge badge-sm ml-2">{initialPermissions.length}</div>
						</button>
						<button
							role="tab"
							class="tab"
							class:tab-active={activeTab === 'users'}
							on:click={() => (activeTab = 'users')}
						>
							<Users class="mr-2 h-4 w-4" />
							Pengguna
							<div class="badge badge-sm ml-2">{initialUsers.length}</div>
						</button>
					</div>

					<!-- Konten Tab -->
					<div class="py-6">
						{#if activeTab === 'permissions'}
							<form
								method="POST"
								action="?/updateRolePermissions"
								use:enhance={enhanceForm(`perms-${selectedRole.id}`, 'permissions')}
							>
								<input type="hidden" name="roleId" value={selectedRole.id} />
								<h3 class="mb-4 text-lg font-semibold">Izin untuk Peran Ini</h3>

								<!-- Kontrol Checkbox -->
								<div class="mb-4 flex items-center gap-4 rounded-lg bg-base-200 p-2">
									<label class="label cursor-pointer space-x-2">
										<input
											type="checkbox"
											class="checkbox checkbox-sm"
											checked={data.permissions.length > 0 &&
												currentPermissions.length === data.permissions.length}
											on:change={toggleAllPermissions}
										/>
										<span class="label-text text-xs font-semibold">Pilih Semua</span>
									</label>
									<button
										type="button"
										class="btn btn-ghost btn-xs"
										on:click={resetPermissions}
										disabled={!permissionsChanged}
									>
										<RotateCcw class="mr-1 h-3 w-3" /> Reset
									</button>
								</div>

								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{#each data.permissions as perm (perm.id)}
										<label
											class="label cursor-pointer justify-start space-x-3 rounded-lg p-2 hover:bg-base-200"
										>
											<input
												type="checkbox"
												class="checkbox"
												value={perm.id}
												checked={currentPermissions.includes(perm.id)}
												on:change={() => {
													if (currentPermissions.includes(perm.id)) {
														currentPermissions = currentPermissions.filter((p) => p !== perm.id);
													} else {
														currentPermissions = [...currentPermissions, perm.id];
													}
												}}
											/>
											<span class="label-text flex flex-col">
												<span>{perm.name}</span>
												<span class="text-xs opacity-60">{perm.description}</span>
											</span>
										</label>
									{/each}
								</div>
								<div class="card-actions mt-6 justify-end">
									<button
										type="submit"
										class="btn btn-primary"
										disabled={isLoading[`perms-${selectedRole.id}`]}
									>
										{#if isLoading[`perms-${selectedRole.id}`]}<RefreshCw
												class="h-4 w-4 animate-spin"
											/>{:else}<Save class="h-4 w-4" />{/if}
										Simpan Izin
									</button>
								</div>
							</form>
						{:else if activeTab === 'users'}
							<form
								method="POST"
								action="?/updateUsersForRole"
								use:enhance={enhanceForm(`users-${selectedRole.id}`, 'users')}
							>
								<input type="hidden" name="roleId" value={selectedRole.id} />
								<h3 class="mb-4 text-lg font-semibold">Pengguna dengan Peran Ini</h3>

								<!-- Kontrol Checkbox -->
								<div class="mb-4 flex items-center gap-4 rounded-lg bg-base-200 p-2">
									<label class="label cursor-pointer space-x-2">
										<input
											type="checkbox"
											class="checkbox checkbox-sm"
											checked={data.users.length > 0 && currentUsers.length === data.users.length}
											on:change={toggleAllUsers}
										/>
										<span class="label-text text-xs font-semibold">Pilih Semua</span>
									</label>
									<button
										type="button"
										class="btn btn-ghost btn-xs"
										on:click={resetUsers}
										disabled={!usersChanged}
									>
										<RotateCcw class="mr-1 h-3 w-3" /> Reset
									</button>
								</div>

								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{#each data.users as user (user.id)}
										<label
											class="label cursor-pointer justify-start space-x-3 rounded-lg p-2 hover:bg-base-200"
										>
											<input
												type="checkbox"
												class="checkbox"
												value={user.id}
												checked={currentUsers.includes(user.id)}
												on:change={() => {
													if (currentUsers.includes(user.id)) {
														currentUsers = currentUsers.filter((u) => u !== user.id);
													} else {
														currentUsers = [...currentUsers, user.id];
													}
												}}
											/>
											<span class="label-text">{user.username}</span>
										</label>
									{/each}
								</div>
								<div class="card-actions mt-6 justify-end">
									<button
										type="submit"
										class="btn btn-primary"
										disabled={isLoading[`users-${selectedRole.id}`]}
									>
										{#if isLoading[`users-${selectedRole.id}`]}<RefreshCw
												class="h-4 w-4 animate-spin"
											/>{:else}<Save class="h-4 w-4" />{/if}
										Simpan Keanggotaan
									</button>
								</div>
							</form>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex h-full flex-col items-center justify-center p-10 text-center">
					<h2 class="text-2xl font-bold">Pilih atau Buat Peran</h2>
					<p class="mt-2 opacity-70">
						Gunakan tombol di atas untuk memilih peran yang ada atau buat peran baru untuk memulai.
					</p>
				</div>
			{/if}
		</main>
	</div>
</div>

<!-- Modal (Mobile-only): Role Selector -->
{#if showRoleSelectorModal}
	<div class="modal modal-open">
		<div class="modal-box flex h-5/6 w-11/12 max-w-5xl flex-col">
			<div class="mb-4 flex flex-shrink-0 items-center justify-between">
				<h3 class="text-lg font-bold">Pilih Peran</h3>
				<button
					class="btn btn-circle btn-ghost btn-sm"
					on:click={() => (showRoleSelectorModal = false)}><X /></button
				>
			</div>
			<div class="-mx-6 flex-grow overflow-y-auto">
				<ul class="menu px-6">
					{#each data.roles as role (role.id)}
						<li>
							<a href={'#'} on:click|preventDefault={() => selectRole(role.id)}>
								<ShieldCheck />
								{role.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
			<div class="modal-action flex-shrink-0">
				<button class="btn btn-primary w-full" on:click={openNewRoleModal}>
					<Plus class="h-4 w-4" /> Buat Peran Baru
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Create/Edit Role -->
{#if showRoleModal}
	<div class="modal modal-open" transition:slide>
		<div class="modal-box">
			<button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" on:click={closeModal}
				><X /></button
			>
			<h3 class="text-lg font-bold">
				{#if formRole.id}Edit Peran{:else}Buat Peran Baru{/if}
			</h3>
			<form
				method="POST"
				action={formRole.id ? `?/updateRole` : `?/createRole`}
				use:enhance={enhanceForm(formRole.id ? `edit-${formRole.id}` : 'create-role')}
				class="space-y-4 py-4"
			>
				<input type="hidden" name="id" value={formRole.id} />
				<div class="form-control">
					<label for="role-id" class="label"
						><span class="label-text">Role ID (unik, tanpa spasi)</span></label
					>
					<input
						type="text"
						id="role-id"
						name="id"
						class="input input-bordered w-full"
						class:input-error={!!formErrors?.id}
						bind:value={formRole.id}
						readonly={!!formRole.id}
						required
					/>
					{#if formErrors?.id}<span class="mt-1 text-xs text-error"
							>{getFirstError(formErrors.id)}</span
						>{/if}
				</div>
				<div class="form-control">
					<label for="role-name" class="label"><span class="label-text">Nama Tampilan</span></label>
					<input
						type="text"
						id="role-name"
						name="name"
						class="input input-bordered w-full"
						class:input-error={!!form?.errors?.name}
						bind:value={formRole.name}
						required
					/>
					{#if form?.errors?.name}<span class="mt-1 text-xs text-error"
							>{Array.isArray(form.errors.name) ? form.errors.name[0] : form.errors.name}</span
						>{/if}
				</div>
				<div class="form-control">
					<label for="role-desc" class="label"><span class="label-text">Deskripsi</span></label>
					<textarea
						id="role-desc"
						name="description"
						class="textarea textarea-bordered w-full"
						bind:value={formRole.description}
					></textarea>
				</div>
				<div class="modal-action">
					<button type="button" class="btn btn-ghost" on:click={closeModal}>Batal</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={isLoading[formRole.id ? `edit-${formRole.id}` : 'create-role']}
					>
						{#if isLoading[formRole.id ? `edit-${formRole.id}` : 'create-role']}<RefreshCw
								class="h-4 w-4 animate-spin"
							/>{:else}<Save class="h-4 w-4" />{/if}
						Simpan
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
