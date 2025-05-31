<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig } from '$lib/components/SuperTable/types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let loading = false;
	let users = data.users;
	let totalItems = data.users.length;
	let currentPage = 1;
	const pageSize = 10;

	// Track current state
	let currentSort: SortConfig | undefined = undefined;
	let currentFilters: Record<string, any> = {};

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

	async function fetchTableData(
		sort?: SortConfig | null,
		filters?: Record<string, any>,
		page: number = 1
	) {
		loading = true;
		try {
			const response = await fetch('/admin/users/table', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					sort,
					filters,
					page,
					pageSize
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch users');
			}

			const result = await response.json();
			users = result.users;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			loading = false;
		}
	}

	async function handleSort(event: CustomEvent<SortConfig | null>) {
		currentSort = event.detail ?? undefined;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(
		event: CustomEvent<{ column: ColumnDef; value: any; columnKey: string }>
	) {
		const { value, columnKey } = event.detail;
		currentFilters = { ...currentFilters, [columnKey]: value };
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

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

		{#if loading}
			<div class="flex justify-center py-8">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{:else if users && users.length > 0}
			<SuperTable
				data={users}
				{columns}
				rowKey="id"
				totalItemsProp={totalItems}
				itemsPerPageProp={pageSize}
				isLoadingProp={loading}
				initialSort={currentSort}
				on:sort={handleSort}
				on:filter={handleFilter}
				on:pageChange={handlePageChange}
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
		{:else}
			<div class="py-8 text-center">
				<p class="text-base-content/60">No users found</p>
			</div>
		{/if}
	</div>
</div>
