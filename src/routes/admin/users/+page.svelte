<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	// Optional: For icons if you add them
	// import IconEdit from '~icons/mdi/edit';
	// import IconDelete from '~icons/mdi/delete';
	// import IconPlus from '~icons/mdi/plus-circle-outline';

	export let data: PageData;

	async function handleDeleteUser(userId: string, username: string) {
		// DaisyUI modal for confirmation would be a nice upgrade here
		// For now, standard confirm:
		if (
			confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)
		) {
			const response = await fetch(`/admin/users/${userId}/delete`, {
				method: 'POST'
			});

			if (response.ok) {
				// You might want a toast notification here with DaisyUI
				alert('User deleted successfully.');
				invalidateAll();
			} else {
				try {
					const result = await response.json();
					alert(`Failed to delete user: ${result.message || response.statusText}`);
				} catch {
					alert(`Failed to delete user: ${response.statusText}`);
				}
			}
		}
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="card-title text-2xl">User Management</h1>
			<a href="/admin/users/new" class="btn btn-primary">
				<!-- <IconPlus class="w-5 h-5 mr-2" /> uncomment if using icons -->
				Create New User
			</a>
		</div>

		{#if data.users && data.users.length > 0}
			<div class="overflow-x-auto">
				<table class="table table-zebra w-full">
					<thead>
						<tr>
							<th></th>
							<th>Username</th>
							<th>Role</th>
							<th>Active</th>
							<th>Murid ID</th>
							<th>Created At</th>
							<th class="text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.users as user, i (user.id)}
							<tr>
								<th>{i + 1}</th>
								<td>{user.username}</td>
								<td><span class="badge badge-ghost badge-sm">{user.role}</span></td>
								<td>
									{#if user.active}
										<span class="badge badge-success badge-sm">Yes</span>
									{:else}
										<span class="badge badge-error badge-sm">No</span>
									{/if}
								</td>
								<td>{user.muridId === 0 ? 'N/A' : user.muridId}</td>
								<td>{new Date(user.createdAt).toLocaleDateString()}</td>
								<td class="space-x-2 text-right">
									<a href={`/admin/users/${user.id}/edit`} class="btn btn-outline btn-info btn-sm">
										<!-- <IconEdit /> -->
										Edit
									</a>
									{#if user.id !== data.user?.id}
										<button
											on:click={() => handleDeleteUser(user.id, user.username)}
											class="btn btn-outline btn-error btn-sm"
										>
											<!-- <IconDelete /> -->
											Delete
										</button>
									{:else}
										<button class="btn btn-disabled btn-sm">Delete</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if data.users}
			<div class="alert alert-info shadow-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="h-6 w-6 shrink-0 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path></svg
					>
					<span>No users found.</span>
				</div>
			</div>
		{/if}
	</div>
</div>
