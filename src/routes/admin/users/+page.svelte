<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { Pen, Trash } from 'lucide-svelte';

	// --- Type Definitions ---
	interface Role {
		id: string;
		name: string;
		description: string | null; // <-- Disesuaikan karena bisa null dari DB
	}

	interface User {
		id: string;
		username: string;
		active: boolean | null; // <-- Disesuaikan karena bisa null dari DB
		muridId: number | null; // <-- Disesuaikan karena bisa null dari DB
		createdAt: string; // <-- Disesuaikan karena bisa null dari DB
	}

	interface ExtendedPageData extends PageData {
		users: (User & { assignedRoles: string[] })[];
		allRoles: Role[];
		roleHierarchy: { parentRoleId: string; childRoleId: string }[];
	}

	export let data: ExtendedPageData;
	export let form: { success?: boolean; message?: string } | null;

	let loading = false;
	const pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig | undefined = undefined;
	let currentFilters: Record<string, any> = {};

	// --- Reactive Data from Props ---
	// to handle initial load and client-side navigation correctly.
	$: users = (data.users || []).map((user) => ({
		...user,
		assignedRoles: user.assignedRoles || []
	}));
	$: allRoles = data.allRoles || [];
	$: totalItems = data.totalItems || 0;

	// This depends on `allRoles`, which is now reactive, so this pattern is correct.
	let columns: ColumnDef[] = [];
	$: if (allRoles.length > 0) {
		columns = [
			{
				key: 'username',
				label: 'Username',
				sortable: true,
				filterable: 'text'
			},
			{
				key: 'assignedRoles',
				label: 'Roles',
				sortable: false,
				filterable: 'select',
				filterOptions: allRoles.map((role) => role.name),
				formatter: (value: string[]) =>
					value
						.map((roleId: string) => {
							const role = allRoles.find((r) => r.id === roleId);
							return role ? role.name : roleId;
						})
						.join(', ') || 'No Roles'
			},
			{
				key: 'active',
				label: 'Status',
				sortable: true,
				filterable: 'select',
				filterOptions: ['Active', 'Inactive'],
				formatter: (value: boolean) => (value ? 'Active' : 'Inactive'),
				cellClass: (value: boolean) => (value ? 'text-success' : 'text-error')
			},
			{
				key: 'muridId',
				label: 'Murid ID',
				sortable: true,
				formatter: (value: number | null) => {
					if (value === null || value === 0) {
						return 'N/A';
					}
					return value.toString();
				}
			},
			{
				key: 'createdAt',
				label: 'Created At',
				sortable: true,
				formatter: (value: string) => new Date(value).toLocaleDateString()
			}
		];
	}

	// --- Functions ---
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
			if (!response.ok) throw new Error('Failed to fetch users');
			const result = await response.json();
			// No need to update `users` here reactively, Svelte will do it when `data` changes
			// but for server-side tables, you must update the local state.
			users = result.users.map((user: User & { assignedRoles: string[] }) => ({
				...user,
				assignedRoles: user.assignedRoles || []
			}));
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

	async function handleFilter(event: CustomEvent<FilterState>) {
		event.preventDefault();
		const newFilters: Record<string, any> = {};
		if (event.detail.global) {
			newFilters.global = event.detail.global;
		}
		Object.entries(event.detail.columns).forEach(([key, value]) => {
			if (value) {
				newFilters[key] = value;
			}
		});
		currentFilters = newFilters;
		await fetchTableData(currentSort, currentFilters, 1); // Reset to page 1 on filter
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
				const result = await response.json().catch(() => ({ message: response.statusText }));
				alert(`Failed to delete user: ${result.message}`);
			}
		}
	}

	// --- Reactive Statements ---
	$: if (form?.success) {
		alert(form.message);
		invalidateAll();
	} else if (form?.message && !form?.success) {
		alert(form.message);
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="card-title text-2xl">User Management</h1>
			<a href="/admin/users/new" class="btn btn-primary"> Create New User </a>
		</div>

		<SuperTable
			data={users}
			{columns}
			rowKey="id"
			itemsPerPage={pageSize}
			{totalItems}
			isLoading={loading}
			initialSort={currentSort}
			serverSide={true}
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
						<Pen class="h-4 w-4" />
					</a>
					{#if row.id !== data.user?.id}
						<button
							class="btn btn-ghost btn-sm text-error"
							on:click|stopPropagation={() => handleDeleteUser(row.id, row.username)}
						>
							<Trash class="h-4 w-4" />
						</button>
					{:else}
						<button class="btn btn-disabled btn-sm"><Trash class="h-4 w-4" /></button>
					{/if}
				</div>
			</svelte:fragment>
		</SuperTable>
	</div>
</div>
