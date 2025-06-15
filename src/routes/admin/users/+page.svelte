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
	let users = data.users;
	let totalItems = data.totalItems;
	let loading = false;
	const pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig | undefined = undefined;
	let currentFilters: Record<string, any> = {};

	// --- Reactive Data from Props ---
	// to handle initial load and client-side navigation correctly.
	// $: users = (data.users || []).map((user) => ({
	// 	...user,
	// 	assignedRoles: user.assignedRoles || []
	// }));
	$: allRoles = data.allRoles || [];
	// $: totalItems = data.totalItems || 0;

	// This depends on `allRoles`, which is now reactive, so this pattern is correct.
	let columns: ColumnDef[] = [];
	$: if (allRoles.length > 0) {
		columns = [
			{ key: 'username', label: 'Username', sortable: true, filterable: 'text' },
			{
				key: 'assignedRoles',
				label: 'Roles',
				sortable: false,
				filterable: 'select',
				filterOptions: allRoles.map((role) => role.name),
				formatter: (value: string[]) =>
					value
						.map((roleId: string) => allRoles.find((r) => r.id === roleId)?.name || roleId)
						.join(', ') || 'No Roles'
			},
			{
				key: 'active',
				label: 'Status',
				sortable: true,
				filterable: 'select',
				filterOptions: ['Active', 'Inactive'],
				formatter: (value: boolean | null) => (value ? 'Active' : 'Inactive'),
				cellClass: (value: boolean | null) => (value ? 'text-success' : 'text-error')
			},
			{
				key: 'muridId',
				label: 'Murid ID',
				sortable: true,
				formatter: (value: number | null) =>
					value === null || value === 0 ? 'N/A' : value.toString()
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters, page, pageSize })
			});
			if (!response.ok) throw new Error('Failed to fetch users');

			const result = await response.json();

			// Sekarang kita menugaskan nilai ke variabel `let` biasa, tidak ada konflik.
			users = result.users;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (error) {
			console.error('Error fetching table data:', error);
		} finally {
			loading = false;
		}
	}

	async function handleSort(event: CustomEvent<SortConfig | null>) {
		currentSort = event.detail ?? undefined;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = { ...event.detail.columns, global: event.detail.global };
		await fetchTableData(currentSort, currentFilters, 1); // Reset ke halaman 1 saat filter
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
		<div class="mb-6 flex flex-wrap items-center justify-between space-y-2">
			<h1 class="card-title text-2xl">User Management</h1>
			<a href="/admin/users/new" class="btn btn-primary btn-sm"> Create New User </a>
		</div>
		{#key users}
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
		{/key}
	</div>
</div>
