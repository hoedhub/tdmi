<script lang="ts">
	import { run, stopPropagation } from 'svelte/legacy';

	import { invalidateAll } from '$app/navigation';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { goto } from '$app/navigation';
	import { Pen, Trash } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';
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

	interface Props {
		data: ExtendedPageData;
		form: { success?: boolean; message?: string } | null;
	}

	let { data, form }: Props = $props();

	let users = $state(data.users);
	let allRoles = $state(data.allRoles);
	let totalItems = $state(data.totalItems);
	let loading = $state(true);
	let pageSize = $state(10);
	let currentPage = $state(1);
	let currentSort: SortConfig[] = $state([]);
	let currentFilters: FilterState = $state({ columns: {} });

	let columns: ColumnDef[] = $state([]);
	run(() => {
		if (allRoles.length > 0) {
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
	});

	async function fetchTableData(
		sort: SortConfig[] | undefined = currentSort,
		filters: FilterState = currentFilters,
		page: number = currentPage,
		limit: number = pageSize
	) {
		loading = true;
		try {
			const response = await api('/admin/users/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					sort, 
					filters,
					page, 
					pageSize: limit 
				})
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

	onMount(async () => {
		await tick();
		fetchTableData(currentSort, currentFilters, currentPage, pageSize);
	});

	async function handleSort(sort: SortConfig[] | null) {
		currentSort = sort ?? [];
		await fetchTableData(currentSort, currentFilters, currentPage, pageSize);
	}

	async function handleFilter(filters: FilterState) {
		currentFilters = filters;
		currentPage = 1;
		await fetchTableData(currentSort, currentFilters, 1);
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await fetchTableData(currentSort, currentFilters, currentPage);
	}

	async function handleItemsPerPageChange(newSize: number) {
		pageSize = newSize;
		currentPage = 1;
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

	run(() => {
		if (form?.success) {
			alert(form.message);
			invalidateAll();
		} else if (form?.message && !form?.success) {
			alert(form.message);
		}
	});
</script>

<div class="mb-6 flex flex-wrap items-center justify-between space-y-2">
	<h1 class="card-title text-2xl">User Management</h1>
	<a href="/admin/users/new" class="btn btn-primary btn-sm"> Create New User </a>
</div>

	<SuperTable
		data={users}
		{columns}
		rowKey="id"
		bind:itemsPerPageProp={pageSize}
		bind:currentPageProp={currentPage}
		totalItemsProp={totalItems}
		isLoadingProp={loading}
		bind:sort={currentSort}
		serverSide={true}
		bind:filterStateProp={currentFilters}
		onsort={handleSort}
		onfilter={handleFilter}
		onpageChange={handlePageChange}
		onitemsPerPageChange={handleItemsPerPageChange}
		onrowClick={(row) => goto(`/admin/users/${row.id}/edit`)}
	>
		{#snippet loadingState()}
			<div class="p-8 text-center">
				<span class="loading loading-spinner mb-4"></span>
				<p class="text-lg font-semibold">Memuat data...</p>
				<p class="text-sm text-base-content/70">Harap tunggu sebentar.</p>
			</div>
		{/snippet}
		
		{#snippet rowActions({ row })}
			<div class="flex gap-2">
				<a
					href={`/admin/users/${row.id}/edit`}
					class="btn btn-ghost btn-sm"
					onclick={stopPropagation(() => {})}
				>
					<Pen class="h-4 w-4" />
				</a>
				{#if row.id !== data.user?.id}
					<button
						class="btn btn-ghost btn-sm text-error"
						onclick={stopPropagation(() => handleDeleteUser(row.id, row.username))}
					>
						<Trash class="h-4 w-4" />
					</button>
				{:else}
					<button class="btn btn-disabled btn-sm"><Trash class="h-4 w-4" /></button>
				{/if}
			</div>
		{/snippet}
	</SuperTable>
