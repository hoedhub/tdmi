<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef } from '$lib/components/SuperTable/types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const columns: ColumnDef[] = [
		{
			key: 'username',
			label: 'Username',
			sortable: true,
			filterable: 'text'
		},
		{
			key: 'role',
			label: 'Role',
			sortable: true,
			filterable: 'select',
			filterOptions: ['admin', 'un', 'uf', 'tamu']
		},
		{
			key: 'active',
			label: 'Status',
			sortable: true,
			filterable: 'select',
			filterOptions: ['Active', 'Inactive'],
			formatter: (value) => (value ? 'Active' : 'Inactive'),
			cellClass: (value) => (value ? 'text-success' : 'text-error')
		},
		{
			key: 'muridId',
			label: 'Murid ID',
			sortable: true,
			formatter: (value) => (value === 0 ? 'N/A' : value.toString())
		},
		{
			key: 'createdAt',
			label: 'Created At',
			sortable: true,
			formatter: (value) => new Date(value).toLocaleDateString()
		}
	];

	async function handleDeleteUser(userId: string, username: string) {
		if (userId === data.user?.id) {
			alert('You cannot delete your own account.');
			return;
		}

		if (
			confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)
		) {
			const response = await fetch(`/admin/users/${userId}/delete`, {
				method: 'POST'
			});

			if (response.ok) {
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
			<a href="/admin/users/new" class="btn btn-primary"> Create New User </a>
		</div>

		{#if data.users && data.users.length > 0}
			<SuperTable
				data={data.users}
				{columns}
				rowKey="id"
				on:rowClick={({ detail }) => goto(`/admin/users/${detail.id}/edit`)}
			>
				<svelte:fragment slot="row-actions" let:row>
					<div class="flex gap-2">
						<a
							href={`/admin/users/${row.id}/edit`}
							class="btn btn-ghost btn-sm"
							on:click|stopPropagation={() => {}}
						>
							Edit
						</a>
						{#if row.id !== data.user?.id}
							<button
								class="btn btn-ghost btn-sm text-error"
								on:click|stopPropagation={() => handleDeleteUser(row.id, row.username)}
							>
								Delete
							</button>
						{:else}
							<button class="btn btn-disabled btn-sm">Delete</button>
						{/if}
					</div>
				</svelte:fragment>
			</SuperTable>
		{:else if data.users}
			<div class="alert alert-info shadow-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="h-6 w-6 shrink-0 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>No users found.</span>
				</div>
			</div>
		{/if}
	</div>
</div>
