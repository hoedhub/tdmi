<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { Pen, Trash } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api'; // <-- Use centralized API helper
	import { success as toastSuccess, error as toastError, warning as toastWarning } from '$lib/components/toast'; // <-- Use centralized toast

	// --- Type Definitions ---
	interface Role {
		id: string;
		name: string;
		description: string | null;
	}

	interface User {
		id: string;
		username: string;
		active: boolean | null;
		muridId: number | null;
		createdAt: string;
	}

	// Remove 'extends PageData' and define all fields explicitly
	interface ExtendedPageData {
		users: (User & { assignedRoles: string[] })[];
		allRoles: Role[];
		roleHierarchy: { parentRoleId: string; childRoleId: string }[];
		totalItems: number;
		user: User;
		canAccessAdmin?: boolean;
		canAccessPendataan?: boolean;
	}

	export let data: ExtendedPageData;
	export let form: { success?: boolean; message?: string } | null;

	let users = data.users;
	let allRoles = data.allRoles;
	let totalItems = data.totalItems;
	let loading = true;
	let pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig[] | undefined = undefined;
	let currentFilters: Record<string, any> = {};

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

	async function fetchTableData(
		sort?: SortConfig[] | null,
		filters?: Record<string, any>,
		page: number = 1
	) {
		loading = true;
		try {
			const response = await api('/admin/users/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters, page, pageSize })
			});

			if (!response.ok) {
				// The api helper already retried, so this is likely a persistent error.
				throw new Error(`Server responded with ${response.status}`);
			}

			const result = await response.json();

			users = result.users;
			totalItems = result.totalItems;
			allRoles = result.allRoles;
			currentPage = result.currentPage;
		} catch (err) {
			const error = err as Error;
			console.error('Error fetching table data:', error);
			toastError('Gagal memuat data pengguna. Silakan coba muat ulang halaman.');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchTableData(currentSort, currentFilters, currentPage);
	});

	async function handleSort(event: CustomEvent<SortConfig[] | null>) {
		currentSort = event.detail ?? undefined;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = { ...event.detail.columns, global: event.detail.global };
		await fetchTableData(currentSort, currentFilters, 1);
	}

	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleItemsPerPageChange(event: CustomEvent<number>) {
		pageSize = event.detail;
		await fetchTableData(currentSort, currentFilters, 1);
	}

	async function handleDeleteUser(userId: string, username: string) {
		if (userId === data.user?.id) {
			toastWarning('Anda tidak dapat menghapus akun Anda sendiri.');
			return;
		}
		if (
			confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)
		) {
			try {
				const response = await api(`/admin/users/${userId}/delete`, {
					method: 'POST'
				});

				if (response.ok) {
					toastSuccess(`Pengguna "${username}" berhasil dihapus.`);
					invalidateAll(); // Reload data
				} else {
					const result = await response.json().catch(() => ({ message: response.statusText }));
					throw new Error(result.message);
				}
			} catch (err) {
				const error = err as Error;
				toastError(`Gagal menghapus pengguna: ${error.message}`);
			}
		}
	}

	$: if (form?.success) {
		alert(form.message);
		invalidateAll();
	} else if (form?.message && !form?.success) {
		alert(form.message);
	}
</script>

<div class="mb-6 flex flex-wrap items-center justify-between space-y-2">
	<h1 class="card-title text-2xl">User Management</h1>
	<a href="/admin/users/new" class="btn btn-primary btn-sm"> Create New User </a>
</div>

{#key users}
	<SuperTable
		data={users}
		{columns}
		rowKey="id"
		itemsPerPageProp={pageSize}
		totalItemsProp={totalItems}
		isLoadingProp={loading}
		sort={currentSort}
		serverSide={true}
		on:sort={handleSort}
		on:filter={handleFilter}
		on:pageChange={handlePageChange}
		on:itemsPerPageChange={handleItemsPerPageChange}
		on:rowClick={(e) => goto(`/admin/users/${e.detail.id}/edit`)}
	>
		<svelte:fragment slot="loading-state">
			<div class="p-8 text-center">
				<span class="loading loading-spinner mb-4"></span>
				<p class="text-lg font-semibold">Memuat data...</p>
				<p class="text-sm text-base-content/70">Harap tunggu sebentar.</p>
			</div>
		</svelte:fragment>
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
